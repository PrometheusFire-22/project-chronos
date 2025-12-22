# Content Strategy Guide

**How to use CMS tables for different content types in Project Chronos**

This guide provides content strategy recommendations and practical examples for using the CMS schema to build your marketing site, documentation, and content pages.

---

## Table of Contents

1. [Content Architecture](#content-architecture)
2. [Marketing Website](#marketing-website)
3. [Blog Strategy](#blog-strategy)
4. [Documentation System](#documentation-system)
5. [Page Examples](#page-examples)
6. [Content Workflows](#content-workflows)
7. [SEO Strategy](#seo-strategy)

---

## Content Architecture

### Site Map

```
automatonicai.com/
├── / (Homepage)
│   ├── Hero Section (cms_homepage_hero)
│   ├── Features Grid (cms_features)
│   ├── Recent Blog Posts (cms_blog_posts)
│   └── Announcement Banner (cms_announcements)
│
├── /about (cms_docs_pages)
│   ├── Our Mission
│   ├── Team
│   └── Careers
│
├── /solutions (cms_docs_pages + children)
│   ├── /solutions/private-equity
│   ├── /solutions/venture-capital
│   └── /solutions/investment-banking
│
├── /blog (cms_blog_posts)
│   ├── /blog/[slug]
│   └── /blog/category/[category]
│
├── /docs (cms_docs_pages hierarchy)
│   ├── /docs/getting-started
│   │   ├── /docs/getting-started/quick-start
│   │   └── /docs/getting-started/authentication
│   ├── /docs/api
│   │   ├── /docs/api/rest
│   │   └── /docs/api/graphql
│   └── /docs/guides
│
├── /features (cms_features listing)
│
├── /contact (cms_docs_pages)
│
├── /terms (cms_legal_pages)
└── /privacy (cms_legal_pages)
```

### Content Type Matrix

| Page Type | Table | Parent ID | Use Case |
|-----------|-------|-----------|----------|
| Homepage Hero | `cms_homepage_hero` | N/A | Hero section with CTA |
| About | `cms_docs_pages` | `NULL` | Standalone page |
| Solutions (parent) | `cms_docs_pages` | `NULL` | Standalone page |
| Solutions (child) | `cms_docs_pages` | Solutions ID | Hierarchical |
| Contact | `cms_docs_pages` | `NULL` | Standalone page |
| Pricing | `cms_docs_pages` | `NULL` | Standalone page |
| Blog Posts | `cms_blog_posts` | N/A | Time-series content |
| Documentation | `cms_docs_pages` | Parent doc ID | Hierarchical |
| Features | `cms_features` | N/A | Structured data |
| Announcements | `cms_announcements` | N/A | Time-bound alerts |
| Legal | `cms_legal_pages` | N/A | Versioned documents |

---

## Marketing Website

### Homepage Strategy

**Components:**

1. **Hero Section** (`cms_homepage_hero`)
   - One active hero at a time
   - Rotatable for campaigns/seasons
   - A/B testing ready

2. **Features Grid** (`cms_features`)
   - Category: "Homepage"
   - Sort order controls display
   - Enable/disable for quick changes

3. **Recent Posts** (`cms_blog_posts`)
   - Query: status='published', featured=true, limit 3
   - Shows social proof and thought leadership

4. **Announcement Banner** (`cms_announcements`)
   - Type: "info" for general, "success" for launches
   - Placement: "banner"
   - Scheduled with start/end dates

**Example Homepage Hero:**

```typescript
await db.insert(homepageHero).values({
  headline: 'Relationship Intelligence for Private Markets',
  subheadline: 'Discover hidden connections and source deals faster with AI-powered graph analytics',
  ctaPrimaryText: 'Start Free Trial',
  ctaPrimaryLink: '/signup',
  ctaSecondaryText: 'Watch Demo',
  ctaSecondaryLink: '/demo',
  backgroundImage: 'https://media.automatonicai.com/hero/graph-network.jpg',
  active: true,
});
```

**Example Featured Announcement:**

```typescript
await db.insert(announcements).values({
  title: '🎉 Now Available: AI-Powered Deal Recommendations',
  message: 'Get personalized deal suggestions based on your portfolio and preferences',
  link: '/blog/ai-deal-recommendations',
  linkText: 'Learn More →',
  type: 'success',
  placement: 'banner',
  dismissible: true,
  startsAt: new Date('2025-12-21'),
  endsAt: new Date('2025-12-31'),
  active: true,
});
```

### About Page

**Table:** `cms_docs_pages`
**Parent ID:** `NULL` (standalone page)

```typescript
await db.insert(docsPages).values({
  title: 'About Chronos',
  slug: 'about',
  content: `
# About Chronos

## Our Mission

At Chronos, we're building the world's most powerful relationship intelligence platform for private markets. We believe that in an industry built on relationships, having comprehensive visibility into networks and connections is the ultimate competitive advantage.

## What We Do

Chronos combines graph database technology, AI-powered analytics, and comprehensive data aggregation to help investment professionals:

- **Discover Hidden Opportunities:** Find deals before your competitors through relationship mapping
- **Source Smarter:** Leverage AI to identify high-probability targets based on network analysis
- **Build Relationships:** Understand connection paths and warm introduction opportunities
- **Track Market Intelligence:** Monitor deal flow, company movements, and market trends in real-time

## Our Technology

We've built Chronos on a foundation of cutting-edge technology:

- **Apache AGE Graph Database:** Query relationships with SQL and Cypher
- **TimescaleDB:** Analyze trends over time with specialized time-series queries
- **pgvector:** Find similar companies and deals using AI embeddings
- **PostGIS:** Geospatial analysis for regional investment strategies

## Our Team

Chronos was founded by [Your Name], a former [Background] with [X] years of experience in private markets and technology.

[Team member bios...]

## Why "Chronos"?

Chronos, the Greek personification of time, represents our focus on temporal relationships and the evolution of business networks over time. Just as deals and relationships develop over time, Chronos helps you understand and navigate these dynamic connections.

## Get in Touch

Ready to revolutionize your deal sourcing? [Contact us](/contact) to schedule a demo.
  `,
  parentId: null,
  icon: 'info',
  description: 'Learn about our mission, technology, and team',
  metaTitle: 'About Chronos - Relationship Intelligence for Private Markets',
  metaDescription: 'Discover how Chronos is building the world\'s most powerful relationship intelligence platform for PE, VC, and IB professionals.',
  status: 'published',
  publishedAt: new Date(),
  showInNav: true,
  navOrder: 10,
});
```

### Solutions Pages

**Architecture:** Parent page + child pages for each vertical

```typescript
// 1. Parent Solutions page
const [solutionsPage] = await db.insert(docsPages).values({
  title: 'Solutions',
  slug: 'solutions',
  content: `
# Solutions

Chronos provides specialized relationship intelligence solutions for every segment of private markets.

## By Role

Whether you're a partner, principal, associate, or analyst, Chronos adapts to your workflow.

## By Vertical

Select your vertical to learn more about how Chronos can transform your deal sourcing:
  `,
  parentId: null,
  icon: 'lightbulb',
  description: 'Explore solutions for PE, VC, and IB',
  metaTitle: 'Solutions - Chronos Relationship Intelligence Platform',
  metaDescription: 'Discover how Chronos helps private equity, venture capital, and investment banking professionals source deals faster.',
  status: 'published',
  publishedAt: new Date(),
  showInNav: true,
  navOrder: 20,
}).returning();

// 2. Private Equity solution
await db.insert(docsPages).values({
  title: 'Private Equity Solutions',
  slug: 'solutions/private-equity',
  content: `
# Private Equity Solutions

## Deal Sourcing Challenges

Private equity firms face unique challenges:

- **Proprietary deal flow** is the key differentiator
- **Market coverage** requires tracking thousands of companies
- **Relationship mapping** to portfolio companies and advisors
- **Competitive intelligence** on other PE firms and their activities

## How Chronos Helps

### 1. Portfolio Company Relationships

Map relationships between your portfolio companies and their:
- Board members and executives
- Customers and suppliers
- Investors and advisors

Identify add-on acquisition targets based on network proximity.

### 2. Executive Tracking

Monitor when executives from your target companies move to new roles. Chronos alerts you when:
- A CEO at a target company announces retirement
- A key executive joins a company in your focus sectors
- Former portfolio company executives are available for operating partner roles

### 3. Advisor Network Intelligence

Track relationships with:
- Investment bankers managing processes
- Law firms handling transactions
- Consultants working on carve-outs

Get early visibility into off-market deals.

### 4. Sector Deep Dives

Analyze company networks within specific sectors:
- Healthcare services consolidation plays
- Software vertical market opportunities
- Industrial add-on pipelines

## Case Study: Mid-Market Buyout Fund

[Real or hypothetical success story]

## Get Started

[Contact form / Demo request]
  `,
  parentId: solutionsPage.id,
  icon: 'briefcase',
  description: 'Relationship intelligence for private equity firms',
  metaTitle: 'Private Equity Solutions - Chronos',
  metaDescription: 'Discover how Chronos helps PE firms source proprietary deals through relationship mapping and network intelligence.',
  status: 'published',
  publishedAt: new Date(),
  sortOrder: 1,
});

// 3. Venture Capital solution
await db.insert(docsPages).values({
  title: 'Venture Capital Solutions',
  slug: 'solutions/venture-capital',
  content: `
# Venture Capital Solutions

## Sourcing in a Crowded Market

VCs need to:
- **Find companies before the crowd** arrives
- **Leverage existing portfolio** for referrals
- **Track founder movements** and serial entrepreneurs
- **Monitor accelerator cohorts** and alumni networks

## How Chronos Helps

### 1. Founder Network Mapping

Track connections between:
- Previous successful founders who became angels
- University alumni networks (Stanford, MIT, etc.)
- Previous company colleagues
- Accelerator batch-mates

### 2. Portfolio-Led Sourcing

Identify opportunities through your portfolio:
- What companies are your portfolio hiring from?
- Who are their customers and partners?
- What infrastructure providers are they using?

### 3. Market Intelligence

Monitor early signals:
- Companies getting first hires from FAANG
- Stealth startups raising first rounds
- Founder-market fit indicators

[Continue with VC-specific content...]
  `,
  parentId: solutionsPage.id,
  icon: 'trending-up',
  description: 'Relationship intelligence for venture capital firms',
  metaTitle: 'Venture Capital Solutions - Chronos',
  metaDescription: 'Help VCs source early-stage opportunities through founder network mapping and portfolio intelligence.',
  status: 'published',
  publishedAt: new Date(),
  sortOrder: 2,
});

// 4. Investment Banking solution
await db.insert(docsPages).values({
  title: 'Investment Banking Solutions',
  slug: 'solutions/investment-banking',
  content: `
# Investment Banking Solutions

## Coverage and Origination

Investment bankers need to:
- **Maintain coverage** of thousands of companies
- **Identify sell-side opportunities** proactively
- **Track executive relationships** for referrals
- **Monitor market activity** for pitching

[IB-specific content...]
  `,
  parentId: solutionsPage.id,
  icon: 'bar-chart',
  description: 'Relationship intelligence for investment banks',
  metaTitle: 'Investment Banking Solutions - Chronos',
  status: 'published',
  publishedAt: new Date(),
  sortOrder: 3,
});
```

### Contact Page

```typescript
await db.insert(docsPages).values({
  title: 'Contact Us',
  slug: 'contact',
  content: `
# Get in Touch

## Schedule a Demo

See Chronos in action with a personalized demo for your team.

[Calendly embed or contact form]

## Email

For general inquiries: info@automatonicai.com
For support: support@automatonicai.com

## Office

San Francisco, CA
[Address]

## Follow Us

- [LinkedIn](https://linkedin.com/company/chronos)
- [Twitter](https://twitter.com/chronos)
- [GitHub](https://github.com/chronos)
  `,
  parentId: null,
  icon: 'mail',
  description: 'Get in touch with the Chronos team',
  metaTitle: 'Contact Chronos - Schedule a Demo',
  metaDescription: 'Get in touch to schedule a demo and learn how Chronos can transform your deal sourcing.',
  status: 'published',
  publishedAt: new Date(),
  showInNav: true,
  navOrder: 90,
});
```

---

## Blog Strategy

### Content Pillars

**1. Product Updates** (category: "Product")
- Feature launches
- Product roadmap
- Customer stories
- Integration announcements

**2. Engineering Deep Dives** (category: "Engineering")
- Technical architecture
- Database optimization
- Graph algorithms
- Performance tuning

**3. Industry Insights** (category: "Insights")
- Private markets trends
- Deal flow analysis
- Market commentary
- Thought leadership

**4. How-To Guides** (category: "Tutorials")
- Getting started guides
- Best practices
- Workflow optimization
- Tips and tricks

### Example Blog Posts

**Product Launch:**

```typescript
await db.insert(blogPosts).values({
  title: 'Introducing AI-Powered Deal Recommendations',
  slug: 'ai-deal-recommendations',
  excerpt: 'Today we\'re launching AI-powered deal recommendations that analyze your portfolio and network to suggest high-probability opportunities.',
  content: `
# Introducing AI-Powered Deal Recommendations

[Hero image]

Today we're excited to announce **AI-Powered Deal Recommendations**, a new feature that uses machine learning to analyze your portfolio, network, and activity to suggest deals you're most likely to be interested in.

## The Problem

Traditional deal sourcing is reactive. You spend hours filtering through databases, reading newsletters, and attending events hoping to stumble across the right opportunity.

## Our Solution

Chronos now proactively analyzes:

1. **Your Portfolio**: Companies you've invested in or advised
2. **Your Network**: People you know and companies they're connected to
3. **Your Activity**: Deals you've viewed, saved, or shared
4. **Market Trends**: What similar investors are looking at

Then we use this data to recommend deals that match your:
- **Sector Focus**: Based on your portfolio composition
- **Stage Preference**: Seed, Series A, growth, etc.
- **Geographic Focus**: Where you typically invest
- **Network Proximity**: How close you are to the opportunity

## How It Works

[Technical explanation with diagrams]

## Early Results

Beta testers report:
- **3x increase** in high-quality deal flow
- **50% reduction** in time spent sourcing
- **2x improvement** in conversion rates

## Get Started

AI-Powered Recommendations are available now to all Pro and Enterprise customers.

[CTA: Try it now →]
  `,
  featuredImage: 'https://media.automatonicai.com/blog/ai-recommendations-hero.jpg',
  author: 'Geoff Bevans',
  category: 'Product',
  tags: ['AI', 'Machine Learning', 'Product Launch', 'Deal Sourcing'],
  metaTitle: 'AI-Powered Deal Recommendations | Chronos Product Update',
  metaDescription: 'Discover how Chronos uses machine learning to recommend high-probability deals based on your portfolio and network.',
  ogImage: 'https://media.automatonicai.com/blog/ai-recommendations-og.jpg',
  status: 'published',
  publishedAt: new Date(),
  featured: true,
  readTimeMinutes: 8,
});
```

**Engineering Deep Dive:**

```typescript
await db.insert(blogPosts).values({
  title: 'How We Built a Graph Database for 10M+ Relationships',
  slug: 'graph-database-architecture',
  excerpt: 'A deep dive into our PostgreSQL + Apache AGE architecture for relationship mapping at scale.',
  content: `
# How We Built a Graph Database for 10M+ Relationships

At Chronos, relationship mapping is our core product. We need to store and query millions of connections between companies, people, deals, and events.

## Architecture Decisions

We chose PostgreSQL + Apache AGE because:

1. **Single Database**: No need to sync between transactional and graph DBs
2. **Mature Ecosystem**: Leverages PostgreSQL's 30+ years of development
3. **SQL + Cypher**: Query with both relational and graph patterns
4. **Extensions**: TimescaleDB, PostGIS, pgvector in the same DB

## Schema Design

[Code examples, diagrams]

## Query Patterns

[Performance optimizations, indexing strategies]

## Lessons Learned

[Key takeaways]
  `,
  author: 'Geoff Bevans',
  category: 'Engineering',
  tags: ['PostgreSQL', 'Apache AGE', 'Graph Database', 'Architecture'],
  status: 'published',
  publishedAt: new Date(),
  featured: true,
  readTimeMinutes: 15,
});
```

---

## Documentation System

### Structure

```
Documentation (cms_docs_pages hierarchy)
├── Getting Started
│   ├── Quick Start Guide
│   ├── Authentication
│   ├── First Query
│   └── Sample Data
├── API Reference
│   ├── REST API
│   │   ├── Deals Endpoint
│   │   ├── Companies Endpoint
│   │   └── Relationships Endpoint
│   └── GraphQL API
│       ├── Queries
│       ├── Mutations
│       └── Subscriptions
├── Guides
│   ├── Deal Sourcing Workflows
│   ├── Network Analysis
│   ├── Data Import
│   └── Integrations
└── SDK Reference
    ├── JavaScript/TypeScript
    ├── Python
    └── REST Clients
```

### Implementation

```typescript
// Create documentation hierarchy
const docs = [
  {
    title: 'Documentation',
    slug: 'docs',
    parentId: null,
    children: [
      {
        title: 'Getting Started',
        slug: 'docs/getting-started',
        children: [
          {
            title: 'Quick Start Guide',
            slug: 'docs/getting-started/quick-start',
            content: '# Quick Start\n\n...',
          },
          {
            title: 'Authentication',
            slug: 'docs/getting-started/authentication',
            content: '# Authentication\n\n...',
          },
        ],
      },
      {
        title: 'API Reference',
        slug: 'docs/api',
        children: [
          // ... more children
        ],
      },
    ],
  },
];

// Helper function to create hierarchy
async function createDocHierarchy(node, parentId = null, sortOrder = 0) {
  const [page] = await db
    .insert(docsPages)
    .values({
      title: node.title,
      slug: node.slug,
      content: node.content || `# ${node.title}`,
      parentId,
      sortOrder,
      status: 'published',
      publishedAt: new Date(),
    })
    .returning();

  if (node.children) {
    for (let i = 0; i < node.children.length; i++) {
      await createDocHierarchy(node.children[i], page.id, i + 1);
    }
  }

  return page;
}

// Create the documentation tree
await createDocHierarchy(docs[0]);
```

---

## Content Workflows

### Publishing Workflow

```
1. Draft
   ↓ (Editor creates content in Directus)
2. Review
   ↓ (Team reviews, requests changes)
3. Publish
   ↓ (Set status='published', published_at=now())
4. Live
   ↓ (Next.js fetches via Directus API)
5. Update
   ↓ (Edit content, updated_at=now())
6. Republish
```

### Content Lifecycle

**Blog Post:**
1. Create draft in Directus
2. Write content, add SEO metadata
3. Upload featured image to R2
4. Add tags and category
5. Preview (Directus preview URL)
6. Publish (status → 'published')
7. Share on social media
8. Monitor analytics (view_count)
9. Update as needed
10. Archive when outdated (status → 'archived')

**Documentation Page:**
1. Determine hierarchy (parent page)
2. Create page in Directus
3. Write content (Markdown)
4. Add code examples
5. Test links
6. Publish
7. Monitor user feedback
8. Update with product changes
9. Maintain (never archive)

---

## SEO Strategy

### On-Page SEO

**All content pages should include:**

```typescript
{
  // Page title (shown in browser tab and search results)
  title: 'Primary Keyword - Secondary Keyword | Chronos',

  // URL slug (lowercase, hyphens, descriptive)
  slug: 'primary-keyword-secondary-keyword',

  // Meta title (50-60 chars, include primary keyword)
  metaTitle: 'Primary Keyword - Secondary Keyword | Chronos',

  // Meta description (150-160 chars, compelling CTA)
  metaDescription: 'Learn how Chronos helps [benefit] with [feature]. [CTA]',

  // Open Graph image (1200x630px, shows in social shares)
  ogImage: 'https://media.automatonicai.com/og/page-name.jpg',

  // Content (use headings H1-H6, include keywords naturally)
  content: `
    # Primary Keyword (H1 - one per page)

    ## Secondary Keyword (H2)

    Content with naturally placed keywords...

    ### Related Topic (H3)
  `,
}
```

### Keyword Strategy

**Target Keywords:**

| Page | Primary Keyword | Secondary Keywords |
|------|----------------|-------------------|
| Homepage | "relationship intelligence platform" | "deal sourcing", "private equity software" |
| About | "private markets software" | "investment technology", "deal flow platform" |
| Solutions/PE | "private equity deal sourcing" | "PE software", "buyout deal flow" |
| Solutions/VC | "venture capital CRM" | "VC deal flow", "startup sourcing" |
| Blog Posts | Long-tail keywords | "how to source deals", "PE best practices" |

### Internal Linking

Link between related content:

```markdown
<!-- In blog post about AI -->
Learn more about our [graph database architecture](/blog/graph-database-architecture).

<!-- In Solutions/PE page -->
For more details, see our [API documentation](/docs/api).

<!-- In About page -->
Read about our latest [product updates](/blog/category/product).
```

---

**Document Version:** 1.0.0
**Last Updated:** 2025-12-21
**Maintainer:** Geoff Bevans <geoff@automatonicai.com>
