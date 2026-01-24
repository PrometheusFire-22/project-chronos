# CHRONOS-445: CMS Architecture Refactoring & CTA Optimization

**Status:** Planning
**Priority:** High
**Estimated Effort:** 4-6 hours

## Problem Statement

### Current Issues

1. **Disorganized Directus Collections**
   - Everything crammed into `cms_features` with category strings
   - No logical separation by page or component
   - Categories: `about-section`, `features-detail`, `key-feature`, `problem-point`, `solution-pillar`, `use-case`
   - Violates separation of concerns
   - Hard to maintain and scale

2. **Poor CTA Placement**
   - Only CTA is WaitlistSection at bottom of every page
   - No mid-funnel conversion points
   - Misses high-intent moments in customer journey
   - Low conversion optimization

## Proposed Solution

### Part 1: Directus Collections Refactoring

Reorganize content by **page** and **component type** for clear separation of concerns:

#### Homepage Collections
```
cms_homepage_hero (singleton) ✓ EXISTS
  - headline, subheadline, cta_primary_text, cta_primary_link, etc.

cms_homepage_problems (NEW - replaces cms_features category='problem-point')
  - title, description, icon, sort_order
  - 3 items currently

cms_homepage_pillars (NEW - replaces cms_features category='solution-pillar')
  - title, slug, description, icon, image, sort_order
  - 4 items currently (Graph, Vector, Geospatial, Time-Series)

cms_homepage_features (NEW - replaces cms_features category='key-feature')
  - title, description, icon, sort_order
  - 3 items currently

cms_homepage_use_cases (NEW - replaces cms_features category='use-case')
  - title, description, icon, sort_order
  - 3 items currently
```

#### Features Page Collections
```
cms_features_hero (singleton, NEW - currently hardcoded)
  - headline, subheadline

cms_features_capabilities (NEW - replaces cms_features category='features-detail')
  - title, description, icon, image, sort_order
  - 4 items currently (Market Network Mapping, AI Document Parsing, etc.)

cms_comparison_items ✓ EXISTS
  - category, chronos_value, traditional_value, sort_order
  - 8 items currently
```

#### About Page Collections
```
cms_about_hero (singleton, NEW - currently hardcoded)
  - headline, subheadline

cms_about_story (NEW - currently uses cms_page_sections)
  - Can use existing cms_page_sections OR create dedicated singleton

cms_about_values (NEW - replaces cms_features category='about-section')
  - title, description, icon, sort_order
  - 3 items currently (Friction of Fragmented Markets, etc.)

cms_about_team (NEW - currently hardcoded)
  - Future: team member profiles
```

#### Shared/Utility Collections
```
cms_page_sections ✓ EXISTS
  - Flexible content blocks for any page
  - section_key, page_name, headline, subheadline, cta_text, cta_link

cms_blog_posts ✓ EXISTS
cms_docs_pages ✓ EXISTS
cms_announcements ✓ EXISTS
cms_legal_pages ✓ EXISTS
cms_waitlist_submissions ✓ EXISTS
```

### Part 2: CTA Placement Strategy

Create **strategic conversion points** throughout the customer journey:

#### CTA Component Variants
```typescript
<CTASection
  variant="inline" | "banner" | "full" | "modal"
  context="post-problem" | "post-solution" | "post-feature" | "post-comparison"
  headline="..."
  subheadline="..."
  primaryCTA="Get Early Access"
  secondaryCTA="View Demo" (optional)
/>
```

#### Homepage CTA Placement
```
1. Hero Section - Primary CTA (existing in cms_homepage_hero)
2. After Problems → Inline CTA
   - Context: "Tired of fragmented data? See how Chronos unifies everything."
   - Conversion moment: Pain point resonance
3. After Solution Pillars → Banner CTA
   - Context: "Ready to harness multi-modal intelligence?"
   - Conversion moment: Solution interest peak
4. After Use Cases → Full CTA
   - Context: "Join leading investors using Chronos"
   - Conversion moment: Social proof + use case validation
5. Bottom Waitlist (existing) - Final catch-all
```

#### Features Page CTA Placement
```
1. Hero Section - Primary CTA
2. After Capabilities (mid-page) → Inline CTA
   - Context: "See these capabilities in action"
3. After Comparison Table → Full CTA
   - Context: "Experience the Chronos advantage"
   - Conversion moment: Feature differentiation clarity
4. Bottom Waitlist (existing)
```

#### About Page CTA Placement
```
1. After Story → Inline CTA
   - Context: "Join us in building the future"
2. After Values → Banner CTA
   - Context: "Share our vision? Get early access"
3. Bottom Waitlist (existing)
```

### Part 3: Implementation Plan

#### Phase 1: Database Schema Migration (1-2 hours)
1. Create new collections:
   - `cms_homepage_problems`
   - `cms_homepage_pillars`
   - `cms_homepage_features`
   - `cms_homepage_use_cases`
   - `cms_features_hero` (singleton)
   - `cms_features_capabilities`
   - `cms_about_hero` (singleton)
   - `cms_about_values`
2. Migrate data from `cms_features` to new collections
3. Create `cms_cta_sections` for flexible CTA content
4. Register collections in Directus
5. Grant public read permissions

#### Phase 2: Code Refactoring (2-3 hours)
1. Update TypeScript types in `/apps/web/lib/directus/types.ts`
2. Update collection helpers in `/apps/web/lib/directus/collections.ts`
3. Create new getter functions for each collection
4. Update page components to use new collections
5. Create reusable `<CTASection>` component

#### Phase 3: CTA Integration (1 hour)
1. Add CTA placements to homepage
2. Add CTA placements to features page
3. Add CTA placements to about page
4. Populate CTA content in Directus

#### Phase 4: Cleanup (30 min)
1. Verify all pages load correctly
2. Archive old `cms_features` data
3. Update documentation
4. Deploy and test

### Part 4: Data Migration Strategy

**Option A: Automated Migration (Recommended)**
- Write migration script to copy data from `cms_features` to new collections
- Preserves IDs and timestamps
- Can rollback if needed

**Option B: Manual Migration**
- Export data from `cms_features`
- Create new items in new collections
- More control but time-consuming

### Part 5: Rollback Plan

If issues arise:
1. Keep `cms_features` table intact during migration
2. Code can check new collections first, fall back to old
3. Easy to revert by switching collection names in code

## Success Criteria

- [ ] All content organized by page (homepage, features, about)
- [ ] Clear separation of concerns (hero, pillars, capabilities, etc.)
- [ ] Strategic CTAs placed at 3-5 points per page
- [ ] CTA content managed via Directus
- [ ] All pages load correctly
- [ ] Better conversion tracking setup
- [ ] Documentation updated

## Questions for User

1. **Migration approach:** Automated script or manual data entry?
2. **CTA content:** Should CTA headlines/text be in Directus or hardcoded?
3. **Old data:** Keep `cms_features` as archive or delete after migration?
4. **Timing:** Do this now or break into smaller PRs?

## Next Steps

1. Get user approval on architecture
2. Create database migration script
3. Implement new collections and permissions
4. Refactor code to use new structure
5. Add CTA components and placements
6. Test and deploy
