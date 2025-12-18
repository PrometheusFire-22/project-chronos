#!/usr/bin/env node
import pkg from 'pg';
const { Client } = pkg;

const client = new Client({
  connectionString: 'postgresql://chronos:DZ4eNOynmfYVOtG8c8TBlXIGVGlqkvWKQR5ixYYjAMs=@16.52.210.100:5432/chronos',
});

async function deleteUser() {
  try {
    await client.connect();
    console.log('✅ Connected to production database\n');

    // Delete the malformed user
    const result = await client.query(
      "DELETE FROM users WHERE email = 'geoff@automatonicai.com' RETURNING id, email;"
    );

    if (result.rows.length > 0) {
      console.log('🗑️  Deleted malformed user:');
      console.log(`   Email: ${result.rows[0].email}`);
      console.log(`   ID: ${result.rows[0].id}\n`);
      console.log('✅ Database is now clean!');
      console.log('');
      console.log('📋 Next Steps:');
      console.log('   1. Deploy to Vercel (with updated domain config)');
      console.log('   2. Visit https://automatonicai.com/admin');
      console.log('   3. Payload will detect no users and show "Create First User" form');
      console.log('   4. Create your admin user through the web interface');
    } else {
      console.log('⚠️  No user found to delete');
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

deleteUser();
