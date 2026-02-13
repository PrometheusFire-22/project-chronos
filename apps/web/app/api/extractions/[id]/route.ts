import { NextResponse } from 'next/server'
import { Pool } from 'pg'
import { getAuth } from '@/lib/auth'

export const runtime = 'nodejs'

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

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  let pool: Pool | undefined

  try {
    const auth = await getAuth()
    const session = await auth.api.getSession({ headers: request.headers })
    const userId = session?.user?.id

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    const { connectionString, isHyperdrive } = await getConnectionConfig()
    pool = new Pool({
      connectionString,
      ssl: isHyperdrive ? undefined : { rejectUnauthorized: false },
      max: 1,
      connectionTimeoutMillis: 5000,
    })

    const { rows } = await pool.query(
      `SELECT id, user_id, file_name, r2_key, contacts, document_metadata, contact_count, created_at
       FROM ingestion.extractions
       WHERE id = $1`,
      [id]
    )

    if (rows.length === 0) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }

    const row = rows[0]

    if (row.user_id !== userId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    return NextResponse.json({
      id: row.id,
      fileName: row.file_name,
      r2Key: row.r2_key,
      contacts: row.contacts,
      document_metadata: row.document_metadata,
      contactCount: row.contact_count,
      createdAt: row.created_at,
    })
  } catch (error) {
    console.error('[Extractions] Detail error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  } finally {
    if (pool) {
      await pool.end()
    }
  }
}
