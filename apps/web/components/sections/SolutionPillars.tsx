
import React from 'react';
import { ShieldAlert, BarChart2, Zap, LucideIcon, ArrowRight } from 'lucide-react';
import { renderRichText } from '@/lib/content-renderer';
import type { HomepagePillar, PageSection } from '@/lib/directus/types';

interface SolutionPillarsProps {
  pillars: HomepagePillar[];
  sectionData?: PageSection | null;
}

export function SolutionPillars({ pillars, sectionData }: SolutionPillarsProps) {
  const features = pillars;

  // Icon mapping by slug
  const iconMap: Record<string, LucideIcon> = {
    'solutions-feature-1': ShieldAlert,
    'solutions-feature-2': BarChart2,
    'solutions-feature-3': Zap,
  };

  // Color mapping by slug
  const colorMap: Record<string, { bg: string; text: string; border: string; gradient: string }> = {
    'solutions-feature-1': {
      bg: 'bg-purple-500/10',
      text: 'text-purple-500',
      border: 'border-purple-500/50',
      gradient: 'from-purple-500/20'
    },
    'solutions-feature-2': {
      bg: 'bg-violet-500/10',
      text: 'text-violet-500',
      border: 'border-violet-500/50',
      gradient: 'from-violet-500/20'
    },
    'solutions-feature-3': {
      bg: 'bg-indigo-500/10',
      text: 'text-indigo-500',
      border: 'border-indigo-500/50',
      gradient: 'from-indigo-500/20'
    },
  };

  return (
    <div className="py-24 bg-muted border-t border-border">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {features.map((feature) => {
            const Icon = iconMap[feature.slug] || ShieldAlert;
            // Default to first color if not found
            const colors = colorMap[feature.slug] || colorMap['solutions-feature-1'];

            return (
              <div
                key={feature.id}
                className={`group relative p-8 rounded-2xl bg-card border border-border hover:${colors.border} transition-all duration-300 shadow-sm hover:shadow-md overflow-hidden`}
              >
                 {/*
                    FIX: Removed the strong gradient overlay that was obscuring text.
                    Instead, using a subtle background gradient that fades out.
                 */}
                <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none bg-gradient-to-br ${colors.gradient} to-transparent`} />

                <div className="relative z-10">
                  <div className={`w-14 h-14 rounded-xl flex items-center justify-center mb-6 transition-colors ${colors.bg} ${colors.text}`}>
                    <Icon className="w-7 h-7" />
                  </div>

                  <h3 className="text-2xl font-bold mb-4 text-foreground">
                    {feature.title}
                  </h3>

                  <div
                    className="prose prose-sm dark:prose-invert text-muted-foreground"
                    dangerouslySetInnerHTML={{ __html: renderRichText(feature.description) }}
                  />

                   <div className="mt-6 pt-6 border-t border-border/50 flex items-center text-sm font-medium text-foreground opacity-0 -translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300">
                    Learn more <ArrowRight className="ml-2 w-4 h-4" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
