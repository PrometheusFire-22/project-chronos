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
    <section className="relative overflow-hidden bg-background pt-32 pb-24 lg:pt-40 lg:pb-32">
      {/* Background Gradients */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[500px] bg-purple-500/20 blur-[120px] rounded-full mix-blend-screen opacity-30 pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-indigo-500/20 blur-[120px] rounded-full mix-blend-screen opacity-20 pointer-events-none" />

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-muted border border-border text-muted-foreground text-sm font-medium mb-6">
            <Database className="w-4 h-4" />
            Platform Features
          </div>

          {/* Headline - from Directus */}
          <h1 className="heading-hero mb-6">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-foreground via-purple-500 to-indigo-500">
              {headline}
            </span>
          </h1>

          {/* Subheadline - from Directus */}
          <p className="text-body-lg mb-12 max-w-3xl mx-auto">
            {subheadline}
          </p>

          {/* Four Pillars Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-6 rounded-xl bg-purple-500/5 border border-purple-500/20">
              <Network className="w-8 h-8 text-purple-500 mx-auto mb-3" />
              <div className="text-sm font-semibold text-foreground">Graph Database</div>
            </div>
            <div className="p-6 rounded-xl bg-indigo-500/5 border border-indigo-500/20">
              <Database className="w-8 h-8 text-indigo-500 mx-auto mb-3" />
              <div className="text-sm font-semibold text-foreground">Vector Search</div>
            </div>
            <div className="p-6 rounded-xl bg-amber-500/5 border border-amber-500/20">
              <TrendingUp className="w-8 h-8 text-amber-500 mx-auto mb-3" />
              <div className="text-sm font-semibold text-foreground">Time-Series</div>
            </div>
            <div className="p-6 rounded-xl bg-emerald-500/5 border border-emerald-500/20">
              <Globe className="w-8 h-8 text-emerald-500 mx-auto mb-3" />
              <div className="text-sm font-semibold text-foreground">Geospatial</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
