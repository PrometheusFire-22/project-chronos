# Directus CMS Setup Guide

**Last Updated**: 2025-12-24
**Version**: 1.0
**Epic**: CHRONOS-364

---

## Table of Contents

1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Content Structure](#content-structure)
4. [Accessing Directus](#accessing-directus)
5. [Managing Content](#managing-content)
6. [Media Assets & R2 Storage](#media-assets--r2-storage)
7. [Scripts Reference](#scripts-reference)
8. [Integration with Next.js](#integration-with-nextjs)
9. [Troubleshooting](#troubleshooting)

---

## Overview

This project uses **Directus** as a headless CMS for managing marketing website content. Directus introspects PostgreSQL tables defined via **Drizzle ORM**, providing a user-friendly admin UI while keeping schema control in code.

### What's Been Set Up

- **✅ Drizzle Schema** (`packages/database/src/schema/cms.ts`): 7 CMS tables
- **✅ PostgreSQL Database**: Tables created via migrations
- **✅ Directus CMS**: Running at `https://admin.automatonicai.com`
- **✅ R2 Storage**: 27 marketing assets uploaded to Cloudflare R2
- **✅ Content Population**: 21 pieces of marketing content across homepage, features, and about pages

### Tech Stack

| Component | Technology | Purpose |
|-----------|------------|---------|
| **Schema Definition** | Drizzle ORM | Single source of truth for database schema |
| **Database** | PostgreSQL + Extensions | TimescaleDB, PostGIS, pgvector, Apache AGE |
| **CMS** | Directus | Content management UI |
| **Object Storage** | Cloudflare R2 | Media asset storage (S3-compatible, zero egress fees) |
| **Frontend** | Next.js App Router | Marketing website |

---

## Architecture

### How It Works

```
┌─────────────────┐
│  Drizzle Schema │  ← Single source of truth
│  (TypeScript)   │
└────────┬────────┘
         │
         │ Generates migrations
         ▼
┌─────────────────┐
│   PostgreSQL    │  ← Database with CMS tables
│  (cms_* tables) │
└────────┬────────┘
         │
         │ Directus introspects
         ▼
┌─────────────────┐
│    Directus     │  ← Admin UI for content editing
│   (CMS Admin)   │
└────────┬────────┘
         │
         │ REST/GraphQL API
         ▼
┌─────────────────┐
│    Next.js      │  ← Marketing website consumes content
│  (Frontend App) │
└─────────────────┘
```

### Schema-First Approach

1. **Define schema** in `packages/database/src/schema/cms.ts` using Drizzle
2. **Generate migration** with `pnpm db:generate`
3. **Apply migration** to PostgreSQL
4. **Restart Directus** to introspect new tables
5. **Edit content** in Directus admin UI
6. **Consume via API** in Next.js frontend

---

## Content Structure

### CMS Collections

| Collection | Type | Purpose | Fields |
|------------|------|---------|--------|
| **cms_homepage_hero** | Singleton | Homepage hero section | headline, subheadline, CTAs, background media |
| **cms_features** | Standard | Features, use cases, problem points, about sections | title, slug, description, icon, image, category, sortOrder |
| **cms_blog_posts** | Standard | Blog articles | title, slug, content, excerpt, author, category, tags, SEO fields |
| **cms_docs_pages** | Hierarchical | Documentation pages | title, slug, content, parentId, sortOrder |
| **cms_announcements** | Standard | Site-wide banners/modals | title, message, type, placement, scheduling |
| **cms_legal_pages** | Standard | Terms, Privacy Policy | title, slug, content, version, effectiveDate |
| **cms_waitlist_submissions** | Standard | Early access signups | email, name, company, role, source, UTM tracking, status |

### Content Categories

Features in `cms_features` are categorized by `category` field:

- **`problem-point`**: Homepage pain points (3 items)
- **`solution-pillar`**: Homepage 4 pillars (Graph, Vector, Geo, Time-Series)
- **`key-feature`**: Homepage key features (3 items)
- **`use-case`**: Homepage use cases (3 items)
- **`features-detail`**: Features page deep dives (4 items)
- **`about-section`**: About page sections (3 items)

### Current Content Summary

**Homepage (14 items)**:
- 1 hero section (singleton)
- 3 problem points
- 4 solution pillars
- 3 key features
- 3 use cases

**Features Page (4 items)**:
- Graph Database Intelligence
- Vector Search Intelligence
- Geospatial Analysis
- Time-Series Analytics

**About Page (3 items)**:
- Founder Story
- Why This Matters
- Our Mission

**Total**: 21 pieces of content

---

## Accessing Directus

### Admin Login

- **URL**: https://admin.automatonicai.com
- **Email**: `geoff@automatonicai.com`
- **Password**: Stored in KeePassXC

### Dashboard Overview

After logging in, you'll see:
- **Content** sidebar: All CMS collections
- **Media Library**: Uploaded assets (R2 storage)
- **Settings**: Collection configuration, roles & permissions

---

## Managing Content

### Editing Homepage Hero (Singleton)

1. Navigate to **Content → cms_homepage_hero**
2. Edit fields directly (no "Create" button—singletons have one record)
3. Update headline, subheadline, CTA text/links
4. Click **Save** (top-right)
5. Changes are immediately available via API

### Adding/Editing Features

1. Navigate to **Content → cms_features**
2. Click **Create Item** (top-right)
3. Fill in fields:
   - **title**: Display title
   - **slug**: URL-friendly identifier (unique)
   - **description**: Markdown-supported content
   - **icon**: Lucide icon name (e.g., `git-graph`, `box`, `map-pin`)
   - **image**: File from media library or direct ID
   - **category**: Content category (see table above)
   - **sort_order**: Display order (lower = first)
   - **enabled**: Toggle visibility
4. Click **Save**

### Creating Blog Posts

1. Navigate to **Content → cms_blog_posts**
2. Click **Create Item**
3. Fill in:
   - **title**, **slug**, **content** (required)
   - **excerpt**: Short summary for listings
   - **author**: Defaults to "Geoff Bevans"
   - **category**: e.g., "Product Updates", "Technical Deep Dives"
   - **tags**: JSON array of tags
   - **status**: `draft`, `published`, or `archived`
   - **published_at**: Publish date/time
4. Add **featured_image** from media library
5. Fill SEO fields: **meta_title**, **meta_description**, **og_image**
6. Click **Save**

### Managing Waitlist Submissions

1. Navigate to **Content → cms_waitlist_submissions**
2. View submissions sorted by **created_at**
3. Filter by **status**: `pending`, `contacted`, `invited`, `archived`
4. Edit individual submissions to add **notes** or update **status**
5. Mark **email_sent** when follow-up emails are sent

---

## Media Assets & R2 Storage

### How R2 Storage Works

All media assets are stored in **Cloudflare R2** bucket `chronos-media`:
- **Endpoint**: `https://060e43df09e3ec3a256a6624ab7649f8.r2.cloudflarestorage.com`
- **Public URL**: `https://pub-060e43df09e3ec3a256a6624ab7649f8.r2.dev`
- **Zero egress fees** (unlike S3)
- **S3-compatible API**

### Uploaded Assets (27 files)

**Logos (9 files)**:
- `logo-ai-icon.svg/png`
- `logo-wordmark-full.svg/png`
- `favicon-16x16.png`, `favicon-32x32.png`
- `apple-touch-icon.png`, `icon-192x192.png`

**Illustrations (13 files)**:
- Database modality SVGs (dark/light variants):
  - `graph-database-dark/light.svg`
  - `vector-database-dark/light.svg`
  - `geospatial-database-dark/light.svg`
  - `timeseries-database-dark/light.svg`
  - `relational-database-dark/light.svg`
- Hero graphics: `hero-dark.svg`, `hero-light.svg`, `hero-graph.svg`

**Favicons (5 files)**:
- `android-chrome-192x192.png`, `android-chrome-512x512.png`
- `apple-touch-icon.png`
- `favicon-16x16.png`, `favicon-32x32.png`

### Uploading New Assets

1. Navigate to **Media Library** (sidebar)
2. Click **Upload** (top-right)
3. Select files
4. Files automatically upload to R2 storage
5. Organize into folders: `logos`, `illustrations`, `favicons`
6. Copy file ID to reference in content

### Linking Assets in Content

Use the **file ID** from Directus:
- In `cms_features`: Set `image` field to file ID (e.g., `c9ea9bcd-d26a-461a-a0d1-a4fa25360a91`)
- In `cms_blog_posts`: Set `featured_image` field to file ID
- Directus API returns full URL: `https://pub-*.r2.dev/<file-id>`

---

## Scripts Reference

### Asset Upload Scripts

**`scripts/upload-assets-to-r2.sh`**
- **Purpose**: Upload local marketing assets to R2 via Directus API
- **Usage**:
  ```bash
  DIRECTUS_URL=https://admin.automatonicai.com \\
  DIRECTUS_ADMIN_EMAIL=geoff@automatonicai.com \\
  DIRECTUS_ADMIN_PASSWORD='your-password' \\
  bash scripts/upload-assets-to-r2.sh
  ```
- **Output**: Uploads 27 files, returns Directus file IDs

### Content Population Scripts

**`scripts/populate-homepage-content.ts`**
- **Purpose**: Populate Directus with homepage content (edited to 60-70%)
- **Content**: Hero, 3 problems, 4 pillars, 3 features, 3 use cases
- **Usage**: `DIRECTUS_URL=... npx tsx scripts/populate-homepage-content.ts`

**`scripts/populate-features-content.ts`**
- **Purpose**: Populate features page with 4 database modality deep dives
- **Content**: Graph, Vector, Geospatial, Time-Series sections
- **Usage**: `npx tsx scripts/populate-features-content.ts`

**`scripts/populate-about-content.ts`**
- **Purpose**: Populate about page with founder story, vision, mission
- **Content**: 3 sections (Founder Story, Why This Matters, Our Mission)
- **Usage**: `npx tsx scripts/populate-about-content.ts`

### Utility Scripts

**`scripts/register-cms-collections.ts`**
- **Purpose**: Register CMS collections in Directus (if not auto-detected)
- **Usage**: `npx tsx scripts/register-cms-collections.ts`

**`scripts/sync-directus-schema.sh`**
- **Purpose**: Trigger Directus schema snapshot/apply (force re-introspection)
- **Usage**: `bash scripts/sync-directus-schema.sh`

---

## Integration with Next.js

### Fetching Content from Directus

**Homepage Hero (Singleton)**:
```typescript
// app/page.tsx
import { directus } from '@/lib/directus';

async function getHeroContent() {
  const response = await fetch(
    'https://admin.automatonicai.com/items/cms_homepage_hero',
    { next: { revalidate: 3600 } } // ISR: revalidate every hour
  );
  return response.json();
}

export default async function HomePage() {
  const { data: hero } = await getHeroContent();

  return (
    <HeroSection
      headline={hero.headline}
      subheadline={hero.subheadline}
      ctaPrimaryText={hero.cta_primary_text}
      ctaPrimaryLink={hero.cta_primary_link}
    />
  );
}
```

**Features Collection**:
```typescript
async function getFeatures(category: string) {
  const response = await fetch(
    `https://admin.automatonicai.com/items/cms_features?filter[category][_eq]=${category}&sort=sort_order&filter[enabled][_eq]=true`,
    { next: { revalidate: 3600 } }
  );
  return response.json();
}

// Usage
const { data: solutionPillars } = await getFeatures('solution-pillar');
```

**Blog Posts with Pagination**:
```typescript
async function getBlogPosts(page = 1, limit = 10) {
  const offset = (page - 1) * limit;
  const response = await fetch(
    `https://admin.automatonicai.com/items/cms_blog_posts?filter[status][_eq]=published&sort=-published_at&limit=${limit}&offset=${offset}&fields=*,featured_image.*`,
    { next: { revalidate: 300 } } // Revalidate every 5 minutes
  );
  return response.json();
}
```

### API Query Parameters

- **Filter**: `?filter[field][_eq]=value`
- **Sort**: `?sort=-published_at` (desc) or `?sort=sort_order` (asc)
- **Limit/Offset**: `?limit=10&offset=0`
- **Fields**: `?fields=*,featured_image.*` (include related files)
- **Search**: `?search=keyword`

### ISR Strategy

Use Next.js Incremental Static Regeneration (ISR) for optimal performance:

| Content Type | Revalidation Interval |
|--------------|----------------------|
| Homepage Hero | 1 hour (3600s) |
| Features | 1 hour (3600s) |
| About Page | 1 day (86400s) |
| Blog Listings | 5 minutes (300s) |
| Blog Detail | 15 minutes (900s) |
| Announcements | 1 minute (60s) |

---

## Troubleshooting

### Issue: "Route /cms_* doesn't exist"

**Cause**: Directus hasn't introspected the PostgreSQL table yet.

**Solution**:
1. SSH into server: `ssh -i ~/.ssh/aws-lightsail/chronos-prod-db ubuntu@16.52.210.100`
2. Verify table exists: `docker exec chronos-db psql -U chronos -d chronos -c '\\dt cms_*'`
3. Restart Directus: `cd chronos-db && docker compose restart directus`
4. Wait 10 seconds for Directus to fully start
5. Check collections endpoint: `curl https://admin.automatonicai.com/collections | jq '.data[] | select(.collection | startswith("cms_")) | .collection'`

### Issue: Singleton collection shows "Create" button

**Cause**: Collection metadata has `singleton: false`.

**Solution**:
1. Update collection via API:
   ```bash
   curl -X PATCH https://admin.automatonicai.com/collections/cms_homepage_hero \\
     -H "Authorization: Bearer YOUR_TOKEN" \\
     -H "Content-Type: application/json" \\
     -d '{"meta": {"singleton": true}}'
   ```

### Issue: Assets not appearing in R2

**Cause**: Directus storage configuration not set or assets uploaded to local storage.

**Solution**:
1. Check `/home/ubuntu/chronos-db/.env` for R2 config:
   ```
   STORAGE_LOCATIONS=r2
   STORAGE_R2_DRIVER=s3
   STORAGE_R2_KEY=...
   ```
2. Verify `docker-compose.yml` passes env vars to Directus container
3. Restart Directus: `docker compose restart directus`
4. Re-upload assets with `storage=r2` parameter

### Issue: Migration failed with "password required"

**Cause**: Local environment missing `DATABASE_URL` env var.

**Solution**: Apply migration directly via SSH:
```bash
ssh -i ~/.ssh/aws-lightsail/chronos-prod-db ubuntu@16.52.210.100 \\
  "docker exec chronos-db psql -U chronos -d chronos -f /tmp/migration.sql"
```

### Issue: Content not updating in Next.js

**Cause**: ISR cache not invalidated.

**Solution**:
1. Clear Next.js cache: `rm -rf apps/web/.next`
2. Rebuild: `pnpm build`
3. Or use On-Demand Revalidation:
   ```typescript
   // app/api/revalidate/route.ts
   import { revalidatePath } from 'next/cache';

   export async function POST(request: Request) {
     const { path } = await request.json();
     revalidatePath(path);
     return Response.json({ revalidated: true });
   }
   ```

---

## Next Steps

### 1. Build React Components

Create components to consume Directus content:
- `components/sections/HeroSection.tsx` (update to use Directus data)
- `components/sections/FeatureGrid.tsx`
- `components/sections/UseCaseSection.tsx`
- `components/sections/ProblemStatement.tsx`
- `components/blog/BlogCard.tsx`
- `components/blog/BlogDetail.tsx`

### 2. Create Page Routes

Build Next.js pages:
- `app/page.tsx` (Homepage - integrate Directus hero + features)
- `app/features/page.tsx` (Features page - 4 database modality sections)
- `app/about/page.tsx` (About page - founder story + mission)
- `app/blog/page.tsx` (Blog listing)
- `app/blog/[slug]/page.tsx` (Blog detail)

### 3. Add Waitlist Form

Create waitlist form that POST to Directus:
```typescript
// components/forms/WaitlistForm.tsx
async function submitToWaitlist(data: WaitlistData) {
  const response = await fetch('/api/waitlist', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return response.json();
}

// app/api/waitlist/route.ts
import { directus } from '@/lib/directus';

export async function POST(request: Request) {
  const data = await request.json();

  const response = await fetch(
    'https://admin.automatonicai.com/items/cms_waitlist_submissions',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.DIRECTUS_API_TOKEN}`,
      },
      body: JSON.stringify({
        email: data.email,
        first_name: data.firstName,
        last_name: data.lastName,
        company: data.company,
        role: data.role,
        source: data.source || 'homepage',
      }),
    }
  );

  return Response.json(await response.json());
}
```

### 4. Set Up Blog Infrastructure

- Create blog listing page with pagination
- Create blog detail page with syntax highlighting (for code examples)
- Add RSS feed generation
- Implement blog search/filtering by category and tags

### 5. Documentation

- Document API integration patterns
- Create content editing guide for non-technical users
- Document deployment and CI/CD for content updates

---

## Resources

- **Directus Documentation**: https://docs.directus.io
- **Drizzle ORM**: https://orm.drizzle.team
- **Next.js ISR**: https://nextjs.org/docs/app/building-your-application/data-fetching/incremental-static-regeneration
- **Cloudflare R2**: https://developers.cloudflare.com/r2
- **PostgreSQL Extensions**:
  - Apache AGE: https://age.apache.org
  - pgvector: https://github.com/pgvector/pgvector
  - PostGIS: https://postgis.net
  - TimescaleDB: https://docs.timescale.com

---

**Document Owner**: Geoff Bevans
**Last Reviewed**: 2025-12-24
**Status**: ✅ Complete
