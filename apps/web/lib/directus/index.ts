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
  FeatureCategory,
  type HomepageHero,
  type Feature,
  type FeatureCategoryType,
  type BlogPost,
  type DocsPage,
  type Announcement,
  type LegalPage,
  type WaitlistSubmission,
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
  isDirectusError,
} from './collections';
