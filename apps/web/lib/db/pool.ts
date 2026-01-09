import pg from 'pg';
import type { Pool as PgPoolType } from 'pg';
const { Pool } = pg;

let pool: PgPoolType | null = null;

/**
 * Gets or creates a database connection pool.
 * Uses standard pg library with nodejs_compat for Edge TCP support.
 */
export async function getPool(): Promise<PgPoolType> {
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

    // In Cloudflare Workers with Hyperdrive, we connect via TCP.
    // Standard pg.Pool works because of nodejs_compat.
    pool = connectionString
        ? new Pool({
            connectionString,
            ssl: {
                rejectUnauthorized: false
            },
            // Reduce pool size for edge environment
            max: 5,
        }) as unknown as PgPoolType
        : new Pool({
            host: process.env.DATABASE_HOST,
            port: parseInt(process.env.DATABASE_PORT || '5432'),
            database: process.env.DATABASE_NAME,
            user: process.env.DATABASE_USER,
            password: process.env.DATABASE_PASSWORD,
            ssl: {
                rejectUnauthorized: false
            },
            max: 5,
        }) as unknown as PgPoolType;

    return pool;
}
