# @chronos/database

Drizzle ORM database layer for Project Chronos.

## Overview

This package provides type-safe database access using Drizzle ORM with PostgreSQL, including support for:

- **TimescaleDB** - Time-series data
- **PostGIS** - Geospatial queries
- **pgvector** - Vector similarity search
- **Apache AGE** - Graph database queries

## Installation

This package is part of the Project Chronos monorepo and is already installed via workspace dependencies.

```bash
# From monorepo root
pnpm install
```

## Configuration

Database connection is configured via environment variables:

```bash
# Required
DB_HOST=localhost
DB_PORT=5432
DB_USER=chronos
DB_PASSWORD=your_password
DB_NAME=chronos

# Optional
DB_SSL=false                # Enable SSL/TLS
DB_POOL_MAX=10             # Max connection pool size
DB_IDLE_TIMEOUT=30         # Idle timeout in seconds
DB_CONNECT_TIMEOUT=10      # Connection timeout in seconds
```

## Usage

### Basic Queries

```typescript
import { db, blogPosts, eq } from '@chronos/database';

// Select all published blog posts
const posts = await db
  .select()
  .from(blogPosts)
  .where(eq(blogPosts.status, 'published'));

// Insert a new blog post
const [post] = await db
  .insert(blogPosts)
  .values({
    title: 'Hello World',
    slug: 'hello-world',
    content: '# Hello World\n\nThis is my first post.',
    status: 'draft',
    author: 'Geoff Bevans',
  })
  .returning();

// Update a blog post
await db
  .update(blogPosts)
  .set({ status: 'published', publishedAt: new Date() })
  .where(eq(blogPosts.id, post.id));

// Delete a blog post
await db.delete(blogPosts).where(eq(blogPosts.id, post.id));
```

### Advanced Queries

```typescript
import { db, blogPosts, and, ilike, desc } from '@chronos/database';

// Search blog posts by title or content
const searchResults = await db
  .select()
  .from(blogPosts)
  .where(
    and(
      eq(blogPosts.status, 'published'),
      or(
        ilike(blogPosts.title, '%graph%'),
        ilike(blogPosts.content, '%graph%')
      )
    )
  )
  .orderBy(desc(blogPosts.publishedAt))
  .limit(10);
```

## Schema Management

### Generate Migrations

```bash
# From packages/database directory
pnpm db:generate
```

This creates a migration file in `./migrations/` based on schema changes.

### Apply Migrations

```bash
# Apply all pending migrations
pnpm db:migrate
```

### Push Schema (Development Only)

For rapid development, you can push schema changes directly to the database without generating migrations:

```bash
# WARNING: This bypasses migration history
pnpm db:push
```

### Drizzle Studio

Launch Drizzle Studio to visually explore your database:

```bash
pnpm db:studio
```

Opens at http://localhost:4983

## Schema Structure

### CMS Content Tables

All CMS-related tables use the `cms_` prefix:

- **`cms_blog_posts`** - Blog posts and news articles
- **`cms_docs_pages`** - Documentation pages
- **`cms_homepage_hero`** - Homepage hero content
- **`cms_features`** - Product features
- **`cms_announcements`** - Site-wide announcements
- **`cms_legal_pages`** - Legal documents (Terms, Privacy, etc.)

### Design Principles

1. **Drizzle owns the schema** - Schema is defined in TypeScript using Drizzle
2. **Directus introspects** - Directus reads the schema but doesn't modify it
3. **Prefixed tables** - `cms_*` for CMS content, `app_*` for application data
4. **Type safety** - Full TypeScript support with inferred types
5. **PostgreSQL native** - Leverages PostgreSQL features (JSONB, full-text search, etc.)

## Database Ownership

**Important:** This package manages CMS and application tables only.

- **Drizzle ORM** (this package) - Manages `cms_*` and `app_*` tables
- **Alembic** (`/alembic` directory) - Manages data warehouse tables (`raw_*`, `staging_*`)

Both migration systems coexist peacefully in the same PostgreSQL database.

## Connection Utilities

```typescript
import { testConnection, closeDatabase } from '@chronos/database';

// Test database connection (health check)
const isConnected = await testConnection();

// Gracefully close connection (shutdown)
await closeDatabase();
```

## TypeScript Support

All queries are fully type-safe:

```typescript
import { db, blogPosts } from '@chronos/database';

const posts = await db.select().from(blogPosts);

// TypeScript knows the shape of posts:
posts[0].title; // string
posts[0].publishedAt; // Date | null
posts[0].tags; // string[]
posts[0].invalidField; // ❌ TypeScript error
```

## Directus Integration

Directus will introspect these tables automatically:

1. Schema is defined here in Drizzle
2. Migrations are applied to PostgreSQL
3. Directus reads the schema on startup
4. Content editors manage content via Directus UI
5. Next.js fetches content from Directus API

**Flow:**
```
Drizzle Schema (source of truth)
  ↓ migration
PostgreSQL Database
  ↓ introspection
Directus CMS
  ↓ REST/GraphQL API
Next.js Application
```

## Development Workflow

1. **Define schema** in `src/schema/*.ts`
2. **Generate migration**: `pnpm db:generate`
3. **Review migration** in `migrations/` directory
4. **Apply migration**: `pnpm db:migrate`
5. **Restart Directus** to pick up schema changes
6. **Configure collections** in Directus UI (field display, validation, etc.)

## License

UNLICENSED - Proprietary to Project Chronos
