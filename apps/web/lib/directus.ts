import { createDirectus, rest, readItem, readItems } from '@directus/sdk';

// Define Directus schema types
export interface DirectusPage {
  id: string;
  slug: string;
  title: string;
  meta_title: string | null;
  meta_description: string | null;
  og_image: string | null;
  status: 'draft' | 'published';
  content_blocks: ContentBlock[];
  published_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface ContentBlock {
  type: string;
  id: string;
  [key: string]: any; // Allow flexible content based on block type
}

export interface HeroBlock extends ContentBlock {
  type: 'hero';
  badge_text?: string;
  headline: string;
  subheadline: string;
  cta_primary_text?: string;
  cta_primary_link?: string;
  cta_secondary_text?: string;
  cta_secondary_link?: string;
  background_gradient?: boolean;
}

export interface FeaturesGridBlock extends ContentBlock {
  type: 'features_grid';
  features: Array<{
    icon: string;
    icon_color: string;
    title: string;
    description: string;
  }>;
}

// Define Directus collections schema
interface DirectusSchema {
  cms_pages: DirectusPage[];
}

// Create Directus client
const directusUrl = process.env.NEXT_PUBLIC_DIRECTUS_URL || 'https://admin.automatonicai.com';

export const directus = createDirectus<DirectusSchema>(directusUrl).with(rest());

/**
 * Fetch a page by slug from Directus CMS
 * @param slug - The page slug (e.g., 'solutions', 'about', 'features')
 * @returns The page data or null if not found
 */
export async function getPageBySlug(slug: string): Promise<DirectusPage | null> {
  try {
    const pages = await directus.request(
      readItems('cms_pages', {
        filter: {
          slug: { _eq: slug },
          status: { _eq: 'published' }
        },
        limit: 1
      })
    );

    return pages[0] || null;
  } catch (error) {
    console.error(`[Directus] Error fetching page with slug "${slug}":`, error);
    return null;
  }
}

/**
 * Fetch all published pages from Directus CMS
 * @returns Array of published pages
 */
export async function getAllPages(): Promise<DirectusPage[]> {
  try {
    const pages = await directus.request(
      readItems('cms_pages', {
        filter: {
          status: { _eq: 'published' }
        },
        sort: ['created_at']
      })
    );

    return pages;
  } catch (error) {
    console.error('[Directus] Error fetching all pages:', error);
    return [];
  }
}

/**
 * Get all published page slugs (useful for static generation)
 * @returns Array of page slugs
 */
export async function getAllPageSlugs(): Promise<string[]> {
  try {
    const pages = await directus.request(
      readItems('cms_pages', {
        filter: {
          status: { _eq: 'published' }
        },
        fields: ['slug']
      })
    );

    return pages.map(page => page.slug);
  } catch (error) {
    console.error('[Directus] Error fetching page slugs:', error);
    return [];
  }
}
