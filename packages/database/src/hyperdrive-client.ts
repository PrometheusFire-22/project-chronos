import { drizzle } from 'drizzle-orm/neon-serverless';
import { Pool } from '@neondatabase/serverless';
import * as schema from './schema';

/**
 * Creates a Drizzle client configured for Cloudflare Hyperdrive with Edge runtime.
 *
 * Uses @neondatabase/serverless which is compatible with Edge runtime (no Node.js dependencies).
 * Hyperdrive provides connection pooling at the edge, so we configure the pool accordingly.
 *
 * @param connectionString - The Hyperdrive connection string from env.DB.connectionString
 * @returns Configured Drizzle client instance
 */
export function createHyperdriveClient(connectionString: string) {
  const pool = new Pool({ connectionString });
  return drizzle(pool, { schema });
}
