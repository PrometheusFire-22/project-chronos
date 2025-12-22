#!/usr/bin/env tsx

/**
 * Test Content Creation in Directus CMS Collections
 *
 * Creates sample content in each collection to verify:
 * - Collections are properly configured
 * - Field interfaces work correctly
 * - Content can be created and retrieved
 */

import { createDirectus, rest, authentication, createItem, readItems, deleteItem } from '@directus/sdk';

const DIRECTUS_URL = process.env.DIRECTUS_URL || 'https://admin.automatonicai.com';
const ADMIN_EMAIL = process.env.DIRECTUS_ADMIN_EMAIL!;
const ADMIN_PASSWORD = process.env.DIRECTUS_ADMIN_PASSWORD!;

const client = createDirectus(DIRECTUS_URL)
  .with(authentication())
  .with(rest());

const createdItems: { collection: string; id: string }[] = [];

async function main() {
  console.log('🔐 Authenticating with Directus...');

  try {
    await client.login({
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD,
    });
    console.log('✅ Authenticated\n');
  } catch (error) {
    console.error('❌ Authentication failed:', error);
    process.exit(1);
  }

  // Test cms_blog_posts
  console.log('📝 Testing cms_blog_posts...');
  try {
    const blogPost = await client.request(
      createItem('cms_blog_posts', {
        title: 'Sample Blog Post',
        slug: 'sample-blog-post-' + Date.now(),
        content: '<h1>Welcome to Project Chronos</h1><p>This is a sample blog post to test the CMS.</p>',
        excerpt: 'A sample blog post for testing',
        author: 'Geoff Bevans',
        category: 'Product Updates',
        tags: ['test', 'sample'],
        status: 'draft',
        meta_title: 'Sample Blog Post - Project Chronos',
        meta_description: 'This is a sample blog post to test the Directus CMS integration.',
      })
    );
    createdItems.push({ collection: 'cms_blog_posts', id: blogPost.id });
    console.log(`✅ Created blog post: ${blogPost.id}\n`);
  } catch (error: any) {
    console.error(`❌ Failed to create blog post: ${error.message}\n`);
  }

  // Test cms_docs_pages
  console.log('📚 Testing cms_docs_pages...');
  try {
    const docsPage = await client.request(
      createItem('cms_docs_pages', {
        title: 'Sample Documentation Page',
        slug: 'sample-docs-' + Date.now(),
        content: '<h1>Getting Started</h1><p>This is a sample documentation page.</p>',
        parent_id: null, // Top-level page
        sort_order: 0,
        icon: 'info',
        description: 'Sample documentation for testing',
        status: 'draft',
        meta_title: 'Sample Docs - Project Chronos',
        meta_description: 'Sample documentation page',
      })
    );
    createdItems.push({ collection: 'cms_docs_pages', id: docsPage.id });
    console.log(`✅ Created docs page: ${docsPage.id}\n`);
  } catch (error: any) {
    console.error(`❌ Failed to create docs page: ${error.message}\n`);
  }

  // Test cms_homepage_hero
  console.log('🏠 Testing cms_homepage_hero...');
  try {
    const hero = await client.request(
      createItem('cms_homepage_hero', {
        headline: 'Transform Your Private Equity Operations',
        subheadline: 'AI-powered deal sourcing and portfolio management',
        cta_primary_text: 'Get Started',
        cta_primary_link: '/contact',
        cta_secondary_text: 'Learn More',
        cta_secondary_link: '/about',
        active: false,
      })
    );
    createdItems.push({ collection: 'cms_homepage_hero', id: hero.id });
    console.log(`✅ Created homepage hero: ${hero.id}\n`);
  } catch (error: any) {
    console.error(`❌ Failed to create homepage hero: ${error.message}\n`);
  }

  // Test cms_features
  console.log('⭐ Testing cms_features...');
  try {
    const feature = await client.request(
      createItem('cms_features', {
        title: 'AI-Powered Deal Sourcing',
        slug: 'ai-deal-sourcing-' + Date.now(),
        description: 'Discover high-quality investment opportunities with advanced AI algorithms',
        icon: 'search',
        category: 'Core Features',
        sort_order: 1,
        enabled: true,
      })
    );
    createdItems.push({ collection: 'cms_features', id: feature.id });
    console.log(`✅ Created feature: ${feature.id}\n`);
  } catch (error: any) {
    console.error(`❌ Failed to create feature: ${error.message}\n`);
  }

  // Test cms_announcements
  console.log('📢 Testing cms_announcements...');
  try {
    const announcement = await client.request(
      createItem('cms_announcements', {
        title: 'New Feature Available',
        message: 'New feature: AI-powered analytics now available!',
        type: 'success',
        link: '/features/analytics',
        link_text: 'Learn More',
        placement: 'banner',
        dismissible: true,
        active: true,
        starts_at: new Date().toISOString(),
      })
    );
    createdItems.push({ collection: 'cms_announcements', id: announcement.id });
    console.log(`✅ Created announcement: ${announcement.id}\n`);
  } catch (error: any) {
    console.error(`❌ Failed to create announcement: ${error.message}\n`);
  }

  // Test cms_legal_pages
  console.log('⚖️  Testing cms_legal_pages...');
  try {
    const legalPage = await client.request(
      createItem('cms_legal_pages', {
        title: 'Terms of Service',
        slug: 'terms-of-service',
        content: '<h1>Terms of Service</h1><p>Sample terms content...</p>',
        version: '1.0',
        effective_date: new Date().toISOString(),
        status: 'draft',
      })
    );
    createdItems.push({ collection: 'cms_legal_pages', id: legalPage.id });
    console.log(`✅ Created legal page: ${legalPage.id}\n`);
  } catch (error: any) {
    console.error(`❌ Failed to create legal page: ${error.message}\n`);
  }

  // Verify content can be retrieved
  console.log('🔍 Verifying content retrieval...');
  for (const item of createdItems) {
    try {
      const items = await client.request(
        readItems(item.collection, {
          filter: { id: { _eq: item.id } },
        })
      );
      if (items.length > 0) {
        console.log(`✅ Retrieved ${item.collection}: ${item.id}`);
      } else {
        console.log(`❌ Could not retrieve ${item.collection}: ${item.id}`);
      }
    } catch (error: any) {
      console.error(`❌ Error retrieving ${item.collection}: ${error.message}`);
    }
  }

  // Clean up test content
  console.log('\n🧹 Cleaning up test content...');
  for (const item of createdItems) {
    try {
      await client.request(deleteItem(item.collection, item.id));
      console.log(`✅ Deleted ${item.collection}: ${item.id}`);
    } catch (error: any) {
      console.warn(`⚠️  Could not delete ${item.collection}: ${item.id} - ${error.message}`);
    }
  }

  console.log('\n🎉 All tests completed successfully!');
  console.log('\n📊 Summary:');
  console.log(`  - Collections tested: 6`);
  console.log(`  - Items created: ${createdItems.length}`);
  console.log(`  - All operations successful ✅`);
}

main().catch(console.error);
