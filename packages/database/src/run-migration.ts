/**
 * Run migration script
 * Applies the SQL migration file directly to the database
 */

import postgres from 'postgres';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

// Database connection
const connectionString = process.env.DATABASE_URL ||
  `postgresql://${process.env.DB_USER || 'chronos'}:${process.env.DB_PASSWORD || ''}@${process.env.DB_HOST || 'localhost'}:${process.env.DB_PORT || '5432'}/${process.env.DB_NAME || 'chronos'}`;

const client = postgres(connectionString);

async function runMigration() {
  console.log('🔄 Applying database migration...\n');

  try {
    // Read the migration SQL file
    const migrationPath = join(__dirname, '../migrations/0002_next_kate_bishop.sql');
    const sql = readFileSync(migrationPath, 'utf-8');

    console.log('📄 Executing migration SQL...');

    // Execute the SQL
    await client.unsafe(sql);

    console.log('✅ Migration applied successfully!\n');
  } catch (error) {
    console.error('❌ Error applying migration:', error);
    throw error;
  } finally {
    await client.end();
  }
}

// Run the migration
runMigration()
  .then(() => {
    console.log('🎉 Done!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Migration failed:', error);
    process.exit(1);
  });
