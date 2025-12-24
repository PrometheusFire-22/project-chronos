#!/usr/bin/env tsx

/**
 * Populate Features Page Content in Directus
 *
 * Creates detailed feature entries for the /features page,
 * covering the 4 database modalities in depth.
 */

import fetch from 'node-fetch';

const DIRECTUS_URL = process.env.DIRECTUS_URL || 'https://admin.automatonicai.com';
const ADMIN_EMAIL = process.env.DIRECTUS_ADMIN_EMAIL || 'geoff@automatonicai.com';
const ADMIN_PASSWORD = process.env.DIRECTUS_ADMIN_PASSWORD!;

interface DirectusAuthResponse {
  data: {
    access_token: string;
  };
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

async function createItem<T>(token: string, collection: string, item: unknown): Promise<T> {
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

  const data = await response.json();
  return data.data as T;
}

async function main() {
  console.log('🔐 Authenticating with Directus...');
  const token = await authenticate();
  console.log('✅ Authenticated successfully\\n');

  console.log('📝 Creating features page sections...\\n');

  // ============================================================
  // Graph Database Deep Dive
  // ============================================================
  const graphFeature = {
    title: 'Graph Database Intelligence',
    slug: 'features-graph-database',
    description: `**Apache AGE | Relationship Networks, Revealed**

Traditional CRMs store relationships as foreign keys in flat tables. Graph databases treat relationships as first-class entities—enabling multi-hop traversal, influence mapping, and network effect discovery that SQL queries can't match.

## The Problem

Imagine you want to answer: *"Show me the shortest introduction path from me to the CEO of Target Company X, ranked by relationship strength."*

In a traditional CRM, you can't traverse multi-hop relationships without complex self-joins that become unmanageable beyond 2 degrees. Manual LinkedIn stalking begins.

## The Solution: Graph Queries

With Apache AGE Cypher queries, you can instantly find warm introduction routes, ranked by relationship strength and path length. Visualize the entire network path from you to any contact.

## Key Capabilities

### Multi-Hop Connection Strength
Calculate cumulative relationship strength across multiple hops. Not just "Who knows who?" but "How strong is the 3-degree connection?"

**Use Case**: You're targeting a portfolio company CEO. Graph query reveals your LP sits on the board of the CEO's previous company. Relationship strength score: 0.78 (strong). Instead of cold-calling, you route the intro for higher response rate and faster deal velocity.

### Board Network Influence Mapping
Identify overlapping board seats across portfolio companies, target companies, and LP networks. Surface hidden influence patterns and "super-connectors" who sit on multiple boards.

**Use Case**: Discover a single individual sits on boards of 3 portfolio companies + 2 target acquisitions. They're a key influencer you should cultivate.

### Co-Investment Syndication Patterns
Analyze historical co-investment patterns to predict future syndication opportunities. Which LPs consistently invest together? Which GPs have overlapping strategies?

**Use Case**: You're raising Fund III. Query reveals which LPs have historically co-invested with your top commitments. Proactive outreach to likely syndicate partners.

### Re-Up Rate Intelligence
Track which LPs re-committed to subsequent funds and which didn't. Graph + time-series combination shows relationship evolution and decay signals.

**Use Case**: Identify LPs who stopped re-upping with specific managers. Reach out to understand why—potential new relationship opportunity.`,
    icon: 'git-graph',
    image: 'graph-database-dark.svg',
    category: 'features-detail',
    sort_order: 1,
    enabled: true,
  };

  await createItem(token, 'cms_features', graphFeature);
  console.log('  ✅ Graph Database Intelligence');

  // ============================================================
  // Vector Search Deep Dive
  // ============================================================
  const vectorFeature = {
    title: 'Vector Search Intelligence',
    slug: 'features-vector-search',
    description: `**pgvector | Semantic Matching, Powered by AI**

Keyword search finds exact matches. Vector search understands meaning—enabling semantic similarity queries that surface relevant companies, deals, and contacts even when descriptions vary.

## The Problem

You want to find companies similar to your successful SaaS investment. Company A says "cloud-based customer data platform with real-time analytics." Company B says "CDP enabling unified customer insights." Company C says "marketing automation with embedded BI."

Keyword search only finds Company A (exact match). It misses B and C despite similar functionality.

## The Solution: Vector Embeddings

AI-powered embeddings convert text into numerical vectors that capture semantic meaning. Companies with similar business models cluster together in vector space—regardless of exact wording.

## Key Capabilities

### Semantic Company Matching
Find lookalike companies based on description similarity, not keyword overlap. Search "SaaS companies with strong network effects" and get ranked results by semantic relevance.

**Use Case**: Identify acquisition targets similar to your best-performing portfolio company. Surface prospects you'd never find with keyword search alone.

### Deal Pattern Recognition
Vector search across historical deals to find similar transaction structures, terms, or market dynamics. Pattern-match successful investments to identify new opportunities.

**Use Case**: Find deals with similar cap tables, board structures, or investor syndication patterns to your highest-returning investments.

### Contact Role Intelligence
Understand role similarity beyond job titles. "VP Revenue Operations" and "Chief Revenue Officer" are semantically similar even if keywords differ.

**Use Case**: Build targeted contact lists for outreach based on functional role similarity, not rigid title matching.`,
    icon: 'box',
    image: 'vector-database-dark.svg',
    category: 'features-detail',
    sort_order: 2,
    enabled: true,
  };

  await createItem(token, 'cms_features', vectorFeature);
  console.log('  ✅ Vector Search Intelligence');

  // ============================================================
  // Geospatial Analysis Deep Dive
  // ============================================================
  const geoFeature = {
    title: 'Geospatial Analysis',
    slug: 'features-geospatial',
    description: `**PostGIS | Map Regional Opportunities**

Your relationships have location context. Geospatial analysis overlays economic indicators, identifies geographic portfolio clustering, and analyzes regional market trends.

## The Problem

Traditional CRMs reduce geography to an address field. You can't analyze spatial relationships, regional clustering, or economic context at scale.

Want to know which high-growth tech hubs have low portfolio density? Manual spreadsheet analysis with ZIP code lookups.

## The Solution: PostGIS Queries

PostGIS enables spatial queries: distance calculations, regional clustering, polygon containment, and economic data overlay. Visualize your network on an intelligent map.

## Key Capabilities

### Portfolio Geographic Clustering
Identify where your portfolio companies and LP relationships concentrate geographically. Spot regional strength and gaps.

**Use Case**: Visualize all portfolio companies within 50 miles of high-growth tech hubs, correlated with local GDP trends. Identify underserved high-growth markets for expansion.

### Regional Market Intelligence
Overlay FRED economic data (GDP growth, employment trends, industry concentration) on your relationship map. Understand which markets are heating up.

**Use Case**: Target expansion in Southeast US markets by understanding where your network has existing presence and where economic indicators show opportunity.

### Proximity-Based Relationship Mapping
Find contacts, prospects, or portfolio companies within X miles of a target location. Plan regional roadshows or identify local champions.

**Use Case**: Planning a West Coast investor roadshow? Query finds all LP contacts and warm introduction paths within 25 miles of San Francisco, LA, and Seattle.`,
    icon: 'map-pin',
    image: 'geospatial-database-dark.svg',
    category: 'features-detail',
    sort_order: 3,
    enabled: true,
  };

  await createItem(token, 'cms_features', geoFeature);
  console.log('  ✅ Geospatial Analysis');

  // ============================================================
  // Time-Series Analytics Deep Dive
  // ============================================================
  const timeSeriesFeature = {
    title: 'Time-Series Analytics',
    slug: 'features-time-series',
    description: `**TimescaleDB | Track Relationship Evolution**

Relationships aren't static. Time-series analysis detects relationship decay, optimizes outreach timing, and analyzes deal velocity trends.

## The Problem

Traditional CRMs timestamp when a contact was created or last updated. They don't analyze relationship evolution, interaction patterns, or decay over time.

You can't answer: "Which relationships are weakening?" or "What's the optimal re-engagement timing?"

## The Solution: TimescaleDB

Time-series optimized queries track relationship strength over time, detect engagement decay, and analyze temporal patterns in deal flow and LP commitment cycles.

## Key Capabilities

### Relationship Decay Detection
Track interaction frequency and relationship strength over time. Alert when key relationships show declining engagement before they go cold.

**Use Case**: Alert me when an LP I haven't contacted in 6 months shows declining interaction strength. Proactive re-engagement prevents relationship loss.

### Deal Velocity Analysis
Measure time-to-close across different deal types, geographies, or relationship paths. Identify what accelerates or slows deal flow.

**Use Case**: Discover that deals sourced through warm intros close 40% faster than cold outreach. Prioritize relationship-driven sourcing strategies.

### LP Commitment Cycle Patterns
Analyze historical patterns in LP commitment timing, fund closing schedules, and re-up cycles. Optimize fundraising timing.

**Use Case**: Identify quarterly and annual patterns in LP commitment activity. Time your outreach for maximum receptiveness.

### Interaction Trend Analysis
Track email volume, meeting frequency, and engagement metrics over time. Understand which relationships require nurturing and which are thriving.

**Use Case**: Automatically surface contacts who showed high engagement 12-18 months ago but have since gone quiet—potential re-engagement opportunities.`,
    icon: 'activity',
    image: 'timeseries-database-dark.svg',
    category: 'features-detail',
    sort_order: 4,
    enabled: true,
  };

  await createItem(token, 'cms_features', timeSeriesFeature);
  console.log('  ✅ Time-Series Analytics');

  console.log('\\n🎉 Features page content populated successfully!');
  console.log('\\nSummary: 4 detailed feature sections created');
}

main().catch((error) => {
  console.error('❌ Error:', error);
  process.exit(1);
});
