#!/usr/bin/env node
/**
 * One-time setup script: creates the claw_contact_submissions collection in Directus.
 *
 * Usage:
 *   DIRECTUS_URL=https://admin.automatonicai.com \
 *   DIRECTUS_ADMIN_TOKEN=<your-admin-token> \
 *   node scripts/setup-directus-contact-collection.mjs
 *
 * The admin token can be found/created at:
 *   https://admin.automatonicai.com/admin/users → your user → Token
 */

const DIRECTUS_URL = process.env.DIRECTUS_URL || 'https://admin.automatonicai.com';
const TOKEN = process.env.DIRECTUS_ADMIN_TOKEN;

if (!TOKEN) {
  console.error('Error: DIRECTUS_ADMIN_TOKEN environment variable is required.');
  process.exit(1);
}

const headers = {
  'Content-Type': 'application/json',
  Authorization: `Bearer ${TOKEN}`,
};

async function directus(method, endpoint, body) {
  const res = await fetch(`${DIRECTUS_URL}${endpoint}`, {
    method,
    headers,
    ...(body ? { body: JSON.stringify(body) } : {}),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => res.statusText);
    throw new Error(`${method} ${endpoint} → ${res.status}: ${JSON.stringify(err)}`);
  }

  return res.status === 204 ? null : res.json();
}

// ---------------------------------------------------------------------------
// Collection definition
// ---------------------------------------------------------------------------

const COLLECTION = 'claw_contact_submissions';

const FIELDS = [
  {
    field: 'name',
    type: 'string',
    schema: { is_nullable: false, max_length: 255 },
    meta: { interface: 'input', display: 'raw', required: true, note: 'Full name of submitter' },
  },
  {
    field: 'email',
    type: 'string',
    schema: { is_nullable: false, max_length: 255 },
    meta: { interface: 'input', display: 'raw', required: true },
  },
  {
    field: 'company',
    type: 'string',
    schema: { is_nullable: true, max_length: 255 },
    meta: { interface: 'input', display: 'raw', required: false },
  },
  {
    field: 'subject',
    type: 'string',
    schema: { is_nullable: false, max_length: 100 },
    meta: { interface: 'input', display: 'raw', required: true, note: 'e.g. ai-setup, general' },
  },
  {
    field: 'message',
    type: 'text',
    schema: { is_nullable: false },
    meta: { interface: 'input-multiline', display: 'raw', required: true },
  },
  {
    field: 'status',
    type: 'string',
    schema: { is_nullable: false, max_length: 20, default_value: 'new' },
    meta: {
      interface: 'select-dropdown',
      display: 'labels',
      required: true,
      options: {
        choices: [
          { text: 'New', value: 'new' },
          { text: 'Contacted', value: 'contacted' },
          { text: 'Qualified', value: 'qualified' },
          { text: 'Closed', value: 'closed' },
        ],
      },
    },
  },
  {
    field: 'source',
    type: 'string',
    schema: { is_nullable: true, max_length: 100 },
    meta: { interface: 'input', display: 'raw', note: 'e.g. contact-form, referral' },
  },
  {
    field: 'ip_address',
    type: 'string',
    schema: { is_nullable: true, max_length: 45 },
    meta: { interface: 'input', display: 'raw', hidden: true },
  },
  {
    field: 'twenty_person_id',
    type: 'string',
    schema: { is_nullable: true, max_length: 36 },
    meta: { interface: 'input', display: 'raw', note: 'TwentyCRM Person UUID' },
  },
  {
    field: 'twenty_company_id',
    type: 'string',
    schema: { is_nullable: true, max_length: 36 },
    meta: { interface: 'input', display: 'raw', note: 'TwentyCRM Company UUID' },
  },
  {
    field: 'twenty_opportunity_id',
    type: 'string',
    schema: { is_nullable: true, max_length: 36 },
    meta: { interface: 'input', display: 'raw', note: 'TwentyCRM Opportunity UUID' },
  },
  {
    field: 'email_sent',
    type: 'boolean',
    schema: { is_nullable: false, default_value: false },
    meta: { interface: 'boolean', display: 'boolean' },
  },
  {
    field: 'notes',
    type: 'text',
    schema: { is_nullable: true },
    meta: { interface: 'input-multiline', display: 'raw', note: 'Internal notes' },
  },
];

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  console.log(`Setting up ${COLLECTION} in Directus at ${DIRECTUS_URL}\n`);

  // 1. Check if collection already exists
  try {
    const existing = await directus('GET', `/collections/${COLLECTION}`);
    if (existing?.data) {
      console.log(`Collection "${COLLECTION}" already exists — skipping creation.`);
    }
  } catch {
    // Doesn't exist — create it
    console.log(`Creating collection "${COLLECTION}"...`);
    await directus('POST', '/collections', {
      collection: COLLECTION,
      meta: {
        icon: 'contact_mail',
        note: 'Contact form submissions from clawdacious.com',
        sort_field: 'date_created',
        archive_field: 'status',
        archive_value: 'closed',
        unarchive_value: 'new',
      },
      schema: {
        name: COLLECTION,
      },
    });
    console.log(`  ✓ Collection created`);
  }

  // 2. Create each field (skip if it already exists)
  for (const field of FIELDS) {
    try {
      await directus('POST', `/fields/${COLLECTION}`, field);
      console.log(`  ✓ Field "${field.field}" created`);
    } catch (err) {
      if (err.message.includes('already exists') || err.message.includes('400')) {
        console.log(`  - Field "${field.field}" already exists — skipping`);
      } else {
        console.error(`  ✗ Field "${field.field}" failed:`, err.message);
      }
    }
  }

  console.log('\nDone! Visit Directus admin to verify the collection:');
  console.log(`  ${DIRECTUS_URL}/admin/content/${COLLECTION}`);
}

main().catch((err) => {
  console.error('Setup failed:', err.message);
  process.exit(1);
});
