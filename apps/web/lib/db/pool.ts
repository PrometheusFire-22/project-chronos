import { Pool } from '@neondatabase/serverless';

let pool: Pool | null = null;

/**
 * Gets or creates a database connection pool.
 * Uses @neondatabase/serverless for Edge compatibility.
 */
export async function getPool(): Promise<Pool> {
    if (pool) return pool;

    const PgPool = Pool;

    // Use connection string if provided (standard for Hyperdrive/Cloudflare)
    const connectionString = process.env.DATABASE_URL || process.env.DB;

    pool = connectionString
        ? new PgPool({
            connectionString,
            ssl: {
                rejectUnauthorized: false
            }
        })
        : new PgPool({
            host: process.env.DATABASE_HOST,
            port: parseInt(process.env.DATABASE_PORT || '5432'),
            database: process.env.DATABASE_NAME,
            user: process.env.DATABASE_USER,
            password: process.env.DATABASE_PASSWORD,
            ssl: {
                rejectUnauthorized: false
            }
        });

    // Suppress noisy logs during build if we don't have a DB connection
    if (process.env.NODE_ENV !== 'production' && !connectionString && !process.env.DATABASE_HOST) {
        console.warn('⚠️ No database connection configured. Analytics will be unavailable.');
    }

    return pool;
}
