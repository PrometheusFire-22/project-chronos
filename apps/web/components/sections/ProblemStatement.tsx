import {
  AlertCircle,
  TrendingDown,
  Eye,
  Database,
  Network,
  Globe,
  Activity,
  Zap,
  Layers,
  FileSearch,
  Axis3d,
  FileSpreadsheet,
  type LucideIcon
} from 'lucide-react'
import type { Feature } from '@/lib/directus'
import { renderRichText } from '@/lib/content-renderer'

// Icon mapping for Directus icon field
const iconMap: Record<string, LucideIcon> = {
  'alert-circle': AlertCircle,
  'trending-down': TrendingDown,
  'eye': Eye,
  'database': Database,
  'network': Network,
  'globe': Globe,
  'activity': Activity,
  'zap': Zap,
  'layers': Layers,
  'search': FileSearch,
  'axis-3d': Axis3d,
  'file-spreadsheet': FileSpreadsheet,
}

interface ProblemStatementProps {
  problems: Feature[]
}

export function ProblemStatement({ problems }: ProblemStatementProps) {
  return (
    <section className="relative bg-slate-950 py-24 lg:py-32">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-16 max-w-3xl mx-auto">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4">
            The Challenge
          </h2>
          <p className="text-lg text-slate-400">
            Private market investors struggle with fragmented data and hidden relationships
          </p>
        </div>

        {/* Problem Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {problems.map((problem) => {
            const IconComponent: LucideIcon = (problem.icon && problem.icon in iconMap) ? iconMap[problem.icon] : AlertCircle

            return (
              <div
                key={problem.id}
                className="relative p-8 rounded-2xl bg-slate-900/50 border border-slate-800 hover:border-slate-700 transition-colors"
              >
                {/* Icon */}
                <div className="mb-4 w-12 h-12 rounded-xl bg-red-500/10 flex items-center justify-center">
                  <IconComponent className="w-6 h-6 text-red-400" />
                </div>

                {/* Title */}
                <h3 className="text-xl font-semibold text-white mb-3">
                  {problem.title}
                </h3>

                {/* Description */}
                <div
                  className="prose prose-invert max-w-none prose-sm"
                  dangerouslySetInnerHTML={{ __html: renderRichText(problem.description) }}
                />
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
