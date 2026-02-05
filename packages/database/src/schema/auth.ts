import { pgTable, uuid, text, integer, timestamp, uniqueIndex } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';

// We likely need to reference the auth.user table, but since Better Auth manages that table
// independently or via a different schema file, we might just reference it by ID string
// or assume the table exists. However, for foreign key constraints in Drizzle,
// we generally need the table object.
// Given Better Auth is external, we might define the FK purely in SQL or
// if we have the auth schema defined, import it.
// For now, I'll define it as a standalone table in the 'auth' schema.

// Note: Better Auth tables are usually in 'public' or a specific schema.
// The implementation plan says `auth.user_usage`, so we'll put it in 'auth' schema.

import { pgSchema } from "drizzle-orm/pg-core";

export const authSchema = pgSchema("auth");

export const userUsage = authSchema.table('user_usage', {
  id: uuid('id').defaultRandom().primaryKey().notNull(),
  userId: text('user_id').notNull(), // Better Auth uses text IDs usually

  // Storage Tracking
  pdfUploadCount: integer('pdf_upload_count').default(0),
  pdfUploadLimit: integer('pdf_upload_limit').default(3),

  // Page Tracking (War & Peace protection)
  totalPageCount: integer('total_page_count').default(0),
  maxPagesPerDoc: integer('max_pages_per_doc').default(50),
  totalPageLimit: integer('total_page_limit').default(120),

  // Inference Tracking
  queryCount: integer('query_count').default(0),
  queryLimit: integer('query_limit').default(5),

  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => {
  return {
    uniqueUserUsage: uniqueIndex('unique_user_usage').on(table.userId),
  };
});
