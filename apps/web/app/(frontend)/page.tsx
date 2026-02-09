import type { Metadata } from 'next'
import { HeroSection } from '@/components/sections/HeroSection'
import { ProblemStatement } from '@/components/sections/ProblemStatement'
import { SolutionPillars } from '@/components/sections/SolutionPillars'
import { FeaturesPreview } from '@/components/sections/FeaturesPreview'
import { UseCases } from '@/components/sections/UseCases'
import { WaitlistSection } from '@/components/sections/WaitlistSection'
import {
  getHomepageHero,
  getHomepageProblems,
  getHomepagePillars,
  getHomepageFeatures,
  getHomepageUseCases,
  getPageSection,
  PageSectionKey,
  isDirectusError,
} from '@/lib/directus'

export const metadata: Metadata = {
  title: 'Chronos - Multi-Model Relationship Intelligence for Private Markets',
  description: 'The first platform combining graph, vector, time-series, and geospatial data to uncover hidden market connections. Trusted by leading private market investors.',
  keywords: ['private markets', 'relationship intelligence', 'graph database', 'vector search', 'investment intelligence'],
  openGraph: {
    title: 'Chronos - Multi-Model Relationship Intelligence',
    description: 'Uncover hidden market connections with the first multi-model intelligence platform for private markets.',
    type: 'website',
  },
}

// Generate static page at build time
// Note: Static export means ISR doesn't work - rebuilds required for updates
export const dynamic = 'force-static'
// Removed: revalidate = false (was causing issues with content updates)

export default async function HomePage() {
  try {
    // Fetch all homepage data from Directus in parallel (CHRONOS-457)
    const [
      hero,
      problems,
      pillars,
      features,
      useCases,
      problemSection,
      solutionSection,
      featuresSection,
      useCasesSection,
    ] = await Promise.all([
      getHomepageHero(),
      getHomepageProblems(), // NEW: cms_homepage_problems
      getHomepagePillars(), // NEW: cms_homepage_pillars
      getHomepageFeatures(), // NEW: cms_homepage_features
      getHomepageUseCases(), // NEW: cms_homepage_use_cases
      getPageSection(PageSectionKey.PROBLEM_STATEMENT),
      getPageSection(PageSectionKey.SOLUTION_PILLARS),
      getPageSection(PageSectionKey.FEATURES_PREVIEW),
      getPageSection(PageSectionKey.USE_CASES),
    ])

    return (
      <>
        <HeroSection data={hero} />
        <ProblemStatement problems={problems} sectionData={problemSection} />
        <SolutionPillars pillars={pillars} sectionData={solutionSection} />
        <FeaturesPreview features={features} sectionData={featuresSection} />
        <UseCases useCases={useCases} sectionData={useCasesSection} />
        <WaitlistSection />
      </>
    )
  } catch (error) {
    // Handle Directus API errors gracefully
    if (isDirectusError(error)) {
      console.error('Directus API error:', error.message, error.status)
    } else {
      console.error('Unexpected error fetching homepage data:', error)
    }

    // Return fallback UI
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center max-w-md mx-auto px-4">
          <h1 className="text-2xl font-bold text-foreground mb-4">
            Unable to load content
          </h1>
          <p className="text-muted-foreground mb-6">
            We're experiencing technical difficulties. Please try again later.
          </p>
          <a
            href="/"
            className="inline-block px-6 py-3 rounded-lg bg-violet-500 text-white font-medium hover:bg-violet-600 transition-colors"
          >
            Retry
          </a>
        </div>
      </div>
    )
  }
}
