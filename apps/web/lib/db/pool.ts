import { Pool } from 'pg';

let pool: Pool | null = null;

/**
 * Gets or creates a database connection pool using standard 'pg'.
 * This works with Cloudflare Hyperdrive in the Node.js runtime (not Edge).
 */
export async function getPool(): Promise<Pool> {
    if (pool) return pool;

    let connectionString = process.env.DATABASE_URL || process.env.DB;

    // Handle potential object-based bindings from Cloudflare (Hyperdrive)
    if (connectionString && typeof connectionString !== 'string') {
        connectionString = (connectionString as any).connectionString || String(connectionString);
    }

    if (!connectionString) {
        throw new Error('❌ No database connection string found in DATABASE_URL or DB.');
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
