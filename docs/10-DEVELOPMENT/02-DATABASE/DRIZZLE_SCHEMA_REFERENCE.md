# Drizzle Schema Reference

**Complete reference for all CMS content tables in Project Chronos**

This document provides detailed documentation for each table in the CMS schema, including field descriptions, usage examples, and content strategy recommendations.

---

## Table of Contents

1. [cms_blog_posts](#cms_blog_posts)
2. [cms_docs_pages](#cms_docs_pages)
3. [cms_homepage_hero](#cms_homepage_hero)
4. [cms_features](#cms_features)
5. [cms_announcements](#cms_announcements)
6. [cms_legal_pages](#cms_legal_pages)
7. [Common Patterns](#common-patterns)

---

## cms_blog_posts

**Purpose:** Blog articles and news content with full publishing workflow.

**Use Cases:**
- Company blog posts
- Engineering blog
- Product updates
- News announcements
- Case studies
- Thought leadership articles

### Schema

```typescript
export const blogPosts = pgTable(
  'cms_blog_posts',
  {
    // Identity
    id: uuid('id').defaultRandom().primaryKey(),

    // Core Content
    title: varchar('title', { length: 255 }).notNull(),
    slug: varchar('slug', { length: 255 }).notNull().unique(),
    excerpt: text('excerpt'),
    content: text('content').notNull(),

    // Media
    featuredImage: varchar('featured_image', { length: 500 }),

    // Metadata
    author: varchar('author', { length: 100 }).notNull().default('Geoff Bevans'),
    category: varchar('category', { length: 50 }),
    tags: jsonb('tags').$type<string[]>().default([]),

    // SEO
    metaTitle: varchar('meta_title', { length: 60 }),
    metaDescription: varchar('meta_description', { length: 160 }),
    ogImage: varchar('og_image', { length: 500 }),

    // Publishing
    status: varchar('status', { length: 20 }).notNull().default('draft'),
    publishedAt: timestamp('published_at', { withTimezone: true }),
    featured: boolean('featured').notNull().default(false),

    // Analytics
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
```

### Field Reference

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | UUID | Yes | Primary key, auto-generated |
| `title` | VARCHAR(255) | Yes | Post title (displayed in listings and detail) |
| `slug` | VARCHAR(255) | Yes | URL-friendly identifier (e.g., "introducing-chronos") |
| `excerpt` | TEXT | No | Short summary for listings (150-300 chars recommended) |
| `content` | TEXT | Yes | Full post content (Markdown or HTML) |
| `featured_image` | VARCHAR(500) | No | URL to hero image |
| `author` | VARCHAR(100) | Yes | Author name (default: "Geoff Bevans") |
| `category` | VARCHAR(50) | No | Post category (e.g., "Engineering", "Product") |
| `tags` | JSONB | No | Array of tags (e.g., `["AI", "ML", "GraphDB"]`) |
| `meta_title` | VARCHAR(60) | No | SEO title (default: use `title`) |
| `meta_description` | VARCHAR(160) | No | SEO description (default: use `excerpt`) |
| `og_image` | VARCHAR(500) | No | Open Graph image (default: use `featured_image`) |
| `status` | VARCHAR(20) | Yes | `draft` or `published` |
| `published_at` | TIMESTAMP | No | Publication date/time (null for drafts) |
| `featured` | BOOLEAN | Yes | Show in featured posts section |
| `read_time_minutes` | INTEGER | No | Estimated read time (auto-calculated) |
| `view_count` | INTEGER | Yes | Page view counter (default: 0) |
| `created_at` | TIMESTAMP | Yes | Record creation timestamp |
| `updated_at` | TIMESTAMP | Yes | Last update timestamp |

### Status Values

```typescript
type BlogPostStatus = 'draft' | 'published' | 'archived';

// Draft: Visible only to editors
// Published: Live on public site
// Archived: Hidden but preserved
```

### Usage Examples

**Creating a Blog Post:**

```typescript
import { db, blogPosts } from '@chronos/database';

const newPost = await db.insert(blogPosts).values({
  title: 'Introducing Project Chronos',
  slug: 'introducing-project-chronos',
  excerpt: 'A new era of relationship intelligence for private markets.',
  content: `# Introducing Project Chronos\n\nToday we're excited to announce...`,
  featuredImage: 'https://media.automatonicai.com/blog/chronos-hero.jpg',
  author: 'Geoff Bevans',
  category: 'Product',
  tags: ['Launch', 'Product', 'Private Markets'],
  metaTitle: 'Introducing Project Chronos - Relationship Intelligence Platform',
  metaDescription: 'Discover how Chronos revolutionizes deal sourcing...',
  status: 'published',
  publishedAt: new Date(),
  featured: true,
  readTimeMinutes: 5,
}).returning();
```

**Querying Published Posts:**

```typescript
// Recent published posts
const recentPosts = await db
  .select({
    id: blogPosts.id,
    title: blogPosts.title,
    slug: blogPosts.slug,
    excerpt: blogPosts.excerpt,
    featuredImage: blogPosts.featuredImage,
    publishedAt: blogPosts.publishedAt,
  })
  .from(blogPosts)
  .where(eq(blogPosts.status, 'published'))
  .orderBy(desc(blogPosts.publishedAt))
  .limit(10);

// Featured posts for homepage
const featuredPosts = await db
  .select()
  .from(blogPosts)
  .where(
    and(
      eq(blogPosts.status, 'published'),
      eq(blogPosts.featured, true)
    )
  )
  .orderBy(desc(blogPosts.publishedAt))
  .limit(3);

// Posts by category
const engineeringPosts = await db
  .select()
  .from(blogPosts)
  .where(
    and(
      eq(blogPosts.status, 'published'),
      eq(blogPosts.category, 'Engineering')
    )
  )
  .orderBy(desc(blogPosts.publishedAt));
```

### Content Strategy

**Categories:**
- `Product` - Product updates, feature announcements
- `Engineering` - Technical deep dives, architecture
- `Company` - Company news, culture, hiring
- `Insights` - Market analysis, thought leadership
- `Tutorials` - How-to guides, best practices

**Tags:**
Use tags for cross-cutting themes:
- Technical: `AI`, `ML`, `GraphDB`, `TimescaleDB`, `PostgreSQL`
- Domain: `Private Equity`, `Venture Capital`, `M&A`
- Topics: `Deal Sourcing`, `Relationship Intelligence`, `Data Pipeline`

**SEO Best Practices:**
- `meta_title`: 50-60 characters, include primary keyword
- `meta_description`: 150-160 characters, compelling call-to-action
- `slug`: Lowercase, hyphens, descriptive (e.g., `how-to-source-deals-with-ai`)
- `featured_image`: High-quality, 1200x630px for social sharing

---

## cms_docs_pages

**Purpose:** Hierarchical documentation pages and general standalone content pages.

**Use Cases:**
- **Documentation:** API docs, user guides, technical reference
- **About Page:** Company overview, mission, team
- **Solutions Page:** Product offerings, use cases
- **Contact Page:** Contact information, form
- **Pricing Page:** Pricing tiers, features
- **Any standalone content page**

### Schema

```typescript
export const docsPages = pgTable(
  'cms_docs_pages',
  {
    // Identity
    id: uuid('id').defaultRandom().primaryKey(),

    // Core Content
    title: varchar('title', { length: 255 }).notNull(),
    slug: varchar('slug', { length: 255 }).notNull().unique(),
    content: text('content').notNull(),

    // Hierarchy (optional - null for standalone pages)
    parentId: uuid('parent_id').references(() => docsPages.id, { onDelete: 'set null' }),
    sortOrder: integer('sort_order').notNull().default(0),

    // Display
    icon: varchar('icon', { length: 50 }),
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
```

### Field Reference

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | UUID | Yes | Primary key |
| `title` | VARCHAR(255) | Yes | Page title |
| `slug` | VARCHAR(255) | Yes | URL path (e.g., "about", "solutions/private-equity") |
| `content` | TEXT | Yes | Page content (Markdown or HTML) |
| `parent_id` | UUID | No | Parent page ID (null for top-level pages) |
| `sort_order` | INTEGER | Yes | Display order in navigation (default: 0) |
| `icon` | VARCHAR(50) | No | Lucide icon name (e.g., "info", "lightbulb") |
| `description` | TEXT | No | Short description for navigation |
| `meta_title` | VARCHAR(60) | No | SEO title |
| `meta_description` | VARCHAR(160) | No | SEO description |
| `status` | VARCHAR(20) | Yes | `draft` or `published` |
| `published_at` | TIMESTAMP | No | Publication timestamp |
| `created_at` | TIMESTAMP | Yes | Creation timestamp |
| `updated_at` | TIMESTAMP | Yes | Last update timestamp |

### Usage Examples

#### Standalone Pages (About, Solutions, etc.)

**About Page:**

```typescript
await db.insert(docsPages).values({
  title: 'About Chronos',
  slug: 'about',
  content: `# About Chronos\n\n## Our Mission\n\nAt Chronos, we believe...`,
  parentId: null, // Top-level page
  icon: 'info',
  description: 'Learn about our mission and team',
  metaTitle: 'About Chronos - Relationship Intelligence Platform',
  metaDescription: 'Discover how Chronos is revolutionizing private markets...',
  status: 'published',
  publishedAt: new Date(),
  sortOrder: 10,
});
```

**Solutions Page:**

```typescript
await db.insert(docsPages).values({
  title: 'Solutions',
  slug: 'solutions',
  content: `# Our Solutions\n\n## For Private Equity\n\n...`,
  parentId: null,
  icon: 'lightbulb',
  description: 'Explore our solutions for different market segments',
  metaTitle: 'Solutions - Chronos Relationship Intelligence',
  status: 'published',
  publishedAt: new Date(),
  sortOrder: 20,
});
```

**Solutions Sub-page:**

```typescript
// First, get the parent Solutions page
const [solutionsPage] = await db
  .select()
  .from(docsPages)
  .where(eq(docsPages.slug, 'solutions'))
  .limit(1);

// Then create child page
await db.insert(docsPages).values({
  title: 'Private Equity Solutions',
  slug: 'solutions/private-equity',
  content: `# Private Equity Solutions\n\n## Deal Sourcing\n\n...`,
  parentId: solutionsPage.id, // Link to parent
  icon: 'trending-up',
  description: 'Relationship intelligence for PE firms',
  status: 'published',
  publishedAt: new Date(),
  sortOrder: 1, // First child
});
```

#### Hierarchical Documentation

**Documentation Structure:**

```
API Documentation (parent_id: null, sort_order: 1)
├── Getting Started (parent_id: API_ID, sort_order: 1)
│   ├── Authentication (parent_id: GS_ID, sort_order: 1)
│   └── Rate Limits (parent_id: GS_ID, sort_order: 2)
├── REST API (parent_id: API_ID, sort_order: 2)
│   ├── Deals Endpoint (parent_id: REST_ID, sort_order: 1)
│   └── Companies Endpoint (parent_id: REST_ID, sort_order: 2)
└── GraphQL API (parent_id: API_ID, sort_order: 3)
```

**Creating Hierarchy:**

```typescript
// 1. Create parent page
const [apiDocs] = await db.insert(docsPages).values({
  title: 'API Documentation',
  slug: 'docs/api',
  content: '# API Documentation\n\nWelcome to the Chronos API...',
  parentId: null,
  icon: 'code',
  status: 'published',
  publishedAt: new Date(),
  sortOrder: 1,
}).returning();

// 2. Create child section
const [gettingStarted] = await db.insert(docsPages).values({
  title: 'Getting Started',
  slug: 'docs/api/getting-started',
  content: '# Getting Started\n\nFollow these steps...',
  parentId: apiDocs.id,
  icon: 'rocket',
  status: 'published',
  publishedAt: new Date(),
  sortOrder: 1,
}).returning();

// 3. Create grandchild page
await db.insert(docsPages).values({
  title: 'Authentication',
  slug: 'docs/api/getting-started/authentication',
  content: '# Authentication\n\nAll API requests require...',
  parentId: gettingStarted.id,
  icon: 'key',
  status: 'published',
  publishedAt: new Date(),
  sortOrder: 1,
});
```

**Querying Hierarchical Pages:**

```typescript
// Get all top-level pages
const topLevelPages = await db
  .select()
  .from(docsPages)
  .where(
    and(
      isNull(docsPages.parentId),
      eq(docsPages.status, 'published')
    )
  )
  .orderBy(docsPages.sortOrder);

// Get children of a specific page
const children = await db
  .select()
  .from(docsPages)
  .where(
    and(
      eq(docsPages.parentId, parentPageId),
      eq(docsPages.status, 'published')
    )
  )
  .orderBy(docsPages.sortOrder);

// Get full navigation tree (requires recursive CTE or multiple queries)
const tree = await buildNavigationTree(); // Helper function

function async buildNavigationTree() {
  const topLevel = await db
    .select()
    .from(docsPages)
    .where(isNull(docsPages.parentId))
    .orderBy(docsPages.sortOrder);

  return Promise.all(
    topLevel.map(async (page) => ({
      ...page,
      children: await db
        .select()
        .from(docsPages)
        .where(eq(docsPages.parentId, page.id))
        .orderBy(docsPages.sortOrder),
    }))
  );
}
```

### Content Strategy

**Page Types in `cms_docs_pages`:**

1. **Documentation** (`parent_id` used for hierarchy)
   - API reference
   - User guides
   - Technical documentation

2. **Standalone Pages** (`parent_id = null`)
   - About
   - Solutions
   - Contact
   - Pricing
   - Team
   - Careers

3. **Solution Pages** (can be hierarchical)
   - Solutions (parent)
     - Private Equity (child)
     - Venture Capital (child)
     - Investment Banking (child)

**Icon Naming (Lucide):**
- `info` - About, general information
- `lightbulb` - Solutions, ideas
- `code` - API, technical docs
- `book-open` - User guides
- `users` - Team
- `briefcase` - Careers
- `mail` - Contact
- `trending-up` - Analytics, growth

---

## cms_homepage_hero

**Purpose:** Homepage hero section content (headline, CTA buttons, background media).

**Use Cases:**
- Homepage hero section
- Landing page hero (if multiple needed, add more rows)
- Campaign-specific heroes

### Schema

```typescript
export const homepageHero = pgTable('cms_homepage_hero', {
  id: uuid('id').defaultRandom().primaryKey(),

  // Text Content
  headline: varchar('headline', { length: 255 }).notNull(),
  subheadline: text('subheadline'),

  // Call-to-Actions
  ctaPrimaryText: varchar('cta_primary_text', { length: 50 }).notNull(),
  ctaPrimaryLink: varchar('cta_primary_link', { length: 255 }).notNull(),
  ctaSecondaryText: varchar('cta_secondary_text', { length: 50 }),
  ctaSecondaryLink: varchar('cta_secondary_link', { length: 255 }),

  // Media
  backgroundImage: varchar('background_image', { length: 500 }),
  backgroundVideo: varchar('background_video', { length: 500 }),

  // Status
  active: boolean('active').notNull().default(false),

  // Audit
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});
```

### Usage Example

```typescript
// Create hero content
await db.insert(homepageHero).values({
  headline: 'Relationship Intelligence for Private Markets',
  subheadline: 'Discover hidden connections and source deals faster with AI-powered graph analytics',
  ctaPrimaryText: 'Get Started',
  ctaPrimaryLink: '/signup',
  ctaSecondaryText: 'Watch Demo',
  ctaSecondaryLink: '/demo',
  backgroundImage: 'https://media.automatonicai.com/hero/graph-visualization.jpg',
  active: true,
});

// Query active hero
const [activeHero] = await db
  .select()
  .from(homepageHero)
  .where(eq(homepageHero.active, true))
  .limit(1);
```

**Best Practice:** Only one hero should be `active = true` at a time. Implement this in Directus UI or application logic.

---

## cms_features

**Purpose:** Product features for marketing pages.

**Use Cases:**
- Features page listing
- Homepage feature grid
- Solution-specific features

### Schema

```typescript
export const features = pgTable(
  'cms_features',
  {
    id: uuid('id').defaultRandom().primaryKey(),

    // Core Content
    title: varchar('title', { length: 255 }).notNull(),
    slug: varchar('slug', { length: 255 }).notNull().unique(),
    description: text('description').notNull(),

    // Visual
    icon: varchar('icon', { length: 50 }),
    image: varchar('image', { length: 500 }),

    // Organization
    category: varchar('category', { length: 50 }),
    sortOrder: integer('sort_order').notNull().default(0),
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
```

### Usage Example

```typescript
// Create features
await db.insert(features).values([
  {
    title: 'Graph Analytics',
    slug: 'graph-analytics',
    description: 'Visualize relationships between companies, investors, and deals using Apache AGE graph database',
    icon: 'network',
    category: 'Analytics',
    sortOrder: 1,
    enabled: true,
  },
  {
    title: 'AI-Powered Sourcing',
    slug: 'ai-sourcing',
    description: 'Discover hidden deal opportunities with machine learning and vector similarity search',
    icon: 'sparkles',
    category: 'AI',
    sortOrder: 2,
    enabled: true,
  },
]);

// Query by category
const analyticsFeatures = await db
  .select()
  .from(features)
  .where(
    and(
      eq(features.category, 'Analytics'),
      eq(features.enabled, true)
    )
  )
  .orderBy(features.sortOrder);
```

---

## cms_announcements

**Purpose:** Site-wide announcements and notifications.

**Use Cases:**
- Product launch banners
- Maintenance notifications
- Event announcements
- Special offers

### Schema

```typescript
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
    type: varchar('type', { length: 20 }).notNull().default('info'),
    placement: varchar('placement', { length: 20 }).notNull().default('banner'),
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
```

### Usage Example

```typescript
// Create scheduled announcement
await db.insert(announcements).values({
  title: '🚀 New Feature Launch',
  message: 'Introducing AI-powered deal recommendations!',
  link: '/blog/ai-recommendations',
  linkText: 'Learn More',
  type: 'success',
  placement: 'banner',
  dismissible: true,
  startsAt: new Date('2025-12-25T00:00:00Z'),
  endsAt: new Date('2025-12-31T23:59:59Z'),
  active: true,
});

// Query active announcements
const now = new Date();
const activeAnnouncements = await db
  .select()
  .from(announcements)
  .where(
    and(
      eq(announcements.active, true),
      lte(announcements.startsAt, now),
      or(
        isNull(announcements.endsAt),
        gte(announcements.endsAt, now)
      )
    )
  );
```

**Types:** `info`, `warning`, `success`, `error`
**Placements:** `banner`, `modal`, `toast`

---

## cms_legal_pages

**Purpose:** Legal documents with versioning.

**Use Cases:**
- Terms of Service
- Privacy Policy
- Cookie Policy
- Acceptable Use Policy

### Schema

```typescript
export const legalPages = pgTable(
  'cms_legal_pages',
  {
    id: uuid('id').defaultRandom().primaryKey(),

    // Core Content
    title: varchar('title', { length: 255 }).notNull(),
    slug: varchar('slug', { length: 255 }).notNull().unique(),
    content: text('content').notNull(),

    // Versioning
    version: varchar('version', { length: 20 }).notNull(),
    effectiveDate: timestamp('effective_date', { withTimezone: true }).notNull(),

    // Publishing
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
```

### Usage Example

```typescript
await db.insert(legalPages).values({
  title: 'Terms of Service',
  slug: 'terms',
  content: `# Terms of Service\n\nLast Updated: December 21, 2025\n\n...`,
  version: '2.0',
  effectiveDate: new Date('2025-12-21'),
  status: 'published',
  publishedAt: new Date(),
});
```

---

## Common Patterns

### Publishing Workflow

All content tables follow this pattern:

```typescript
// Save as draft
const [draft] = await db.insert(blogPosts).values({
  title: 'New Post',
  slug: 'new-post',
  content: 'Content here...',
  status: 'draft',
  publishedAt: null, // Not published yet
}).returning();

// Publish
await db
  .update(blogPosts)
  .set({
    status: 'published',
    publishedAt: new Date(),
    updatedAt: new Date(),
  })
  .where(eq(blogPosts.id, draft.id));

// Unpublish
await db
  .update(blogPosts)
  .set({
    status: 'draft',
    updatedAt: new Date(),
  })
  .where(eq(blogPosts.id, draft.id));
```

### SEO Fields

Standard SEO pattern across tables:

```typescript
{
  metaTitle: 'Page Title - Brand Name', // 50-60 chars
  metaDescription: 'Compelling description with keywords...', // 150-160 chars
  ogImage: 'https://media.automatonicai.com/og/image.jpg', // 1200x630px
}
```

### Timestamps

All tables include audit timestamps:

```typescript
{
  createdAt: new Date(), // Auto-set on creation
  updatedAt: new Date(), // Update on every change
}
```

Update pattern:

```typescript
await db
  .update(table)
  .set({
    ...updates,
    updatedAt: new Date(), // Always update this
  })
  .where(eq(table.id, id));
```

---

**Document Version:** 1.0.0
**Last Updated:** 2025-12-21
**Maintainer:** Geoff Bevans <geoff@automatonicai.com>
