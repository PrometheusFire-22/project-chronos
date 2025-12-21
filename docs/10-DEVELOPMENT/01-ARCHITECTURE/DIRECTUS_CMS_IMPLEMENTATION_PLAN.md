# Directus CMS Implementation Plan

**Version:** 1.0.0
**Date:** 2025-12-21
**Owner:** Geoff Bevans
**Related ADR:** [ADR-018: Directus CMS Selection](./adrs/adr_018_directus_cms_selection.md)

---

## Executive Summary

This plan outlines the implementation of Directus CMS for Project Chronos, integrating it with the existing Next.js frontend and PostgreSQL database. The implementation follows a **four-phase approach** over 3-4 sprints, with clear milestones and acceptance criteria.

**Total Estimated Story Points:** 42
**Total Estimated Duration:** 3-4 sprints
**Incremental Cost:** ~$5/month (S3 media storage)

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────┐
│                   AWS Lightsail VM                      │
│  ┌──────────────────────┐   ┌──────────────────────┐   │
│  │   Directus CMS       │───│  PostgreSQL 16.4     │   │
│  │   (Docker)           │   │  + Extensions        │   │
│  │   Port: 8055         │   │  - TimescaleDB       │   │
│  │                      │   │  - PostGIS           │   │
│  │   Admin UI:          │   │  - pgvector          │   │
│  │   admin.domain.com   │   │  - Apache AGE        │   │
│  └──────────────────────┘   └──────────────────────┘   │
└─────────────────────────────────────────────────────────┘
                              ▲
                              │
┌─────────────────────────────┴───────────────────────────┐
│          Cloudflare Pages (Next.js App)                 │
│  ┌──────────────────────────────────────────────────┐   │
│  │  Marketing Pages (SSG/ISR)                       │   │
│  │  - Blog (Directus SDK)                           │   │
│  │  - Homepage (Directus SDK)                       │   │
│  │  - Features (Directus SDK)                       │   │
│  │                                                   │   │
│  │  Product Pages (SSR/CSR)                         │   │
│  │  - Dashboard (Drizzle ORM)                       │   │
│  │  - Deals (Drizzle ORM)                           │   │
│  │  - Analytics (Drizzle ORM)                       │   │
│  └──────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
```

---

## Phase 1: Infrastructure Setup (Sprint 1, Week 1)

### Objective
Set up Directus on AWS Lightsail VM, configure PostgreSQL connection, and establish admin access.

### Tasks

#### CHRONOS-XXX-1: Install Directus on Lightsail VM
**Story Points:** 3
**Assignee:** TBD
**Priority:** High

**Acceptance Criteria:**
- [ ] Directus Docker container running on Lightsail VM
- [ ] Directus admin UI accessible at `http://localhost:8055`
- [ ] Health check endpoint returns 200 OK
- [ ] Docker container auto-restarts on failure
- [ ] Directus version pinned (latest stable)

**Technical Steps:**
1. SSH into Lightsail VM
2. Create `docker-compose.yml` for Directus:
   ```yaml
   version: '3.8'
   services:
     directus:
       image: directus/directus:latest
       ports:
         - '8055:8055'
       environment:
         DB_CLIENT: 'pg'
         DB_HOST: 'localhost'
         DB_PORT: '5432'
         DB_DATABASE: 'chronos'
         DB_USER: 'directus_user'
         DB_PASSWORD: ${DIRECTUS_DB_PASSWORD}
         SECRET: ${DIRECTUS_SECRET}
         ADMIN_EMAIL: ${ADMIN_EMAIL}
         ADMIN_PASSWORD: ${ADMIN_PASSWORD}
       restart: unless-stopped
   ```
3. Run `docker-compose up -d`
4. Verify Directus starts successfully

**Testing:**
- Access `http://localhost:8055/admin`
- Login with admin credentials
- Verify PostgreSQL connection in Directus settings

#### CHRONOS-XXX-2: Configure Nginx Reverse Proxy for Directus
**Story Points:** 2
**Assignee:** TBD
**Priority:** High

**Acceptance Criteria:**
- [ ] Directus accessible at `https://admin.automatonicai.com`
- [ ] SSL/TLS certificate configured (Let's Encrypt)
- [ ] HTTP automatically redirects to HTTPS
- [ ] Nginx logs configured for debugging

**Technical Steps:**
1. Create Nginx config: `/etc/nginx/sites-available/directus`
   ```nginx
   server {
       listen 80;
       server_name admin.automatonicai.com;
       return 301 https://$server_name$request_uri;
   }

   server {
       listen 443 ssl http2;
       server_name admin.automatonicai.com;

       ssl_certificate /etc/letsencrypt/live/admin.automatonicai.com/fullchain.pem;
       ssl_certificate_key /etc/letsencrypt/live/admin.automatonicai.com/privkey.pem;

       location / {
           proxy_pass http://localhost:8055;
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
           proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
           proxy_set_header X-Forwarded-Proto $scheme;
       }
   }
   ```
2. Obtain SSL certificate: `certbot --nginx -d admin.automatonicai.com`
3. Enable site: `ln -s /etc/nginx/sites-available/directus /etc/nginx/sites-enabled/`
4. Reload Nginx: `systemctl reload nginx`

**Testing:**
- Access `https://admin.automatonicai.com`
- Verify SSL certificate validity
- Test HTTP → HTTPS redirect

#### CHRONOS-XXX-3: Configure Directus PostgreSQL Connection
**Story Points:** 2
**Assignee:** TBD
**Priority:** High

**Acceptance Criteria:**
- [ ] Directus connected to PostgreSQL database
- [ ] Directus metadata tables created (`directus_*`)
- [ ] No conflicts with existing tables
- [ ] Directus can introspect existing schema

**Technical Steps:**
1. Create dedicated PostgreSQL user for Directus:
   ```sql
   CREATE USER directus_user WITH PASSWORD 'secure_password';
   GRANT CONNECT ON DATABASE chronos TO directus_user;
   GRANT USAGE ON SCHEMA public TO directus_user;
   GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO directus_user;
   GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO directus_user;
   ```
2. Update Directus environment variables with connection details
3. Restart Directus container
4. Verify connection in Directus settings

**Testing:**
- Check Directus logs for successful database connection
- Verify `directus_*` tables created in PostgreSQL
- Query: `SELECT tablename FROM pg_tables WHERE schemaname = 'public' AND tablename LIKE 'directus%';`

#### CHRONOS-XXX-4: Set Up Directus User Roles and Permissions
**Story Points:** 2
**Assignee:** TBD
**Priority:** Medium

**Acceptance Criteria:**
- [ ] Admin role configured (full access)
- [ ] Editor role configured (content management only)
- [ ] Public role configured (read-only published content)
- [ ] Role permissions tested

**Technical Steps:**
1. In Directus admin UI, navigate to **Settings > Roles & Permissions**
2. Create roles:
   - **Admin**: Full CRUD on all collections
   - **Editor**: CRUD on `blog_posts`, `docs_pages`, `features` only
   - **Public**: Read-only on published items (`status = 'published'`)
3. Configure field-level permissions (hide sensitive fields from Editor)

**Testing:**
- Create test user with Editor role
- Attempt to access admin-only collections (should fail)
- Publish blog post as Editor (should succeed)

---

## Phase 2: Drizzle Schema Setup (Sprint 1, Week 2)

### Objective
Define content schema in Drizzle ORM, generate migrations, and have Directus introspect the tables.

### Tasks

#### CHRONOS-XXX-5: Initialize Drizzle ORM in Monorepo
**Story Points:** 3
**Assignee:** TBD
**Priority:** High

**Acceptance Criteria:**
- [ ] Drizzle ORM installed in `packages/database`
- [ ] Drizzle config file created (`drizzle.config.ts`)
- [ ] Database connection configured (via environment variables)
- [ ] Can run Drizzle commands: `pnpm drizzle-kit generate:pg`

**Technical Steps:**
1. Navigate to `packages/database`
2. Install dependencies:
   ```bash
   pnpm add drizzle-orm postgres
   pnpm add -D drizzle-kit
   ```
3. Create `drizzle.config.ts`:
   ```typescript
   import type { Config } from 'drizzle-kit';

   export default {
     schema: './src/schema/*.ts',
     out: './migrations',
     driver: 'pg',
     dbCredentials: {
       connectionString: process.env.DATABASE_URL!,
     },
   } satisfies Config;
   ```
4. Create `src/index.ts`:
   ```typescript
   import { drizzle } from 'drizzle-orm/postgres-js';
   import postgres from 'postgres';

   const client = postgres(process.env.DATABASE_URL!);
   export const db = drizzle(client);
   ```

**Testing:**
- Run `pnpm drizzle-kit --help` (should show commands)
- Test database connection: `pnpm ts-node -e "import { db } from './src'; console.log('Connected!')"`

#### CHRONOS-XXX-6: Define Content Schema in Drizzle
**Story Points:** 5
**Assignee:** TBD
**Priority:** High

**Acceptance Criteria:**
- [ ] Content tables defined: `blog_posts`, `docs_pages`, `features`, `homepage_hero`
- [ ] Relationships defined (authors, categories)
- [ ] Validation constraints applied (NOT NULL, UNIQUE)
- [ ] TypeScript types exported from schema

**Technical Steps:**
1. Create `packages/database/src/schema/content.ts`:
   ```typescript
   import { pgTable, uuid, text, timestamp, integer, boolean } from 'drizzle-orm/pg-core';
   import { users } from './users';

   export const blogPosts = pgTable('blog_posts', {
     id: uuid('id').primaryKey().defaultRandom(),
     slug: text('slug').notNull().unique(),
     title: text('title').notNull(),
     content: text('content').notNull(),
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
     category: text('category'),
     order: integer('order').default(0),
     status: text('status').$type<'draft' | 'published'>().default('draft'),
     created_at: timestamp('created_at').defaultNow(),
     updated_at: timestamp('updated_at').defaultNow(),
   });

   export const features = pgTable('features', {
     id: uuid('id').primaryKey().defaultRandom(),
     title: text('title').notNull(),
     description: text('description'),
     icon_name: text('icon_name'),
     category: text('category'),
     sort_order: integer('sort_order').default(0),
     status: text('status').$type<'draft' | 'published'>().default('published'),
   });

   export const homepageHero = pgTable('homepage_hero', {
     id: uuid('id').primaryKey().defaultRandom(),
     headline: text('headline').notNull(),
     subtitle: text('subtitle'),
     cta_text: text('cta_text').default('Get Started'),
     cta_link: text('cta_link').default('/contact'),
     background_image: text('background_image'),
   });
   ```

2. Export types: `export type BlogPost = typeof blogPosts.$inferSelect;`

**Testing:**
- TypeScript compilation succeeds
- Types are correctly inferred: `const post: BlogPost = { ... }`

#### CHRONOS-XXX-7: Generate and Apply Drizzle Migrations
**Story Points:** 2
**Assignee:** TBD
**Priority:** High

**Acceptance Criteria:**
- [ ] Migrations generated in `packages/database/migrations/`
- [ ] Migrations applied to PostgreSQL database
- [ ] Tables visible in PostgreSQL: `blog_posts`, `docs_pages`, etc.
- [ ] Directus auto-discovers tables

**Technical Steps:**
1. Generate migrations:
   ```bash
   cd packages/database
   pnpm drizzle-kit generate:pg
   ```
2. Review generated SQL in `migrations/`
3. Apply migrations:
   ```bash
   pnpm drizzle-kit push:pg
   ```
4. Verify in PostgreSQL:
   ```sql
   \dt public.*
   SELECT * FROM pg_tables WHERE schemaname = 'public' AND tablename IN ('blog_posts', 'docs_pages', 'features', 'homepage_hero');
   ```

**Testing:**
- Tables exist in PostgreSQL
- Refresh Directus admin UI → tables appear in Data Model
- Insert test row via Drizzle:
  ```typescript
  await db.insert(blogPosts).values({
    slug: 'test-post',
    title: 'Test Post',
    content: 'This is a test.',
    status: 'draft',
  });
  ```

#### CHRONOS-XXX-8: Configure Directus Collections for Content Tables
**Story Points:** 3
**Assignee:** TBD
**Priority:** Medium

**Acceptance Criteria:**
- [ ] Directus collections configured for: `blog_posts`, `docs_pages`, `features`, `homepage_hero`
- [ ] Display templates set (e.g., show `title` as item name)
- [ ] Field interfaces configured (WYSIWYG for `content`, dropdown for `status`)
- [ ] Collection icons and descriptions set

**Technical Steps:**
1. In Directus admin UI, navigate to **Settings > Data Model**
2. For each introspected table:
   - Set display template: `{{ title }}`
   - Configure field interfaces:
     - `content`: **WYSIWYG Editor** (rich text)
     - `status`: **Dropdown** (draft, published, archived)
     - `slug`: **Input** (manual entry with validation)
     - `author_id`: **User** (relation to Directus users)
   - Set collection icon (e.g., "article" for blog_posts)
   - Add collection note/description

**Testing:**
- Create new blog post via Directus UI
- Verify WYSIWYG editor renders correctly
- Verify status dropdown has correct options
- Check that item displays `title` in collection list

---

## Phase 3: Next.js Integration (Sprint 2)

### Objective
Integrate Directus SDK into Next.js app, build content pages, and implement ISR.

### Tasks

#### CHRONOS-XXX-9: Install Directus SDK in Next.js App
**Story Points:** 1
**Assignee:** TBD
**Priority:** High

**Acceptance Criteria:**
- [ ] `@directus/sdk` installed in `apps/web`
- [ ] Directus client configured in `lib/directus.ts`
- [ ] Environment variables set for Directus URL
- [ ] Test API call succeeds

**Technical Steps:**
1. Install SDK:
   ```bash
   cd apps/web
   pnpm add @directus/sdk
   ```
2. Create `lib/directus.ts`:
   ```typescript
   import { createDirectus, rest, readItems, readItem } from '@directus/sdk';
   import type { BlogPost, DocsPage, Feature, HomepageHero } from '@chronos/database/schema';

   type DirectusSchema = {
     blog_posts: BlogPost[];
     docs_pages: DocsPage[];
     features: Feature[];
     homepage_hero: HomepageHero[];
   };

   export const directus = createDirectus<DirectusSchema>(process.env.DIRECTUS_URL!)
     .with(rest());

   export async function getBlogPosts() {
     return await directus.request(
       readItems('blog_posts', {
         filter: { status: { _eq: 'published' } },
         sort: ['-published_at'],
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
   ```
3. Add to `.env.local`:
   ```
   DIRECTUS_URL=https://admin.automatonicai.com
   ```

**Testing:**
- Test API call in Next.js dev server:
  ```typescript
  // app/test/page.tsx
  import { getBlogPosts } from '@/lib/directus';
  export default async function TestPage() {
    const posts = await getBlogPosts();
    return <pre>{JSON.stringify(posts, null, 2)}</pre>;
  }
  ```

#### CHRONOS-XXX-10: Build Blog Listing and Detail Pages
**Story Points:** 5
**Assignee:** TBD
**Priority:** High

**Acceptance Criteria:**
- [ ] Blog listing page renders at `/blog`
- [ ] Blog detail pages render at `/blog/[slug]`
- [ ] ISR configured (60-second revalidation)
- [ ] SEO metadata populated from Directus content
- [ ] Responsive design (mobile, tablet, desktop)

**Technical Steps:**
1. Create `app/blog/page.tsx`:
   ```typescript
   import { getBlogPosts } from '@/lib/directus';
   import { BlogCard } from '@/components/blog/BlogCard';

   export const revalidate = 60; // ISR: 60 seconds

   export default async function BlogPage() {
     const posts = await getBlogPosts();

     return (
       <div className="container mx-auto py-12">
         <h1 className="text-4xl font-bold mb-8">Blog</h1>
         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
           {posts.map((post) => (
             <BlogCard key={post.id} post={post} />
           ))}
         </div>
       </div>
     );
   }
   ```

2. Create `app/blog/[slug]/page.tsx`:
   ```typescript
   import { getBlogPost, getBlogPosts } from '@/lib/directus';
   import { notFound } from 'next/navigation';

   export const revalidate = 60;

   export async function generateStaticParams() {
     const posts = await getBlogPosts();
     return posts.map((post) => ({ slug: post.slug }));
   }

   export async function generateMetadata({ params }: { params: { slug: string } }) {
     const post = await getBlogPost(params.slug);
     if (!post) return {};
     return {
       title: post.title,
       description: post.excerpt,
     };
   }

   export default async function BlogPostPage({ params }: { params: { slug: string } }) {
     const post = await getBlogPost(params.slug);
     if (!post) notFound();

     return (
       <article className="container mx-auto py-12 prose prose-lg">
         <h1>{post.title}</h1>
         <div dangerouslySetInnerHTML={{ __html: post.content }} />
       </article>
     );
   }
   ```

**Testing:**
- Create 3 test blog posts in Directus
- Verify blog listing page shows all posts
- Click through to detail page
- Verify SEO metadata in page source
- Test on mobile device (responsive)

#### CHRONOS-XXX-11: Build Homepage with Dynamic Content
**Story Points:** 3
**Assignee:** TBD
**Priority:** Medium

**Acceptance Criteria:**
- [ ] Homepage hero section fetches content from Directus
- [ ] Features section fetches from Directus
- [ ] Content updates in Directus appear within 60 seconds
- [ ] Fallback content if Directus unavailable

**Technical Steps:**
1. Create helper functions in `lib/directus.ts`:
   ```typescript
   export async function getHomepageHero() {
     const heroes = await directus.request(readItems('homepage_hero', { limit: 1 }));
     return heroes[0];
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

2. Update `app/(frontend)/page.tsx`:
   ```typescript
   import { getHomepageHero, getFeatures } from '@/lib/directus';
   import { HeroSection } from '@/components/sections/HeroSection';
   import { FeaturesGrid } from '@/components/marketing/features';

   export const revalidate = 60;

   export default async function HomePage() {
     const hero = await getHomepageHero();
     const features = await getFeatures();

     return (
       <>
         <HeroSection
           headline={hero?.headline || 'Welcome to Project Chronos'}
           subtitle={hero?.subtitle}
           ctaText={hero?.cta_text || 'Get Started'}
           backgroundImage={hero?.background_image}
         />
         <FeaturesGrid features={features} />
       </>
     );
   }
   ```

**Testing:**
- Edit hero headline in Directus
- Wait 60 seconds, refresh homepage
- Verify updated content appears
- Test with Directus offline (should show fallback)

#### CHRONOS-XXX-12: Implement Documentation Site
**Story Points:** 5
**Assignee:** TBD
**Priority:** Medium

**Acceptance Criteria:**
- [ ] Documentation listing page at `/docs`
- [ ] Documentation detail pages at `/docs/[slug]`
- [ ] Category-based organization
- [ ] Search functionality (client-side)
- [ ] Table of contents auto-generated from headings

**Technical Steps:**
1. Create `app/docs/page.tsx` (listing by category)
2. Create `app/docs/[slug]/page.tsx` (detail page)
3. Create `components/docs/TableOfContents.tsx` (parse headings from content)
4. Create `components/docs/SearchBar.tsx` (client component for filtering)

**Testing:**
- Create 10 docs pages in Directus across 3 categories
- Verify categorization works
- Test search functionality
- Verify table of contents scrolls correctly

---

## Phase 4: Content Migration and Optimization (Sprint 3)

### Objective
Migrate existing content to Directus, optimize performance, and set up workflows.

### Tasks

#### CHRONOS-XXX-13: Migrate Existing Content to Directus
**Story Points:** 3
**Assignee:** TBD
**Priority:** Medium

**Acceptance Criteria:**
- [ ] All existing blog posts (if any) migrated to Directus
- [ ] Homepage content migrated
- [ ] Legal pages (Terms, Privacy) migrated
- [ ] Migration script documented for future use

**Technical Steps:**
1. Create migration script: `scripts/migrate-content.ts`
2. Extract existing content from:
   - Markdown files (if present)
   - Hardcoded JSX (homepage)
   - External CMS (if migrating)
3. Bulk insert via Directus API or direct PostgreSQL inserts

**Testing:**
- Verify all content visible in Directus
- Verify content renders correctly on site
- Compare old vs. new site (screenshots)

#### CHRONOS-XXX-14: Set Up R2 Storage for Media Uploads
**Story Points:** 2
**Assignee:** TBD
**Priority:** Medium

**Acceptance Criteria:**
- [ ] Directus configured to use Cloudflare R2 for file storage
- [ ] Image uploads work from Directus admin UI
- [ ] Images accessible via public URL
- [ ] Custom domain configured (optional): `media.automatonicai.com`
- [ ] Zero egress fees confirmed

**Technical Steps:**
1. Get R2 credentials from Cloudflare Dashboard:
   - Navigate to: R2 → Manage R2 API Tokens → Create API Token
   - Copy Access Key ID and Secret Access Key
2. Update Directus environment variables:
   ```env
   STORAGE_LOCATIONS=r2
   STORAGE_R2_DRIVER=s3
   STORAGE_R2_KEY=<r2-access-key-id>
   STORAGE_R2_SECRET=<r2-secret-access-key>
   STORAGE_R2_BUCKET=chronos-media
   STORAGE_R2_ENDPOINT=https://<account-id>.r2.cloudflarestorage.com
   STORAGE_R2_REGION=auto
   STORAGE_R2_PUBLIC_URL=https://media.automatonicai.com
   ```
3. (Optional) Configure custom domain: `media.automatonicai.com` → R2 bucket
4. Restart Directus container

**Testing:**
- Upload image in Directus (blog post featured image)
- Verify image URL points to R2 (or custom domain)
- Access image via browser (should load)
- Verify image displays on blog post page
- Check Cloudflare Analytics (confirm zero egress charges)

#### CHRONOS-XXX-15: Implement Redis Caching for Directus
**Story Points:** 2
**Assignee:** TBD
**Priority:** Low

**Acceptance Criteria:**
- [ ] Redis installed on Lightsail VM
- [ ] Directus configured to use Redis for caching
- [ ] Cache hit rate >80% for repeated queries
- [ ] Cache invalidation works on content updates

**Technical Steps:**
1. Install Redis:
   ```bash
   sudo apt-get install redis-server
   sudo systemctl enable redis-server
   ```
2. Update Directus environment:
   ```env
   CACHE_ENABLED=true
   CACHE_STORE=redis
   REDIS_HOST=localhost
   REDIS_PORT=6379
   ```
3. Restart Directus

**Testing:**
- Make API request twice, check logs for cache hit
- Update content in Directus, verify cache invalidated
- Monitor Redis: `redis-cli MONITOR`

#### CHRONOS-XXX-16: Set Up Webhook for ISR Revalidation
**Story Points:** 2
**Assignee:** TBD
**Priority:** Medium

**Acceptance Criteria:**
- [ ] Directus webhook triggers Next.js revalidation on content publish
- [ ] Content updates appear immediately (no 60-second delay)
- [ ] Webhook authenticated (secret token)
- [ ] Webhook logs successful triggers

**Technical Steps:**
1. Create Next.js API route: `app/api/revalidate/route.ts`
   ```typescript
   import { revalidatePath } from 'next/cache';
   import { NextRequest } from 'next/server';

   export async function POST(request: NextRequest) {
     const secret = request.headers.get('x-webhook-secret');
     if (secret !== process.env.WEBHOOK_SECRET) {
       return new Response('Unauthorized', { status: 401 });
     }

     const body = await request.json();
     const { collection, key } = body;

     if (collection === 'blog_posts') {
       revalidatePath('/blog');
       revalidatePath(`/blog/${key}`);
     }

     return new Response('Revalidated', { status: 200 });
   }
   ```

2. In Directus, create webhook:
   - URL: `https://automatonicai.com/api/revalidate`
   - Trigger: `items.create`, `items.update` on `blog_posts`
   - Headers: `x-webhook-secret: <secret>`

**Testing:**
- Publish blog post in Directus
- Verify webhook fired (check Directus logs)
- Check site immediately (content should update)
- Verify webhook authenticated (try invalid secret)

---

## Acceptance Criteria (Overall)

### Phase 1 Complete
- [ ] Directus admin accessible at `https://admin.automatonicai.com`
- [ ] PostgreSQL connection established
- [ ] User roles configured (Admin, Editor, Public)
- [ ] SSL certificate valid

### Phase 2 Complete
- [ ] Drizzle schema defined for content tables
- [ ] Migrations applied to PostgreSQL
- [ ] Directus collections configured
- [ ] Can create/edit content via Directus UI

### Phase 3 Complete
- [ ] Blog listing and detail pages live
- [ ] Homepage dynamic content from Directus
- [ ] Documentation site functional
- [ ] ISR revalidation working (60 seconds)

### Phase 4 Complete
- [ ] Content migrated to Directus
- [ ] S3 media storage operational
- [ ] Redis caching configured
- [ ] Webhooks trigger immediate revalidation
- [ ] Marketing team trained and autonomous

---

## Rollout Plan

### Week 1: Infrastructure (Phase 1)
- Monday-Tuesday: Install Directus, configure Nginx
- Wednesday-Thursday: PostgreSQL connection, user roles
- Friday: Testing and documentation

### Week 2: Schema and Integration (Phase 2-3)
- Monday-Tuesday: Drizzle schema definition, migrations
- Wednesday-Thursday: Directus SDK integration, blog pages
- Friday: Homepage and docs site

### Week 3-4: Migration and Optimization (Phase 4)
- Week 3 Monday-Wednesday: Content migration, S3 setup
- Week 3 Thursday-Friday: Redis caching, webhooks
- Week 4: Buffer for testing, training, documentation

---

## Risk Mitigation

| Risk | Mitigation |
|------|------------|
| **Directus migration complexity** | Test in local environment first, use staging database |
| **ISR latency unacceptable** | Implement webhooks for instant revalidation |
| **Directus version breaking changes** | Pin Directus version, test upgrades in staging |
| **S3 costs exceed budget** | Set S3 lifecycle policies, monitor usage |
| **Marketing team learning curve** | Create video tutorials, schedule training session |

---

## Training Plan

### Marketing Team Training (1-hour session)
1. **Directus Admin Overview** (15 min)
   - Login, navigation, collections
2. **Creating Blog Posts** (20 min)
   - WYSIWYG editor, slug generation, publishing
3. **Managing Features and Homepage** (15 min)
   - Editing hero section, reordering features
4. **Media Uploads** (10 min)
   - Uploading images, using in content
5. **Q&A** (10 min)

**Deliverables:**
- Screen recording of training session
- Written guide: `docs/DIRECTUS_CONTENT_EDITING_GUIDE.md`
- Quick reference cheat sheet

---

## Success Metrics

### Technical Metrics
- [ ] Directus uptime >99.5%
- [ ] Content update latency <60 seconds (ISR) or instant (webhooks)
- [ ] Blog page load time <2 seconds
- [ ] Lighthouse SEO score >95

### Business Metrics
- [ ] Marketing team publishes 10+ blog posts in first month
- [ ] Zero developer blockers for content updates
- [ ] Content publish workflow <5 minutes (draft → publish)
- [ ] S3 storage costs <$5/month

---

## Documentation Deliverables

1. **ADR-018: Directus CMS Selection** ✅ (already created)
2. **Implementation Plan** ✅ (this document)
3. **Directus Admin User Guide** (for marketing team)
4. **Developer Integration Guide** (for future developers)
5. **Migration Runbook** (for content migrations)
6. **Troubleshooting Guide** (common issues and solutions)

---

## Next Steps

1. **Create Epic and Stories in Jira** (next task)
2. **Review and approve ADR-018**
3. **Schedule Phase 1 implementation** (assign sprint)
4. **Provision AWS resources** (S3 bucket, Redis if needed)
5. **Set up local development environment** (Docker Compose for Directus)

---

**Plan Approved By:** TBD
**Implementation Start Date:** TBD
**Expected Completion Date:** TBD (3-4 sprints from start)
