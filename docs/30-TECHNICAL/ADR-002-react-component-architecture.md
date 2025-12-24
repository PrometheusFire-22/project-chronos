# ADR-002: React Component Architecture for Marketing Site

**Status**: Proposed
**Date**: 2025-12-24
**Author**: Claude Code + Geoff Bevans
**Deciders**: Geoff Bevans

---

## Context and Problem Statement

We need to build a marketing website that consumes content from Directus CMS while maintaining:
- **Performance**: Fast initial page loads, optimal SEO
- **Maintainability**: Clear component hierarchy, easy to update
- **Type Safety**: Full TypeScript coverage
- **Developer Experience**: Consistent patterns, reusable components
- **Design System Consistency**: Adhering to brand guidelines

The existing decisions are solid:
- ✅ TypeScript for type safety
- ✅ React for UI components
- ✅ Next.js 14+ App Router for SSR/SSG
- ✅ Tailwind CSS for styling
- ✅ shadcn/ui for base components
- ✅ React Hook Form for form handling

**Question**: How do we architect React components to optimally consume Directus content while maintaining these standards?

---

## Decision Drivers

1. **Next.js App Router Best Practices**: Leverage Server Components by default
2. **SEO Requirements**: Marketing site needs excellent SEO (static generation preferred)
3. **Content Flexibility**: Directus content should be easy to update without code changes
4. **Performance Budget**: Target <2s LCP, >90 Lighthouse score
5. **Component Reusability**: Avoid duplication across homepage, features, about pages
6. **Type Safety**: All Directus API responses must be typed
7. **Incremental Adoption**: Can iterate and improve without breaking existing work

---

## Considered Options

### Option A: Client-Side Only (CSR)
- Fetch all Directus content in browser
- Use React Query/SWR for data fetching
- ❌ **Rejected**: Poor SEO, slower initial load, unnecessary complexity

### Option B: Static Generation Only (SSG)
- Generate all pages at build time
- Rebuild entire site on content changes
- ⚠️ **Partial**: Good for SEO but inflexible for frequent content updates

### Option C: Incremental Static Regeneration (ISR) - **RECOMMENDED**
- Generate pages statically at build time
- Revalidate on-demand or time-based
- Serve cached pages while revalidating in background
- ✅ **Best of both worlds**: SEO + fresh content + performance

### Option D: Server-Side Rendering (SSR)
- Fetch Directus content on every request
- ❌ **Rejected**: Slower TTFB, unnecessary server load for mostly static content

---

## Decision

**We will use Next.js App Router with Incremental Static Regeneration (ISR) and Server Components as the default pattern.**

### Architecture Principles

1. **Server Components by Default**
   - All components are Server Components unless they need interactivity
   - Fetch Directus data directly in Server Components (no client-side fetching)
   - Reduces JavaScript bundle size dramatically

2. **Client Components Only When Necessary**
   - Forms (React Hook Form)
   - Interactive UI (modals, accordions, animations)
   - Browser-only APIs (localStorage, window events)
   - Mark with `'use client'` directive

3. **Composition Over Configuration**
   - Build small, composable components
   - Pass data down from page-level fetches
   - Avoid prop drilling with proper component structure

4. **Type-First Development**
   - Define TypeScript interfaces for all Directus collections
   - Use Zod for runtime validation of API responses
   - Generate types from Directus schema (future: automated)

---

## Component Hierarchy

```
app/
├── page.tsx                          # Homepage (Server Component)
├── features/
│   └── page.tsx                      # Features page (Server Component)
├── about/
│   └── page.tsx                      # About page (Server Component)
└── blog/
    ├── page.tsx                      # Blog listing (Server Component)
    └── [slug]/
        └── page.tsx                  # Blog detail (Server Component)

components/
├── layout/
│   ├── Header.tsx                    # Server Component (static nav)
│   └── Footer.tsx                    # Server Component (static footer)
├── sections/                         # Page sections (Server Components)
│   ├── HeroSection.tsx               # Homepage hero
│   ├── ProblemStatement.tsx          # 3-column pain points
│   ├── SolutionPillars.tsx           # 4 database modalities
│   ├── FeaturesPreview.tsx           # 3 key features
│   ├── UseCaseSection.tsx            # 3 use cases
│   ├── FounderStory.tsx              # About page founder story
│   ├── MissionValues.tsx             # About page mission
│   └── FeatureDeepDive.tsx           # Features page deep dive
├── ui/                               # shadcn/ui components (mix of Server/Client)
│   ├── button.tsx                    # Client Component
│   ├── card.tsx                      # Server Component
│   ├── accordion.tsx                 # Client Component
│   └── ...                           # Other shadcn components
├── forms/                            # Form components (Client Components)
│   └── WaitlistForm.tsx              # Inline waitlist form
└── blog/
    ├── BlogCard.tsx                  # Server Component
    ├── BlogGrid.tsx                  # Server Component
    └── BlogContent.tsx               # Server Component (MDX rendering)
```

---

## Data Fetching Strategy

### 1. Fetch at Page Level (Server Components)

```typescript
// app/page.tsx
import { getHeroContent, getFeatures } from '@/lib/directus';
import { HeroSection } from '@/components/sections/HeroSection';
import { SolutionPillars } from '@/components/sections/SolutionPillars';

export const revalidate = 3600; // ISR: revalidate every hour

export default async function HomePage() {
  // Fetch all page data in parallel at top level
  const [hero, pillars, features, useCases] = await Promise.all([
    getHeroContent(),
    getFeatures('solution-pillar'),
    getFeatures('key-feature'),
    getFeatures('use-case'),
  ]);

  return (
    <>
      <HeroSection data={hero} />
      <SolutionPillars data={pillars} />
      <FeaturesPreview data={features} />
      <UseCaseSection data={useCases} />
    </>
  );
}
```

**Why this pattern?**
- Single fetch per page (parallel requests)
- Data passed as props (explicit, type-safe)
- Components remain simple and testable
- Easy to reason about data flow

### 2. Directus Client Library

```typescript
// lib/directus/client.ts
export async function fetchDirectus<T>(
  endpoint: string,
  options?: {
    revalidate?: number;
    tags?: string[];
  }
): Promise<T> {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_DIRECTUS_URL}${endpoint}`,
    {
      next: {
        revalidate: options?.revalidate ?? 3600,
        tags: options?.tags,
      },
    }
  );

  if (!response.ok) {
    throw new Error(`Directus API error: ${response.statusText}`);
  }

  return response.json();
}

// lib/directus/collections.ts
import { z } from 'zod';

// Define Zod schemas for validation
export const HomepageHeroSchema = z.object({
  headline: z.string(),
  subheadline: z.string(),
  cta_primary_text: z.string(),
  cta_primary_link: z.string(),
  cta_secondary_text: z.string().optional(),
  cta_secondary_link: z.string().optional(),
  active: z.boolean(),
});

export type HomepageHero = z.infer<typeof HomepageHeroSchema>;

export async function getHeroContent(): Promise<HomepageHero> {
  const response = await fetchDirectus<{ data: HomepageHero }>(
    '/items/cms_homepage_hero'
  );
  return HomepageHeroSchema.parse(response.data);
}

export const FeatureSchema = z.object({
  id: z.string(),
  title: z.string(),
  slug: z.string(),
  description: z.string(),
  icon: z.string().optional(),
  image: z.string().optional(),
  category: z.string(),
  sort_order: z.number(),
  enabled: z.boolean(),
});

export type Feature = z.infer<typeof FeatureSchema>;

export async function getFeatures(
  category: string
): Promise<Feature[]> {
  const response = await fetchDirectus<{ data: Feature[] }>(
    `/items/cms_features?filter[category][_eq]=${category}&filter[enabled][_eq]=true&sort=sort_order`
  );
  return z.array(FeatureSchema).parse(response.data);
}
```

**Why Zod validation?**
- Runtime type safety (Directus could change)
- Fail fast if API contract breaks
- Automatic TypeScript types
- Validation errors show exactly what's wrong

### 3. ISR Revalidation Strategy

| Content Type | Revalidation | Strategy | Reasoning |
|--------------|--------------|----------|-----------|
| **Homepage Hero** | 1 hour (3600s) | Time-based | Rarely changes, high traffic |
| **Features** | 1 hour (3600s) | Time-based | Mostly static content |
| **About Page** | 6 hours (21600s) | Time-based | Very static |
| **Blog Listing** | 5 minutes (300s) | Time-based | Frequent updates |
| **Blog Post** | On-demand | Tag-based | Revalidate when post updated |
| **Announcements** | 1 minute (60s) | Time-based | Needs to be fresh |

**On-Demand Revalidation** (for blog posts):
```typescript
// app/api/revalidate/route.ts
import { revalidateTag } from 'next/cache';
import { NextRequest } from 'next/server';

export async function POST(request: NextRequest) {
  const { secret, tag } = await request.json();

  // Verify webhook secret
  if (secret !== process.env.REVALIDATE_SECRET) {
    return Response.json({ message: 'Invalid secret' }, { status: 401 });
  }

  revalidateTag(tag);
  return Response.json({ revalidated: true, tag, now: Date.now() });
}
```

**Directus Webhook** → POST to `/api/revalidate` when blog post published.

---

## Component Implementation Plan

### Phase 1: MVP Components (Build First)

These are critical for launching the marketing site:

#### 1.1 Layout Components
- **`Header.tsx`** (Server Component)
  - Already exists, update if needed
  - Static navigation
  - Logo from R2

- **`Footer.tsx`** (Server Component)
  - Already exists
  - Static links, social media
  - "Coming Soon" placeholders for legal pages

#### 1.2 Homepage Sections
- **`HeroSection.tsx`** (Server Component)
  - Props: `{ headline, subheadline, ctaPrimaryText, ctaPrimaryLink, ctaSecondaryText, ctaSecondaryLink }`
  - Background: CSS gradient (no video/image for MVP)
  - CTA buttons: Link to #waitlist and /features

- **`ProblemStatement.tsx`** (Server Component)
  - Props: `{ problems: Feature[] }` (category="problem-point")
  - 3-column grid (responsive: 1 col mobile, 3 col desktop)
  - Icon + headline + description per problem

- **`SolutionPillars.tsx`** (Server Component)
  - Props: `{ pillars: Feature[] }` (category="solution-pillar")
  - 2x2 grid of cards
  - Icon + title + description + tech badge + example
  - Image from R2 (database modality SVGs)

- **`FeaturesPreview.tsx`** (Server Component)
  - Props: `{ features: Feature[] }` (category="key-feature")
  - 3 horizontal cards
  - Icon + title + description + "Learn More →" link

- **`UseCaseSection.tsx`** (Server Component)
  - Props: `{ useCases: Feature[] }` (category="use-case")
  - Alternating text/visual layout
  - Structured description with Scenario/Traditional CRM/Project Chronos/Outcome

- **`WaitlistForm.tsx`** (Client Component - React Hook Form)
  - Fields: email, firstName, lastName, company, role
  - Inline form with validation
  - POST to `/api/waitlist` (Directus API)
  - Success/error toast notifications

#### 1.3 Features Page
- **`FeatureDeepDive.tsx`** (Server Component)
  - Props: `{ feature: Feature }` (category="features-detail")
  - Detailed section for each database modality
  - Markdown rendering for description
  - Image from R2

#### 1.4 About Page
- **`FounderStory.tsx`** (Server Component)
  - Props: `{ story: Feature }` (category="about-section", slug="about-founder-story")
  - Personal narrative with headshot placeholder
  - Markdown rendering

- **`MissionValues.tsx`** (Server Component)
  - Props: `{ mission: Feature }` (category="about-section", slug="about-mission")
  - Mission statement + 3 core values
  - Icon + value + description layout

#### 1.5 Utility Components
- **`MarkdownContent.tsx`** (Server Component)
  - Render markdown from Directus descriptions
  - Use `react-markdown` with syntax highlighting
  - Handle **bold**, lists, code blocks, links

### Phase 2: Enhanced Components (Post-MVP)

These improve UX but aren't critical for launch:

- **`BlogCard.tsx`** - Blog post preview card
- **`BlogGrid.tsx`** - Paginated blog listing
- **`BlogContent.tsx`** - Full blog post with MDX
- **`AccordionFAQ.tsx`** - FAQ section (shadcn accordion)
- **`ComparisonTable.tsx`** - Salesforce/HubSpot comparison
- **`TechStackBadges.tsx`** - PostgreSQL, Apache AGE, etc. logos
- **`NewsletterSignup.tsx`** - Email newsletter form
- **`SocialProof.tsx`** - Client logos (placeholders for MVP)

### Phase 3: Interactive Features (Future)

- **Interactive Graph Visualization** (D3.js) - not MVP
- **Animated Database Diagrams** - not MVP
- **Live Demo/Sandbox** - not MVP
- **Chat Widget** - not MVP

---

## Styling Strategy

### Tailwind CSS + shadcn/ui

**Base Configuration** (already set up):
```typescript
// tailwind.config.ts
export default {
  darkMode: ["class"],
  content: ["./components/**/*.{ts,tsx}", "./app/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // Brand colors
        brand: {
          purple: "#8B5CF6",   // Primary CTA
          teal: "#06B6D4",     // Secondary accent
          emerald: "#10B981",  // Success states
        },
        // Background gradients
        slate: {
          900: "#0f172a",
          950: "#020617",
        },
      },
      fontFamily: {
        sans: ["Poppins", "sans-serif"],
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};
```

**Component Styling Pattern**:
```typescript
// components/sections/HeroSection.tsx
export function HeroSection({ data }: { data: HomepageHero }) {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-slate-950 to-slate-900 pt-24 pb-32">
      {/* Background gradient orbs */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-sky-500/20 blur-[120px] rounded-full" />

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight">
            {data.headline}
          </h1>
          <p className="text-xl text-slate-300 mb-8 leading-relaxed">
            {data.subheadline}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" asChild>
              <Link href={data.cta_primary_link}>
                {data.cta_primary_text}
              </Link>
            </Button>
            {data.cta_secondary_text && (
              <Button size="lg" variant="outline" asChild>
                <Link href={data.cta_secondary_link}>
                  {data.cta_secondary_text}
                </Link>
              </Button>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
```

**Responsive Design**:
- Mobile-first approach
- Breakpoints: `sm:640px`, `md:768px`, `lg:1024px`, `xl:1280px`
- Grid layouts: 1 col mobile → 2 col tablet → 3-4 col desktop

**Dark Mode**:
- Default to dark mode for MVP (matches brand aesthetic)
- `className="dark"` on root `<html>` tag
- Future: toggle for light mode

---

## Form Handling with React Hook Form

```typescript
// components/forms/WaitlistForm.tsx
'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

const waitlistSchema = z.object({
  email: z.string().email('Invalid email address'),
  firstName: z.string().min(1, 'First name required'),
  lastName: z.string().min(1, 'Last name required'),
  company: z.string().optional(),
  role: z.enum(['Partner', 'Principal', 'Associate', 'Other']).optional(),
});

type WaitlistFormData = z.infer<typeof waitlistSchema>;

export function WaitlistForm({ source = 'homepage' }: { source?: string }) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<WaitlistFormData>({
    resolver: zodResolver(waitlistSchema),
  });

  const onSubmit = async (data: WaitlistFormData) => {
    try {
      const response = await fetch('/api/waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...data, source }),
      });

      if (!response.ok) throw new Error('Submission failed');

      toast.success('Welcome to the waitlist!');
      reset();
    } catch (error) {
      toast.error('Something went wrong. Please try again.');
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <Input
            {...register('firstName')}
            placeholder="First Name"
            aria-invalid={errors.firstName ? 'true' : 'false'}
          />
          {errors.firstName && (
            <p className="text-sm text-red-500 mt-1">{errors.firstName.message}</p>
          )}
        </div>
        <div>
          <Input
            {...register('lastName')}
            placeholder="Last Name"
            aria-invalid={errors.lastName ? 'true' : 'false'}
          />
          {errors.lastName && (
            <p className="text-sm text-red-500 mt-1">{errors.lastName.message}</p>
          )}
        </div>
      </div>

      <Input
        {...register('email')}
        type="email"
        placeholder="Email"
        aria-invalid={errors.email ? 'true' : 'false'}
      />
      {errors.email && (
        <p className="text-sm text-red-500 mt-1">{errors.email.message}</p>
      )}

      <Button type="submit" disabled={isSubmitting} className="w-full">
        {isSubmitting ? 'Joining...' : 'Join Waitlist'}
      </Button>
    </form>
  );
}
```

---

## Implementation Order

### Week 1: Foundation
1. Set up Directus client library (`lib/directus/`)
2. Define TypeScript types + Zod schemas for all collections
3. Create API helper functions (`getHeroContent()`, `getFeatures()`, etc.)
4. Test data fetching with simple console.logs

### Week 2: Homepage
1. Update `app/page.tsx` to fetch Directus data
2. Build `HeroSection.tsx`
3. Build `ProblemStatement.tsx`
4. Build `SolutionPillars.tsx`
5. Build `FeaturesPreview.tsx`
6. Build `UseCaseSection.tsx`
7. Build `WaitlistForm.tsx` + `/api/waitlist` route
8. Test full homepage flow

### Week 3: Features & About Pages
1. Create `app/features/page.tsx`
2. Build `FeatureDeepDive.tsx`
3. Create `app/about/page.tsx`
4. Build `FounderStory.tsx`
5. Build `MissionValues.tsx`
6. Add markdown rendering with `react-markdown`
7. Test all pages

### Week 4: Polish & Deploy
1. Add loading states and error boundaries
2. Optimize images (Next.js Image component)
3. Add animations with Framer Motion (subtle, not distracting)
4. Accessibility audit (ARIA labels, keyboard navigation)
5. Performance audit (Lighthouse)
6. Deploy to production

---

## Testing Strategy

### Type Safety Testing
- Zod schemas catch API contract violations
- TypeScript catches prop mismatches
- No unit tests needed for simple presentational components

### Manual Testing Checklist
- [ ] All pages render with Directus data
- [ ] Responsive design works on mobile/tablet/desktop
- [ ] Forms submit successfully
- [ ] Links navigate correctly
- [ ] Images load from R2
- [ ] ISR revalidation works (test with cache inspection)

### Performance Testing
- Run Lighthouse on all pages (target >90 score)
- Check Network tab for unnecessary requests
- Verify ISR caching headers

---

## Consequences

### Positive
✅ **Server Components by default** = smaller JavaScript bundles, faster loads
✅ **ISR** = Best SEO + fresh content + low server costs
✅ **Type safety** = Catch errors at compile time, not production
✅ **Composition** = Easy to test, easy to understand, easy to modify
✅ **Zod validation** = Fail fast if Directus API changes
✅ **React Hook Form** = Best-in-class form performance
✅ **shadcn/ui** = Accessible, customizable, copy-paste-friendly

### Negative
⚠️ **Learning curve** for Server Components (but worth it)
⚠️ **Client Component boundary** requires `'use client'` directive (minor friction)
⚠️ **ISR edge cases** (rare content races, mitigated by on-demand revalidation)

### Neutral
🔷 **More files** (separate components vs monolithic pages)
🔷 **Zod schemas** add boilerplate but provide safety

---

## Alternative Patterns Considered

### Client-Side Data Fetching (React Query)
- ❌ Bad for SEO
- ❌ Larger bundle size
- ❌ More complex state management
- ✅ Good for authenticated dashboards (not marketing sites)

### Full SSR (No ISR)
- ❌ Slower TTFB
- ❌ Higher server costs
- ✅ Always fresh data (but ISR + on-demand revalidation achieves this)

### Static Export (No ISR)
- ❌ Requires full rebuild for any content change
- ❌ Slow CI/CD for large sites
- ✅ Simplest deployment (but not flexible enough)

---

## References

- [Next.js App Router Documentation](https://nextjs.org/docs/app)
- [Server Components RFC](https://github.com/reactjs/rfcs/blob/main/text/0188-server-components.md)
- [shadcn/ui](https://ui.shadcn.com)
- [React Hook Form](https://react-hook-form.com)
- [Zod](https://zod.dev)
- [Tailwind CSS](https://tailwindcss.com)

---

## Status

**Status**: ✅ Approved (pending Geoff's review)
**Last Updated**: 2025-12-24
**Next Review**: After MVP implementation
