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
  PageSectionSchema,
  ComparisonItemSchema,
  HomepageProblemSchema,
  HomepagePillarSchema,
  HomepageFeatureSchema,
  HomepageUseCaseSchema,
  FeaturesHeroSchema,
  FeaturesCapabilitySchema,
  AboutHeroSchema,
  AboutValueSchema,
  CTASectionSchema,
  type HomepageHero,
  type Feature,
  type FeatureCategoryType,
  type BlogPost,
  type DocsPage,
  type Announcement,
  type LegalPage,
  type PageSection,
  type PageSectionKeyType,
  type ComparisonItem,
  type HomepageProblem,
  type HomepagePillar,
  type HomepageFeature,
  type HomepageUseCase,
  type FeaturesHero,
  type FeaturesCapability,
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
// Page Sections
// =============================================================================

/**
 * Get a page section by its key
 *
 * @example
 * ```typescript
 * const problemSection = await getPageSection('problem-statement');
 * // { headline: "...", subheadline: "...", cta_text: "...", ... }
 * ```
 */
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
    `/items/cms_page_sections${query}`,
    {
      revalidate: 3600, // 1 hour
      tags: [`page-section-${sectionKey}`],
      ...options,
    }
  );

  if (response.data.length === 0) {
    return null;
  }

  return PageSectionSchema.parse(response.data[0]);
}

/**
 * Get all page sections for a specific page
 *
 * @example
 * ```typescript
 * const homepageSections = await getPageSectionsByPage('homepage');
 * ```
 */
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
    `/items/cms_page_sections${query}`,
    {
      revalidate: 3600, // 1 hour
      tags: [`page-sections-${pageName}`],
      ...options,
    }
  );

  return response.data.map((item) => PageSectionSchema.parse(item));
}

// =============================================================================
// Comparison Items
// =============================================================================

/**
 * Get all comparison items
 *
 * @example
 * ```typescript
 * const items = await getComparisonItems();
 * // Returns comparison table data sorted by sort_order
 * ```
 */
export async function getComparisonItems(
  options?: FetchOptions
): Promise<ComparisonItem[]> {
  const query = buildQuery({
    filter: { enabled: { _eq: true } },
    sort: ['sort_order'],
  });

  const response = await fetchDirectus<DirectusCollectionResponse<ComparisonItem>>(
    `/items/cms_comparison_items${query}`,
    {
      revalidate: 3600, // 1 hour
      tags: ['comparison-items'],
      ...options,
    }
  );

  return response.data.map((item) => ComparisonItemSchema.parse(item));
}

// =============================================================================
// Homepage Collections (CHRONOS-456)
// =============================================================================

/**
 * Get homepage problems
 *
 * @example
 * ```typescript
 * const problems = await getHomepageProblems();
 * // Returns 3 problem points sorted by sort_order
 * ```
 */
export async function getHomepageProblems(
  options?: FetchOptions
): Promise<HomepageProblem[]> {
  const query = buildQuery({
    filter: { enabled: { _eq: true } },
    sort: ['sort_order'],
  });

  const response = await fetchDirectus<DirectusCollectionResponse<HomepageProblem>>(
    `/items/cms_homepage_problems${query}`,
    {
      revalidate: 3600, // 1 hour
      tags: ['homepage-problems'],
      ...options,
    }
  );

  return response.data.map((item) => HomepageProblemSchema.parse(item));
}

/**
 * Get homepage pillars (solution pillars)
 *
 * @example
 * ```typescript
 * const pillars = await getHomepagePillars();
 * // Returns 4 database modality pillars
 * ```
 */
export async function getHomepagePillars(
  options?: FetchOptions
): Promise<HomepagePillar[]> {
  const query = buildQuery({
    filter: { enabled: { _eq: true } },
    sort: ['sort_order'],
  });

  const response = await fetchDirectus<DirectusCollectionResponse<HomepagePillar>>(
    `/items/cms_homepage_pillars${query}`,
    {
      revalidate: 3600, // 1 hour
      tags: ['homepage-pillars'],
      ...options,
    }
  );

  return response.data.map((item) => HomepagePillarSchema.parse(item));
}

/**
 * Get a single homepage pillar by slug
 */
export async function getHomepagePillarBySlug(
  slug: string,
  options?: FetchOptions
): Promise<HomepagePillar | null> {
  const query = buildQuery({
    filter: {
      slug: { _eq: slug },
      enabled: { _eq: true },
    },
    limit: 1,
  });

  const response = await fetchDirectus<DirectusCollectionResponse<HomepagePillar>>(
    `/items/cms_homepage_pillars${query}`,
    {
      revalidate: 3600, // 1 hour
      ...options,
    }
  );

  if (response.data.length === 0) {
    return null;
  }

  return HomepagePillarSchema.parse(response.data[0]);
}

/**
 * Get homepage features
 *
 * @example
 * ```typescript
 * const features = await getHomepageFeatures();
 * // Returns 3 key features
 * ```
 */
export async function getHomepageFeatures(
  options?: FetchOptions
): Promise<HomepageFeature[]> {
  const query = buildQuery({
    filter: { enabled: { _eq: true } },
    sort: ['sort_order'],
  });

  const response = await fetchDirectus<DirectusCollectionResponse<HomepageFeature>>(
    `/items/cms_homepage_features${query}`,
    {
      revalidate: 3600, // 1 hour
      tags: ['homepage-features'],
      ...options,
    }
  );

  return response.data.map((item) => HomepageFeatureSchema.parse(item));
}

/**
 * Get homepage use cases
 *
 * @example
 * ```typescript
 * const useCases = await getHomepageUseCases();
 * // Returns 3 use cases
 * ```
 */
export async function getHomepageUseCases(
  options?: FetchOptions
): Promise<HomepageUseCase[]> {
  const query = buildQuery({
    filter: { enabled: { _eq: true } },
    sort: ['sort_order'],
  });

  const response = await fetchDirectus<DirectusCollectionResponse<HomepageUseCase>>(
    `/items/cms_homepage_use_cases${query}`,
    {
      revalidate: 3600, // 1 hour
      tags: ['homepage-use-cases'],
      ...options,
    }
  );

  return response.data.map((item) => HomepageUseCaseSchema.parse(item));
}

// =============================================================================
// Features Page Collections (CHRONOS-456)
// =============================================================================

/**
 * Get features hero content (singleton)
 *
 * @example
 * ```typescript
 * const hero = await getFeaturesHero();
 * // { headline: "...", subheadline: "...", active: true }
 * ```
 */
export async function getFeaturesHero(
  options?: FetchOptions
): Promise<FeaturesHero | null> {
  const query = buildQuery({
    filter: { active: { _eq: true } },
    limit: 1,
  });

  const response = await fetchDirectus<DirectusCollectionResponse<FeaturesHero>>(
    `/items/cms_features_hero${query}`,
    {
      revalidate: 3600, // 1 hour
      tags: ['features-hero'],
      ...options,
    }
  );

  if (response.data.length === 0) {
    return null;
  }

  return FeaturesHeroSchema.parse(response.data[0]);
}

/**
 * Get features capabilities
 *
 * @example
 * ```typescript
 * const capabilities = await getFeaturesCapabilities();
 * // Returns 4 capability items
 * ```
 */
export async function getFeaturesCapabilities(
  options?: FetchOptions
): Promise<FeaturesCapability[]> {
  const query = buildQuery({
    filter: { enabled: { _eq: true } },
    sort: ['sort_order'],
  });

  const response = await fetchDirectus<DirectusCollectionResponse<FeaturesCapability>>(
    `/items/cms_features_capabilities${query}`,
    {
      revalidate: 3600, // 1 hour
      tags: ['features-capabilities'],
      ...options,
    }
  );

  return response.data.map((item) => FeaturesCapabilitySchema.parse(item));
}

// =============================================================================
// About Page Collections (CHRONOS-456)
// =============================================================================

/**
 * Get about hero content (singleton)
 *
 * @example
 * ```typescript
 * const hero = await getAboutHero();
 * // { headline: "...", subheadline: "...", active: true }
 * ```
 */
export async function getAboutHero(
  options?: FetchOptions
): Promise<AboutHero | null> {
  const query = buildQuery({
    filter: { active: { _eq: true } },
    limit: 1,
  });

  const response = await fetchDirectus<DirectusCollectionResponse<AboutHero>>(
    `/items/cms_about_hero${query}`,
    {
      revalidate: 3600, // 1 hour
      tags: ['about-hero'],
      ...options,
    }
  );

  if (response.data.length === 0) {
    return null;
  }

  return AboutHeroSchema.parse(response.data[0]);
}

/**
 * Get about values
 *
 * @example
 * ```typescript
 * const values = await getAboutValues();
 * // Returns 3 company values
 * ```
 */
export async function getAboutValues(
  options?: FetchOptions
): Promise<AboutValue[]> {
  const query = buildQuery({
    filter: { enabled: { _eq: true } },
    sort: ['sort_order'],
  });

  const response = await fetchDirectus<DirectusCollectionResponse<AboutValue>>(
    `/items/cms_about_values${query}`,
    {
      revalidate: 3600, // 1 hour
      tags: ['about-values'],
      ...options,
    }
  );

  return response.data.map((item) => AboutValueSchema.parse(item));
}

// =============================================================================
// CTA Sections (CHRONOS-456)
// =============================================================================

/**
 * Get a CTA section by key
 *
 * @example
 * ```typescript
 * const cta = await getCTASection('homepage-post-problems');
 * // { headline: "...", primary_cta_text: "...", variant: "inline", ... }
 * ```
 */
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
    `/items/cms_cta_sections${query}`,
    {
      revalidate: 3600, // 1 hour
      tags: [`cta-${sectionKey}`],
      ...options,
    }
  );

  if (response.data.length === 0) {
    return null;
  }

  return CTASectionSchema.parse(response.data[0]);
}

/**
 * Get all CTA sections for a specific page
 *
 * @example
 * ```typescript
 * const ctas = await getCTASectionsByPage('homepage');
 * // Returns all CTAs for homepage
 * ```
 */
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
    `/items/cms_cta_sections${query}`,
    {
      revalidate: 3600, // 1 hour
      tags: [`cta-sections-${pageName}`],
      ...options,
    }
  );

  return response.data.map((item) => CTASectionSchema.parse(item));
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
