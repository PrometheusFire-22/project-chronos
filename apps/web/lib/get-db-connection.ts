import { getRequestContext } from '@opennextjs/cloudflare';

/**
 * Get database connection string.
 * - In production (Cloudflare): Uses Hyperdrive binding
 * - In development: Uses DATABASE_URL env var
 */
export async function getDbConnectionString(): Promise<string> {
  // In production on Cloudflare, use Hyperdrive
  try {
    const { env } = await getRequestContext();
    if (env?.DB?.connectionString) {
      console.log('[DB] Using Hyperdrive connection');
      return env.DB.connectionString;
    }
  } catch (e) {
    // Not in Cloudflare context, fall through to DATABASE_URL
  }

  // Fallback to environment variable (local dev)
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL not configured');
  }

  console.log('[DB] Using DATABASE_URL');
  return process.env.DATABASE_URL;
}
