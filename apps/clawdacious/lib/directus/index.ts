/**
 * Directus CMS Client for Clawdacious
 */

// Client
export { fetchDirectus, buildQuery, DirectusError, type FetchOptions } from './client';

// Types
export {
  HomepageHeroSchema,
  BlogPostSchema,
  AnnouncementSchema,
  LegalPageSchema,
  PageSectionSchema,
  HomepageFeatureSchema,
  AboutHeroSchema,
  AboutValueSchema,
  CTASectionSchema,
  PageSectionKey,
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

// Collections
export {
  getHomepageHero,
  getHomepageFeatures,
  getBlogPosts,
  getBlogPostBySlug,
  getFeaturedBlogPosts,
  getActiveAnnouncements,
  getLegalPageBySlug,
  getPageSection,
  getPageSectionsByPage,
  getAboutHero,
  getAboutValues,
  getCTASection,
  getCTASectionsByPage,
  isDirectusError,
} from './collections';
