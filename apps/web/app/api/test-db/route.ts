
import { NextResponse } from 'next/server';
import { Pool } from 'pg';

export const runtime = 'nodejs';

async function getConnectionConfig(): Promise<{ connectionString: string; isHyperdrive: boolean }> {
  // Try Cloudflare Hyperdrive binding first (production)
  try {
    const { getCloudflareContext } = await import("@opennextjs/cloudflare");
    const ctx = getCloudflareContext();
    if (ctx?.env?.DB?.connectionString) {
      console.log("[TestDB] Using Hyperdrive connection");
      return {
        connectionString: ctx.env.DB.connectionString,
        isHyperdrive: true
      };
    }
  } catch (e) {
    console.log("[TestDB] getCloudflareContext not available:", e);
  }

  // Fall back to environment variable (local dev)
  if (process.env.DATABASE_URL) {
    console.log("[TestDB] Using DATABASE_URL");
    return {
      connectionString: process.env.DATABASE_URL,
      isHyperdrive: false
    };
  }

  throw new Error("No database connection available");
}

export async function GET() {
  let pool: Pool | undefined;
  try {
    const { connectionString, isHyperdrive } = await getConnectionConfig();
    // Mask password in logs
    console.log("[TestDB] Connecting to:", connectionString.replace(/:[^:@]+@/, ':***@'));

    pool = new Pool({
      connectionString,
      // Only enable SSL for direct connections (Hyperdrive proxies handle SSL)
      ssl: isHyperdrive ? undefined : { rejectUnauthorized: false },
      max: 1,
      connectionTimeoutMillis: 5000,
    });

    const client = await pool.connect();
    try {
      const result = await client.query('SELECT 1 as connected, current_database() as db_name, version() as version');
      return NextResponse.json({
        success: true,
        data: result.rows[0],
        env: process.env.NODE_ENV,
        runtime: process.env.NEXT_RUNTIME,
        driver: 'pg'
      });
    } finally {
      client.release();
    }
  } catch (error: any) {
    console.error("[TestDB] Error:", error);
    return NextResponse.json({
      success: false,
      error: error.message,
      stack: error.stack,
      name: error.name
    }, { status: 500 });
  } finally {
    if (pool) await pool.end();
  }
}
