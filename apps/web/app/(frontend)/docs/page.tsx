import type { Metadata } from 'next'
import { PlaceholderPage } from '@/components/PlaceholderPage'

export const metadata: Metadata = {
  title: 'Documentation - Chronos',
  description: "Comprehensive documentation for Chronos platform. We're building detailed guides and API references.",
  keywords: ['documentation', 'guides', 'API', 'tutorials', 'help'],
  openGraph: {
    title: 'Documentation - Chronos',
    description: 'Coming soon: comprehensive platform documentation.',
    type: 'website',
  },
}

export const dynamic = 'force-static'

export default function DocsPage() {
  return (
    <PlaceholderPage
      title="Documentation Coming Soon"
      description="We're building comprehensive documentation for the Chronos platform, including user guides, API references, and integration tutorials. Check back soon for detailed resources to help you get the most out of our intelligence platform."
      icon="📚"
    />
  )
}
