import { Pool, neonConfig } from '@neondatabase/serverless';

// Configure for Cloudflare Workers Error 530 fix:
// Disable the WebSocket-to-TCP proxy (wshub) and use native Cloudflare Sockets
// This is essential when connecting to non-Neon databases or via Hyperdrive.
if (typeof window === 'undefined') {
    (neonConfig as any).wsProxy = false;
    // Also use direct connect for pool
    (neonConfig as any).useWshub = false;
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
