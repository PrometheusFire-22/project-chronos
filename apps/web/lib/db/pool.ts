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
 *
 * Connection string priority:
 * 1. HYPERDRIVE_URL (set in Cloudflare Pages for Hyperdrive connection)
 * 2. DATABASE_URL (fallback for local development)
 */
export async function getPool(): Promise<DbClient> {
    if (sql) return createWrapper(sql);

    let connectionString: string | undefined;

    // Try HYPERDRIVE_URL first (set in Cloudflare Pages environment variables)
    // Then fall back to DATABASE_URL for local development
    connectionString = process.env.HYPERDRIVE_URL || process.env.DATABASE_URL;

    if (connectionString) {
        const source = process.env.HYPERDRIVE_URL ? 'HYPERDRIVE_URL (Cloudflare)' : 'DATABASE_URL (local dev)';
        console.log(`✅ Using database connection from ${source}`);
    } else {
        const availableEnvKeys = Object.keys(process.env).filter(k =>
            !k.includes('KEY') && !k.includes('SECRET') && !k.includes('TOKEN')
        );
        console.warn(`❌ No database connection found. Available env keys: ${availableEnvKeys.join(', ')}`);
        console.warn("⚠️ No connection string found, returning mock client to prevent crash.");
        return createMockThrowingClient();
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

function createMockThrowingClient(): DbClient {
    return {
        async query() {
            throw new Error("❌ Database not connected: No connection string found during initialization.");
        }
    };
}
