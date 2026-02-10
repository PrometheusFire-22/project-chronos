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
    <section className="relative bg-slate-900 py-24 lg:py-32">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-16 max-w-3xl mx-auto">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4">
            Everything You Need to Succeed
          </h2>
          <p className="text-lg text-slate-400">
            A comprehensive suite of tools designed specifically for private market intelligence
          </p>
        </div>

        {/* Features Grid - Alternating Layout */}
        <div className="max-w-7xl mx-auto space-y-24">
          {features.map((feature, index) => {
            const IconComponent: LucideIcon = (feature.icon && feature.icon in iconMap) ? iconMap[feature.icon] : Sparkles
            const isEven = index % 2 === 0

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
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500/20 to-indigo-500/20 border border-purple-500/20 mb-6">
                    <IconComponent className="w-8 h-8 text-purple-400" />
                  </div>

                  {/* Title */}
                  <h3 className="text-2xl sm:text-3xl font-bold text-white mb-4">
                    {feature.title}
                  </h3>

                  {/* Description */}
                  <div
                    className="prose prose-invert prose-lg max-w-none"
                    dangerouslySetInnerHTML={{ __html: renderRichText(feature.description) }}
                  />

                  {/* Key Points - if description is long, we could split it */}
                  <div className="flex flex-wrap gap-3">
                    <span className="px-3 py-1 rounded-full bg-slate-800 text-slate-300 text-sm">
                      Enterprise-Ready
                    </span>
                    <span className="px-3 py-1 rounded-full bg-slate-800 text-slate-300 text-sm">
                      Real-Time
                    </span>
                    <span className="px-3 py-1 rounded-full bg-slate-800 text-slate-300 text-sm">
                      AI-Powered
                    </span>
                  </div>
                </div>

                {/* Visual Placeholder */}
                <div className={isEven ? 'lg:order-2' : 'lg:order-1'}>
                  <div className="relative aspect-[4/3] rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden group-hover:border-slate-700 transition-colors">
                     <Image
                      src={getFeatureImage(index, feature.title)}
                      alt={feature.title}
                      fill
                      className="object-contain p-8"
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
