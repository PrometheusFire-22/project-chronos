import { WaitlistForm } from '@/components/forms/WaitlistForm'
import { Sparkles, TrendingUp, Users } from 'lucide-react'

export function WaitlistSection() {
  return (
    <section id="waitlist" className="relative bg-slate-950 py-24 lg:py-32">
      {/* Background gradients */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-violet-500/10 blur-[120px] rounded-full mix-blend-screen opacity-30 pointer-events-none" />

      <div className="container mx-auto px-4 relative z-10">
        {/* Section Header */}
        <div className="text-center mb-12 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-400 text-sm font-medium mb-6">
            <Sparkles className="w-4 h-4" />
            Early Access
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4">
            Join the Waitlist
          </h2>
          <p className="text-lg text-slate-400">
            Be among the first to experience the future of private market intelligence. Early access users get exclusive benefits and priority onboarding.
          </p>
        </div>

        {/* Grid Layout: Form + Benefits */}
        <div className="grid lg:grid-cols-2 gap-12 max-w-6xl mx-auto items-start">
          {/* Left: Form */}
          <div className="order-2 lg:order-1">
            <WaitlistForm />
          </div>

          {/* Right: Benefits */}
          <div className="order-1 lg:order-2 space-y-6">
            <h3 className="text-2xl font-bold text-white mb-6">
              What You&apos;ll Get
            </h3>

            <div className="space-y-6">
              {/* Benefit 1 */}
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-violet-500/10 flex items-center justify-center">
                  <Sparkles className="w-6 h-6 text-violet-400" />
                </div>
                <div>
                  <h4 className="text-lg font-semibold text-white mb-2">
                    Early Access
                  </h4>
                  <p className="text-slate-400">
                    Be the first to explore Chronos before the public launch. Get hands-on with cutting-edge multi-modal intelligence tools.
                  </p>
                </div>
              </div>

              {/* Benefit 2 */}
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-sky-500/10 flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-sky-400" />
                </div>
                <div>
                  <h4 className="text-lg font-semibold text-white mb-2">
                    Exclusive Benefits
                  </h4>
                  <p className="text-slate-400">
                    Early adopters receive special pricing, extended trial periods, and white-glove onboarding support.
                  </p>
                </div>
              </div>

              {/* Benefit 3 */}
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                  <Users className="w-6 h-6 text-emerald-400" />
                </div>
                <div>
                  <h4 className="text-lg font-semibold text-white mb-2">
                    Shape the Product
                  </h4>
                  <p className="text-slate-400">
                    Your feedback will directly influence our roadmap. Help us build the platform that perfectly fits your needs.
                  </p>
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="mt-12 pt-8 border-t border-slate-800/50 grid grid-cols-3 gap-6">
              <div>
                <div className="text-2xl font-bold text-white mb-1">500+</div>
                <div className="text-sm text-slate-500">On Waitlist</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-white mb-1">50+</div>
                <div className="text-sm text-slate-500">Firms</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-white mb-1">Q1 2025</div>
                <div className="text-sm text-slate-500">Launch</div>
              </div>
            </div>
          </div>
        </div>

        {/* Trust Badges */}
        <div className="mt-16 pt-12 border-t border-slate-800/50">
          <p className="text-center text-sm text-slate-500 mb-6">
            Trusted by investors at leading firms
          </p>
          <div className="flex flex-wrap justify-center gap-8 opacity-40">
            {/* Placeholder for firm logos - will be replaced with actual logos later */}
            <div className="text-slate-600 font-semibold text-sm">Venture Capital</div>
            <div className="text-slate-600 font-semibold text-sm">Private Equity</div>
            <div className="text-slate-600 font-semibold text-sm">Family Offices</div>
            <div className="text-slate-600 font-semibold text-sm">Hedge Funds</div>
          </div>
        </div>
      </div>
    </section>
  )
}
