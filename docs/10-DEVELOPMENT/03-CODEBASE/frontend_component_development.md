# Frontend Component Development Guide

**Version:** 1.0
**Date:** 2025-12-10
**Audience:** Developers building the Automatonic AI marketing site
**Related:** [ADR-016: Frontend Design System Integration](../../architecture/adrs/adr_016_frontend_design_system_integration.md)

---

## Overview

This guide provides step-by-step instructions for developing components in the Automatonic AI marketing site using our CSS variables-first design system.

**Tech Stack:**
- Next.js 14+ (App Router)
- TypeScript
- TailwindCSS + CSS Variables
- shad/cn UI components
- Framer Motion

---

## Table of Contents

1. [Project Setup](#project-setup)
2. [Creating a New Component](#creating-a-new-component)
3. [Using Theme Colors](#using-theme-colors)
4. [Adding Animations](#adding-animations)
5. [Building Forms](#building-forms)
6. [Theme-Aware SVG Components](#theme-aware-svg-components)
7. [Common Patterns](#common-patterns)
8. [Testing](#testing)
9. [Troubleshooting](#troubleshooting)

---

## Project Setup

### Prerequisites

```bash
# Required versions
node >= 18.0.0
pnpm >= 9.0.0
```

### Initial Setup

```bash
# 1. Install dependencies
pnpm install

# 2. Set up environment variables
cp .env.example .env.local

# 3. Run development server
pnpm run dev

# 4. Open browser
open http://localhost:3000
```

### Install New shad/cn Component

```bash
# Example: Add a new component
npx shadcn-ui@latest add dialog

# This will:
# - Download component to components/ui/dialog.tsx
# - Install any peer dependencies
# - Update components.json
```

---

## Creating a New Component

### Step 1: Choose Component Type

**Presentational Component** (no logic, pure UI):
```
components/ui/          <- Use for reusable UI primitives
```

**Feature Component** (contains logic):
```
components/sections/    <- Use for page sections (Hero, Features, etc.)
components/forms/       <- Use for form components
```

**Layout Component** (structural):
```
components/layout/      <- Use for Header, Footer, Navigation
```

### Step 2: Create Component File

**File:** `components/sections/FeatureCard.tsx`

```tsx
'use client'

import { motion } from 'framer-motion'
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { fadeInUp } from '@/lib/animations'
import { LucideIcon } from 'lucide-react'

interface FeatureCardProps {
  icon: LucideIcon
  title: string
  description: string
}

export function FeatureCard({ icon: Icon, title, description }: FeatureCardProps) {
  return (
    <motion.div variants={fadeInUp}>
      <Card className="h-full hover:shadow-lg transition-shadow">
        <CardHeader>
          <div className="mb-4">
            <Icon className="h-12 w-12 text-primary" />
          </div>
          <CardTitle>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
      </Card>
    </motion.div>
  )
}
```

**Key Points:**
- ✅ Use `'use client'` for components with interactivity
- ✅ Import animations from `@/lib/animations`
- ✅ Use CSS variables via Tailwind (`text-primary`)
- ✅ Export as named export
- ✅ Add TypeScript interface for props

### Step 3: Use Component

**File:** `app/(marketing)/page.tsx`

```tsx
import { FeatureCard } from '@/components/sections/FeatureCard'
import { Database, Network, Map } from 'lucide-react'

export default function HomePage() {
  return (
    <section className="container mx-auto px-4 py-20">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <FeatureCard
          icon={Database}
          title="Multi-Modal Database"
          description="Graph, vector, geospatial, and time-series in one system"
        />
        <FeatureCard
          icon={Network}
          title="Relationship Intelligence"
          description="See hidden connections in your deal flow"
        />
        <FeatureCard
          icon={Map}
          title="Geospatial Analysis"
          description="Geographic insights for portfolio companies"
        />
      </div>
    </section>
  )
}
```

---

## Using Theme Colors

### Option 1: Tailwind Utilities (Recommended)

```tsx
// Uses CSS variable automatically
<div className="bg-primary text-primary-foreground">
  Primary background with contrasting text
</div>

<div className="bg-secondary text-secondary-foreground">
  Secondary background
</div>

<div className="text-muted-foreground">
  Muted text color
</div>
```

### Option 2: Brand Colors (Direct Hex)

```tsx
// For brand-specific usage (logo, special highlights)
<div className="text-brand-purple">
  Automatonic AI
</div>

<div className="border-brand-teal">
  Teal accent
</div>
```

### Option 3: CSS Variables (Advanced)

```tsx
// In rare cases where you need inline styles
<div style={{ backgroundColor: 'hsl(var(--primary))' }}>
  Custom usage
</div>
```

### Color Reference Table

| Usage | Tailwind Class | CSS Variable | When to Use |
|-------|----------------|--------------|-------------|
| **Primary action** | `bg-primary` | `--primary` | CTAs, main buttons |
| **Secondary action** | `bg-secondary` | `--secondary` | Less prominent actions |
| **Accent highlights** | `bg-accent` | `--accent` | Success states, highlights |
| **Body text** | `text-foreground` | `--foreground` | Main text content |
| **Muted text** | `text-muted-foreground` | `--muted-foreground` | Captions, secondary text |
| **Borders** | `border-border` | `--border` | Dividers, input borders |
| **Backgrounds** | `bg-background` | `--background` | Page background |
| **Cards** | `bg-card` | `--card` | Card backgrounds |

---

## Adding Animations

### Step 1: Import Animation Variant

```tsx
import { fadeInUp, staggerContainer, hoverLift } from '@/lib/animations'
```

### Step 2: Apply to Component

**Simple Entrance Animation:**

```tsx
<motion.div
  variants={fadeInUp}
  initial="hidden"
  animate="visible"
>
  Content fades in and moves up
</motion.div>
```

**Scroll-Triggered Animation:**

```tsx
<motion.div
  variants={fadeInUp}
  initial="hidden"
  whileInView="visible"
  viewport={{ once: true, margin: "-100px" }}
>
  Animates when scrolled into view
</motion.div>
```

**Staggered Children:**

```tsx
<motion.div
  variants={staggerContainer}
  initial="hidden"
  whileInView="visible"
  viewport={{ once: true }}
>
  <motion.div variants={fadeInUp}>Child 1</motion.div>
  <motion.div variants={fadeInUp}>Child 2</motion.div>
  <motion.div variants={fadeInUp}>Child 3</motion.div>
</motion.div>
```

**Hover Interaction:**

```tsx
<motion.div
  variants={hoverLift}
  initial="rest"
  whileHover="hover"
>
  Hover to lift
</motion.div>
```

### Step 3: Respect Reduced Motion

```tsx
import { useReducedMotion } from 'framer-motion'

export function AnimatedCard() {
  const shouldReduceMotion = useReducedMotion()

  return (
    <motion.div
      animate={shouldReduceMotion ? {} : { y: [0, -10, 0] }}
      transition={{ duration: 2, repeat: Infinity }}
    >
      Content
    </motion.div>
  )
}
```

---

## Building Forms

### Step 1: Install Form Component

```bash
npx shadcn-ui@latest add form
```

This installs:
- `components/ui/form.tsx` (built on React Hook Form)
- `components/ui/label.tsx`
- `zod` for validation

### Step 2: Define Validation Schema

```tsx
import { z } from 'zod'

const waitlistSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Invalid email address')
    .max(254, 'Email too long'),
})

type WaitlistFormData = z.infer<typeof waitlistSchema>
```

### Step 3: Create Form Component

```tsx
'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { useToast } from '@/components/ui/use-toast'

export function WaitlistForm() {
  const { toast } = useToast()

  const form = useForm<WaitlistFormData>({
    resolver: zodResolver(waitlistSchema),
    defaultValues: {
      email: '',
    },
  })

  async function onSubmit(data: WaitlistFormData) {
    try {
      const response = await fetch('/api/waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (!response.ok) throw new Error('Failed to submit')

      toast({
        title: 'Success!',
        description: "You're on the waitlist. We'll be in touch soon.",
      })

      form.reset()
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Something went wrong. Please try again.',
        variant: 'destructive',
      })
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input placeholder="you@example.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting ? 'Submitting...' : 'Join Waitlist'}
        </Button>
      </form>
    </Form>
  )
}
```

---

## Theme-Aware SVG Components

### Option A: Conditional Rendering (Simple)

```tsx
'use client'

import { useTheme } from 'next-themes'
import { useEffect, useState } from 'react'
import Image from 'next/image'

export function HeroIllustration() {
  const { theme } = useTheme()
  const [mounted, setMounted] = useState(false)

  // Prevent SSR mismatch
  useEffect(() => setMounted(true), [])

  if (!mounted) {
    return <div className="w-full h-[600px] bg-muted animate-pulse" />
  }

  return (
    <Image
      src={theme === 'dark' ? '/images/hero-dark.svg' : '/images/hero-light.svg'}
      alt="Hero Illustration"
      width={1920}
      height={1080}
      className="w-full h-auto"
      priority
    />
  )
}
```

### Option B: CSS Variable-Based (Advanced)

```tsx
'use client'

import { motion } from 'framer-motion'

export function GraphIllustration() {
  return (
    <motion.svg
      viewBox="0 0 800 600"
      className="w-full h-auto"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      {/* Background uses CSS variable */}
      <rect width="800" height="600" fill="hsl(var(--background))" />

      {/* Grid uses custom variable */}
      <g id="grid">
        {/* Grid lines */}
      </g>

      {/* Shapes use theme colors */}
      <circle cx="400" cy="300" r="100" fill="hsl(var(--primary))" opacity="0.15" />
      <circle cx="200" cy="150" r="80" fill="hsl(var(--secondary))" opacity="0.15" />
    </motion.svg>
  )
}
```

---

## Common Patterns

### Pattern 1: Hero Section

```tsx
'use client'

import { motion } from 'framer-motion'
import { fadeInUp, staggerContainer } from '@/lib/animations'
import { Button } from '@/components/ui/button'
import { HeroIllustration } from '@/components/illustrations/HeroIllustration'

export function HeroSection() {
  return (
    <section className="container mx-auto px-4 py-20">
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center"
      >
        {/* Text Content */}
        <div>
          <motion.h1
            variants={fadeInUp}
            className="text-5xl font-bold text-foreground mb-4"
          >
            See the Hidden Connections in Your Deal Flow
          </motion.h1>

          <motion.p
            variants={fadeInUp}
            className="text-lg text-muted-foreground mb-8"
          >
            Graph-powered relationship intelligence for private markets
          </motion.p>

          <motion.div variants={fadeInUp} className="flex gap-4">
            <Button size="lg">Request Early Access</Button>
            <Button size="lg" variant="outline">Learn More</Button>
          </motion.div>
        </div>

        {/* Illustration */}
        <motion.div variants={fadeInUp}>
          <HeroIllustration />
        </motion.div>
      </motion.div>
    </section>
  )
}
```

### Pattern 2: Feature Grid

```tsx
import { FeatureCard } from '@/components/sections/FeatureCard'
import { Database, Network, Map, TrendingUp } from 'lucide-react'

const features = [
  {
    icon: Database,
    title: 'Multi-Modal Database',
    description: 'Graph, vector, geospatial, time-series in one system',
  },
  // ... more features
]

export function FeaturesSection() {
  return (
    <section className="py-20 bg-muted/50">
      <div className="container mx-auto px-4">
        <h2 className="text-4xl font-bold text-center mb-12">
          Powerful Features for Deal Sourcing
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature) => (
            <FeatureCard key={feature.title} {...feature} />
          ))}
        </div>
      </div>
    </section>
  )
}
```

### Pattern 3: Theme Toggle Button

```tsx
'use client'

import { Moon, Sun } from 'lucide-react'
import { useTheme } from 'next-themes'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

export function ThemeToggle() {
  const { setTheme } = useTheme()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon">
          <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => setTheme('light')}>
          Light
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme('dark')}>
          Dark
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme('system')}>
          System
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
```

---

## Testing

### Unit Testing (Components)

```tsx
// FeatureCard.test.tsx
import { render, screen } from '@testing-library/react'
import { FeatureCard } from './FeatureCard'
import { Database } from 'lucide-react'

describe('FeatureCard', () => {
  it('renders title and description', () => {
    render(
      <FeatureCard
        icon={Database}
        title="Test Feature"
        description="Test description"
      />
    )

    expect(screen.getByText('Test Feature')).toBeInTheDocument()
    expect(screen.getByText('Test description')).toBeInTheDocument()
  })
})
```

### Visual Testing (Storybook)

```tsx
// FeatureCard.stories.tsx
import type { Meta, StoryObj } from '@storybook/react'
import { FeatureCard } from './FeatureCard'
import { Database } from 'lucide-react'

const meta: Meta<typeof FeatureCard> = {
  title: 'Components/FeatureCard',
  component: FeatureCard,
}

export default meta
type Story = StoryObj<typeof FeatureCard>

export const Default: Story = {
  args: {
    icon: Database,
    title: 'Multi-Modal Database',
    description: 'Graph, vector, geospatial in one system',
  },
}
```

### Accessibility Testing

```bash
# Run axe-core accessibility tests
pnpm run test:a11y

# Manual testing checklist:
# ✅ Tab through all interactive elements
# ✅ Verify focus indicators visible
# ✅ Test with screen reader (VoiceOver/NVDA)
# ✅ Verify color contrast (4.5:1 minimum)
# ✅ Test with keyboard only (no mouse)
```

---

## Troubleshooting

### Issue: Theme Flicker on Page Load

**Symptom:** Flash of wrong theme when page first loads

**Solution:**
```tsx
// In app/layout.tsx
<html lang="en" suppressHydrationWarning>

// In ThemeProvider
<ThemeProvider
  attribute="class"
  defaultTheme="system"
  enableSystem
  disableTransitionOnChange  // Add this
>
```

### Issue: Hydration Mismatch with Theme Components

**Symptom:** React hydration error with `useTheme()`

**Solution:**
```tsx
const [mounted, setMounted] = useState(false)

useEffect(() => {
  setMounted(true)
}, [])

if (!mounted) {
  return null // or skeleton
}
```

### Issue: Animations Not Working

**Symptom:** Framer Motion animations don't trigger

**Checklist:**
- ✅ Added `'use client'` directive?
- ✅ Imported `motion` from `'framer-motion'`?
- ✅ Set both `initial` and `animate` props?
- ✅ Installed `tailwindcss-animate` plugin?

### Issue: shad/cn Component Not Styled

**Symptom:** Component renders but has no styling

**Solution:**
```bash
# Verify globals.css is imported
# Check app/layout.tsx has:
import './globals.css'

# Verify Tailwind config has correct content paths
# Check tailwind.config.ts:
content: [
  './app/**/*.{js,ts,jsx,tsx,mdx}',
  './components/**/*.{js,ts,jsx,tsx,mdx}',
]
```

---

## Next Steps

1. **Read ADR-016** for architectural decisions
2. **Review Brand Guidelines** for design specs
3. **Explore shad/cn docs** for available components
4. **Check Framer Motion docs** for advanced animations
5. **Join team discussions** in #frontend-dev channel

---

## Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [TailwindCSS Documentation](https://tailwindcss.com/docs)
- [shad/cn Documentation](https://ui.shadcn.com)
- [Framer Motion Documentation](https://www.framer.com/motion/)
- [React Hook Form Documentation](https://react-hook-form.com)
- [Zod Documentation](https://zod.dev)

---

## Changelog

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2025-12-10 | Initial developer guide created |

---

**Maintained by:** Engineering Team
**Last Updated:** 2025-12-10
**Next Review:** 2026-01-10
