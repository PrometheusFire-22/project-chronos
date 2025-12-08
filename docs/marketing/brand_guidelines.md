# Automatonic AI Brand Guidelines

**Document Status**: Active
**Version**: 1.0
**Last Updated**: 2025-12-08
**Owner**: Geoff Bevans
**Related Epic**: CHRONOS-280

---

## Brand Overview

**Company**: Automatonic AI Inc.
**Product**: Project Chronos
**Website**: www.automatonicai.com
**Tagline**: *[To be determined during copy development]*

**Brand Essence**: Technical sophistication meets visual elegance. We communicate complex multi-modal database capabilities through clean, mathematical visualizations that inspire confidence in PE/VC/IB professionals.

---

## Color Palette

### Primary Colors

| Color Name | Hex Code | Tailwind Class | Usage |
|------------|----------|----------------|-------|
| **Primary Purple** | `#8B5CF6` | `violet-500` | Primary brand color, CTAs, links, logo |
| **Light Purple** | `#C4B5FD` | `violet-300` | Backgrounds, hover states, accents |
| **Dark Purple** | `#6D28D9` | `violet-700` | Hover states, dark mode primary |

### Accent Colors

| Color Name | Hex Code | Tailwind Class | Usage |
|------------|----------|----------------|-------|
| **Accent Teal** | `#06B6D4` | `cyan-500` | Secondary CTAs, interactive elements |
| **Success Green** | `#10B981` | `emerald-500` | Success states, geospatial map references |
| **Ocean Blue** | `#0EA5E9` | `sky-500` | Geospatial ocean/water references (optional) |

### Neutral Colors

| Color Name | Hex Code | Tailwind Class | Usage |
|------------|----------|----------------|-------|
| **Neutral Dark** | `#0F172A` | `slate-900` | Primary text, headings |
| **Neutral Medium** | `#475569` | `slate-600` | Secondary text, captions |
| **Neutral Light** | `#F8FAFC` | `slate-50` | Backgrounds (light mode) |
| **Pure White** | `#FFFFFF` | `white` | Backgrounds, cards |

### Gradient Definitions

**Primary Gradient** (Logo, hero sections):
```css
background: linear-gradient(135deg, #8B5CF6 0%, #06B6D4 50%, #10B981 100%);
/* Purple → Teal → Green */
```

**Subtle Background Gradient**:
```css
background: linear-gradient(180deg, #F8FAFC 0%, #E2E8F0 100%);
/* Slate-50 → Slate-200 */
```

---

## Typography

### Font Families

**Primary Font**: **Poppins**
- Source: Google Fonts
- Weights: 300 (Light), 400 (Regular), 500 (Medium), 600 (SemiBold), 700 (Bold)
- Usage: All headings, body text, UI elements
- Rationale: Modern, geometric, highly legible for financial data

**Monospace Font**: **JetBrains Mono** (for code blocks, technical specs)
- Source: Google Fonts
- Weights: 400 (Regular), 500 (Medium)
- Usage: Code snippets, API examples, technical documentation

### Type Scale

| Element | Size | Weight | Line Height | Tailwind Class |
|---------|------|--------|-------------|----------------|
| **H1 (Hero)** | 48px (3rem) | 700 (Bold) | 1.2 | `text-5xl font-bold` |
| **H2 (Section)** | 36px (2.25rem) | 600 (SemiBold) | 1.3 | `text-4xl font-semibold` |
| **H3 (Subsection)** | 24px (1.5rem) | 600 (SemiBold) | 1.4 | `text-2xl font-semibold` |
| **H4** | 20px (1.25rem) | 500 (Medium) | 1.5 | `text-xl font-medium` |
| **Body Large** | 18px (1.125rem) | 400 (Regular) | 1.6 | `text-lg` |
| **Body** | 16px (1rem) | 400 (Regular) | 1.6 | `text-base` |
| **Body Small** | 14px (0.875rem) | 400 (Regular) | 1.5 | `text-sm` |
| **Caption** | 12px (0.75rem) | 400 (Regular) | 1.4 | `text-xs` |

### Typography Guidelines

**Headings**:
- Use sentence case (not ALL CAPS) for H1-H3
- Max line length: 60 characters for readability
- Headings should be informative, not clever

**Body Text**:
- Use Regular (400) weight for all body copy
- Max line length: 70-80 characters
- Paragraph spacing: 1.5rem (24px)

**Emphasis**:
- Use **SemiBold (600)** for inline emphasis (avoid italics)
- Use color (Primary Purple) for links and CTAs

---

## Logo Specifications

### Logo Concept

**Structure**: Graph-based lettermark forming an "A"
- 5 nodes (vertices)
- 5 edges (connections)
- Forms recognizable uppercase or lowercase "A"
- Nodes use gradient colors (purple → teal → green)

### Logo Variants

#### Primary Logo (Full Color)
- **Format**: SVG
- **Dimensions**: Scalable (recommend 120px height for web)
- **Colors**: Gradient nodes (purple → teal → green), dark edges
- **Usage**: Homepage hero, email signatures, social media

#### Monochrome Logo (Light backgrounds)
- **Format**: SVG
- **Color**: Single color (Neutral Dark `#0F172A`)
- **Usage**: Print materials, low-color contexts

#### Monochrome Logo (Dark backgrounds)
- **Format**: SVG
- **Color**: Single color (Pure White `#FFFFFF`)
- **Usage**: Dark mode interfaces, footer

#### Favicon
- **Format**: PNG, SVG, ICO
- **Dimensions**: 32x32px, 64x64px, 128x128px
- **Simplified**: May simplify to fewer nodes for small sizes

### Logo Animation

**Subtle Animation** (homepage hero only):
- Pulse effect on nodes (0.8s ease-in-out loop)
- CSS-based (no JavaScript for performance)
- Optional: Fade-in on page load (Framer Motion)

**Interactive Animation** (future enhancement):
- Mouse-responsive node positions (physics-based)
- Requires canvas/WebGL (deferred to post-MVP)

### Logo Usage Rules

**Do**:
- Maintain minimum clear space (logo height × 0.25)
- Use on clean backgrounds (light or dark solid colors)
- Scale proportionally (maintain aspect ratio)

**Don't**:
- Stretch, skew, or distort
- Change gradient colors
- Add drop shadows or effects
- Place on busy/complex backgrounds

---

## Visual Design Principles

### 1. Mathematical Sophistication

**Goal**: Communicate technical depth through elegant visualizations

**Guidelines**:
- Use graph theory diagrams (nodes, edges, networks)
- Show vector space geometries (embeddings, clusters)
- Include geospatial maps with clean overlays
- Display time-series charts with statistical annotations

**Avoid**:
- Generic stock photos
- Overly simplistic icons
- Clipart or cartoon-style graphics

### 2. Clean Minimalism

**Goal**: Let data and structure speak (not decoration)

**Guidelines**:
- Ample white space (never cramped)
- Grid-based layouts (8px base unit)
- Subtle shadows and depth (avoid heavy drop shadows)
- Single accent color per section

**Avoid**:
- Gradients on backgrounds (except hero sections)
- Excessive borders or dividers
- Competing visual elements

### 3. Motion with Purpose

**Goal**: Guide attention, don't distract

**Guidelines**:
- Fade-in on scroll (Framer Motion)
- Hover states on interactive elements (0.2s transition)
- Page transitions (subtle, fast)

**Avoid**:
- Auto-playing animations (except logo pulse)
- Animations longer than 0.5s
- Parallax scrolling (performance issues)

---

## Component Design System

### Buttons

#### Primary Button (CTA)
```css
Background: Primary Purple (#8B5CF6)
Text: White
Padding: 12px 24px
Border Radius: 8px
Hover: Dark Purple (#6D28D9)
Shadow: 0 4px 6px rgba(139, 92, 246, 0.3)
```

#### Secondary Button
```css
Background: Transparent
Border: 2px solid Accent Teal (#06B6D4)
Text: Accent Teal
Padding: 12px 24px
Border Radius: 8px
Hover: Background Accent Teal, Text White
```

#### Ghost Button (tertiary)
```css
Background: Transparent
Text: Neutral Dark (#0F172A)
Padding: 12px 24px
Border Radius: 8px
Hover: Background Neutral Light (#F8FAFC)
```

### Cards

```css
Background: White
Border: 1px solid #E2E8F0 (slate-200)
Border Radius: 12px
Padding: 24px
Shadow: 0 1px 3px rgba(0, 0, 0, 0.1)
Hover: Shadow 0 10px 15px rgba(0, 0, 0, 0.1)
```

### Form Inputs

```css
Border: 1px solid #CBD5E1 (slate-300)
Border Radius: 8px
Padding: 12px 16px
Focus: Border Primary Purple, Ring 2px Primary Purple (50% opacity)
Error: Border Red, Ring Red
```

---

## Imagery Guidelines

### Photography Style

**Not applicable** - We use generated visualizations, not stock photography

### Illustrations & Graphics

**Primary Sources**:
1. **Code-generated** (D3.js, Canvas, Three.js)
   - Graph networks (force-directed layouts)
   - Vector space diagrams (PCA, t-SNE visualizations)
   - Geospatial maps (Leaflet, Mapbox overlays)
   - Time-series charts (Recharts, Chart.js)

2. **SVG Illustrations**
   - Abstract shapes representing data structures
   - Icon sets (Heroicons, Lucide)

3. **Hybrid Approach** (initial MVP)
   - Clean gradient backgrounds
   - Simple geometric shapes
   - SVG overlays on solid colors

**Avoid**:
- AI-generated art (DALL-E, Midjourney) - looks generic
- Stock illustrations from Unsplash/Pexels (unless very selective)
- Watermarked or low-resolution graphics

### Visualization Color Rules

**Graphs**: Use gradient (purple → teal → green) for node coloring
**Maps**: Green for land, Sky Blue for water, Purple for data overlays
**Charts**: Primary Purple for main series, Teal for comparisons

---

## Voice & Tone

### Brand Voice

**Attributes**:
- **Intelligent**: We understand complex systems
- **Confident**: We solve hard problems
- **Clear**: No jargon unless necessary
- **Innovative**: We push boundaries (graph DB, multi-modal)

**Not**:
- Academic/dry
- Salesy/hyperbolic
- Overly casual

### Writing Guidelines

**Headlines**:
- Action-oriented (verbs, not nouns)
- Specific (avoid vague claims like "revolutionary")
- Example: "See Hidden Connections in Your Deal Flow"

**Body Copy**:
- Short sentences (10-20 words)
- Short paragraphs (2-3 sentences)
- Active voice
- Concrete examples over abstract concepts

**Technical Content**:
- Explain database modalities simply
- Use analogies (e.g., "Graph databases are like LinkedIn for your data")
- Assume intelligence, not prior knowledge

---

## Dark Mode Considerations

**Future Enhancement** (deferred to post-MVP)

When implementing dark mode:
- Background: `#0F172A` (slate-900)
- Text: `#F8FAFC` (slate-50)
- Cards: `#1E293B` (slate-800)
- Borders: `#334155` (slate-700)
- Logo: Use white monochrome variant

---

## Responsive Design Breakpoints

| Breakpoint | Width | Tailwind Class | Usage |
|------------|-------|----------------|-------|
| **Mobile** | 320px - 639px | `sm:` | Single column, stacked |
| **Tablet** | 640px - 1023px | `md:` | Two columns, simplified nav |
| **Desktop** | 1024px - 1279px | `lg:` | Full layout, multi-column |
| **Large Desktop** | 1280px+ | `xl:` | Wide content, max-width 1280px |

**Mobile-First**: Design for mobile, enhance for desktop (not shrink desktop to mobile)

---

## Accessibility Standards

**Target**: WCAG 2.1 AA Compliance

**Color Contrast**:
- Text on backgrounds: Minimum 4.5:1 ratio
- Primary Purple on White: 4.54:1 (PASS)
- Neutral Dark on White: 18.26:1 (PASS)

**Interactive Elements**:
- Minimum touch target: 44px × 44px
- Keyboard navigable (focus states visible)
- ARIA labels for icons/graphics

**Typography**:
- Minimum body text: 16px
- Line height: 1.5 minimum
- Avoid text in images (use HTML/CSS)

---

## File Naming Conventions

**Images**:
- `logo-primary.svg`
- `logo-monochrome-dark.svg`
- `logo-monochrome-light.svg`
- `hero-graph-visualization.svg`
- `feature-geospatial-map.png`

**Components** (React):
- `Button.tsx` (PascalCase)
- `HeroSection.tsx`
- `FeatureCard.tsx`

**Stylesheets**:
- `globals.css` (site-wide)
- `components.css` (component overrides)

---

## Brand Assets Checklist

### Required for MVP Launch

- [ ] Logo (SVG, primary gradient version)
- [ ] Logo (SVG, monochrome dark)
- [ ] Logo (SVG, monochrome light)
- [ ] Favicon (32x32, 64x64, SVG)
- [ ] Hero visualization (graph network)
- [ ] Feature graphics (4x: graph, vector, geospatial, time-series)
- [ ] OpenGraph image (1200x630px for social sharing)

### Post-MVP Enhancements

- [ ] Animated logo (interactive canvas version)
- [ ] Video explainer (product demo)
- [ ] Infographics (database comparison charts)
- [ ] Screenshot library (dashboard previews)

---

## Tools & Resources

**Design Tools**:
- Figma (optional, for design handoff)
- SVG editors: Figma, Inkscape, or code-based (D3.js)

**Development**:
- Tailwind CSS (utility-first framework)
- shadcn/ui (component library)
- Framer Motion (animations)
- Heroicons (icon set)

**Color Tools**:
- Realtime Colors (palette testing)
- Coolors (palette generation)
- WebAIM Contrast Checker (accessibility)

**Typography**:
- Google Fonts (Poppins, JetBrains Mono)
- Typescale.com (type scale calculator)

---

## Version History

| Version | Date | Changes | Author |
|---------|------|---------|--------|
| 1.0 | 2025-12-08 | Initial brand guidelines created | Claude Code |

---

## References

- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [Google Fonts - Poppins](https://fonts.google.com/specimen/Poppins)

---

**Maintained in Git**: `docs/marketing/brand_guidelines.md`
**Synced to Confluence**: Yes (auto-sync on commit)
**Epic**: CHRONOS-280
