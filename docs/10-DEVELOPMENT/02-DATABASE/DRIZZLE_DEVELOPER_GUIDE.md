# Drizzle Developer Guide

**Daily workflows and best practices for working with Drizzle ORM**

This guide covers common development tasks, troubleshooting, and best practices for working with the Drizzle ORM layer in Project Chronos.

---

## Table of Contents

1. [Development Setup](#development-setup)
2. [Common Workflows](#common-workflows)
3. [Adding New Tables](#adding-new-tables)
4. [Modifying Existing Tables](#modifying-existing-tables)
5. [Querying Data](#querying-data)
6. [Testing](#testing)
7. [Troubleshooting](#troubleshooting)
8. [Best Practices](#best-practices)

---

## Development Setup

### Prerequisites

```bash
# Ensure dependencies installed
pnpm install

# Verify database connection
cd packages/database
DB_HOST=16.52.210.100 \
DB_PORT=5432 \
DB_USER=chronos \
DB_PASSWORD='<password>' \
DB_NAME=chronos \
pnpm exec tsx test-connection.ts
```

### Environment Variables

Create `.env` in project root or set in your shell:

```bash
# .env
DB_HOST=16.52.210.100
DB_PORT=5432
DB_USER=chronos
DB_PASSWORD=<password>
DB_NAME=chronos
```

Or export for current session:

```bash
export DB_HOST=16.52.210.100
export DB_PORT=5432
export DB_USER=chronos
export DB_PASSWORD='<password>'
export DB_NAME=chronos
```

### Useful Aliases

Add to your `.zshrc` or `.bashrc`:

```bash
# Database aliases
alias db:generate='cd packages/database && pnpm db:generate'
alias db:migrate='cd packages/database && pnpm db:migrate'
alias db:studio='cd packages/database && pnpm db:studio'
alias db:push='cd packages/database && pnpm db:push'  # Dev only!
```

---

## Common Workflows

### 1. Viewing Database Schema

**Option A: Drizzle Studio (Visual)**

```bash
cd packages/database
pnpm db:studio
```

Opens at http://localhost:4983 with visual schema explorer and query builder.

**Option B: PostgreSQL Client**

```bash
ssh -i <key> ubuntu@16.52.210.100
docker exec -it chronos-db psql -U chronos -d chronos

# List all CMS tables
\dt cms_*

# Describe table structure
\d cms_blog_posts

# View indexes
\di cms_*

# Exit
\q
```

### 2. Querying Data

**In TypeScript code:**

```typescript
import { db, blogPosts, eq } from '@chronos/database';

// Simple select
const posts = await db.select().from(blogPosts);

// With filter
const publishedPosts = await db
  .select()
  .from(blogPosts)
  .where(eq(blogPosts.status, 'published'));

// With joins (when you have relations)
import { docsPages } from '@chronos/database';

const pagesWithChildren = await db
  .select({
    page: docsPages,
    childCount: db
      .select({ count: count() })
      .from(docsPages)
      .where(eq(docsPages.parentId, docsPages.id)),
  })
  .from(docsPages);
```

**In Drizzle Studio:**

1. Run `pnpm db:studio`
2. Navigate to table in sidebar
3. Click "Browse data"
4. Use filters and search

### 3. Inserting Test Data

```typescript
import { db, blogPosts } from '@chronos/database';

// Insert single row
const [newPost] = await db
  .insert(blogPosts)
  .values({
    title: 'Test Post',
    slug: 'test-post',
    content: 'This is a test',
    status: 'draft',
  })
  .returning();

console.log('Created post:', newPost.id);

// Insert multiple rows
await db.insert(blogPosts).values([
  {
    title: 'Post 1',
    slug: 'post-1',
    content: 'Content 1',
    status: 'published',
    publishedAt: new Date(),
  },
  {
    title: 'Post 2',
    slug: 'post-2',
    content: 'Content 2',
    status: 'draft',
  },
]);
```

### 4. Updating Data

```typescript
import { db, blogPosts, eq } from '@chronos/database';

// Update single row
await db
  .update(blogPosts)
  .set({
    status: 'published',
    publishedAt: new Date(),
    updatedAt: new Date(),
  })
  .where(eq(blogPosts.slug, 'test-post'));

// Update multiple rows
await db
  .update(blogPosts)
  .set({ updatedAt: new Date() })
  .where(eq(blogPosts.status, 'draft'));

// Conditional update
await db
  .update(blogPosts)
  .set({ featured: true })
  .where(
    and(
      eq(blogPosts.status, 'published'),
      gte(blogPosts.viewCount, 1000)
    )
  );
```

### 5. Deleting Data

```typescript
import { db, blogPosts, eq } from '@chronos/database';

// Delete single row
await db
  .delete(blogPosts)
  .where(eq(blogPosts.id, '<uuid>'));

// Delete with condition
await db
  .delete(blogPosts)
  .where(eq(blogPosts.status, 'draft'));

// CAUTION: Delete all rows (rarely needed)
await db.delete(blogPosts); // No WHERE clause = delete all!
```

---

## Adding New Tables

### Step 1: Define Schema

Edit `packages/database/src/schema/cms.ts` (or appropriate file):

```typescript
export const newTable = pgTable(
  'cms_new_table',
  {
    id: uuid('id').defaultRandom().primaryKey(),

    // Your fields here
    name: varchar('name', { length: 255 }).notNull(),
    description: text('description'),

    // Always include these
    status: varchar('status', { length: 20 }).notNull().default('draft'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    // Define indexes
    nameIdx: index('cms_new_table_name_idx').on(table.name),
  })
);
```

### Step 2: Export Schema

Update `packages/database/src/schema/cms.ts`:

```typescript
export const cmsSchema = {
  blogPosts,
  docsPages,
  // ... existing tables
  newTable, // Add your new table
};
```

### Step 3: Generate Migration

```bash
cd packages/database
pnpm db:generate
```

This creates a new migration file in `migrations/` directory.

### Step 4: Review Migration

```bash
cat migrations/0002_new_migration.sql
```

Verify the SQL looks correct:

```sql
CREATE TABLE "cms_new_table" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "name" varchar(255) NOT NULL,
  "description" text,
  ...
);
```

### Step 5: Apply Migration

```bash
pnpm db:migrate
```

### Step 6: Verify in Database

```bash
# Via Drizzle Studio
pnpm db:studio

# Or via PostgreSQL
ssh ubuntu@16.52.210.100 -i <key>
docker exec chronos-db psql -U chronos -d chronos -c "\d cms_new_table"
```

### Step 7: Restart Directus (if needed)

```bash
ssh ubuntu@16.52.210.100 -i <key>
docker restart chronos-directus
```

Wait 10-20 seconds for Directus to restart and introspect the new table.

### Step 8: Commit Changes

```bash
git add packages/database/
git commit -m "feat(database): add cms_new_table schema"
git push
```

---

## Modifying Existing Tables

### Adding a Column

**Step 1: Update Schema**

```typescript
export const blogPosts = pgTable('cms_blog_posts', {
  // ... existing fields

  // Add new field
  readingDifficulty: varchar('reading_difficulty', { length: 20 }),
  // Options: 'beginner', 'intermediate', 'advanced'
});
```

**Step 2: Generate Migration**

```bash
cd packages/database
pnpm db:generate
```

**Step 3: Review Migration**

```bash
cat migrations/0003_xxx.sql
```

Should show:

```sql
ALTER TABLE "cms_blog_posts"
  ADD COLUMN "reading_difficulty" varchar(20);
```

**Step 4: Apply Migration**

```bash
pnpm db:migrate
```

**Step 5: Optional - Backfill Data**

If you need to set values for existing rows:

```typescript
await db
  .update(blogPosts)
  .set({ readingDifficulty: 'intermediate' })
  .where(isNull(blogPosts.readingDifficulty));
```

Or via SQL:

```sql
UPDATE cms_blog_posts
SET reading_difficulty = 'intermediate'
WHERE reading_difficulty IS NULL;
```

### Renaming a Column

**⚠️ WARNING:** Renaming requires careful migration to avoid data loss.

**Option A: Add New Column, Migrate Data, Remove Old (Safest)**

```typescript
// Migration 1: Add new column
export const blogPosts = pgTable('cms_blog_posts', {
  oldName: varchar('old_name', { length: 255 }),
  newName: varchar('new_name', { length: 255 }),
});

// Generate migration, apply
// Then backfill: UPDATE SET new_name = old_name

// Migration 2: Remove old column
export const blogPosts = pgTable('cms_blog_posts', {
  newName: varchar('new_name', { length: 255 }),
});
```

**Option B: Direct Rename (Risky - requires downtime)**

Manually edit migration SQL:

```sql
ALTER TABLE "cms_blog_posts"
  RENAME COLUMN "old_name" TO "new_name";
```

### Changing Column Type

**⚠️ WARNING:** Type changes can lose data. Test thoroughly.

**Safe Type Changes:**
- VARCHAR(100) → VARCHAR(255) ✅
- INTEGER → BIGINT ✅
- Adding NULL constraint ✅

**Risky Type Changes:**
- VARCHAR(255) → VARCHAR(50) ❌ (data truncation)
- TEXT → INTEGER ❌ (conversion errors)
- NOT NULL → NULL ✅ (but consider defaults)

**Example: Safe Widening**

```typescript
// Before
title: varchar('title', { length: 100 }).notNull(),

// After
title: varchar('title', { length: 255 }).notNull(),
```

Migration SQL:

```sql
ALTER TABLE "cms_blog_posts"
  ALTER COLUMN "title" TYPE varchar(255);
```

### Removing a Column

**⚠️ WARNING:** Dropping columns deletes data permanently.

**Step 1: Deprecate First (Optional)**

```typescript
/** @deprecated Will be removed in v2.0 */
oldField: varchar('old_field', { length: 255 }),
```

**Step 2: Remove from Schema**

```typescript
export const blogPosts = pgTable('cms_blog_posts', {
  // ... fields
  // oldField removed
});
```

**Step 3: Generate & Apply Migration**

```bash
pnpm db:generate
pnpm db:migrate
```

Migration SQL:

```sql
ALTER TABLE "cms_blog_posts" DROP COLUMN "old_field";
```

---

## Querying Data

### Basic Queries

```typescript
import { db, blogPosts, eq, and, or, like, ilike, desc, asc } from '@chronos/database';

// Select all
const allPosts = await db.select().from(blogPosts);

// Select specific columns
const titles = await db
  .select({ title: blogPosts.title, slug: blogPosts.slug })
  .from(blogPosts);

// Where clause
const published = await db
  .select()
  .from(blogPosts)
  .where(eq(blogPosts.status, 'published'));

// Multiple conditions (AND)
const featuredPublished = await db
  .select()
  .from(blogPosts)
  .where(
    and(
      eq(blogPosts.status, 'published'),
      eq(blogPosts.featured, true)
    )
  );

// Multiple conditions (OR)
const draftOrArchived = await db
  .select()
  .from(blogPosts)
  .where(
    or(
      eq(blogPosts.status, 'draft'),
      eq(blogPosts.status, 'archived')
    )
  );

// LIKE/ILIKE (pattern matching)
const searchResults = await db
  .select()
  .from(blogPosts)
  .where(ilike(blogPosts.title, '%chronos%')); // Case-insensitive

// Ordering
const recent = await db
  .select()
  .from(blogPosts)
  .orderBy(desc(blogPosts.publishedAt));

const alphabetical = await db
  .select()
  .from(blogPosts)
  .orderBy(asc(blogPosts.title));

// Limit and offset (pagination)
const page1 = await db
  .select()
  .from(blogPosts)
  .limit(10)
  .offset(0);

const page2 = await db
  .select()
  .from(blogPosts)
  .limit(10)
  .offset(10);
```

### Advanced Queries

```typescript
import { sql, count, avg, sum } from 'drizzle-orm';

// Aggregations
const stats = await db
  .select({
    totalPosts: count(),
    avgViews: avg(blogPosts.viewCount),
    totalViews: sum(blogPosts.viewCount),
  })
  .from(blogPosts);

// Group by
const postsByCategory = await db
  .select({
    category: blogPosts.category,
    count: count(),
  })
  .from(blogPosts)
  .groupBy(blogPosts.category);

// Having clause
const popularCategories = await db
  .select({
    category: blogPosts.category,
    count: count(),
  })
  .from(blogPosts)
  .groupBy(blogPosts.category)
  .having(sql`count(*) > 5`);

// Subqueries
const postsWithHighViews = await db
  .select()
  .from(blogPosts)
  .where(
    sql`${blogPosts.viewCount} > (SELECT AVG(view_count) FROM cms_blog_posts)`
  );

// Raw SQL (when Drizzle can't express the query)
const results = await db.execute(sql`
  SELECT DISTINCT ON (category) *
  FROM cms_blog_posts
  WHERE status = 'published'
  ORDER BY category, published_at DESC
`);
```

### Joins (Parent-Child Relationships)

```typescript
import { docsPages } from '@chronos/database';

// Get pages with their parent information
const pagesWithParents = await db
  .select({
    page: docsPages,
    parent: {
      id: docsPages.id,
      title: docsPages.title,
    },
  })
  .from(docsPages)
  .leftJoin(
    alias(docsPages, 'parent'),
    eq(docsPages.parentId, parent.id)
  );
```

---

## Testing

### Unit Tests

Create test files alongside source:

```typescript
// packages/database/src/__tests__/blog-posts.test.ts
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { db, blogPosts } from '../index';

describe('Blog Posts', () => {
  let testPostId: string;

  beforeAll(async () => {
    // Create test data
    const [post] = await db
      .insert(blogPosts)
      .values({
        title: 'Test Post',
        slug: 'test-post',
        content: 'Test content',
        status: 'draft',
      })
      .returning();

    testPostId = post.id;
  });

  afterAll(async () => {
    // Clean up test data
    await db.delete(blogPosts).where(eq(blogPosts.id, testPostId));
  });

  it('should create a blog post', async () => {
    const posts = await db
      .select()
      .from(blogPosts)
      .where(eq(blogPosts.id, testPostId));

    expect(posts).toHaveLength(1);
    expect(posts[0].title).toBe('Test Post');
  });

  it('should update a blog post', async () => {
    await db
      .update(blogPosts)
      .set({ title: 'Updated Title' })
      .where(eq(blogPosts.id, testPostId));

    const [post] = await db
      .select()
      .from(blogPosts)
      .where(eq(blogPosts.id, testPostId));

    expect(post.title).toBe('Updated Title');
  });
});
```

### Integration Tests

Test against real database:

```typescript
// apps/web/__tests__/blog.integration.test.ts
import { db, blogPosts, eq } from '@chronos/database';

describe('Blog Integration', () => {
  it('should fetch published posts', async () => {
    const posts = await db
      .select()
      .from(blogPosts)
      .where(eq(blogPosts.status, 'published'));

    // Assertions
    expect(posts.length).toBeGreaterThan(0);
    posts.forEach((post) => {
      expect(post.status).toBe('published');
      expect(post.publishedAt).toBeDefined();
    });
  });
});
```

---

## Troubleshooting

### Migration Conflicts

**Problem:** Migration file conflicts after pulling changes.

**Solution:**

```bash
# Pull latest
git pull origin develop

# Regenerate migrations
cd packages/database
rm -rf migrations/  # ⚠️ Only if you haven't applied locally
pnpm db:generate

# Or if already applied, create new migration
pnpm db:generate
```

### Type Errors

**Problem:** TypeScript complains about missing fields.

**Solution:**

```bash
# Regenerate types
cd packages/database
pnpm db:generate

# Restart TypeScript server in your editor
# VS Code: Cmd+Shift+P → "TypeScript: Restart TS Server"
```

### Connection Issues

**Problem:** Can't connect to database.

**Solution:**

```bash
# Check environment variables
echo $DB_HOST
echo $DB_PORT
echo $DB_USER

# Test connection
cd packages/database
pnpm exec tsx test-connection.ts

# Verify database is running
ssh ubuntu@16.52.210.100 -i <key>
docker ps | grep chronos-db
```

### Schema Drift

**Problem:** Database schema doesn't match code.

**Solution:**

```bash
# Check pending migrations
cd packages/database
pnpm db:generate  # Should show "No schema changes"

# If there are changes, apply them
pnpm db:migrate

# Or force push schema (⚠️ Dev only - bypasses migrations)
pnpm db:push
```

---

## Best Practices

### 1. Always Review Generated SQL

Before applying migrations:

```bash
pnpm db:generate
cat migrations/0003_xxx.sql  # Review this!
pnpm db:migrate
```

### 2. Use Transactions for Multiple Operations

```typescript
await db.transaction(async (tx) => {
  const [post] = await tx
    .insert(blogPosts)
    .values({ ... })
    .returning();

  await tx
    .insert(features)
    .values({ blogPostId: post.id, ... });
});
```

### 3. Always Update `updatedAt`

```typescript
await db
  .update(blogPosts)
  .set({
    title: 'New Title',
    updatedAt: new Date(), // Don't forget this!
  })
  .where(eq(blogPosts.id, id));
```

### 4. Use Indexes for Frequently Queried Columns

```typescript
// If you often query by category
(table) => ({
  categoryIdx: index('cms_blog_posts_category_idx').on(table.category),
})
```

### 5. Prefer Nullable Columns for Optional Data

```typescript
// Good
excerpt: text('excerpt'),  // nullable

// Avoid
excerpt: text('excerpt').notNull().default(''),  // Empty string is confusing
```

### 6. Use JSONB for Flexible Data

```typescript
// Tags array
tags: jsonb('tags').$type<string[]>().default([]),

// Metadata object
metadata: jsonb('metadata').$type<{ key: string; value: string }[]>(),
```

### 7. Keep Migrations Small and Focused

```typescript
// Good: One change per migration
// Migration 1: Add column
// Migration 2: Add index
// Migration 3: Add constraint

// Bad: Everything in one migration
// Migration 1: Add 10 columns, 5 indexes, 3 constraints
```

### 8. Test Queries Locally First

```bash
# Use Drizzle Studio to test queries
pnpm db:studio

# Or write a quick script
cat > test-query.ts << 'EOF'
import { db, blogPosts, eq } from './packages/database/src';
const posts = await db.select().from(blogPosts).where(eq(blogPosts.status, 'published'));
console.log(posts);
EOF

pnpm exec tsx test-query.ts
```

---

## Quick Reference

### Common Commands

```bash
# Generate migration
pnpm --filter @chronos/database db:generate

# Apply migrations
pnpm --filter @chronos/database db:migrate

# Visual database explorer
pnpm --filter @chronos/database db:studio

# Push schema (dev only, bypasses migrations)
pnpm --filter @chronos/database db:push
```

### Environment Variables

```bash
DB_HOST=16.52.210.100
DB_PORT=5432
DB_USER=chronos
DB_PASSWORD=<password>
DB_NAME=chronos
```

### Import Patterns

```typescript
// Database client and tables
import { db, blogPosts, docsPages } from '@chronos/database';

// Query operators
import { eq, and, or, not, like, ilike, gte, lte } from '@chronos/database';

// Sorting
import { desc, asc } from '@chronos/database';

// Aggregations
import { count, avg, sum, max, min } from 'drizzle-orm';

// Null checks
import { isNull, isNotNull } from '@chronos/database';

// Raw SQL
import { sql } from 'drizzle-orm';
```

---

**Document Version:** 1.0.0
**Last Updated:** 2025-12-21
**Maintainer:** Geoff Bevans <geoff@automatonicai.com>
