# CMS Architecture Refactoring Migration Summary

**Epic**: CHRONOS-453
**Branch**: `feat/CHRONOS-444-database-schema-cleanup`
**Date**: 2026-01-23
**Status**: 🔄 In Progress - Collections Created

## Overview

Complete refactoring of Directus CMS architecture to organize content by page and component type, plus strategic CTA placement for improved conversion optimization.

## Migration Progress

### ✅ Phase 1: Database Schema (CHRONOS-454)

**Status**: Complete

Created 9 new CMS collections organized by page:

#### Homepage Collections
- ✅ `cms_homepage_problems` - Problem points (3 items to migrate)
- ✅ `cms_homepage_pillars` - Solution pillars (4 items to migrate)
- ✅ `cms_homepage_features` - Key features (3 items to migrate)
- ✅ `cms_homepage_use_cases` - Use cases (3 items to migrate)

#### Features Page Collections
- ✅ `cms_features_hero` - Hero section (singleton, currently hardcoded)
- ✅ `cms_features_capabilities` - Capabilities (4 items to migrate)

#### About Page Collections
- ✅ `cms_about_hero` - Hero section (singleton, currently hardcoded)
- ✅ `cms_about_values` - Company values (3 items to migrate)

#### CTA Collections
- ✅ `cms_cta_sections` - Strategic CTAs throughout site (new content)

**Migration Applied**: `migrations/0003_fat_ricochet.sql`
**Directus Permissions**: Public read access granted to all collections

### 🔄 Phase 2: Data Migration (CHRONOS-455)

**Status**: Next
**Task**: Create automated script to migrate data from `cms_features` to new collections

**Mapping**:
- `category='problem-point'` → `cms_homepage_problems`
- `category='solution-pillar'` → `cms_homepage_pillars`
- `category='key-feature'` → `cms_homepage_features`
- `category='use-case'` → `cms_homepage_use_cases`
- `category='features-detail'` → `cms_features_capabilities`
- `category='about-section'` → `cms_about_values`

**Additional Steps**:
- Create hero singletons (`cms_features_hero`, `cms_about_hero`)
- Create initial CTA content in `cms_cta_sections`

### ⏳ Phase 3: Code Refactoring (CHRONOS-456)

**Status**: Pending
**Task**: Update TypeScript types, collection helpers, and page components

### ⏳ Phase 4: CTA Integration (CHRONOS-457)

**Status**: Pending
**Task**: Create `<CTASection>` component and add strategic placements

### ⏳ Phase 5: Cleanup (CHRONOS-458)

**Status**: Pending
**Task**: Test, verify, and delete old `cms_features` table

## Architecture Changes

### Before (CHRONOS-444)
```
cms_features (20 items, 6 categories)
├── about-section (3 items)
├── features-detail (4 items)
├── key-feature (3 items)
├── problem-point (3 items)
├── solution-pillar (4 items)
└── use-case (3 items)
```

### After (CHRONOS-445)
```
Homepage Collections
├── cms_homepage_problems (3 items)
├── cms_homepage_pillars (4 items)
├── cms_homepage_features (3 items)
└── cms_homepage_use_cases (3 items)

Features Page Collections
├── cms_features_hero (singleton)
└── cms_features_capabilities (4 items)

About Page Collections
├── cms_about_hero (singleton)
└── cms_about_values (3 items)

CTA Collections
└── cms_cta_sections (12+ items for strategic placement)
```

## CTA Placement Strategy

### Homepage (5 CTAs)
1. Hero section (existing in `cms_homepage_hero`)
2. After Problems → Inline CTA
3. After Solution Pillars → Banner CTA
4. After Use Cases → Full CTA
5. Bottom Waitlist (existing)

### Features Page (4 CTAs)
1. Hero section (new `cms_features_hero`)
2. After Capabilities → Inline CTA
3. After Comparison Table → Full CTA
4. Bottom Waitlist (existing)

### About Page (3 CTAs)
1. After Story → Inline CTA
2. After Values → Banner CTA
3. Bottom Waitlist (existing)

## Database Changes

### Migration 0003 (Applied 2026-01-23)
- Created 9 new tables with proper indexes
- All tables use uuid primary keys with `gen_random_uuid()`
- Standard audit fields (`created_at`, `updated_at`)
- Sort order fields for orderable items
- Enabled flags for soft deletes

### Permissions Created
- Permission IDs: 112-120
- Policy: Public (abf8a154-5b1c-4a46-ac9c-7300570f4f17)
- Action: Read
- Fields: All (*)

## Next Steps

1. **Create Migration Script** (CHRONOS-455)
   - Write automated data migration from `cms_features`
   - Preserve IDs and timestamps where possible
   - Generate verification report
   - Create hero singletons and CTA content

2. **Update Code** (CHRONOS-456)
   - Update TypeScript types in `/apps/web/lib/directus/types.ts`
   - Update collection helpers in `/apps/web/lib/directus/collections.ts`
   - Create new getter functions for each collection
   - Update page components

3. **Create CTA Component** (CHRONOS-457)
   - Build reusable `<CTASection>` with 3 variants
   - Add placements throughout pages
   - Connect to Directus `cms_cta_sections`

4. **Test & Cleanup** (CHRONOS-458)
   - Comprehensive testing
   - Data verification
   - Delete `cms_features` table
   - Update documentation

## Jira Tickets

- **Epic**: [CHRONOS-453] CMS Architecture Refactoring & CTA Optimization
- **Task**: [CHRONOS-454] Create new Directus collections - ✅ Complete
- **Task**: [CHRONOS-455] Automated data migration script - 🔄 Next
- **Task**: [CHRONOS-456] Code refactoring - ⏳ Pending
- **Task**: [CHRONOS-457] CTA component and placement - ⏳ Pending
- **Task**: [CHRONOS-458] Testing and cleanup - ⏳ Pending

## Files Modified

### This Phase (CHRONOS-454)
- `packages/database/src/schema/cms.ts` - Added 9 new table definitions
- `packages/database/migrations/0003_fat_ricochet.sql` - New migration
- `packages/database/src/run-migration.ts` - Updated to run migration 0003
- `packages/database/docs/10-DEVELOPMENT/CHRONOS-445-MIGRATION-SUMMARY.md` - This file

### Next Phase (CHRONOS-455)
- `packages/database/src/migrate-cms-features.ts` - New migration script
- Data changes in Directus collections

---

**Current Status**: ✅ Collections created and accessible. Ready for data migration.
