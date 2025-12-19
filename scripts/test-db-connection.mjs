#!/usr/bin/env node

/**
 * Database Connection Test Script
 * Tests PostgreSQL connection and checks Payload CMS tables
 */

import pg from 'pg';
const { Client } = pg;

const connectionString = process.env.DATABASE_URL || process.env.POSTGRES_URL;

if (!connectionString) {
  console.error('❌ Error: DATABASE_URL or POSTGRES_URL environment variable is not set');
  process.exit(1);
}

async function testConnection() {
  const client = new Client({ connectionString });

  try {
    console.log('🔌 Connecting to PostgreSQL...');
    await client.connect();
    console.log('✅ Connected successfully!\n');

    // Test 1: List all tables
    console.log('📋 Listing all tables in public schema:');
    const tablesResult = await client.query(`
      SELECT tablename
      FROM pg_tables
      WHERE schemaname = 'public'
      ORDER BY tablename;
    `);

    if (tablesResult.rows.length === 0) {
      console.log('⚠️  No tables found! Database is empty.');
    } else {
      tablesResult.rows.forEach(row => {
        console.log(`  - ${row.tablename}`);
      });
    }
    console.log();

    // Test 2: Check for Payload CMS tables
    console.log('🔍 Checking for Payload CMS tables:');
    const payloadTables = ['users', 'media', 'pages', 'payload_preferences', 'payload_migrations'];
    for (const table of payloadTables) {
      const exists = await client.query(`
        SELECT EXISTS (
          SELECT FROM information_schema.tables
          WHERE table_schema = 'public'
          AND table_name = $1
        );
      `, [table]);

      const status = exists.rows[0].exists ? '✅' : '❌';
      console.log(`  ${status} ${table}`);
    }
    console.log();

    // Test 3: Count users if table exists
    const usersExist = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables
        WHERE table_schema = 'public'
        AND table_name = 'users'
      );
    `);

    if (usersExist.rows[0].exists) {
      const userCount = await client.query('SELECT COUNT(*) FROM users;');
      console.log(`👥 User count: ${userCount.rows[0].count}`);

      if (parseInt(userCount.rows[0].count) === 0) {
        console.log('⚠️  WARNING: No users in database! You cannot login to admin panel.');
        console.log('   You need to create a user via the API or database migration.');
      }
    } else {
      console.log('⚠️  Users table does not exist. Payload CMS has not initialized the database.');
    }
    console.log();

    // Test 4: Check database version and settings
    const versionResult = await client.query('SELECT version();');
    console.log('🗄️  Database version:');
    console.log(`  ${versionResult.rows[0].version.split(',')[0]}`);
    console.log();

    // Test 5: Check connection from external IP
    const clientInfo = await client.query('SELECT inet_client_addr(), inet_client_port();');
    console.log('🌐 Connection info:');
    console.log(`  Client IP: ${clientInfo.rows[0].inet_client_addr || 'localhost'}`);
    console.log(`  Client Port: ${clientInfo.rows[0].inet_client_port || 'N/A'}`);

  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.code === 'ECONNREFUSED') {
      console.error('   Connection refused. Check if:');
      console.error('   1. PostgreSQL is running on 16.52.210.100:5432');
      console.error('   2. Firewall allows connections from your IP');
    } else if (error.code === '28P01') {
      console.error('   Authentication failed. Check credentials.');
    } else if (error.code === '3D000') {
      console.error('   Database "chronos" does not exist.');
    }
    process.exit(1);
  } finally {
    await client.end();
    console.log('\n👋 Connection closed.');
  }
}

testConnection();
