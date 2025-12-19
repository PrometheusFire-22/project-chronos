#!/usr/bin/env node
import pkg from 'pg';
const { Client } = pkg;

const client = new Client({
  connectionString: process.env.DATABASE_URL || process.env.POSTGRES_URL,
});

async function checkSessions() {
  try {
    await client.connect();

    // Check users_sessions table structure
    const columnsResult = await client.query(`
      SELECT column_name, data_type
      FROM information_schema.columns
      WHERE table_name = 'users_sessions'
      ORDER BY ordinal_position;
    `);

    console.log('🔐 users_sessions table columns:');
    columnsResult.rows.forEach(row => {
      console.log(`   - ${row.column_name} (${row.data_type})`);
    });
    console.log('');

    // Check sessions count
    const countResult = await client.query('SELECT COUNT(*) FROM users_sessions;');
    console.log(`Session count: ${countResult.rows[0].count}\n`);

    // Check user's salt and hash (just show if they exist)
    const userResult = await client.query(`
      SELECT
        email,
        LENGTH(salt) as salt_length,
        LENGTH(hash) as hash_length,
        salt IS NOT NULL as has_salt,
        hash IS NOT NULL as has_hash
      FROM users
      WHERE email = 'geoff@automatonicai.com';
    `);

    console.log('👤 User password status:');
    const user = userResult.rows[0];
    console.log(`   Email: ${user.email}`);
    console.log(`   Has salt: ${user.has_salt} (length: ${user.salt_length || 0})`);
    console.log(`   Has hash: ${user.has_hash} (length: ${user.hash_length || 0})`);

    if (!user.has_salt || !user.has_hash) {
      console.log('\n⚠️  User is missing salt or hash!');
      console.log('   → This will cause authentication to fail');
    } else if (user.salt_length === 0 || user.hash_length === 0) {
      console.log('\n⚠️  User has empty salt or hash!');
      console.log('   → This will cause authentication to fail');
    } else {
      console.log('\n✅ User has salt and hash (but may not be in correct Payload format)');
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

checkSessions();
