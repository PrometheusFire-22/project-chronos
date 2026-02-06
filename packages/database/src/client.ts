/**
 * Database Client for Drizzle ORM
 *
 * Provides PostgreSQL connection using postgres.js driver with support for:
 * - Connection pooling
 * - SSL/TLS connections
 * - Environment-based configuration
 */

import postgres from 'postgres';
import { drizzle } from 'drizzle-orm/postgres-js';
import type { PostgresJsDatabase } from 'drizzle-orm/postgres-js';

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL environment variable is required');
}

/**
 * PostgreSQL client instance using postgres.js
 *
 * Features:
 * - Automatic connection pooling
 * - Prepared statement caching
 * - Type-safe queries via Drizzle ORM
 */
export const sql = postgres(process.env.DATABASE_URL, {
  max: parseInt(process.env.DB_POOL_MAX || '10'),
  idle_timeout: parseInt(process.env.DB_IDLE_TIMEOUT || '30'),
  connect_timeout: parseInt(process.env.DB_CONNECT_TIMEOUT || '10'),
  prepare: true,
  debug: process.env.NODE_ENV === 'development',
});

/**
 * Drizzle ORM instance
 *
 * Type-safe database queries with full TypeScript support.
 * Import schema from ./schema/index.ts for typed queries.
 */
export const db: PostgresJsDatabase = drizzle(sql);

/**
 * Close database connection
 * Use this for graceful shutdown
 */
export async function closeDatabase(): Promise<void> {
  await sql.end();
}

/**
 * Test database connection
 * Useful for health checks and initialization
 */
export async function testConnection(): Promise<boolean> {
  try {
    await sql`SELECT 1`;
    return true;
  } catch (error) {
    console.error('Database connection failed:', error);
    return false;
  }
}
