import type { Metadata } from 'next'
import { PlaceholderPage } from '@/components/PlaceholderPage'

export const metadata: Metadata = {
  title: 'Partners - Chronos',
  description: 'Partner with Chronos to deliver advanced intelligence solutions to your clients.',
  keywords: ['partners', 'partnerships', 'integrations', 'collaboration'],
  openGraph: {
    title: 'Partners - Chronos',
    description: 'Partnership program coming soon.',
    type: 'website',
  },
}

export const dynamic = 'force-static'

export default function PartnersPage() {
  return (
    <PlaceholderPage
      title="Partner Program Coming Soon"
      description="We're developing a partnership program for firms looking to integrate Chronos into their service offerings. Join our waitlist to be among the first to learn about partnership opportunities."
      icon="🤝"
    />
  )
}
