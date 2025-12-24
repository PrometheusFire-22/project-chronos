#!/usr/bin/env tsx

/**
 * Populate Homepage Content in Directus
 *
 * This script populates Directus with edited homepage content
 * (reduced to 60-70% of original length while preserving voice).
 */

import fetch from 'node-fetch';

const DIRECTUS_URL = process.env.DIRECTUS_URL || 'https://admin.automatonicai.com';
const ADMIN_EMAIL = process.env.DIRECTUS_ADMIN_EMAIL || 'geoff@automatonicai.com';
const ADMIN_PASSWORD = process.env.DIRECTUS_ADMIN_PASSWORD!;

interface DirectusAuthResponse {
  data: {
    access_token: string;
    expires: number;
    refresh_token: string;
  };
}

interface DirectusItemResponse<T> {
  data: T;
}

async function authenticate(): Promise<string> {
  const response = await fetch(`${DIRECTUS_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD,
    }),
  });

  if (!response.ok) {
    throw new Error(`Authentication failed: ${response.statusText}`);
  }

  const data = (await response.json()) as DirectusAuthResponse;
  return data.data.access_token;
}

async function createItem<T>(
  token: string,
  collection: string,
  item: unknown
): Promise<T> {
  const response = await fetch(`${DIRECTUS_URL}/items/${collection}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(item),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to create ${collection} item: ${error}`);
  }

  const data = (await response.json()) as DirectusItemResponse<T>;
  return data.data;
}

async function main() {
  console.log('🔐 Authenticating with Directus...');
  const token = await authenticate();
  console.log('✅ Authenticated successfully\n');

  // ============================================================
  // 1. Homepage Hero Section (Singleton - use PATCH)
  // ============================================================
  console.log('📝 Updating homepage hero (singleton)...');

  const heroData = {
    headline: 'See the Hidden Connections in Your Deal Flow',
    subheadline:
      'Graph database technology reveals multi-hop connections, board network effects, and syndication patterns traditional CRMs miss. Purpose-built for PE/VC/IB professionals.',
    cta_primary_text: 'Join Early Access Waitlist',
    cta_primary_link: '#waitlist',
    cta_secondary_text: 'Explore the Technology →',
    cta_secondary_link: '/features',
    background_image: null, // Will use CSS gradient
    background_video: null,
    active: true,
  };

  // Singleton collections use PATCH, not POST
  const heroResponse = await fetch(`${DIRECTUS_URL}/items/cms_homepage_hero`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(heroData),
  });

  if (!heroResponse.ok) {
    const error = await heroResponse.text();
    throw new Error(`Failed to update homepage hero: ${error}`);
  }

  const hero = await heroResponse.json();
  console.log(`✅ Hero updated\n`);

  // ============================================================
  // 2. Problem Points (3 cards)
  // ============================================================
  console.log('📝 Creating problem points...');

  const problemPoints = [
    {
      title: 'Who Knows Who?',
      slug: 'problem-missed-connections',
      description:
        "LinkedIn shows direct connections. PitchBook shows deal history. But neither reveals that your LP's investment consultant sits on the board of your target company's parent. Those multi-hop paths? You're discovering them by accident—or not at all.",
      icon: 'network',
      category: 'problem-point',
      sort_order: 1,
      enabled: true,
    },
    {
      title: 'One-Dimensional Tracking',
      slug: 'problem-surface-data',
      description:
        "Salesforce stores \"Contact A works at Company B.\" What it doesn't show: Company B's co-investment patterns, geographic clustering, or how relationship strength decays over time. You're flying blind on the dimensions that matter.",
      icon: 'layers',
      category: 'problem-point',
      sort_order: 2,
      enabled: true,
    },
    {
      title: 'Hours of Spreadsheet Archaeology',
      slug: 'problem-manual-research',
      description:
        "Cross-referencing investor lists, scraping board member data, tracking re-up rates across funds. You've spent hundreds of hours building relationship maps that are outdated the moment you finish them.",
      icon: 'search',
      category: 'problem-point',
      sort_order: 3,
      enabled: true,
    },
  ];

  for (const point of problemPoints) {
    const created = await createItem(token, 'cms_features', point);
    console.log(`  ✅ ${point.title}`);
  }
  console.log('');

  // ============================================================
  // 3. Solution Pillars (4 database modalities)
  // ============================================================
  console.log('📝 Creating solution pillars...');

  const pillars = [
    {
      title: 'Graph Database',
      slug: 'pillar-graph',
      description:
        "Multi-hop relationship traversal reveals warm introduction routes, board network influence, and syndication patterns. Not foreign keys—native graph queries.\\n\\n**Example**: Find the 2-degree path from you to a portfolio company CEO through shared LP relationships.",
      icon: 'git-graph',
      image: 'graph-database-dark.svg',
      category: 'solution-pillar',
      sort_order: 1,
      enabled: true,
    },
    {
      title: 'Vector Search',
      slug: 'pillar-vector',
      description:
        "AI-powered semantic search matches companies by description similarity—not tags. Discover lookalike prospects and pattern-match successful investments.\\n\\n**Example**: Search \\\"SaaS companies with strong network effects in healthcare\\\" and get ranked results by semantic relevance.",
      icon: 'box',
      image: 'vector-database-dark.svg',
      category: 'solution-pillar',
      sort_order: 2,
      enabled: true,
    },
    {
      title: 'Geospatial Analysis',
      slug: 'pillar-geospatial',
      description:
        "Overlay economic indicators, identify geographic portfolio clustering, analyze regional market trends. Your relationships have location context.\\n\\n**Example**: Visualize all portfolio companies within 50 miles of high-growth tech hubs, correlated with local GDP trends.",
      icon: 'map-pin',
      image: 'geospatial-database-dark.svg',
      category: 'solution-pillar',
      sort_order: 3,
      enabled: true,
    },
    {
      title: 'Time-Series Analytics',
      slug: 'pillar-timeseries',
      description:
        "Detect relationship decay, optimize outreach timing, analyze deal velocity trends. Relationships aren't static—neither is your data.\\n\\n**Example**: Alert me when an LP I haven't contacted in 6 months shows declining interaction strength.",
      icon: 'activity',
      image: 'timeseries-database-dark.svg',
      category: 'solution-pillar',
      sort_order: 4,
      enabled: true,
    },
  ];

  for (const pillar of pillars) {
    const created = await createItem(token, 'cms_features', pillar);
    console.log(`  ✅ ${pillar.title}`);
  }
  console.log('');

  // ============================================================
  // 4. Key Features (3 cards)
  // ============================================================
  console.log('📝 Creating key features...');

  const keyFeatures = [
    {
      title: 'Warm Introduction Pathfinding',
      slug: 'feature-pathfinding',
      description:
        "Don't cold-call when a 2-degree connection exists. Graph queries find optimal introduction routes through your network—ranked by relationship strength.",
      icon: 'route',
      category: 'key-feature',
      sort_order: 1,
      enabled: true,
    },
    {
      title: 'Co-Investment Network Analysis',
      slug: 'feature-syndication',
      description:
        'Which LPs consistently co-invest with your targets? Which GPs have board seat overlap? Surface network effects that predict deal flow.',
      icon: 'users',
      category: 'key-feature',
      sort_order: 2,
      enabled: true,
    },
    {
      title: 'Re-Up Rate Intelligence',
      slug: 'feature-reup-tracking',
      description:
        "LinkedIn doesn't tell you who invested in Apollo Fund XII but didn't re-up for XIII. We do. Identify relationship shifts before they become deal blockers.",
      icon: 'trending-up',
      category: 'key-feature',
      sort_order: 3,
      enabled: true,
    },
  ];

  for (const feature of keyFeatures) {
    const created = await createItem(token, 'cms_features', feature);
    console.log(`  ✅ ${feature.title}`);
  }
  console.log('');

  // ============================================================
  // 5. Use Cases (3 scenarios)
  // ============================================================
  console.log('📝 Creating use cases...');

  const useCases = [
    {
      title: 'Board Network Influence Mapping',
      slug: 'usecase-board-network',
      description:
        "**Scenario**: You're targeting a software company for acquisition. Your LP sits on the board of the target's largest customer.\\n\\n**Traditional CRM**: Shows your LP as \\\"Contact\\\" and target as \\\"Prospect.\\\" No connection visible.\\n\\n**Project Chronos**: Graph query reveals 2-hop path: Your LP → Board Seat at Customer → Customer-Target Vendor Relationship. Warm intro route identified.\\n\\n**Outcome**: Instead of cold outreach, you leverage existing relationship for insider perspective and warm introduction.",
      icon: 'sitemap',
      category: 'use-case',
      sort_order: 1,
      enabled: true,
    },
    {
      title: 'Syndication Pattern Discovery',
      slug: 'usecase-syndication',
      description:
        "**Scenario**: You want to identify which LPs are likely to co-invest on your next deal based on historical syndication patterns.\\n\\n**Traditional CRM**: Manual spreadsheet cross-referencing of past deals. Hours of work, outdated by next week.\\n\\n**Project Chronos**: Vector search finds similar deals by description. Graph queries show which LPs co-invested on those deals. Time-series analysis shows re-up patterns.\\n\\n**Outcome**: Ranked list of probable co-investors with strength scores. Proactive outreach to the right partners.",
      icon: 'share-2',
      category: 'use-case',
      sort_order: 2,
      enabled: true,
    },
    {
      title: 'Geographic Market Expansion',
      slug: 'usecase-geographic',
      description:
        "**Scenario**: You want to expand into Southeast US markets but need to understand where your network has existing presence and where high-growth opportunities exist.\\n\\n**Traditional CRM**: Manual filtering by address field. No economic context.\\n\\n**Project Chronos**: PostGIS geospatial queries cluster your portfolio companies by region. Overlay FRED economic data (GDP growth, employment trends). Identify underserved high-growth markets.\\n\\n**Outcome**: Data-driven territory expansion strategy with relationship leverage mapping.",
      icon: 'map',
      category: 'use-case',
      sort_order: 3,
      enabled: true,
    },
  ];

  for (const useCase of useCases) {
    const created = await createItem(token, 'cms_features', useCase);
    console.log(`  ✅ ${useCase.title}`);
  }
  console.log('');

  console.log('🎉 Homepage content populated successfully!');
  console.log('\nSummary:');
  console.log('  - 1 hero section');
  console.log('  - 3 problem points');
  console.log('  - 4 solution pillars');
  console.log('  - 3 key features');
  console.log('  - 3 use cases');
  console.log('\nNote: Comparison table and founder credibility sections need additional schema tables.');
}

main().catch((error) => {
  console.error('❌ Error:', error);
  process.exit(1);
});
