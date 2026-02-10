import { Database, Network, TrendingUp, Globe } from 'lucide-react'
import type { FeaturesHero as FeaturesHeroType } from '@/lib/directus/types'

interface FeaturesHeroProps {
  hero?: FeaturesHeroType | null
}

export function FeaturesHero({ hero }: FeaturesHeroProps) {
  // Fallback values if CMS data is unavailable
  const headline = hero?.headline || 'Enterprise-Grade Intelligence Platform'
  const subheadline = hero?.subheadline || 'Unified graph, vector, geospatial, and time-series capabilities built for special situations investors navigating the Canadian liquidity reset.'

  return (
    <section className="relative overflow-hidden bg-slate-950 pt-32 pb-24 lg:pt-40 lg:pb-32">
      {/* Background Gradients */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[500px] bg-purple-500/20 blur-[120px] rounded-full mix-blend-screen opacity-30 pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-indigo-500/20 blur-[120px] rounded-full mix-blend-screen opacity-20 pointer-events-none" />

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-900 border border-slate-800 text-slate-300 text-sm font-medium mb-6">
            <Database className="w-4 h-4" />
            Platform Features
          </div>

          {/* Headline - from Directus */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6 leading-[1.1]">
            {headline}
          </h1>

          {/* Subheadline - from Directus */}
          <p className="text-xl text-slate-400 mb-12 max-w-3xl mx-auto leading-relaxed">
            {subheadline}
          </p>

          {/* Four Pillars Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-16">
            <div className="p-6 rounded-xl bg-gradient-to-br from-purple-500/10 to-transparent border border-purple-500/20">
              <Network className="w-8 h-8 text-purple-400 mx-auto mb-3" />
              <div className="text-sm font-semibold text-white">Graph Database</div>
            </div>
            <div className="p-6 rounded-xl bg-gradient-to-br from-indigo-500/10 to-transparent border border-indigo-500/20">
              <Database className="w-8 h-8 text-indigo-400 mx-auto mb-3" />
              <div className="text-sm font-semibold text-white">Vector Search</div>
            </div>
            <div className="p-6 rounded-xl bg-gradient-to-br from-pink-500/10 to-transparent border border-pink-500/20">
              <TrendingUp className="w-8 h-8 text-pink-400 mx-auto mb-3" />
              <div className="text-sm font-semibold text-white">Time-Series</div>
            </div>
            <div className="p-6 rounded-xl bg-gradient-to-br from-amber-500/10 to-transparent border border-amber-500/20">
              <Globe className="w-8 h-8 text-amber-400 mx-auto mb-3" />
              <div className="text-sm font-semibold text-white">Geospatial</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
