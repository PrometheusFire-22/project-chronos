/**
 * Database Client for Drizzle ORM
 *
 * Provides PostgreSQL connection using postgres.js driver with support for:
 * - Connection pooling
 * - SSL/TLS connections
 * - Environment-based configuration
 * - Cloudflare Hyperdrive compatibility (future)
 */

import postgres from 'postgres';
import { drizzle } from 'drizzle-orm/postgres-js';
import type { PostgresJsDatabase } from 'drizzle-orm/postgres-js';

/**
 * Database configuration from environment variables
 */
const config = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  user: process.env.DB_USER || 'chronos',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'chronos',

  // SSL configuration
  ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : undefined,

  // Connection pool settings
  max: parseInt(process.env.DB_POOL_MAX || '10'),
  idle_timeout: parseInt(process.env.DB_IDLE_TIMEOUT || '30'),
  connect_timeout: parseInt(process.env.DB_CONNECT_TIMEOUT || '10'),
};

/**
 * PostgreSQL client instance using postgres.js
 *
 * Features:
 * - Automatic connection pooling
 * - Prepared statement caching
 * - Type-safe queries via Drizzle ORM
 */
export const queryClient = postgres({
  host: config.host,
  port: config.port,
  username: config.user,
  password: config.password,
  database: config.database,
  ssl: config.ssl,
  max: config.max,
  idle_timeout: config.idle_timeout,
  connect_timeout: config.connect_timeout,

  // Prepare SQL statements for reuse
  prepare: true,

  // Debug mode in development
  debug: process.env.NODE_ENV === 'development',
});

/**
 * Drizzle ORM instance
 *
 * Type-safe database queries with full TypeScript support.
 * Import schema from ./schema/index.ts for typed queries.
 */
export const db: PostgresJsDatabase = drizzle(queryClient);

/**
 * Close database connection
 * Use this for graceful shutdown
 */
export async function closeDatabase(): Promise<void> {
  await queryClient.end();
}

/**
 * Test database connection
 * Useful for health checks and initialization
 */
export async function testConnection(): Promise<boolean> {
  try {
    await queryClient`SELECT 1`;
    return true;
  } catch (error) {
    console.error('Database connection failed:', error);
    return false;
  }
}
