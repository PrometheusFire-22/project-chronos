import type { Metadata } from 'next'
import { PlaceholderPage } from '@/components/PlaceholderPage'

export const metadata: Metadata = {
  title: 'Changelog - Chronos',
  description: 'Track the latest updates, features, and improvements to the Chronos platform.',
  keywords: ['changelog', 'updates', 'releases', 'features'],
  openGraph: {
    title: 'Changelog - Chronos',
    description: 'Latest updates and releases.',
    type: 'website',
  },
}

export const dynamic = 'force-static'

export default function ChangelogPage() {
  return (
    <PlaceholderPage
      title="Changelog Coming Soon"
      description="Stay tuned for our product changelog where we'll share all the latest updates, new features, bug fixes, and improvements to the Chronos platform."
      icon="📝"
    />
  )
}
