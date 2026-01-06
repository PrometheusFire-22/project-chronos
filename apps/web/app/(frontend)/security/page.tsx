import type { Metadata } from 'next'
import { PlaceholderPage } from '@/components/PlaceholderPage'

export const metadata: Metadata = {
  title: 'Security - Chronos',
  description: 'Learn about Chronos security practices, compliance, and how we protect your data.',
  keywords: ['security', 'compliance', 'data protection', 'privacy', 'encryption'],
  openGraph: {
    title: 'Security - Chronos',
    description: 'Security information and compliance details.',
    type: 'website',
  },
}

export const dynamic = 'force-static'

export default function SecurityPage() {
  return (
    <PlaceholderPage
      title="Security Information Coming Soon"
      description="We're preparing detailed documentation about our security practices, compliance certifications, and data protection measures. Security is core to everything we build at Chronos."
      icon="🔒"
    />
  )
}
