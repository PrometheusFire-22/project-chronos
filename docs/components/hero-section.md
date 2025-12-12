# Hero Section Component Documentation

## Overview

The Hero Section is the primary landing component for the Project Chronos marketing site. It features theme-aware illustrations, animated content, and responsive CTAs.

## Components

### HeroSection (`components/sections/HeroSection.tsx`)

Main hero section component with:
- Animated headline and subheadline
- Feature pills showcasing capabilities
- Primary and secondary CTAs
- Social proof placeholder
- Responsive grid layout

**Props:** None (self-contained)

**Usage:**
```tsx
import { HeroSection } from '@/components/sections/HeroSection'

export default function HomePage() {
  return <HeroSection />
}
```

### HeroIllustration (`components/illustrations/HeroIllustration.tsx`)

Theme-aware illustration component that automatically switches between light/dark variants.

**Features:**
- SSR-safe (prevents hydration mismatch)
- Automatic theme detection
- Optimized with Next.js Image
- Responsive sizing

**Props:** None

**Assets Used:**
- `/illustrations/hero-light.svg` (light mode)
- `/illustrations/hero-dark.svg` (dark mode)

## Design System Integration

### Colors

Uses CSS variables for automatic theme switching:
- `text-foreground` - Primary text
- `text-muted-foreground` - Secondary text
- `text-primary` - Accent color (purple)
- `bg-background` - Page background
- `bg-muted` - Subtle backgrounds

### Typography

- **Headline:** `text-4xl sm:text-5xl lg:text-6xl font-bold`
- **Subheadline:** `text-lg sm:text-xl`
- **Feature Pills:** `text-sm font-medium`

### Animations

Uses Framer Motion with custom variants:
- `staggerContainer` - Parent container with staggered children
- `fadeInUp` - Individual element animations

**Animation Timing:**
- Headline: 0s delay
- Subheadline: 0.1s delay (stagger)
- Feature Pills: 0.2s delay (stagger)
- CTAs: 0.3s delay (stagger)
- Illustration: 0.2s delay (independent)

## Responsive Behavior

### Mobile (< 640px)
- Single column layout
- Headline: 36px (text-4xl)
- Subheadline: 18px (text-lg)
- Stacked CTAs

### Tablet (640px - 1024px)
- Single column layout
- Headline: 48px (text-5xl)
- Subheadline: 20px (text-xl)
- Horizontal CTAs

### Desktop (> 1024px)
- Two-column grid (50/50)
- Headline: 60px (text-6xl)
- Content left, illustration right
- 64px gap between columns

## Extensibility

### Adding More CTAs

```tsx
<motion.div variants={fadeInUp} className="flex gap-4">
  <Button size="lg">Primary CTA</Button>
  <Button size="lg" variant="outline">Secondary CTA</Button>
  <Button size="lg" variant="ghost">Tertiary CTA</Button>
</motion.div>
```

### Customizing Feature Pills

Edit the array in `HeroSection.tsx`:

```tsx
{[
  'Graph Database',
  'Vector Search',
  'Geospatial Analysis',
  'Time-Series Tracking',
  'Your New Feature' // Add here
].map((feature) => (
  // ...
))}
```

### Changing Illustration

Replace files in `apps/web/public/illustrations/`:
- `hero-light.svg`
- `hero-dark.svg`

Component will automatically use new assets.

## Accessibility

- ✅ Semantic HTML (`<section>`, `<h1>`, `<p>`)
- ✅ Proper heading hierarchy
- ✅ Alt text on images
- ✅ Keyboard navigable CTAs
- ✅ Focus visible states
- ✅ Respects `prefers-reduced-motion`

## Performance

- ✅ Next.js Image optimization
- ✅ Priority loading for hero image
- ✅ Responsive image sizes
- ✅ CSS-based animations (GPU accelerated)
- ✅ Code splitting (client components)

## Testing

### Visual Testing

1. Light mode: Toggle theme, verify illustration switches
2. Dark mode: Verify all text is readable
3. Mobile: Check responsive layout
4. Animations: Verify smooth entrance

### Accessibility Testing

```bash
# Run Lighthouse audit
pnpm exec nx run web:build
# Then test with Lighthouse in Chrome DevTools
```

## Future Enhancements

- [ ] Add video background option
- [ ] Implement parallax scrolling (optional)
- [ ] Add particle effects (subtle)
- [ ] Integrate with analytics (track CTA clicks)
- [ ] A/B test different headlines

## Related Documentation

- [Design System Guide](../../../docs/guides/development/monorepo-complete-guide.md)
- [ADR-016: Design System Integration](../../../docs/architecture/adrs/adr_016_frontend_design_system_integration.md)
- [Brand Guidelines](../../../docs/marketing/brand_guidelines.md)
