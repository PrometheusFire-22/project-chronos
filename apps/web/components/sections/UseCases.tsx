import {
  Building2,
  Briefcase,
  Users,
  TrendingUp,
  Search,
  Target,
  Lightbulb,
  LineChart,
  Network,
  Globe,
  Workflow,
  Share2,
  Map,
  type LucideIcon
} from 'lucide-react'
import type { HomepageUseCase, PageSection } from '@/lib/directus/types'
import { renderRichText } from '@/lib/content-renderer'

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
  'network': Network,
  'globe': Globe,
  'sitemap': Workflow,
  'share-2': Share2,
  'map': Map,
}

interface UseCasesProps {
  useCases: HomepageUseCase[]
  sectionData?: PageSection | null
}

export function UseCases({ useCases, sectionData }: UseCasesProps) {
  // Fallback values if CMS data is not available
  const headline = sectionData?.headline ?? 'Trusted by Leading Investors'
  const subheadline = sectionData?.subheadline ??
    'From venture capital to private equity, discover how top firms use Chronos to gain a competitive edge'

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

        {/* Use Cases Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto">
          {useCases.map((useCase, index) => {
            const IconComponent: LucideIcon = (useCase.icon && useCase.icon in iconMap) ? iconMap[useCase.icon] : Briefcase
            const isEven = index % 2 === 0

            return (
              <div
                key={useCase.id}
                className={`group relative p-8 rounded-2xl border transition-all duration-300 ${isEven
                  ? 'bg-gradient-to-br from-purple-500/5 to-transparent border-purple-500/20 hover:border-purple-500/40'
                  : 'bg-gradient-to-br from-indigo-500/5 to-transparent border-indigo-500/20 hover:border-indigo-500/40'
                  } hover:shadow-xl`}
              >
                {/* Icon */}
                <div
                  className={`mb-6 w-12 h-12 rounded-xl flex items-center justify-center ${isEven
                    ? 'bg-purple-500/10 text-purple-400'
                    : 'bg-indigo-500/10 text-indigo-400'
                    }`}
                >
                  <IconComponent className="w-6 h-6" />
                </div>

                {/* Title */}
                <h3 className="text-xl font-semibold text-foreground mb-3">
                  {useCase.title}
                </h3>

                {/* Description */}
                <div
                  className="prose dark:prose-invert prose-slate max-w-none"
                  dangerouslySetInnerHTML={{ __html: renderRichText(useCase.description) }}
                />

                {/* Decorative gradient line */}
                <div
                  className={`absolute bottom-0 left-0 w-full h-0.5 rounded-b-2xl scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left ${isEven
                    ? 'bg-gradient-to-r from-purple-500 to-transparent'
                    : 'bg-gradient-to-r from-indigo-500 to-transparent'
                    }`}
                />
              </div>
            )
          })}
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-16 pt-12 border-t border-slate-800/50">
          <h3 className="text-2xl font-bold text-foreground mb-4">
            {sectionData?.cta_text ?? 'Ready to find the edge in the Canadian liquidity reset?'}
          </h3>
          <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
            Join the waitlist to get early access to Chronos and discover hidden opportunities in special situations
          </p>
          <a
            href={sectionData?.cta_link ?? '#waitlist'}
            className="inline-flex items-center gap-2 px-8 py-4 rounded-lg bg-gradient-to-r from-purple-500 to-indigo-500 text-white font-semibold hover:opacity-90 transition-opacity shadow-lg shadow-purple-500/25"
          >
            {sectionData?.cta_link ? 'Get Early Access' : 'Join the Waitlist'}
            <Target className="w-5 h-5" />
          </a>
        </div>
      </div>
    </section>
  )
}
