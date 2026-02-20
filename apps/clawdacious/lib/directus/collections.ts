/**
 * Directus Collection Helpers for Clawdacious
 *
 * Type-safe getter functions for claw_* CMS collections.
 */

import {
  fetchDirectus,
  buildQuery,
  type FetchOptions,
  DirectusError,
} from './client';
import {
  HomepageHeroSchema,
  BlogPostSchema,
  AnnouncementSchema,
  LegalPageSchema,
  PageSectionSchema,
  HomepageFeatureSchema,
  AboutHeroSchema,
  AboutValueSchema,
  CTASectionSchema,
  type HomepageHero,
  type BlogPost,
  type Announcement,
  type LegalPage,
  type PageSection,
  type PageSectionKeyType,
  type HomepageFeature,
  type AboutHero,
  type AboutValue,
  type CTASection,
  type DirectusSingleResponse,
  type DirectusCollectionResponse,
  type DirectusPaginatedResponse,
} from './types';

// =============================================================================
// Homepage Hero (Singleton)
// =============================================================================

export async function getHomepageHero(
  options?: FetchOptions
): Promise<HomepageHero> {
  const response = await fetchDirectus<DirectusSingleResponse<HomepageHero>>(
    '/items/claw_homepage_hero',
    {
      revalidate: 3600,
      ...options,
    }
  );

  return HomepageHeroSchema.parse(response.data);
}

// =============================================================================
// Homepage Features
// =============================================================================

export async function getHomepageFeatures(
  options?: FetchOptions
): Promise<HomepageFeature[]> {
  const query = buildQuery({
    filter: { enabled: { _eq: true } },
    sort: ['sort_order'],
  });

  const response = await fetchDirectus<DirectusCollectionResponse<HomepageFeature>>(
    `/items/claw_homepage_features${query}`,
    {
      revalidate: 3600,
      tags: ['homepage-features'],
      ...options,
    }
  );

  return response.data.map((item) => HomepageFeatureSchema.parse(item));
}

// =============================================================================
// Blog Posts
// =============================================================================

export async function getBlogPosts(params?: {
  page?: number;
  limit?: number;
  category?: string;
  tag?: string;
  options?: FetchOptions;
}): Promise<{ posts: BlogPost[]; total: number }> {
  const page = params?.page ?? 1;
  const limit = params?.limit ?? 10;
  const offset = (page - 1) * limit;

  const filter: Record<string, unknown> = {
    status: { _eq: 'published' },
  };

  if (params?.category) {
    filter.category = { _eq: params.category };
  }

  if (params?.tag) {
    filter.tags = { _contains: params.tag };
  }

  const query = buildQuery({
    filter,
    sort: ['-published_at'],
    limit,
    offset,
    fields: ['*', 'featured_image.*'],
  });

  const response = await fetchDirectus<DirectusPaginatedResponse<BlogPost>>(
    `/items/claw_blog_posts${query}`,
    {
      revalidate: 300,
      tags: ['blog-posts'],
      ...params?.options,
    }
  );

  return {
    posts: response.data.map((post) => BlogPostSchema.parse(post)),
    total: response.meta.filter_count,
  };
}

export async function getBlogPostBySlug(
  slug: string,
  options?: FetchOptions
): Promise<BlogPost | null> {
  const query = buildQuery({
    filter: {
      slug: { _eq: slug },
      status: { _eq: 'published' },
    },
    limit: 1,
    fields: ['*', 'featured_image.*'],
  });

  const response = await fetchDirectus<DirectusCollectionResponse<BlogPost>>(
    `/items/claw_blog_posts${query}`,
    {
      revalidate: 900,
      tags: [`blog-post-${slug}`],
      ...options,
    }
  );

  if (response.data.length === 0) {
    return null;
  }

  return BlogPostSchema.parse(response.data[0]);
}

export async function getFeaturedBlogPosts(
  limit = 3,
  options?: FetchOptions
): Promise<BlogPost[]> {
  const query = buildQuery({
    filter: {
      status: { _eq: 'published' },
      featured: { _eq: true },
    },
    sort: ['-published_at'],
    limit,
    fields: ['*', 'featured_image.*'],
  });

  const response = await fetchDirectus<DirectusCollectionResponse<BlogPost>>(
    `/items/claw_blog_posts${query}`,
    {
      revalidate: 300,
      tags: ['blog-posts'],
      ...options,
    }
  );

  return response.data.map((post) => BlogPostSchema.parse(post));
}

// =============================================================================
// Announcements
// =============================================================================

export async function getActiveAnnouncements(
  options?: FetchOptions
): Promise<Announcement[]> {
  const query = buildQuery({
    filter: {
      active: { _eq: true },
    },
  });

  const response = await fetchDirectus<DirectusCollectionResponse<Announcement>>(
    `/items/claw_announcements${query}`,
    {
      revalidate: 60,
      ...options,
    }
  );

  return response.data.map((item) => AnnouncementSchema.parse(item));
}

// =============================================================================
// Legal Pages
// =============================================================================

export async function getLegalPageBySlug(
  slug: string,
  options?: FetchOptions
): Promise<LegalPage | null> {
  const query = buildQuery({
    filter: {
      slug: { _eq: slug },
      status: { _eq: 'published' },
    },
    sort: ['-effective_date'],
    limit: 1,
  });

  const response = await fetchDirectus<DirectusCollectionResponse<LegalPage>>(
    `/items/claw_legal_pages${query}`,
    {
      revalidate: 21600,
      ...options,
    }
  );

  if (response.data.length === 0) {
    return null;
  }

  return LegalPageSchema.parse(response.data[0]);
}

// =============================================================================
// Page Sections
// =============================================================================

export async function getPageSection(
  sectionKey: PageSectionKeyType,
  options?: FetchOptions
): Promise<PageSection | null> {
  const query = buildQuery({
    filter: {
      section_key: { _eq: sectionKey },
      enabled: { _eq: true },
    },
    limit: 1,
  });

  const response = await fetchDirectus<DirectusCollectionResponse<PageSection>>(
    `/items/claw_page_sections${query}`,
    {
      revalidate: 3600,
      tags: [`page-section-${sectionKey}`],
      ...options,
    }
  );

  if (response.data.length === 0) {
    return null;
  }

  return PageSectionSchema.parse(response.data[0]);
}

export async function getPageSectionsByPage(
  pageName: string,
  options?: FetchOptions
): Promise<PageSection[]> {
  const query = buildQuery({
    filter: {
      page_name: { _eq: pageName },
      enabled: { _eq: true },
    },
    sort: ['section_key'],
  });

  const response = await fetchDirectus<DirectusCollectionResponse<PageSection>>(
    `/items/claw_page_sections${query}`,
    {
      revalidate: 3600,
      tags: [`page-sections-${pageName}`],
      ...options,
    }
  );

  return response.data.map((item) => PageSectionSchema.parse(item));
}

// =============================================================================
// About Page
// =============================================================================

export async function getAboutHero(
  options?: FetchOptions
): Promise<AboutHero | null> {
  const query = buildQuery({
    filter: { active: { _eq: true } },
    limit: 1,
  });

  const response = await fetchDirectus<DirectusCollectionResponse<AboutHero>>(
    `/items/claw_about_hero${query}`,
    {
      revalidate: 3600,
      tags: ['about-hero'],
      ...options,
    }
  );

  if (response.data.length === 0) {
    return null;
  }

  return AboutHeroSchema.parse(response.data[0]);
}

export async function getAboutValues(
  options?: FetchOptions
): Promise<AboutValue[]> {
  const query = buildQuery({
    filter: { enabled: { _eq: true } },
    sort: ['sort_order'],
  });

  const response = await fetchDirectus<DirectusCollectionResponse<AboutValue>>(
    `/items/claw_about_values${query}`,
    {
      revalidate: 3600,
      tags: ['about-values'],
      ...options,
    }
  );

  return response.data.map((item) => AboutValueSchema.parse(item));
}

// =============================================================================
// CTA Sections
// =============================================================================

export async function getCTASection(
  sectionKey: string,
  options?: FetchOptions
): Promise<CTASection | null> {
  const query = buildQuery({
    filter: {
      section_key: { _eq: sectionKey },
      enabled: { _eq: true },
    },
    limit: 1,
  });

  const response = await fetchDirectus<DirectusCollectionResponse<CTASection>>(
    `/items/claw_cta_sections${query}`,
    {
      revalidate: 3600,
      tags: [`cta-${sectionKey}`],
      ...options,
    }
  );

  if (response.data.length === 0) {
    return null;
  }

  return CTASectionSchema.parse(response.data[0]);
}

export async function getCTASectionsByPage(
  pageName: string,
  options?: FetchOptions
): Promise<CTASection[]> {
  const query = buildQuery({
    filter: {
      page_name: { _eq: pageName },
      enabled: { _eq: true },
    },
    sort: ['placement'],
  });

  const response = await fetchDirectus<DirectusCollectionResponse<CTASection>>(
    `/items/claw_cta_sections${query}`,
    {
      revalidate: 3600,
      tags: [`cta-sections-${pageName}`],
      ...options,
    }
  );

  return response.data.map((item) => CTASectionSchema.parse(item));
}

// =============================================================================
// Error Handling Helper
// =============================================================================

export function isDirectusError(error: unknown): error is DirectusError {
  return error instanceof DirectusError;
}
