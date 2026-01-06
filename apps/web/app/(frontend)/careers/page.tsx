import type { Metadata } from 'next'
import { PlaceholderPage } from '@/components/PlaceholderPage'

export const metadata: Metadata = {
  title: 'Careers - Chronos',
  description: 'Join the Chronos team and help build the future of private market intelligence.',
  keywords: ['careers', 'jobs', 'hiring', 'team', 'opportunities'],
  openGraph: {
    title: 'Careers - Chronos',
    description: 'Career opportunities coming soon.',
    type: 'website',
  },
}

export const dynamic = 'force-static'

export default function CareersPage() {
  return (
    <PlaceholderPage
      title="Careers Coming Soon"
      description="We're building an exceptional team to revolutionize private market intelligence. Career opportunities will be posted here as we grow. Follow us to stay updated."
      icon="💼"
    />
  )
}
