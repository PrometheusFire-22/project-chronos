import React from 'react';
import { getPageSectionsByPage } from '@/lib/directus';
import { ArrowRight, ShieldAlert } from 'lucide-react';
import { SolutionPillars } from '@/components/sections/SolutionPillars';
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

  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-500">
      {/* Hero Section */}
      <div className="relative overflow-hidden pt-24 pb-16 lg:pt-32 lg:pb-24">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[500px] bg-purple-500/10 blur-[120px] rounded-full pointer-events-none" />

        <div className="container mx-auto px-6 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <span className="inline-block px-3 py-1 mb-6 text-xs font-bold tracking-widest text-purple-500 uppercase bg-purple-500/10 rounded-full border border-purple-500/20">
              Consulting & Advisory
            </span>
            <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-8 bg-clip-text text-transparent bg-gradient-to-r from-foreground via-purple-500 to-indigo-500">
              {hero.headline}
            </h1>
            <p className="text-xl text-muted-foreground leading-relaxed mb-10 max-w-2xl mx-auto">
              {hero.subheadline}
            </p>
            {hero.cta_text && hero.cta_link && (
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <a
                  href={hero.cta_link}
                  className="inline-flex items-center px-8 py-4 text-base font-bold text-white transition-all bg-purple-600 rounded-xl hover:bg-purple-700 shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40"
                >
                  {hero.cta_text}
                  <ArrowRight className="ml-2 w-5 h-5" />
                </a>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Solution Pillars */}
      <SolutionPillars features={features.map(f => ({
        id: f.id,
        section_key: f.section_key,
        headline: f.headline,
        content: f.subheadline || ''
      }))} />
    </div>
  );
}
