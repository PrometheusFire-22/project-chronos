import { Pool } from 'pg';

let pool: Pool | null = null;

/**
 * Gets or creates a database connection pool using standard 'pg'.
 * This works with Cloudflare Hyperdrive in the Node.js runtime.
 * 
 * In Cloudflare Pages Functions, bindings are available via the platform context,
 * not process.env. We need to check both locations.
 */
export async function getPool(): Promise<Pool> {
    if (pool) return pool;

    // Try to get connection string from various sources
    let connectionString: string | undefined;

    // First, try the Cloudflare binding (available in runtime context)
    // @ts-ignore - Cloudflare injects this at runtime
    if (typeof globalThis.DB !== 'undefined' && globalThis.DB?.connectionString) {
        // @ts-ignore
        connectionString = globalThis.DB.connectionString;
    }
    // Fallback to environment variables
    else if (process.env.DATABASE_URL) {
        connectionString = process.env.DATABASE_URL;
    }
    // Handle Hyperdrive binding passed as env (object)
    else if (process.env.DB) {
        const dbEnv = process.env.DB;
        if (typeof dbEnv === 'string') {
            connectionString = dbEnv;
        } else if (typeof dbEnv === 'object' && (dbEnv as any).connectionString) {
            connectionString = (dbEnv as any).connectionString;
        }
    }

    if (!connectionString) {
        throw new Error('❌ No database connection string found. Check Hyperdrive binding configuration.');
    }

    pool = new Pool({
        connectionString,
        ssl: { rejectUnauthorized: false },
        max: 10,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 5000,
    });

    return pool;
}
