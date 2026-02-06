
import { sql } from 'drizzle-orm';
import { db, closeDatabase } from '../client';
import * as dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../../../../.env') });

async function migrateUserTable() {
  console.log('Starting targeted migration for "auth.user" table...');

  try {
    // 1. Add first_name column
    console.log('Adding first_name column...');
    await db.execute(sql`
      ALTER TABLE "auth"."user"
      ADD COLUMN IF NOT EXISTS "first_name" text;
    `);

    // 2. Add last_name column
    console.log('Adding last_name column...');
    await db.execute(sql`
      ALTER TABLE "auth"."user"
      ADD COLUMN IF NOT EXISTS "last_name" text;
    `);

    // 3. Drop name column
    console.log('Dropping name column...');
    await db.execute(sql`
      ALTER TABLE "auth"."user"
      DROP COLUMN IF EXISTS "name";
    `);

    console.log('Migration completed successfully!');

  } catch (error) {
    console.error('Error executing migration:', error);
  } finally {
    await closeDatabase();
  }
}

migrateUserTable();
