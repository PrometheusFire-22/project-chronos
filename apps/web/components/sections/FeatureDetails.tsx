import {
  Search,
  FileSearch,
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
  Database,
  TrendingUp,
  Globe,
  Activity,
  Target,
  type LucideIcon
} from 'lucide-react'
import Image from 'next/image'
import type { FeaturesCapability } from '@/lib/directus/types'
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
  'database': Database,
  'trending-up': TrendingUp,
  'globe': Globe,
  'activity': Activity,
  'target': Target,
}

interface FeatureDetailsProps {
  features: FeaturesCapability[]
}

function getFeatureImage(index: number, title: string): string {
  const lowerTitle = title.toLowerCase()
  if (lowerTitle.includes('relational') || lowerTitle.includes('sql')) return '/illustrations/relational-database-dark.svg'
  if (lowerTitle.includes('vector') || lowerTitle.includes('embedding')) return '/illustrations/vector-database-dark.svg'
  if (lowerTitle.includes('time') || lowerTitle.includes('series')) return '/illustrations/timeseries-database-dark.svg'

  // Fallback by index if titles don't match expected keywords
  switch (index) {
    case 0: return '/illustrations/hero-dark.svg'
    case 1: return '/illustrations/relational-database-dark.svg'
    case 2: return '/illustrations/vector-database-dark.svg'
    case 3: return '/illustrations/timeseries-database-dark.svg'
    default: return '/illustrations/hero-dark.svg'
  }
}

export function FeatureDetails({ features }: FeatureDetailsProps) {
  return (
    <section className="relative bg-background py-24 lg:py-32">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-16 max-w-3xl mx-auto">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-4">
            Everything You Need to Succeed
          </h2>
          <p className="text-lg text-muted-foreground">
            A comprehensive suite of tools designed specifically for private market intelligence
          </p>
        </div>

        {/* Features Grid - Alternating Layout */}
        <div className="max-w-7xl mx-auto space-y-24">
          {features.map((feature, index) => {
            const IconComponent: LucideIcon = (feature.icon && feature.icon in iconMap) ? iconMap[feature.icon] : Sparkles
            const isEven = index % 2 === 0

            const getFeatureColors = (title: string) => {
                const lowerTitle = title.toLowerCase()

                if (lowerTitle.includes('contagion')) {
                     return {
                        bg: 'bg-emerald-500/10',
                        border: 'border-emerald-500/20',
                        text: 'text-emerald-500'
                    }
                }
                if (lowerTitle.includes('usage') || lowerTitle.includes('analytics')) {
                     return {
                        bg: 'bg-rose-500/10',
                        border: 'border-rose-500/20',
                        text: 'text-rose-500'
                    }
                }
                if (lowerTitle.includes('strategic') && lowerTitle.includes('introduction')) {
                     return {
                        bg: 'bg-emerald-500/10',
                        border: 'border-emerald-500/20',
                        text: 'text-emerald-500'
                    }
                }
                if (lowerTitle.includes('syndicate') && lowerTitle.includes('exposure')) {
                     return {
                        bg: 'bg-blue-500/10',
                        border: 'border-blue-500/20',
                        text: 'text-blue-500'
                    }
                }
                if (lowerTitle.includes('contextual') && lowerTitle.includes('market')) {
                     return {
                        bg: 'bg-amber-500/10',
                        border: 'border-amber-500/20',
                        text: 'text-amber-500'
                    }
                }
                // New Mappings
                if (lowerTitle.includes('liquidity') && lowerTitle.includes('timing')) { // Liquidity Timing -> Yellow
                     return {
                        bg: 'bg-amber-500/10',
                        border: 'border-amber-500/20',
                        text: 'text-amber-500'
                    }
                }
                if (lowerTitle.includes('location') && lowerTitle.includes('risk')) { // Location Risk Mapping -> Green
                     return {
                        bg: 'bg-emerald-500/10',
                        border: 'border-emerald-500/20',
                        text: 'text-emerald-500'
                    }
                }
                if (lowerTitle.includes('document') && lowerTitle.includes('parsing')) { // AI Document Parsing -> Purple
                     return {
                        bg: 'bg-purple-500/10',
                        border: 'border-purple-500/20',
                        text: 'text-purple-500'
                    }
                }
                if (lowerTitle.includes('market') && lowerTitle.includes('network')) { // Market Network Mapping -> Purple
                     return {
                        bg: 'bg-purple-500/10',
                        border: 'border-purple-500/20',
                        text: 'text-purple-500'
                    }
                }

                // Default
                 return {
                        bg: 'bg-purple-500/10',
                        border: 'border-purple-500/20',
                        text: 'text-purple-500'
                    }
            }

            const colors = getFeatureColors(feature.title)

            // Icon Override Logic
            let DisplayIcon = IconComponent
            const lowerTitle = feature.title.toLowerCase()

            if (lowerTitle.includes('market') && lowerTitle.includes('network')) DisplayIcon = Network // 3-node graph
            if (lowerTitle.includes('document') && lowerTitle.includes('parsing')) DisplayIcon = FileSearch // Document search
            if (lowerTitle.includes('location') && lowerTitle.includes('risk')) DisplayIcon = Globe // Globe
            if (lowerTitle.includes('liquidity') && lowerTitle.includes('timing')) DisplayIcon = TrendingUp // Line chart/Trending up

            return (
              <div
                key={feature.id}
                className={`grid lg:grid-cols-2 gap-12 items-center ${
                  isEven ? '' : 'lg:flex-row-reverse'
                }`}
              >
                {/* Content */}
                <div className={isEven ? 'lg:order-1' : 'lg:order-2'}>
                  {/* Icon */}
                  <div className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl ${colors.bg} ${colors.border} border mb-6`}>
                    <DisplayIcon className={`w-8 h-8 ${colors.text}`} />
                  </div>

                  {/* Title */}
                  <h3 className="text-2xl sm:text-3xl font-bold text-foreground mb-4">
                    {feature.title}
                  </h3>

                  {/* Description */}
                  <div
                    className="prose prose-lg max-w-none text-muted-foreground prose-strong:text-foreground dark:prose-strong:text-white"
                    dangerouslySetInnerHTML={{ __html: renderRichText(feature.description) }}
                  />

                  {/* Key Points - if description is long, we could split it */}
                  <div className="flex flex-wrap gap-3 mt-6">
                    <span className="px-3 py-1 rounded-full bg-muted text-muted-foreground border border-border text-sm font-medium">
                      Enterprise-Ready
                    </span>
                    <span className="px-3 py-1 rounded-full bg-muted text-muted-foreground border border-border text-sm font-medium">
                      Real-Time
                    </span>
                    <span className="px-3 py-1 rounded-full bg-muted text-muted-foreground border border-border text-sm font-medium">
                      AI-Powered
                    </span>
                  </div>
                </div>

                {/* Visual Placeholder */}
                <div className={isEven ? 'lg:order-2' : 'lg:order-1'}>
                  <div className="relative aspect-[4/3] rounded-2xl bg-muted border border-border overflow-hidden shadow-lg">
                     <Image
                      src={getFeatureImage(index, feature.title)}
                      alt={feature.title}
                      fill
                      className="object-cover"
                    />
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
