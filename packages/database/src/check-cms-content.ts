/**
 * Check CMS Content Script
 *
 * Queries the production database to see what content exists
 */

import postgres from 'postgres';
import { drizzle } from 'drizzle-orm/postgres-js';
import { features } from './schema/cms.js';
import { eq } from 'drizzle-orm';

const connectionString = process.env.DATABASE_URL ||
  `postgresql://${process.env.DB_USER || 'chronos'}:${process.env.DB_PASSWORD || ''}@${process.env.DB_HOST || 'localhost'}:${process.env.DB_PORT || '5432'}/${process.env.DB_NAME || 'chronos'}`;

const client = postgres(connectionString);
const db = drizzle(client);

async function checkContent() {
  console.log('🔍 Checking existing CMS content...\n');

  try {
    // Get all features grouped by category
    const allFeatures = await db.select().from(features).orderBy(features.category, features.sortOrder);

    const byCategory = allFeatures.reduce((acc, feature) => {
      const cat = feature.category || 'uncategorized';
      if (!acc[cat]) acc[cat] = [];
      acc[cat].push(feature);
      return acc;
    }, {} as Record<string, typeof allFeatures>);

    console.log('📊 Features by Category:\n');
    for (const [category, items] of Object.entries(byCategory)) {
      console.log(`\n${category.toUpperCase()} (${items.length} items):`);
      items.forEach((item, idx) => {
        console.log(`  ${idx + 1}. ${item.title}`);
        console.log(`     ${item.description.substring(0, 100)}...`);
      });
    }

    console.log('\n✅ Content check complete!');
  } catch (error) {
    console.error('❌ Error checking content:', error);
    throw error;
  } finally {
    await client.end();
  }
}

checkContent()
  .then(() => {
    console.log('\n🎉 Done!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Check failed:', error);
    process.exit(1);
  });
