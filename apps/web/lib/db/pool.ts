import postgres from 'postgres';
import { getCloudflareContext } from '@opennextjs/cloudflare';

/**
 * Simple database pool interface for compatibility with existing code
 */
interface QueryResult {
    rows: any[];
}

interface DbClient {
    query(text: string, params?: any[]): Promise<QueryResult>;
}

/**
 * Gets the database connection pool.
 * Creates a new connection for each request (required by Cloudflare Workers).
 */
export function getPool(): DbClient {
    return {
        async query(text: string, params: any[] = []): Promise<QueryResult> {
            // Create a new connection for each request (required by Cloudflare Workers)
            const sql = await createConnection();

            try {
                const rows = await sql.unsafe(text, params);
                return { rows };
            } finally {
                // Always close the connection after the query
                await sql.end();
            }
        }
    };
}

/**
 * Creates database connection using Cloudflare Hyperdrive binding.
 * Must create a new connection per request - no singletons/globals allowed.
 */
async function createConnection(): Promise<postgres.Sql> {
    const { env } = await getCloudflareContext({ async: true });

    if (!env?.DB?.connectionString) {
        throw new Error(
            'Hyperdrive binding "DB" not found. ' +
            'Please configure it in Cloudflare Pages Settings → Bindings'
        );
    }

    return postgres(env.DB.connectionString, {
        ssl: { rejectUnauthorized: false },
        prepare: false,
        max: 1,
        idle_timeout: 20,
        connect_timeout: 10,
        connection: {
            application_name: 'chronos-web'
        }
    });
}
