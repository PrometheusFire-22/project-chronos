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

            // Color mapping logic based on title
            const getUseCaseColors = (title: string, index: number) => {
              const lowerTitle = title.toLowerCase()

              if (lowerTitle.includes('referral')) { // Distressed Referral Pathfinding
                return {
                  bg: 'bg-indigo-500/10',
                  text: 'text-indigo-400',
                  border: 'border-indigo-500/20 hover:border-indigo-500/40',
                  gradient: 'from-indigo-500/5',
                  line: 'from-indigo-500'
                }
              }
              if (lowerTitle.includes('forced seller')) { // Forced Seller Discovery
                 return {
                  bg: 'bg-purple-500/10',
                  text: 'text-purple-400',
                  border: 'border-purple-500/20 hover:border-purple-500/40',
                  gradient: 'from-purple-500/5',
                  line: 'from-purple-500'
                }
              }
               if (lowerTitle.includes('contagion')) { // Regional Contagion Mapping
                 return {
                  bg: 'bg-emerald-500/10',
                  text: 'text-emerald-500', // Green
                  border: 'border-emerald-500/20 hover:border-emerald-500/40',
                  gradient: 'from-emerald-500/5',
                  line: 'from-emerald-500'
                }
              }
              if (lowerTitle.includes('strategic') && lowerTitle.includes('introduction')) { // Strategic Introduction Mapping -> Green
                 return {
                  bg: 'bg-emerald-500/10',
                  text: 'text-emerald-500',
                  border: 'border-emerald-500/20 hover:border-emerald-500/40',
                  gradient: 'from-emerald-500/5',
                  line: 'from-emerald-500'
                }
              }
              if (lowerTitle.includes('syndicate') && lowerTitle.includes('exposure')) { // Syndicate Exposure Intelligence -> Blue
                 return {
                  bg: 'bg-blue-500/10',
                  text: 'text-blue-500',
                  border: 'border-blue-500/20 hover:border-blue-500/40',
                  gradient: 'from-blue-500/5',
                  line: 'from-blue-500'
                }
              }
              if (lowerTitle.includes('contextual') && lowerTitle.includes('market')) { // Contextual Market Alerts -> Yellow
                 return {
                  bg: 'bg-amber-500/10',
                  text: 'text-amber-500',
                  border: 'border-amber-500/20 hover:border-amber-500/40',
                  gradient: 'from-amber-500/5',
                  line: 'from-amber-500'
                }
              }

              // Fallback to alternating pattern
              const isEven = index % 2 === 0
              if (isEven) {
                 return {
                  bg: 'bg-purple-500/10',
                  text: 'text-purple-400',
                  border: 'border-purple-500/20 hover:border-purple-500/40',
                  gradient: 'from-purple-500/5',
                  line: 'from-purple-500'
                }
              } else {
                 return {
                  bg: 'bg-indigo-500/10',
                  text: 'text-indigo-400',
                  border: 'border-indigo-500/20 hover:border-indigo-500/40',
                  gradient: 'from-indigo-500/5',
                  line: 'from-indigo-500'
                }
              }
            }

            const colors = getUseCaseColors(useCase.title, index)

            return (
              <div
                key={useCase.id}
                className={`group relative p-8 rounded-2xl border transition-all duration-300 bg-gradient-to-br ${colors.gradient} to-transparent ${colors.border} hover:shadow-xl`}
              >
                {/* Icon */}
                <div
                  className={`mb-6 w-12 h-12 rounded-xl flex items-center justify-center ${colors.bg} ${colors.text}`}
                >
                  <IconComponent className="w-6 h-6" />
                </div>

                {/* Title */}
                <h3 className="text-2xl font-bold text-foreground mb-3">
                  {useCase.title}
                </h3>

                {/* Description */}
                <div
                  className="prose dark:prose-invert prose-slate max-w-none text-base text-slate-600 dark:text-slate-300"
                  dangerouslySetInnerHTML={{ __html: renderRichText(useCase.description) }}
                />

                {/* Decorative gradient line */}
                <div
                  className={`absolute bottom-0 left-0 w-full h-0.5 rounded-b-2xl scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left bg-gradient-to-r ${colors.line} to-transparent`}
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
