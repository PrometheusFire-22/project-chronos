import { Heart, Users, Target } from 'lucide-react'

export function AboutHero() {
  return (
    <section className="relative overflow-hidden bg-slate-950 pt-32 pb-24 lg:pt-40 lg:pb-32">
      {/* Background Gradients */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[500px] bg-emerald-500/20 blur-[120px] rounded-full mix-blend-screen opacity-30 pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-violet-500/20 blur-[120px] rounded-full mix-blend-screen opacity-20 pointer-events-none" />

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-900 border border-slate-800 text-slate-300 text-sm font-medium mb-6">
            <Heart className="w-4 h-4" />
            About Chronos
          </div>

          {/* Headline */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6 leading-[1.1]">
            Building the Future of{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-sky-400 to-violet-400">
              Private Market Intelligence
            </span>
          </h1>

          {/* Subheadline */}
          <p className="text-xl text-slate-400 mb-12 max-w-3xl mx-auto leading-relaxed">
            We're on a mission to democratize access to relationship intelligence,
            empowering investors with the insights they need to make better decisions.
          </p>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16">
            <div className="p-6 rounded-xl bg-slate-900/50 border border-slate-800">
              <div className="text-3xl font-bold text-white mb-2">2024</div>
              <div className="text-slate-400">Founded</div>
            </div>
            <div className="p-6 rounded-xl bg-slate-900/50 border border-slate-800">
              <div className="text-3xl font-bold text-white mb-2">50+</div>
              <div className="text-slate-400">Partner Firms</div>
            </div>
            <div className="p-6 rounded-xl bg-slate-900/50 border border-slate-800">
              <div className="text-3xl font-bold text-white mb-2">4</div>
              <div className="text-slate-400">Database Modalities</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
