import { Check, X } from 'lucide-react'

export function FeatureComparison() {
  const features = [
    {
      category: 'Data Integration',
      chronos: 'Unified multi-modal platform',
      traditional: 'Multiple disconnected tools',
    },
    {
      category: 'Relationship Discovery',
      chronos: 'AI-powered graph analysis',
      traditional: 'Manual research and spreadsheets',
    },
    {
      category: 'Search Capabilities',
      chronos: 'Vector similarity + keyword search',
      traditional: 'Basic text search only',
    },
    {
      category: 'Time-Series Analysis',
      chronos: 'Built-in temporal queries',
      traditional: 'External analytics tools required',
    },
    {
      category: 'Geospatial Operations',
      chronos: 'Native location-based insights',
      traditional: 'Geographic data in silos',
    },
    {
      category: 'Query Performance',
      chronos: 'Sub-second complex queries',
      traditional: 'Minutes to hours for deep analysis',
    },
    {
      category: 'Data Freshness',
      chronos: 'Real-time updates',
      traditional: 'Batch processing delays',
    },
    {
      category: 'Deployment',
      chronos: 'Cloud-native SaaS',
      traditional: 'On-premise infrastructure',
    },
  ]

  return (
    <section className="relative bg-slate-950 py-24 lg:py-32">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-16 max-w-3xl mx-auto">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4">
            Why Choose Chronos?
          </h2>
          <p className="text-lg text-slate-400">
            See how Chronos compares to traditional private market research tools
          </p>
        </div>

        {/* Comparison Table */}
        <div className="max-w-5xl mx-auto">
          <div className="rounded-2xl border border-slate-800 overflow-hidden">
            {/* Table Header */}
            <div className="grid grid-cols-3 gap-4 bg-slate-900 p-6 border-b border-slate-800">
              <div className="text-slate-500 text-sm font-medium">Feature</div>
              <div className="text-center">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-violet-500/20 to-sky-500/20 border border-violet-500/30">
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
                    <span className="text-slate-300 text-sm">{feature.chronos}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <X className="w-5 h-5 text-red-400 flex-shrink-0" />
                    <span className="text-slate-500 text-sm">{feature.traditional}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Bottom CTA */}
          <div className="mt-12 text-center">
            <p className="text-slate-400 mb-6">
              Ready to experience the future of private market intelligence?
            </p>
            <a
              href="#waitlist"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-lg bg-gradient-to-r from-violet-500 to-sky-500 text-white font-semibold hover:opacity-90 transition-opacity"
            >
              Get Early Access
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}
