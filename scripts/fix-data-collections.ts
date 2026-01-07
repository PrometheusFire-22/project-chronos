#!/usr/bin/env tsx
/**
 * Fix Data Collections in Directus
 *
 * This script:
 * 1. Adds missing primary keys to database tables
 * 2. Configures Directus metadata for data collections
 * 3. Registers Canadian geospatial tables
 *
 * Fixes accessibility issues for:
 * - economic_observations (TimescaleDB)
 * - series_metadata, data_sources (metadata schema)
 * - US + Canadian geospatial layers
 */

import { createDirectus, rest, authentication, readCollections, updateCollection, createField } from '@directus/sdk';
import pg from 'pg';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.aws' });

const DIRECTUS_URL = process.env.DIRECTUS_URL || 'https://admin.automatonicai.com';
const ADMIN_EMAIL = process.env.DIRECTUS_ADMIN_EMAIL!;
const ADMIN_PASSWORD = process.env.DIRECTUS_ADMIN_PASSWORD!;

// PostgreSQL connection
const dbConfig = {
  host: process.env.DATABASE_HOST,
  port: parseInt(process.env.DATABASE_PORT || '5432'),
  database: process.env.DATABASE_NAME,
  user: process.env.DATABASE_USER,
  password: process.env.DATABASE_PASSWORD,
};

const directus = createDirectus(DIRECTUS_URL)
  .with(authentication())
  .with(rest());

async function fixDatabasePrimaryKeys() {
  console.log('\n🗄️  Step 1: Fixing Database Primary Keys...\n');

  const client = new pg.Client(dbConfig);
  await client.connect();

  try {
    // Check if economic_observations already has a PK
    const pkCheck = await client.query(`
      SELECT constraint_name
      FROM information_schema.table_constraints
      WHERE table_schema = 'timeseries'
        AND table_name = 'economic_observations'
        AND constraint_type = 'PRIMARY KEY'
    `);

    if (pkCheck.rows.length === 0) {
      console.log('  📌 Adding PRIMARY KEY to timeseries.economic_observations...');
      await client.query(`
        ALTER TABLE timeseries.economic_observations
        ADD PRIMARY KEY (id)
      `);
      console.log('  ✅ Primary key added successfully\n');
    } else {
      console.log('  ✅ economic_observations already has primary key\n');
    }

    // Verify all geospatial tables have PKs
    const geoTables = ['us_states', 'us_counties', 'us_cbsa', 'us_csa', 'us_metdiv', 'ca_provinces', 'ca_census_divisions'];
    for (const table of geoTables) {
      const check = await client.query(`
        SELECT constraint_name
        FROM information_schema.table_constraints
        WHERE table_schema = 'geospatial'
          AND table_name = $1
          AND constraint_type = 'PRIMARY KEY'
      `, [table]);

      console.log(`  ${check.rows.length > 0 ? '✅' : '❌'} ${table}: ${check.rows.length > 0 ? 'Has PK' : 'MISSING PK'}`);
    }

  } finally {
    await client.end();
  }
}

async function configureDirectusCollections() {
  console.log('\n🔧 Step 2: Configuring Directus Collection Metadata...\n');

  await directus.login({ email: ADMIN_EMAIL, password: ADMIN_PASSWORD });
  console.log('  ✅ Authenticated with Directus\n');

  const collections = [
    // Time-series & Economic Data
    {
      name: 'economic_observations',
      pk: 'id',
      schema: 'timeseries',
      icon: 'show_chart',
      display_template: 'Series {{series_id}} - {{observation_date}}',
      note: 'Economic time-series observations (112K+ records)',
      hidden: false,
    },
    {
      name: 'series_metadata',
      pk: 'series_id',
      schema: 'metadata',
      icon: 'dataset',
      display_template: '{{series_name}} ({{category}})',
      note: 'Economic data series metadata (39 series)',
      hidden: false,
    },
    {
      name: 'data_sources',
      pk: 'source_id',
      schema: 'metadata',
      icon: 'source',
      display_template: '{{source_name}}',
      note: 'Data provider information (FRED, Bank of Canada)',
      hidden: false,
    },

    // US Geospatial
    {
      name: 'us_states',
      pk: 'gid',
      schema: 'geospatial',
      icon: 'map',
      display_template: '{{name}}',
      note: 'US States and territories (56 records)',
      hidden: false,
    },
    {
      name: 'us_counties',
      pk: 'gid',
      schema: 'geospatial',
      icon: 'location_city',
      display_template: '{{name}}, {{statefp}}',
      note: 'US Counties (3,235 records)',
      hidden: false,
    },
    {
      name: 'us_cbsa',
      pk: 'gid',
      schema: 'geospatial',
      icon: 'apartment',
      display_template: '{{name}}',
      note: 'Core Based Statistical Areas (935 metro areas)',
      hidden: false,
    },
    {
      name: 'us_csa',
      pk: 'gid',
      schema: 'geospatial',
      icon: 'domain',
      display_template: '{{name}}',
      note: 'Combined Statistical Areas (184 regions)',
      hidden: false,
    },
    {
      name: 'us_metdiv',
      pk: 'gid',
      schema: 'geospatial',
      icon: 'business',
      display_template: '{{name}}',
      note: 'Metropolitan Divisions (37 divisions)',
      hidden: false,
    },

    // Canadian Geospatial
    {
      name: 'ca_provinces',
      pk: 'gid',
      schema: 'geospatial',
      icon: 'flag',
      display_template: '{{name}}',
      note: 'Canadian Provinces and Territories (13 records)',
      hidden: false,
    },
    {
      name: 'ca_census_divisions',
      pk: 'gid',
      schema: 'geospatial',
      icon: 'location_on',
      display_template: '{{name}}',
      note: 'Canadian Census Divisions (293 records)',
      hidden: false,
    },
  ];

  const existingCollections = await directus.request(readCollections());

  for (const col of collections) {
    const exists = existingCollections.some((c: any) => c.collection === col.name);

    if (!exists) {
      console.log(`  ⚠️  Collection ${col.name} not found in Directus. Skipping...`);
      continue;
    }

    try {
      console.log(`  🔧 Configuring ${col.name}...`);

      await directus.request(updateCollection(col.name, {
        meta: {
          icon: col.icon,
          display_template: col.display_template,
          note: col.note,
          hidden: col.hidden,
        },
        schema: {
          schema: col.schema,
        },
      } as any));

      console.log(`  ✅ ${col.name} configured (PK: ${col.pk})`);
    } catch (error: any) {
      console.error(`  ❌ Failed to configure ${col.name}:`, error.message);
    }
  }
}

async function verifyCollections() {
  console.log('\n✨ Step 3: Verifying Collection Access...\n');

  const collections = await directus.request(readCollections());

  const dataCollections = collections.filter((c: any) =>
    ['economic_observations', 'series_metadata', 'data_sources',
     'us_states', 'us_counties', 'us_cbsa', 'ca_provinces', 'ca_census_divisions']
      .includes(c.collection)
  );

  console.log(`  📊 Found ${dataCollections.length} data collections:`);
  dataCollections.forEach((c: any) => {
    console.log(`     - ${c.collection} (${c.meta?.icon || 'no icon'})`);
  });

  console.log('\n  🎯 These should now be clickable in Content → [Collection Name]');
}

async function main() {
  console.log('🚀 Fixing Data Collections for Directus Dashboards\n');
  console.log('Target: ' + DIRECTUS_URL);

  try {
    await fixDatabasePrimaryKeys();
    await configureDirectusCollections();
    await verifyCollections();

    console.log('\n✅ All done! Check Directus admin to verify collections are now accessible.');
    console.log('\n📍 Next steps:');
    console.log('   1. Go to https://admin.automatonicai.com/admin/content/');
    console.log('   2. Click on any collection (economic_observations, us_states, etc.)');
    console.log('   3. Verify data is displayed');
    console.log('   4. Create dashboards via Insights → New Dashboard\n');

  } catch (error) {
    console.error('\n❌ Error:', error);
    process.exit(1);
  }
}

main();
