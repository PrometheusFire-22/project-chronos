import { Check, X } from 'lucide-react'
import type { ComparisonItem, PageSection } from '@/lib/directus'

interface FeatureComparisonProps {
  comparisonItems?: ComparisonItem[]
  sectionData?: PageSection | null
}

export function FeatureComparison({ comparisonItems, sectionData }: FeatureComparisonProps) {
  // Fallback values if CMS data is not available
  const headline = sectionData?.headline ?? 'Why Choose Chronos?'
  const subheadline = sectionData?.subheadline ??
    'See how Chronos compares to traditional private market research and CRM tools.'

  const features = comparisonItems ?? [
    {
      category: 'Data Visibility',
      chronos_value: 'Unified Market Intelligence',
      traditional_value: 'Fragmented Spreadsheets',
    },
    {
      category: 'Referral Mapping',
      chronos_value: 'Automatic Path-to-Monitor',
      traditional_value: 'Manual LinkedIn Digging',
    },
    {
      category: 'Document Search',
      chronos_value: 'Deep Narrative Extraction',
      traditional_value: 'Basic Keyword Search',
    },
    {
      category: 'Liquidity Timing',
      chronos_value: 'Live "Maturity Wall" Alerts',
      traditional_value: 'Static Historical Snapshots',
    },
    {
      category: 'Location Context',
      chronos_value: 'Neighborhood Risk Heatmaps',
      traditional_value: 'Isolated Address Fields',
    },
    {
      category: 'Sourcing Speed',
      chronos_value: 'Instant Syndicate Analysis',
      traditional_value: 'Weeks of "Shoe-Leather" Research',
    },
    {
      category: 'Market Pulse',
      chronos_value: 'Real-time Filing Signals',
      traditional_value: 'Delayed Quarterly Updates',
    },
    {
      category: 'Accessibility',
      chronos_value: 'Modern Cloud Experience',
      traditional_value: 'Legacy Desktop Software',
    },
  ]

  return (
    <section className="relative bg-slate-950 py-24 lg:py-32">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-16 max-w-3xl mx-auto">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4">
            {headline}
          </h2>
          <p className="text-lg text-slate-400">
            {subheadline}
          </p>
        </div>

        {/* Comparison Table */}
        <div className="max-w-5xl mx-auto">
          <div className="rounded-2xl border border-slate-800 overflow-hidden">
            {/* Table Header */}
            <div className="grid grid-cols-3 gap-4 bg-slate-900 p-6 border-b border-slate-800">
              <div className="text-slate-500 text-sm font-medium">Feature</div>
              <div className="text-center">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-purple-500/20 to-indigo-500/20 border border-purple-500/30">
                  <span className="text-white font-semibold">Chronos</span>
                </div>
              </div>
              <div className="text-center text-slate-400 font-medium">Traditional Tools</div>
            </div>

            {/* Table Rows */}
            <div className="divide-y divide-slate-800">
              {features.map((feature, index) => (
                <div
                  key={index}
                  className="grid grid-cols-3 gap-4 p-6 bg-slate-950 hover:bg-slate-900/50 transition-colors"
                >
                  <div className="text-white font-medium">{feature.category}</div>
                  <div className="flex items-center gap-3">
                    <Check className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                    <span className="text-slate-300 text-sm">{feature.chronos_value}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <X className="w-5 h-5 text-red-400 flex-shrink-0" />
                    <span className="text-slate-500 text-sm">{feature.traditional_value}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Bottom CTA */}
          <div className="mt-12 text-center">
            <p className="text-slate-400 mb-6">
              {sectionData?.cta_text ?? 'Ready to find the edge in the Canadian liquidity reset?'}
            </p>
            <a
              href={sectionData?.cta_link ?? '#waitlist'}
              className="inline-flex items-center gap-2 px-8 py-4 rounded-lg bg-gradient-to-r from-purple-500 to-indigo-500 text-white font-semibold hover:opacity-90 transition-opacity"
            >
              Get Early Access
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}
