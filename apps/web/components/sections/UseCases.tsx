import {
  Building2,
  Briefcase,
  Users,
  TrendingUp,
  Search,
  Target,
  Lightbulb,
  LineChart,
  type LucideIcon
} from 'lucide-react'
import type { Feature } from '@/lib/directus'

// Icon mapping for use case icons
const iconMap: Record<string, LucideIcon> = {
  'building-2': Building2,
  'briefcase': Briefcase,
  'users': Users,
  'trending-up': TrendingUp,
  'search': Search,
  'target': Target,
  'lightbulb': Lightbulb,
  'line-chart': LineChart,
}

interface UseCasesProps {
  useCases: Feature[]
}

export function UseCases({ useCases }: UseCasesProps) {
  return (
    <section className="relative bg-slate-950 py-24 lg:py-32">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-16 max-w-3xl mx-auto">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4">
            Trusted by Leading Investors
          </h2>
          <p className="text-lg text-slate-400">
            From venture capital to private equity, discover how top firms use Chronos to gain a competitive edge
          </p>
        </div>

        {/* Use Cases Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto">
          {useCases.map((useCase, index) => {
            const IconComponent: LucideIcon = (useCase.icon && useCase.icon in iconMap) ? iconMap[useCase.icon] : Briefcase
            const isEven = index % 2 === 0

            return (
              <div
                key={useCase.id}
                className={`group relative p-8 rounded-2xl border transition-all duration-300 ${
                  isEven
                    ? 'bg-gradient-to-br from-violet-500/5 to-transparent border-violet-500/20 hover:border-violet-500/40'
                    : 'bg-gradient-to-br from-sky-500/5 to-transparent border-sky-500/20 hover:border-sky-500/40'
                } hover:shadow-xl`}
              >
                {/* Icon */}
                <div
                  className={`mb-6 w-12 h-12 rounded-xl flex items-center justify-center ${
                    isEven
                      ? 'bg-violet-500/10 text-violet-400'
                      : 'bg-sky-500/10 text-sky-400'
                  }`}
                >
                  <IconComponent className="w-6 h-6" />
                </div>

                {/* Title */}
                <h3 className="text-xl font-semibold text-white mb-3">
                  {useCase.title}
                </h3>

                {/* Description */}
                <p className="text-slate-400 leading-relaxed">
                  {useCase.description}
                </p>

                {/* Decorative gradient line */}
                <div
                  className={`absolute bottom-0 left-0 w-full h-0.5 rounded-b-2xl scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left ${
                    isEven
                      ? 'bg-gradient-to-r from-violet-500 to-transparent'
                      : 'bg-gradient-to-r from-sky-500 to-transparent'
                  }`}
                />
              </div>
            )
          })}
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-16 pt-12 border-t border-slate-800/50">
          <h3 className="text-2xl font-bold text-white mb-4">
            Ready to transform your investment strategy?
          </h3>
          <p className="text-slate-400 mb-6 max-w-2xl mx-auto">
            Join the waitlist to get early access to Chronos and discover hidden opportunities in private markets
          </p>
          <a
            href="#waitlist"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-lg bg-gradient-to-r from-violet-500 to-sky-500 text-white font-semibold hover:opacity-90 transition-opacity shadow-lg shadow-violet-500/25"
          >
            Join the Waitlist
            <Target className="w-5 h-5" />
          </a>
        </div>
      </div>
    </section>
  )
}
