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
            try {
                if (!sql) {
                    console.log('Creating database connection...');
                    sql = await createConnection();
                    console.log('Database connection created successfully');
                }

                console.log('Executing query:', text.substring(0, 100));
                const rows = await sql.unsafe(text, params);
                console.log('Query executed successfully, rows:', rows.length);
                return { rows };
            } catch (error) {
                console.error('Database query error:', error);
                throw error;
            }
        }
    };
}

/**
 * Creates database connection using Cloudflare Hyperdrive binding
 */
async function createConnection(): Promise<postgres.Sql> {
    try {
        console.log('Getting Cloudflare context...');
        const { env } = await getCloudflareContext({ async: true });
        console.log('Cloudflare context retrieved');

        if (!env?.DB?.connectionString) {
            console.error('Hyperdrive binding not found. Available bindings:', Object.keys(env || {}));
            throw new Error(
                'Hyperdrive binding "DB" not found. ' +
                'Please configure it in Cloudflare Pages Settings → Bindings'
            );
        }

        console.log('Creating postgres connection with Hyperdrive...');
        const connection = postgres(env.DB.connectionString, {
            ssl: { rejectUnauthorized: false },
            prepare: false,
            max: 1, // Cloudflare Workers use single connection
            idle_timeout: 20,
            connect_timeout: 10,
            connection: {
                application_name: 'chronos-web'
            }
        });

        console.log('Testing connection...');
        await connection`SELECT 1`;
        console.log('Connection test successful');

        return connection;
    } catch (error) {
        console.error('Failed to create database connection:', error);
        throw error;
    }
}
