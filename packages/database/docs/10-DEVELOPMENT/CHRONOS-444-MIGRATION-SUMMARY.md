# Marketing Website Content Migration Summary

**Branch**: `feat/CHRONOS-444-database-schema-cleanup`
**Date**: 2026-01-23
**Status**: ✅ Code Complete - Ready for Database Migration & CMS Configuration

## Overview

Migrated all hardcoded marketing copy from Next.js components to Directus CMS and updated value proposition from generic "private market intelligence" to focused "special situations/distressed markets in Canada."

## What Was Changed

### 1. Database Schema (`packages/database/src/schema/cms.ts`)
Added two new CMS tables:

#### `cms_page_sections`
- Stores section headers/subheaders for marketing pages
- Fields: `section_key`, `page_name`, `headline`, `subheadline`, `cta_text`, `cta_link`
- Indexed on `section_key` and `page_name`

#### `cms_comparison_items`
- Stores feature comparison table data (Why Choose Chronos section)
- Fields: `category`, `chronos_value`, `traditional_value`, `sort_order`
- Indexed on `sort_order`

### 2. TypeScript Types (`apps/web/lib/directus/types.ts`)
- Added `PageSectionSchema` and `PageSection` type
- Added `ComparisonItemSchema` and `ComparisonItem` type
- Added `PageSectionKey` constants for type-safe section references

### 3. Directus Client (`apps/web/lib/directus/collections.ts`)
- Added `getPageSection(sectionKey)` - Fetch section header by key
- Added `getPageSectionsByPage(pageName)` - Fetch all sections for a page
- Added `getComparisonItems()` - Fetch comparison table data

### 4. Updated Components

All components now fetch from Directus with sensible fallbacks:

#### `ProblemStatement.tsx` (Homepage)
- **Old**: "The Challenge / Private market investors struggle..."
- **New**: "The Problem: Information is Public. Intelligence is Hidden. / In a distressed market, the data you need is buried in 300-page monitor reports..."

#### `SolutionPillars.tsx` (Homepage)
- **Old**: "The first platform to combine graph relationships, vector embeddings..."
- **New**: "The first platform to unify public market ruins with private deal flow through a single intelligence layer."

#### `FeaturesPreview.tsx` (Homepage)
- **Old**: "Built for Modern Investors / Enterprise-grade features..."
- **New**: "Built for the Special Situations Workflow / Professional-grade tools designed to map the liquidity reset..."

#### `UseCases.tsx` (Homepage)
- **Old**: Generic investor messaging
- **New**: "Ready to find the edge in the Canadian liquidity reset?"

#### `FeatureComparison.tsx` (Features Page)
- **Old**: Technical database features (vector, temporal, multi-modal)
- **New**: Business outcomes (Unified Market Intelligence, Path-to-Monitor, Maturity Wall Alerts, etc.)

#### `AboutStory.tsx` (About Page)
- **Old**: Generic platform/technology story
- **New**: "Chronos was born in Toronto during the most dramatic liquidity reset in private markets since 2008..."

### 5. Updated Pages

All pages updated to fetch section data:
- `apps/web/app/(frontend)/page.tsx` (Homepage)
- `apps/web/app/(frontend)/features/page.tsx` (Features)
- `apps/web/app/(frontend)/about/page.tsx` (About)

## Value Proposition Changes

### Old Positioning
- **Target**: Generic private market investors
- **Message**: Multi-modal database technology (graph, vector, time-series, geospatial)
- **Focus**: Technical capabilities and relationship intelligence

### New Positioning
- **Target**: Canadian special situations / distressed credit investors
- **Message**: Intelligence layer for liquidity reset and forced sellers
- **Focus**: Business outcomes (speed, referral mapping, liquidity timing)

## Next Steps

### 1. Apply Database Migration

```bash
cd packages/database
pnpm db:push
```

This will create the two new CMS tables: `cms_page_sections` and `cms_comparison_items`.

### 2. Seed Marketing Content

```bash
cd packages/database
pnpm seed:marketing
```

This will populate:
- 6 page sections (problem-statement, solution-pillars, features-preview, use-cases, feature-comparison, about-story)
- 8 comparison items (the "Why Choose Chronos?" table)

### 3. Verify in Directus CMS

Navigate to your Directus instance at `https://admin.automatonicai.com` and verify:

1. **Collections** → **Page Sections**
   - Should see 6 sections with updated special situations copy
   - Verify headlines and subheadlines render correctly

2. **Collections** → **Comparison Items**
   - Should see 8 rows with business-outcome focused comparisons
   - Verify sort order is correct (1-8)

3. **Test Content Updates**
   - Edit a section headline in Directus
   - Rebuild the Next.js site and verify change appears

### 4. Update Feature Items in Directus

The following feature categories still need to be updated manually in Directus UI to align with the new positioning:

- **Problem Points** (`problem-point`)
  - Update to focus on distressed market pain points
  - E.g., "Monitor reports arrive weekly but deals close daily"

- **Solution Pillars** (`solution-pillar`)
  - Keep the 4 database modalities but reframe benefits
  - E.g., Graph = "Map hidden syndicate relationships"

- **Key Features** (`key-feature`)
  - Refocus on special situations use cases
  - E.g., "Track maturity walls", "Identify forced sellers"

- **Use Cases** (`use-case`)
  - Update to distressed credit scenarios
  - E.g., "Distressed Credit Analysis", "Monitor Network Mapping"

### 5. Rebuild & Deploy

```bash
# From monorepo root
pnpm build

# Verify locally
pnpm --filter @chronos/web dev

# Deploy to Cloudflare (if satisfied)
# (deployment commands will vary based on your setup)
```

### 6. Optional: Update Metadata

Consider updating these files to match new positioning:

- `apps/web/app/(frontend)/page.tsx` - Homepage metadata
- `apps/web/app/(frontend)/features/page.tsx` - Features metadata
- `apps/web/app/(frontend)/about/page.tsx` - About metadata

## Migration File

Generated migration: `packages/database/migrations/0002_next_kate_bishop.sql`

> **Note**: Drizzle Kit auto-generates these whimsical names. You can rename the file if desired (just update references).

## Rollback Plan

If needed, to rollback:

1. Revert component changes to use hardcoded content
2. Drop the new CMS tables:
   ```sql
   DROP TABLE cms_comparison_items;
   DROP TABLE cms_page_sections;
   ```
3. Remove TypeScript types and client functions

## Testing Checklist

- [ ] Database migration applied successfully
- [ ] Seed script ran without errors
- [ ] All 6 page sections appear in Directus
- [ ] All 8 comparison items appear in Directus
- [ ] Homepage renders with new copy
- [ ] Features page renders with new comparison table
- [ ] About page renders with new origin story
- [ ] Fallback values work if CMS is unreachable
- [ ] Static site generation builds successfully
- [ ] Content updates in Directus propagate to site after rebuild

## Files Modified

### Database
- `packages/database/src/schema/cms.ts` (added tables)
- `packages/database/package.json` (added seed script)
- `packages/database/src/seed-marketing-content.ts` (new)

### Directus Client
- `apps/web/lib/directus/types.ts` (added schemas)
- `apps/web/lib/directus/collections.ts` (added getters)

### Components
- `apps/web/components/sections/ProblemStatement.tsx`
- `apps/web/components/sections/SolutionPillars.tsx`
- `apps/web/components/sections/FeaturesPreview.tsx`
- `apps/web/components/sections/UseCases.tsx`
- `apps/web/components/sections/FeatureComparison.tsx`
- `apps/web/components/sections/AboutStory.tsx`

### Pages
- `apps/web/app/(frontend)/page.tsx`
- `apps/web/app/(frontend)/features/page.tsx`
- `apps/web/app/(frontend)/about/page.tsx`

## Questions?

If you encounter any issues during migration:
1. Check database connection string in `.env`
2. Verify Directus API endpoint is accessible
3. Review console logs for Directus API errors
4. Ensure ISR revalidation times allow content updates to propagate

---

**Status**: ✅ Ready for database migration and CMS population
