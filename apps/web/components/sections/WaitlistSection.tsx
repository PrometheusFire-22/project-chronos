import { WaitlistForm } from '@/components/forms/WaitlistForm'
import { Sparkles, TrendingUp, Users } from 'lucide-react'

export function WaitlistSection() {
  return (
    <section id="waitlist" className="relative bg-background py-24 lg:py-32 border-t border-border">
      {/* Background gradients */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-violet-500/10 blur-[120px] rounded-full mix-blend-screen opacity-30 pointer-events-none" />

      <div className="container mx-auto px-4 relative z-10">
        {/* Section Header */}
        <div className="text-center mb-12 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-500 text-sm font-medium mb-6">
            <Sparkles className="w-4 h-4" />
            Early Access
          </div>
          <h2 className="heading-section text-foreground mb-4">
            Join the Waitlist
          </h2>
          <p className="text-body-lg">
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
            <h3 className="heading-card text-foreground mb-6">
              What You&apos;ll Get
            </h3>

            <div className="space-y-6">
              {/* Benefit 1 */}
              <div className="flex gap-4">
                <div className="flex-shrink-0 icon-container bg-amber-500/10">
                  <Sparkles className="icon-md text-amber-500" />
                </div>
                <div>
                  <h4 className="text-lg font-semibold text-foreground mb-2">
                    Early Access
                  </h4>
                  <p className="text-muted-foreground">
                    Be the first to explore Chronos before the public launch. Get hands-on with cutting-edge multi-modal intelligence tools.
                  </p>
                </div>
              </div>

              {/* Benefit 2 */}
              <div className="flex gap-4">
                <div className="flex-shrink-0 icon-container bg-emerald-500/10">
                  <TrendingUp className="icon-md text-emerald-500" />
                </div>
                <div>
                  <h4 className="text-lg font-semibold text-foreground mb-2">
                    Exclusive Benefits
                  </h4>
                  <p className="text-muted-foreground">
                    Early adopters receive special pricing, extended trial periods, and white-glove onboarding support.
                  </p>
                </div>
              </div>

              {/* Benefit 3 */}
              <div className="flex gap-4">
                <div className="flex-shrink-0 icon-container bg-blue-500/10">
                  <Users className="icon-md text-blue-500" />
                </div>
                <div>
                  <h4 className="text-lg font-semibold text-foreground mb-2">
                    Shape the Product
                  </h4>
                  <p className="text-muted-foreground">
                    Your feedback will directly influence our roadmap. Help us build the platform that perfectly fits your needs.
                  </p>
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="mt-12 pt-8 border-t border-border grid grid-cols-3 gap-6">
              <div>
                <div className="text-2xl font-bold text-foreground mb-1">500+</div>
                <div className="text-sm text-muted-foreground">On Waitlist</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-foreground mb-1">50+</div>
                <div className="text-sm text-muted-foreground">Firms</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-foreground mb-1">Q1 2025</div>
                <div className="text-sm text-muted-foreground">Launch</div>
              </div>
            </div>
          </div>
        </div>

        {/* Trust Badges */}
        <div className="mt-16 pt-12 border-t border-border">
          <p className="text-center text-sm text-muted-foreground mb-6">
            Trusted by investors at leading firms
          </p>
          <div className="flex flex-wrap justify-center gap-8 opacity-40 grayscale hover:grayscale-0 transition-all duration-300">
            {/* Placeholder for firm logos - will be replaced with actual logos later */}
            <div className="text-foreground font-semibold text-sm">Venture Capital</div>
            <div className="text-foreground font-semibold text-sm">Private Equity</div>
            <div className="text-foreground font-semibold text-sm">Family Offices</div>
            <div className="text-foreground font-semibold text-sm">Hedge Funds</div>
          </div>
        </div>
      </div>
    </section>
  )
}
