#!/usr/bin/env tsx
/**
 * Add Permissions for Data Collections via SQL
 *
 * Grants read permissions to data collections using the public policy
 */

import pg from 'pg';
import { readFileSync } from 'fs';
import { join } from 'path';

// Load environment variables from .env.production
const envPath = join(process.cwd(), '.env.production');
const envFile = readFileSync(envPath, 'utf-8');
envFile.split('\n').forEach(line => {
  const match = line.match(/^([^=]+)=(.*)$/);
  if (match) {
    const [, key, value] = match;
    process.env[key] = value;
  }
});

const dbConfig = {
  host: process.env.DATABASE_HOST,
  port: parseInt(process.env.DATABASE_PORT || '5432'),
  database: process.env.DATABASE_NAME,
  user: process.env.DATABASE_USER,
  password: process.env.DATABASE_PASSWORD,
};

const PUBLIC_POLICY_ID = 'abf8a154-5b1c-4a46-ac9c-7300570f4f17';
const ADMIN_POLICY_ID = '4177dea2-57c7-4b74-af04-716bbacd1ce2';

const dataCollections = [
  'economic_observations',
  'series_metadata',
  'data_sources',
  'us_states',
  'us_counties',
  'us_cbsa',
  'us_csa',
  'us_metdiv',
  'ca_provinces',
  'ca_census_divisions',
];

async function main() {
  console.log('🔐 Adding Read Permissions for Data Collections\n');

  const client = new pg.Client(dbConfig);
  await client.connect();

  try {
    // Check existing permissions
    console.log('📋 Checking existing permissions...');
    const existingResult = await client.query(`
      SELECT collection, action, policy
      FROM directus_permissions
      WHERE collection = ANY($1::text[])
    `, [dataCollections]);
    console.log(`   Found ${existingResult.rows.length} existing permissions`);

    // Add permissions for each collection for both Public and Admin policies
    console.log('\n🔧 Adding read permissions for Public policy...\n');

    for (const collection of dataCollections) {
      try {
        // Check if permission already exists
        const checkResult = await client.query(`
          SELECT id FROM directus_permissions
          WHERE collection = $1 AND action = 'read' AND policy = $2
        `, [collection, PUBLIC_POLICY_ID]);

        if (checkResult.rows.length > 0) {
          console.log(`   ⏭️  ${collection}: Public permission already exists`);
          continue;
        }

        // Insert new permission
        await client.query(`
          INSERT INTO directus_permissions (collection, action, policy, permissions, fields)
          VALUES ($1, 'read', $2, '{}', '*')
        `, [collection, PUBLIC_POLICY_ID]);

        console.log(`   ✅ ${collection}: Created public read permission`);
      } catch (error: any) {
        console.error(`   ❌ ${collection}: ${error.message}`);
      }
    }

    console.log('\n🔧 Adding read permissions for Administrator policy...\n');

    for (const collection of dataCollections) {
      try {
        // Check if permission already exists
        const checkResult = await client.query(`
          SELECT id FROM directus_permissions
          WHERE collection = $1 AND action = 'read' AND policy = $2
        `, [collection, ADMIN_POLICY_ID]);

        if (checkResult.rows.length > 0) {
          console.log(`   ⏭️  ${collection}: Admin permission already exists`);
          continue;
        }

        // Insert new permission
        await client.query(`
          INSERT INTO directus_permissions (collection, action, policy, permissions, fields)
          VALUES ($1, 'read', $2, '{}', '*')
        `, [collection, ADMIN_POLICY_ID]);

        console.log(`   ✅ ${collection}: Created admin read permission`);
      } catch (error: any) {
        console.error(`   ❌ ${collection}: ${error.message}`);
      }
    }

    // Verify final state
    console.log('\n📊 Final permissions:');
    const finalResult = await client.query(`
      SELECT collection, action, policy
      FROM directus_permissions
      WHERE collection = ANY($1::text[])
      ORDER BY collection
    `, [dataCollections]);

    for (const row of finalResult.rows) {
      console.log(`   ✅ ${row.collection}: ${row.action}`);
    }

    console.log('\n✅ Permissions added successfully!\n');
    console.log('📍 Try accessing the collections in Directus now\n');

  } catch (error: any) {
    console.error('❌ Error:', error.message);
    throw error;
  } finally {
    await client.end();
  }
}

main().catch((error) => {
  console.error('\n❌ Script failed:', error.message || error);
  process.exit(1);
});
