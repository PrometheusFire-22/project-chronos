import { Pool, neonConfig } from '@neondatabase/serverless';

// Configure Neon to use direct TCP connections via Cloudflare Sockets
// This ensures compatibility with Hyperdrive and nodejs_compat.
(neonConfig as any).useWshub = false;

let pool: Pool | null = null;

/**
 * Gets or creates a database connection pool using @neondatabase/serverless.
 * This is the standard, Edge-compatible driver for Cloudflare.
 */
export async function getPool(): Promise<Pool> {
    if (pool) return pool;

    let connectionString = process.env.DATABASE_URL || process.env.DB;

    // Handle potential object-based bindings from Cloudflare
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
