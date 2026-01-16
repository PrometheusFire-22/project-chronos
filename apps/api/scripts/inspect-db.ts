import pg from 'pg';
const { Pool } = pg;

const connectionString = 'postgresql://chronos:DZ4eNOynmfYVOtG8c8TBlXIGVGlqkvWKQR5ixYYjAMs=@16.52.210.100:5432/chronos';

const pool = new Pool({
  connectionString,
  ssl: { rejectUnauthorized: false } // Likely needed for external connection, can adjust if fails
});

async function inspect() {
  const client = await pool.connect();
  try {
    console.log('Connected to database!');
    
    // Check extensions
    console.log('\n--- Installed Extensions ---');
    const extensions = await client.query('SELECT * FROM pg_extension');
    extensions.rows.forEach(row => console.log(`- ${row.extname} (${row.extversion})`));

    // Check tables in public schema
    console.log('\n--- Tables in public schema ---');
    const tables = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name;
    `);
    if (tables.rows.length === 0) {
        console.log('No tables found in public schema.');
    } else {
        tables.rows.forEach(row => console.log(`- ${row.table_name}`));
    }

    // Check specifically for geospatial tables (often hidden or specific)
    console.log('\n--- Checking for potential geospatial data ---');
    // Look for geometry columns
    const geoColumns = await client.query(`
      SELECT table_name, column_name, udt_name 
      FROM information_schema.columns 
      WHERE udt_name = 'geometry' OR udt_name = 'geography';
    `);
    if (geoColumns.rows.length === 0) {
        console.log('No geometry/geography columns found.');
    } else {
        geoColumns.rows.forEach(row => console.log(`- ${row.table_name}.${row.column_name} (${row.udt_name})`));
    }

  } catch (err) {
    console.error('Error connecting or querying:', err);
  } finally {
    client.release();
    await pool.end();
  }
}

inspect();
