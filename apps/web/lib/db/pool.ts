import pg from 'pg';
import { CloudflareSocket } from 'pg-cloudflare';
const { Pool } = pg;

let pool: Pool | null = null;

/**
 * Gets or creates a database connection pool using standard 'pg' with the 
 * Cloudflare pg-adapter (pg-cloudflare).
 * This is the official, non-hacky approach to ensure stable TCP connections 
 * on Cloudflare Hyperdrive.
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
        // The Cloudflare pg-adapter bridge:
        // This explicitly tells 'pg' to use Cloudflare's native TCP sockets.
        stream: (args: any) => new CloudflareSocket(args),
        ssl: { rejectUnauthorized: false },
        max: 10,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 5000,
    });

    return pool;
}
