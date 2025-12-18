# Frontend Development Guide

**Next.js 16, React 19, Nx Monorepo Development**

**Last Updated:** 2025-12-12  
**Status:** Active - Sprint 10 (Marketing Site Development)

---

## Table of Contents

1. [Overview](#overview)
2. [Tech Stack](#tech-stack)
3. [Project Structure](#project-structure)
4. [Development Workflow](#development-workflow)
5. [Component Development](#component-development)
6. [Styling \u0026 Theming](#styling--theming)
7. [Animations](#animations)
8. [Best Practices](#best-practices)
9. [Common Patterns](#common-patterns)
10. [Troubleshooting](#troubleshooting)

---

## Overview

Project Chronos uses a modern frontend stack with:
- **Next.js 16** with App Router for server-side rendering and routing
- **React 19** for UI components
- **Nx** for monorepo orchestration
- **TypeScript** for type safety
- **Tailwind CSS** + **CSS Variables** for styling
- **shadcn/ui** for component library
- **Framer Motion** for animations

**Design Philosophy**: CSS Variables-first design system with runtime theme switching

---

## Tech Stack

### Core Technologies

| Technology | Version | Purpose | Documentation |
|------------|---------|---------|---------------|
| **Next.js** | 16.0.9 | React framework | [Next.js Docs](https://nextjs.org/docs) |
| **React** | 19.2.2 | UI library | [React Docs](https://react.dev) |
| **TypeScript** | 5.9.3 | Type safety | [TS Docs](https://www.typescriptlang.org/docs) |
| **Nx** | 22.2.0 | Monorepo tool | [Nx Docs](https://nx.dev) |
| **pnpm** | 8.15.0+ | Package manager | [pnpm Docs](https://pnpm.io) |

### Styling \u0026 UI

| Technology | Version | Purpose |
|------------|---------|---------|
| **Tailwind CSS** | 3.4.3 | Utility-first CSS |
| **shadcn/ui** | Latest | Component library |
| **CSS Variables** | - | Theme system |
| **next-themes** | 0.4.6 | Theme management |
| **tailwindcss-animate** | 1.0.7 | Animation utilities |

### Animation \u0026 Interaction

| Technology | Version | Purpose |
|------------|---------|---------|
| **Framer Motion** | 12.23.26 | Animation library |
| **lucide-react** | 0.560.0 | Icon library |

---

## Project Structure

```
apps/web/
├── app/                        # Next.js App Router
│   ├── layout.tsx             # Root layout with ThemeProvider
│   ├── page.tsx               # Homepage
│   ├── globals.css            # Global styles + CSS variables
│   └── [routes]/              # Additional routes
│
├── components/                 # React components
│   ├── providers/             # Context providers
│   │   └── ThemeProvider.tsx  # Theme context wrapper
│   ├── sections/              # Page sections
│   │   └── HeroSection.tsx    # Hero section component
│   ├── illustrations/         # SVG illustrations
│   │   └── HeroIllustration.tsx
│   ├── ui/                    # shadcn/ui components (if local)
│   └── ThemeToggle.tsx        # Theme switcher
│
├── utils/                      # Utility functions
│   └── animations.ts          # Framer Motion variants
│
├── package.json               # App dependencies
├── tailwind.config.ts         # Tailwind configuration
├── tsconfig.json              # TypeScript configuration
├── next.config.js             # Next.js configuration
└── project.json               # Nx project configuration
```

---

## Development Workflow

### Starting Development Server

```bash
# From workspace root
cd /workspace

# Start dev server (runs on port 3000)
pnpm nx run web:dev

# Or use npm script
pnpm dev

# Visit http://localhost:3000
```

### Building for Production

```bash
# Build the app
pnpm nx run web:build

# Start production server
pnpm nx run web:start
```

### Type Checking

```bash
# Run TypeScript compiler
cd apps/web
npx tsc --noEmit
```

### Linting

```bash
# Lint the app
pnpm nx run web:lint
```

---

## Component Development

### Component Structure

**File Location**: `apps/web/components/[category]/ComponentName.tsx`

**Categories**:
- `providers/` - Context providers
- `sections/` - Page sections (HeroSection, Features, etc.)
- `illustrations/` - SVG illustrations
- `ui/` - Reusable UI components (if not from @chronos/ui)

**Example Component**:

```tsx
'use client' // If using hooks or interactivity

import { motion } from 'framer-motion'
import { fadeInUp } from '@/utils/animations'

interface ComponentNameProps {
  title: string
  description?: string
}

/**
 * ComponentName
 * 
 * Brief description of what this component does.
 * 
 * @example
 * <ComponentName title="Hello" description="World" />
 */
export function ComponentName({ title, description }: ComponentNameProps) {
  return (
    <motion.div
      variants={fadeInUp}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      className="container mx-auto px-4"
    >
      <h2 className="text-3xl font-bold text-foreground">{title}</h2>
      {description && (
        <p className="text-muted-foreground">{description}</p>
      )}
    </motion.div>
  )
}
```

### Import Patterns

**Path Aliases** (configured in `tsconfig.json`):
```tsx
// Use @/ for app-level imports
import { ComponentName } from '@/components/sections/ComponentName'
import { fadeInUp } from '@/utils/animations'

// Use @chronos/ for shared packages
import { Button } from '@chronos/ui/components/button'
import { cn } from '@chronos/ui/lib/utils'
```

### Component Checklist

- [ ] Use TypeScript with proper types
- [ ] Add JSDoc comment explaining purpose
- [ ] Use semantic HTML elements
- [ ] Apply Tailwind classes for styling
- [ ] Use CSS variables for colors (not hardcoded values)
- [ ] Add animations where appropriate
- [ ] Make responsive (mobile-first)
- [ ] Test in light and dark modes
- [ ] Add to Storybook (if applicable)

---

## Styling \u0026 Theming

### CSS Variables Approach

**Why CSS Variables?**
- Runtime theme switching without rebuilding
- Smaller bundle size (no duplicate utility classes)
- Better shadcn/ui compatibility
- Easier maintenance

**CSS Variables Location**: `apps/web/app/globals.css`

```css
@layer base {
  :root {
    --background: 0 0% 100%;
    --foreground: 222.2 84% 4.9%;
    --primary: 262 83% 58%;      /* Purple */
    --secondary: 188 94% 43%;    /* Teal */
    --accent: 160 84% 39%;       /* Green */
    /* ... more variables */
  }

  .dark {
    --background: 222.2 84% 4.9%;
    --foreground: 210 40% 98%;
    /* ... dark mode overrides */
  }
}
```

### Using CSS Variables in Components

```tsx
// ✅ CORRECT - Use Tailwind semantic colors
<div className="bg-background text-foreground">
  <h1 className="text-primary">Title</h1>
  <p className="text-muted-foreground">Description</p>
</div>

// ❌ INCORRECT - Don't hardcode colors
<div className="bg-white text-black">
  <h1 className="text-purple-500">Title</h1>
</div>
```

### Tailwind Configuration

**Location**: `apps/web/tailwind.config.ts`

```ts
export default {
  darkMode: ['class'], // Class-based dark mode
  theme: {
    extend: {
      colors: {
        // Semantic colors from CSS variables
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        // ... more colors
      },
      animation: {
        'fade-in-up': 'fadeInUp 0.6s ease-out forwards',
      },
      keyframes: {
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
}
```

### Theme Switching

**Theme Provider**: `apps/web/components/providers/ThemeProvider.tsx`

```tsx
import { ThemeProvider as NextThemesProvider } from 'next-themes'

export function ThemeProvider({ children, ...props }) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>
}
```

**Root Layout**: `apps/web/app/layout.tsx`

```tsx
export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}
```

**Theme Toggle Component**: `apps/web/components/ThemeToggle.tsx`

```tsx
'use client'

import { useTheme } from 'next-themes'
import { Moon, Sun } from 'lucide-react'

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()

  return (
    <button
      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
      className="p-2 rounded-md hover:bg-accent"
    >
      <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
      <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
    </button>
  )
}
```

---

## Animations

### Framer Motion Variants

**Location**: `apps/web/utils/animations.ts`

```ts
import { Variants } from 'framer-motion'

export const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }
  }
}

export const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2
    }
  }
}

export const hoverScale: Variants = {
  rest: { scale: 1 },
  hover: { scale: 1.05, transition: { duration: 0.2 } }
}
```

### Using Animations

```tsx
import { motion } from 'framer-motion'
import { fadeInUp, staggerContainer } from '@/utils/animations'

export function AnimatedSection() {
  return (
    <motion.section
      variants={staggerContainer}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-100px" }}
    >
      <motion.h2 variants={fadeInUp}>
        Title
      </motion.h2>
      <motion.p variants={fadeInUp}>
        Description
      </motion.p>
    </motion.section>
  )
}
```

### Animation Best Practices

- ✅ Use `whileInView` for scroll-triggered animations
- ✅ Set `viewport={{ once: true }}` to animate only once
- ✅ Use `margin` in viewport to trigger before element is visible
- ✅ Respect `prefers-reduced-motion` (Framer Motion does this automatically)
- ✅ Keep animations subtle and purposeful
- ❌ Don't overuse animations
- ❌ Don't animate on every interaction

---

## Best Practices

### TypeScript

```tsx
// ✅ CORRECT - Define prop types
interface ComponentProps {
  title: string
  description?: string
  onAction?: () => void
}

export function Component({ title, description, onAction }: ComponentProps) {
  // ...
}

// ❌ INCORRECT - Using 'any'
export function Component(props: any) {
  // ...
}
```

### Server vs Client Components

```tsx
// ✅ Server Component (default) - No 'use client'
export function ServerComponent() {
  // Can fetch data, no hooks
  return <div>Static content</div>
}

// ✅ Client Component - Add 'use client'
'use client'

import { useState } from 'react'

export function ClientComponent() {
  const [count, setCount] = useState(0)
  return <button onClick={() => setCount(count + 1)}>{count}</button>
}
```

### Responsive Design

```tsx
// ✅ Mobile-first approach
<div className="
  px-4           // Mobile: 1rem padding
  md:px-8        // Tablet: 2rem padding
  lg:px-16       // Desktop: 4rem padding
  
  text-2xl       // Mobile: 1.5rem
  md:text-3xl    // Tablet: 1.875rem
  lg:text-4xl    // Desktop: 2.25rem
">
  Responsive Text
</div>
```

### Accessibility

```tsx
// ✅ CORRECT - Semantic HTML + ARIA
<button
  onClick={handleClick}
  aria-label="Close dialog"
  className="..."
>
  <X className="h-4 w-4" />
</button>

// ✅ CORRECT - Keyboard navigation
<div
  role="button"
  tabIndex={0}
  onClick={handleClick}
  onKeyDown={(e) => e.key === 'Enter' && handleClick()}
>
  Interactive div
</div>
```

---

## Common Patterns

### Page Structure

```tsx
// apps/web/app/page.tsx
import { HeroSection } from '@/components/sections/HeroSection'
import { Features } from '@/components/sections/Features'

export default function HomePage() {
  return (
    <main>
      <HeroSection />
      <Features />
      {/* More sections */}
    </main>
  )
}
```

### Layout with Navigation

```tsx
// apps/web/app/layout.tsx
import { ThemeProvider } from '@/components/providers/ThemeProvider'
import { Navigation } from '@/components/Navigation'
import { Footer } from '@/components/Footer'
import './globals.css'

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider>
          <Navigation />
          {children}
          <Footer />
        </ThemeProvider>
      </body>
    </html>
  )
}
```

### Using shadcn/ui Components

```tsx
import { Button } from '@chronos/ui/components/button'
import { Card, CardHeader, CardTitle, CardContent } from '@chronos/ui/components/card'

export function Example() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Title</CardTitle>
      </CardHeader>
      <CardContent>
        <p>Content</p>
        <Button>Click me</Button>
      </CardContent>
    </Card>
  )
}
```

---

## Troubleshooting

### Common Issues

**Build errors**: See [Common Issues](../../reference/troubleshooting/COMMON_ISSUES.md)

**Import resolution errors**:
```bash
# Check tsconfig.json has path aliases
{
  "baseUrl": ".",
  "paths": {
    "@/*": ["./*"]
  }
}
```

**CSS not applying**:
- Check Tailwind config includes correct content paths
- Verify CSS variables are defined in globals.css
- Check dark mode class is applied to `<html>` tag

**Animations not working**:
- Ensure Framer Motion is installed
- Check component has `'use client'` directive
- Verify animation variants are imported correctly

---

## Related Documentation

- [PROJECT_OVERVIEW.md](../../PROJECT_OVERVIEW.md) - High-level architecture
- [Component Development Workflow](../../workflows/COMPONENT_DEVELOPMENT.md) - Step-by-step guide
- [Monorepo Complete Guide](monorepo-complete-guide.md) - Nx and pnpm setup
- [Common Issues](../../reference/troubleshooting/COMMON_ISSUES.md) - Troubleshooting
- [ADR-016: Design System](../../architecture/adrs/adr_016_frontend_design_system_integration.md) - Design system decisions

---

**Last Updated**: 2025-12-12  
**Part of**: Documentation refactor - Phase 4 (Create New Core Docs)  
**Related**: [DOCUMENTATION_INDEX.md](../../DOCUMENTATION_INDEX.md)
