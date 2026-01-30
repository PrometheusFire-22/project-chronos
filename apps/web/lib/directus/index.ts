/**
 * Directus CMS Client
 *
 * Centralized exports for Directus integration.
 */

// Client
export { fetchDirectus, buildQuery, DirectusError, type FetchOptions } from './client';

// Types
export {
  HomepageHeroSchema,
  FeatureSchema,
  BlogPostSchema,
  DocsPageSchema,
  AnnouncementSchema,
  LegalPageSchema,
  WaitlistSubmissionSchema,
  PageSectionSchema,
  ComparisonItemSchema,
  DirectusPageSchema,
  ContentBlockSchema,
  HeroBlockSchema,
  FeaturesGridBlockSchema,
  FeatureCategory,
  PageSectionKey,
  type HomepageHero,
  type Feature,
  type FeatureCategoryType,
  type BlogPost,
  type DocsPage,
  type Announcement,
  type LegalPage,
  type WaitlistSubmission,
  type PageSection,
  type PageSectionKeyType,
  type ComparisonItem,
  type DirectusPage,
  type ContentBlock,
  type HeroBlock,
  type FeaturesGridBlock,
  type DirectusSingleResponse,
  type DirectusCollectionResponse,
  type DirectusPaginatedResponse,
} from './types';

// Collections
export {
  getHomepageHero,
  getFeaturesByCategory,
  getFeatureBySlug,
  getAllFeatures,
  getBlogPosts,
  getBlogPostBySlug,
  getFeaturedBlogPosts,
  getDocsPages,
  getDocsPageBySlug,
  getActiveAnnouncements,
  getLegalPageBySlug,
  getPageSection,
  getPageSectionsByPage,
  getComparisonItems,
  // New collections (CHRONOS-456)
  getHomepageProblems,
  getHomepagePillars,
  getHomepagePillarBySlug,
  getHomepageFeatures,
  getHomepageUseCases,
  getFeaturesHero,
  getFeaturesCapabilities,
  getAboutHero,
  getAboutValues,
  getCTASection,
  getCTASectionsByPage,
  // CMS Pages (CHRONOS-459)
  getPageBySlug,
  getAllPages,
  getAllPageSlugs,
  isDirectusError,
} from './collections';
