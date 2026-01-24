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

// Color mapping for pillar accent colors
const colorMap: Record<number, { bg: string; icon: string; border: string; glow: string }> = {
  0: {
    bg: 'bg-violet-500/10',
    icon: 'text-violet-400',
    border: 'border-violet-500/20',
    glow: 'group-hover:shadow-violet-500/20'
  },
  1: {
    bg: 'bg-sky-500/10',
    icon: 'text-sky-400',
    border: 'border-sky-500/20',
    glow: 'group-hover:shadow-sky-500/20'
  },
  2: {
    bg: 'bg-emerald-500/10',
    icon: 'text-emerald-400',
    border: 'border-emerald-500/20',
    glow: 'group-hover:shadow-emerald-500/20'
  },
  3: {
    bg: 'bg-amber-500/10',
    icon: 'text-amber-400',
    border: 'border-amber-500/20',
    glow: 'group-hover:shadow-amber-500/20'
  },
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
    <section className="relative bg-slate-950 py-24 lg:py-32">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-16 max-w-3xl mx-auto">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4">
            {headline}
          </h2>
          <p className="text-lg text-slate-400">
            {subheadline}
          </p>
        </div>

        {/* Pillars Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
          {pillars.map((pillar, index) => {
            const IconComponent: LucideIcon = (pillar.icon && pillar.icon in iconMap) ? iconMap[pillar.icon] : Database
            const colors = colorMap[index % 4]

            return (
              <div
                key={pillar.id}
                className={`group relative p-8 rounded-2xl bg-slate-900/50 border ${colors.border} hover:border-opacity-50 transition-all duration-300 ${colors.glow} hover:shadow-2xl`}
              >
                {/* Icon */}
                <div className={`mb-6 w-14 h-14 rounded-xl ${colors.bg} flex items-center justify-center`}>
                  <IconComponent className={`w-7 h-7 ${colors.icon}`} />
                </div>

                {/* Title */}
                <h3 className="text-xl font-semibold text-white mb-3">
                  {pillar.title}
                </h3>

                {/* Description */}
                <div
                  className="prose prose-invert max-w-none prose-sm"
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
          <p className="text-sm text-slate-500 max-w-2xl mx-auto">
            {sectionData?.cta_text ?? 'Unifying public market ruins with private deal flow through one intelligence layer.'}
          </p>
        </div>
      </div>
    </section>
  )
}
