/**
 * Directus Collection Types for Clawdacious
 *
 * Zod schemas for runtime validation and TypeScript type generation.
 * These schemas match the claw_* collections in Directus.
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
// Homepage Features
// =============================================================================

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

export const PageSectionKey = {
  ABOUT_STORY: 'about-story',
} as const;

export type PageSectionKeyType = (typeof PageSectionKey)[keyof typeof PageSectionKey];

// =============================================================================
// About Page Collections
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
// CTA Sections
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
// Contact Submissions
// =============================================================================

export const ContactSubmissionSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  email: z.string().email(),
  company: z.string().nullable(),
  subject: z.string(),
  message: z.string(),
  status: z.enum(['new', 'contacted', 'qualified', 'closed']),
  source: z.string().nullable(),
  ip_address: z.string().nullable(),
  twenty_person_id: z.string().nullable(),
  twenty_company_id: z.string().nullable(),
  twenty_opportunity_id: z.string().nullable(),
  email_sent: z.boolean(),
  notes: z.string().nullable(),
  date_created: z.string().datetime(),
  date_updated: z.string().datetime().nullable(),
});

export type ContactSubmission = z.infer<typeof ContactSubmissionSchema>;

// =============================================================================
// Directus API Response Wrappers
// =============================================================================

export type DirectusSingleResponse<T> = {
  data: T;
};

export type DirectusCollectionResponse<T> = {
  data: T[];
};

export type DirectusPaginatedResponse<T> = {
  data: T[];
  meta: {
    total_count: number;
    filter_count: number;
  };
};
