import { Pool } from 'pg';

let pool: Pool | null = null;

/**
 * Gets or creates a database connection pool using standard 'pg'.
 * This works with Cloudflare Hyperdrive in the Node.js runtime.
 */
export async function getPool(): Promise<Pool> {
    if (pool) return pool;

    let connectionString: string | undefined;

    // 1. Try Cloudflare binding (Pages Functions injection)
    // @ts-ignore
    const cfBinding = globalThis.DB || process.env.DB;
    if (cfBinding && typeof cfBinding === 'object' && cfBinding.connectionString) {
        connectionString = cfBinding.connectionString;
        console.log('✅ Found Hyperdrive connection string in binding');
    }
    // 2. Fallback to direct environment variables
    else if (process.env.DATABASE_URL) {
        connectionString = process.env.DATABASE_URL;
        console.log('✅ Using DATABASE_URL from environment');
    }
    // 3. Last resort check process.env.DB as string
    else if (typeof process.env.DB === 'string') {
        connectionString = process.env.DB;
        console.log('✅ Using DB string from environment');
    }

    if (!connectionString) {
        // Log environment keys to help debug missing bindings
        const envKeys = Object.keys(process.env).filter(k => !k.includes('KEY') && !k.includes('SECRET'));
        throw new Error(`❌ No database connection found. Available env: ${envKeys.join(', ')}`);
    }

    // Security check: Ensure we aren't using a Neon WebSocket URL if we want TCP
    // If it contains 'wshub', it will force WebSocket, which Hyperdrive doesn't support.
    if (connectionString.includes('wshub')) {
        console.warn('⚠️ Warning: Connection string contains wshub, which may force WebSockets.');
    }

    pool = new Pool({
        connectionString,
        ssl: { rejectUnauthorized: false },
        max: 10,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 10000, // Increased for stability
    });

    // Simple connection test
    try {
        const client = await pool.connect();
        client.release();
        console.log('✨ Database connection test successful');
    } catch (err) {
        console.error('❌ Database connection test failed:', err);
        // Don't rethrow here, let the actual query handle it
    }

    return pool;
}
