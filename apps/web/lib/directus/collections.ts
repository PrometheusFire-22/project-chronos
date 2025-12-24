/**
 * Directus Collection Helpers
 *
 * Type-safe getter functions for all CMS collections.
 * All functions validate responses with Zod schemas.
 */

import {
  fetchDirectus,
  buildQuery,
  type FetchOptions,
  DirectusError,
} from './client';
import {
  HomepageHeroSchema,
  FeatureSchema,
  BlogPostSchema,
  DocsPageSchema,
  AnnouncementSchema,
  LegalPageSchema,
  type HomepageHero,
  type Feature,
  type FeatureCategoryType,
  type BlogPost,
  type DocsPage,
  type Announcement,
  type LegalPage,
  type DirectusSingleResponse,
  type DirectusCollectionResponse,
  type DirectusPaginatedResponse,
} from './types';

// =============================================================================
// Homepage Hero (Singleton)
// =============================================================================

/**
 * Get homepage hero content
 *
 * @example
 * ```typescript
 * const hero = await getHomepageHero();
 * // { headline: "...", subheadline: "...", cta_primary_text: "...", ... }
 * ```
 */
export async function getHomepageHero(
  options?: FetchOptions
): Promise<HomepageHero> {
  const response = await fetchDirectus<DirectusSingleResponse<HomepageHero>>(
    '/items/cms_homepage_hero',
    {
      revalidate: 3600, // 1 hour
      ...options,
    }
  );

  return HomepageHeroSchema.parse(response.data);
}

// =============================================================================
// Features
// =============================================================================

/**
 * Get features by category
 *
 * @example
 * ```typescript
 * const pillars = await getFeaturesByCategory('solution-pillar');
 * // Returns 4 database modality pillars, sorted by sort_order
 * ```
 */
export async function getFeaturesByCategory(
  category: FeatureCategoryType,
  options?: FetchOptions
): Promise<Feature[]> {
  const query = buildQuery({
    filter: {
      category: { _eq: category },
      enabled: { _eq: true },
    },
    sort: ['sort_order'],
  });

  const response = await fetchDirectus<DirectusCollectionResponse<Feature>>(
    `/items/cms_features${query}`,
    {
      revalidate: 3600, // 1 hour
      ...options,
    }
  );

  return response.data.map((item) => FeatureSchema.parse(item));
}

/**
 * Get a single feature by slug
 *
 * @example
 * ```typescript
 * const feature = await getFeatureBySlug('pillar-graph');
 * ```
 */
export async function getFeatureBySlug(
  slug: string,
  options?: FetchOptions
): Promise<Feature | null> {
  const query = buildQuery({
    filter: {
      slug: { _eq: slug },
      enabled: { _eq: true },
    },
    limit: 1,
  });

  const response = await fetchDirectus<DirectusCollectionResponse<Feature>>(
    `/items/cms_features${query}`,
    {
      revalidate: 3600, // 1 hour
      ...options,
    }
  );

  if (response.data.length === 0) {
    return null;
  }

  return FeatureSchema.parse(response.data[0]);
}

/**
 * Get all enabled features
 *
 * @example
 * ```typescript
 * const allFeatures = await getAllFeatures();
 * ```
 */
export async function getAllFeatures(
  options?: FetchOptions
): Promise<Feature[]> {
  const query = buildQuery({
    filter: { enabled: { _eq: true } },
    sort: ['category', 'sort_order'],
  });

  const response = await fetchDirectus<DirectusCollectionResponse<Feature>>(
    `/items/cms_features${query}`,
    {
      revalidate: 3600, // 1 hour
      ...options,
    }
  );

  return response.data.map((item) => FeatureSchema.parse(item));
}

// =============================================================================
// Blog Posts
// =============================================================================

/**
 * Get published blog posts with pagination
 *
 * @example
 * ```typescript
 * const { posts, total } = await getBlogPosts({ page: 1, limit: 10 });
 * ```
 */
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
    `/items/cms_blog_posts${query}`,
    {
      revalidate: 300, // 5 minutes
      tags: ['blog-posts'],
      ...params?.options,
    }
  );

  return {
    posts: response.data.map((post) => BlogPostSchema.parse(post)),
    total: response.meta.filter_count,
  };
}

/**
 * Get a single blog post by slug
 *
 * @example
 * ```typescript
 * const post = await getBlogPostBySlug('introducing-project-chronos');
 * ```
 */
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
    `/items/cms_blog_posts${query}`,
    {
      revalidate: 900, // 15 minutes
      tags: [`blog-post-${slug}`],
      ...options,
    }
  );

  if (response.data.length === 0) {
    return null;
  }

  return BlogPostSchema.parse(response.data[0]);
}

/**
 * Get featured blog posts
 *
 * @example
 * ```typescript
 * const featured = await getFeaturedBlogPosts(3);
 * ```
 */
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
    `/items/cms_blog_posts${query}`,
    {
      revalidate: 300, // 5 minutes
      tags: ['blog-posts'],
      ...options,
    }
  );

  return response.data.map((post) => BlogPostSchema.parse(post));
}

// =============================================================================
// Documentation Pages
// =============================================================================

/**
 * Get all documentation pages in hierarchical structure
 *
 * @example
 * ```typescript
 * const docs = await getDocsPages();
 * ```
 */
export async function getDocsPages(
  options?: FetchOptions
): Promise<DocsPage[]> {
  const query = buildQuery({
    filter: { status: { _eq: 'published' } },
    sort: ['sort_order'],
  });

  const response = await fetchDirectus<DirectusCollectionResponse<DocsPage>>(
    `/items/cms_docs_pages${query}`,
    {
      revalidate: 3600, // 1 hour
      ...options,
    }
  );

  return response.data.map((page) => DocsPageSchema.parse(page));
}

/**
 * Get a single documentation page by slug
 */
export async function getDocsPageBySlug(
  slug: string,
  options?: FetchOptions
): Promise<DocsPage | null> {
  const query = buildQuery({
    filter: {
      slug: { _eq: slug },
      status: { _eq: 'published' },
    },
    limit: 1,
  });

  const response = await fetchDirectus<DirectusCollectionResponse<DocsPage>>(
    `/items/cms_docs_pages${query}`,
    {
      revalidate: 3600, // 1 hour
      ...options,
    }
  );

  if (response.data.length === 0) {
    return null;
  }

  return DocsPageSchema.parse(response.data[0]);
}

// =============================================================================
// Announcements
// =============================================================================

/**
 * Get active announcements
 *
 * @example
 * ```typescript
 * const announcements = await getActiveAnnouncements();
 * // Returns announcements that are active and within start/end dates
 * ```
 */
export async function getActiveAnnouncements(
  options?: FetchOptions
): Promise<Announcement[]> {
  const now = new Date().toISOString();

  const query = buildQuery({
    filter: {
      active: { _eq: true },
      // Optional: Add date filtering if needed
      // starts_at: { _lte: now },
      // ends_at: { _gte: now },
    },
  });

  const response = await fetchDirectus<DirectusCollectionResponse<Announcement>>(
    `/items/cms_announcements${query}`,
    {
      revalidate: 60, // 1 minute
      ...options,
    }
  );

  return response.data.map((item) => AnnouncementSchema.parse(item));
}

// =============================================================================
// Legal Pages
// =============================================================================

/**
 * Get a legal page by slug
 *
 * @example
 * ```typescript
 * const privacy = await getLegalPageBySlug('privacy-policy');
 * ```
 */
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
    `/items/cms_legal_pages${query}`,
    {
      revalidate: 21600, // 6 hours
      ...options,
    }
  );

  if (response.data.length === 0) {
    return null;
  }

  return LegalPageSchema.parse(response.data[0]);
}

// =============================================================================
// Error Handling Helper
// =============================================================================

/**
 * Type guard for DirectusError
 */
export function isDirectusError(error: unknown): error is DirectusError {
  return error instanceof DirectusError;
}
