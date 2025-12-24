#!/usr/bin/env tsx

/**
 * Register CMS Collections in Directus
 *
 * This script registers the CMS tables with Directus so they can be accessed via the API.
 * Directus doesn't automatically expose all PostgreSQL tables - they need to be registered.
 */

import fetch from 'node-fetch';

const DIRECTUS_URL = process.env.DIRECTUS_URL || 'https://admin.automatonicai.com';
const ADMIN_EMAIL = process.env.DIRECTUS_ADMIN_EMAIL || 'geoff@automatonicai.com';
const ADMIN_PASSWORD = process.env.DIRECTUS_ADMIN_PASSWORD!;

interface DirectusAuthResponse {
  data: {
    access_token: string;
  };
}

async function authenticate(): Promise<string> {
  const response = await fetch(`${DIRECTUS_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD,
    }),
  });

  if (!response.ok) {
    throw new Error(`Authentication failed: ${response.statusText}`);
  }

  const data = (await response.json()) as DirectusAuthResponse;
  return data.data.access_token;
}

async function registerCollection(token: string, collection: string, schema?: string) {
  console.log(`📝 Registering collection: ${collection}...`);

  const response = await fetch(`${DIRECTUS_URL}/collections`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      collection,
      meta: {
        collection,
        icon: 'box',
        note: null,
        display_template: null,
        hidden: false,
        singleton: false,
        translations: null,
        archive_field: null,
        archive_app_filter: true,
        archive_value: null,
        unarchive_value: null,
        sort_field: null,
        accountability: 'all',
        color: null,
        item_duplication_fields: null,
        sort: null,
        group: null,
        collapse: 'open',
      },
      schema,
    }),
  });

  const text = await response.text();

  if (!response.ok) {
    // Collection might already exist
    if (response.status === 400 || response.status === 409) {
      console.log(`  ⚠️  Collection ${collection} might already exist`);
      return;
    }
    throw new Error(`Failed to register ${collection}: ${text}`);
  }

  console.log(`  ✅ Registered: ${collection}`);
}

async function main() {
  console.log('🔐 Authenticating with Directus...\n');
  const token = await authenticate();

  const collections = [
    'cms_homepage_hero',
    'cms_features',
    'cms_blog_posts',
    'cms_docs_pages',
    'cms_announcements',
    'cms_legal_pages',
    'cms_waitlist_submissions',
  ];

  for (const collection of collections) {
    try {
      await registerCollection(token, collection);
    } catch (error) {
      console.error(`❌ Error registering ${collection}:`, error);
    }
  }

  console.log('\n🎉 Collection registration complete!');
  console.log('\nNext: Restart Directus or refresh schema cache');
}

main().catch((error) => {
  console.error('❌ Error:', error);
  process.exit(1);
});
