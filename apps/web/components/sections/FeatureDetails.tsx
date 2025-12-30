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
import type { Feature } from '@/lib/directus'

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
  features: Feature[]
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
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-500/20 to-sky-500/20 border border-violet-500/20 mb-6">
                    <IconComponent className="w-8 h-8 text-violet-400" />
                  </div>

                  {/* Title */}
                  <h3 className="text-2xl sm:text-3xl font-bold text-white mb-4">
                    {feature.title}
                  </h3>

                  {/* Description */}
                  <div
                    className="text-lg text-slate-400 leading-relaxed mb-6 prose prose-invert max-w-none"
                    dangerouslySetInnerHTML={{ __html: feature.description }}
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
                  <div className="relative aspect-[4/3] rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 overflow-hidden">
                    {/* Decorative content - in production this would be a screenshot or diagram */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="relative">
                        <IconComponent className="w-32 h-32 text-slate-700" />
                        <div className="absolute inset-0 bg-gradient-to-t from-violet-500/20 to-transparent blur-xl" />
                      </div>
                    </div>

                    {/* Floating UI Elements for visual interest */}
                    <div className="absolute top-6 right-6 px-4 py-2 rounded-lg bg-slate-900/80 backdrop-blur border border-slate-700 text-sm text-slate-300">
                      Live Preview
                    </div>
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
