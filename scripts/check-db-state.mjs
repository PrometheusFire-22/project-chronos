#!/usr/bin/env node
import pkg from 'pg';
const { Client } = pkg;

const client = new Client({
  connectionString: process.env.DATABASE_URL || process.env.POSTGRES_URL,
});

async function checkDatabase() {
  try {
    await client.connect();
    console.log('✅ Connected to production database\n');

    // Check what tables exist
    const tablesResult = await client.query(`
      SELECT tablename
      FROM pg_tables
      WHERE schemaname = 'public'
      ORDER BY tablename;
    `);

    console.log('📋 Tables in database:');
    tablesResult.rows.forEach(row => {
      console.log(`   - ${row.tablename}`);
    });
    console.log('');

    // Check if users table exists
    const userTableExists = tablesResult.rows.some(row => row.tablename === 'users');

    if (userTableExists) {
      // Check users table structure
      const columnsResult = await client.query(`
        SELECT column_name, data_type
        FROM information_schema.columns
        WHERE table_name = 'users'
        ORDER BY ordinal_position;
      `);

      console.log('👤 Users table columns:');
      columnsResult.rows.forEach(row => {
        console.log(`   - ${row.column_name} (${row.data_type})`);
      });
      console.log('');

      // Check users count
      const countResult = await client.query('SELECT COUNT(*) FROM users;');
      console.log(`👥 Total users: ${countResult.rows[0].count}`);

      // Show user details (without password hash)
      const usersResult = await client.query('SELECT id, email, created_at, updated_at FROM users;');
      if (usersResult.rows.length > 0) {
        console.log('\n📧 Existing users:');
        usersResult.rows.forEach(user => {
          console.log(`   - ${user.email} (ID: ${user.id})`);
          console.log(`     Created: ${user.created_at}`);
          console.log(`     Updated: ${user.updated_at}`);
        });
      }
    } else {
      console.log('⚠️  Users table does NOT exist!');
      console.log('   → Migrations have NOT been run on production database');
    }

    // Check for payload-specific tables
    const payloadTables = tablesResult.rows.filter(row =>
      row.tablename.includes('payload') ||
      ['users', 'media', 'pages'].includes(row.tablename)
    );

    if (payloadTables.length === 0) {
      console.log('\n⚠️  NO Payload tables found!');
      console.log('   → Need to run migrations on production database');
    } else {
      console.log('\n✅ Payload tables found!');
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

checkDatabase();
