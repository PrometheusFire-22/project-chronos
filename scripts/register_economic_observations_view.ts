import { createDirectus, rest, readCollections, createCollection, createField, createPermission, authentication } from '@directus/sdk';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.aws' });

const DIRECTUS_URL = process.env.DIRECTUS_URL || 'https://admin.automatonicai.com';
const DIRECTUS_EMAIL = process.env.DIRECTUS_ADMIN_EMAIL;
const DIRECTUS_PASSWORD = process.env.DIRECTUS_ADMIN_PASSWORD;

if (!DIRECTUS_EMAIL || !DIRECTUS_PASSWORD) {
    console.error('❌ Missing DIRECTUS_ADMIN_EMAIL or DIRECTUS_ADMIN_PASSWORD in .env.aws');
    process.exit(1);
}

async function registerView() {
    console.log('🚀 Starting Directus view registration...\n');

    const client = createDirectus(DIRECTUS_URL).with(rest()).with(authentication('json'));

    try {
        // Authenticate
        console.log('🔐 Authenticating with Directus...');
        await client.login(DIRECTUS_EMAIL, DIRECTUS_PASSWORD);
        console.log('✅ Authenticated\n');

        // Check if collection already exists
        console.log('🔍 Checking for existing collection...');
        const collections = await client.request(readCollections());
        const exists = collections.some((c: any) => c.collection === 'economic_observations_view');

        if (exists) {
            console.log('⚠️  Collection "economic_observations_view" already exists');
            console.log('   Skipping creation (you may need to update manually)\n');
        } else {
            // Create collection
            console.log('📦 Creating collection "economic_observations_view"...');
            await client.request(
                createCollection({
                    collection: 'economic_observations_view',
                    meta: {
                        collection: 'economic_observations_view',
                        icon: 'show_chart',
                        note: 'Economic time-series observations (read-only view for dashboards)',
                        display_template: '{{series_name}} - {{observation_date}}',
                        hidden: false,
                        singleton: false,
                        translations: null,
                        archive_field: null,
                        archive_app_filter: true,
                        archive_value: null,
                        unarchive_value: null,
                        sort_field: null,
                        accountability: 'all',
                        color: null,
                        item_duplication_fields: null,
                        sort: 1,
                        group: null,
                        collapse: 'open',
                        preview_url: null,
                        versioning: false,
                    },
                    schema: {
                        schema: 'analytics',
                        name: 'economic_observations_view',
                        comment: null,
                    },
                    fields: [
                        {
                            field: 'view_id',
                            type: 'integer',
                            meta: {
                                interface: 'input',
                                special: ['cast-integer'],
                                readonly: true,
                                hidden: true,
                                width: 'half',
                                sort: 1,
                            },
                            schema: {
                                is_primary_key: true,
                                has_auto_increment: false,
                                is_nullable: false,
                            },
                        },
                    ],
                })
            );
            console.log('✅ Collection created\n');
        }

        // Create permissions for Administrator policy
        console.log('🔐 Setting up permissions...');

        // Get Administrator policy ID
        const policies = await client.request(rest().get('/policies'));
        const adminPolicy = policies.find((p: any) => p.name === 'Administrator');

        if (adminPolicy) {
            // Grant read permission to Administrator
            await client.request(
                createPermission({
                    collection: 'economic_observations_view',
                    policy: adminPolicy.id,
                    action: 'read',
                    fields: ['*'],
                    permissions: {},
                    validation: {},
                })
            );
            console.log('✅ Administrator read permission granted');
        }

        // Get Public policy ID
        const publicPolicy = policies.find((p: any) => p.name === '$t:public_label' || p.name === 'Public');

        if (publicPolicy) {
            // Grant read permission to Public
            await client.request(
                createPermission({
                    collection: 'economic_observations_view',
                    policy: publicPolicy.id,
                    action: 'read',
                    fields: ['*'],
                    permissions: {},
                    validation: {},
                })
            );
            console.log('✅ Public read permission granted');
        }

        console.log('\n✅ View registration complete!');
        console.log('\n📊 Next steps:');
        console.log('   1. Restart Directus: docker compose restart directus');
        console.log('   2. Visit: https://admin.automatonicai.com/admin/content/economic_observations_view');
        console.log('   3. Create dashboard in Directus Insights');

    } catch (error: any) {
        console.error('\n❌ Error:', error.message);
        if (error.errors) {
            console.error('Details:', JSON.stringify(error.errors, null, 2));
        }
        process.exit(1);
    }
}

registerView();
