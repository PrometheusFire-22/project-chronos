import postgres from 'postgres';

let sql: postgres.Sql | null = null;

// Mock the Pool type to match expected usage in analytics.ts
interface QueryResult {
    rows: any[];
}

interface DbClient {
    query(text: string, params?: any[]): Promise<QueryResult>;
}

/**
 * Gets or creates a database connection using 'postgres.js' (lightweight driver).
 * This replaces 'pg' to significantly reduce the Cloudflare worker bundle size.
 */
export async function getPool(): Promise<DbClient> {
    if (sql) return createWrapper(sql);

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
        const envKeys = Object.keys(process.env).filter(k => !k.includes('KEY') && !k.includes('SECRET'));
        throw new Error(`❌ No database connection found. Available env: ${envKeys.join(', ')}`);
    }

    if (connectionString.includes('wshub')) {
        console.warn('⚠️ Warning: Connection string contains wshub, which may force WebSockets.');
    }

    // Initialize the singleton connection
    sql = postgres(connectionString, {
        ssl: { rejectUnauthorized: false }, // Necessary for many cloud DBs
        prepare: false, // Hyperdrive often works better with simple query mode
        max: 10,
        idle_timeout: 30,
        connect_timeout: 10,
    });

    // Simple connection test
    try {
        await sql`SELECT 1`;
        console.log('✨ Database connection test successful');
    } catch (err) {
        console.error('❌ Database connection test failed:', err);
    }

    return createWrapper(sql);
}

function createWrapper(sqlClient: postgres.Sql): DbClient {
    return {
        async query(text: string, params: any[] = []): Promise<QueryResult> {
            // Use .unsafe() to allow $1, $2 syntax which plain template tags don't support
            // postgres.js handles value matching for protocol-level params in unsafe mode
            const rows = await sqlClient.unsafe(text, params);
            return { rows };
        }
    };
}
