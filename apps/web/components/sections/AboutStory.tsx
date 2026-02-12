import { Lightbulb, TrendingUp, Target } from 'lucide-react'
import type { PageSection } from '@/lib/directus'

interface AboutStoryProps {
  sectionData?: PageSection | null
}

export function AboutStory({ sectionData }: AboutStoryProps) {
  // Fallback story aligned with special situations focus
  const defaultStory = {
    headline: 'Our Story',
    paragraphs: [
      'Chronos was born in Toronto during the most dramatic liquidity reset in private markets since 2008. As LP interests trade at 30%+ discounts and maturity walls loom, we saw capital allocators drowning in monitor reports, PDFs, and fragmented spreadsheets—all while the window to act narrowed by the day.',
      'We built Chronos to solve a fundamental problem: in distressed markets, information is abundant but intelligence is scarce. While everyone has access to the same public filings and monitor reports, the real edge comes from seeing the hidden connections—who the monitor trusts, which lender is overextended, where the geographic concentrations create systemic risk.',
      'Today, we\'re building the first intelligence layer purpose-built for special situations and distressed markets in Canada. We combine public market ruins with private deal flow, turning buried narratives into actionable intelligence for credit investors, restructuring advisors, and opportunistic capital allocators.',
    ],
  }

  const headline = sectionData?.headline ?? defaultStory.headline
  const storyText = sectionData?.subheadline ?? defaultStory.paragraphs.join('\n\n')

  // Split the story text into paragraphs (if it's a single string with line breaks)
  const paragraphs = storyText.split('\n\n').filter(p => p.trim().length > 0)

  return (
    <section className="relative bg-muted/30 py-24 lg:py-32">
      <div className="container mx-auto px-4">
        {/* Main Story */}
        <div className="max-w-4xl mx-auto mb-20">
          <h2 className="heading-section text-foreground mb-6">
            {headline}
          </h2>
          <div className="space-y-6 text-body-lg">
            {paragraphs.map((paragraph, index) => (
              <p key={index}>{paragraph}</p>
            ))}
          </div>
        </div>

        {/* Mission, Vision, Values */}
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {/* Mission */}
          <div className="p-8 rounded-2xl bg-card border border-border">
            <div className="icon-container bg-rose-500/10 mb-6">
              <Target className="icon-md text-rose-600 dark:text-rose-400" />
            </div>
            <h3 className="heading-card text-foreground mb-4">Mission</h3>
            <p className="text-muted-foreground leading-relaxed">
              Democratize access to relationship intelligence, empowering every investor to make
              data-driven decisions with confidence.
            </p>
          </div>

          {/* Vision */}
          <div className="p-8 rounded-2xl bg-card border border-border">
            <div className="icon-container bg-yellow-500/10 mb-6">
              <Lightbulb className="icon-md text-yellow-600 dark:text-yellow-400" />
            </div>
            <h3 className="heading-card text-foreground mb-4">Vision</h3>
            <p className="text-muted-foreground leading-relaxed">
              A world where hidden market connections are instantly discoverable, enabling smarter
              capital allocation and fostering innovation.
            </p>
          </div>

          {/* Approach */}
          <div className="p-8 rounded-2xl bg-card border border-border">
            <div className="icon-container bg-emerald-500/10 mb-6">
              <TrendingUp className="icon-md text-emerald-600 dark:text-emerald-400" />
            </div>
            <h3 className="heading-card text-foreground mb-4">Approach</h3>
            <p className="text-muted-foreground leading-relaxed">
              Combine cutting-edge technology with deep domain expertise to build products that
              investors love to use every day.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
