# Chronos Design System — February 2026

> Canonical reference for typography tokens, color conventions, and component patterns used across the Chronos marketing site and application UI.

---

## 1. Typography Tokens

Defined in `apps/web/app/globals.css` inside `@layer components`. Use these classes instead of ad-hoc Tailwind size combos to keep sizing consistent across pages.

| Class | Resolves to | Use for |
|---|---|---|
| `.heading-hero` | `text-4xl sm:text-5xl lg:text-6xl font-bold leading-[1.1]` | Page-level `<h1>` on hero sections |
| `.heading-section` | `text-3xl sm:text-4xl font-bold` | Section `<h2>` headings (e.g. "Our Values") |
| `.heading-card` | `text-xl sm:text-2xl font-bold` | Card or feature titles |
| `.heading-card-lg` | `text-2xl sm:text-3xl font-bold` | Feature detail layout titles |
| `.text-body-lg` | `text-lg text-muted-foreground leading-relaxed` | Lead paragraphs, section subtitles |
| `.text-body` | `text-base text-muted-foreground` | Standard body text |
| `.prose-card` | `prose prose-sm dark:prose-invert max-w-none text-muted-foreground` | CMS rich text in cards |
| `.prose-feature` | `prose prose-lg dark:prose-invert max-w-none text-muted-foreground prose-strong:text-foreground dark:prose-strong:text-white` | Feature detail rich text |
| `.icon-container` | `w-12 h-12 rounded-xl flex items-center justify-center` | Standard icon box (12x12) |
| `.icon-container-lg` | `w-14 h-14 rounded-xl flex items-center justify-center` | Large icon box (14x14) |
| `.icon-sm` | `w-5 h-5` | Small icons (table check/x) |
| `.icon-md` | `w-6 h-6` | Standard icons |
| `.icon-lg` | `w-7 h-7` | Large icons |

### Usage example

```tsx
<h1 className="heading-hero mb-6">Page Title</h1>
<p className="text-body-lg">Subtitle or lead paragraph.</p>

<h2 className="heading-section text-foreground mb-4">Section</h2>
<h3 className="heading-card text-foreground mb-3">Card Title</h3>
<h3 className="heading-card-lg text-foreground mb-4">Feature Detail Title</h3>
<p className="text-body">Card description text.</p>
<div className="prose-card" dangerouslySetInnerHTML={{ __html: richText }} />
<div className="prose-feature" dangerouslySetInnerHTML={{ __html: richText }} />

{/* Icons */}
<div className="icon-container bg-purple-500/10">
  <Icon className="icon-md text-purple-500" />
</div>
<div className="icon-container-lg bg-purple-500/10">
  <Icon className="icon-lg text-purple-500" />
</div>
```

### Notes

- These classes live in `@layer components`, so they can be overridden by utility classes when needed (e.g. `heading-hero tracking-tight`).
- Always pair heading classes with `text-foreground` for color. The typography tokens intentionally omit color so they compose freely with gradient text, custom colors, etc.
- `text-body-lg` and `text-body` include `text-muted-foreground` by default since body text is almost always muted.

---

## 2. Color Palette Conventions

### Semantic roles

| Color | HSL Variable | Role |
|---|---|---|
| Purple (`--primary`) | `262 83% 58%` | Brand primary, CTA gradients, focus rings |
| Teal (`--secondary`) | `188 94% 43%` | Secondary accent |
| Green (`--accent`) | `160 84% 39%` | Success states, positive signals |

### Feature/section color mapping

Content-aware color is applied via title-matching logic in each section component. The general pattern:

| Content keyword | Color | Example |
|---|---|---|
| "contagion", "location" | Emerald/Green | `bg-emerald-500/10`, `text-emerald-500` |
| "usage", "analytics" | Rose/Pink | `bg-rose-500/10`, `text-rose-500` |
| "strategic introduction" | Amber/Yellow | `bg-amber-500/10`, `text-amber-500` |
| "syndicate exposure" | Blue | `bg-blue-500/10`, `text-blue-500` |
| Default/fallback | Purple | `bg-purple-500/10`, `text-purple-500` |

### Icon background pattern

Icon containers use design system tokens:

```tsx
<div className="icon-container bg-{color}-500/10">
  <Icon className="icon-md text-{color}-600 dark:text-{color}-400" />
</div>
```

For larger variants (14x14):

```tsx
<div className="icon-container-lg bg-{color}-500/10">
  <Icon className="icon-lg text-{color}-600 dark:text-{color}-400" />
</div>
```

### Icon color rule

Use `text-{color}-500` everywhere. Only add `dark:text-{color}-400` when the icon appears on a background that needs extra contrast.

---

## 3. Global Background

Defined in `apps/web/app/layout.tsx`. Three fixed layers:

1. **Dark mode gradient**: `from-purple-900/20` — subtle purple radial at top
2. **Light mode gradient**: `from-purple-100/20` — very faint purple tint
3. **Grid overlay**: SVG grid with mask fade, `opacity-20` dark / `opacity-5` light

Sections that need to fully obscure the global gradient should use `bg-muted` (full opacity), not `bg-muted/30`.

---

## 4. Card Patterns

### Standard card

```tsx
<div className="p-8 rounded-2xl bg-card border border-border">
  {/* content */}
</div>
```

### Interactive card (with hover)

```tsx
<div className="group relative p-8 rounded-2xl bg-card border border-border
  hover:border-{color}-500/50 transition-all duration-300 shadow-sm hover:shadow-md overflow-hidden">
  {/* Subtle hover gradient */}
  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity
    duration-500 pointer-events-none bg-gradient-to-br from-{color}-500/20 to-transparent" />
  <div className="relative z-10">
    {/* content */}
  </div>
</div>
```

---

## 5. CTA Button Patterns

### Primary CTA (gradient)

```tsx
<a
  href="/path"
  className="inline-flex items-center gap-2 px-8 py-4 rounded-lg
    bg-gradient-to-r from-purple-500 to-indigo-500 text-white font-semibold
    hover:opacity-90 transition-opacity shadow-lg shadow-purple-500/25"
>
  Button Text
</a>
```

### Primary CTA (solid, hero variant)

```tsx
<Link
  href="/path"
  className="inline-flex items-center justify-center h-12 px-8 text-base font-semibold
    rounded-md bg-foreground text-background hover:bg-purple-600 hover:text-white
    transition-colors shadow-lg shadow-purple-500/20"
>
  Button Text
</Link>
```

> Avoid wrapping `<Link>` around `<Button>` for primary CTAs — it causes hover specificity issues in light mode. Use styled `<Link>` or `<a>` directly.

### Secondary CTA (outline)

```tsx
<Button variant="outline" size="lg" className="border-border text-foreground hover:bg-muted h-12 px-8 text-base">
  Secondary
</Button>
```

---

## 6. Skeleton Loading Pattern

Skeleton loaders in `loading.tsx` files should mirror the actual page structure:

- Use the same container widths, paddings, and border-radius
- Match the grid layout (e.g. `grid-cols-1 sm:grid-cols-2`)
- Include the same wrapper elements (`bg-card/50 backdrop-blur-xl border border-border rounded-2xl`)
- Represent each content element with a `<Skeleton>` of matching approximate dimensions

```tsx
import { Skeleton } from '@chronos/ui/components/skeleton'

// Example: metric box skeleton
<div className="p-4 rounded-xl bg-background/50 border border-border">
  <div className="flex justify-between items-start mb-2">
    <Skeleton className="h-4 w-20 rounded" />
    <Skeleton className="w-4 h-4 rounded" />
  </div>
  <div className="flex items-baseline gap-2 mb-3">
    <Skeleton className="h-7 w-8 rounded" />
    <Skeleton className="h-4 w-10 rounded" />
  </div>
  <Skeleton className="h-1.5 w-full rounded-full" />
</div>
```

---

## 7. Dark/Light Mode

- Default theme: **dark**
- Theme switching via `next-themes` (`ThemeProvider` in `layout.tsx`)
- CSS variables in `:root` (light) and `.dark` (dark) in `globals.css`
- Always test both modes — especially sections with `bg-muted/xx` opacity values, which can bleed the global purple gradient in light mode

---

## 8. Font Stack

- **Primary**: Poppins (300–700)
- **Monospace**: JetBrains Mono (400, 500)
- Loaded via Google Fonts import at top of `globals.css`
