#!/usr/bin/env node
import { getPayload } from 'payload';
import config from '@payload-config';

async function createAdmin() {
  try {
    const payload = await getPayload({ config });

    console.log('Creating admin user...');

    const user = await payload.create({
      collection: 'users',
      data: {
        email: 'geoff@automatonicai.com',
        password: 'ChangeMe123!',
      },
    });

    console.log('✅ Admin user created successfully!');
    console.log('   Email:', user.email);
    console.log('   ID:', user.id);
    console.log('\n⚠️  IMPORTANT: Change password after first login!');
    console.log('\n🔗 Login at: https://www.automatonicai.com/admin');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating admin user:', error.message);
    process.exit(1);
  }
}

createAdmin();
