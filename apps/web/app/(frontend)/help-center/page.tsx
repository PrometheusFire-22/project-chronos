import type { Metadata } from 'next'
import { PlaceholderPage } from '@/components/PlaceholderPage'

export const metadata: Metadata = {
  title: 'Help Center - Chronos',
  description: 'Get help with Chronos - FAQs, guides, and support resources.',
  keywords: ['help', 'support', 'FAQ', 'troubleshooting', 'guides'],
  openGraph: {
    title: 'Help Center - Chronos',
    description: 'Support resources coming soon.',
    type: 'website',
  },
}

export const dynamic = 'force-static'

export default function HelpCenterPage() {
  return (
    <PlaceholderPage
      title="Help Center Coming Soon"
      description="We're preparing a comprehensive help center with FAQs, how-to guides, video tutorials, and troubleshooting resources. In the meantime, reach out through our contact page for assistance."
      icon="❓"
    />
  )
}
