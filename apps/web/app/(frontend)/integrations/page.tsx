import type { Metadata } from 'next'
import { PlaceholderPage } from '@/components/PlaceholderPage'

export const metadata: Metadata = {
  title: 'Integrations - Chronos',
  description: 'Connect Chronos with your existing tools and workflows. Integration marketplace coming soon.',
  keywords: ['integrations', 'API', 'connections', 'tools'],
  openGraph: {
    title: 'Integrations - Chronos',
    description: 'Integration marketplace coming soon.',
    type: 'website',
  },
}

export const dynamic = 'force-static'

export default function IntegrationsPage() {
  return (
    <PlaceholderPage
      title="Integrations Coming Soon"
      description="We're building a comprehensive integration marketplace to connect Chronos with your existing tools and workflows. Check back soon for updates on our API documentation and partner integrations."
      icon="🔌"
    />
  )
}
