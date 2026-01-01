import {
  Heart,
  Shield,
  Zap,
  Users,
  Target,
  Sparkles,
  Award,
  Rocket,
  type LucideIcon
} from 'lucide-react'
import type { Feature } from '@/lib/directus'
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
  values: Feature[]
}

export function AboutValues({ values }: AboutValuesProps) {
  return (
    <section className="relative bg-slate-950 py-24 lg:py-32">
      {/* Background accent */}
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent" />

      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-16 max-w-3xl mx-auto">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4">
            Our Values
          </h2>
          <p className="text-lg text-slate-400">
            The principles that guide everything we do at Chronos
          </p>
        </div>

        {/* Values Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {values.map((value, index) => {
            const IconComponent: LucideIcon = (value.icon && value.icon in iconMap) ? iconMap[value.icon] : Heart

            // Cycle through accent colors
            const colorClasses = [
              { bg: 'bg-violet-500/10', icon: 'text-violet-400', border: 'border-violet-500/20' },
              { bg: 'bg-sky-500/10', icon: 'text-sky-400', border: 'border-sky-500/20' },
              { bg: 'bg-emerald-500/10', icon: 'text-emerald-400', border: 'border-emerald-500/20' },
            ]
            const colors = colorClasses[index % 3]

            return (
              <div
                key={value.id}
                className={`p-8 rounded-2xl bg-slate-900/50 border ${colors.border} hover:border-opacity-50 transition-all duration-300 group`}
              >
                {/* Icon */}
                <div className={`w-14 h-14 rounded-xl ${colors.bg} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                  <IconComponent className={`w-7 h-7 ${colors.icon}`} />
                </div>

                {/* Title */}
                <h3 className="text-xl font-bold text-white mb-3">
                  {value.title}
                </h3>

                {/* Description */}
                <div
                  className="text-slate-400 leading-relaxed [&>p]:mb-3 [&>strong]:font-semibold [&>strong]:text-white [&>h2]:text-xl [&>h2]:font-bold [&>h2]:text-white [&>h2]:mt-6 [&>h2]:mb-3 [&>h3]:text-lg [&>h3]:font-semibold [&>h3]:text-white [&>h3]:mt-4 [&>h3]:mb-2 [&>ul]:list-disc [&>ul]:ml-5 [&>ul]:text-slate-400 [&>ol]:list-decimal [&>ol]:ml-5 [&>ol]:text-slate-400"
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
