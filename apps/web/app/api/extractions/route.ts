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

export async function GET(request: Request) {
  let pool: Pool | undefined

  try {
    const auth = await getAuth()
    const session = await auth.api.getSession({ headers: request.headers })
    const userId = session?.user?.id

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { connectionString, isHyperdrive } = await getConnectionConfig()
    pool = new Pool({
      connectionString,
      ssl: isHyperdrive ? undefined : { rejectUnauthorized: false },
      max: 1,
      connectionTimeoutMillis: 5000,
    })

    const { rows } = await pool.query(
      `SELECT id, file_name, contact_count, document_metadata, created_at
       FROM ingestion.extractions
       WHERE user_id = $1
       ORDER BY created_at DESC
       LIMIT 50`,
      [userId]
    )

    const extractions = rows.map((row) => ({
      id: row.id,
      fileName: row.file_name,
      contactCount: row.contact_count,
      caseName: row.document_metadata?.case_name || null,
      createdAt: row.created_at,
    }))

    return NextResponse.json({ extractions })
  } catch (error) {
    console.error('[Extractions] List error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  } finally {
    if (pool) {
      await pool.end()
    }
  }
}
