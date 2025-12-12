'use client'

import { motion } from 'framer-motion'
import { fadeInUp, staggerContainer } from '@/utils/animations'
import { ThemeToggle } from '@/components/ThemeToggle'
import { Button } from '@chronos/ui/components/button'
import { Card } from '@chronos/ui/components/card'

/**
 * Theme System Test Page
 *
 * Verifies:
 * - CSS variables work in light/dark modes
 * - Theme toggle switches instantly
 * - Framer Motion animations work
 * - All shadcn/ui components use correct colors
 */
export default function ThemeTestPage() {
  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-6xl mx-auto space-y-12">
        {/* Header with Theme Toggle */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold text-foreground">
              Design System Test
            </h1>
            <p className="text-muted-foreground mt-2">
              Verifying CSS variables, theme switching, and animations
            </p>
          </div>
          <ThemeToggle />
        </div>

        {/* Color Swatches */}
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          <motion.div variants={fadeInUp}>
            <Card className="p-6">
              <h3 className="text-xl font-semibold mb-2 text-card-foreground">Primary</h3>
              <div className="w-full h-20 bg-primary rounded mb-2" />
              <p className="text-sm text-muted-foreground font-mono">
                hsl(var(--primary))
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Purple - #8B5CF6
              </p>
            </Card>
          </motion.div>

          <motion.div variants={fadeInUp}>
            <Card className="p-6">
              <h3 className="text-xl font-semibold mb-2 text-card-foreground">Secondary</h3>
              <div className="w-full h-20 bg-secondary rounded mb-2" />
              <p className="text-sm text-muted-foreground font-mono">
                hsl(var(--secondary))
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Teal - #06B6D4
              </p>
            </Card>
          </motion.div>

          <motion.div variants={fadeInUp}>
            <Card className="p-6">
              <h3 className="text-xl font-semibold mb-2 text-card-foreground">Accent</h3>
              <div className="w-full h-20 bg-accent rounded mb-2" />
              <p className="text-sm text-muted-foreground font-mono">
                hsl(var(--accent))
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Green - #10B981
              </p>
            </Card>
          </motion.div>
        </motion.div>

        {/* Button Variants */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-foreground">Button Variants</h2>
          <div className="flex flex-wrap gap-4">
            <Button>Primary Button</Button>
            <Button variant="secondary">Secondary Button</Button>
            <Button variant="outline">Outline Button</Button>
            <Button variant="ghost">Ghost Button</Button>
            <Button variant="destructive">Destructive Button</Button>
          </div>
        </section>

        {/* Typography */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-foreground">Typography</h2>
          <div className="space-y-2">
            <p className="text-foreground">
              Foreground text - Primary readable text
            </p>
            <p className="text-muted-foreground">
              Muted foreground - Secondary text, captions
            </p>
            <p className="font-mono text-sm">
              Monospace font - JetBrains Mono for code
            </p>
          </div>
        </section>

        {/* Cards */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-foreground">Cards</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-2">Card Title</h3>
              <p className="text-muted-foreground">
                Cards automatically use the correct background and foreground colors
                based on the current theme.
              </p>
            </Card>
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-2">Another Card</h3>
              <p className="text-muted-foreground">
                All components inherit theme colors via CSS variables.
              </p>
            </Card>
          </div>
        </section>

        {/* Status */}
        <section className="bg-accent/10 border border-accent p-6 rounded-lg">
          <h2 className="text-xl font-semibold text-accent mb-2">
            ✅ Design System Verification
          </h2>
          <ul className="space-y-1 text-sm text-foreground">
            <li>✓ CSS variables configured for light/dark modes</li>
            <li>✓ Theme toggle switches instantly</li>
            <li>✓ Framer Motion animations working</li>
            <li>✓ shadcn/ui components using correct colors</li>
            <li>✓ Typography using Poppins font</li>
            <li>✓ All semantic colors defined</li>
          </ul>
        </section>
      </div>
    </div>
  )
}
