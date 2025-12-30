import type { Metadata } from 'next'

export const runtime = 'edge'

import { FeaturesHero } from '@/components/sections/FeaturesHero'
import { FeatureDetails } from '@/components/sections/FeatureDetails'
import { FeatureComparison } from '@/components/sections/FeatureComparison'
import { WaitlistSection } from '@/components/sections/WaitlistSection'
import {
  getFeaturesByCategory,
  FeatureCategory,
  isDirectusError,
} from '@/lib/directus'

export const metadata: Metadata = {
  title: 'Features - Chronos Multi-Model Intelligence Platform',
  description: 'Explore the powerful features of Chronos: graph database, vector search, time-series analytics, and geospatial operations for private market intelligence.',
  keywords: ['features', 'graph database', 'vector search', 'time-series', 'geospatial', 'private markets'],
  openGraph: {
    title: 'Features - Chronos Platform',
    description: 'The most advanced multi-model platform for private market intelligence.',
    type: 'website',
  },
}

// Force dynamic rendering to avoid build-time Directus dependency
export const dynamic = 'force-dynamic'

export default async function FeaturesPage() {
  try {
    // Fetch detailed features from Directus
    const featureDetails = await getFeaturesByCategory(FeatureCategory.FEATURES_DETAIL)

    return (
      <>
        <FeaturesHero />
        <FeatureDetails features={featureDetails} />
        <FeatureComparison />
        <WaitlistSection />
      </>
    )
  } catch (error) {
    // Handle Directus API errors gracefully
    if (isDirectusError(error)) {
      console.error('Directus API error:', error.message, error.status)
    } else {
      console.error('Unexpected error fetching features data:', error)
    }

    // Return fallback UI
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950">
        <div className="text-center max-w-md mx-auto px-4">
          <h1 className="text-2xl font-bold text-white mb-4">
            Unable to load features
          </h1>
          <p className="text-slate-400 mb-6">
            We're experiencing technical difficulties. Please try again later.
          </p>
          <a
            href="/features"
            className="inline-block px-6 py-3 rounded-lg bg-violet-500 text-white font-medium hover:bg-violet-600 transition-colors"
          >
            Retry
          </a>
        </div>
      </div>
    )
  }
}
