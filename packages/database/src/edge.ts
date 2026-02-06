/**
 * Edge-compatible exports for Cloudflare Workers/Pages
 *
 * postgres.js is fully edge-compatible, so we export the standard client.
 * No separate edge client needed.
 */

// Standard postgres.js client (edge-compatible)
export { db, queryClient, closeDatabase, testConnection } from './client';

// Schema exports (no runtime dependencies)
export * from './schema';

// Re-export Drizzle operators for convenience
export { eq, and, or, not, like, ilike, inArray, isNull, isNotNull, desc, asc } from 'drizzle-orm';
