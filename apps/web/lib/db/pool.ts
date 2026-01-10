import postgres from 'postgres';
import { getCloudflareContext } from '@opennextjs/cloudflare';

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
 * 1. Cloudflare Hyperdrive binding (env.DB.connectionString) in production
 * 2. DATABASE_URL environment variable for local development
 */
export async function getPool(): Promise<DbClient> {
    if (sql) return createWrapper(sql);

    let connectionString: string | undefined;
    let source = 'unknown';

    try {
        // Try to get Cloudflare Hyperdrive binding (production/Cloudflare Pages)
        const { env } = await getCloudflareContext({ async: true });
        if (env?.DB?.connectionString) {
            connectionString = env.DB.connectionString;
            source = 'Hyperdrive binding (env.DB.connectionString)';
        }
    } catch (err) {
        // getCloudflareContext might not be available in all contexts
        console.log('⚠️ getCloudflareContext not available:', err instanceof Error ? err.message : String(err));
    }

    // Fallback to environment variables
    if (!connectionString && process.env.HYPERDRIVE_URL) {
        connectionString = process.env.HYPERDRIVE_URL;
        source = 'HYPERDRIVE_URL env var';
    }

    if (!connectionString && process.env.DATABASE_URL) {
        connectionString = process.env.DATABASE_URL;
        source = 'DATABASE_URL env var (local dev)';
    }

    if (!connectionString) {
        const availableEnvKeys = Object.keys(process.env).filter(k =>
            !k.includes('KEY') && !k.includes('SECRET') && !k.includes('TOKEN')
        );
        console.error(`❌ No database connection found. Available env keys: ${availableEnvKeys.join(', ')}`);
        console.error("⚠️ Returning mock client to prevent crash.");
        return createMockThrowingClient();
    }

    console.log(`✅ Using database connection from: ${source}`);

    // Initialize the singleton connection with full error handling
    try {
        sql = postgres(connectionString, {
            ssl: { rejectUnauthorized: false }, // Necessary for many cloud DBs
            prepare: false, // Hyperdrive often works better with simple query mode
            max: 10,
            idle_timeout: 30,
            connect_timeout: 10,
        });

        // Simple connection test
        await sql`SELECT 1`;
        console.log('✨ Database connection test successful');
        return createWrapper(sql);
    } catch (err) {
        console.error('❌ Database initialization failed:', err instanceof Error ? err.message : String(err));
        console.error('⚠️ Full error:', err);
        sql = null; // Reset to allow retry
        return createMockThrowingClient();
    }
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
            throw new Error(
                "❌ Database not connected: Check Cloudflare Pages logs for initialization errors. " +
                "Ensure DATABASE_URL environment variable is set or Hyperdrive binding 'DB' is configured."
            );
        }
    };
}
