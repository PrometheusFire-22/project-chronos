import type { Metadata } from 'next'
import { PlaceholderPage } from '@/components/PlaceholderPage'

export const metadata: Metadata = {
  title: 'Documentation - Chronos',
  description: 'Comprehensive guides and API documentation for the Chronos platform.',
  keywords: ['documentation', 'docs', 'API', 'guides', 'tutorials'],
  openGraph: {
    title: 'Documentation - Chronos',
    description: 'API documentation and guides coming soon.',
    type: 'website',
  },
}

export const dynamic = 'force-static'

export default function DocumentationPage() {
  return (
    <PlaceholderPage
      title="Documentation Coming Soon"
      description="We're preparing comprehensive documentation, API references, guides, and tutorials to help you get the most out of Chronos. Sign up for our waitlist to be notified when documentation becomes available."
      icon="📚"
    />
  )
}
