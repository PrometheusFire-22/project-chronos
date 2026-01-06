import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Contact Us - Chronos',
  description: "Get in touch with the Chronos team. We're here to answer your questions about our platform and consulting services.",
  keywords: ['contact', 'support', 'inquiry', 'consulting'],
  openGraph: {
    title: 'Contact Us - Chronos',
    description: 'Get in touch with the Chronos team.',
    type: 'website',
  },
}

export default function ContactLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
