/**
 * Edge-compatible exports for Cloudflare Workers/Pages
 *
 * This file only exports code that works in Edge runtime (no Node.js dependencies).
 * Use this instead of the main index when importing in Edge runtime routes.
 */

// Edge-compatible database client
export { createHyperdriveClient } from './hyperdrive-client';

// Schema exports (no runtime dependencies)
export * from './schema';

// Re-export Drizzle operators for convenience
export { eq, and, or, not, like, ilike, inArray, isNull, isNotNull, desc, asc } from 'drizzle-orm';
