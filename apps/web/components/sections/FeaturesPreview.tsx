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
}

interface FeaturesPreviewProps {
  features: Feature[]
}

export function FeaturesPreview({ features }: FeaturesPreviewProps) {
  return (
    <section className="relative bg-slate-900 py-24 lg:py-32">
      {/* Background gradient accent */}
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-violet-500/50 to-transparent" />

      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-16 max-w-3xl mx-auto">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4">
            Built for Modern Investors
          </h2>
          <p className="text-lg text-slate-400">
            Enterprise-grade features designed for private market intelligence and relationship discovery
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {features.map((feature) => {
            const IconComponent = feature.icon ? iconMap[feature.icon] : Sparkles

            return (
              <div
                key={feature.id}
                className="group relative p-6 rounded-xl bg-slate-950 border border-slate-800 hover:border-slate-700 transition-all duration-300 hover:shadow-lg hover:shadow-slate-900/50"
              >
                {/* Icon and Title Row */}
                <div className="flex items-start gap-4 mb-4">
                  <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-gradient-to-br from-violet-500/20 to-sky-500/20 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <IconComponent className="w-5 h-5 text-violet-400" />
                  </div>

                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-white group-hover:text-violet-300 transition-colors">
                      {feature.title}
                    </h3>
                  </div>
                </div>

                {/* Description */}
                <p className="text-slate-400 text-sm leading-relaxed">
                  {feature.description}
                </p>

                {/* Hover indicator */}
                <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-violet-500 to-sky-500 scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left rounded-b-xl" />
              </div>
            )
          })}
        </div>

        {/* CTA Section */}
        <div className="text-center mt-16">
          <p className="text-slate-400 mb-6">
            Discover how Chronos can transform your private market intelligence
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <a
              href="#"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-gradient-to-r from-violet-500 to-sky-500 text-white font-medium hover:opacity-90 transition-opacity"
            >
              Explore All Features
              <Layers className="w-4 h-4" />
            </a>
            <a
              href="#"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-lg border border-slate-700 text-slate-300 font-medium hover:bg-slate-800 transition-colors"
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
