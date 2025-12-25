import { Lightbulb, TrendingUp, Target } from 'lucide-react'

export function AboutStory() {
  return (
    <section className="relative bg-slate-900 py-24 lg:py-32">
      <div className="container mx-auto px-4">
        {/* Main Story */}
        <div className="max-w-4xl mx-auto mb-20">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">
            Our Story
          </h2>
          <div className="space-y-6 text-lg text-slate-400 leading-relaxed">
            <p>
              Chronos was born from a simple observation: private market investors spend countless
              hours manually piecing together relationships, tracking down connections, and searching
              through fragmented data sources.
            </p>
            <p>
              We saw an opportunity to fundamentally change this. By combining four powerful database
              technologies—graph, vector, time-series, and geospatial—into a single unified platform,
              we enable investors to see the complete picture in seconds, not days.
            </p>
            <p>
              Today, we're building the most advanced relationship intelligence platform for private
              markets, trusted by leading venture capital firms, private equity investors, and family
              offices around the world.
            </p>
          </div>
        </div>

        {/* Mission, Vision, Values */}
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {/* Mission */}
          <div className="p-8 rounded-2xl bg-slate-950 border border-slate-800">
            <div className="w-12 h-12 rounded-xl bg-violet-500/10 flex items-center justify-center mb-6">
              <Target className="w-6 h-6 text-violet-400" />
            </div>
            <h3 className="text-xl font-bold text-white mb-4">Mission</h3>
            <p className="text-slate-400 leading-relaxed">
              Democratize access to relationship intelligence, empowering every investor to make
              data-driven decisions with confidence.
            </p>
          </div>

          {/* Vision */}
          <div className="p-8 rounded-2xl bg-slate-950 border border-slate-800">
            <div className="w-12 h-12 rounded-xl bg-sky-500/10 flex items-center justify-center mb-6">
              <Lightbulb className="w-6 h-6 text-sky-400" />
            </div>
            <h3 className="text-xl font-bold text-white mb-4">Vision</h3>
            <p className="text-slate-400 leading-relaxed">
              A world where hidden market connections are instantly discoverable, enabling smarter
              capital allocation and fostering innovation.
            </p>
          </div>

          {/* Approach */}
          <div className="p-8 rounded-2xl bg-slate-950 border border-slate-800">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center mb-6">
              <TrendingUp className="w-6 h-6 text-emerald-400" />
            </div>
            <h3 className="text-xl font-bold text-white mb-4">Approach</h3>
            <p className="text-slate-400 leading-relaxed">
              Combine cutting-edge technology with deep domain expertise to build products that
              investors love to use every day.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
