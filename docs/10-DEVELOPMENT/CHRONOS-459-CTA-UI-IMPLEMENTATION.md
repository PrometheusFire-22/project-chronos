# CHRONOS-459: Implement CTA Component and Strategic Placements

**Epic:** Marketing Optimization
**Type:** Story
**Priority:** Medium
**Status:** 📋 Planned (Not Started)
**Estimated Effort:** 30-45 minutes

---

## Summary

Create the `<CTASection>` React component and add strategic CTA placements throughout the marketing site to increase conversion rates.

---

## Context

During CHRONOS-445 (CMS Architecture Refactoring), we created the data infrastructure for strategic CTAs:
- ✅ 7 CTA sections created in Directus
- ✅ TypeScript types (`CTASection`) with Zod validation
- ✅ Helper functions (`getCTASection()`, `getCTASectionsByPage()`)

However, we deferred the UI implementation to avoid scope creep during the infrastructure sprint. This ticket completes the remaining work.

---

## Acceptance Criteria

### 1. Create CTASection Component

**File:** `apps/web/components/sections/CTASection.tsx`

**Requirements:**
- [ ] Accepts `CTASection` data from Directus
- [ ] Supports 3 variants: `inline`, `banner`, `full`
- [ ] Responsive design (mobile, tablet, desktop)
- [ ] Includes primary CTA button (required)
- [ ] Includes secondary CTA button (optional)
- [ ] Follows existing design system (colors, typography, spacing)
- [ ] Has sensible fallback if Directus data unavailable

**Component Props:**
```typescript
interface CTASectionProps {
  sectionKey: string  // e.g., 'homepage-post-problems'
  variant?: 'inline' | 'banner' | 'full'  // Override Directus variant if needed
  className?: string  // Additional styling
}
```

**Variants:**

1. **Inline** - Compact CTA within content flow
   - Minimal height (~150px)
   - Centered text + button
   - Subtle background

2. **Banner** - Full-width banner CTA
   - Medium height (~200px)
   - Primary + secondary buttons
   - Gradient background

3. **Full** - Full-section CTA
   - Large height (~400px)
   - Hero-style presentation
   - Bold gradient + visual elements

---

### 2. Add Strategic Placements

#### Homepage (`apps/web/app/(frontend)/page.tsx`)

**Add 3 CTAs:**
```tsx
<ProblemStatement ... />
<CTASection sectionKey="homepage-post-problems" />

<SolutionPillars ... />
<CTASection sectionKey="homepage-post-pillars" />

<UseCases ... />
<CTASection sectionKey="homepage-post-use-cases" />
```

**Expected CTAs:**
1. After Problems → "Tired of fragmented data?" (inline)
2. After Pillars → "Ready to harness multi-modal intelligence?" (banner)
3. After Use Cases → "Join leading investors using Chronos" (full)

#### Features Page (`apps/web/app/(frontend)/features/page.tsx`)

**Add 2 CTAs:**
```tsx
<FeatureDetails ... />
<CTASection sectionKey="features-post-capabilities" />

<FeatureComparison ... />
<CTASection sectionKey="features-post-comparison" />
```

**Expected CTAs:**
1. After Capabilities → "See these capabilities in action" (inline)
2. After Comparison → "Experience the Chronos advantage" (full)

#### About Page (`apps/web/app/(frontend)/about/page.tsx`)

**Add 2 CTAs:**
```tsx
<AboutStory ... />
<CTASection sectionKey="about-post-story" />

<AboutValues ... />
<CTASection sectionKey="about-post-values" />
```

**Expected CTAs:**
1. After Story → "Join us in building the future" (inline)
2. After Values → "Share our vision?" (banner)

---

### 3. Fetch CTA Data

**Update each page** to fetch CTA data in parallel with existing data:

```typescript
// Example for homepage
const [hero, problems, ..., postProblemsCTA, postPillarsCTA, postUseCasesCTA] = await Promise.all([
  getHomepageHero(),
  getHomepageProblems(),
  // ... existing fetches
  getCTASection('homepage-post-problems'),
  getCTASection('homepage-post-pillars'),
  getCTASection('homepage-post-use-cases'),
])
```

Pass CTA data to `<CTASection>` component.

---

### 4. Testing

- [ ] All 7 CTAs render on their respective pages
- [ ] All 3 variants display correctly
- [ ] CTAs are responsive (test mobile/tablet/desktop)
- [ ] Primary buttons link to correct destinations
- [ ] Secondary buttons work (where applicable)
- [ ] Fallback values display if Directus unavailable
- [ ] Build succeeds with no TypeScript errors
- [ ] Static generation works (27+ pages)

---

## Technical Details

### Data Already in Directus

The following CTA sections already exist in `cms_cta_sections`:

| Section Key | Page | Placement | Variant | Headline |
|------------|------|-----------|---------|----------|
| `homepage-post-problems` | homepage | post-problems | inline | Tired of fragmented data? |
| `homepage-post-pillars` | homepage | post-pillars | banner | Ready to harness multi-modal intelligence? |
| `homepage-post-use-cases` | homepage | post-use-cases | full | Join leading investors using Chronos |
| `features-post-capabilities` | features | post-capabilities | inline | See these capabilities in action |
| `features-post-comparison` | features | post-comparison | full | Experience the Chronos advantage |
| `about-post-story` | about | post-story | inline | Join us in building the future |
| `about-post-values` | about | post-values | banner | Share our vision? |

### Helper Functions Available

```typescript
// Get single CTA by key
const cta = await getCTASection('homepage-post-problems')
// Returns: CTASection | null

// Get all CTAs for a page
const ctas = await getCTASectionsByPage('homepage')
// Returns: CTASection[]
```

### TypeScript Type

```typescript
type CTASection = {
  id: string
  section_key: string
  page_name: string
  placement: string
  headline: string
  subheadline: string | null
  primary_cta_text: string
  primary_cta_link: string
  secondary_cta_text: string | null
  secondary_cta_link: string | null
  variant: 'inline' | 'banner' | 'full'
  enabled: boolean
  created_at: string
  updated_at: string
}
```

---

## Design References

### Existing Components to Reference

For styling consistency, reference:
- `HeroSection.tsx` - Gradient backgrounds, button styles
- `WaitlistSection.tsx` - CTA section structure
- `FeatureComparison.tsx` - Banner-style sections

### Color Palette

Use existing design system:
- Primary: Violet (`violet-500`, `violet-600`)
- Secondary: Sky (`sky-500`, `sky-600`)
- Accent: Emerald (`emerald-500`)
- Background: Slate (`slate-900`, `slate-950`)

---

## Implementation Notes

### Component Structure

```tsx
export function CTASection({ sectionKey, variant, className }: CTASectionProps) {
  const [cta, setCTA] = useState<CTASection | null>(null)

  useEffect(() => {
    getCTASection(sectionKey).then(setCTA)
  }, [sectionKey])

  if (!cta) return null  // Or fallback UI

  const effectiveVariant = variant || cta.variant

  return (
    <section className={`cta-section variant-${effectiveVariant} ${className}`}>
      {/* Render based on variant */}
    </section>
  )
}
```

### Alternate Approach: Server Component

Since pages are using `async/await`, CTAs could be fetched server-side:

```tsx
// In page.tsx
const cta = await getCTASection('homepage-post-problems')

// In JSX
<CTASection data={cta} />
```

Choose whichever fits the existing pattern better.

---

## Future Enhancements (Out of Scope)

These can be tackled in future sprints:

1. **A/B Testing** - Test different copy/variants
2. **Click Tracking** - Track CTA click-through rates
3. **Animations** - Add scroll-triggered animations
4. **Dark Mode Toggle** - Different styling for dark mode
5. **Personalization** - Show different CTAs based on user behavior

---

## Dependencies

### Prerequisites
- ✅ CHRONOS-445 (CMS Architecture) - Complete
- ✅ CTA data in Directus - Complete
- ✅ Helper functions (`getCTASection`) - Complete
- ✅ TypeScript types - Complete

### Blocks
- None (can be done independently)

---

## Estimate Breakdown

| Task | Time |
|------|------|
| Create `<CTASection>` component | 15 min |
| Add to homepage (3 placements) | 5 min |
| Add to features page (2 placements) | 5 min |
| Add to about page (2 placements) | 5 min |
| Test & verify | 10 min |
| **Total** | **40 min** |

---

## Definition of Done

- [ ] `<CTASection>` component created
- [ ] All 3 variants implemented (inline, banner, full)
- [ ] Component is responsive
- [ ] 7 CTAs added to 3 pages
- [ ] All CTAs fetch from Directus
- [ ] Build passes with no errors
- [ ] Manual testing complete (all variants visible)
- [ ] Code committed and pushed
- [ ] Documentation updated (if needed)

---

## Notes

This work was deferred from CHRONOS-445 (CMS Architecture Refactoring) to keep that sprint focused on infrastructure. The data layer is complete; this ticket handles only the presentation layer.

---

**Created:** 2026-01-24
**Deferred From:** CHRONOS-445 (Sprint 1)
**Target Sprint:** TBD (Marketing Optimization Sprint 1)
**Effort:** 40 minutes
