# Payload CMS Content Creation Plan

## Current State: What's Already Set Up ✅

### 1. Architecture (Correct Understanding)

**You understand it PERFECTLY:**

```
┌─────────────────────────────────────────────────────────┐
│ VERCEL (Frontend + Payload CMS Server)                  │
│  ┌──────────────┐         ┌────────────────┐           │
│  │  Next.js 16  │◄────────┤  Payload CMS   │           │
│  │  (SSG Pages) │         │  Admin Panel   │           │
│  └──────────────┘         └────────────────┘           │
│         │                         │                     │
└─────────┼─────────────────────────┼─────────────────────┘
          │                         │
          │  ┌──────────────────────┼──────────────┐
          │  │                      │              │
          ▼  ▼                      ▼              ▼
   ┌───────────────┐      ┌──────────────┐  ┌──────────┐
   │  AWS S3       │      │ PostgreSQL   │  │ FastAPI  │
   │  (Media)      │      │ (AWS Light.) │  │ (Future) │
   └───────────────┘      └──────────────┘  └──────────┘
        project-          Same DB for both    Business
        chronos-          Payload & FastAPI    Logic
        media             Tables coexist

```

**Yes, everything is in ONE PostgreSQL database:**
- Payload CMS tables (pages, users, media metadata)
- Your future FastAPI tables (graph data, TimescaleDB)
- They coexist peacefully with different prefixes

### 2. What's Currently Working

✅ **Database Connection**: Payload → AWS PostgreSQL (16.52.210.100)
✅ **S3 Storage**: Media uploads → project-chronos-media bucket
✅ **Collections Configured**:
   - `Users` - Authentication and access control
   - `Media` - Digital Asset Management (DAM)
   - `Pages` - Content pages with Blocks (hero, content)
✅ **Lexical Editor**: Rich text editing
✅ **Admin Panel**: https://automatonicai.com/admin

### 3. Is It Really Working? (Let's Verify)

**Test checklist:**
1. Can you log into https://automatonicai.com/admin? (Need to create first user)
2. Can Payload create tables in PostgreSQL?
3. Can you upload media to S3?
4. Can you create a page?

**We'll test this in Step 1 below.**

## Payload CMS vs FastAPI: Division of Labor

### ✅ USE PAYLOAD CMS FOR:

#### Content Infrastructure (What You Said)
1. **Static Content Pages** (SSG)
   - Homepage, About, Features, Services
   - Blog posts
   - Marketing pages

2. **Digital Asset Management**
   - Image uploads → S3
   - Automatic image optimization (thumbnails, responsive sizes)
   - Alt text, captions, metadata

3. **Authentication & Access Control**
   - User login (admin, editors, contributors)
   - Role-based permissions ("Admins can publish, Editors need approval")
   - API key management

4. **Content Modeling**
   - Define schemas in TypeScript (git-versioned!)
   - Relationships between content types
   - Validation and required fields

5. **Versioning & Drafts**
   - Auto-save drafts
   - Publish/unpublish workflow
   - Revision history (built-in audit trail)

6. **Forms (Simple Contact Forms)**
   - **Use Payload** for form data storage
   - **Use React Hook Form** for client-side validation
   - They work together: RHF handles UX, Payload stores submissions

   **Example:**
   ```typescript
   // collections/FormSubmissions.ts
   export const FormSubmissions: CollectionConfig = {
     slug: 'form-submissions',
     fields: [
       { name: 'name', type: 'text', required: true },
       { name: 'email', type: 'email', required: true },
       { name: 'message', type: 'textarea', required: true },
       { name: 'submittedAt', type: 'date', admin: { readOnly: true } },
     ],
     access: {
       create: () => true, // Anyone can submit
       read: ({ req }) => req.user?.role === 'admin', // Only admins see submissions
     },
   }
   ```

### ❌ USE FASTAPI FOR:

#### Business Logic Infrastructure
1. **Custom Data Processing**
   - Apache AGE graph queries
   - TimescaleDB time-series analysis
   - Complex financial calculations

2. **External API Integrations**
   - Third-party data sources
   - Webhooks and event processing
   - Real-time data pipelines

3. **Custom Authorization**
   - Multi-tenancy logic
   - Subscription tier checks
   - Usage-based billing

4. **Performance-Critical Operations**
   - Large dataset queries
   - ML model inference
   - Background job processing

## Directory Cleanup

### Orphaned Directories

**`/frontend/`** - ✅ **ORPHAN - Safe to delete**
- Old structure from before NX monorepo
- Everything now lives in `apps/web/`
- Delete: `rm -rf frontend/`

**`/media_assets/`** - As you said, disregard (probably local design files)

**`/marketing/`** - ✅ **KEEP** - Your branding assets

**Active directories:**
- `apps/web/` - Your Next.js + Payload CMS app ✅
- `packages/` - Shared code (if any - check if empty)
- `docs/marketing/copy/` - Marketing content to migrate ✅

## Content Migration Plan

### Phase 1: Verify Payload CMS Works (Day 1 - 2 hours)

#### Step 1.1: Create First Admin User

**Option A: Via Vercel Console (if database is seeded)**
1. Go to: https://automatonicai.com/admin
2. If it redirects to create-first-user, fill out the form
3. Email: your-email@example.com
4. Password: (strong password - store in KeepassXC)

**Option B: Via Local Development**
```bash
cd apps/web
pnpm dev
# Go to http://localhost:3000/admin
# Create first user via UI
```

#### Step 1.2: Test Database Connection

After logging in:
1. Go to Collections → Users
2. You should see your user
3. Go to pgAdmin or psql:
   ```bash
   ssh ubuntu@16.52.210.100
   sudo -u postgres psql chronos
   \dt  # List tables - you should see payload_* tables
   SELECT * FROM users LIMIT 1;  # See your user
   ```

#### Step 1.3: Test S3 Upload

1. In admin panel: Collections → Media → Create New
2. Upload a test image
3. Verify it appears in S3:
   ```bash
   aws s3 ls s3://project-chronos-media/media/
   ```

**If ANY of these fail, we debug before proceeding.**

### Phase 2: Extend Payload Collections (Day 1-2)

#### Add More Block Types for Homepage

**File:** `apps/web/collections/Pages.ts`

Expand the `layout` blocks to match your marketing copy:

```typescript
layout: {
  type: 'blocks',
  blocks: [
    // Existing hero block
    {
      slug: 'hero',
      labels: {
        singular: 'Hero Section',
        plural: 'Hero Sections',
      },
      fields: [
        {
          name: 'eyebrow',
          type: 'text',
          label: 'Eyebrow Text (small text above headline)',
        },
        {
          name: 'headline',
          type: 'text',
          required: true,
          label: 'Main Headline (H1)',
        },
        {
          name: 'subheadline',
          type: 'textarea',
          label: 'Subheadline',
        },
        {
          name: 'ctaPrimary',
          type: 'group',
          fields: [
            { name: 'text', type: 'text', defaultValue: 'Get Started' },
            { name: 'url', type: 'text', defaultValue: '/contact' },
          ],
        },
        {
          name: 'ctaSecondary',
          type: 'group',
          fields: [
            { name: 'text', type: 'text' },
            { name: 'url', type: 'text' },
          ],
        },
        {
          name: 'backgroundImage',
          type: 'upload',
          relationTo: 'media',
        },
        {
          name: 'backgroundGradient',
          type: 'select',
          options: [
            { label: 'None', value: 'none' },
            { label: 'Dark', value: 'dark' },
            { label: 'Purple', value: 'purple' },
          ],
        },
      ],
    },

    // Features grid
    {
      slug: 'features-grid',
      labels: { singular: 'Features Grid', plural: 'Features Grids' },
      fields: [
        { name: 'heading', type: 'text' },
        { name: 'description', type: 'textarea' },
        {
          name: 'features',
          type: 'array',
          fields: [
            { name: 'icon', type: 'text', label: 'Icon name (lucide-react)' },
            { name: 'title', type: 'text' },
            { name: 'description', type: 'textarea' },
          ],
        },
      ],
    },

    // Stats/metrics section
    {
      slug: 'stats',
      labels: { singular: 'Stats Section', plural: 'Stats Sections' },
      fields: [
        {
          name: 'stats',
          type: 'array',
          fields: [
            { name: 'value', type: 'text', label: 'Number/Value' },
            { name: 'label', type: 'text' },
            { name: 'description', type: 'textarea' },
          ],
        },
      ],
    },

    // Rich content block (for long-form copy)
    {
      slug: 'rich-content',
      labels: { singular: 'Rich Content', plural: 'Rich Content Blocks' },
      fields: [
        {
          name: 'content',
          type: 'richText',
          required: true,
        },
      ],
    },

    // Call-to-action
    {
      slug: 'cta-banner',
      labels: { singular: 'CTA Banner', plural: 'CTA Banners' },
      fields: [
        { name: 'heading', type: 'text' },
        { name: 'text', type: 'textarea' },
        { name: 'buttonText', type: 'text' },
        { name: 'buttonUrl', type: 'text' },
        { name: 'backgroundColor', type: 'select', options: ['dark', 'purple', 'gradient'] },
      ],
    },
  ],
}
```

### Phase 3: Create Frontend Components (Day 2-3)

**File:** `apps/web/app/components/blocks/`

Create React components for each block type:

**`HeroBlock.tsx`:**
```typescript
import type { Page } from '@/payload-types'

type HeroBlock = Extract<Page['layout'][number], { blockType: 'hero' }>

export function HeroBlock({ block }: { block: HeroBlock }) {
  return (
    <section className="relative min-h-[600px] flex items-center">
      {block.backgroundImage && (
        <div className="absolute inset-0">
          <img
            src={block.backgroundImage.url}
            alt=""
            className="w-full h-full object-cover"
          />
        </div>
      )}

      <div className="relative z-10 container mx-auto px-4">
        {block.eyebrow && (
          <p className="text-sm uppercase tracking-wide text-purple-400 mb-4">
            {block.eyebrow}
          </p>
        )}

        <h1 className="text-6xl font-bold mb-6">
          {block.headline}
        </h1>

        {block.subheadline && (
          <p className="text-xl text-gray-300 mb-8 max-w-2xl">
            {block.subheadline}
          </p>
        )}

        <div className="flex gap-4">
          {block.ctaPrimary && (
            <a href={block.ctaPrimary.url} className="btn-primary">
              {block.ctaPrimary.text}
            </a>
          )}
          {block.ctaSecondary && (
            <a href={block.ctaSecondary.url} className="btn-secondary">
              {block.ctaSecondary.text}
            </a>
          )}
        </div>
      </div>
    </section>
  )
}
```

**Similar components for:**
- `FeaturesGridBlock.tsx`
- `StatsBlock.tsx`
- `RichContentBlock.tsx`
- `CTABannerBlock.tsx`

### Phase 4: Dynamic Page Rendering (Day 3)

**File:** `apps/web/app/[slug]/page.tsx`

Create dynamic pages that render Payload content:

```typescript
import { getPayloadHMR } from '@payloadcms/next/utilities'
import configPromise from '@payload-config'
import { HeroBlock } from '@/components/blocks/HeroBlock'
import { FeaturesGridBlock } from '@/components/blocks/FeaturesGridBlock'
// ... other imports

export async function generateStaticParams() {
  const payload = await getPayloadHMR({ config: configPromise })
  const pages = await payload.find({
    collection: 'pages',
    limit: 1000,
  })

  return pages.docs.map((page) => ({
    slug: page.slug,
  }))
}

export default async function Page({ params }: { params: { slug: string } }) {
  const payload = await getPayloadHMR({ config: configPromise })

  const pages = await payload.find({
    collection: 'pages',
    where: {
      slug: {
        equals: params.slug,
      },
    },
  })

  const page = pages.docs[0]
  if (!page) return notFound()

  return (
    <main>
      {page.layout?.map((block, index) => {
        switch (block.blockType) {
          case 'hero':
            return <HeroBlock key={index} block={block} />
          case 'features-grid':
            return <FeaturesGridBlock key={index} block={block} />
          case 'stats':
            return <StatsBlock key={index} block={block} />
          case 'rich-content':
            return <RichContentBlock key={index} block={block} />
          case 'cta-banner':
            return <CTABannerBlock key={index} block={block} />
          default:
            return null
        }
      })}
    </main>
  )
}
```

### Phase 5: Migrate Homepage Copy (Day 4)

1. **Log into Payload admin:** https://automatonicai.com/admin
2. **Create new page:**
   - Collections → Pages → Create New
   - Title: "Home"
   - Slug: "home"

3. **Add Hero block** (from docs/marketing/copy/homepage.md):
   - Eyebrow: "AI-POWERED MARKET INTELLIGENCE"
   - Headline: "Turn Market Chaos Into Clarity"
   - Subheadline: "Multi-modal database intelligence for private market professionals..."
   - CTA Primary: "Start Free Trial" → /signup
   - CTA Secondary: "See How It Works" → /demo

4. **Add Features Grid block**
5. **Add Stats block**
6. **Add CTA Banner**
7. **Publish**

8. **Update homepage route:**
   ```typescript
   // apps/web/app/page.tsx
   import { redirect } from 'next/navigation'
   export default function HomePage() {
     return redirect('/home')  // Or render home page directly
   }
   ```

## Forms: Payload + React Hook Form

### How They Work Together

```typescript
// apps/web/app/contact/page.tsx
'use client'
import { useForm } from 'react-hook-form'

export default function ContactPage() {
  const { register, handleSubmit, formState: { errors } } = useForm()

  const onSubmit = async (data) => {
    // Submit to Payload's REST API
    const res = await fetch('/api/form-submissions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...data,
        submittedAt: new Date().toISOString(),
      }),
    })

    if (res.ok) {
      alert('Thanks! We\\'ll be in touch.')
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input
        {...register('name', { required: 'Name is required' })}
        placeholder="Your name"
      />
      {errors.name && <span>{errors.name.message}</span>}

      <input
        {...register('email', {
          required: 'Email is required',
          pattern: { value: /^\S+@\S+$/, message: 'Invalid email' }
        })}
        type="email"
        placeholder="your@email.com"
      />
      {errors.email && <span>{errors.email.message}</span>}

      <textarea
        {...register('message', { required: 'Message is required' })}
        placeholder="How can we help?"
      />

      <button type="submit">Send Message</button>
    </form>
  )
}
```

**Division:**
- **React Hook Form**: Client-side validation, UX, error messages
- **Payload CMS**: Server-side storage, access control, admin view of submissions

## Timeline & Deliverables

### Week 1: Setup & Migration
- **Day 1**: Verify Payload works, create first user ✅
- **Day 2**: Extend Page blocks, create components
- **Day 3**: Dynamic page rendering, test SSG
- **Day 4**: Migrate homepage from marketing copy
- **Day 5**: Migrate Features page, About page

### Week 2: Content & Polish
- **Day 6-7**: Blog collection + first 2-3 posts
- **Day 8-9**: Contact form with Payload backend
- **Day 10**: SEO metadata, Open Graph images

## Testing Checklist

Before going live with content:

- [ ] Can create/edit/delete pages in admin?
- [ ] Do pages render correctly on frontend?
- [ ] Are images loading from S3?
- [ ] Is SSG working (check build output)?
- [ ] Can non-admin users NOT access admin?
- [ ] Are drafts saving automatically?
- [ ] Can publish/unpublish pages?

## Next Steps

1. **NOW**: Test that Payload admin works (create first user)
2. **THEN**: I'll help extend the collections and create components
3. **FINALLY**: Migrate your marketing copy into Payload

**Ready to test Step 1 (create first user)?** Let me know if you can access https://automatonicai.com/admin or if we should test locally first.
