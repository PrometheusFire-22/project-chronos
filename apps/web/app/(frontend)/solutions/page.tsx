import React from 'react';
import { getPageSectionsByPage } from '@/lib/directus';
import { ArrowRight, ShieldAlert, BarChart2, Zap } from 'lucide-react';
import { notFound } from 'next/navigation';

// Enable ISR with 60-second revalidation
export const revalidate = 60;

// Generate metadata
export async function generateMetadata() {
  return {
    title: 'Solutions - Strategic Credit Intelligence',
    description: 'Bespoke consulting and intelligence solutions for private credit and special situations.',
  };
}

export default async function SolutionsPage() {
  const sections = await getPageSectionsByPage('solutions');

  // If no sections found, show 404
  if (!sections || sections.length === 0) {
    console.error('[Solutions Page] No sections found in Directus');
    notFound();
  }

  // Separate hero from features
  const hero = sections.find(s => s.section_key === 'solutions-hero');
  const features = sections.filter(s => s.section_key.startsWith('solutions-feature-')).sort((a, b) =>
    a.section_key.localeCompare(b.section_key)
  );

  if (!hero) {
    console.error('[Solutions Page] Hero section not found');
    notFound();
  }

  console.log('[Solutions Page] Loaded from Directus:', {
    sections: sections.length,
    hero: hero.section_key,
    features: features.length,
    updated: hero.updated_at
  });

  // Icon mapping for features
  const iconMap: Record<string, typeof ShieldAlert> = {
    'solutions-feature-1': ShieldAlert,
    'solutions-feature-2': BarChart2,
    'solutions-feature-3': Zap,
  };

  const colorMap: Record<string, { bg: string; text: string; border: string }> = {
    'solutions-feature-1': { bg: 'bg-blue-500/10', text: 'text-blue-500', border: 'border-blue-500/50' },
    'solutions-feature-2': { bg: 'bg-violet-500/10', text: 'text-violet-500', border: 'border-violet-500/50' },
    'solutions-feature-3': { bg: 'bg-emerald-500/10', text: 'text-emerald-500', border: 'border-emerald-500/50' },
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#020617] text-slate-900 dark:text-slate-100 transition-colors duration-500">
      {/* Hero Section */}
      <div className="relative overflow-hidden pt-24 pb-16 lg:pt-32 lg:pb-24">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[500px] bg-blue-500/10 blur-[120px] rounded-full pointer-events-none" />

        <div className="container mx-auto px-6 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <span className="inline-block px-3 py-1 mb-6 text-xs font-bold tracking-widest text-blue-500 uppercase bg-blue-500/10 rounded-full border border-blue-500/20">
              Consulting & Advisory
            </span>
            <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-8 bg-clip-text text-transparent bg-gradient-to-r from-slate-900 via-slate-700 to-slate-900 dark:from-white dark:via-slate-200 dark:to-slate-400">
              {hero.headline}
            </h1>
            <p className="text-xl text-slate-600 dark:text-slate-400 leading-relaxed mb-10 max-w-2xl mx-auto">
              {hero.subheadline}
            </p>
            {hero.cta_text && hero.cta_link && (
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <a
                  href={hero.cta_link}
                  className="inline-flex items-center px-8 py-4 text-base font-bold text-white transition-all bg-blue-600 rounded-xl hover:bg-blue-700 shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40"
                >
                  {hero.cta_text}
                  <ArrowRight className="ml-2 w-5 h-5" />
                </a>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Features Grid */}
      <div className="py-24 bg-white dark:bg-slate-900/50 border-t border-slate-200 dark:border-slate-800">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {features.map((feature) => {
              const Icon = iconMap[feature.section_key] || ShieldAlert;
              const colors = colorMap[feature.section_key] || colorMap['solutions-feature-1'];

              return (
                <div
                  key={feature.id}
                  className={`group p-8 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 hover:${colors.border} transition-all duration-300`}
                >
                  <div className={`w-14 h-14 rounded-xl ${colors.bg} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                    <Icon className={`w-7 h-7 ${colors.text}`} />
                  </div>
                  <h3 className="text-xl font-bold mb-4">{feature.headline}</h3>
                  <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                    {feature.subheadline}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
