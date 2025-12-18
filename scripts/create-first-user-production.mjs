#!/usr/bin/env node

// This script creates the first admin user using Payload's server-side API
// It bypasses the broken client-side CreateFirstUser component

const PRODUCTION_DB = 'postgresql://chronos:DZ4eNOynmfYVOtG8c8TBlXIGVGlqkvWKQR5ixYYjAMs=@16.52.210.100:5432/chronos';
const PAYLOAD_SECRET = '9c16b26c34e6fc4ff3bd1e7397cf13d569f4468276ee532115dac41919f82fb8';
const SERVER_URL = 'https://automatonicai.com';

// Set environment variables for production
process.env.POSTGRES_URL = PRODUCTION_DB;
process.env.PAYLOAD_SECRET = PAYLOAD_SECRET;
process.env.NEXT_PUBLIC_SERVER_URL = SERVER_URL;
process.env.S3_BUCKET = 'project-chronos-media';
process.env.S3_REGION = 'ca-central-1';

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
        email: 'geoff@automatonicai.com',
        password: 'ChangeMe123!',
      },
    });
  })
  .then((user) => {
    console.log('✅ User created successfully!\n');
    console.log('   Email:', user.email);
    console.log('   ID:', user.id);
    console.log('');
    console.log('🔗 Login at: https://automatonicai.com/admin');
    console.log('   Email: geoff@automatonicai.com');
    console.log('   Password: ChangeMe123!');

    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Error:', error.message);
    console.error(error);
    process.exit(1);
  });
