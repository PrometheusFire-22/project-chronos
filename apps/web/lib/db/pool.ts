import { Pool, neonConfig } from '@neondatabase/serverless';

// Essential for Edge environments where TCP is restricted or requires WebSockets
if (typeof window === 'undefined') {
    // This allows the driver to use the Edge environment's fetch/websocket capabilities
}

let pool: Pool | null = null;

/**
 * Gets or creates a database connection pool.
 * Uses @neondatabase/serverless for Edge compatibility.
 */
export async function getPool(): Promise<Pool> {
    if (pool) return pool;

    // Use connection string if provided (standard for Hyperdrive/Cloudflare)
    let connectionString = process.env.DATABASE_URL || process.env.DB;

    // Handle potential object-based bindings from Cloudflare (if not mapped to string)
    if (connectionString && typeof connectionString !== 'string') {
        console.warn('⚠️ DB binding is not a string. Attempting to extract connection string...');
        connectionString = (connectionString as any).connectionString || String(connectionString);
    }

    if (!connectionString && !process.env.DATABASE_HOST) {
        console.error('❌ No database connection string found in DATABASE_URL or DB.');
    }

    pool = connectionString
        ? new Pool({
            connectionString,
            ssl: {
                rejectUnauthorized: false
            }
        })
        : new Pool({
            host: process.env.DATABASE_HOST,
            port: parseInt(process.env.DATABASE_PORT || '5432'),
            database: process.env.DATABASE_NAME,
            user: process.env.DATABASE_USER,
            password: process.env.DATABASE_PASSWORD,
            ssl: {
                rejectUnauthorized: false
            }
        });

    return pool;
}
