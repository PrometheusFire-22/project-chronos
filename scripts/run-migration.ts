#!/usr/bin/env tsx
/**
 * Run Alembic migration SQL directly
 * This adds the PRIMARY KEY to economic_observations table
 *
 * Usage: DATABASE_HOST=... DATABASE_PORT=... DATABASE_NAME=... DATABASE_USER=... DATABASE_PASSWORD=... npx tsx scripts/run-migration.ts
 */

import pg from 'pg';

const dbConfig = {
  host: process.env.DATABASE_HOST || '16.52.210.100',
  port: parseInt(process.env.DATABASE_PORT || '5432'),
  database: process.env.DATABASE_NAME || 'chronos',
  user: process.env.DATABASE_USER || 'chronos',
  password: process.env.DATABASE_PASSWORD || '',
};

async function main() {
  console.log('🔄 Running migration: Add PRIMARY KEY to economic_observations\n');

  const client = new pg.Client(dbConfig);
  await client.connect();

  try {
    // Check if PRIMARY KEY already exists
    const checkResult = await client.query(`
      SELECT constraint_name
      FROM information_schema.table_constraints
      WHERE table_schema = 'timeseries'
        AND table_name = 'economic_observations'
        AND constraint_type = 'PRIMARY KEY'
    `);

    if (checkResult.rows.length > 0) {
      console.log('✅ PRIMARY KEY already exists on economic_observations.id');
      console.log(`   Constraint name: ${checkResult.rows[0].constraint_name}\n`);
      return;
    }

    // Add PRIMARY KEY (must include partitioning column observation_date)
    console.log('📌 Adding PRIMARY KEY constraint to timeseries.economic_observations...');
    console.log('   Note: Using composite key (id, observation_date) due to partitioning\n');
    await client.query(`
      ALTER TABLE timeseries.economic_observations
      ADD PRIMARY KEY (id, observation_date)
    `);

    console.log('✅ Migration completed successfully!\n');
    console.log('   Primary key added: economic_observations(id)\n');

  } catch (error: any) {
    console.error('❌ Migration failed:', error.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

main();
