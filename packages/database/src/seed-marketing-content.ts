/**
 * Marketing Content Seed Script
 *
 * Seeds the CMS with updated marketing copy focused on special situations
 * and distressed markets in Canada.
 *
 * Run this script to populate:
 * - cms_page_sections (section headers/subheaders)
 * - cms_comparison_items (feature comparison table)
 */

import postgres from 'postgres';
import { drizzle } from 'drizzle-orm/postgres-js';
import { pageSections, comparisonItems } from './schema/cms.js';

// Database connection
const connectionString = process.env.DATABASE_URL ||
  `postgresql://${process.env.DB_USER || 'chronos'}:${process.env.DB_PASSWORD || ''}@${process.env.DB_HOST || 'localhost'}:${process.env.DB_PORT || '5432'}/${process.env.DB_NAME || 'chronos'}`;

const client = postgres(connectionString);
const db = drizzle(client);

/**
 * Page Section Data
 * Updated with special situations / distressed market focus
 */
const pageSectionsData = [
  {
    sectionKey: 'problem-statement',
    pageName: 'homepage',
    headline: 'The Problem: Information is Public. Intelligence is Hidden.',
    subheadline: 'In a distressed market, the data you need is buried in 300-page monitor reports and fragmented spreadsheets. By the time you find the connection, the window has closed.',
    ctaText: null,
    ctaLink: null,
    enabled: true,
  },
  {
    sectionKey: 'solution-pillars',
    pageName: 'homepage',
    headline: 'Multi-Model Intelligence',
    subheadline: 'Four powerful database modalities working in harmony to deliver unprecedented insights',
    ctaText: 'Unifying public market ruins with private deal flow through one intelligence layer.',
    ctaLink: null,
    enabled: true,
  },
  {
    sectionKey: 'features-preview',
    pageName: 'homepage',
    headline: 'Built for the Special Situations Workflow',
    subheadline: 'Professional-grade tools designed to map the liquidity reset, identify forced sellers, and accelerate due diligence.',
    ctaText: null,
    ctaLink: null,
    enabled: true,
  },
  {
    sectionKey: 'use-cases',
    pageName: 'homepage',
    headline: 'Trusted by Leading Investors',
    subheadline: 'From venture capital to private equity, discover how top firms use Chronos to gain a competitive edge',
    ctaText: 'Ready to find the edge in the Canadian liquidity reset?',
    ctaLink: '#waitlist',
    enabled: true,
  },
  {
    sectionKey: 'feature-comparison',
    pageName: 'features',
    headline: 'Why Choose Chronos?',
    subheadline: 'See how Chronos compares to traditional private market research and CRM tools.',
    ctaText: 'Ready to find the edge in the Canadian liquidity reset?',
    ctaLink: '#waitlist',
    enabled: true,
  },
  {
    sectionKey: 'about-story',
    pageName: 'about',
    headline: 'Our Story',
    subheadline: `Chronos was born in Toronto during the most dramatic liquidity reset in private markets since 2008. As LP interests trade at 30%+ discounts and maturity walls loom, we saw capital allocators drowning in monitor reports, PDFs, and fragmented spreadsheets—all while the window to act narrowed by the day.

We built Chronos to solve a fundamental problem: in distressed markets, information is abundant but intelligence is scarce. While everyone has access to the same public filings and monitor reports, the real edge comes from seeing the hidden connections—who the monitor trusts, which lender is overextended, where the geographic concentrations create systemic risk.

Today, we're building the first intelligence layer purpose-built for special situations and distressed markets in Canada. We combine public market ruins with private deal flow, turning buried narratives into actionable intelligence for credit investors, restructuring advisors, and opportunistic capital allocators.`,
    ctaText: null,
    ctaLink: null,
    enabled: true,
  },
];

/**
 * Comparison Items Data
 * Updated with business outcomes focus instead of technical features
 */
const comparisonItemsData = [
  {
    category: 'Data Visibility',
    chronosValue: 'Unified Market Intelligence',
    traditionalValue: 'Fragmented Spreadsheets',
    sortOrder: 1,
    enabled: true,
  },
  {
    category: 'Referral Mapping',
    chronosValue: 'Automatic Path-to-Monitor',
    traditionalValue: 'Manual LinkedIn Digging',
    sortOrder: 2,
    enabled: true,
  },
  {
    category: 'Document Search',
    chronosValue: 'Deep Narrative Extraction',
    traditionalValue: 'Basic Keyword Search',
    sortOrder: 3,
    enabled: true,
  },
  {
    category: 'Liquidity Timing',
    chronosValue: 'Live "Maturity Wall" Alerts',
    traditionalValue: 'Static Historical Snapshots',
    sortOrder: 4,
    enabled: true,
  },
  {
    category: 'Location Context',
    chronosValue: 'Neighborhood Risk Heatmaps',
    traditionalValue: 'Isolated Address Fields',
    sortOrder: 5,
    enabled: true,
  },
  {
    category: 'Sourcing Speed',
    chronosValue: 'Instant Syndicate Analysis',
    traditionalValue: 'Weeks of "Shoe-Leather" Research',
    sortOrder: 6,
    enabled: true,
  },
  {
    category: 'Market Pulse',
    chronosValue: 'Real-time Filing Signals',
    traditionalValue: 'Delayed Quarterly Updates',
    sortOrder: 7,
    enabled: true,
  },
  {
    category: 'Accessibility',
    chronosValue: 'Modern Cloud Experience',
    traditionalValue: 'Legacy Desktop Software',
    sortOrder: 8,
    enabled: true,
  },
];

/**
 * Main seed function
 */
async function seedMarketingContent() {
  console.log('🌱 Seeding marketing content...\n');

  try {
    // 1. Seed page sections
    console.log('📄 Seeding page sections...');
    for (const section of pageSectionsData) {
      await db.insert(pageSections)
        .values(section)
        .onConflictDoUpdate({
          target: pageSections.sectionKey,
          set: {
            headline: section.headline,
            subheadline: section.subheadline,
            ctaText: section.ctaText,
            ctaLink: section.ctaLink,
            enabled: section.enabled,
            updatedAt: new Date(),
          },
        });
      console.log(`  ✓ ${section.sectionKey}`);
    }

    // 2. Seed comparison items
    console.log('\n📊 Seeding comparison items...');
    // First, delete all existing comparison items to avoid conflicts
    await db.delete(comparisonItems);

    // Then insert the new ones
    await db.insert(comparisonItems).values(comparisonItemsData);
    console.log(`  ✓ Inserted ${comparisonItemsData.length} comparison items`);

    console.log('\n✅ Marketing content seeded successfully!');
    console.log('\nNext steps:');
    console.log('1. Run the database migration: pnpm --filter @chronos/database db:push');
    console.log('2. Verify content in Directus CMS');
    console.log('3. Update feature items (problems, pillars, features, use cases) in Directus UI');
  } catch (error) {
    console.error('❌ Error seeding marketing content:', error);
    throw error;
  } finally {
    await client.end();
  }
}

// Run the seed function
seedMarketingContent()
  .then(() => {
    console.log('\n🎉 Done!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Seed failed:', error);
    process.exit(1);
  });
