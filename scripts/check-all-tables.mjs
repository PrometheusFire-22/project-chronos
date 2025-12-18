#!/usr/bin/env node
import pkg from 'pg';
const { Client } = pkg;

const client = new Client({
  connectionString: 'postgresql://chronos:DZ4eNOynmfYVOtG8c8TBlXIGVGlqkvWKQR5ixYYjAMs=@16.52.210.100:5432/chronos',
});

async function checkAllTables() {
  try {
    await client.connect();

    // Check all tables
    const tablesResult = await client.query(`
      SELECT tablename
      FROM pg_tables
      WHERE schemaname = 'public'
      ORDER BY tablename;
    `);

    const payloadTables = [];
    const businessTables = [];

    tablesResult.rows.forEach(row => {
      const tableName = row.tablename;
      if (
        tableName.startsWith('payload_') ||
        ['users', 'users_sessions', 'media', 'pages'].includes(tableName) ||
        tableName.startsWith('pages_blocks_')
      ) {
        payloadTables.push(tableName);
      } else {
        businessTables.push(tableName);
      }
    });

    console.log('📊 Payload CMS Tables (will be managed by Payload):');
    payloadTables.forEach(table => console.log(`   - ${table}`));

    console.log('\n🏢 Your Business Logic Tables (UNTOUCHED):');
    if (businessTables.length > 0) {
      businessTables.forEach(table => console.log(`   - ${table}`));
    } else {
      console.log('   (none found - all tables are Payload-managed)');
    }

    // Check database extensions
    const extensionsResult = await client.query(`
      SELECT extname, extversion
      FROM pg_extension
      ORDER BY extname;
    `);

    console.log('\n🔧 Database Extensions:');
    extensionsResult.rows.forEach(row => {
      console.log(`   - ${row.extname} (v${row.extversion})`);
    });

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

checkAllTables();
