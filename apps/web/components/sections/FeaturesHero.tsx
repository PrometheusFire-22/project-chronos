import { Database, Network, TrendingUp, Globe } from 'lucide-react'

export function FeaturesHero() {
  return (
    <section className="relative overflow-hidden bg-slate-950 pt-32 pb-24 lg:pt-40 lg:pb-32">
      {/* Background Gradients */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[500px] bg-violet-500/20 blur-[120px] rounded-full mix-blend-screen opacity-30 pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-sky-500/20 blur-[120px] rounded-full mix-blend-screen opacity-20 pointer-events-none" />

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-900 border border-slate-800 text-slate-300 text-sm font-medium mb-6">
            <Database className="w-4 h-4" />
            Platform Features
          </div>

          {/* Headline */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6 leading-[1.1]">
            The Most Advanced{' '}
            <span className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-violet-300 via-sky-300 to-emerald-300">
              Multi-Model Platform
            </span>{' '}
            for Private Markets
          </h1>

          {/* Subheadline */}
          <p className="text-xl text-slate-400 mb-12 max-w-3xl mx-auto leading-relaxed">
            Chronos combines four powerful database technologies into a single unified platform,
            giving you unprecedented insights into private market relationships and opportunities.
          </p>

          {/* Four Pillars Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-16">
            <div className="p-6 rounded-xl bg-gradient-to-br from-violet-500/10 to-transparent border border-violet-500/20">
              <Network className="w-8 h-8 text-violet-400 mx-auto mb-3" />
              <div className="text-sm font-semibold text-white">Graph Database</div>
            </div>
            <div className="p-6 rounded-xl bg-gradient-to-br from-sky-500/10 to-transparent border border-sky-500/20">
              <Database className="w-8 h-8 text-sky-400 mx-auto mb-3" />
              <div className="text-sm font-semibold text-white">Vector Search</div>
            </div>
            <div className="p-6 rounded-xl bg-gradient-to-br from-emerald-500/10 to-transparent border border-emerald-500/20">
              <TrendingUp className="w-8 h-8 text-emerald-400 mx-auto mb-3" />
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
