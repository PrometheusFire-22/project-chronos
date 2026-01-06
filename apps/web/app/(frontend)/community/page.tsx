import type { Metadata } from 'next'
import { PlaceholderPage } from '@/components/PlaceholderPage'

export const metadata: Metadata = {
  title: 'Community - Chronos',
  description: 'Join the Chronos community to connect with other users, share insights, and get support.',
  keywords: ['community', 'forum', 'support', 'discussion', 'users'],
  openGraph: {
    title: 'Community - Chronos',
    description: 'Community forum coming soon.',
    type: 'website',
  },
}

export const dynamic = 'force-static'

export default function CommunityPage() {
  return (
    <PlaceholderPage
      title="Community Coming Soon"
      description="We're building a vibrant community where Chronos users can connect, share best practices, and collaborate. Join our waitlist to be notified when the community launches."
      icon="👥"
    />
  )
}
