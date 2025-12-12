'use client'

import { motion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'
import { Button } from '@chronos/ui/components/button'
import { HeroIllustration } from '@/components/illustrations/HeroIllustration'
import { fadeInUp, staggerContainer } from '@/utils/animations'

/**
 * Hero Section Component
 *
 * Primary landing section featuring:
 * - Animated headline and subheadline
 * - Theme-aware hero illustration
 * - Primary and secondary CTAs
 * - Responsive layout (mobile-first)
 *
 * Design System:
 * - Uses CSS variables for theming
 * - Framer Motion for entrance animations
 * - Staggered animation timing for visual hierarchy
 *
 * @example
 * <HeroSection />
 */
export function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center justify-center bg-background">
      <div className="container mx-auto px-4 py-20 lg:py-32">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Content Column */}
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
            className="space-y-8"
          >
            {/* Headline */}
            <motion.h1
              variants={fadeInUp}
              className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground leading-tight"
            >
              See the{' '}
              <span className="text-primary">Hidden Connections</span>{' '}
              in Your Deal Flow
            </motion.h1>

            {/* Subheadline */}
            <motion.p
              variants={fadeInUp}
              className="text-lg sm:text-xl text-muted-foreground max-w-2xl"
            >
              Graph-powered relationship intelligence for private markets.
              Discover multi-hop connections, track deal flow patterns, and
              uncover opportunities hidden in your network.
            </motion.p>

            {/* Feature Pills */}
            <motion.div
              variants={fadeInUp}
              className="flex flex-wrap gap-3"
            >
              {[
                'Graph Database',
                'Vector Search',
                'Geospatial Analysis',
                'Time-Series Tracking'
              ].map((feature) => (
                <span
                  key={feature}
                  className="inline-flex items-center px-4 py-2 rounded-full bg-muted text-sm font-medium text-muted-foreground"
                >
                  {feature}
                </span>
              ))}
            </motion.div>

            {/* CTAs */}
            <motion.div
              variants={fadeInUp}
              className="flex flex-col sm:flex-row gap-4"
            >
              <Button size="lg" className="group">
                Request Early Access
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Button>
              <Button size="lg" variant="outline">
                Watch Demo
              </Button>
            </motion.div>

            {/* Social Proof */}
            <motion.div
              variants={fadeInUp}
              className="pt-8 border-t border-border"
            >
              <p className="text-sm text-muted-foreground mb-4">
                Trusted by leading PE/VC firms
              </p>
              {/* Placeholder for logos - can add later */}
              <div className="flex gap-8 opacity-50">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="h-8 w-24 bg-muted rounded animate-pulse"
                  />
                ))}
              </div>
            </motion.div>
          </motion.div>

          {/* Illustration Column */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative"
          >
            <HeroIllustration />
          </motion.div>
        </div>
      </div>

      {/* Background Gradient (subtle) */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute top-0 right-0 w-1/2 h-1/2 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-1/2 h-1/2 bg-secondary/5 rounded-full blur-3xl" />
      </div>
    </section>
  )
}
