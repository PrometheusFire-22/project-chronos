#!/usr/bin/env node
import pkg from 'pg';
const { Client } = pkg;

const client = new Client({
  connectionString: process.env.DATABASE_URL || process.env.POSTGRES_URL,
});

async function checkGeospatialData() {
  const expectedTables = [
    'us_counties',
    'ca_provinces',
    'ca_census_divisions',
    'ca_census_subdivisions',
    'ca_cma',
  ];

  try {
    await client.connect();
    console.log('✅ Connected to the database\n');

    const tablesResult = await client.query(`
      SELECT tablename
      FROM pg_tables
      WHERE schemaname = 'geospatial'
      ORDER BY tablename;
    `);

    const existingTables = tablesResult.rows.map(row => row.tablename);

    console.log('🗺️  Checking for geospatial tables...');
    let allFound = true;
    for (const table of expectedTables) {
      if (existingTables.includes(table)) {
        console.log(`   ✅ Found table: ${table}`);
      } else {
        console.log(`   ❌ Missing table: ${table}`);
        allFound = false;
      }
    }

    console.log('');
    if (allFound) {
      console.log('✅ All expected geospatial tables are present.');
    } else {
      console.log('⚠️  Some geospatial tables are missing. It might be necessary to run the geospatial ingestion script.');
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

checkGeospatialData();
