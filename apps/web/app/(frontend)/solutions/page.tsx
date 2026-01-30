import React from 'react';
import { getPageBySlug } from '@/lib/directus';
import { ContentBlockRenderer } from '@/components/cms/ContentBlockRenderer';
import { notFound } from 'next/navigation';

// Enable ISR with 60-second revalidation
export const revalidate = 60;

// Generate metadata from Directus
export async function generateMetadata() {
  const page = await getPageBySlug('solutions');

  if (!page) {
    return {
      title: 'Solutions - Strategic Credit Intelligence',
      description: 'Bespoke consulting and intelligence solutions for private credit and special situations.',
    };
  }

  return {
    title: page.meta_title || page.title,
    description: page.meta_description || undefined,
    openGraph: page.og_image ? {
      images: [page.og_image],
    } : undefined,
  };
}

export default async function SolutionsPage() {
  const page = await getPageBySlug('solutions');

  // If page not found in Directus, show 404
  if (!page) {
    console.error('[Solutions Page] Page not found in Directus');
    notFound();
  }

  console.log('[Solutions Page] Loaded from Directus:', {
    slug: page.slug,
    title: page.title,
    blocks: page.content_blocks.length,
    updated: page.updated_at
  });

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#020617] text-slate-900 dark:text-slate-100 transition-colors duration-500">
      <ContentBlockRenderer blocks={page.content_blocks} />
    </div>
  );
}
