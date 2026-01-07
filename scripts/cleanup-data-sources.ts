#!/usr/bin/env tsx
/**
 * Clean Up Duplicate Data Sources
 *
 * Fixes data quality issues:
 * 1. Updates series_metadata to reference correct source_id (1=FRED, 2=Valet)
 * 2. Deletes duplicate data_sources entries (3 and 4)
 */

import pg from 'pg';

const dbConfig = {
  host: process.env.DATABASE_HOST,
  port: parseInt(process.env.DATABASE_PORT || '5432'),
  database: process.env.DATABASE_NAME,
  user: process.env.DATABASE_USER,
  password: process.env.DATABASE_PASSWORD,
};

async function main() {
  console.log('🔧 Cleaning Up Data Sources\n');

  const client = new pg.Client(dbConfig);
  await client.connect();

  try {
    // Check current state
    console.log('📊 Current State:');
    const sourcesResult = await client.query(`
      SELECT source_id, source_name
      FROM metadata.data_sources
      ORDER BY source_id
    `);
    console.log('   Data Sources:', sourcesResult.rows);

    const seriesSourcesResult = await client.query(`
      SELECT source_id, COUNT(*) as series_count
      FROM metadata.series_metadata
      GROUP BY source_id
      ORDER BY source_id
    `);
    console.log('   Series by Source:', seriesSourcesResult.rows);

    // Step 1: Update series_metadata to reference correct source_id
    console.log('\n🔄 Step 1: Updating series_metadata to reference source_id 1 (FRED)...');
    const updateResult = await client.query(`
      UPDATE metadata.series_metadata
      SET source_id = 1
      WHERE source_id = 3
    `);
    console.log(`   ✅ Updated ${updateResult.rowCount} series to reference FRED (source_id 1)`);

    // Step 2: Delete duplicate data_sources
    console.log('\n🗑️  Step 2: Deleting duplicate data sources...');

    const deleteSource3 = await client.query(`
      DELETE FROM metadata.data_sources
      WHERE source_id = 3
    `);
    console.log(`   ✅ Deleted source_id 3 (duplicate FRED)`);

    const deleteSource4 = await client.query(`
      DELETE FROM metadata.data_sources
      WHERE source_id = 4
    `);
    console.log(`   ✅ Deleted source_id 4 (duplicate Valet)`);

    // Verify final state
    console.log('\n✅ Final State:');
    const finalSourcesResult = await client.query(`
      SELECT source_id, source_name
      FROM metadata.data_sources
      ORDER BY source_id
    `);
    console.log('   Data Sources:', finalSourcesResult.rows);

    const finalSeriesSourcesResult = await client.query(`
      SELECT source_id, COUNT(*) as series_count
      FROM metadata.series_metadata
      GROUP BY source_id
      ORDER BY source_id
    `);
    console.log('   Series by Source:', finalSeriesSourcesResult.rows);

    console.log('\n✨ Data sources cleanup complete!\n');

  } catch (error) {
    console.error('❌ Error:', error);
    throw error;
  } finally {
    await client.end();
  }
}

main();
