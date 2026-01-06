import type { Metadata } from 'next'
import { PlaceholderPage } from '@/components/PlaceholderPage'

export const metadata: Metadata = {
  title: 'Status - Chronos',
  description: 'Check the current operational status of the Chronos platform and services.',
  keywords: ['status', 'uptime', 'availability', 'service health', 'incidents'],
  openGraph: {
    title: 'Status - Chronos',
    description: 'Platform status page coming soon.',
    type: 'website',
  },
}

export const dynamic = 'force-static'

export default function StatusPage() {
  return (
    <PlaceholderPage
      title="Status Page Coming Soon"
      description="We're setting up a real-time status dashboard to monitor platform health, uptime, and any ongoing incidents. This will be available once the platform launches."
      icon="📊"
    />
  )
}
