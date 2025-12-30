import type { Metadata} from 'next'
import { AboutHero } from '@/components/sections/AboutHero'
import { AboutStory } from '@/components/sections/AboutStory'
import { AboutValues } from '@/components/sections/AboutValues'
import { AboutTeam } from '@/components/sections/AboutTeam'
import { WaitlistSection } from '@/components/sections/WaitlistSection'
import {
  getFeaturesByCategory,
  FeatureCategory,
  isDirectusError,
} from '@/lib/directus'

export const metadata: Metadata = {
  title: 'About Us - Chronos Private Market Intelligence',
  description: 'Learn about Chronos, our mission to democratize relationship intelligence, and the team building the future of private market insights.',
  keywords: ['about', 'team', 'mission', 'values', 'company', 'private markets'],
  openGraph: {
    title: 'About Chronos',
    description: 'Building the future of private market intelligence with multi-modal data technology.',
    type: 'website',
  },
}

// Force dynamic rendering to avoid build-time Directus dependency
export const dynamic = 'force-dynamic'

export default async function AboutPage() {
  try {
    // Fetch about section content from Directus
    const values = await getFeaturesByCategory(FeatureCategory.ABOUT_SECTION)

    return (
      <>
        <AboutHero />
        <AboutStory />
        <AboutValues values={values} />
        <AboutTeam />
        <WaitlistSection />
      </>
    )
  } catch (error) {
    // Handle Directus API errors gracefully
    if (isDirectusError(error)) {
      console.error('Directus API error:', error.message, error.status)
    } else {
      console.error('Unexpected error fetching about data:', error)
    }

    // Return fallback UI
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950">
        <div className="text-center max-w-md mx-auto px-4">
          <h1 className="text-2xl font-bold text-white mb-4">
            Unable to load about page
          </h1>
          <p className="text-slate-400 mb-6">
            We're experiencing technical difficulties. Please try again later.
          </p>
          <a
            href="/about"
            className="inline-block px-6 py-3 rounded-lg bg-violet-500 text-white font-medium hover:bg-violet-600 transition-colors"
          >
            Retry
          </a>
        </div>
      </div>
    )
  }
}
