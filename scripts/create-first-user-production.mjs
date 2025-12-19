#!/usr/bin/env node

// This script creates the first admin user using Payload's server-side API
// It bypasses the broken client-side CreateFirstUser component

const PRODUCTION_DB = process.env.DATABASE_URL || process.env.POSTGRES_URL;
const PAYLOAD_SECRET = process.env.PAYLOAD_SECRET;
const SERVER_URL = process.env.NEXT_PUBLIC_SERVER_URL || 'https://automatonicai.com';

if (!PRODUCTION_DB || !PAYLOAD_SECRET) {
  console.error('❌ Missing required environment variables: DATABASE_URL and PAYLOAD_SECRET');
  process.exit(1);
}

// Ensure Payload can find the config
if (!process.env.PAYLOAD_CONFIG_PATH) {
  process.env.PAYLOAD_CONFIG_PATH = '../apps/web/payload.config.ts';
}

console.log('🚀 Initializing Payload CMS...\n');

// Dynamically import Payload (ESM)
import('../apps/web/node_modules/payload/dist/index.js')
  .then(async ({ getPayload }) => {
    console.log('✅ Payload module loaded\n');

    const configModule = await import('../apps/web/payload.config.ts');
    return getPayload({
      config: configModule.default
    });
  })
  .then((payload) => {
    console.log('✅ Payload initialized\n');
    console.log('👤 Creating first admin user...\n');

    return payload.create({
      collection: 'users',
      data: {
        email: process.env.ADMIN_EMAIL || 'admin@example.com',
        password: process.env.ADMIN_PASSWORD || 'temporary-password',
      },
    });
  })
  .then((user) => {
    console.log('✅ User created successfully!\n');
    console.log('   Email:', user.email);
    console.log('   ID:', user.id);
    console.log('');
    console.log('🔗 Login at: https://automatonicai.com/admin');
    console.log(`   Email: ${process.env.ADMIN_EMAIL || 'admin@example.com'}`);
    console.log('   Password: [HIDDEN] (See .env ADMIN_PASSWORD)');

    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Error:', error.message);
    console.error(error);
    process.exit(1);
  });
