import { NextResponse } from 'next/server'
import { Pool } from 'pg'
import { drizzle } from 'drizzle-orm/node-postgres'
import { eq, sql } from 'drizzle-orm'
import { getAuth } from '@/lib/auth'
import { text, timestamp, integer, json, pgSchema, uuid, uniqueIndex } from 'drizzle-orm/pg-core'

export const runtime = 'nodejs'

const BACKEND_URL = process.env.INGESTION_WORKER_URL || 'http://localhost:8000'

// Inline user_usage schema for Worker bundling compatibility
const authSchema = pgSchema('auth')
const userUsage = authSchema.table('user_usage', {
  id: uuid('id').defaultRandom().primaryKey().notNull(),
  userId: text('user_id').notNull(),
  pdfUploadCount: integer('pdf_upload_count').default(0),
  pdfUploadLimit: integer('pdf_upload_limit').default(3),
  totalPageCount: integer('total_page_count').default(0),
  maxPagesPerDoc: integer('max_pages_per_doc').default(50),
  totalPageLimit: integer('total_page_limit').default(120),
  queryCount: integer('query_count').default(0),
  queryLimit: integer('query_limit').default(5),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  uniqueUserUsage: uniqueIndex('unique_user_usage').on(table.userId),
}))

// Inline extractions schema (ingestion.extractions)
const ingestionSchema = pgSchema('ingestion')
const extractions = ingestionSchema.table('extractions', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: text('user_id'),
  fileName: text('file_name').notNull(),
  r2Key: text('r2_key'),
  contacts: json('contacts').notNull().default([]),
  documentMetadata: json('document_metadata').default({}),
  contactCount: integer('contact_count').notNull().default(0),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
})

// --- Cloudflare bindings helpers ---

async function getDocumentsBucket(): Promise<any> {
  try {
    const { getCloudflareContext } = await import('@opennextjs/cloudflare')
    const ctx = getCloudflareContext()
    if (ctx?.env?.DOCUMENTS) {
      return ctx.env.DOCUMENTS
    }
  } catch {
    // Not in Cloudflare context (local dev)
  }
  return null
}

async function getConnectionConfig(): Promise<{ connectionString: string; isHyperdrive: boolean }> {
  try {
    const { getCloudflareContext } = await import('@opennextjs/cloudflare')
    const ctx = getCloudflareContext()
    if (ctx?.env?.DB?.connectionString) {
      return { connectionString: ctx.env.DB.connectionString, isHyperdrive: true }
    }
  } catch {
    // Not in Cloudflare Workers environment
  }

  const envUrl = process.env.DATABASE_URL
  if (envUrl) {
    return { connectionString: envUrl, isHyperdrive: false }
  }

  throw new Error('No database connection available')
}

// --- Constants ---

const MAX_FILE_SIZE = 50 * 1024 * 1024 // 50MB
const UNAUTH_COOKIE = 'chronos_free_extract'
const FREE_UNAUTH_LIMIT = 1

// --- Route handler ---

export async function POST(request: Request) {
  let pool: Pool | undefined

  try {
    // 1. Parse and validate file
    const formData = await request.formData()
    const file = formData.get('file') as File | null

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    if (!file.name.toLowerCase().endsWith('.pdf')) {
      return NextResponse.json(
        { error: 'Only PDF files are supported' },
        { status: 415 }
      )
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: 'File too large (max 50MB)' },
        { status: 413 }
      )
    }

    // 2. Check auth and usage limits
    const auth = await getAuth()
    const session = await auth.api.getSession({ headers: request.headers })
    const userId = session?.user?.id ?? null

    if (userId) {
      // Authenticated user: check usage limits
      const { connectionString, isHyperdrive } = await getConnectionConfig()
      pool = new Pool({
        connectionString,
        ssl: isHyperdrive ? undefined : { rejectUnauthorized: false },
        max: 1,
        connectionTimeoutMillis: 5000,
      })
      const db = drizzle(pool)

      // Ensure user_usage row exists (upsert)
      await db
        .insert(userUsage)
        .values({ userId })
        .onConflictDoNothing()

      const rows = await db
        .select()
        .from(userUsage)
        .where(eq(userUsage.userId, userId))
        .limit(1)

      const usage = rows[0]
      if (usage && usage.pdfUploadCount !== null && usage.pdfUploadLimit !== null) {
        if (usage.pdfUploadCount >= usage.pdfUploadLimit) {
          return NextResponse.json(
            {
              error: 'limit_reached',
              message: `You've used all ${usage.pdfUploadLimit} extractions this month.`,
              upgrade_url: '/settings/billing',
            },
            { status: 429 }
          )
        }
      }
    } else {
      // Unauthenticated user: check cookie-based limit
      const cookieHeader = request.headers.get('cookie') || ''
      const cookies = Object.fromEntries(
        cookieHeader.split(';').map(c => {
          const [k, ...v] = c.trim().split('=')
          return [k, v.join('=')]
        })
      )
      const usedCount = parseInt(cookies[UNAUTH_COOKIE] || '0', 10)

      if (usedCount >= FREE_UNAUTH_LIMIT) {
        return NextResponse.json(
          {
            error: 'limit_reached',
            message: 'Sign up for a free account to get 3 extractions per month.',
            upgrade_url: '/sign-up',
          },
          { status: 429 }
        )
      }
    }

    // 3. Upload PDF to R2 (if available and authenticated)
    let r2Key: string | null = null
    if (userId) {
      const bucket = await getDocumentsBucket()
      if (bucket) {
        const timestamp = Date.now()
        const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_')
        r2Key = `uploads/${userId}/${timestamp}_${safeName}`

        const arrayBuffer = await file.arrayBuffer()
        await bucket.put(r2Key, arrayBuffer, {
          httpMetadata: {
            contentType: 'application/pdf',
          },
          customMetadata: {
            userId,
            originalName: file.name,
            uploadedAt: new Date().toISOString(),
          },
        })
        console.log(`[Documents] Uploaded to R2: ${r2Key}`)
      }
    }

    // 4. Proxy to Python backend for extraction
    const backendForm = new FormData()
    backendForm.append('file', file)

    let result
    try {
      const response = await fetch(`${BACKEND_URL}/api/extract-contacts`, {
        method: 'POST',
        body: backendForm,
      })

      if (!response.ok) {
        const error = await response.text()
        return NextResponse.json(
          { error: 'Processing failed', details: error },
          { status: response.status }
        )
      }

      result = await response.json()
    } catch {
      return NextResponse.json(
        { error: 'Backend unavailable. Please try again.' },
        { status: 504 }
      )
    }

    // 5. Persist extraction + increment usage
    // Ensure pool exists (may not if anon user — create one now)
    if (!pool) {
      const { connectionString, isHyperdrive } = await getConnectionConfig()
      pool = new Pool({
        connectionString,
        ssl: isHyperdrive ? undefined : { rejectUnauthorized: false },
        max: 1,
        connectionTimeoutMillis: 5000,
      })
    }

    const db = drizzle(pool)

    // Store extraction result (all users, including anon)
    const contactsList = result.contacts || []
    await db.insert(extractions).values({
      userId,
      fileName: file.name,
      r2Key,
      contacts: contactsList,
      documentMetadata: result.document_metadata || {},
      contactCount: contactsList.length,
    })
    console.log(`[Documents] Extraction persisted: ${contactsList.length} contacts, user=${userId || 'anon'}`)

    // Increment usage counters (auth'd users only)
    if (userId) {
      await db
        .update(userUsage)
        .set({
          pdfUploadCount: sql`${userUsage.pdfUploadCount} + 1`,
          updatedAt: new Date(),
        })
        .where(eq(userUsage.userId, userId))
    }

    // 6. Build response
    const response = NextResponse.json({
      ...result,
      ...(r2Key && { r2_key: r2Key }),
    })

    // Set cookie for unauthenticated users
    if (!userId) {
      const cookieHeader = request.headers.get('cookie') || ''
      const cookies = Object.fromEntries(
        cookieHeader.split(';').map(c => {
          const [k, ...v] = c.trim().split('=')
          return [k, v.join('=')]
        })
      )
      const currentCount = parseInt(cookies[UNAUTH_COOKIE] || '0', 10)
      response.cookies.set(UNAUTH_COOKIE, String(currentCount + 1), {
        httpOnly: true,
        secure: true,
        sameSite: 'lax',
        maxAge: 30 * 24 * 60 * 60, // 30 days
        path: '/',
      })
    }

    return response
  } catch (error) {
    console.error('[Documents] Upload error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  } finally {
    if (pool) {
      await pool.end()
    }
  }
}
