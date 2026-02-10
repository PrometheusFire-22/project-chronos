import { Linkedin, Github, Mail } from 'lucide-react'

export function AboutTeam() {
  return (
    <section className="relative bg-slate-900 py-24 lg:py-32">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-16 max-w-3xl mx-auto">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4">
            Meet the Team
          </h2>
          <p className="text-lg text-slate-400">
            We&apos;re a passionate team of engineers, designers, and domain experts building the future of private market intelligence
          </p>
        </div>

        {/* Team Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {/* Team Member 1 - Placeholder */}
          <div className="group p-6 rounded-2xl bg-slate-950 border border-slate-800 hover:border-slate-700 transition-all duration-300">
            {/* Avatar Placeholder */}
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-purple-500/20 to-indigo-500/20 mb-4 mx-auto flex items-center justify-center">
              <div className="text-3xl font-bold text-purple-400">A</div>
            </div>

            {/* Name & Role */}
            <div className="text-center mb-4">
              <h3 className="text-xl font-bold text-white mb-1">Founding Team</h3>
              <p className="text-slate-400">Engineering & Product</p>
            </div>

            {/* Bio */}
            <p className="text-sm text-slate-500 text-center mb-4">
              Building next-generation intelligence tools for private markets
            </p>

            {/* Social Links */}
            <div className="flex justify-center gap-3">
              <a
                href="#"
                className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-400 hover:text-white transition-colors"
              >
                <Linkedin className="w-4 h-4" />
              </a>
              <a
                href="#"
                className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-400 hover:text-white transition-colors"
              >
                <Github className="w-4 h-4" />
              </a>
              <a
                href="mailto:team@chronos.ai"
                className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-400 hover:text-white transition-colors"
              >
                <Mail className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>

        {/* Join Team CTA */}
        <div className="mt-20 text-center">
          <div className="inline-block p-8 rounded-2xl bg-gradient-to-br from-purple-500/10 to-indigo-500/10 border border-purple-500/20 max-w-2xl">
            <h3 className="text-2xl font-bold text-white mb-4">
              Join Our Team
            </h3>
            <p className="text-slate-400 mb-6">
              We&apos;re always looking for talented individuals who are passionate about
              transforming private market intelligence. If you&apos;re excited about building
              the future with us, we&apos;d love to hear from you.
            </p>
            <a
              href="mailto:careers@chronos.ai"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-gradient-to-r from-purple-500 to-indigo-500 text-white font-semibold hover:opacity-90 transition-opacity"
            >
              <Mail className="w-5 h-5" />
              Get in Touch
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}
