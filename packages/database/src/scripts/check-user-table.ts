
import { sql } from 'drizzle-orm';
import { db, closeDatabase } from '../client';
import * as dotenv from 'dotenv';
import path from 'path';

// Load environment variables (from root .env if not already loaded)
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../../../../.env') });

async function inspectUserTable() {
  console.log('Inspecting production database for "user" table...');

  try {
    // 1. Check for table existence in 'public' and 'auth' schemas
    const tables = await db.execute(sql`
      SELECT table_schema, table_name
      FROM information_schema.tables
      WHERE table_name = 'user' AND table_schema IN ('public', 'auth');
    `);

    console.log('Found tables matching "user":', tables);

    for (const table of tables) {
        const schema = table.table_schema as string;
        const tableName = table.table_name as string;

        console.log(`\nInspecting columns for ${schema}.${tableName}:`);

        const columns = await db.execute(sql`
            SELECT column_name, data_type
            FROM information_schema.columns
            WHERE table_schema = ${schema} AND table_name = ${tableName};
        `);
        console.log(columns);
    }

  } catch (error) {
    console.error('Error inspecting database:', error);
  } finally {
    await closeDatabase();
  }
}

inspectUserTable();
