#!/usr/bin/env tsx

import { createDirectus, rest, authentication, readCollections, updateCollection } from '@directus/sdk';
import * as dotenv from 'dotenv';

dotenv.config();

// Try localhost first since that's what the user might be testing, fallback to prod
const DIRECTUS_URL = 'http://localhost:8055';
const ADMIN_EMAIL = process.env.DIRECTUS_ADMIN_EMAIL!;
const ADMIN_PASSWORD = process.env.DIRECTUS_ADMIN_PASSWORD!;

const client = createDirectus(DIRECTUS_URL)
    .with(authentication())
    .with(rest());

async function main() {
    console.log('🔐 Authenticating with Directus...');
    try {
        await client.login({ email: ADMIN_EMAIL, password: ADMIN_PASSWORD });
        console.log('✅ Authenticated\n');
    } catch (error) {
        console.error('❌ Authentication failed:', error);
        process.exit(1);
    }

    const collectionsToFix = [
        { name: 'economic_observations', pk: 'id' },
        { name: 'us_states', pk: 'gid' },
        { name: 'us_counties', pk: 'gid' },
        { name: 'us_cbsa', pk: 'gid' },
        { name: 'us_csa', pk: 'gid' },
        { name: 'us_metdiv', pk: 'gid' },
        { name: 'ca_provinces', pk: 'gid' }
    ];

    for (const col of collectionsToFix) {
        console.log(`🔧 Fixing metadata for ${col.name}...`);
        try {
            // We read first to see if it exists
            const allCols = await client.request(readCollections());
            const exists = allCols.some((c: any) => c.collection === col.name);

            if (exists) {
                await client.request(updateCollection(col.name, {
                    primary_key: col.pk
                } as any));
                console.log(`✅ ${col.name} updated to use ${col.pk} as Primary Key`);
            } else {
                console.warn(`⚠️  Collection ${col.name} not found in Directus metadata.`);
            }
        } catch (error: any) {
            console.error(`❌ Failed to fix ${col.name}:`, error.message);
        }
    }
}

main();
