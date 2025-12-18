# Logo Usage Guide - Automatonic AI

**Version**: 1.0
**Date**: 2025-12-08
**Epic**: CHRONOS-280
**Story**: CHRONOS-282
**Maintainer**: Project Chronos Team

---

## Table of Contents

1. [Overview](#overview)
2. [Logo Variants](#logo-variants)
3. [Technical Specifications](#technical-specifications)
4. [Usage Guidelines](#usage-guidelines)
5. [File Locations](#file-locations)
6. [Regenerating Assets](#regenerating-assets)
7. [HTML Implementation](#html-implementation)
8. [Troubleshooting](#troubleshooting)

---

## Overview

The Automatonic AI brand identity centers on the **"ai" wordmark** (`logo-ai-wordmark.svg`) as the official primary logo. This logo uses an innovative transparent cutout design that works seamlessly on both light and dark backgrounds.

### Design Philosophy

- **Minimalist**: Simple "ai" letterform with maximum impact
- **Universal**: Transparent cutout adapts to any background color
- **Clever**: Dual-meaning wordmark reads as both "a" and "i"
- **Scalable**: Perfect clarity from 16px favicons to billboard size
- **Modern**: Geometric precision, bold brand colors, mathematical elegance

### Official Logo: logo-ai-wordmark.svg ⭐

**This is THE logo.** Use it for all branding needs unless you have a specific reason to use an alternative variant.

---

## Logo Variants

### PRIMARY LOGO: "ai" Wordmark ⭐

**File**: `marketing/assets/logos/logo-ai-wordmark.svg`

**Description**: Lowercase "a" with extended stem and dot forming implicit "i". Transparent cutout adapts to both light and dark backgrounds automatically.

**Status**: **OFFICIAL PRIMARY LOGO** (as of 2025-12-08)

**Best For**:
- **All contexts** (universal use)
- Favicons (scales perfectly to 16x16px)
- App icons
- Social media profile pictures
- Website headers
- Marketing materials
- Presentations

**Technical Features**:
- **Transparent cutout**: Bowl center uses SVG mask - works on ANY background color
- **No separate light/dark versions needed**
- Most scalable (clear at 16x16px)
- Clever concatenation ("a" + "i" = "ai")
- Solid brand colors: Purple bowl (#8B5CF6), Teal stem (#06B6D4), Green dot (#10B981)

**Preview**:
```
  ●     ← Dot (tittle of "i") - GREEN
  |
 ⟨a⟩    ← Bowl (PURPLE) + stem (TEAL)
         Center is TRANSPARENT (shows background)
```

**Why This Is THE Logo**:
- Simple, memorable, scalable
- Works on light AND dark backgrounds (no variants needed)
- Dual-reading creates cognitive hook
- Minimal file size, maximum impact

---

### FULL WORDMARK: "automatonic ai"

**Files**:
- `marketing/assets/logos/logo-wordmark-automatonic-ai-light.svg` (for light backgrounds)
- `marketing/assets/logos/logo-wordmark-automatonic-ai-dark.svg` (for dark backgrounds)

**Description**: Full company name with integrated logo elements. First "a" uses logo style (no dot), final "ai" is the exact logo.

**Best For**:
- Website headers
- Email signatures
- Documents and presentations
- Marketing collateral
- Professional contexts where full name is needed

**Structure**:
- **"a"** (logo style, no dot) + **"utonomic "** (Poppins text) + **"ai"** (full logo with dot)

---

### ALTERNATIVE VARIANTS (For Special Use)

### Alt 1: Minimal Triangle "A"

**File**: `marketing/assets/logos/logo-minimal-triangle.svg`

**Description**: 3 nodes forming simplest "A" shape. Different node sizes, geometric edges.

**Best For**: Ultra-minimal contexts, pattern backgrounds

---

### Alt 2: Kandinsky "A"

**File**: `marketing/assets/logos/logo-kandinsky.svg`

**Description**: 5 nodes with dramatic size variation, abstract expressionist energy, asymmetric placement.

**Best For**: Creative/marketing contexts, A/B testing alternative to primary logo

**Note**: User likes this variant for potential future use/testing

---

## Technical Specifications

### SVG Files

| Property | Value |
|----------|-------|
| **Format** | SVG 1.1 |
| **ViewBox** | Symmetrical: `0 0 200 240`<br>Asymmetrical: `0 0 200 240`<br>Wordmark: `0 0 180 240` |
| **Color Space** | sRGB |
| **Gradients** | Linear (purple → teal → green) |
| **Accessibility** | Includes `<title>` and `aria-labelledby` |

### Generated Favicons (PNG)

Generated via: `npm run generate:assets`

| Size | Filename | Purpose |
|------|----------|---------|
| **16×16** | `favicon-16x16.png` | Browser tab icon |
| **32×32** | `favicon-32x32.png` | Browser tab (retina) |
| **180×180** | `apple-touch-icon.png` | iOS home screen |
| **192×192** | `android-chrome-192x192.png` | Android home screen |
| **512×512** | `android-chrome-512x512.png` | PWA splash screen |

**File Sizes**:
- 16×16: ~500 bytes
- 32×32: ~1 KB
- 180×180: ~6 KB
- 192×192: ~7 KB
- 512×512: ~25 KB

### Color Palette

From `docs/marketing/brand_guidelines.md`:

| Color | Hex | Tailwind | Usage |
|-------|-----|----------|-------|
| **Primary Purple** | `#8B5CF6` | `violet-500` | Nodes, primary brand |
| **Teal** | `#06B6D4` | `cyan-500` | Gradient accent |
| **Green** | `#10B981` | `emerald-500` | Success, growth |
| **Dark Slate** | `#0F172A` | `slate-900` | Backgrounds |
| **Light Slate** | `#F8FAFC` | `slate-50` | Text on dark |

---

## Usage Guidelines

### Minimum Sizes

| Variant | Min Size (Digital) | Min Size (Print) |
|---------|-------------------|------------------|
| **Symmetrical** | 48px | 0.5 inch |
| **Asymmetrical** | 48px | 0.5 inch |
| **ai Wordmark** | 16px | 0.25 inch |

### Clear Space

Maintain clear space around logo equal to **height of one node** (approximately 10% of logo height).

```
┌─────────────────────┐
│                     │  ← Clear space
│   ┌───────────┐    │
│   │   LOGO    │    │
│   └───────────┘    │
│                     │  ← Clear space
└─────────────────────┘
```

### Backgrounds

**Acceptable**:
- ✅ Dark backgrounds (slate-900, black)
- ✅ Light backgrounds (white, slate-50) with adjusted gradient
- ✅ Subtle gradients (low contrast)

**Avoid**:
- ❌ Busy photographs
- ❌ High-contrast patterns
- ❌ Colors that clash with purple/teal/green

### Color Treatments

**Standard** (Full Color):
- Use gradient as designed in SVG
- Best for digital displays

**Monochrome** (Future):
- Single-color versions (all white, all purple)
- For print, embroidery, laser etching
- Generate via: TBD script

**Inverted** (Future):
- Light colors on dark background
- Generate via: TBD script

---

## File Locations

### Source Assets (Version-Controlled)

```
project-chronos/
└── marketing/
    └── assets/
        ├── logos/
        │   ├── logo-graph-symmetrical.svg     ← Hand-coded SVG
        │   ├── logo-graph-asymmetrical.svg    ← Hand-coded SVG
        │   └── logo-ai-wordmark.svg           ← Hand-coded SVG
        └── favicons/
            ├── favicon-16x16.png              ← Generated
            ├── favicon-32x32.png              ← Generated
            ├── apple-touch-icon.png           ← Generated
            ├── android-chrome-192x192.png     ← Generated
            └── android-chrome-512x512.png     ← Generated
```

### Scripts

```
project-chronos/
└── marketing/
    └── scripts/
        └── generate-assets.ts  ← TypeScript asset generator
```

### Documentation

```
project-chronos/
└── docs/
    ├── marketing/
    │   ├── brand_guidelines.md       ← Full brand system
    │   └── logo_usage_guide.md       ← This file
    └── guides/
        └── development/
            └── typescript_frontend_primer.md  ← Learn TypeScript
```

---

## Regenerating Assets

### Prerequisites

```bash
# Ensure Node.js dependencies are installed
pnpm install
```

### Generate All Favicons

```bash
# From project root
npm run generate:assets
```

**Output**:
- ✅ 5 PNG favicon files in `/marketing/assets/favicons/`
- ⏱️ Takes ~2 seconds

### Generate from Specific Logo Variant

**Current Default**: `logo-ai-wordmark.svg` (best for favicons)

**To Change** (edit `generate-assets.ts`):
```typescript
const DEFAULT_LOGO = 'logo-graph-symmetrical.svg';  // Line ~140
```

Then re-run:
```bash
npm run generate:assets
```

### Troubleshooting Generation

**Error**: `Input file contains unsupported image format`
- **Cause**: SVG rendering library not installed
- **Fix**: `pnpm add @resvg/resvg-js`

**Error**: `Cannot find module 'sharp'`
- **Cause**: Missing dependencies
- **Fix**: `pnpm install`

**Error**: `Logo not found at ...`
- **Cause**: SVG file missing or renamed
- **Fix**: Check `/marketing/assets/logos/` for expected file

---

## HTML Implementation

### Favicon Links (All Pages)

Add to `<head>` section:

```html
<!-- Favicons (generated from logo-ai-wordmark.svg) -->
<link rel="icon" type="image/png" sizes="16x16" href="/favicons/favicon-16x16.png">
<link rel="icon" type="image/png" sizes="32x32" href="/favicons/favicon-32x32.png">

<!-- Apple Touch Icon (iOS) -->
<link rel="apple-touch-icon" sizes="180x180" href="/favicons/apple-touch-icon.png">

<!-- Android Chrome -->
<link rel="icon" type="image/png" sizes="192x192" href="/favicons/android-chrome-192x192.png">
<link rel="icon" type="image/png" sizes="512x512" href="/favicons/android-chrome-512x512.png">

<!-- Theme Color (matches brand purple) -->
<meta name="theme-color" content="#8B5CF6">
```

### Inline SVG (React/Next.js)

**Option 1: Direct Import**
```tsx
import LogoSVG from '@/marketing/assets/logos/logo-ai-wordmark.svg';

export function Header() {
  return (
    <header>
      <LogoSVG width={48} height={48} aria-label="Automatonic AI" />
    </header>
  );
}
```

**Option 2: React Component** (Future - see CHRONOS-282)
```tsx
import { Logo } from '@/components/Logo';

export function Header() {
  return (
    <header>
      <Logo variant="ai-wordmark" size={48} color="primary" />
    </header>
  );
}
```

### As `<img>` Tag

```html
<!-- For marketing site, email templates -->
<img
  src="/assets/logos/logo-ai-wordmark.svg"
  alt="Automatonic AI"
  width="128"
  height="128"
  loading="lazy"
/>
```

### CSS Background Image

```css
.logo {
  background-image: url('/assets/logos/logo-graph-symmetrical.svg');
  background-size: contain;
  background-repeat: no-repeat;
  width: 128px;
  height: 128px;
}
```

---

## Troubleshooting

### Logo Not Displaying

**Check**:
1. File path correct? (case-sensitive on Linux)
2. File exists in `/marketing/assets/logos/`?
3. Network tab shows 404 error?

**Fix**:
- Verify file path in browser DevTools
- Ensure file was committed to Git
- Check server/build output directory

### Favicon Not Updating

**Cause**: Browser cache

**Fix**:
1. Hard refresh: `Ctrl+Shift+R` (Windows) or `Cmd+Shift+R` (Mac)
2. Clear browser cache
3. Test in incognito/private window

### Colors Look Wrong

**Cause**: Color profile mismatch or gradient not rendering

**Check**:
1. SVG gradients defined in `<defs>` section?
2. Browser supports SVG gradients? (all modern browsers do)
3. Viewing in correct color space (sRGB)?

**Fix**:
- Validate SVG in https://validator.w3.org/
- Test in multiple browsers

---

## Future Enhancements

Planned for later sprints:

1. **React Logo Component** (CHRONOS-282)
   - Props-driven (variant, size, color)
   - TypeScript types
   - Framer Motion animations

2. **Monochrome Variants**
   - All-white (for dark backgrounds)
   - All-purple (single-color)
   - Script to generate from SVG

3. **Animated Variants**
   - Pulse animation on nodes
   - Edge drawing animation
   - Lottie/JSON export

4. **PWA Manifest**
   - manifest.json with icon references
   - Maskable icons (Android 13+)
   - Shortcut icons

5. **Brand Kit Download**
   - ZIP with all variants
   - PNG, SVG, PDF formats
   - Usage guidelines PDF

---

## Questions?

**Documentation**:
- Brand guidelines: `docs/marketing/brand_guidelines.md`
- TypeScript guide: `docs/guides/development/typescript_frontend_primer.md`

**Re-generate Assets**:
```bash
npm run generate:assets
```

**Modify Logos**:
- Edit SVG files directly in `/marketing/assets/logos/`
- Re-run generation script

---

**Maintained in Git**: `docs/marketing/logo_usage_guide.md`
**Epic**: CHRONOS-280
**Story**: CHRONOS-282
