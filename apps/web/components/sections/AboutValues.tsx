import {
  Heart,
  Shield,
  Zap,
  Users,
  Target,
  Sparkles,
  Award,
  Rocket,
  Split,
  Microscope,
  UtilityPole,
  type LucideIcon
} from 'lucide-react'
import type { AboutValue } from '@/lib/directus/types'
import { renderRichText } from '@/lib/content-renderer'

// Icon mapping for value icons
const iconMap: Record<string, LucideIcon> = {
  'heart': Heart,
  'shield': Shield,
  'zap': Zap,
  'users': Users,
  'target': Target,
  'sparkles': Sparkles,
  'award': Award,
  'rocket': Rocket,
}

interface AboutValuesProps {
  values: AboutValue[]
}

export function AboutValues({ values }: AboutValuesProps) {
  return (
    <section className="relative bg-background py-24 lg:py-32">
      {/* Background accent */}
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-purple-500/50 to-transparent" />

      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-16 max-w-3xl mx-auto">
          <h2 className="heading-section text-foreground mb-4">
            Our Values
          </h2>
          <p className="text-body-lg">
            The principles that guide everything we do at Chronos
          </p>
        </div>

        {/* Values Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {values.map((value, index) => {
            let IconComponent: LucideIcon = (value.icon && value.icon in iconMap) ? iconMap[value.icon] : Heart

            // Title-based icon/color overrides
            const lowerTitle = value.title.toLowerCase()
            let overrideColors: { bg: string; icon: string; border: string } | null = null

            if (lowerTitle.includes('friction') && lowerTitle.includes('fragmented')) {
              IconComponent = Split
              overrideColors = { bg: 'bg-rose-500/10', icon: 'text-rose-600 dark:text-rose-400', border: 'border-rose-500/20' }
            } else if (lowerTitle.includes('structural') && lowerTitle.includes('clarity')) {
              IconComponent = Microscope
              overrideColors = { bg: 'bg-blue-500/10', icon: 'text-blue-600 dark:text-blue-400', border: 'border-blue-500/20' }
            } else if (lowerTitle.includes('institutional') && lowerTitle.includes('infrastructure')) {
              IconComponent = UtilityPole
              overrideColors = { bg: 'bg-yellow-500/10', icon: 'text-yellow-600 dark:text-yellow-400', border: 'border-yellow-500/20' }
            }

            // Cycle through accent colors (fallback)
            const colorClasses = [
              { bg: 'bg-purple-500/10', icon: 'text-purple-600 dark:text-purple-400', border: 'border-purple-500/20' },
              { bg: 'bg-indigo-500/10', icon: 'text-indigo-600 dark:text-indigo-400', border: 'border-indigo-500/20' },
              { bg: 'bg-pink-500/10', icon: 'text-pink-600 dark:text-pink-400', border: 'border-pink-500/20' },
            ]
            const colors = overrideColors ?? colorClasses[index % 3]

            return (
              <div
                key={value.id}
                className={`p-8 rounded-2xl bg-card border ${colors.border} hover:border-opacity-50 transition-all duration-300 group`}
              >
                {/* Icon */}
                <div className={`w-14 h-14 rounded-xl ${colors.bg} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                  <IconComponent className={`w-7 h-7 ${colors.icon}`} />
                </div>

                {/* Title */}
                <h3 className="text-xl font-bold text-foreground mb-3">
                  {value.title}
                </h3>

                {/* Description */}
                <div
                  className="prose dark:prose-invert prose-slate max-w-none"
                  dangerouslySetInnerHTML={{ __html: renderRichText(value.description) }}
                />
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
