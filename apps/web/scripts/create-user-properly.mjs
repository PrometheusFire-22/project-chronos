#!/usr/bin/env node
import { getPayload } from 'payload';
import config from '../payload.config.js';

async function createUser() {
  const payload = await getPayload({ config });

  try {
    // Delete existing manually-created user first
    await payload.delete({
      collection: 'users',
      where: {
        email: { equals: 'geoff@automatonicai.com' },
      },
    });
    console.log('Deleted old user');
  } catch (e) {
    console.log('No existing user to delete');
  }

  // Create user properly through Payload
  const user = await payload.create({
    collection: 'users',
    data: {
      email: 'geoff@automatonicai.com',
      password: 'ChangeMe123!',
    },
  });

  console.log('✅ User created properly through Payload!');
  console.log('   Email:', user.email);
  console.log('   ID:', user.id);
  console.log('');
  console.log('🔗 Login at: https://www.automatonicai.com/admin');

  process.exit(0);
}

createUser().catch((error) => {
  console.error('❌ Error:', error.message);
  process.exit(1);
});
