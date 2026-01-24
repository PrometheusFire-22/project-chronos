/**
 * Directus Collection Types
 *
 * Zod schemas for runtime validation and TypeScript type generation.
 * These schemas match the CMS tables defined in packages/database/src/schema/cms.ts
 */

import { z } from 'zod';

// =============================================================================
// Homepage Hero (Singleton)
// =============================================================================

export const HomepageHeroSchema = z.object({
  id: z.string().uuid(),
  headline: z.string(),
  subheadline: z.string().nullable(),
  cta_primary_text: z.string(),
  cta_primary_link: z.string(),
  cta_secondary_text: z.string().nullable(),
  cta_secondary_link: z.string().nullable(),
  background_image: z.string().nullable(),
  background_video: z.string().nullable(),
  active: z.boolean(),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
});

export type HomepageHero = z.infer<typeof HomepageHeroSchema>;

// =============================================================================
// Features
// =============================================================================

export const FeatureSchema = z.object({
  id: z.string().uuid(),
  title: z.string(),
  slug: z.string(),
  description: z.string(),
  icon: z.string().nullable(),
  image: z.string().nullable(),
  category: z.string().nullable(),
  sort_order: z.number().int(),
  enabled: z.boolean(),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
});

export type Feature = z.infer<typeof FeatureSchema>;

/**
 * Feature categories used in the CMS
 */
export const FeatureCategory = {
  PROBLEM_POINT: 'problem-point',
  SOLUTION_PILLAR: 'solution-pillar',
  KEY_FEATURE: 'key-feature',
  USE_CASE: 'use-case',
  FEATURES_DETAIL: 'features-detail',
  ABOUT_SECTION: 'about-section',
} as const;

export type FeatureCategoryType = (typeof FeatureCategory)[keyof typeof FeatureCategory];

// =============================================================================
// Blog Posts
// =============================================================================

export const BlogPostSchema = z.object({
  id: z.string().uuid(),
  title: z.string(),
  slug: z.string(),
  excerpt: z.string().nullable(),
  content: z.string(),
  featured_image: z.string().nullable(),
  author: z.string(),
  category: z.string().nullable(),
  tags: z.array(z.string()).default([]),
  meta_title: z.string().nullable(),
  meta_description: z.string().nullable(),
  og_image: z.string().nullable(),
  status: z.enum(['draft', 'published', 'archived']),
  published_at: z.string().datetime().nullable(),
  featured: z.boolean(),
  read_time_minutes: z.number().int().nullable(),
  view_count: z.number().int(),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
});

export type BlogPost = z.infer<typeof BlogPostSchema>;

// =============================================================================
// Documentation Pages
// =============================================================================

export const DocsPageSchema = z.object({
  id: z.string().uuid(),
  title: z.string(),
  slug: z.string(),
  content: z.string(),
  parent_id: z.string().uuid().nullable(),
  sort_order: z.number().int(),
  icon: z.string().nullable(),
  description: z.string().nullable(),
  meta_title: z.string().nullable(),
  meta_description: z.string().nullable(),
  status: z.enum(['draft', 'published', 'archived']),
  published_at: z.string().datetime().nullable(),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
});

export type DocsPage = z.infer<typeof DocsPageSchema>;

// =============================================================================
// Announcements
// =============================================================================

export const AnnouncementSchema = z.object({
  id: z.string().uuid(),
  title: z.string(),
  message: z.string(),
  link: z.string().nullable(),
  link_text: z.string().nullable(),
  type: z.enum(['info', 'warning', 'success', 'error']),
  placement: z.enum(['banner', 'modal', 'toast']),
  dismissible: z.boolean(),
  starts_at: z.string().datetime().nullable(),
  ends_at: z.string().datetime().nullable(),
  active: z.boolean(),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
});

export type Announcement = z.infer<typeof AnnouncementSchema>;

// =============================================================================
// Legal Pages
// =============================================================================

export const LegalPageSchema = z.object({
  id: z.string().uuid(),
  title: z.string(),
  slug: z.string(),
  content: z.string(),
  version: z.string(),
  effective_date: z.string().datetime(),
  status: z.enum(['draft', 'published', 'archived']),
  published_at: z.string().datetime().nullable(),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
});

export type LegalPage = z.infer<typeof LegalPageSchema>;

// =============================================================================
// Waitlist Submissions
// =============================================================================

export const WaitlistSubmissionSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  first_name: z.string(),
  last_name: z.string(),
  company: z.string().nullable(),
  role: z.string().nullable(),
  heard_from: z.string().nullable(),
  source: z.string(),
  utm_source: z.string().nullable(),
  utm_medium: z.string().nullable(),
  utm_campaign: z.string().nullable(),
  status: z.enum(['pending', 'contacted', 'invited', 'archived']),
  email_sent: z.boolean(),
  notes: z.string().nullable(),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
});

export type WaitlistSubmission = z.infer<typeof WaitlistSubmissionSchema>;

// =============================================================================
// Page Sections
// =============================================================================

export const PageSectionSchema = z.object({
  id: z.string().uuid(),
  section_key: z.string(),
  page_name: z.string(),
  headline: z.string(),
  subheadline: z.string().nullable(),
  cta_text: z.string().nullable(),
  cta_link: z.string().nullable(),
  enabled: z.boolean(),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
});

export type PageSection = z.infer<typeof PageSectionSchema>;

/**
 * Page section keys used in the CMS
 */
export const PageSectionKey = {
  PROBLEM_STATEMENT: 'problem-statement',
  SOLUTION_PILLARS: 'solution-pillars',
  FEATURES_PREVIEW: 'features-preview',
  USE_CASES: 'use-cases',
  FEATURE_COMPARISON: 'feature-comparison',
  ABOUT_STORY: 'about-story',
} as const;

export type PageSectionKeyType = (typeof PageSectionKey)[keyof typeof PageSectionKey];

// =============================================================================
// Comparison Items
// =============================================================================

export const ComparisonItemSchema = z.object({
  id: z.string().uuid(),
  category: z.string(),
  chronos_value: z.string(),
  traditional_value: z.string(),
  sort_order: z.number().int(),
  enabled: z.boolean(),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
});

export type ComparisonItem = z.infer<typeof ComparisonItemSchema>;

// =============================================================================
// Homepage Collections (CHRONOS-454/455)
// =============================================================================

export const HomepageProblemSchema = z.object({
  id: z.string().uuid(),
  title: z.string(),
  description: z.string(),
  icon: z.string().nullable(),
  sort_order: z.number().int(),
  enabled: z.boolean(),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
});

export type HomepageProblem = z.infer<typeof HomepageProblemSchema>;

export const HomepagePillarSchema = z.object({
  id: z.string().uuid(),
  title: z.string(),
  slug: z.string(),
  description: z.string(),
  icon: z.string().nullable(),
  image: z.string().nullable(),
  sort_order: z.number().int(),
  enabled: z.boolean(),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
});

export type HomepagePillar = z.infer<typeof HomepagePillarSchema>;

export const HomepageFeatureSchema = z.object({
  id: z.string().uuid(),
  title: z.string(),
  description: z.string(),
  icon: z.string().nullable(),
  sort_order: z.number().int(),
  enabled: z.boolean(),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
});

export type HomepageFeature = z.infer<typeof HomepageFeatureSchema>;

export const HomepageUseCaseSchema = z.object({
  id: z.string().uuid(),
  title: z.string(),
  description: z.string(),
  icon: z.string().nullable(),
  sort_order: z.number().int(),
  enabled: z.boolean(),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
});

export type HomepageUseCase = z.infer<typeof HomepageUseCaseSchema>;

// =============================================================================
// Features Page Collections (CHRONOS-454/455)
// =============================================================================

export const FeaturesHeroSchema = z.object({
  id: z.string().uuid(),
  headline: z.string(),
  subheadline: z.string().nullable(),
  active: z.boolean(),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
});

export type FeaturesHero = z.infer<typeof FeaturesHeroSchema>;

export const FeaturesCapabilitySchema = z.object({
  id: z.string().uuid(),
  title: z.string(),
  description: z.string(),
  icon: z.string().nullable(),
  image: z.string().nullable(),
  sort_order: z.number().int(),
  enabled: z.boolean(),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
});

export type FeaturesCapability = z.infer<typeof FeaturesCapabilitySchema>;

// =============================================================================
// About Page Collections (CHRONOS-454/455)
// =============================================================================

export const AboutHeroSchema = z.object({
  id: z.string().uuid(),
  headline: z.string(),
  subheadline: z.string().nullable(),
  active: z.boolean(),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
});

export type AboutHero = z.infer<typeof AboutHeroSchema>;

export const AboutValueSchema = z.object({
  id: z.string().uuid(),
  title: z.string(),
  description: z.string(),
  icon: z.string().nullable(),
  sort_order: z.number().int(),
  enabled: z.boolean(),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
});

export type AboutValue = z.infer<typeof AboutValueSchema>;

// =============================================================================
// CTA Sections (CHRONOS-454/455)
// =============================================================================

export const CTASectionSchema = z.object({
  id: z.string().uuid(),
  section_key: z.string(),
  page_name: z.string(),
  placement: z.string(),
  headline: z.string(),
  subheadline: z.string().nullable(),
  primary_cta_text: z.string(),
  primary_cta_link: z.string(),
  secondary_cta_text: z.string().nullable(),
  secondary_cta_link: z.string().nullable(),
  variant: z.enum(['inline', 'banner', 'full']),
  enabled: z.boolean(),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
});

export type CTASection = z.infer<typeof CTASectionSchema>;

// =============================================================================
// Directus API Response Wrappers
// =============================================================================

/**
 * Directus wraps single items in { data: T }
 */
export type DirectusSingleResponse<T> = {
  data: T;
};

/**
 * Directus wraps collections in { data: T[] }
 */
export type DirectusCollectionResponse<T> = {
  data: T[];
};

/**
 * Directus paginated response includes meta
 */
export type DirectusPaginatedResponse<T> = {
  data: T[];
  meta: {
    total_count: number;
    filter_count: number;
  };
};
