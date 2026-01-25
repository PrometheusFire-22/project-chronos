import { Pool } from 'pg';
import { getCloudflareContext } from '@opennextjs/cloudflare';
import { cache } from 'react';

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
 * Gets the database connection pool for SSR/SSG pages.
 * Uses React cache to create one pool per request (required by Cloudflare Workers).
 */
export const getPool = cache((): DbClient => {
    const { env } = getCloudflareContext();

    if (!env.DB) {
        throw new Error(
            'Hyperdrive binding "DB" not found. ' +
            'Please configure it in Cloudflare Pages Settings → Bindings'
        );
    }

    const connectionString = env.DB.connectionString;

    if (!connectionString) {
        throw new Error(
            'Hyperdrive connectionString is missing from binding "DB"'
        );
    }

    const pool = new Pool({
        connectionString,
        maxUses: 1, // Required for Cloudflare Workers - prevents connection reuse
        max: 1,
        ssl: { rejectUnauthorized: false } // Required for Hyperdrive/AWS tunnel connections
    });

    return {
        async query(text: string, params: any[] = []): Promise<QueryResult> {
            const result = await pool.query(text, params);
            return { rows: result.rows };
        }
    };
});

/**
 * Gets the database connection pool for ISR/dynamic pages.
 * Uses async context retrieval for pages that need it.
 */
export const getPoolAsync = cache(async (): Promise<DbClient> => {
    const { env } = await getCloudflareContext({ async: true });

    if (!env.DB) {
        throw new Error(
            'Hyperdrive binding "DB" not found. ' +
            'Please configure it in Cloudflare Pages Settings → Bindings'
        );
    }

    const connectionString = env.DB.connectionString;

    if (!connectionString) {
        throw new Error(
            'Hyperdrive connectionString is missing from binding "DB"'
        );
    }

    const pool = new Pool({
        connectionString,
        maxUses: 1, // Required for Cloudflare Workers - prevents connection reuse
        max: 1,
        ssl: { rejectUnauthorized: false } // Required for Hyperdrive/AWS tunnel connections
    });

    return {
        async query(text: string, params: any[] = []): Promise<QueryResult> {
            const result = await pool.query(text, params);
            return { rows: result.rows };
        }
    };
});
