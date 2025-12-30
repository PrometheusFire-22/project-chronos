import type { Metadata } from 'next'

export const runtime = 'edge'

import { HeroSection } from '@/components/sections/HeroSection'
import { ProblemStatement } from '@/components/sections/ProblemStatement'
import { SolutionPillars } from '@/components/sections/SolutionPillars'
import { FeaturesPreview } from '@/components/sections/FeaturesPreview'
import { UseCases } from '@/components/sections/UseCases'
import { WaitlistSection } from '@/components/sections/WaitlistSection'
import {
  getHomepageHero,
  getFeaturesByCategory,
  FeatureCategory,
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

// Force dynamic rendering to avoid build-time Directus dependency
export const dynamic = 'force-dynamic'

export default async function HomePage() {
  try {
    // Fetch all homepage data from Directus in parallel
    const [hero, problems, pillars, features, useCases] = await Promise.all([
      getHomepageHero(),
      getFeaturesByCategory(FeatureCategory.PROBLEM_POINT),
      getFeaturesByCategory(FeatureCategory.SOLUTION_PILLAR),
      getFeaturesByCategory(FeatureCategory.KEY_FEATURE),
      getFeaturesByCategory(FeatureCategory.USE_CASE),
    ])

    return (
      <>
        <HeroSection data={hero} />
        <ProblemStatement problems={problems} />
        <SolutionPillars pillars={pillars} />
        <FeaturesPreview features={features} />
        <UseCases useCases={useCases} />
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
      <div className="min-h-screen flex items-center justify-center bg-slate-950">
        <div className="text-center max-w-md mx-auto px-4">
          <h1 className="text-2xl font-bold text-white mb-4">
            Unable to load content
          </h1>
          <p className="text-slate-400 mb-6">
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
