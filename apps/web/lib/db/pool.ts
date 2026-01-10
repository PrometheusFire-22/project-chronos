import postgres from 'postgres';
import { getCloudflareContext } from '@opennextjs/cloudflare';

// Mock the Pool type to match expected usage in analytics.ts
interface QueryResult {
    rows: any[];
}

interface DbClient {
    query(text: string, params?: any[]): Promise<QueryResult>;
}

// Lazy initialization state
let connectionPromise: Promise<postgres.Sql | null> | null = null;
let connectionError: Error | null = null;

/**
 * LAZY database connection getter - does NOT attempt connection until first query.
 * This prevents Worker crashes during initialization.
 */
export function getPool(): DbClient {
    console.log('📦 getPool() called - returning lazy client');
    return createLazyClient();
}

/**
 * Lazy client that defers connection until first actual query
 */
function createLazyClient(): DbClient {
    return {
        async query(text: string, params: any[] = []): Promise<QueryResult> {
            console.log('🔍 Lazy query called, will ensure connection...');

            const sql = await ensureConnection();

            if (!sql) {
                // Connection failed - throw detailed error
                const msg = connectionError?.message || 'Database connection not available';
                console.error('❌ Query failed - no connection:', msg);
                throw new Error(
                    `Database unavailable: ${msg}\n\n` +
                    `This could mean:\n` +
                    `1. Hyperdrive binding 'DB' is not configured in Cloudflare Pages\n` +
                    `2. DATABASE_URL environment variable is not set\n` +
                    `3. Database credentials are incorrect\n\n` +
                    `Check Cloudflare Pages Settings → Environment Variables and Bindings`
                );
            }

            try {
                console.log('🔄 Executing query:', text.substring(0, 100));
                const rows = await sql.unsafe(text, params);
                console.log('✅ Query successful, rows:', rows.length);
                return { rows };
            } catch (err) {
                console.error('❌ Query execution error:', err);
                throw err;
            }
        }
    };
}

/**
 * Ensures database connection is established (lazy initialization)
 */
async function ensureConnection(): Promise<postgres.Sql | null> {
    // If we already have a connection promise, wait for it
    if (connectionPromise) {
        console.log('⏳ Connection already in progress, waiting...');
        return await connectionPromise;
    }

    // Start new connection attempt
    console.log('🚀 Starting lazy database connection...');
    connectionPromise = attemptConnection();

    return await connectionPromise;
}

/**
 * Attempts to establish database connection with comprehensive error handling
 * and FAST timeout to prevent Worker timeouts
 */
async function attemptConnection(): Promise<postgres.Sql | null> {
    try {
        let connectionString: string | undefined;
        let source = 'unknown';

        // Try Cloudflare Hyperdrive binding first
        try {
            console.log('🔍 Attempting to get Cloudflare context...');
            const { env } = await getCloudflareContext({ async: true });
            console.log('📊 Cloudflare env available, checking for DB binding...');

            if (env?.DB?.connectionString) {
                connectionString = env.DB.connectionString;
                source = 'Hyperdrive binding (env.DB.connectionString)';
                console.log('✅ Found Hyperdrive binding!');
            } else {
                console.log('⚠️ Cloudflare env exists but no DB.connectionString');
                console.log('Available env keys:', Object.keys(env || {}).join(', '));
            }
        } catch (err) {
            console.log('⚠️ getCloudflareContext failed:', err instanceof Error ? err.message : String(err));
        }

        // Fallback to environment variables
        if (!connectionString && process.env.HYPERDRIVE_URL) {
            connectionString = process.env.HYPERDRIVE_URL;
            source = 'HYPERDRIVE_URL env var';
            console.log('✅ Using HYPERDRIVE_URL from env');
        }

        if (!connectionString && process.env.DATABASE_URL) {
            connectionString = process.env.DATABASE_URL;
            source = 'DATABASE_URL env var';
            console.log('✅ Using DATABASE_URL from env');
        }

        if (!connectionString) {
            const availableEnvKeys = Object.keys(process.env)
                .filter(k => !k.includes('KEY') && !k.includes('SECRET') && !k.includes('TOKEN'))
                .slice(0, 20); // Limit to prevent log spam

            const errorMsg = `No database connection string found.\nChecked: Hyperdrive binding (env.DB), HYPERDRIVE_URL, DATABASE_URL\nAvailable env vars: ${availableEnvKeys.join(', ')}`;
            console.error('❌', errorMsg);
            connectionError = new Error(errorMsg);
            return null;
        }

        console.log(`✅ Connection string found from: ${source}`);
        console.log(`🔌 Initializing postgres connection with 5-second timeout...`);
        console.log(`🔗 Connection details: Host=${new URL(connectionString.replace('postgresql://', 'http://')).hostname}`);

        const sql = postgres(connectionString, {
            ssl: { rejectUnauthorized: false },
            prepare: false,
            max: 1, // Minimal connections for Cloudflare Workers
            idle_timeout: 20,
            connect_timeout: 5, // 5 second timeout
            connection: {
                application_name: 'chronos-web-cloudflare'
            }
        });

        // Test the connection with timeout wrapper
        console.log('🧪 Testing connection with SELECT 1 (5s timeout)...');

        // Create a promise that times out after 5 seconds
        const timeoutPromise = new Promise<never>((_, reject) => {
            setTimeout(() => reject(new Error('Database connection test timed out after 5 seconds')), 5000);
        });

        // Race between connection test and timeout
        await Promise.race([
            sql`SELECT 1`,
            timeoutPromise
        ]);

        console.log('✨ Database connection test successful!');

        connectionError = null; // Clear any previous errors
        return sql;

    } catch (err) {
        const errorMsg = err instanceof Error ? err.message : String(err);
        console.error('❌ Database connection failed:', errorMsg);
        console.error('Full error:', err);

        connectionError = err instanceof Error ? err : new Error(errorMsg);
        connectionPromise = null; // Reset to allow retry
        return null;
    }
}
