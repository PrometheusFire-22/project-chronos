/**
 * CMS Content Schema
 *
 * Drizzle schema definitions for Directus-managed content.
 * These tables will be introspected by Directus for content management.
 *
 * Design Principles:
 * - Drizzle owns the schema definition (single source of truth)
 * - Directus introspects these tables (read-only schema access)
 * - All tables use 'cms_' prefix to distinguish from app tables
 * - Schema follows Directus conventions for compatibility
 */

import {
  pgTable,
  uuid,
  varchar,
  text,
  timestamp,
  boolean,
  integer,
  jsonb,
  index,
} from 'drizzle-orm/pg-core';

/**
 * Blog Posts
 *
 * Content for blog/news articles on the marketing site.
 * Managed by content editors via Directus UI.
 */
export const blogPosts = pgTable(
  'cms_blog_posts',
  {
    id: uuid('id').defaultRandom().primaryKey(),

    // Core fields
    title: varchar('title', { length: 255 }).notNull(),
    slug: varchar('slug', { length: 255 }).notNull().unique(),
    excerpt: text('excerpt'),
    content: text('content').notNull(),

    // Metadata
    featuredImage: varchar('featured_image', { length: 500 }),
    author: varchar('author', { length: 100 }).notNull().default('Geoff Bevans'),
    category: varchar('category', { length: 50 }),
    tags: jsonb('tags').$type<string[]>().default([]),

    // SEO
    metaTitle: varchar('meta_title', { length: 60 }),
    metaDescription: varchar('meta_description', { length: 160 }),
    ogImage: varchar('og_image', { length: 500 }),

    // Publishing
    status: varchar('status', { length: 20 }).notNull().default('draft'), // draft, published, archived
    publishedAt: timestamp('published_at', { withTimezone: true }),
    featured: boolean('featured').notNull().default(false),

    // Read stats
    readTimeMinutes: integer('read_time_minutes'),
    viewCount: integer('view_count').notNull().default(0),

    // Audit
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    slugIdx: index('cms_blog_posts_slug_idx').on(table.slug),
    statusIdx: index('cms_blog_posts_status_idx').on(table.status),
    publishedAtIdx: index('cms_blog_posts_published_at_idx').on(table.publishedAt),
    categoryIdx: index('cms_blog_posts_category_idx').on(table.category),
  })
);

/**
 * Documentation Pages
 *
 * Technical documentation and user guides.
 * Organized in hierarchical structure (parent/child relationships).
 */
export const docsPages = pgTable(
  'cms_docs_pages',
  {
    id: uuid('id').defaultRandom().primaryKey(),

    // Core fields
    title: varchar('title', { length: 255 }).notNull(),
    slug: varchar('slug', { length: 255 }).notNull().unique(),
    content: text('content').notNull(),

    // Hierarchy
    parentId: uuid('parent_id').references(() => docsPages.id, {
      onDelete: 'set null',
    }),
    sortOrder: integer('sort_order').notNull().default(0),

    // Metadata
    icon: varchar('icon', { length: 50 }), // Lucide icon name
    description: text('description'),

    // SEO
    metaTitle: varchar('meta_title', { length: 60 }),
    metaDescription: varchar('meta_description', { length: 160 }),

    // Publishing
    status: varchar('status', { length: 20 }).notNull().default('draft'),
    publishedAt: timestamp('published_at', { withTimezone: true }),

    // Audit
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    slugIdx: index('cms_docs_pages_slug_idx').on(table.slug),
    parentIdIdx: index('cms_docs_pages_parent_id_idx').on(table.parentId),
    statusIdx: index('cms_docs_pages_status_idx').on(table.status),
  })
);

/**
 * Homepage Hero Content
 *
 * Dynamic hero section content for the marketing homepage.
 * Typically only one active record at a time.
 */
export const homepageHero = pgTable('cms_homepage_hero', {
  id: uuid('id').defaultRandom().primaryKey(),

  // Content
  headline: varchar('headline', { length: 255 }).notNull(),
  subheadline: text('subheadline'),
  ctaPrimaryText: varchar('cta_primary_text', { length: 50 }).notNull(),
  ctaPrimaryLink: varchar('cta_primary_link', { length: 255 }).notNull(),
  ctaSecondaryText: varchar('cta_secondary_text', { length: 50 }),
  ctaSecondaryLink: varchar('cta_secondary_link', { length: 255 }),

  // Media
  backgroundImage: varchar('background_image', { length: 500 }),
  backgroundVideo: varchar('background_video', { length: 500 }),

  // Status
  active: boolean('active').notNull().default(false), // Only one can be active

  // Audit
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

/**
 * Product Features
 *
 * Feature descriptions for the marketing site features page.
 */
export const features = pgTable(
  'cms_features',
  {
    id: uuid('id').defaultRandom().primaryKey(),

    // Core fields
    title: varchar('title', { length: 255 }).notNull(),
    slug: varchar('slug', { length: 255 }).notNull().unique(),
    description: text('description').notNull(),

    // Visual
    icon: varchar('icon', { length: 50 }), // Lucide icon name
    image: varchar('image', { length: 500 }),

    // Categorization
    category: varchar('category', { length: 50 }), // e.g., "Graph Analytics", "Data Pipeline"
    sortOrder: integer('sort_order').notNull().default(0),

    // Status
    enabled: boolean('enabled').notNull().default(true),

    // Audit
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    slugIdx: index('cms_features_slug_idx').on(table.slug),
    categoryIdx: index('cms_features_category_idx').on(table.category),
  })
);

/**
 * Announcements
 *
 * Site-wide announcements and notices (banner, modals, etc.).
 */
export const announcements = pgTable(
  'cms_announcements',
  {
    id: uuid('id').defaultRandom().primaryKey(),

    // Content
    title: varchar('title', { length: 255 }).notNull(),
    message: text('message').notNull(),
    link: varchar('link', { length: 255 }),
    linkText: varchar('link_text', { length: 50 }),

    // Display
    type: varchar('type', { length: 20 }).notNull().default('info'), // info, warning, success, error
    placement: varchar('placement', { length: 20 }).notNull().default('banner'), // banner, modal, toast
    dismissible: boolean('dismissible').notNull().default(true),

    // Scheduling
    startsAt: timestamp('starts_at', { withTimezone: true }),
    endsAt: timestamp('ends_at', { withTimezone: true }),
    active: boolean('active').notNull().default(false),

    // Audit
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    activeIdx: index('cms_announcements_active_idx').on(table.active),
    startsAtIdx: index('cms_announcements_starts_at_idx').on(table.startsAt),
  })
);

/**
 * Legal Pages
 *
 * Terms of Service, Privacy Policy, etc.
 */
export const legalPages = pgTable(
  'cms_legal_pages',
  {
    id: uuid('id').defaultRandom().primaryKey(),

    // Core fields
    title: varchar('title', { length: 255 }).notNull(),
    slug: varchar('slug', { length: 255 }).notNull().unique(),
    content: text('content').notNull(),

    // Versioning
    version: varchar('version', { length: 20 }).notNull(), // e.g., "1.0", "2.1"
    effectiveDate: timestamp('effective_date', { withTimezone: true }).notNull(),

    // Status
    status: varchar('status', { length: 20 }).notNull().default('draft'),
    publishedAt: timestamp('published_at', { withTimezone: true }),

    // Audit
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    slugIdx: index('cms_legal_pages_slug_idx').on(table.slug),
    statusIdx: index('cms_legal_pages_status_idx').on(table.status),
  })
);

/**
 * Export all CMS tables for Drizzle ORM
 */
export const cmsSchema = {
  blogPosts,
  docsPages,
  homepageHero,
  features,
  announcements,
  legalPages,
};
