import { HeroSection } from '@/components/sections/HeroSection'

/**
 * Homepage
 *
 * Marketing landing page featuring:
 * - Hero section with value proposition
 * - (Future) Features section
 * - (Future) Benefits section
 * - (Future) CTA section
 *
 * This page uses server components where possible,
 * with client components for interactive elements.
 */
export default function HomePage() {
  return (
    <main className="min-h-screen">
      <HeroSection />
      {/* Additional sections will be added here */}
    </main>
  )
}
