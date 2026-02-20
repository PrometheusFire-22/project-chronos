import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import {
  getAboutHero,
  getAboutValues,
  getPageSection,
  PageSectionKey,
  isDirectusError,
} from '@/lib/directus'

export const metadata: Metadata = {
  title: 'About - Clawdacious',
  description: 'Learn about Clawdacious and how we help businesses harness AI assistants and automation.',
  openGraph: {
    title: 'About Clawdacious',
    description: 'AI assistant setup and automation consulting for businesses.',
    type: 'website',
  },
}

export default async function AboutPage() {
  let aboutHero = null
  let values: { title: string; description: string; icon: string | null }[] = []
  let storySection = null

  try {
    const [heroData, valuesData, storyData] = await Promise.all([
      getAboutHero().catch(() => null),
      getAboutValues().catch(() => []),
      getPageSection(PageSectionKey.ABOUT_STORY).catch(() => null),
    ])
    aboutHero = heroData
    values = valuesData
    storySection = storyData
  } catch (error) {
    if (isDirectusError(error)) {
      console.error('Directus API error:', error.message, error.status)
    }
  }

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative py-24 sm:py-32">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight mb-6">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-foreground to-red-400">
                {aboutHero?.headline || 'AI That Works. Support You Can Call.'}
              </span>
            </h1>
            <p className="text-lg sm:text-xl text-muted-foreground">
              {aboutHero?.subheadline || 'Clawdacious is a GTA-based AI consultancy built for small business owners who know AI is the future — but don\'t have the time or technical background to figure it out themselves.'}
            </p>
          </div>
        </div>
      </section>

      {/* Story */}
      {storySection && (
        <section className="py-16 sm:py-24">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto">
              <h2 className="text-3xl font-bold mb-6">{storySection.headline}</h2>
              {storySection.subheadline && (
                <p className="text-lg text-muted-foreground leading-relaxed">
                  {storySection.subheadline}
                </p>
              )}
            </div>
          </div>
        </section>
      )}

      {/* Values */}
      {values.length > 0 && (
        <section className="py-16 sm:py-24">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-center mb-12">Our Values</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              {values.map((value, index) => (
                <div
                  key={index}
                  className="p-8 rounded-2xl border border-border bg-card backdrop-blur"
                >
                  <h3 className="text-xl font-semibold mb-3">{value.title}</h3>
                  <p className="text-muted-foreground">{value.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="py-16 sm:py-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center p-12 rounded-2xl border border-red-500/20 bg-card backdrop-blur">
            <h2 className="text-3xl font-bold text-foreground mb-4">Let's Talk About Your Business</h2>
            <p className="text-lg text-muted-foreground mb-8">
              15 minutes is enough to know whether this makes sense for you. No pitch, no pressure — just an honest conversation.
            </p>
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-lg bg-red-500 text-white font-semibold hover:bg-red-600 transition-colors shadow-lg shadow-red-500/20"
            >
              Get in Touch
              <ArrowRight className="h-5 w-5" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
