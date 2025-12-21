# ADR-018: Directus CMS Selection and Integration Strategy

**Status:** Proposed
**Date:** 2025-12-21
**Decision Makers:** Geoff Bevans
**Supersedes:** ADR-012 (Payload CMS decision - partially)
**Related Tickets:** TBD (Epic for Directus integration)

---

## Context

Project Chronos is a **multi-modal data analysis platform** for IB/PE/VC professionals, with a core value proposition centered on PostgreSQL's advanced extensions (TimescaleDB, PostGIS, pgvector, Apache AGE). The platform requires a CMS solution for:

1. **Marketing content management** - Blog posts, documentation, announcements, legal pages
2. **Admin UI** for non-technical users to manage content
3. **Type-safe content delivery** to Next.js frontend (React Server Components)

### Current Architecture (Pre-CMS)

**Five-layer architecture:**

```
Layer 1: Database (PostgreSQL 16.4 + Extensions)
  └─ TimescaleDB, PostGIS, pgvector, Apache AGE
  └─ Single source of truth for all data

Layer 2: Data Access (Drizzle ORM + Zod)
  └─ Type-safe schema definitions
  └─ Runtime validation

Layer 3: Edge API (Hono + tRPC on Cloudflare Workers)
  └─ Type-safe API endpoints
  └─ Server Actions for mutations

Layer 4: Frontend (Next.js 15 App Router on Cloudflare Pages)
  └─ Server Components (RSC) for data fetching
  └─ Client Components for interactivity

Layer 5: CMS / Admin (TO BE DETERMINED)
  └─ Separate Node.js app on AWS Lightsail VM
  └─ Must connect to central PostgreSQL database
```

### Critical Constraints

1. **Single PostgreSQL Database** - The CMS must use the same PostgreSQL instance, not require a separate database
2. **PostgreSQL Extensions are Sacrosanct** - TimescaleDB, PostGIS, pgvector, and Apache AGE are core to the platform's value proposition
3. **Drizzle ORM is the Source of Truth** - Application schema must be defined in Drizzle, not owned by the CMS
4. **Type Safety Throughout** - Drizzle → Zod → tRPC → Next.js type flow must be preserved
5. **Edge Deployment** - Next.js runs on Cloudflare Pages; CMS runs on separate Lightsail VM
6. **Data-First Philosophy** - The database's multi-modal capabilities (graph, vector, spatial, time-series) are the competitive moat

### The Core Decision: Payload vs. Directus

After comprehensive analysis, the choice is between two self-hosted, open-source solutions:

**Payload CMS:**
- Built on Next.js, TypeScript-native
- Code-first schema definition (Payload collections → database)
- Deep Next.js integration (can run in same process)
- Payload owns the schema definition

**Directus:**
- Database-first CMS (introspects existing schema)
- SQL-native, wraps PostgreSQL tables
- Separate Node.js application
- Database owns the schema definition

---

## Decision

**We will adopt Directus CMS** for the following reasons:

### 1. Database-First Philosophy Alignment

**Directus:**
- Introspects your existing PostgreSQL schema
- Wraps tables/columns that already exist
- Drizzle schema remains the single source of truth
- Adds metadata tables (`directus_*`) but doesn't touch application tables

**Payload:**
- Defines schema in code (collections)
- Generates database tables from collection definitions
- Becomes the source of truth for CMS-managed content
- Would create dual schema ownership (Payload for CMS, Drizzle for app)

**Verdict:** For a platform where "the database is the product," Directus's database-first approach is architecturally correct.

### 2. PostgreSQL Extension Respect

**Directus:**
- SQL-native, doesn't abstract PostgreSQL features
- Custom endpoints can leverage any PostgreSQL extension
- PostGIS columns are recognized and manageable
- Can build Directus extensions for:
  - Graph visualization (Apache AGE)
  - Vector search interfaces (pgvector)
  - Spatial data management (PostGIS)
  - Time-series dashboards (TimescaleDB)

**Payload:**
- Abstracts database through adapter layer
- Simplified query API doesn't expose extension-specific features
- Advanced queries (PostGIS spatial, pgvector similarity, Apache AGE graph) require bypassing Payload entirely

**Verdict:** Directus enhances PostgreSQL capabilities; Payload would hide them.

### 3. Type Safety and Drizzle Integration

**Directus:**
- Your Next.js app continues using: `Drizzle → Zod → tRPC → Frontend`
- Directus SDK provides optional types but doesn't force their use
- Marketing content (blog posts) uses Directus SDK in RSCs
- Product data (deals, investors) uses existing Drizzle/tRPC stack
- Clean separation of concerns

**Payload:**
- Generates TypeScript types from collection definitions
- Creates type fragmentation (Payload types for CMS, Drizzle types for app)
- tRPC router would need Payload types for CMS operations
- Breaks unified type flow

**Verdict:** Directus preserves the existing type-safe architecture.

### 4. Migration Strategy Compatibility

**Current Plan:**
- **Option C: Dual Migrations**
  - Application schema (deals, companies, investors) → Drizzle migrations
  - Data warehouse schema (raw imports, staging) → Alembic migrations (Python)
  - CMS content schema → ?

**With Directus:**
- CMS content tables defined in Drizzle
- Directus introspects and provides admin UI
- All migrations stay in Drizzle (or Drizzle + Alembic)
- Single migration strategy

**With Payload:**
- CMS content tables defined in Payload collections
- Would require **triple migration strategy** (Drizzle + Alembic + Payload)
- Schema fragmentation

**Verdict:** Directus maintains migration coherence.

### 5. Next.js Integration Patterns

**Payload (Stronger Integration):**
- Runs in same Next.js process
- Zero HTTP overhead (Local API)
- Server Components call Payload directly
- Built-in auth integrates with Next.js middleware

**Directus (Explicit Integration):**
- Runs as separate Node.js process (Lightsail VM)
- Next.js calls Directus via HTTP (SDK)
- Clear separation: Next.js on Edge, Directus on VM
- HTTP overhead for content fetching

**Trade-off Analysis:**

For traditional CMS use cases (blog posts, docs, marketing pages):
- Content is fetched during build (SSG) or on server (RSC)
- HTTP overhead is ~10-50ms (negligible for admin dashboards)
- Benefit: Clean architectural separation

For the product's core data (deals, investors, relationships):
- Fetched via existing Drizzle/tRPC stack (unchanged)
- No Directus involved
- No performance impact

**Verdict:** The HTTP overhead is acceptable for CMS content and preserves architectural clarity.

---

## Architecture Integration

### System Diagram with Directus

```
┌─────────────────────────────────────────────────────────┐
│                    AWS Lightsail VM                     │
│  ┌──────────────────────┐   ┌──────────────────────┐   │
│  │   Directus Admin     │   │  PostgreSQL 16.4     │   │
│  │   (Node.js)          │───│  + Extensions        │   │
│  │   Port: 8055         │   │  - TimescaleDB       │   │
│  │                      │   │  - PostGIS           │   │
│  │   Collections:       │   │  - pgvector          │   │
│  │   - blog_posts       │   │  - Apache AGE        │   │
│  │   - docs_pages       │   │                      │   │
│  │   - announcements    │   │  Tables:             │   │
│  │                      │   │  - directus_* (meta) │   │
│  └──────────────────────┘   │  - blog_posts        │   │
│                              │  - deals (Drizzle)   │   │
│                              │  - investors         │   │
│                              │  - companies         │   │
│                              └──────────────────────┘   │
└─────────────────────────────────────────────────────────┘
                              ▲
                              │ PostgreSQL protocol (5432)
                              │ HTTP API (8055)
                              │
┌─────────────────────────────┴───────────────────────────┐
│              Cloudflare Pages / Workers                 │
│  ┌──────────────────────────────────────────────────┐   │
│  │  Next.js App (App Router)                        │   │
│  │                                                   │   │
│  │  Marketing Pages (RSC):                          │   │
│  │  ┌─────────────────────────────────────────┐    │   │
│  │  │ import { createDirectus } from '@directus/sdk'│   │
│  │  │ const content = await directus.request(...)   │   │
│  │  │ return <BlogPost {...content} />          │    │   │
│  │  └─────────────────────────────────────────┘    │   │
│  │                                                   │   │
│  │  Product Pages (RSC):                            │   │
│  │  ┌─────────────────────────────────────────┐    │   │
│  │  │ import { db } from '@chronos/database'    │    │   │
│  │  │ const deals = await db.select().from(deals) │ │   │
│  │  │ return <Dashboard deals={deals} />        │   │   │
│  │  └─────────────────────────────────────────┘    │   │
│  └──────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
```

### Data Flow Examples

#### Marketing Content (Blog Post)

```typescript
// app/blog/[slug]/page.tsx (Next.js RSC)
import { createDirectus, rest, readItems } from '@directus/sdk';

async function getBlogPost(slug: string) {
  const directus = createDirectus(process.env.DIRECTUS_URL!).with(rest());

  return await directus.request(
    readItems('blog_posts', {
      filter: { slug: { _eq: slug } },
      fields: ['title', 'content', 'author', 'published_at']
    })
  );
}

export default async function BlogPostPage({ params }: { params: { slug: string } }) {
  const post = await getBlogPost(params.slug);

  return (
    <article>
      <h1>{post.title}</h1>
      <div className="prose" dangerouslySetInnerHTML={{ __html: post.content }} />
    </article>
  );
}
```

**Flow:**
1. Next.js RSC calls Directus SDK (HTTP request)
2. Directus queries PostgreSQL `blog_posts` table
3. Returns JSON content
4. React renders with shadcn/ui components

#### Product Data (Deal Dashboard)

```typescript
// app/dashboard/page.tsx (Next.js RSC)
import { db } from '@chronos/database'; // Drizzle instance
import { deals, companies, investors } from '@chronos/database/schema';
import { eq } from 'drizzle-orm';

export default async function DashboardPage() {
  // Unchanged Drizzle query
  const recentDeals = await db
    .select()
    .from(deals)
    .leftJoin(companies, eq(deals.companyId, companies.id))
    .limit(10);

  // Advanced PostgreSQL query (Apache AGE graph)
  const stakeholderNetwork = await db.execute(sql`
    SELECT * FROM ag_catalog.cypher('deal_graph', $$
      MATCH (investor)-[:INVESTED_IN]->(deal)-[:INVOLVES]->(company)
      RETURN investor, deal, company
    $$) as (investor agtype, deal agtype, company agtype);
  `);

  return <DashboardView deals={recentDeals} network={stakeholderNetwork} />;
}
```

**Flow:**
1. Next.js RSC calls Drizzle ORM (no HTTP)
2. Drizzle queries PostgreSQL directly (via Cloudflare Hyperdrive)
3. Leverages Apache AGE extension for graph queries
4. Returns type-safe data to component

**Key Insight:** Directus is NOT involved in product data access. It's only for marketing/admin content.

---

## Content Strategy

### What Goes in Directus (Dynamic Content)

**Fully managed in Directus:**
- Blog posts (title, content, author, published_at)
- Documentation pages (help articles, tutorials)
- Announcements (product updates, news)
- FAQ items
- Email templates
- Legal pages (Terms of Service, Privacy Policy)

**Directus Collection Schema:**

```typescript
// Defined in Drizzle, introspected by Directus

export const blogPosts = pgTable('blog_posts', {
  id: uuid('id').primaryKey().defaultRandom(),
  slug: text('slug').notNull().unique(),
  title: text('title').notNull(),
  content: text('content').notNull(), // Rich text (HTML)
  excerpt: text('excerpt'),
  author_id: uuid('author_id').references(() => users.id),
  published_at: timestamp('published_at'),
  status: text('status').$type<'draft' | 'published' | 'archived'>().default('draft'),
  created_at: timestamp('created_at').defaultNow(),
  updated_at: timestamp('updated_at').defaultNow(),
});

export const docsPages = pgTable('docs_pages', {
  id: uuid('id').primaryKey().defaultRandom(),
  slug: text('slug').notNull().unique(),
  title: text('title').notNull(),
  content: text('content').notNull(),
  category: text('category'), // "Getting Started", "API Reference", etc.
  order: integer('order').default(0),
  status: text('status').$type<'draft' | 'published'>().default('draft'),
});
```

### What's Hardcoded in Next.js (App Functionality)

**Structure and components:**
- Page layouts (React components)
- Navigation structure
- Component composition
- Styling (Tailwind classes)
- Interactive features (forms, calculators)

### Hybrid Approach (Structure + Content)

**Homepage example:**

```typescript
// app/page.tsx
import { getHeroContent, getFeatures } from '@/lib/directus';
import { HeroSection } from '@/components/marketing/hero';
import { FeaturesGrid } from '@/components/marketing/features';

export default async function HomePage() {
  // Content from Directus
  const hero = await getHeroContent();
  const features = await getFeatures();

  return (
    <>
      {/* React structure, Directus content */}
      <HeroSection
        headline={hero.headline}
        subtitle={hero.subtitle}
        ctaText={hero.cta_text}
        backgroundImage={hero.background_image}
      />

      {/* React grid, Directus data */}
      <FeaturesGrid features={features} columns={3} />
    </>
  );
}
```

**Directus collection:**

```typescript
export const homepageHero = pgTable('homepage_hero', {
  id: uuid('id').primaryKey().defaultRandom(),
  headline: text('headline').notNull(),
  subtitle: text('subtitle'),
  cta_text: text('cta_text').default('Get Started'),
  cta_link: text('cta_link').default('/contact'),
  background_image: text('background_image'), // URL or file reference
});

export const features = pgTable('features', {
  id: uuid('id').primaryKey().defaultRandom(),
  title: text('title').notNull(),
  description: text('description'),
  icon_name: text('icon_name'), // "database", "graph", "chart"
  category: text('category'), // "Data", "Analytics", "Integration"
  sort_order: integer('sort_order').default(0),
  status: text('status').$type<'draft' | 'published'>().default('published'),
});
```

**What marketing can edit:** Headlines, CTA text, feature descriptions, images
**What requires a developer:** Layout changes, new sections, component modifications

---

## Migration Strategy: Alembic + Drizzle Coexistence

### The Dual Migration Pattern

Given the existing Python backend and new TypeScript frontend, we adopt **Option C: Dual Migrations**:

**Drizzle Migrations (Application Schema):**
- User-facing tables: `deals`, `companies`, `investors`, `blog_posts`, `features`
- Defined in `packages/database/src/schema/*.ts`
- Migrations: `drizzle-kit generate:pg` → `drizzle-kit push:pg`

**Alembic Migrations (Data Warehouse Schema):**
- ETL/staging tables: `raw_companies`, `staging_crunchbase`, `timeseries_metrics`
- Defined in `alembic/versions/*.py`
- Migrations: `alembic revision --autogenerate` → `alembic upgrade head`

**Clear Boundaries:**
- If **Next.js frontend** accesses it → Drizzle schema
- If **Python ETL/ML** pipeline creates it → Alembic schema
- Some tables (e.g., `companies`) may be:
  - **Schema**: Defined by Drizzle
  - **Reads**: Both Drizzle (frontend) and SQLAlchemy (Python)
  - **Writes (structure)**: Drizzle migrations only
  - **Writes (data)**: Both (inserts/updates from Python ETL, user edits from frontend)

### Example Workflow

```
External Data (Crunchbase API, PitchBook CSV)
  ↓
Python ETL Script (pandas)
  ↓
PostgreSQL `raw_companies` table (Alembic schema)
  ↓
Python Transformation (data cleaning, normalization)
  ↓
PostgreSQL `companies` table (Drizzle schema, Python inserts)
  ↓
Next.js Dashboard (Drizzle ORM reads)
  ↓
User sees company data in React UI
```

**Migration discipline:**
- Never let both Alembic and Drizzle manage the same table's structure
- Document which system owns each table in `docs/DATABASE_SCHEMA_OWNERSHIP.md`

---

## Implementation Plan

### Phase 1: Directus Setup (Sprint 1)

**Story Points:** 8
**Timeline:** 1 sprint

| Task | Description | Points |
|------|-------------|--------|
| CHRONOS-XXX-1 | Install Directus on Lightsail VM | 2 |
| CHRONOS-XXX-2 | Configure Directus to connect to PostgreSQL | 2 |
| CHRONOS-XXX-3 | Create initial collections (blog_posts, docs_pages) | 2 |
| CHRONOS-XXX-4 | Set up Directus admin users and roles | 1 |
| CHRONOS-XXX-5 | Configure Directus API access (CORS, authentication) | 1 |

**Success Criteria:**
- ✅ Directus admin UI accessible at `https://admin.automatonicai.com`
- ✅ Connected to PostgreSQL database
- ✅ Blog posts collection visible and manageable
- ✅ API endpoints accessible from Next.js (test with curl)

### Phase 2: Drizzle Schema Definition (Sprint 1-2)

**Story Points:** 13
**Timeline:** 1-2 sprints

| Task | Description | Points |
|------|-------------|--------|
| CHRONOS-XXX-6 | Set up Drizzle ORM in `packages/database` | 3 |
| CHRONOS-XXX-7 | Define content schema (blog_posts, docs_pages, features) | 3 |
| CHRONOS-XXX-8 | Define application schema (deals, companies, investors) | 5 |
| CHRONOS-XXX-9 | Generate Drizzle migrations and apply to PostgreSQL | 2 |

**Success Criteria:**
- ✅ Drizzle schema files in `packages/database/src/schema/`
- ✅ Migrations applied to PostgreSQL
- ✅ Directus auto-discovers tables
- ✅ Types exported and available to Next.js app

### Phase 3: Next.js Integration (Sprint 2)

**Story Points:** 13
**Timeline:** 1 sprint

| Task | Description | Points |
|------|-------------|--------|
| CHRONOS-XXX-10 | Install Directus SDK in Next.js app | 1 |
| CHRONOS-XXX-11 | Create utility functions for Directus queries | 2 |
| CHRONOS-XXX-12 | Build blog post listing and detail pages | 5 |
| CHRONOS-XXX-13 | Build homepage with dynamic content from Directus | 3 |
| CHRONOS-XXX-14 | Implement ISR (Incremental Static Regeneration) | 2 |

**Success Criteria:**
- ✅ Blog posts render from Directus content
- ✅ Homepage hero/features fetched from Directus
- ✅ Content updates in Directus appear on site within 60 seconds (ISR)
- ✅ Type-safe content queries (Directus SDK types)

### Phase 4: Content Migration and Expansion (Sprint 3)

**Story Points:** 8
**Timeline:** 1 sprint

| Task | Description | Points |
|------|-------------|--------|
| CHRONOS-XXX-15 | Create documentation collection and pages | 3 |
| CHRONOS-XXX-16 | Build documentation site (docs.automatonicai.com) | 3 |
| CHRONOS-XXX-17 | Set up announcement banner system | 2 |

**Success Criteria:**
- ✅ 10+ blog posts published via Directus
- ✅ Documentation site live with search functionality
- ✅ Announcement banners manageable by marketing team

---

## Technical Specifications

### Directus Configuration

**Deployment:**
- Host: AWS Lightsail VM (same as PostgreSQL)
- Port: 8055 (internal), 443 (public via Nginx reverse proxy)
- Domain: `admin.automatonicai.com`
- Docker: `directus/directus:latest` (official image)

**Environment Variables:**

```bash
# .env (Directus)
DB_CLIENT=pg
DB_HOST=localhost
DB_PORT=5432
DB_DATABASE=chronos
DB_USER=directus_user
DB_PASSWORD=<secure-password>

PUBLIC_URL=https://admin.automatonicai.com
ADMIN_EMAIL=geoff@automatonicai.com
ADMIN_PASSWORD=<secure-password>

# CORS for Next.js
CORS_ENABLED=true
CORS_ORIGIN=https://automatonicai.com,https://www.automatonicai.com

# Storage (Cloudflare R2 - zero egress fees)
STORAGE_LOCATIONS=r2
STORAGE_R2_DRIVER=s3
STORAGE_R2_KEY=<r2-access-key-id>
STORAGE_R2_SECRET=<r2-secret-access-key>
STORAGE_R2_BUCKET=chronos-media
STORAGE_R2_ENDPOINT=https://<account-id>.r2.cloudflarestorage.com
STORAGE_R2_REGION=auto
STORAGE_R2_PUBLIC_URL=https://media.automatonicai.com

# Cache
CACHE_ENABLED=true
CACHE_STORE=redis
REDIS_HOST=localhost
REDIS_PORT=6379
```

### Next.js Integration

**Directus SDK Setup:**

```typescript
// lib/directus.ts
import { createDirectus, rest, readItems, readItem } from '@directus/sdk';

type DirectusSchema = {
  blog_posts: BlogPost[];
  docs_pages: DocsPage[];
  features: Feature[];
  homepage_hero: HomepageHero[];
};

const directus = createDirectus<DirectusSchema>(process.env.DIRECTUS_URL!)
  .with(rest());

export async function getBlogPosts() {
  return await directus.request(
    readItems('blog_posts', {
      filter: { status: { _eq: 'published' } },
      sort: ['-published_at'],
      limit: 10,
    })
  );
}

export async function getBlogPost(slug: string) {
  const posts = await directus.request(
    readItems('blog_posts', {
      filter: { slug: { _eq: slug } },
      limit: 1,
    })
  );
  return posts[0];
}

export async function getFeatures() {
  return await directus.request(
    readItems('features', {
      filter: { status: { _eq: 'published' } },
      sort: ['sort_order'],
    })
  );
}
```

**ISR Configuration:**

```typescript
// app/blog/[slug]/page.tsx
export const revalidate = 60; // Revalidate every 60 seconds

export async function generateStaticParams() {
  const posts = await getBlogPosts();
  return posts.map((post) => ({ slug: post.slug }));
}

export default async function BlogPostPage({ params }: { params: { slug: string } }) {
  const post = await getBlogPost(params.slug);

  if (!post) {
    notFound();
  }

  return <BlogPostView post={post} />;
}
```

---

## Developer Experience

### Content Editor Workflow (Non-Technical Users)

1. **Login to Directus Admin**
   - Navigate to `https://admin.automatonicai.com`
   - Login with credentials

2. **Create Blog Post**
   - Click "Blog Posts" collection
   - Click "Create New"
   - Fill in: Title, Slug, Content (WYSIWYG editor), Author
   - Set status to "Published"
   - Click "Save"

3. **View on Site**
   - Navigate to `https://automatonicai.com/blog/[slug]`
   - Post appears within 60 seconds (ISR revalidation)

**No developer involvement required.**

### Developer Workflow (Schema Changes)

1. **Add New Field to Collection**
   - Update Drizzle schema: `packages/database/src/schema/content.ts`
   - Add field: `featured: boolean('featured').default(false)`
   - Generate migration: `pnpm drizzle-kit generate:pg`
   - Apply migration: `pnpm drizzle-kit push:pg`

2. **Directus Auto-Discovers**
   - Refresh Directus admin
   - New field appears in collection
   - No Directus configuration needed

3. **Update Next.js Component**
   - Import types: `import { BlogPost } from '@chronos/database/schema'`
   - Use new field: `{post.featured && <Badge>Featured</Badge>}`
   - TypeScript validates at compile-time

**Schema changes flow: Drizzle → PostgreSQL → Directus → Next.js**

---

## Performance Considerations

### HTTP Overhead Analysis

**Directus API call from Next.js RSC:**
- Average latency: 10-30ms (same AWS region)
- Acceptable for:
  - Build-time fetching (SSG)
  - Server-side rendering (RSC)
  - Admin dashboards (infrequent)

**Not acceptable for:**
- Real-time data (use Drizzle direct)
- High-frequency polling (use WebSockets or Drizzle)
- Critical path user interactions (use tRPC/Server Actions)

**Mitigation strategies:**
1. **Caching:** Directus built-in cache (Redis)
2. **ISR:** Revalidate static pages every 60 seconds
3. **Edge Caching:** Cloudflare CDN caches responses
4. **Selective Fetching:** Only fetch CMS content where needed

### Database Load

**Directus queries:**
- Marketing content: Low read volume (<100 queries/day)
- Writes: Infrequent (new blog posts)

**Drizzle queries (product data):**
- Dealflow dashboards: High read volume (1000s queries/day)
- Writes: Frequent (user actions, ETL updates)

**Isolation:** Directus and Drizzle access different tables, no contention.

---

## Security Considerations

### Directus Admin Access

**Authentication:**
- Directus built-in auth (email/password)
- Optional: SSO via OAuth (Google Workspace)
- Role-based access control (RBAC)
  - **Admin:** Full access (Geoff)
  - **Editor:** Can publish content (marketing team)
  - **Reviewer:** Can draft but not publish

**Network Security:**
- Directus admin on separate subdomain: `admin.automatonicai.com`
- Nginx reverse proxy with SSL/TLS
- Fail2ban for brute force protection
- VPN access recommended for admin panel (optional)

### API Security

**Public API endpoints:**
- Read-only access to published content
- CORS restricted to `automatonicai.com` domain
- Rate limiting: 100 requests/minute per IP

**Private API endpoints:**
- Require authentication tokens
- Used only for content management (admin workflows)

### Data Separation

**CMS content tables:**
- `blog_posts`, `docs_pages`, `features`, `homepage_hero`
- Safe to expose via Directus API

**Product data tables:**
- `deals`, `companies`, `investors`, `transactions`
- **NEVER** exposed via Directus API
- Only accessible via authenticated tRPC/Hono endpoints

---

## Cost Analysis

### Directus Hosting

| Component | Service | Monthly Cost |
|-----------|---------|--------------|
| **Directus App** | Lightsail VM (existing) | $0 (shared) |
| **PostgreSQL** | Lightsail VM (existing) | $0 (shared) |
| **Redis Cache** | Lightsail VM (existing) | $0 (shared) |
| **R2 Media Storage** | Cloudflare R2 | ~$1.50 (100 GB storage) |
| **R2 Egress** | Cloudflare R2 | **$0 (ZERO!)** |
| **Total** | | **~$1.50/month** |

**Note:** Directus runs on the same Lightsail VM as PostgreSQL and the Python backend, so there's no additional hosting cost. Cloudflare R2 is used instead of AWS S3 to eliminate egress fees (AWS S3 charges ~$0.09/GB for data transfer, which would cost $9/month for 100GB of traffic vs. R2's $0).

### Comparison vs. SaaS Alternatives

| CMS | Monthly Cost | Limitations |
|-----|--------------|-------------|
| **Directus (self-hosted)** | ~$5 | None |
| **Contentful** | $300+ | 25k records, 1M API calls |
| **Sanity** | $99+ | 100k documents, bandwidth limits |
| **Strapi Cloud** | $99+ | 100k records |

**Verdict:** Self-hosted Directus is 20-60x cheaper than SaaS alternatives with no artificial limits.

---

## Risks and Mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| **Directus version upgrades** | Medium | Medium | Pin Directus version in Docker, test upgrades in staging |
| **HTTP latency for content** | Low | Low | Use ISR, Redis caching, Cloudflare CDN |
| **Learning curve (Directus)** | Low | Low | Excellent documentation, intuitive admin UI |
| **Directus extension limitations** | Medium | Low | Can build custom API endpoints in Directus |
| **PostgreSQL extension conflicts** | Low | Medium | Directus doesn't modify extensions; tested compatibility |
| **Dual migration complexity** | Medium | Medium | Strict ownership rules, documentation in `DATABASE_SCHEMA_OWNERSHIP.md` |

---

## Success Metrics

### Phase 1 (Directus Setup)
- ✅ Directus operational on Lightsail VM
- ✅ Blog posts collection functional
- ✅ Marketing team can publish content without developer

### Phase 2 (Next.js Integration)
- ✅ Blog posts rendering from Directus
- ✅ Homepage dynamic content from Directus
- ✅ <60 second content update latency (ISR)

### Phase 3 (Full Adoption)
- ✅ 10+ blog posts published via Directus
- ✅ Documentation site live
- ✅ Marketing team autonomous (zero developer blockers for content)

---

## Future Enhancements

### Potential Additions

1. **Custom Directus Extensions**
   - Graph visualization panel (Apache AGE)
   - Vector search interface (pgvector)
   - Spatial data map view (PostGIS)

2. **Webhooks for Automation**
   - Trigger Next.js revalidation on content publish
   - Post to Slack when blog post published
   - Auto-generate social media images

3. **Advanced Workflows**
   - Content approval flow (draft → review → publish)
   - Scheduled publishing
   - Content versioning

4. **Multilingual Support**
   - Directus i18n features
   - Translate blog posts
   - Localized marketing content

---

## References

- [Directus Documentation](https://docs.directus.io/)
- [Directus SDK TypeScript Guide](https://docs.directus.io/guides/sdk/getting-started.html)
- [Drizzle ORM Documentation](https://orm.drizzle.team/docs/overview)
- [Next.js ISR Documentation](https://nextjs.org/docs/app/building-your-application/data-fetching/incremental-static-regeneration)
- [PostgreSQL Extensions Guide](https://www.postgresql.org/docs/16/contrib.html)
- [ADR-012: Frontend Stack Architecture](./adr_012_frontend_stack_architecture.md)

---

## Decision Log

| Date | Decision | Rationale |
|------|----------|-----------|
| 2025-12-21 | Choose Directus over Payload CMS | Database-first philosophy, preserves Drizzle schema ownership |
| 2025-12-21 | Dual migration strategy (Drizzle + Alembic) | Clean separation: app schema (Drizzle), data warehouse (Alembic) |
| 2025-12-21 | Directus on Lightsail VM (not containerized separately) | Cost-effective, shares resources with PostgreSQL |
| 2025-12-21 | HTTP-based content fetching (not Local API) | Clean architectural separation, Edge deployment compatibility |
| 2025-12-21 | ISR with 60-second revalidation | Balance between freshness and performance |

---

## Conclusion

Directus CMS provides the optimal balance for Project Chronos:

**Preserves:**
- ✅ Database-first architecture
- ✅ PostgreSQL extension capabilities
- ✅ Drizzle schema ownership
- ✅ Type-safe Drizzle → Zod → tRPC flow

**Adds:**
- ✅ Intuitive admin UI for marketing content
- ✅ REST API for content delivery
- ✅ Extensibility for custom features
- ✅ Self-hosted control and cost efficiency

The trade-off (HTTP overhead for CMS content vs. Payload's zero-overhead Local API) is acceptable given:
1. CMS content is low-volume and non-critical path
2. ISR and caching mitigate latency
3. Architectural purity is preserved
4. Product data continues using high-performance Drizzle/tRPC stack

**Total Implementation Time:** 3 sprints
**Total Incremental Cost:** ~$5/month (R2 media storage only)

**Approved by:** Geoff Bevans
**Implementation Start:** 12-21-2025
