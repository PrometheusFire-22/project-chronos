#!/usr/bin/env tsx

/**
 * Populate About Page Content in Directus
 *
 * Creates about page sections for founder story, mission, and values.
 */

import fetch from 'node-fetch';

const DIRECTUS_URL = process.env.DIRECTUS_URL || 'https://admin.automatonicai.com';
const ADMIN_EMAIL = process.env.DIRECTUS_ADMIN_EMAIL || 'geoff@automatonicai.com';
const ADMIN_PASSWORD = process.env.DIRECTUS_ADMIN_PASSWORD!;

interface DirectusAuthResponse {
  data: { access_token: string };
}

async function authenticate(): Promise<string> {
  const response = await fetch(`${DIRECTUS_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: ADMIN_EMAIL, password: ADMIN_PASSWORD }),
  });
  const data = (await response.json()) as DirectusAuthResponse;
  return data.data.access_token;
}

async function createItem(token: string, item: unknown) {
  const response = await fetch(`${DIRECTUS_URL}/items/cms_features`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(item),
  });
  if (!response.ok) throw new Error(`Failed: ${await response.text()}`);
  return (await response.json()).data;
}

async function main() {
  console.log('🔐 Authenticating...');
  const token = await authenticate();
  console.log('✅ Authenticated\\n');

  const sections = [
    {
      title: 'Founder Story',
      slug: 'about-founder-story',
      description: `**Six Years of Missed Connections**

I spent over six years as an investment banker at a boutique Toronto firm specializing in secondary private markets—providing liquidity solutions for PE, VC, real estate, infrastructure, and private credit assets.

My days were consumed by cold-calling pension funds, tracking LP commitment patterns across hundreds of funds, mapping board member networks manually in spreadsheets, and running auction processes for complex secondary transactions.

Over those six years, I advised on more than **$800 million in transactions**.

But here's what haunted me: **How many warm introduction opportunities did I miss?**

## The "Aha" Moment

I was pursuing a secondary stake in a mid-market PE fund. Cold outreach to the GP—no response. Weeks of follow-ups—nothing.

Three months later, I discovered (by accident) that one of my existing LP contacts sat on the board of the GP's largest portfolio company. That board also included an investment consultant my firm had worked with for years.

**I had a 2-hop path to a warm introduction. I just didn't know it existed.**

By the time I pieced it together, the opportunity was gone. Another banker got there first—probably through a warm intro I could have made.

## The Decision

So I took time away from investment banking and taught myself database architecture, AI/ML, graph theory, and geospatial analysis.

**Because I wanted to build the tool I wished existed.**`,
      icon: 'user',
      category: 'about-section',
      sort_order: 1,
      enabled: true,
    },
    {
      title: 'Why This Matters',
      slug: 'about-vision',
      description: `**Relationships Are the Currency of Private Markets**

In private markets, deals don't close because of the best pitch deck. They close because of **who vouches for you**.

- PE funds raise capital through trusted LP relationships built over decades
- Secondary transactions require back-channel references and warm introductions
- Co-investment opportunities flow through syndicate networks
- Board seats create influence pathways that determine M&A outcomes

Yet we track these multi-dimensional, evolving relationship networks using tools designed for transactional B2B sales.

**It's like using a spreadsheet to run a hedge fund.** Technically possible, but catastrophically inefficient.

## The Vision

Project Chronos is my answer to that inefficiency. It's not a "better CRM." It's a fundamentally different approach using graph databases, vector search, geospatial intelligence, and time-series tracking.

All running on **your infrastructure**, with **your data**, under **your control**. Because in private markets, data sovereignty isn't a nice-to-have. It's table stakes.`,
      icon: 'target',
      category: 'about-section',
      sort_order: 2,
      enabled: true,
    },
    {
      title: 'Our Mission',
      slug: 'about-mission',
      description: `**To make relationship intelligence as sophisticated as financial analytics.**

Every PE/VC/IB professional deserves tools that match the complexity of their networks and the stakes of their transactions.

## Core Values

### Technical Excellence: Depth Over Flash
We don't chase trends. We use battle-tested database technology (PostgreSQL extensions with 10+ years of production use) that Fortune 500 companies rely on. No proprietary black boxes. No vendor lock-in.

### Data Sovereignty: Your Data, Your Infrastructure
We'll never hold your relationship data hostage. Self-hosted deployment means you control access, retention, and compliance. No third-party data sharing. No surprise policy changes.

### Domain Expertise: Built by Someone Who Gets It
This wasn't built by Silicon Valley engineers guessing at VC pain points. It was built by someone who lived the problem for six years and $800M in transactions.`,
      icon: 'flag',
      category: 'about-section',
      sort_order: 3,
      enabled: true,
    },
  ];

  for (const section of sections) {
    await createItem(token, section);
    console.log(`  ✅ ${section.title}`);
  }

  console.log('\\n🎉 About page content populated!');
}

main().catch((error) => {
  console.error('❌ Error:', error);
  process.exit(1);
});
