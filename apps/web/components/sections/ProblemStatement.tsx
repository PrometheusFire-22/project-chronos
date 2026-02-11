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
import type { HomepageProblem, PageSection } from '@/lib/directus/types'
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
  problems: HomepageProblem[]
  sectionData?: PageSection | null
}

// Helper to get icon by title if direct mapping fails
function getIconForProblem(title: string, defaultIcon: LucideIcon): LucideIcon {
  const lowerTitle = title.toLowerCase()
  if (lowerTitle.includes('unstructured')) return FileSearch
  if (lowerTitle.includes('credit ties') || lowerTitle.includes('network')) return Network
  if (lowerTitle.includes('bottlenecks') || lowerTitle.includes('diligence')) return TrendingDown
  return defaultIcon
}

export function ProblemStatement({ problems, sectionData }: ProblemStatementProps) {
  // Fallback values if CMS data is not available
  const headline = sectionData?.headline ?? 'The Problem: Information is Public. Intelligence is Hidden.'
  const subheadline = sectionData?.subheadline ??
    'In a distressed market, the data you need is buried in 300-page monitor reports and fragmented spreadsheets. By the time you find the connection, the window has closed.'

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

        {/* Problem Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {problems.map((problem) => {
            // Priority: 1. Direct CMS icon mapping, 2. Title-based inference, 3. AlertCircle
            let IconComponent: LucideIcon = AlertCircle

            if (problem.icon && problem.icon in iconMap) {
                IconComponent = iconMap[problem.icon]
            } else {
                IconComponent = getIconForProblem(problem.title, AlertCircle)
            }

            // Custom color logic
            const getProblemColors = (title: string) => {
                const lowerTitle = title.toLowerCase()

                if (lowerTitle.includes('invisible')) { // Invisible Credit Ties -> Yellow
                    return {
                        bg: 'bg-amber-500/10',
                        text: 'text-amber-500',
                        border: 'border-amber-500/20 hover:border-amber-500/40',
                        gradient: 'from-amber-500/5',
                        line: 'from-amber-500'
                    }
                }
                if (lowerTitle.includes('bottlenecks') || lowerTitle.includes('diligence')) { // Due Diligence Bottlenecks -> Red/Pink
                    return {
                        bg: 'bg-pink-500/10',
                        text: 'text-pink-500',
                        border: 'border-pink-500/20 hover:border-pink-500/40',
                        gradient: 'from-pink-500/5',
                        line: 'from-pink-500'
                    }
                }
                 // Default (Trapped in Unstructured Data, etc.) -> Purple
                 return {
                        bg: 'bg-purple-500/10',
                        text: 'text-purple-400',
                        border: 'border-purple-500/20 hover:border-purple-500/40',
                        gradient: 'from-purple-500/5',
                        line: 'from-purple-500'
                    }
            }

            const colors = getProblemColors(problem.title)

            return (
              <div
                key={problem.id}
                className={`group relative p-8 rounded-2xl bg-card border transition-all duration-300 ${colors.border} hover:shadow-xl bg-gradient-to-br ${colors.gradient} to-transparent`}
              >
                {/* Icon */}
                <div className={`mb-4 w-12 h-12 rounded-xl flex items-center justify-center ${colors.bg}`}>
                  <IconComponent className={`w-6 h-6 ${colors.text}`} />
                </div>

                {/* Title */}
                <h3 className="text-2xl font-bold text-foreground mb-3">
                  {problem.title}
                </h3>

                {/* Description */}
                <div
                  className="prose dark:prose-invert prose-slate max-w-none text-base"
                  dangerouslySetInnerHTML={{ __html: renderRichText(problem.description) }}
                />

                 {/* Decorative gradient line */}
                <div
                  className={`absolute bottom-0 left-0 w-full h-0.5 rounded-b-2xl scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left bg-gradient-to-r ${colors.line} to-transparent`}
                />
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
