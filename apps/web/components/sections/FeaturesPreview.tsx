import {
  Search,
  Sparkles,
  Shield,
  Zap,
  Users,
  Lock,
  BarChart3,
  Layers,
  Bell,
  FileText,
  Filter,
  Share2,
  Network,
  Globe,
  Database,
  TrendingUp,
  Route,
  type LucideIcon
} from 'lucide-react'
import type { HomepageFeature, PageSection } from '@/lib/directus/types'
import { renderRichText } from '@/lib/content-renderer'

// Icon mapping for feature icons
const iconMap: Record<string, LucideIcon> = {
  'search': Search,
  'sparkles': Sparkles,
  'shield': Shield,
  'zap': Zap,
  'users': Users,
  'lock': Lock,
  'bar-chart-3': BarChart3,
  'layers': Layers,
  'bell': Bell,
  'file-text': FileText,
  'filter': Filter,
  'share-2': Share2,
  'network': Network,
  'globe': Globe,
  'database': Database,
  'trending-up': TrendingUp,
  'route': Route,
}

interface FeaturesPreviewProps {
  features: HomepageFeature[]
  sectionData?: PageSection | null
}

export function FeaturesPreview({ features, sectionData }: FeaturesPreviewProps) {
  // Fallback values if CMS data is not available
  const headline = sectionData?.headline ?? 'Built for the Special Situations Workflow'
  const subheadline = sectionData?.subheadline ??
    'Professional-grade tools designed to map the liquidity reset, identify forced sellers, and accelerate due diligence.'

  return (
    <section className="relative bg-muted/30 py-24 lg:py-32">
      {/* Background gradient accent */}
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-purple-500/50 to-transparent" />

      <div className="container mx-auto px-4">
        <div className="text-center mb-16 max-w-3xl mx-auto">
          <h2 className="heading-section text-foreground mb-4">
            {headline}
          </h2>
          <p className="text-body-lg">
            {subheadline}
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {features.map((feature) => {
            const IconComponent: LucideIcon = (feature.icon && feature.icon in iconMap) ? iconMap[feature.icon] : Sparkles

            // Color logic
            const getFeatureColors = (title: string) => {
              const lowerTitle = title.toLowerCase()
                if (lowerTitle.includes('usage') || lowerTitle.includes('analytics')) {
                return {
                  from: 'from-rose-500/20',
                  to: 'to-pink-500/20',
                  text: 'text-rose-500 group-hover:text-rose-600 dark:hover:text-rose-400',
                  titleHover: 'group-hover:text-rose-600 dark:group-hover:text-rose-400'
                }
              }
               if (lowerTitle.includes('contagion')) {
                return {
                  from: 'from-emerald-500/20',
                  to: 'to-green-500/20',
                  text: 'text-emerald-500 group-hover:text-emerald-600 dark:hover:text-emerald-400',
                   titleHover: 'group-hover:text-emerald-600 dark:group-hover:text-emerald-400'
                }
              }
               if (lowerTitle.includes('strategic') && lowerTitle.includes('introduction')) {
                return {
                  from: 'from-amber-500/20',
                  to: 'to-yellow-500/20',
                  text: 'text-amber-500 group-hover:text-amber-600 dark:hover:text-amber-400',
                   titleHover: 'group-hover:text-amber-600 dark:group-hover:text-amber-400'
                }
              }
               if (lowerTitle.includes('syndicate') && lowerTitle.includes('exposure')) {
                return {
                  from: 'from-blue-500/20',
                  to: 'to-cyan-500/20',
                  text: 'text-blue-500 group-hover:text-blue-600 dark:hover:text-blue-400',
                   titleHover: 'group-hover:text-blue-600 dark:group-hover:text-blue-400'
                }
              }
               if (lowerTitle.includes('contextual') && lowerTitle.includes('market')) {
                return {
                   from: 'from-emerald-500/20',
                   to: 'to-green-500/20',
                   text: 'text-emerald-500 group-hover:text-emerald-600 dark:hover:text-emerald-400',
                   titleHover: 'group-hover:text-emerald-600 dark:group-hover:text-emerald-400'
                }
              }
              if (lowerTitle.includes('location')) {
                return {
                  from: 'from-emerald-500/20',
                  to: 'to-green-500/20',
                  text: 'text-emerald-500 group-hover:text-emerald-600 dark:hover:text-emerald-400',
                  titleHover: 'group-hover:text-emerald-600 dark:group-hover:text-emerald-400'
                }
              }
              // Default
              return {
                from: 'from-purple-500/20',
                to: 'to-indigo-500/20',
                text: 'text-purple-500 group-hover:text-purple-600 dark:group-hover:text-purple-300',
                titleHover: 'group-hover:text-purple-600 dark:group-hover:text-purple-300'
              }
            }

            const colors = getFeatureColors(feature.title)

            return (
              <div
                key={feature.id}
                className="group relative p-6 rounded-xl bg-card border border-border hover:border-border/80 transition-all duration-300 hover:shadow-lg"
              >
                {/* Icon and Title Row */}
                <div className="flex items-start gap-4 mb-4">
                  <div className={`flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br ${colors.from} ${colors.to} flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                    <IconComponent className={`icon-md ${colors.text.split(' ')[0]}`} />
                  </div>

                  <div className="flex-1">
                    <h3 className={`heading-card text-foreground ${colors.titleHover} transition-colors`}>
                      {feature.title}
                    </h3>
                  </div>
                </div>

                {/* Description */}
                <div
                  className="prose-card"
                  dangerouslySetInnerHTML={{ __html: renderRichText(feature.description) }}
                />

                {/* Hover indicator */}
                <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500 to-indigo-500 scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left rounded-b-xl" />
              </div>
            )
          })}
        </div>

        {/* CTA Section */}
        <div className="text-center mt-16">
          <p className="text-muted-foreground mb-6">
            Discover how Chronos can transform your private market intelligence
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <a
              href="#"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-gradient-to-r from-purple-500 to-indigo-500 text-white font-medium hover:opacity-90 transition-opacity"
            >
              Explore All Features
              <Layers className="w-4 h-4" />
            </a>
            <a
              href="#"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-lg border border-border text-foreground font-medium hover:bg-muted transition-colors"
            >
              View Documentation
              <FileText className="w-4 h-4" />
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}
