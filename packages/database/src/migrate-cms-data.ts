/**
 * CHRONOS-455: Data Migration Script
 *
 * Migrates data from cms_features to new page-based collections:
 * - problem-point → cms_homepage_problems
 * - solution-pillar → cms_homepage_pillars
 * - key-feature → cms_homepage_features
 * - use-case → cms_homepage_use_cases
 * - features-detail → cms_features_capabilities
 * - about-section → cms_about_values
 *
 * Also creates:
 * - Hero singletons for Features and About pages
 * - CTA sections for strategic placement
 *
 * This script is idempotent - safe to run multiple times.
 */

import postgres from 'postgres';

const connectionString = process.env.DATABASE_URL ||
  `postgresql://${process.env.DB_USER || 'chronos'}:${process.env.DB_PASSWORD || ''}@${process.env.DB_HOST || 'localhost'}:${process.env.DB_PORT || '5432'}/${process.env.DB_NAME || 'chronos'}`;

const client = postgres(connectionString);

interface OldFeature {
  id: string;
  title: string;
  slug: string;
  description: string;
  icon: string | null;
  image: string | null;
  category: string | null;
  sort_order: number;
  enabled: boolean;
  created_at: Date;
  updated_at: Date;
}

async function migrateData() {
  console.log('🔄 Starting CMS data migration (CHRONOS-455)...\n');

  try {
    // Start transaction
    await client.begin(async (sql) => {
      console.log('📊 Step 1: Fetching data from cms_features...');
      const oldFeatures = await sql<OldFeature[]>`
        SELECT * FROM cms_features
        ORDER BY category, sort_order
      `;
      console.log(`   Found ${oldFeatures.length} items\n`);

      // Migrate problem-point → cms_homepage_problems
      console.log('📝 Step 2: Migrating problem-point → cms_homepage_problems...');
      const problems = oldFeatures.filter(f => f.category === 'problem-point');
      for (const problem of problems) {
        await sql`
          INSERT INTO cms_homepage_problems (
            title, description, icon, sort_order, enabled, created_at, updated_at
          ) VALUES (
            ${problem.title},
            ${problem.description},
            ${problem.icon},
            ${problem.sort_order},
            ${problem.enabled},
            ${problem.created_at},
            ${problem.updated_at}
          )
          ON CONFLICT DO NOTHING
        `;
      }
      console.log(`   ✅ Migrated ${problems.length} problem points\n`);

      // Migrate solution-pillar → cms_homepage_pillars
      console.log('📝 Step 3: Migrating solution-pillar → cms_homepage_pillars...');
      const pillars = oldFeatures.filter(f => f.category === 'solution-pillar');
      for (const pillar of pillars) {
        await sql`
          INSERT INTO cms_homepage_pillars (
            title, slug, description, icon, image, sort_order, enabled, created_at, updated_at
          ) VALUES (
            ${pillar.title},
            ${pillar.slug},
            ${pillar.description},
            ${pillar.icon},
            ${pillar.image},
            ${pillar.sort_order},
            ${pillar.enabled},
            ${pillar.created_at},
            ${pillar.updated_at}
          )
          ON CONFLICT (slug) DO NOTHING
        `;
      }
      console.log(`   ✅ Migrated ${pillars.length} solution pillars\n`);

      // Migrate key-feature → cms_homepage_features
      console.log('📝 Step 4: Migrating key-feature → cms_homepage_features...');
      const features = oldFeatures.filter(f => f.category === 'key-feature');
      for (const feature of features) {
        await sql`
          INSERT INTO cms_homepage_features (
            title, description, icon, sort_order, enabled, created_at, updated_at
          ) VALUES (
            ${feature.title},
            ${feature.description},
            ${feature.icon},
            ${feature.sort_order},
            ${feature.enabled},
            ${feature.created_at},
            ${feature.updated_at}
          )
          ON CONFLICT DO NOTHING
        `;
      }
      console.log(`   ✅ Migrated ${features.length} homepage features\n`);

      // Migrate use-case → cms_homepage_use_cases
      console.log('📝 Step 5: Migrating use-case → cms_homepage_use_cases...');
      const useCases = oldFeatures.filter(f => f.category === 'use-case');
      for (const useCase of useCases) {
        await sql`
          INSERT INTO cms_homepage_use_cases (
            title, description, icon, sort_order, enabled, created_at, updated_at
          ) VALUES (
            ${useCase.title},
            ${useCase.description},
            ${useCase.icon},
            ${useCase.sort_order},
            ${useCase.enabled},
            ${useCase.created_at},
            ${useCase.updated_at}
          )
          ON CONFLICT DO NOTHING
        `;
      }
      console.log(`   ✅ Migrated ${useCases.length} use cases\n`);

      // Migrate features-detail → cms_features_capabilities
      console.log('📝 Step 6: Migrating features-detail → cms_features_capabilities...');
      const capabilities = oldFeatures.filter(f => f.category === 'features-detail');
      for (const capability of capabilities) {
        await sql`
          INSERT INTO cms_features_capabilities (
            title, description, icon, image, sort_order, enabled, created_at, updated_at
          ) VALUES (
            ${capability.title},
            ${capability.description},
            ${capability.icon},
            ${capability.image},
            ${capability.sort_order},
            ${capability.enabled},
            ${capability.created_at},
            ${capability.updated_at}
          )
          ON CONFLICT DO NOTHING
        `;
      }
      console.log(`   ✅ Migrated ${capabilities.length} capabilities\n`);

      // Migrate about-section → cms_about_values
      console.log('📝 Step 7: Migrating about-section → cms_about_values...');
      const values = oldFeatures.filter(f => f.category === 'about-section');
      for (const value of values) {
        await sql`
          INSERT INTO cms_about_values (
            title, description, icon, sort_order, enabled, created_at, updated_at
          ) VALUES (
            ${value.title},
            ${value.description},
            ${value.icon},
            ${value.sort_order},
            ${value.enabled},
            ${value.created_at},
            ${value.updated_at}
          )
          ON CONFLICT DO NOTHING
        `;
      }
      console.log(`   ✅ Migrated ${values.length} about values\n`);

      // Create Features Hero singleton
      console.log('📝 Step 8: Creating Features Hero singleton...');
      await sql`
        INSERT INTO cms_features_hero (
          headline,
          subheadline,
          active,
          created_at,
          updated_at
        ) VALUES (
          'Enterprise-Grade Intelligence Platform',
          'Unified graph, vector, geospatial, and time-series capabilities built for special situations investors navigating the Canadian liquidity reset.',
          true,
          NOW(),
          NOW()
        )
        ON CONFLICT DO NOTHING
      `;
      console.log('   ✅ Created Features Hero\n');

      // Create About Hero singleton
      console.log('📝 Step 9: Creating About Hero singleton...');
      await sql`
        INSERT INTO cms_about_hero (
          headline,
          subheadline,
          active,
          created_at,
          updated_at
        ) VALUES (
          'Born in the Liquidity Reset',
          'Chronos was built in Toronto during the most dramatic private market reset since 2008. We saw opportunity where others saw chaos.',
          true,
          NOW(),
          NOW()
        )
        ON CONFLICT DO NOTHING
      `;
      console.log('   ✅ Created About Hero\n');

      // Create CTA Sections
      console.log('📝 Step 10: Creating CTA sections...');

      const ctaSections = [
        // Homepage CTAs
        {
          section_key: 'homepage-post-problems',
          page_name: 'homepage',
          placement: 'post-problems',
          headline: 'Tired of fragmented data?',
          subheadline: 'See how Chronos unifies everything into a single intelligence layer.',
          primary_cta_text: 'Get Early Access',
          primary_cta_link: '/waitlist',
          variant: 'inline'
        },
        {
          section_key: 'homepage-post-pillars',
          page_name: 'homepage',
          placement: 'post-pillars',
          headline: 'Ready to harness multi-modal intelligence?',
          subheadline: 'Join leading investors using Chronos to find edges in distressed markets.',
          primary_cta_text: 'Join the Waitlist',
          primary_cta_link: '/waitlist',
          secondary_cta_text: 'View Demo',
          secondary_cta_link: '/demo',
          variant: 'banner'
        },
        {
          section_key: 'homepage-post-use-cases',
          page_name: 'homepage',
          placement: 'post-use-cases',
          headline: 'Join leading investors using Chronos',
          subheadline: 'Get early access to the platform built for the Canadian liquidity reset.',
          primary_cta_text: 'Request Access',
          primary_cta_link: '/waitlist',
          variant: 'full'
        },

        // Features Page CTAs
        {
          section_key: 'features-post-capabilities',
          page_name: 'features',
          placement: 'post-capabilities',
          headline: 'See these capabilities in action',
          subheadline: 'Request a personalized demo of how Chronos can accelerate your workflow.',
          primary_cta_text: 'Schedule Demo',
          primary_cta_link: '/waitlist',
          variant: 'inline'
        },
        {
          section_key: 'features-post-comparison',
          page_name: 'features',
          placement: 'post-comparison',
          headline: 'Experience the Chronos advantage',
          subheadline: 'Stop piecing together fragmented tools. Start making faster decisions.',
          primary_cta_text: 'Get Started',
          primary_cta_link: '/waitlist',
          secondary_cta_text: 'Learn More',
          secondary_cta_link: '/about',
          variant: 'full'
        },

        // About Page CTAs
        {
          section_key: 'about-post-story',
          page_name: 'about',
          placement: 'post-story',
          headline: 'Join us in building the future',
          subheadline: 'Be part of the platform reshaping how investors navigate distressed markets.',
          primary_cta_text: 'Get Early Access',
          primary_cta_link: '/waitlist',
          variant: 'inline'
        },
        {
          section_key: 'about-post-values',
          page_name: 'about',
          placement: 'post-values',
          headline: 'Share our vision?',
          subheadline: 'Join the investors already using Chronos to find edges in the liquidity reset.',
          primary_cta_text: 'Join Waitlist',
          primary_cta_link: '/waitlist',
          variant: 'banner'
        }
      ];

      for (const cta of ctaSections) {
        await sql`
          INSERT INTO cms_cta_sections (
            section_key,
            page_name,
            placement,
            headline,
            subheadline,
            primary_cta_text,
            primary_cta_link,
            secondary_cta_text,
            secondary_cta_link,
            variant,
            enabled,
            created_at,
            updated_at
          ) VALUES (
            ${cta.section_key},
            ${cta.page_name},
            ${cta.placement},
            ${cta.headline},
            ${cta.subheadline},
            ${cta.primary_cta_text},
            ${cta.primary_cta_link},
            ${cta.secondary_cta_text || null},
            ${cta.secondary_cta_link || null},
            ${cta.variant},
            true,
            NOW(),
            NOW()
          )
          ON CONFLICT (section_key) DO NOTHING
        `;
      }
      console.log(`   ✅ Created ${ctaSections.length} CTA sections\n`);

      console.log('✅ Transaction complete! All data migrated successfully.\n');
    });

    // Verification queries
    console.log('🔍 Verification:');
    const counts = await client`
      SELECT
        (SELECT COUNT(*) FROM cms_homepage_problems) as problems,
        (SELECT COUNT(*) FROM cms_homepage_pillars) as pillars,
        (SELECT COUNT(*) FROM cms_homepage_features) as features,
        (SELECT COUNT(*) FROM cms_homepage_use_cases) as use_cases,
        (SELECT COUNT(*) FROM cms_features_capabilities) as capabilities,
        (SELECT COUNT(*) FROM cms_about_values) as values,
        (SELECT COUNT(*) FROM cms_features_hero) as features_hero,
        (SELECT COUNT(*) FROM cms_about_hero) as about_hero,
        (SELECT COUNT(*) FROM cms_cta_sections) as cta_sections,
        (SELECT COUNT(*) FROM cms_features) as old_features
    `;

    console.log('\n📊 Migration Summary:');
    console.log('┌────────────────────────────┬───────┐');
    console.log('│ Collection                 │ Count │');
    console.log('├────────────────────────────┼───────┤');
    console.log(`│ cms_homepage_problems      │   ${counts[0].problems}   │`);
    console.log(`│ cms_homepage_pillars       │   ${counts[0].pillars}   │`);
    console.log(`│ cms_homepage_features      │   ${counts[0].features}   │`);
    console.log(`│ cms_homepage_use_cases     │   ${counts[0].use_cases}   │`);
    console.log(`│ cms_features_capabilities  │   ${counts[0].capabilities}   │`);
    console.log(`│ cms_about_values           │   ${counts[0].values}   │`);
    console.log(`│ cms_features_hero          │   ${counts[0].features_hero}   │`);
    console.log(`│ cms_about_hero             │   ${counts[0].about_hero}   │`);
    console.log(`│ cms_cta_sections           │   ${counts[0].cta_sections}   │`);
    console.log('├────────────────────────────┼───────┤');
    console.log(`│ cms_features (old - kept)  │  ${counts[0].old_features}  │`);
    console.log('└────────────────────────────┴───────┘\n');

    console.log('✅ Migration complete! Old cms_features table preserved as backup.\n');
    console.log('📋 Next Steps:');
    console.log('  1. Verify data in Directus: https://admin.automatonicai.com');
    console.log('  2. Update Next.js code to use new collections (CHRONOS-456)');
    console.log('  3. Create CTA component (CHRONOS-457)');
    console.log('  4. Test and verify (CHRONOS-458)\n');

  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  } finally {
    await client.end();
  }
}

// Run the migration
migrateData()
  .then(() => {
    console.log('🎉 Done!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Migration failed:', error);
    process.exit(1);
  });
