#!/usr/bin/env tsx

/**
 * Configure Directus Collections for CMS Tables
 *
 * This script configures the 6 CMS collections in Directus:
 * - cms_blog_posts
 * - cms_docs_pages
 * - cms_homepage_hero
 * - cms_features
 * - cms_announcements
 * - cms_legal_pages
 *
 * It sets up:
 * - Display templates
 * - Field interfaces (WYSIWYG, dropdowns, etc.)
 * - Collection icons and metadata
 */

import { createDirectus, rest, authentication, readCollections, updateCollection, updateField } from '@directus/sdk';

// Directus connection
const DIRECTUS_URL = process.env.DIRECTUS_URL || 'https://admin.automatonicai.com';
const ADMIN_EMAIL = process.env.DIRECTUS_ADMIN_EMAIL!;
const ADMIN_PASSWORD = process.env.DIRECTUS_ADMIN_PASSWORD!;

const client = createDirectus(DIRECTUS_URL)
  .with(authentication())
  .with(rest());

async function main() {
  console.log('🔐 Authenticating with Directus...');

  try {
    await client.login({
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD,
    });
    console.log('✅ Authenticated successfully\n');
  } catch (error) {
    console.error('❌ Authentication failed:', error);
    process.exit(1);
  }

  // Get all collections to verify CMS tables are introspected
  console.log('📋 Checking for CMS collections...');
  const collections = await client.request(readCollections());

  const cmsCollections = collections.filter((c: any) => c.collection?.startsWith('cms_'));
  console.log(`Found ${cmsCollections.length} CMS collections:\n`);
  cmsCollections.forEach((c: any) => console.log(`  - ${c.collection}`));
  console.log();

  // Configure cms_blog_posts
  console.log('📝 Configuring cms_blog_posts...');
  await client.request(
    updateCollection('cms_blog_posts', {
      meta: {
        icon: 'article',
        display_template: '{{title}}',
        note: 'Blog articles with SEO, categories, and tags',
        sort_field: 'published_at',
        archive_field: 'status',
        archive_value: 'archived',
      },
    })
  );

  // Configure field interfaces for cms_blog_posts
  await configureField('cms_blog_posts', 'content', {
    interface: 'input-rich-text-html',
    options: { toolbar: ['bold', 'italic', 'underline', 'h1', 'h2', 'h3', 'ul', 'ol', 'link', 'code', 'blockquote'] },
  });

  await configureField('cms_blog_posts', 'status', {
    interface: 'select-dropdown',
    options: {
      choices: [
        { text: 'Draft', value: 'draft' },
        { text: 'Published', value: 'published' },
        { text: 'Archived', value: 'archived' },
      ],
    },
  });

  await configureField('cms_blog_posts', 'featured', {
    interface: 'boolean',
    display: 'boolean',
  });

  console.log('✅ cms_blog_posts configured\n');

  // Configure cms_docs_pages
  console.log('📚 Configuring cms_docs_pages...');
  await client.request(
    updateCollection('cms_docs_pages', {
      meta: {
        icon: 'menu_book',
        display_template: '{{title}}',
        note: 'Hierarchical documentation pages and standalone content pages (About, Solutions, etc.)',
        sort_field: 'sort_order',
      },
    })
  );

  await configureField('cms_docs_pages', 'content', {
    interface: 'input-rich-text-html',
    options: { toolbar: ['bold', 'italic', 'underline', 'h1', 'h2', 'h3', 'ul', 'ol', 'link', 'code', 'blockquote'] },
  });

  await configureField('cms_docs_pages', 'status', {
    interface: 'select-dropdown',
    options: {
      choices: [
        { text: 'Draft', value: 'draft' },
        { text: 'Published', value: 'published' },
      ],
    },
  });

  await configureField('cms_docs_pages', 'parent_id', {
    interface: 'select-dropdown-m2o',
    display: 'related-values',
    options: {
      template: '{{title}}',
    },
  });

  console.log('✅ cms_docs_pages configured\n');

  // Configure cms_homepage_hero
  console.log('🏠 Configuring cms_homepage_hero...');
  await client.request(
    updateCollection('cms_homepage_hero', {
      meta: {
        icon: 'home',
        display_template: '{{headline}}',
        note: 'Homepage hero section configuration',
        singleton: true, // Only one hero section
      },
    })
  );

  await configureField('cms_homepage_hero', 'background_image', {
    interface: 'file-image',
    display: 'image',
  });

  console.log('✅ cms_homepage_hero configured\n');

  // Configure cms_features
  console.log('⭐ Configuring cms_features...');
  await client.request(
    updateCollection('cms_features', {
      meta: {
        icon: 'stars',
        display_template: '{{title}}',
        note: 'Product features for homepage and marketing pages',
        sort_field: 'sort_order',
      },
    })
  );

  await configureField('cms_features', 'status', {
    interface: 'select-dropdown',
    options: {
      choices: [
        { text: 'Draft', value: 'draft' },
        { text: 'Published', value: 'published' },
      ],
    },
  });

  console.log('✅ cms_features configured\n');

  // Configure cms_announcements
  console.log('📢 Configuring cms_announcements...');
  await client.request(
    updateCollection('cms_announcements', {
      meta: {
        icon: 'campaign',
        display_template: '{{message}}',
        note: 'Site-wide announcements and notifications',
        sort_field: 'priority',
      },
    })
  );

  await configureField('cms_announcements', 'type', {
    interface: 'select-dropdown',
    options: {
      choices: [
        { text: 'Info', value: 'info' },
        { text: 'Success', value: 'success' },
        { text: 'Warning', value: 'warning' },
        { text: 'Error', value: 'error' },
      ],
    },
  });

  await configureField('cms_announcements', 'active', {
    interface: 'boolean',
    display: 'boolean',
  });

  console.log('✅ cms_announcements configured\n');

  // Configure cms_legal_pages
  console.log('⚖️  Configuring cms_legal_pages...');
  await client.request(
    updateCollection('cms_legal_pages', {
      meta: {
        icon: 'gavel',
        display_template: '{{title}} (v{{version}})',
        note: 'Legal documents with versioning (Terms, Privacy Policy, etc.)',
        sort_field: 'effective_date',
      },
    })
  );

  await configureField('cms_legal_pages', 'content', {
    interface: 'input-rich-text-html',
    options: { toolbar: ['bold', 'italic', 'underline', 'h1', 'h2', 'h3', 'ul', 'ol', 'link'] },
  });

  await configureField('cms_legal_pages', 'status', {
    interface: 'select-dropdown',
    options: {
      choices: [
        { text: 'Draft', value: 'draft' },
        { text: 'Published', value: 'published' },
        { text: 'Archived', value: 'archived' },
      ],
    },
  });

  console.log('✅ cms_legal_pages configured\n');

  console.log('🎉 All collections configured successfully!');
}

async function configureField(collection: string, field: string, meta: any) {
  try {
    await client.request(
      updateField(collection, field, { meta })
    );
  } catch (error: any) {
    console.warn(`  ⚠️  Could not configure field ${collection}.${field}: ${error.message}`);
  }
}

// Run the script
main().catch(console.error);
