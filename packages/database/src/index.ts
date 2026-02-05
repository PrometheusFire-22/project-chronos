/**
 * @chronos/database
 *
 * Drizzle ORM database layer for Project Chronos.
 *
 * Features:
 * - Type-safe database queries
 * - PostgreSQL with TimescaleDB, PostGIS, pgvector, Apache AGE extensions
 * - Schema-first design with Drizzle ORM
 * - Automatic migrations
 * - Connection pooling
 *
 * Usage:
 * ```typescript
 * import { db, blogPosts } from '@chronos/database';
 *
 * // Type-safe query
 * const posts = await db.select().from(blogPosts).where(eq(blogPosts.status, 'published'));
 * ```
 */

// Database client and utilities
export { db, queryClient, closeDatabase, testConnection } from './client';
export { createHyperdriveClient } from './hyperdrive-client';

// Schema exports
export * from './schema';

// Re-export Drizzle operators for convenience
export { eq, and, or, not, like, ilike, inArray, isNull, isNotNull, desc, asc } from 'drizzle-orm';
