# About Page Copy - Automatonic AI

**Version**: 1.0
**Date**: 2025-12-08
**Status**: Draft for Review
**Epic**: CHRONOS-280
**Story**: CHRONOS-281

---

## Page Hero

### Headline (H1)
Built by Someone Who Felt the Pain

### Subheadline
From $800 million in private market transactions to database architecture. This is the story of why Project Chronos exists.

### Visual Description
- Clean, minimal background (dark gradient)
- Professional founder photo (to be provided)
- Subtle geometric pattern (graph nodes, faded, background)

---

## Founder Story Section

### Eyebrow Text
THE ORIGIN STORY

### Headline (H2)
Six Years of Missed Connections

### Story (Conversational, First-Person)

I spent over six years as an investment banker at a boutique Toronto firm specializing in secondary private markets—providing liquidity solutions for PE, VC, real estate, infrastructure, and private credit assets.

My days were consumed by:
- Cold-calling pension funds, endowments, family offices
- Tracking LP commitment patterns across hundreds of funds
- Mapping board member networks manually in spreadsheets
- Running auction processes for complex secondary transactions
- Maintaining a CRM that couldn't answer the questions I actually needed answered

Over those six years, I advised on more than **$800 million in transactions**.

But here's what haunted me: **How many warm introduction opportunities did I miss?**

### The "Aha" Moment

**The scenario that broke me**:

I was pursuing a secondary stake in a mid-market PE fund. Cold outreach to the GP—no response. Weeks of follow-ups—nothing.

Three months later, I discovered (by accident, through a LinkedIn post) that:
- One of my existing LP contacts sat on the board of the GP's largest portfolio company
- That board also included an investment consultant my firm had worked with for years
- The GP's head of investor relations had co-invested with another of my LPs in a completely different fund

**I had a 2-hop path to a warm introduction. I just didn't know it existed.**

By the time I pieced it together, the opportunity was gone. Another banker got there first—probably through a warm intro I could have made.

That wasn't an isolated incident. It happened constantly.

### The Realization

The tools we use in private markets—Salesforce, HubSpot, LinkedIn—were built for B2B SaaS sales, not multi-billion dollar relationship-driven transactions.

They store relationships as flat tables:
- Contact A works at Company B
- Contact A knows Contact C

But they can't answer:
- "Who knows who, 3 degrees out, through board seats and co-investment networks?"
- "Which LPs consistently co-invest together (syndication patterns)?"
- "Who invested in Apollo Fund XII but didn't re-up for Fund XIII (relationship decay signals)?"
- "Show me all warm introduction paths to this target CEO, ranked by relationship strength"

These aren't edge cases. **These are the core questions that drive deal flow in private markets.**

### The Decision

So I took time away from investment banking and taught myself database architecture, AI/ML, graph theory, and geospatial analysis.

Not because I wanted to become a software engineer (though that's what happened).

**Because I wanted to build the tool I wished existed.**

---

## Why This Problem Matters Section

### Eyebrow Text
THE BIGGER PICTURE

### Headline (H2)
Relationships Are the Currency of Private Markets

### Body Copy

In private markets, deals don't close because of the best pitch deck. They close because of **who vouches for you**.

- PE funds raise capital through trusted LP relationships built over decades
- Secondary transactions require back-channel references and warm introductions
- Co-investment opportunities flow through syndicate networks
- Board seats create influence pathways that determine M&A outcomes

Yet we track these multi-dimensional, evolving relationship networks using tools designed for transactional B2B sales.

**It's like using a spreadsheet to run a hedge fund**. Technically possible, but catastrophically inefficient.

### The Vision

Project Chronos is my answer to that inefficiency.

It's not a "better CRM." It's a fundamentally different approach:
- **Graph databases** (Apache AGE) for relationship network analysis
- **Vector search** (pgvector) for semantic matching and pattern recognition
- **Geospatial intelligence** (PostGIS) for regional market analysis
- **Time-series tracking** (TimescaleDB) for relationship evolution and decay detection

All running on **your infrastructure**, with **your data**, under **your control**.

Because in private markets, data sovereignty isn't a nice-to-have. It's table stakes.

---

## Mission & Values Section

### Eyebrow Text
WHAT WE STAND FOR

### Headline (H2)
Our Mission

### Mission Statement (Highlighted, Large Text)
> **To make relationship intelligence as sophisticated as financial analytics.**
>
> Every PE/VC/IB professional deserves tools that match the complexity of their networks and the stakes of their transactions.

### Core Values (3 Columns)

**Column 1: Technical Excellence**
- Icon: Gear/cog with sparkle
- **Value**: "Depth Over Flash"
- **What It Means**: We don't chase trends. We use battle-tested database technology (PostgreSQL extensions with 10+ years of production use) that Fortune 500 companies rely on. No proprietary black boxes. No vendor lock-in.

**Column 2: Data Sovereignty**
- Icon: Lock/shield
- **Value**: "Your Data, Your Rules"
- **What It Means**: Self-hosted deployment option from day one. LP data, fund performance, deal terms—it all stays on your infrastructure. We never see it, touch it, or monetize it. Because trust is earned, not assumed.

**Column 3: Domain Expertise**
- Icon: Handshake/network
- **Value**: "Built for the Industry, By the Industry"
- **What It Means**: I'm not a tech founder who stumbled into fintech. I lived the pain of relationship management in private markets for six years. This isn't theory—it's scar tissue turned into software.

---

## Technology Philosophy Section

### Eyebrow Text
HOW WE BUILD

### Headline (H2)
Standing on the Shoulders of Giants

### Subheadline
We didn't reinvent databases. We assembled the best open-source extensions to PostgreSQL—each solving a specific problem better than any alternative.

### Technology Choices (4 Cards)

**Card 1: Why PostgreSQL?**
- Icon: Elephant (PostgreSQL logo)
- **The Choice**: PostgreSQL as the core database
- **The Rationale**: 35+ years of production use. ACID compliance. Extensibility unmatched by MySQL or MongoDB. When you're storing billion-dollar deal data, you don't experiment with unproven technology.

**Card 2: Why Apache AGE?**
- Icon: Graph network
- **The Choice**: Apache AGE for graph queries (not Neo4j)
- **The Rationale**: AGE runs **inside** PostgreSQL—no separate graph database to maintain. Cypher query language (industry standard), but with the reliability and ACID guarantees of Postgres. Best of both worlds.

**Card 3: Why pgvector?**
- Icon: Vector/embeddings
- **The Choice**: pgvector for semantic search (not Pinecone or Weaviate)
- **The Rationale**: Again, **inside** PostgreSQL. No external vector database, no API latency, no third-party dependencies. Your embeddings stay in your database, alongside your relational data.

**Card 4: Why TimescaleDB + PostGIS?**
- Icon: Chart + Map
- **The Choice**: TimescaleDB (time-series) + PostGIS (geospatial)
- **The Rationale**: Same philosophy—PostgreSQL extensions, not separate databases. One system, four paradigms. Unified query interface. Single deployment. Simplified operations.

### The Alternative (What We Rejected)

**The "Best-of-Breed" Trap**:
- Graph: Neo4j (separate server)
- Vector: Pinecone (SaaS, your data on their servers)
- Time-Series: InfluxDB (separate server)
- Geospatial: MongoDB with geospatial queries (NoSQL, eventual consistency)

**Result**: Four databases to deploy, maintain, backup, secure. Four different query languages. Data synchronization nightmares. Operational complexity that scales with headcount.

**Our Approach**: One database (PostgreSQL), four extensions, unified operations. You can run it on a single AWS Lightsail instance for $12/month.

---

## The Journey Section

### Eyebrow Text
WHERE WE ARE

### Headline (H2)
From Concept to Beta Launch

### Timeline (Vertical, Left-Aligned)

**Q4 2024: Research & Architecture**
- Evaluated database options (Neo4j vs. AGE, standalone vector DBs vs. pgvector)
- Built proof-of-concept graph queries on real anonymized LP data
- Validated multi-modal approach with industry advisors

**Q1 2025: Core Database Build**
- Deployed PostgreSQL 16.4 with all four extensions on AWS Lightsail
- Implemented data ingestion pipelines (FRED economic data, Census geospatial data)
- Developed backup/disaster recovery procedures (pgBackRest → S3)
- **Status**: ✅ Database infrastructure complete

**Q2 2025: Backend Development** (Current Phase)
- FastAPI backend with async PostgreSQL queries
- JWT authentication and role-based access control
- OpenAPI documentation auto-generation
- **Status**: 🔄 In progress

**Q3 2025: Frontend & Beta Launch**
- Next.js dashboard with graph visualizations (D3.js)
- Self-service signup and onboarding
- Beta user access (50 early adopters)
- **Status**: ⏳ Planned

**Q4 2025: General Availability**
- Public launch with pricing tiers
- Integration marketplace (Salesforce, PitchBook, Bloomberg)
- Enterprise features (SSO, audit logging, custom deployment)
- **Status**: ⏳ Planned

---

## Why Now Section

### Eyebrow Text
THE CONVERGENCE

### Headline (H2)
Three Trends Made This Possible

### Trends (3 Cards with Icons)

**Trend 1: Open-Source Database Renaissance**
- Icon: Database with open book
- **What Changed**: Apache AGE (2020), pgvector (2021), mature TimescaleDB/PostGIS
- **Why It Matters**: Five years ago, you needed separate proprietary databases for each modality. Now, PostgreSQL extensions bring enterprise-grade graph, vector, geospatial, and time-series capabilities into one open-source system.

**Trend 2: AI Embeddings Went Mainstream**
- Icon: Brain/neural network
- **What Changed**: OpenAI embeddings API (2022), local embedding models (2023)
- **Why It Matters**: Semantic search used to require custom ML infrastructure. Now, convert any text to a vector with a single API call. pgvector makes storage trivial. Lookalike company discovery goes from "research project" to "single SQL query."

**Trend 3: Private Markets Data Transparency**
- Icon: Eye/visibility
- **What Changed**: PitchBook, Crunchbase, Bloomberg's expanding PE/VC coverage
- **Why It Matters**: Ten years ago, LP commitment data was locked in PDFs. Now, APIs exist. The bottleneck isn't data availability—it's **relationship context**. Graph databases turn data into actionable intelligence.

---

## Team Section (Solo Founder)

### Headline (H2)
The Team (For Now)

### Founder Profile

```
┌──────────────────────────────────────────┐
│  [Photo]                                 │
│                                          │
│  Geoff Bevans                            │
│  Founder & CEO                           │
│                                          │
│  [LinkedIn Icon] [Email Icon]            │
└──────────────────────────────────────────┘
```

**Background**:
- 6+ years in investment banking (secondary private markets)
- Advised on $800M+ in PE/VC/RE/Infrastructure transactions
- Clients: Global pension funds, endowments, family offices, insurance companies
- Self-taught: Database architecture, Python, PostgreSQL, Docker, AWS
- Toronto-based (open to remote team members)

**Ask Me About**:
- LP fundraising strategies
- Secondary transaction structuring
- Multi-hop relationship pathfinding (the fun kind)
- Running PostgreSQL at scale on AWS Lightsail

### Future Hiring (Call-Out Box)

**We're not hiring yet**, but we will be.

If you're a:
- **Full-stack engineer** (Next.js/TypeScript + Python/FastAPI)
- **Database specialist** (PostgreSQL, graph theory, query optimization)
- **Product designer** (B2B SaaS, data visualization, D3.js)
- **Go-to-market leader** (PE/VC/IB industry experience required)

...and this mission resonates, reach out: geoff@automatonicai.com

We'll move fast once we have product-market fit.

---

## FAQ Section (About-Specific)

### Headline (H2)
Common Questions

### Q&A (Expandable Accordion)

**Q: Are you raising funding?**
A: Not yet. Currently bootstrapped. I'll consider seed funding once we have 100+ active beta users and clear product-market fit signals (Q3-Q4 2025).

**Q: Why build this solo instead of joining an existing CRM?**
A: I tried pitching this idea to CRM companies. Their response: "Interesting, but our customers don't ask for graph databases." Of course they don't—they don't know it's possible. This problem required someone with domain expertise (private markets) and technical depth (database architecture). That's a rare combination.

**Q: What's your unfair advantage?**
A: Two things:
1. **I lived the pain**: 6 years of deal-making taught me exactly what questions need answering. I'm not guessing at product-market fit.
2. **Technical conviction**: I'm not a product manager outsourcing to contractors. I built the database infrastructure myself. When a beta user says "Can we query X?", I know immediately if it's a SELECT statement or a month of R&D.

**Q: What if a big CRM acquires you?**
A: I'd consider it post-PMF, but only if: (1) They commit to maintaining the self-hosted option, (2) The product stays specialized for private markets, (3) The team stays intact. I didn't build this to become a

 feature checkbox in Salesforce Enterprise Edition.

**Q: How can I help?**
A:
1. **Join the waitlist** → Early feedback shapes the product
2. **Spread the word** → Know a PE/VC/IB professional frustrated with their CRM? Send them here.
3. **Provide intros** → I'm looking for beta users, advisors with LP/GP networks, and potential hires.

---

## Final CTA

### Eyebrow Text
JOIN THE JOURNEY

### Headline (H2)
Be Part of Building This

### Subheadline
Early access members don't just get the product first—they shape it. Monthly technical updates, direct access to me, and the chance to influence our roadmap.

### CTA Button
```
[Join Early Access Waitlist →] (Links to /contact)
```

### Alternative CTA
```
[Connect on LinkedIn →] (Links to Geoff's LinkedIn profile)
"Let's discuss private market relationship intelligence"
```

---

## Social Proof / Credibility Markers

### Companies Worked With (Subtle Logo Row)
"In my investment banking career, I worked with or advised:"

**Logos** (faded, grayscale):
- [Pension fund logos - generic "Pension Fund" placeholder]
- [University endowment logos - generic "Endowment" placeholder]
- [Insurance company logos - generic "Insurance Co" placeholder]
- [Family office logos - generic "Family Office" placeholder]

**Note**: Use generic placeholders unless Geoff provides specific logos he's allowed to display.

---

## SEO Meta Tags

### Title Tag
`About Geoff Bevans | Founder of Project Chronos`

### Meta Description
`From $800M in private market transactions to database architecture. Learn why a former investment banker built a graph-based CRM for PE/VC/IB professionals.`

### Keywords
- Investment banking CRM founder
- Private equity software entrepreneur
- Relationship intelligence platform
- PE/VC technology founder
- Toronto fintech startup
- Secondary markets software

---

## Design Notes

### Photo Specifications
**Founder Photo**:
- Format: PNG with transparent background OR JPG with solid background
- Dimensions: Square (800x800px recommended)
- Style: Professional but approachable (not stiff corporate headshot)
- Lighting: Well-lit, clean background
- Attire: Business casual (not suit/tie, not hoodie)

### Color Usage
- Headlines: White (#FFFFFF)
- Body text: Slate-50 (#F8FAFC)
- Pull quotes: Light Purple (#C4B5FD) background, white text
- Mission statement: Bordered box with Primary Purple (#8B5CF6) border

### Tone
- First-person ("I") for founder story section
- Conversational but professional
- Technical depth without jargon
- Vulnerability (admitting mistakes, missed opportunities) builds trust

---

## Alternative Content Variations

### Headline Options (A/B Test)
1. "Built by Someone Who Felt the Pain" ✅ (Current - emotional connection)
2. "From $800M in Deals to Database Architecture" (credibility-focused)
3. "Why an Investment Banker Learned to Code" (curiosity-driven)

### Mission Statement Variations
1. Current (recommended): "To make relationship intelligence as sophisticated as financial analytics"
2. Simpler: "To bring graph database technology to private markets"
3. Provocative: "To end the era of spreadsheet relationship management"

---

## Content Checklist

- [ ] Founder photo (high-res, professional)
- [ ] LinkedIn profile URL
- [ ] Email address (geoff@automatonicai.com confirmed)
- [ ] Company logos (if using specific client names - requires permission)
- [ ] Timeline dates finalized (Q1 2025 = marketing site launch timing)
- [ ] Hiring section (confirm if actively recruiting)
- [ ] Fundraising status (confirm bootstrapped vs. seeking investors)

---

**Maintained in Git**: `docs/marketing/copy/about.md`
**Epic**: CHRONOS-280
**Story**: CHRONOS-281
