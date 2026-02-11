import { Heart, Users, Target } from 'lucide-react'
import type { AboutHero as AboutHeroType } from '@/lib/directus/types'

interface AboutHeroProps {
  hero?: AboutHeroType | null
}

export function AboutHero({ hero }: AboutHeroProps) {
  // Fallback values if CMS data is unavailable
  const headline = hero?.headline || 'Born in the Liquidity Reset'
  const subheadline = hero?.subheadline || 'Chronos was built in Toronto during the most dramatic private market reset since 2008. We saw opportunity where others saw chaos.'

  return (
    <section className="relative overflow-hidden bg-background pt-32 pb-24 lg:pt-40 lg:pb-32">
      {/* Background Gradients */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[500px] bg-purple-500/20 blur-[120px] rounded-full mix-blend-screen opacity-30 pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-indigo-500/20 blur-[120px] rounded-full mix-blend-screen opacity-20 pointer-events-none" />

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-muted border border-border text-muted-foreground text-sm font-medium mb-6">
            <Heart className="w-4 h-4" />
            About Chronos
          </div>

          {/* Headline - from Directus */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 leading-[1.1]">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-foreground via-purple-500 to-indigo-500">
              {headline}
            </span>
          </h1>

          {/* Subheadline - from Directus */}
          <p className="text-xl text-muted-foreground mb-12 max-w-3xl mx-auto leading-relaxed">
            {subheadline}
          </p>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16">
            <div className="p-6 rounded-xl bg-card border border-border">
              <div className="text-3xl font-bold text-foreground mb-2">2024</div>
              <div className="text-muted-foreground">Founded</div>
            </div>
            <div className="p-6 rounded-xl bg-card border border-border">
              <div className="text-3xl font-bold text-foreground mb-2">50+</div>
              <div className="text-muted-foreground">Partner Firms</div>
            </div>
            <div className="p-6 rounded-xl bg-card border border-border">
              <div className="text-3xl font-bold text-foreground mb-2">4</div>
              <div className="text-muted-foreground">Database Modalities</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
