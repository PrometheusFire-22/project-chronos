import postgres from 'postgres';

let sql: postgres.Sql | null = null;

/**
 * Gets or creates a database client using the 'postgres' package.
 * This driver is native to Edge runtimes (Cloudflare, Vercel) and 
 * provides higher stability for TCP connections via Hyperdrive.
 */
export async function getPool(): Promise<any> {
    if (sql) {
        return createPgWrapper(sql);
    }

    let connectionString = process.env.DATABASE_URL || process.env.DB;

    // Handle potential object-based bindings from Cloudflare
    if (connectionString && typeof connectionString !== 'string') {
        connectionString = (connectionString as any).connectionString || String(connectionString);
    }

    if (!connectionString) {
        throw new Error('❌ No database connection string found in DATABASE_URL or DB.');
    }

    sql = postgres(connectionString, {
        ssl: 'require',
        max: 5,
        idle_timeout: 20,
        connect_timeout: 30,
    });

    return createPgWrapper(sql);
}

/**
 * Creates a shim that mimics the 'pg' Pool interface for 
 * compatibility with existing analytics library code.
 */
function createPgWrapper(sqlClient: postgres.Sql) {
    return {
        query: async (queryText: string, params: any[] = []) => {
            try {
                // postgres.js handles parameterized queries via unsafe or template tags
                const rows = await sqlClient.unsafe(queryText, params);
                return { rows };
            } catch (error) {
                console.error('Database query error:', error);
                throw error;
            }
        },
        end: async () => {
            if (sql) {
                await sql.end();
            }
        }
    };
}
