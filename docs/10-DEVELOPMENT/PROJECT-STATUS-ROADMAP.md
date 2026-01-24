# Project Chronos - Status & Roadmap
**Date:** 2026-01-24
**Branch:** `feat/CHRONOS-444-database-schema-cleanup`
**Status:** 🟡 Mid-Migration - CMS Refactoring In Progress

---

## Executive Summary

You were in the middle of a **CMS Architecture Refactoring** (Epic CHRONOS-445) when the sessions froze. The project has successfully completed Phase 1 (database schema creation) and is now ready for Phase 2 (data migration). Here's where you stand:

### ✅ Completed Work
1. **CHRONOS-444**: Database Schema Cleanup - Marketing content migration foundations ✅
2. **CHRONOS-454**: New Directus collections created ✅
   - 9 new CMS tables created in migration `0003_fat_ricochet.sql`
   - Migration applied to database
   - Collections ready for data population

### 🔄 Current State
- **Migration 0003** has been generated and is tracked in git
- Schema changes are uncommitted (modified `cms.ts`, `_journal.json`, `run-migration.ts`)
- New collection snapshots exist but not committed
- Documentation created but not finalized

### 🎯 Next Steps
- **CHRONOS-455**: Data migration from `cms_features` to new collections (IMMEDIATE NEXT)
- **CHRONOS-456**: Code refactoring to use new collections
- **CHRONOS-457**: CTA component creation and strategic placement
- **CHRONOS-458**: Testing, verification, and cleanup

---

## Recent Git History

```
d41f27ca - chore: trigger rebuild after Directus permissions fix
245ea6a0 - feat: add API token authentication to Directus client
c2d205ba - fix: resolve TypeScript build errors for CMS migration
98a15eba - feat(cms): migrate marketing copy to Directus and update positioning
```

### Uncommitted Changes
```
M  .claude/settings.local.json
M  packages/database/migrations/meta/_journal.json
M  packages/database/src/run-migration.ts
M  packages/database/src/schema/cms.ts
??  docs/10-DEVELOPMENT/CHRONOS-445-CMS-REFACTORING-PLAN.md
??  packages/database/docs/10-DEVELOPMENT/CHRONOS-445-MIGRATION-SUMMARY.md
??  packages/database/migrations/meta/0003_snapshot.json
```

---

## Database Migration Status

### Applied Migrations (Tracked in _journal.json)

| Migration | Date | Status | Description |
|-----------|------|--------|-------------|
| `0000_wise_reaper` | 2024-12-21 | ✅ Applied | Initial CMS schema |
| `0001_watery_otto_octavius` | 2024-12-22 | ✅ Applied | CMS enhancements |
| `0002_next_kate_bishop` | 2026-01-23 | ✅ Applied | Page sections & comparison items |
| `0003_fat_ricochet` | 2026-01-23 | ✅ Applied | New homepage/features/about collections |

### Migration 0003 Details

**Created:** 9 new CMS tables organized by page and component type

#### Homepage Collections (4 tables)
- ✅ `cms_homepage_problems` - Problem points (3 items to migrate)
- ✅ `cms_homepage_pillars` - Solution pillars (4 items to migrate)
- ✅ `cms_homepage_features` - Key features (3 items to migrate)
- ✅ `cms_homepage_use_cases` - Use cases (3 items to migrate)

#### Features Page Collections (2 tables)
- ✅ `cms_features_hero` - Hero section (singleton, needs content)
- ✅ `cms_features_capabilities` - Capabilities (4 items to migrate)

#### About Page Collections (2 tables)
- ✅ `cms_about_hero` - Hero section (singleton, needs content)
- ✅ `cms_about_values` - Company values (3 items to migrate)

#### CTA Collections (1 table)
- ✅ `cms_cta_sections` - Strategic CTAs (12+ items to create)

**Total items to migrate from `cms_features`:** 20 items across 6 categories

---

## CHRONOS-445: CMS Refactoring Epic

### Problem Statement

**Before:**
- All content crammed into `cms_features` with category strings
- Categories: `about-section`, `features-detail`, `key-feature`, `problem-point`, `solution-pillar`, `use-case`
- No logical separation by page or component
- Hard to maintain and scale

**After:**
- Clear separation by page (homepage, features, about)
- Dedicated collections per component type
- Strategic CTA placement throughout site
- Better content management in Directus

### Architecture Transformation

```
BEFORE (CHRONOS-444)
├── cms_features (20 items, 6 categories mixed together)
    ├── about-section (3)
    ├── features-detail (4)
    ├── key-feature (3)
    ├── problem-point (3)
    ├── solution-pillar (4)
    └── use-case (3)

AFTER (CHRONOS-445)
├── Homepage Collections
│   ├── cms_homepage_problems (3)
│   ├── cms_homepage_pillars (4)
│   ├── cms_homepage_features (3)
│   └── cms_homepage_use_cases (3)
├── Features Page Collections
│   ├── cms_features_hero (singleton)
│   └── cms_features_capabilities (4)
├── About Page Collections
│   ├── cms_about_hero (singleton)
│   └── cms_about_values (3)
└── CTA Collections
    └── cms_cta_sections (12+ strategic placements)
```

---

## Roadmap: What To Do Next

### Phase 2: Data Migration (CHRONOS-455) - **START HERE**

**Status:** 🔴 Not Started
**Priority:** HIGH - Required before code refactoring
**Estimated Time:** 1-2 hours

#### Tasks
1. **Create automated migration script**
   - Script: `packages/database/src/migrate-cms-features.ts`
   - Map old categories to new collections:
     - `problem-point` → `cms_homepage_problems`
     - `solution-pillar` → `cms_homepage_pillars`
     - `key-feature` → `cms_homepage_features`
     - `use-case` → `cms_homepage_use_cases`
     - `features-detail` → `cms_features_capabilities`
     - `about-section` → `cms_about_values`

2. **Create hero singletons**
   - Create initial content for `cms_features_hero`
   - Create initial content for `cms_about_hero`
   - Mark as active

3. **Create CTA content**
   - Populate `cms_cta_sections` with strategic placements
   - Homepage: 5 CTAs (post-problem, post-pillars, post-use-cases, etc.)
   - Features: 4 CTAs (hero, post-capabilities, post-comparison, bottom)
   - About: 3 CTAs (post-story, post-values, bottom)

4. **Verification**
   - Run migration script
   - Verify data in Directus UI
   - Generate verification report
   - Keep old `cms_features` table as backup (don't delete yet)

#### Success Criteria
- [ ] All 20 items migrated from `cms_features` to new collections
- [ ] 2 hero singletons created and active
- [ ] 12+ CTA sections created and enabled
- [ ] Data verified in Directus admin UI at https://admin.automatonicai.com
- [ ] Migration script is idempotent (can be run multiple times safely)

---

### Phase 3: Code Refactoring (CHRONOS-456)

**Status:** ⏳ Pending Phase 2
**Priority:** HIGH
**Estimated Time:** 2-3 hours

#### Tasks
1. **Update TypeScript types**
   - File: `apps/web/lib/directus/types.ts`
   - Add schemas for all 9 new collections
   - Add TypeScript interfaces

2. **Update collection helpers**
   - File: `apps/web/lib/directus/collections.ts`
   - Create getter functions for each new collection
   - Examples:
     - `getHomepageProblems()`
     - `getHomepagePillars()`
     - `getFeaturesHero()`
     - `getCTASection(key)`

3. **Update page components**
   - Replace old `getFeaturesByCategory()` calls
   - Use new collection-specific getters
   - Update imports

4. **Pages to update**
   - `apps/web/app/(frontend)/page.tsx` - Homepage
   - `apps/web/app/(frontend)/features/page.tsx` - Features
   - `apps/web/app/(frontend)/about/page.tsx` - About

#### Success Criteria
- [ ] All TypeScript types created for new collections
- [ ] All getter functions implemented
- [ ] All pages updated to use new collections
- [ ] TypeScript builds without errors
- [ ] Fallback values work if CMS is unreachable

---

### Phase 4: CTA Integration (CHRONOS-457)

**Status:** ⏳ Pending Phase 3
**Priority:** MEDIUM
**Estimated Time:** 1 hour

#### Tasks
1. **Create CTASection component**
   - File: `apps/web/components/sections/CTASection.tsx`
   - Variants: `inline`, `banner`, `full`
   - Props: `sectionKey`, `variant`, custom overrides

2. **Add strategic placements**
   - **Homepage** (5 CTAs):
     - Hero (existing in `cms_homepage_hero`)
     - After Problems → Inline CTA
     - After Solution Pillars → Banner CTA
     - After Use Cases → Full CTA
     - Bottom Waitlist (existing)

   - **Features Page** (4 CTAs):
     - Hero (`cms_features_hero`)
     - After Capabilities → Inline CTA
     - After Comparison Table → Full CTA
     - Bottom Waitlist (existing)

   - **About Page** (3 CTAs):
     - After Story → Inline CTA
     - After Values → Banner CTA
     - Bottom Waitlist (existing)

3. **Connect to Directus**
   - Fetch CTA content from `cms_cta_sections`
   - Pass to `<CTASection>` component

#### Success Criteria
- [ ] CTASection component created with 3 variants
- [ ] 12+ CTA placements added to pages
- [ ] CTAs fetch content from Directus
- [ ] Styling matches design system
- [ ] Conversion tracking ready

---

### Phase 5: Testing & Cleanup (CHRONOS-458)

**Status:** ⏳ Pending Phase 4
**Priority:** HIGH
**Estimated Time:** 30 minutes

#### Tasks
1. **Testing**
   - [ ] All pages load correctly
   - [ ] Content appears from new collections
   - [ ] CTAs display properly
   - [ ] Fallback values work
   - [ ] Directus admin UI works
   - [ ] Public read permissions verified

2. **Cleanup**
   - [ ] Verify no code references old `cms_features` table
   - [ ] Archive old data (optional: create backup export)
   - [ ] Delete `cms_features` table (destructive - do last!)
   - [ ] Update documentation

3. **Commit & Deploy**
   - [ ] Commit all schema changes
   - [ ] Commit migration scripts
   - [ ] Commit code refactoring
   - [ ] Push to remote
   - [ ] Deploy to production

#### Success Criteria
- [ ] All tests passing
- [ ] No errors in production
- [ ] Content updates in Directus propagate to site
- [ ] Old `cms_features` table archived or deleted
- [ ] Documentation updated

---

## Value Proposition Update

As part of this work, the marketing positioning was updated:

### Old Positioning
- **Target**: Generic private market investors
- **Message**: Multi-modal database technology (graph, vector, time-series, geospatial)
- **Focus**: Technical capabilities

### New Positioning
- **Target**: Canadian special situations / distressed credit investors
- **Message**: Intelligence layer for liquidity reset and forced sellers
- **Focus**: Business outcomes (speed, referral mapping, liquidity timing)

### Example Changes
- **Problem Statement**: "In a distressed market, the data you need is buried in 300-page monitor reports..."
- **Solution Pillars**: "The first platform to unify public market ruins with private deal flow through a single intelligence layer"
- **Use Cases**: "Ready to find the edge in the Canadian liquidity reset?"

---

## Jira Ticket Reference

### Epic
- **[CHRONOS-453]** CMS Architecture Refactoring & CTA Optimization

### Tasks (Sub-tickets of CHRONOS-453)
- **[CHRONOS-454]** Create new Directus collections - ✅ Complete
- **[CHRONOS-455]** Automated data migration script - 🔴 Next
- **[CHRONOS-456]** Code refactoring - ⏳ Pending
- **[CHRONOS-457]** CTA component and placement - ⏳ Pending
- **[CHRONOS-458]** Testing and cleanup - ⏳ Pending

### Related Work
- **[CHRONOS-444]** Database Schema Cleanup - ✅ Complete (foundation work)

---

## Files Modified (Uncommitted)

### Database Package
```
M  packages/database/migrations/meta/_journal.json
M  packages/database/src/run-migration.ts
M  packages/database/src/schema/cms.ts
??  packages/database/migrations/meta/0003_snapshot.json
??  packages/database/docs/10-DEVELOPMENT/CHRONOS-445-MIGRATION-SUMMARY.md
```

### Documentation
```
??  docs/10-DEVELOPMENT/CHRONOS-445-CMS-REFACTORING-PLAN.md
```

### Configuration
```
M  .claude/settings.local.json
```

---

## Recommended Next Actions

### Immediate (Today)
1. **Review uncommitted changes** - Check git diff to understand what changed
2. **Commit migration 0003** - This is safe, tables are already created
3. **Start CHRONOS-455** - Create data migration script
4. **Verify in Directus** - Check that new collections are accessible at https://admin.automatonicai.com

### Short-term (This Week)
1. Complete Phase 2 (data migration)
2. Complete Phase 3 (code refactoring)
3. Complete Phase 4 (CTA integration)
4. Complete Phase 5 (testing & cleanup)

### Git Workflow Suggestion
```bash
# 1. Commit current schema changes
git add packages/database/migrations/meta/_journal.json
git add packages/database/migrations/meta/0003_snapshot.json
git add packages/database/src/schema/cms.ts
git add packages/database/src/run-migration.ts
git add packages/database/docs/10-DEVELOPMENT/CHRONOS-445-MIGRATION-SUMMARY.md
git add docs/10-DEVELOPMENT/CHRONOS-445-CMS-REFACTORING-PLAN.md
git commit -m "feat(cms): add new collections for page-based architecture (CHRONOS-454)

- Created 9 new CMS tables organized by page type
- Homepage: problems, pillars, features, use_cases
- Features: hero, capabilities
- About: hero, values
- CTA: strategic placement sections
- Migration 0003 applied successfully"

# 2. Create data migration script (CHRONOS-455)
# ... implement migration ...

# 3. Continue with remaining phases
```

---

## Questions & Concerns

### Open Questions
1. **CTA Content**: Should CTAs be editable in Directus or hardcoded in components?
   - **Recommendation**: Directus for flexibility
2. **Old Data**: Keep `cms_features` as archive or delete after migration?
   - **Recommendation**: Keep as backup for 1 sprint, then delete
3. **Rollback Plan**: If issues arise, can we easily revert?
   - **Yes**: Old `cms_features` stays intact during migration

### Risk Assessment
- **Low Risk**: Database schema changes are complete and applied
- **Medium Risk**: Data migration (use transactions, test thoroughly)
- **Low Risk**: Code refactoring (TypeScript will catch errors)
- **Low Risk**: CTA integration (additive feature)

---

## Tools & Commands

### Check Migration Status
```bash
cd packages/database
cat migrations/meta/_journal.json  # See applied migrations
```

### Verify Database
```bash
# Connect to database
psql $DATABASE_URL

# List tables
\dt cms_*

# Check new collections
SELECT COUNT(*) FROM cms_homepage_problems;
SELECT COUNT(*) FROM cms_features;  -- Should have 20 items
```

### Run Migration (if needed)
```bash
cd packages/database
pnpm tsx src/run-migration.ts
```

### Development Server
```bash
# From monorepo root
pnpm --filter @chronos/web dev
```

---

## Success Metrics

### Technical
- [ ] 0 TypeScript errors
- [ ] All migrations applied
- [ ] All tests passing
- [ ] Directus permissions configured
- [ ] ISR revalidation working

### Product
- [ ] Content organized logically in Directus
- [ ] Editors can update content easily
- [ ] 12+ strategic CTAs for better conversion
- [ ] Pages load with new positioning
- [ ] Special situations messaging consistent

---

**Last Updated:** 2026-01-24
**Next Review:** After completing CHRONOS-455
