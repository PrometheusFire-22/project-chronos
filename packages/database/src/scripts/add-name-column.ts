/**
 * Migration script to add name column to auth.user table
 */

import postgres from 'postgres';

async function addNameColumn() {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL environment variable is required');
  }

  const sql = postgres(process.env.DATABASE_URL);

  try {
    console.log('Adding name column to auth.user table...');

    // Add name column as nullable first
    await sql`ALTER TABLE auth.user ADD COLUMN IF NOT EXISTS name text`;

    // Populate name from first_name and last_name, or use email prefix as fallback
    const result = await sql`
      UPDATE auth.user
      SET name = COALESCE(
        NULLIF(CONCAT_WS(' ', first_name, last_name), ''),
        SPLIT_PART(email, '@', 1)
      )
      WHERE name IS NULL
    `;

    console.log(`✅ Updated ${result.count} user records with name values`);

    // Now make it NOT NULL
    await sql`ALTER TABLE auth.user ALTER COLUMN name SET NOT NULL`;

    console.log('✅ Name column added successfully and set to NOT NULL');

  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  }
}

addNameColumn()
  .then(async () => {
    console.log('Migration completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Migration failed:', error);
    process.exit(1);
  });
