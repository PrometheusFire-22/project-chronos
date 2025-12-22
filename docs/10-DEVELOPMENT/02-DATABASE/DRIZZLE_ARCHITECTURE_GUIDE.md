# Drizzle ORM Architecture Guide

**Project Chronos Database Architecture**

This document provides a comprehensive overview of the Drizzle ORM implementation in Project Chronos, covering architecture decisions, schema design, migration strategy, and integration patterns.

---

## Table of Contents

1. [Overview](#overview)
2. [Architecture Decisions](#architecture-decisions)
3. [Schema Organization](#schema-organization)
4. [Database Ownership Strategy](#database-ownership-strategy)
5. [Integration Architecture](#integration-architecture)
6. [Type Safety Flow](#type-safety-flow)
7. [Migration Strategy](#migration-strategy)
8. [Performance Considerations](#performance-considerations)

---

## Overview

### What is Drizzle ORM?

Drizzle is a TypeScript-first ORM that provides:

- **Type-safe queries** - Full TypeScript inference from schema to queries
- **SQL-like syntax** - Familiar to developers who know SQL
- **Zero runtime overhead** - Compiles to plain SQL
- **Excellent PostgreSQL support** - Native support for PostgreSQL features
- **Migration system** - Automatic migration generation from schema changes

### Why Drizzle for Project Chronos?

**Key Requirements:**
1. **Database-first architecture** - PostgreSQL with extensions is the product
2. **Type safety** - End-to-end type safety from database to UI
3. **PostgreSQL extensions** - Must support TimescaleDB, PostGIS, pgvector, Apache AGE
4. **Schema ownership** - Need clear ownership of schema definition
5. **CMS integration** - Must integrate cleanly with Directus CMS

**Why Drizzle vs. Alternatives:**

| Requirement | Drizzle | Prisma | TypeORM |
|-------------|---------|--------|---------|
| **Schema ownership** | ✅ Code-first, TypeScript | ❌ Prisma owns schema | ⚠️ Decorators or SQL |
| **PostgreSQL extensions** | ✅ Full support | ❌ Limited extension support | ⚠️ Manual configuration |
| **Type safety** | ✅ Full inference | ✅ Generated types | ⚠️ Partial |
| **SQL-like queries** | ✅ Familiar syntax | ❌ Custom query language | ⚠️ Query builder |
| **Migration control** | ✅ SQL-based migrations | ❌ Opinionated migrations | ✅ SQL migrations |
| **Directus compatibility** | ✅ Introspects schema | ❌ Schema conflicts | ✅ Introspects schema |
| **Performance** | ✅ Zero overhead | ⚠️ Runtime overhead | ⚠️ Runtime overhead |

**Decision:** Drizzle is the only ORM that meets all requirements.

---

## Architecture Decisions

### 1. Database-First Philosophy

**Principle:** The PostgreSQL database with extensions is the product and moat of Project Chronos.

```
PostgreSQL Database (Source of Truth)
  ├── TimescaleDB (time-series data)
  ├── PostGIS (geospatial queries)
  ├── pgvector (vector similarity search)
  └── Apache AGE (graph database queries)
```

**Implications:**
- Schema is defined in code (Drizzle), not generated from code (Prisma)
- Migrations are explicit SQL files, not opaque binary formats
- Full PostgreSQL feature set is accessible
- Extensions are first-class citizens

### 2. Schema Ownership Model

**Three-tier ownership:**

```
┌─────────────────────────────────────────────────────┐
│              PostgreSQL Database                    │
│                                                     │
│  ┌───────────────────────────────────────────┐    │
│  │  CMS Content Tables (cms_*)               │    │
│  │  Owner: Drizzle ORM                       │    │
│  │  ├── cms_blog_posts                       │    │
│  │  ├── cms_docs_pages                       │    │
│  │  ├── cms_features                         │    │
│  │  └── ... (managed by Drizzle)             │    │
│  └───────────────────────────────────────────┘    │
│                                                     │
│  ┌───────────────────────────────────────────┐    │
│  │  Application Tables (app_*)               │    │
│  │  Owner: Drizzle ORM (future)              │    │
│  │  ├── app_deals                            │    │
│  │  ├── app_companies                        │    │
│  │  ├── app_investors                        │    │
│  │  └── ... (managed by Drizzle)             │    │
│  └───────────────────────────────────────────┘    │
│                                                     │
│  ┌───────────────────────────────────────────┐    │
│  │  Data Warehouse Tables (raw_*, staging_*) │    │
│  │  Owner: Alembic                           │    │
│  │  ├── raw_crunchbase                       │    │
│  │  ├── staging_deals                        │    │
│  │  └── ... (managed by Alembic)             │    │
│  └───────────────────────────────────────────┘    │
│                                                     │
│  ┌───────────────────────────────────────────┐    │
│  │  CMS System Tables (directus_*)           │    │
│  │  Owner: Directus                          │    │
│  │  ├── directus_users                       │    │
│  │  ├── directus_files                       │    │
│  │  └── ... (managed by Directus)            │    │
│  └───────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────┘
```

**Ownership Rules:**
1. **Drizzle** - Owns `cms_*` and `app_*` tables
2. **Alembic** - Owns data warehouse tables (`raw_*`, `staging_*`)
3. **Directus** - Owns its own system tables (`directus_*`)
4. **Collaboration** - All systems coexist peacefully in one database

### 3. Dual Migration Strategy

**Problem:** We need two migration systems for different purposes.

**Solution:** Drizzle and Alembic coexist.

```
┌──────────────────────────────────────────────────────┐
│                 PostgreSQL Database                  │
├──────────────────────────────────────────────────────┤
│                                                      │
│  Drizzle Migrations (cms_*, app_*)                  │
│  ├── packages/database/migrations/                  │
│  ├── 0000_wise_reaper.sql                          │
│  ├── 0001_next_migration.sql                       │
│  └── __drizzle_migrations (tracking table)         │
│                                                      │
│  Alembic Migrations (raw_*, staging_*)              │
│  ├── alembic/versions/                              │
│  ├── abc123_initial.py                              │
│  ├── def456_next_migration.py                       │
│  └── alembic_version (tracking table)               │
│                                                      │
└──────────────────────────────────────────────────────┘
```

**Why This Works:**
- Table prefixes prevent conflicts (`cms_*` vs `raw_*`)
- Separate tracking tables (`__drizzle_migrations` vs `alembic_version`)
- Each tool manages its own domain
- No schema conflicts

---

## Schema Organization

### Directory Structure

```
packages/database/
├── src/
│   ├── client.ts              # Database connection
│   ├── index.ts               # Public exports
│   └── schema/
│       ├── index.ts           # Schema exports
│       ├── cms.ts             # CMS content tables
│       ├── app.ts             # Application tables (future)
│       └── analytics.ts       # Analytics tables (future)
├── migrations/
│   ├── 0000_wise_reaper.sql   # Initial CMS schema
│   └── meta/
│       ├── 0000_snapshot.json # Schema snapshot
│       └── _journal.json      # Migration journal
├── drizzle.config.ts          # Drizzle configuration
├── package.json               # Package dependencies
├── tsconfig.json              # TypeScript config
└── README.md                  # Package documentation
```

### Schema Files

**`src/schema/cms.ts`** - CMS Content Tables

Contains all content tables managed by Directus:
- `cms_blog_posts` - Blog articles
- `cms_docs_pages` - Documentation and general pages
- `cms_homepage_hero` - Homepage hero section
- `cms_features` - Product features
- `cms_announcements` - Site-wide notifications
- `cms_legal_pages` - Legal documents

**`src/schema/app.ts`** (Future) - Application Tables

Will contain core application data:
- `app_deals` - Deal/transaction data
- `app_companies` - Company profiles
- `app_investors` - Investor profiles
- `app_users` - Application users
- etc.

**`src/schema/analytics.ts`** (Future) - Analytics Tables

Will contain analytics and tracking:
- `analytics_events` - User events
- `analytics_sessions` - User sessions
- `analytics_page_views` - Page view tracking
- etc.

---

## Database Ownership Strategy

### Schema Definition Ownership

**Drizzle Owns Schema Definition:**

```typescript
// packages/database/src/schema/cms.ts
export const blogPosts = pgTable('cms_blog_posts', {
  id: uuid('id').defaultRandom().primaryKey(),
  title: varchar('title', { length: 255 }).notNull(),
  slug: varchar('slug', { length: 255 }).notNull().unique(),
  content: text('content').notNull(),
  // ... more fields
});
```

**This TypeScript code is the single source of truth for:**
- Table structure
- Column types
- Constraints
- Indexes
- Foreign keys
- Default values

**NOT Directus:**

Directus does not define schema. It **introspects** the existing PostgreSQL schema:

```
Drizzle Schema Definition (TypeScript)
  ↓ drizzle-kit generate
SQL Migration File
  ↓ drizzle-kit migrate
PostgreSQL Database
  ↓ introspection on startup
Directus CMS (read-only schema view)
```

### Content Management Ownership

**Directus Owns Content:**

Directus manages the **data** in the tables, not the **structure**:

- Content editors create/edit blog posts
- Drafts are saved as rows with `status = 'draft'`
- Publishing sets `status = 'published'`
- All content operations happen via Directus UI

**Drizzle Queries Content:**

Application code queries the content:

```typescript
import { db, blogPosts, eq } from '@chronos/database';

// Type-safe query
const posts = await db
  .select()
  .from(blogPosts)
  .where(eq(blogPosts.status, 'published'));
```

---

## Integration Architecture

### Complete Data Flow

```
┌─────────────────────────────────────────────────────────────┐
│                    Content Creation Flow                    │
└─────────────────────────────────────────────────────────────┘

1. Schema Definition (Development)
   ┌──────────────────────────────────────┐
   │  Drizzle Schema (TypeScript)         │
   │  packages/database/src/schema/cms.ts │
   └──────────────┬───────────────────────┘
                  │
                  ▼
   ┌──────────────────────────────────────┐
   │  drizzle-kit generate                │
   │  Creates SQL migration               │
   └──────────────┬───────────────────────┘
                  │
                  ▼
   ┌──────────────────────────────────────┐
   │  migrations/0001_xxx.sql             │
   │  Pure SQL DDL statements             │
   └──────────────┬───────────────────────┘
                  │
                  ▼
   ┌──────────────────────────────────────┐
   │  drizzle-kit migrate                 │
   │  Apply to PostgreSQL                 │
   └──────────────┬───────────────────────┘
                  │
                  ▼
   ┌──────────────────────────────────────┐
   │  PostgreSQL Database                 │
   │  Tables, indexes, constraints exist  │
   └──────────────┬───────────────────────┘
                  │
                  ▼
   ┌──────────────────────────────────────┐
   │  Directus Startup                    │
   │  Introspects PostgreSQL schema       │
   │  Creates collections automatically   │
   └──────────────┬───────────────────────┘
                  │
                  ▼

2. Content Management (Production)
   ┌──────────────────────────────────────┐
   │  Content Editor                      │
   │  https://admin.automatonicai.com     │
   └──────────────┬───────────────────────┘
                  │
                  ▼
   ┌──────────────────────────────────────┐
   │  Directus Admin UI                   │
   │  - Create blog post                  │
   │  - Add title, content, SEO           │
   │  - Upload featured image             │
   │  - Publish                           │
   └──────────────┬───────────────────────┘
                  │
                  ▼
   ┌──────────────────────────────────────┐
   │  PostgreSQL Database                 │
   │  INSERT INTO cms_blog_posts ...      │
   └──────────────┬───────────────────────┘
                  │
                  ▼
   ┌──────────────────────────────────────┐
   │  Webhook (optional)                  │
   │  Notify Next.js of new content       │
   └──────────────┬───────────────────────┘
                  │
                  ▼

3. Content Consumption (Frontend)
   ┌──────────────────────────────────────┐
   │  Next.js Application                 │
   │  apps/web/                           │
   └──────────────┬───────────────────────┘
                  │
                  ▼
   ┌──────────────────────────────────────┐
   │  Directus SDK Query                  │
   │  GET /items/cms_blog_posts           │
   │  ?filter[status][_eq]=published      │
   └──────────────┬───────────────────────┘
                  │
                  ▼
   ┌──────────────────────────────────────┐
   │  Directus REST/GraphQL API           │
   │  Transforms DB rows to API response  │
   └──────────────┬───────────────────────┘
                  │
                  ▼
   ┌──────────────────────────────────────┐
   │  PostgreSQL Query                    │
   │  SELECT * FROM cms_blog_posts        │
   │  WHERE status = 'published'          │
   └──────────────┬───────────────────────┘
                  │
                  ▼
   ┌──────────────────────────────────────┐
   │  Next.js Server Component            │
   │  Renders blog post                   │
   └──────────────┬───────────────────────┘
                  │
                  ▼
   ┌──────────────────────────────────────┐
   │  User's Browser                      │
   │  https://automatonicai.com/blog/post │
   └──────────────────────────────────────┘
```

### Alternative Query Pattern (Direct Database)

For application features (non-CMS content), query directly:

```typescript
// apps/web/app/api/deals/route.ts
import { db, deals, eq } from '@chronos/database';

export async function GET() {
  const activeDeals = await db
    .select()
    .from(deals)
    .where(eq(deals.status, 'active'));

  return Response.json(activeDeals);
}
```

**When to use Direct vs Directus:**

| Content Type | Query Method | Reason |
|--------------|--------------|--------|
| Blog posts | Directus API | CMS-managed content |
| Documentation | Directus API | CMS-managed content |
| Homepage hero | Directus API | CMS-managed content |
| Features list | Directus API | CMS-managed content |
| Deals (app data) | Direct Drizzle | Application logic |
| Companies | Direct Drizzle | Application logic |
| Analytics | Direct Drizzle | Application logic |

---

## Type Safety Flow

### End-to-End Type Safety

```typescript
// 1. Schema definition (TypeScript)
export const blogPosts = pgTable('cms_blog_posts', {
  id: uuid('id').defaultRandom().primaryKey(),
  title: varchar('title', { length: 255 }).notNull(),
  slug: varchar('slug', { length: 255 }).notNull().unique(),
  publishedAt: timestamp('published_at', { withTimezone: true }),
  tags: jsonb('tags').$type<string[]>().default([]),
});

// 2. Inferred TypeScript type
type BlogPost = typeof blogPosts.$inferSelect;
// {
//   id: string;
//   title: string;
//   slug: string;
//   publishedAt: Date | null;
//   tags: string[];
// }

// 3. Type-safe query
const posts = await db.select().from(blogPosts);
//    ^? BlogPost[]

// 4. Type-safe filter
const post = await db
  .select()
  .from(blogPosts)
  .where(eq(blogPosts.slug, 'my-post'))
  .limit(1);

// 5. TypeScript knows the shape
post[0].title;       // ✅ string
post[0].publishedAt; // ✅ Date | null
post[0].tags;        // ✅ string[]
post[0].invalid;     // ❌ TypeScript error

// 6. Zod validation (optional)
import { createSelectSchema } from 'drizzle-zod';
const blogPostSchema = createSelectSchema(blogPosts);

// 7. tRPC procedure (type-safe API)
const appRouter = router({
  getPost: publicProcedure
    .input(z.object({ slug: z.string() }))
    .output(blogPostSchema.nullable())
    .query(async ({ input }) => {
      const [post] = await db
        .select()
        .from(blogPosts)
        .where(eq(blogPosts.slug, input.slug))
        .limit(1);
      return post ?? null;
    }),
});

// 8. Frontend usage (fully typed)
const { data: post } = trpc.getPost.useQuery({ slug: 'my-post' });
//     ^? BlogPost | null
```

**Type safety across the entire stack:**
- ✅ Database schema → TypeScript types
- ✅ Query results → Inferred types
- ✅ API inputs/outputs → Validated with Zod
- ✅ Frontend data fetching → Full type inference
- ✅ No manual type definitions needed

---

## Migration Strategy

### Migration Workflow

```bash
# 1. Modify schema
# Edit packages/database/src/schema/cms.ts

# 2. Generate migration
cd packages/database
pnpm db:generate

# 3. Review generated SQL
cat migrations/0002_next_migration.sql

# 4. Apply migration (development)
pnpm db:migrate

# 5. Test changes
pnpm db:studio  # Visual database explorer

# 6. Commit migration files
git add migrations/
git commit -m "feat(database): add new column to cms_blog_posts"

# 7. Deploy (production)
# Migration runs automatically on deploy
# Or manually: pnpm db:migrate
```

### Migration Best Practices

**1. Review Generated SQL:**

Always review the SQL before applying:

```sql
-- Good: Adding nullable column (safe)
ALTER TABLE "cms_blog_posts" ADD COLUMN "excerpt" text;

-- Good: Adding column with default (safe)
ALTER TABLE "cms_blog_posts" ADD COLUMN "featured" boolean DEFAULT false NOT NULL;

-- Dangerous: Dropping column (data loss)
ALTER TABLE "cms_blog_posts" DROP COLUMN "old_field";

-- Dangerous: Changing column type (potential data loss)
ALTER TABLE "cms_blog_posts" ALTER COLUMN "title" TYPE varchar(100);
```

**2. Backward Compatible Migrations:**

Prefer additive changes:

```typescript
// ✅ Good: Add optional field
export const blogPosts = pgTable('cms_blog_posts', {
  // ... existing fields
  excerpt: text('excerpt'), // nullable, safe to add
});

// ❌ Risky: Remove field
export const blogPosts = pgTable('cms_blog_posts', {
  // ... existing fields
  // Removed old_field - breaks existing code
});

// ✅ Better: Deprecate first, remove later
export const blogPosts = pgTable('cms_blog_posts', {
  // ... existing fields
  /** @deprecated Use excerpt instead */
  oldField: text('old_field'),
  excerpt: text('excerpt'),
});
```

**3. Multi-Step Migrations for Breaking Changes:**

```typescript
// Step 1: Add new column (migration 0001)
export const blogPosts = pgTable('cms_blog_posts', {
  oldTitle: varchar('old_title', { length: 100 }),
  newTitle: varchar('new_title', { length: 255 }), // New field
});

// Step 2: Data migration (SQL in migration file)
UPDATE cms_blog_posts SET new_title = old_title WHERE new_title IS NULL;

// Step 3: Make new column required (migration 0002)
// ALTER TABLE cms_blog_posts ALTER COLUMN new_title SET NOT NULL;

// Step 4: Remove old column (migration 0003)
// ALTER TABLE cms_blog_posts DROP COLUMN old_title;
```

---

## Performance Considerations

### Indexing Strategy

**All tables include strategic indexes:**

```typescript
export const blogPosts = pgTable(
  'cms_blog_posts',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    slug: varchar('slug', { length: 255 }).notNull().unique(),
    status: varchar('status', { length: 20 }).notNull().default('draft'),
    publishedAt: timestamp('published_at', { withTimezone: true }),
    category: varchar('category', { length: 50 }),
  },
  (table) => ({
    // Primary key index (automatic)
    // Unique constraint index (automatic)

    // Performance indexes
    slugIdx: index('cms_blog_posts_slug_idx').on(table.slug),
    statusIdx: index('cms_blog_posts_status_idx').on(table.status),
    publishedAtIdx: index('cms_blog_posts_published_at_idx').on(table.publishedAt),
    categoryIdx: index('cms_blog_posts_category_idx').on(table.category),
  })
);
```

**Why these indexes:**

```sql
-- Fast slug lookup (URL routing)
SELECT * FROM cms_blog_posts WHERE slug = 'my-post';
-- Uses: cms_blog_posts_slug_idx

-- Fast published posts query
SELECT * FROM cms_blog_posts WHERE status = 'published' ORDER BY published_at DESC;
-- Uses: cms_blog_posts_status_idx + cms_blog_posts_published_at_idx

-- Fast category filtering
SELECT * FROM cms_blog_posts WHERE category = 'engineering' AND status = 'published';
-- Uses: cms_blog_posts_category_idx + cms_blog_posts_status_idx
```

### Query Optimization

**Use Drizzle's query builder efficiently:**

```typescript
// ✅ Efficient: Select only needed columns
const posts = await db
  .select({
    id: blogPosts.id,
    title: blogPosts.title,
    slug: blogPosts.slug,
  })
  .from(blogPosts);

// ❌ Inefficient: Select all columns when only few needed
const posts = await db.select().from(blogPosts);

// ✅ Efficient: Use limit for pagination
const posts = await db
  .select()
  .from(blogPosts)
  .limit(10)
  .offset(page * 10);

// ✅ Efficient: Combine filters
const posts = await db
  .select()
  .from(blogPosts)
  .where(
    and(
      eq(blogPosts.status, 'published'),
      gte(blogPosts.publishedAt, lastWeek)
    )
  );
```

### Connection Pooling

**Configured in `packages/database/src/client.ts`:**

```typescript
export const queryClient = postgres({
  host: config.host,
  port: config.port,
  max: 10,              // Max 10 connections in pool
  idle_timeout: 30,     // Close idle connections after 30s
  connect_timeout: 10,  // 10s connection timeout
  prepare: true,        // Cache prepared statements
});
```

**For Cloudflare Workers (future):**

Use Hyperdrive for connection pooling:

```typescript
// apps/worker/src/db.ts
export const db = drizzle(
  postgres(env.HYPERDRIVE_URL) // Cloudflare Hyperdrive
);
```

---

## Summary

**Key Takeaways:**

1. ✅ **Drizzle owns schema** - TypeScript schema is source of truth
2. ✅ **PostgreSQL extensions preserved** - TimescaleDB, PostGIS, pgvector, AGE
3. ✅ **Type safety** - End-to-end TypeScript inference
4. ✅ **Dual migrations** - Drizzle (app) + Alembic (data warehouse) coexist
5. ✅ **Directus integration** - Introspects schema, manages content
6. ✅ **Performance** - Strategic indexes, connection pooling, efficient queries
7. ✅ **Flexibility** - Direct queries or Directus API based on use case

**Next Steps:**

- Read [Schema Reference](./DRIZZLE_SCHEMA_REFERENCE.md) for detailed table documentation
- Read [Developer Guide](./DRIZZLE_DEVELOPER_GUIDE.md) for daily workflows
- Read [Content Strategy](./CONTENT_STRATEGY_GUIDE.md) for content management patterns

---

**Document Version:** 1.0.0
**Last Updated:** 2025-12-21
**Maintainer:** Geoff Bevans <geoff@automatonicai.com>
