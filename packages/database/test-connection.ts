/**
 * Test database connection
 * Run with: tsx test-connection.ts
 */

import { testConnection } from './src/client';

async function main() {
  console.log('Testing database connection...');
  console.log(`Host: ${process.env.DB_HOST || 'localhost'}`);
  console.log(`Port: ${process.env.DB_PORT || '5432'}`);
  console.log(`Database: ${process.env.DB_NAME || 'chronos'}`);
  console.log(`User: ${process.env.DB_USER || 'chronos'}`);
  console.log('');

  const isConnected = await testConnection();

  if (isConnected) {
    console.log('✅ Database connection successful!');
    process.exit(0);
  } else {
    console.log('❌ Database connection failed!');
    process.exit(1);
  }
}

main();
