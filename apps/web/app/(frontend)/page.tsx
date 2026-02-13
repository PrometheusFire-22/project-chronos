import type { Metadata } from 'next'
import { UploadHero } from '@/components/sections/UploadHero'

export const metadata: Metadata = {
  title: 'Chronos - Extract Contacts from CCAA Filings',
  description: 'Upload any CCAA filing PDF and get a structured contact list in seconds. Names, roles, firms, emails, and phone numbers — extracted automatically.',
  keywords: ['CCAA', 'contact extraction', 'bankruptcy filings', 'insolvency', 'legal document processing'],
  openGraph: {
    title: 'Chronos - Extract Contacts from CCAA Filings',
    description: 'Upload any CCAA filing PDF and get a structured contact list in seconds.',
    type: 'website',
  },
}

export default function HomePage() {
  return <UploadHero />
}
