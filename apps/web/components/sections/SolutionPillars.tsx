import {
  Network,
  Database,
  TrendingUp,
  Globe,
  Zap,
  Activity,
  BarChart3,
  Map,
  GitGraph,
  Box,
  MapPin,
  type LucideIcon
} from 'lucide-react'
import type { HomepagePillar, PageSection } from '@/lib/directus/types'
import { renderRichText } from '@/lib/content-renderer'

// Icon mapping for solution pillar icons
const iconMap: Record<string, LucideIcon> = {
  'network': Network,
  'database': Database,
  'trending-up': TrendingUp,
  'globe': Globe,
  'zap': Zap,
  'activity': Activity,
  'bar-chart-3': BarChart3,
  'map': Map,
  'git-graph': GitGraph,
  'box': Box,
  'map-pin': MapPin,
}

// Color mapping logic
const getPillarColors = (title: string, index: number) => {
  const lowerTitle = title.toLowerCase()

  if (lowerTitle.includes('global') || lowerTitle.includes('vision')) {
    return {
      bg: 'bg-blue-500/10',
      icon: 'text-blue-500',
      border: 'border-blue-500/20',
      glow: 'group-hover:shadow-blue-500/20'
    }
  }
  if (lowerTitle.includes('deep') || lowerTitle.includes('analysis')) {
    return {
      bg: 'bg-purple-500/10',
      icon: 'text-purple-500',
      border: 'border-purple-500/20',
      glow: 'group-hover:shadow-purple-500/20'
    }
  }
  if (lowerTitle.includes('strategic') || lowerTitle.includes('execution')) {
    return {
      bg: 'bg-rose-500/10', // Red/Pink -> Rose
      icon: 'text-rose-500',
      border: 'border-rose-500/20',
      glow: 'group-hover:shadow-rose-500/20'
    }
  }

  // Fallback / default mapping for others
  const defaults = [
    {
      bg: 'bg-purple-500/10',
      icon: 'text-purple-400',
      border: 'border-purple-500/20',
      glow: 'group-hover:shadow-purple-500/20'
    },
    {
       bg: 'bg-indigo-500/10',
      icon: 'text-indigo-400',
      border: 'border-indigo-500/20',
      glow: 'group-hover:shadow-indigo-500/20'
    },
    {
       bg: 'bg-pink-500/10',
      icon: 'text-pink-400',
      border: 'border-pink-500/20',
      glow: 'group-hover:shadow-pink-500/20'
    },
    {
       bg: 'bg-amber-500/10',
      icon: 'text-amber-400',
      border: 'border-amber-500/20',
      glow: 'group-hover:shadow-amber-500/20'
    }
  ]

  return defaults[index % defaults.length]
}

interface SolutionPillarsProps {
  pillars: HomepagePillar[]
  sectionData?: PageSection | null
}

export function SolutionPillars({ pillars, sectionData }: SolutionPillarsProps) {
  // Fallback values if CMS data is not available
  const headline = sectionData?.headline ?? 'Multi-Model Intelligence'
  const subheadline = sectionData?.subheadline ??
    'Four powerful database modalities working in harmony to deliver unprecedented insights'

  return (
    <section className="relative bg-background py-24 lg:py-32">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-16 max-w-3xl mx-auto">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-4">
            {headline}
          </h2>
          <p className="text-lg text-muted-foreground">
            {subheadline}
          </p>
        </div>

        {/* Pillars Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
          {pillars.map((pillar, index) => {
            const IconComponent: LucideIcon = (pillar.icon && pillar.icon in iconMap) ? iconMap[pillar.icon] : Database
            const colors = getPillarColors(pillar.title, index)

            return (
              <div
                key={pillar.id}
                className={`group relative p-8 rounded-2xl bg-card border ${colors.border} hover:border-opacity-50 transition-all duration-300 ${colors.glow} hover:shadow-2xl`}
              >
                {/* Icon */}
                <div className={`mb-6 w-14 h-14 rounded-xl ${colors.bg} flex items-center justify-center`}>
                  <IconComponent className={`w-7 h-7 ${colors.icon}`} />
                </div>

                {/* Title */}
                <h3 className="text-xl font-semibold text-foreground mb-3">
                  {pillar.title}
                </h3>

                {/* Description */}
                <div
                  className="prose dark:prose-invert prose-slate max-w-none prose-sm"
                  dangerouslySetInnerHTML={{ __html: renderRichText(pillar.description) }}
                />

                {/* Decorative corner accent */}
                <div className={`absolute top-4 right-4 w-2 h-2 rounded-full ${colors.bg} ${colors.icon} opacity-60`} />
              </div>
            )
          })}
        </div>

        {/* Bottom tagline */}
        <div className="text-center mt-12">
          <p className="text-sm text-muted-foreground max-w-2xl mx-auto">
            {sectionData?.cta_text ?? 'Unifying public market ruins with private deal flow through one intelligence layer.'}
          </p>
        </div>
      </div>
    </section>
  )
}
