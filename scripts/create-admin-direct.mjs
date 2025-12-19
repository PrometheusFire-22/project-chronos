#!/usr/bin/env node
import pg from 'pg';
import bcrypt from 'bcrypt';

const { Client } = pg;

async function createAdmin() {
  const client = new Client({
    connectionString: process.env.POSTGRES_URL,
  });

  try {
    await client.connect();
    console.log('✅ Connected to database');

    // Use admin credentials from environment or defaults
    const email = process.env.ADMIN_EMAIL || 'geoff@automatonicai.com';
    const password = process.env.ADMIN_PASSWORD || 'ChangeMe123!';
    
    // Hash the password
    const hash = await bcrypt.hash(password, 10);

    // Insert user
    const result = await client.query(`
      INSERT INTO users (email, "updatedAt", "createdAt", hash, salt)
      VALUES ($1, NOW(), NOW(), $2, '')
      ON CONFLICT (email) DO NOTHING
      RETURNING id, email
    `, [email, hash]);

    if (result.rowCount > 0) {
      console.log('✅ Admin user created successfully!');
      console.log(`   Email: ${email}`);
      console.log(`   Password: ${password}`);
      console.log('');
      console.log('⚠️  IMPORTANT: Change password after first login!');
      console.log('🔗  Login at: https://www.automatonicai.com/admin');
    } else {
      console.log('ℹ️  User already exists');
    }

    await client.end();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    await client.end();
    process.exit(1);
  }
}

createAdmin();
