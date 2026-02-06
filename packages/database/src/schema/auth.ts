import { pgTable, text, integer, timestamp, uniqueIndex, boolean, pgSchema, uuid } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';

export const authSchema = pgSchema("auth");

export const user = authSchema.table("user", {
  id: text("id").primaryKey(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified").default(false),
  firstName: text("first_name"),
  lastName: text("last_name"),
  image: text("image"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
  tier: text("tier").default("free"),
  documentsProcessed: integer("documents_processed").default(0),
  queriesThisMonth: integer("queries_this_month").default(0),
  monthlyQueryLimit: integer("monthly_query_limit").default(100),
});

export const session = authSchema.table("session", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().references(() => user.id),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  token: text("token").notNull(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const account = authSchema.table("account", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().references(() => user.id),
  accountId: text("account_id").notNull(),
  providerId: text("provider_id").notNull(),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  idToken: text("id_token"),
  expiresAt: integer("expires_at"),
  scope: text("scope"),
  password: text("password"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const verification = authSchema.table("verification", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: integer("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

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
