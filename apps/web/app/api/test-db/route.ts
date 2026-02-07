
import { NextResponse } from 'next/server';
import postgres from 'postgres';

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
  try {
    const { connectionString, isHyperdrive } = await getConnectionConfig();
    console.log("[TestDB] Connecting to:", connectionString.replace(/:[^:@]+@/, ':***@'));

    const sql = postgres(connectionString, {
      // Only enable SSL for direct connections (Hyperdrive proxies handle SSL)
      ssl: isHyperdrive ? false : { rejectUnauthorized: false },
      max: 1,
      fetch_types: false,
      prepare: true,
    });

    const result = await sql`SELECT 1 as connected, current_database() as db_name, version() as version`;

    await sql.end();

    return NextResponse.json({
      success: true,
      data: result[0],
      env: process.env.NODE_ENV,
      runtime: process.env.NEXT_RUNTIME
    });
  } catch (error: any) {
    console.error("[TestDB] Error:", error);
    return NextResponse.json({
      success: false,
      error: error.message,
      stack: error.stack,
      name: error.name
    }, { status: 500 });
  }
}
