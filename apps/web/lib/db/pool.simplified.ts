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
 * Singleton postgres connection
 */
let sql: postgres.Sql | null = null;

/**
 * Gets the database connection pool.
 * Creates the connection on first call using Hyperdrive binding.
 */
export function getPool(): DbClient {
    return {
        async query(text: string, params: any[] = []): Promise<QueryResult> {
            if (!sql) {
                sql = await createConnection();
            }

            const rows = await sql.unsafe(text, params);
            return { rows };
        }
    };
}

/**
 * Creates database connection using Cloudflare Hyperdrive binding
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
        max: 1, // Cloudflare Workers use single connection
        idle_timeout: 20,
        connect_timeout: 10,
        connection: {
            application_name: 'chronos-web'
        }
    });
}
