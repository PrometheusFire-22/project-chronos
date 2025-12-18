# Payload CMS + Next.js 15 Integration Architecture
## Web App (apps/web) - CMS/Code Separation & Block-Based Layout System

**Last Updated**: 2025-12-16
**Version**: 1.0 (Post-Stabilization)
**Scope**: apps/web Payload CMS implementation

---

## Table of Contents

1. [Overview](#overview)
2. [Technology Stack](#technology-stack)
3. [CMS/Code Separation](#cmscode-separation)
4. [Project Structure](#project-structure)
5. [Data Architecture](#data-architecture)
6. [Frontend Rendering](#frontend-rendering)
7. [Development Workflow](#development-workflow)
8. [Best Practices](#best-practices)

---

## Overview

Project Chronos uses **Payload CMS 3.0** as a headless CMS integrated with **Next.js 15 App Router**. The architecture follows a strict separation between:

- **CMS** (Content): Manages content, navigation, media, and layout ordering
- **Code** (Structure): Defines routing, data models, components, and business logic

This separation enables:
- ✅ Non-technical users to manage content without code changes
- ✅ Developers to evolve structure without CMS data migrations
- ✅ Version control for both code and content (content in DB, structure in Git)
- ✅ Type-safe integration between CMS and frontend

---

## Technology Stack

### Core Technologies

| Component | Technology | Version | Purpose |
|-----------|------------|---------|---------|
| **Framework** | Next.js | 15.4.10 | React framework with App Router |
| **CMS** | Payload CMS | 3.68.5 | Headless CMS and admin UI |
| **Runtime** | React | 19.2.1 | UI library |
| **Database** | PostgreSQL | 16.x | Data persistence (AWS Lightsail) |
| **Storage** | AWS S3 | - | Media/asset storage |
| **Styling** | Tailwind CSS | 3.4.3 | Utility-first CSS |
| **Rich Text** | Lexical | - | Rich text editor |
| **Package Manager** | pnpm | 9.1.0+ | Workspace management |
| **Monorepo** | NX | 22.2.0 | Build orchestration |

### Key Dependencies

```json
{
  "@payloadcms/db-postgres": "^3.68.5",
  "@payloadcms/next": "^3.68.5",
  "@payloadcms/richtext-lexical": "^3.68.5",
  "@payloadcms/storage-s3": "^3.68.5"
}
```

### Why Next.js 15.4.10 (Not 16.x)?

**Critical Decision**: We use Next.js 15.4.10 (stable), NOT Next.js 16.x canary.

**Reason**: Payload CMS officially supports Next.js 15.4.x only. Using Next.js 16 causes:
- Client-side hydration errors (`Q() is undefined`)
- Admin UI failures
- Turbopack production build incompatibilities

**Future Migration**: When Payload announces Next.js 16 support, follow `docs/UPGRADING.md`.

---

## CMS/Code Separation

### What the CMS Owns

The CMS (Payload) manages **content and configuration**:

- ✅ **Page Content**: Headlines, body text, descriptions
- ✅ **Media**: Images, videos, documents (stored in S3)
- ✅ **Navigation**: Header menu items, footer links
- ✅ **Layout Ordering**: Which blocks appear on which pages, in what order
- ✅ **Feature Flags**: Show/hide sections, enable/disable features
- ✅ **SEO Metadata**: Page titles, meta descriptions, OG images

**Changes made in Payload admin**:
- No code changes required
- No deployments required (for content updates)
- Instant preview via API

### What Code Owns

The codebase defines **structure and behavior**:

- ✅ **Data Models**: Collections, Globals, Blocks (TypeScript definitions)
- ✅ **Routing**: URL structure, dynamic routes, redirects
- ✅ **Components**: React components that render blocks
- ✅ **Styling**: Tailwind classes, design system
- ✅ **Business Logic**: Authentication, permissions, data validation
- ✅ **Integrations**: External APIs, analytics, third-party services

**Changes made in code**:
- Require Git commits
- Require deployments
- Define new capabilities (new block types, new fields)

### Example: Adding a New Page

**Content Manager (via CMS)**:
1. Log into Payload admin at `/admin`
2. Navigate to **Pages** collection
3. Click **Create New**
4. Enter title: "About Us"
5. Set slug: "about"
6. Add blocks: Hero → Content → CTA
7. Fill in content for each block
8. Save and publish

**Result**: New page live at `/about` with NO code changes.

**Developer (via Code)**:
To add a new *type* of block (e.g., "Testimonial Block"):
1. Create `apps/web/blocks/Testimonial.ts` (Payload config)
2. Create `apps/web/app/(frontend)/[[...slug]]/blocks/TestimonialBlock.tsx` (React component)
3. Add to `RenderBlocks.tsx` switch statement
4. Update `Pages.ts` blocks array
5. Commit, push, deploy

**Result**: Content managers can now use Testimonial blocks on any page.

---

## Project Structure

```
apps/web/
├── app/                          # Next.js App Router
│   ├── (frontend)/              # Public-facing pages
│   │   ├── [[...slug]]/        # Dynamic page routes
│   │   │   ├── page.tsx        # Page fetcher and renderer
│   │   │   ├── RenderBlocks.tsx # Block routing logic
│   │   │   └── blocks/         # Block React components
│   │   │       ├── HeroBlock.tsx
│   │   │       ├── ContentBlock.tsx
│   │   │       ├── MediaBlockComponent.tsx
│   │   │       └── CTABlock.tsx
│   │   └── layout.tsx          # Frontend layout (header/footer)
│   ├── (payload)/              # Payload admin UI
│   │   └── [[...segments]]/    # Admin routes
│   └── api/                    # API routes
│       └── (payload)/          # Payload REST API
│           └── [...slug]/
├── collections/                 # Payload collections (data models)
│   ├── Users.ts                # User authentication
│   ├── Media.ts                # Media library
│   └── Pages.ts                # Page content
├── globals/                     # Payload globals (singletons)
│   ├── Header.ts               # Site header config
│   └── Footer.ts               # Site footer config
├── blocks/                      # Payload block definitions
│   ├── Hero.ts                 # Hero block config
│   ├── Content.ts              # Content block config
│   ├── MediaBlock.ts           # Media block config
│   └── CallToAction.ts         # CTA block config
├── payload.config.ts            # Payload configuration
├── next.config.js              # Next.js configuration
└── tsconfig.json               # TypeScript configuration
```

### Route Groups Explained

| Route Group | Purpose | Example URL | Renders |
|-------------|---------|-------------|---------|
| `(frontend)` | Public pages | `/`, `/about`, `/contact` | CMS-managed content |
| `(payload)` | Admin UI | `/admin`, `/admin/collections/pages` | Payload admin panel |
| `api/(payload)` | REST API | `/api/pages`, `/api/media` | JSON responses |

Route groups (`(name)`) do NOT appear in URLs. They're organizational.

---

## Data Architecture

### Collections

**Collections** are content types with multiple documents.

#### Users
```typescript
{
  slug: 'users',
  auth: true,
  fields: [
    // email, password (auto-added by auth: true)
  ]
}
```

**Purpose**: User authentication and management
**Access**: First user can self-register, then admin-only
**Used For**: Admin login, content author management

#### Media
```typescript
{
  slug: 'media',
  upload: {
    staticURL: '/media',
    staticDir: 'media',
  },
  fields: [
    // alt text, caption, metadata
  ]
}
```

**Purpose**: Digital asset management (images, videos, docs)
**Storage**: AWS S3 (`project-chronos-media` bucket)
**Used For**: Page images, background images, downloadable assets

#### Pages
```typescript
{
  slug: 'pages',
  fields: [
    { name: 'title', type: 'text' },
    { name: 'slug', type: 'text', unique: true },
    { name: 'description', type: 'textarea' },
    { name: 'isHome', type: 'checkbox' },
    { name: 'layout', type: 'blocks', blocks: [...] }
  ]
}
```

**Purpose**: CMS-managed pages with block-based layouts
**Access**: Public read, admin write
**Used For**: Homepage, About, Contact, any landing page

### Globals

**Globals** are singletons (one document per slug).

#### Header
```typescript
{
  slug: 'header',
  fields: [
    { name: 'navItems', type: 'array' },
    { name: 'ctaButton', type: 'group' }
  ]
}
```

**Purpose**: Site-wide header navigation
**Editable In**: `/admin/globals/header`
**Rendered In**: `app/(frontend)/layout.tsx`

#### Footer
```typescript
{
  slug: 'footer',
  fields: [
    { name: 'columns', type: 'array' },
    { name: 'socialLinks', type: 'array' },
    { name: 'copyright', type: 'text' }
  ]
}
```

**Purpose**: Site-wide footer content
**Editable In**: `/admin/globals/footer`
**Rendered In**: `app/(frontend)/layout.tsx`

### Blocks

**Blocks** are reusable content modules for layout building.

#### Hero Block
```typescript
{
  slug: 'hero',
  fields: [
    { name: 'type', type: 'select' },       // default | centered | split
    { name: 'heading', type: 'text' },
    { name: 'subheading', type: 'text' },
    { name: 'text', type: 'richText' },
    { name: 'backgroundImage', type: 'upload' },
    { name: 'cta', type: 'group' }
  ]
}
```

**Use Case**: Page headers, landing page heroes, banner sections

#### Content Block
```typescript
{
  slug: 'content',
  fields: [
    { name: 'content', type: 'richText' },
    { name: 'layout', type: 'select' },     // full | centered | narrow
    { name: 'backgroundColor', type: 'select' }
  ]
}
```

**Use Case**: Long-form content, article bodies, text sections

#### Media Block
```typescript
{
  slug: 'mediaBlock',
  fields: [
    { name: 'media', type: 'upload' },
    { name: 'caption', type: 'text' },
    { name: 'size', type: 'select' },       // small | medium | large | full
    { name: 'position', type: 'select' }    // left | center | right
  ]
}
```

**Use Case**: Image galleries, featured images, video embeds

#### Call-to-Action Block
```typescript
{
  slug: 'cta',
  fields: [
    { name: 'heading', type: 'text' },
    { name: 'text', type: 'textarea' },
    { name: 'buttons', type: 'array' },
    { name: 'backgroundColor', type: 'select' }
  ]
}
```

**Use Case**: Conversion sections, newsletter signups, contact prompts

---

## Frontend Rendering

### Request Flow

```mermaid
graph TD
    A[User requests /about] --> B[Next.js App Router]
    B --> C[app/frontend/[[...slug]]/page.tsx]
    C --> D[getPayload config]
    D --> E[Query Payload API]
    E --> F[PostgreSQL]
    F --> G[Return page data]
    G --> H[RenderBlocks]
    H --> I[Map blocks to components]
    I --> J[HeroBlock ContentBlock etc]
    J --> K[Render HTML]
    K --> L[Return to user]
```

### Dynamic Routing

**File**: `app/(frontend)/[[...slug]]/page.tsx`

```typescript
export default async function Page({ params }: PageProps) {
  const slug = params.slug?.join('/') || 'home';

  const result = await payload.find({
    collection: 'pages',
    where: {
      or: [
        { slug: { equals: slug } },
        { isHome: { equals: slug === 'home' } }
      ]
    },
    depth: 2
  });

  return <RenderBlocks blocks={page.layout} />;
}
```

**How It Works**:
1. Extract slug from URL (e.g., `/about` → `slug = "about"`)
2. Query Payload for page with matching slug
3. If slug is empty or "home", look for page with `isHome: true`
4. Fetch related data (depth: 2 for media relationships)
5. Pass blocks to `RenderBlocks` component

### Block Rendering

**File**: `app/(frontend)/[[...slug]]/RenderBlocks.tsx`

```typescript
export function RenderBlocks({ blocks }: RenderBlocksProps) {
  return blocks.map((block, index) => {
    switch (block.blockType) {
      case 'hero':
        return <HeroBlock key={index} {...block} />;
      case 'content':
        return <ContentBlock key={index} {...block} />;
      // ... etc
    }
  });
}
```

**How It Works**:
1. Iterate over blocks array from Payload
2. Switch on `blockType` field
3. Render corresponding React component
4. Pass all block fields as props

### Layout System

**File**: `app/(frontend)/layout.tsx`

```typescript
export default async function FrontendLayout({ children }) {
  const header = await payload.findGlobal({ slug: 'header' });
  const footer = await payload.findGlobal({ slug: 'footer' });

  return (
    <>
      <Header data={header} />
      <main>{children}</main>
      <Footer data={footer} />
    </>
  );
}
```

**How It Works**:
1. Fetch Header and Footer globals once per request
2. Render header navigation from CMS data
3. Render page content (children)
4. Render footer from CMS data

**Result**: Consistent header/footer across all pages, editable via CMS.

---

## Development Workflow

### Local Development

```bash
# Start development server
pnpm dev

# Visit frontend
open http://localhost:3000

# Visit admin
open http://localhost:3000/admin
```

### Making Changes

#### Content Changes (via CMS)
1. Navigate to `/admin`
2. Log in
3. Edit collections/globals
4. Save
5. Refresh frontend

**No build, no deploy.**

#### Code Changes (via Git)
1. Create feature branch: `git checkout -b feature/new-block`
2. Make changes (add block, modify component)
3. Test locally: `pnpm dev`
4. Commit: `git commit -m "feat: add testimonial block"`
5. Push: `git push`
6. Create PR
7. Deploy after merge

### Deployment

**Platform**: Vercel
**Branch**: `main` (auto-deploys)
**Environment Variables**:
- `POSTGRES_URL` - Database connection string
- `PAYLOAD_SECRET` - Encryption key
- `NEXT_PUBLIC_SERVER_URL` - Public URL
- `S3_BUCKET`, `S3_REGION`, `S3_ACCESS_KEY_ID`, `S3_SECRET_ACCESS_KEY` - Media storage

**Build Command**: `pnpm --filter @chronos/web build`
**Output**: `.next/` directory

---

## Best Practices

### CMS Configuration

✅ **DO**:
- Use `access` functions for fine-grained permissions
- Add `admin.description` to fields for editor guidance
- Use `unique: true` and `index: true` for slugs
- Provide `defaultValue` for optional fields
- Group related fields with `type: 'group'`

❌ **DON'T**:
- Hardcode sensitive data in collections
- Allow public write access to collections
- Create deeply nested field structures (>3 levels)
- Use overly generic field names (e.g., "data", "info")

### Frontend Components

✅ **DO**:
- Use TypeScript for all components
- Handle missing/null data gracefully
- Use Next.js `<Image>` for media
- Follow Tailwind utility-first patterns
- Add accessibility attributes (alt, aria-*)

❌ **DON'T**:
- Fetch data in client components (use server components)
- Mutate Payload data directly in frontend
- Hardcode URLs (use relative paths or env vars)
- Inline large CSS (use Tailwind or CSS modules)

### Database

✅ **DO**:
- Use migrations for schema changes (Payload auto-generates)
- Back up database before major changes
- Monitor query performance (slow queries)
- Use transactions for multi-step operations

❌ **DON'T**:
- Manually edit Payload tables (use admin UI or API)
- Store large files in database (use S3)
- Delete tables manually (use Payload migrations)

### Security

✅ **DO**:
- Rotate `PAYLOAD_SECRET` annually
- Use environment variables for secrets
- Enable HTTPS in production
- Implement rate limiting on API routes
- Validate file uploads (type, size)

❌ **DON'T**:
- Commit `.env` files to Git
- Allow SQL injection (Payload prevents this)
- Trust user input without validation
- Use weak passwords for admin accounts

---

## Troubleshooting

### Admin UI Not Loading

**Symptoms**: Blank page, JavaScript errors, "Q() is undefined"
**Cause**: Next.js version incompatibility
**Fix**: Ensure Next.js is 15.4.10 (NOT 16.x)

### Media Not Uploading

**Symptoms**: Upload fails, 500 error
**Cause**: S3 credentials or bucket misconfiguration
**Fix**: Verify env vars: `S3_BUCKET`, `S3_REGION`, `S3_ACCESS_KEY_ID`, `S3_SECRET_ACCESS_KEY`

### Pages Not Rendering

**Symptoms**: 404 on valid pages
**Cause**: Slug mismatch or missing page data
**Fix**: Check Payload admin - verify page exists with correct slug

### Build Errors

**Symptoms**: TypeScript errors, module not found
**Cause**: Missing imports or type mismatches
**Fix**: Run `pnpm install`, check `@payload-config` path alias in `tsconfig.json`

---

## References

- [Payload CMS Docs](https://payloadcms.com/docs)
- [Next.js App Router Docs](https://nextjs.org/docs/app)
- [Project Stabilization Plan](../../PAYLOAD_STABILIZATION_PLAN.md)
- [Deployment Guide](./DEPLOYMENT.md) (TODO)
- [Upgrade Guide](./UPGRADING.md) (TODO)

---

**Last Updated**: 2025-12-16
**Maintained By**: Development Team
**Questions?**: Open an issue on GitHub
