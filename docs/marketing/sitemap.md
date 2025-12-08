# Automatonic AI Marketing Site - Sitemap & Information Architecture

**Document Status**: Active
**Version**: 1.0
**Last Updated**: 2025-12-08
**Owner**: Geoff Bevans
**Related Epic**: CHRONOS-280
**Related Story**: CHRONOS-281

---

## Site Structure (MVP - Sprint 10)

```
automatonicai.com/
├── / (Homepage)
├── /features
├── /about
├── /contact (Waitlist)
└── /legal
    ├── /privacy
    └── /terms
```

## Post-MVP Additions (Sprint 11+)

```
automatonicai.com/
├── /blog
│   ├── / (Blog index)
│   └── /[slug] (Individual posts)
├── /pricing (when product exists)
└── /resources
    ├── /case-studies
    └── /documentation
```

---

## Page Specifications

### Homepage (`/`)

**Purpose**: Capture attention, communicate value proposition, drive to waitlist signup

**Sections**:
1. **Hero**
   - Headline (H1): Primary value proposition
   - Subheadline: Supporting explanation
   - Primary CTA: "Join Early Access Waitlist"
   - Secondary CTA: "Explore Features"
   - Background: Animated gradient with subtle graph visualization

2. **Problem Statement**
   - "The Multi-Dimensional Relationship Problem"
   - 3-4 pain points (surface-level CRM, missed connections, manual research, etc.)

3. **Solution Overview**
   - "Multi-Modal Intelligence for Private Markets"
   - 4 pillars: Graph, Vector, Geospatial, Time-Series
   - Visual: 4-quadrant diagram with icons

4. **Key Features Preview**
   - Graph Database: "See Hidden Connection Paths"
   - Vector Search: "Find Similar Deals Instantly"
   - Geospatial: "Map Regional Opportunities"
   - Time-Series: "Track Relationship Evolution"
   - Each with icon, short description, "Learn More" link to /features

5. **Social Proof**
   - "Built by [Geoff's Background]"
   - "Powered by PostgreSQL, Apache AGE, TimescaleDB, PostGIS, pgvector"
   - Tech stack logos (subtle, not overwhelming)

6. **Use Cases**
   - 3 specific scenarios:
     - "Find warm introduction paths to portfolio company CEOs"
     - "Discover co-investment network patterns"
     - "Identify board member influence across deals"

7. **Final CTA**
   - "Join the Waitlist for Early Access"
   - Email capture form (inline on page)
   - "Coming Q1 2026" badge

**Target Length**: 3-4 screen scrolls (mobile)
**Key Metrics**: Time on page, scroll depth, waitlist conversion rate

---

### Features Page (`/features`)

**Purpose**: Deep dive into technical capabilities, establish credibility, educate prospects

**Sections**:

1. **Page Hero**
   - Headline: "Multi-Modal Database Intelligence"
   - Subheadline: "Four paradigms, one platform, infinite insights"

2. **Graph Database Section**
   - **Headline**: "Relationship Networks, Revealed"
   - **Problem**: Traditional CRMs store relationships as foreign keys (flat)
   - **Solution**: Apache AGE graph database (native graph queries)
   - **Use Cases**:
     - Multi-hop connection strength ("Who knows who?")
     - Warm introduction pathfinding (shortest path algorithms)
     - Board network analysis (influence mapping)
     - Co-investment syndication patterns
   - **Visual**: Interactive graph network diagram (nodes = people/companies, edges = relationships)
   - **Technical Detail**: "Powered by Apache AGE (PostgreSQL extension), supports Cypher queries"
   - **CTA**: "See Graph Intelligence in Action" → Demo (future) or Waitlist

3. **Vector Search Section**
   - **Headline**: "Semantic Matching, Powered by AI"
   - **Problem**: Keyword search misses similar companies/deals with different descriptions
   - **Solution**: pgvector embeddings for semantic similarity
   - **Use Cases**:
     - Find companies similar to portfolio holdings (by description, not tags)
     - Match deals to investment thesis (AI-powered relevance)
     - Discover lookalike prospects (vector clustering)
   - **Visual**: 2D/3D vector space diagram (embeddings as points, clusters highlighted)
   - **Technical Detail**: "Powered by pgvector, OpenAI/local embeddings, cosine similarity search"
   - **CTA**: "Explore Vector Search"

4. **Geospatial Section**
   - **Headline**: "Geography Meets Opportunity"
   - **Problem**: Missing regional context (market trends, proximity, territory analysis)
   - **Solution**: PostGIS geospatial database
   - **Use Cases**:
     - Map portfolio companies by region (visual clustering)
     - Identify high-growth markets (overlay economic data)
     - Territory expansion planning (proximity analysis)
     - Regional co-investment patterns
   - **Visual**: Interactive map with overlay data (colored regions, pins for companies)
   - **Technical Detail**: "Powered by PostGIS, integrates TIGER/Line (US Census), StatCan (Canada)"
   - **CTA**: "See Geospatial Intelligence"

5. **Time-Series Section**
   - **Headline**: "Relationships Evolve. Track Them."
   - **Problem**: CRMs only show current state (no historical context)
   - **Solution**: TimescaleDB for time-series relationship analytics
   - **Use Cases**:
     - Relationship strength decay detection ("Who have we lost touch with?")
     - Deal velocity trends (time from intro to close)
     - Interaction frequency analysis (optimal outreach timing)
     - Macro trend correlation (economic indicators + deal flow)
   - **Visual**: Time-series chart with annotations (interaction events, deal milestones)
   - **Technical Detail**: "Powered by TimescaleDB, continuous aggregations, hypertables"
   - **CTA**: "Track Relationship Evolution"

6. **Comparison Table**
   - **Headline**: "How We Compare"
   - **Columns**: Salesforce | HubSpot | LinkedIn Sales Navigator | **Project Chronos**
   - **Rows**:
     - Graph queries (multi-hop relationships)
     - Semantic search (AI-powered)
     - Geospatial analysis
     - Time-series analytics
     - PE/VC specialization
     - Self-hosted option (data privacy)
   - **Visual**: Checkmarks, X's, "Partial" badges

7. **Integration Roadmap**
   - **Headline**: "Seamless Integration (Coming Soon)"
   - **Logos**: Salesforce, HubSpot, LinkedIn, Bloomberg, PitchBook, Crunchbase, Gmail, Outlook
   - **Badge**: "Beta" or "Coming Soon" for each
   - **Note**: "Real-time sync with your existing tools. Data never leaves your infrastructure."

8. **Final CTA**
   - "Ready to Transform Relationship Intelligence?"
   - Waitlist signup

**Target Length**: 5-7 screen scrolls (mobile)
**Key Metrics**: Section scroll depth, CTA clicks, time on page

---

### About Page (`/about`)

**Purpose**: Establish founder credibility, explain motivation, build trust

**Sections**:

1. **Page Hero**
   - Headline: "Built by Someone Who Felt the Pain"
   - Subheadline: Brief intro (1 sentence)

2. **Founder Section**
   - **Photo**: Professional headshot (or placeholder initially)
   - **Name**: Geoff Bevans
   - **Title**: Founder & CEO, Automatonic AI Inc.
   - **Background**: [From resume]
     - Investment banking experience
     - Private equity background
     - Technical expertise (database architecture, AI/ML)
   - **Credibility Markers**:
     - "Former [role] at [firm]"
     - "[X] years in private markets"
     - "[X] deals closed"
   - **Personal Story**: 2-3 paragraphs
     - "I spent years manually tracking relationships in spreadsheets..."
     - "I watched countless warm introduction opportunities slip away..."
     - "So I built the tool I wished existed."

3. **Mission Section**
   - **Headline**: "Our Mission"
   - **Statement**: "To make relationship intelligence as sophisticated as financial analytics. Every PE/VC/IB professional deserves tools that match the complexity of their networks."

4. **Vision Section**
   - **Headline**: "Why This Matters"
   - **Paragraphs**:
     - "Relationships are the currency of private markets"
     - "Yet we use tools designed for B2B SaaS sales, not multi-billion dollar deals"
     - "Graph databases, vector search, geospatial analysis—these aren't luxuries, they're necessities"
     - "We're bringing cutting-edge database technology to an industry that deserves it"

5. **Technology Philosophy**
   - **Headline**: "Built on Battle-Tested Foundations"
   - **Why PostgreSQL**: "Not a proprietary black box. Your data, your infrastructure."
   - **Why Multi-Modal**: "Different questions need different database paradigms. One platform, four engines."
   - **Why Open-Source Extensions**: "Apache AGE, PostGIS, TimescaleDB, pgvector—community-driven, enterprise-proven."

6. **The Journey**
   - **Timeline** (optional):
     - 2024 Q4: Concept & research
     - 2025 Q1: Database architecture complete
     - 2025 Q2: MVP development
     - 2025 Q3: Beta launch
     - 2025 Q4: General availability

7. **Final CTA**
   - "Join Me on This Journey"
   - Waitlist signup
   - "Or connect with me on LinkedIn" (link)

**Target Length**: 3-4 screen scrolls (mobile)
**Key Metrics**: Scroll completion, LinkedIn profile clicks, waitlist conversion

---

### Contact/Waitlist Page (`/contact`)

**Purpose**: Capture early access signups, collect qualified leads

**Sections**:

1. **Page Hero**
   - Headline: "Be Among the First"
   - Subheadline: "Join our early access waitlist and get exclusive updates on development progress."

2. **Form**
   - **Fields**:
     - Email (required)
     - First Name (required)
     - Last Name (required)
     - Company (optional)
     - Role (dropdown: Partner | Principal | Associate | Other)
     - How did you hear about us? (optional)
   - **CTA Button**: "Join Waitlist"
   - **Privacy Note**: "We respect your inbox. No spam, just product updates."

3. **What to Expect**
   - **Headline**: "What Happens Next?"
   - **Steps**:
     1. Instant email confirmation (welcome email)
     2. Monthly development updates
     3. Early access invitation (Q1 2026)
     4. Exclusive beta pricing

4. **FAQ** (Accordion)
   - "When will the product launch?" → Q1 2026 (beta), Q2 2026 (general availability)
   - "How much will it cost?" → Pricing TBD, beta users get exclusive discounts
   - "Can I schedule a demo?" → Not yet, join waitlist for early access
   - "What about data privacy?" → Self-hosted option available, your data stays on your infrastructure

5. **Alternative Contact**
   - "Prefer email?" → geoff@automatonicai.com
   - "Connect on LinkedIn" → [LinkedIn profile link]

**Target Length**: 2 screens (mobile)
**Key Metrics**: Form submission rate, email validation errors, form abandonment rate

---

### Legal Pages (`/legal`)

**Purpose**: Compliance, trust, transparency

#### Privacy Policy (`/legal/privacy`)

**Standard Sections**:
- Data we collect (email, name, analytics)
- How we use it (product updates, analytics)
- Third parties (Resend for email, Plausible for analytics)
- Your rights (unsubscribe, data deletion)
- Contact information

**Template**: Use privacy policy generator (e.g., Termly, TermsFeed)

#### Terms of Service (`/legal/terms`)

**Standard Sections**:
- Use of website
- Intellectual property
- Disclaimer of warranties
- Limitation of liability

**Template**: Use ToS generator (deferred to legal counsel review)

---

## Navigation Structure

### Primary Navigation (Header)

**Desktop**:
```
[Logo] ──── Features ──── About ──── Contact ──── [Join Waitlist CTA]
```

**Mobile** (Hamburger Menu):
```
☰ Menu
├── Home
├── Features
├── About
├── Contact
└── [Join Waitlist]
```

### Footer Navigation

**Column 1: Product**
- Features
- Pricing (future)
- Documentation (future)

**Column 2: Company**
- About
- Blog (future)
- Careers (future)

**Column 3: Legal**
- Privacy Policy
- Terms of Service

**Column 4: Connect**
- LinkedIn
- Twitter/X (future)
- Email: geoff@automatonicai.com

**Bottom Row**:
- © 2025 Automatonic AI Inc. All rights reserved.
- [Plausible Analytics badge] "Privacy-friendly analytics"

---

## URL Structure & SEO

### URL Conventions

**Good**:
- `automatonicai.com/features` (clean, readable)
- `automatonicai.com/blog/graph-databases-for-relationship-intelligence` (descriptive)

**Bad**:
- `automatonicai.com/page?id=123` (not SEO-friendly)
- `automatonicai.com/feature-page-1` (meaningless)

### Canonical URLs

All pages have canonical tags pointing to `https://automatonicai.com/[path]` (no www, no trailing slashes)

### Sitemap.xml

Auto-generated via Next.js:
```xml
<urlset>
  <url>
    <loc>https://automatonicai.com/</loc>
    <lastmod>2025-12-08</lastmod>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>https://automatonicai.com/features</loc>
    <lastmod>2025-12-08</lastmod>
    <priority>0.8</priority>
  </url>
  <!-- etc. -->
</urlset>
```

### Robots.txt

```
User-agent: *
Allow: /
Disallow: /admin/
Disallow: /api/

Sitemap: https://automatonicai.com/sitemap.xml
```

---

## Information Hierarchy

### Priority 1: Homepage Hero
- **Message**: "See Hidden Connections in Your Deal Flow"
- **Action**: Join waitlist
- **Impression**: Technical sophistication, visual elegance

### Priority 2: Features Page
- **Message**: "Multi-modal database capabilities (graph, vector, geospatial, time-series)"
- **Action**: Learn technical details
- **Impression**: Deep expertise, not vaporware

### Priority 3: About Page
- **Message**: "Built by someone who understands your pain"
- **Action**: Trust the founder
- **Impression**: Credibility, authenticity

### Priority 4: Waitlist
- **Message**: "Be among the first to access"
- **Action**: Submit email
- **Impression**: Exclusivity, FOMO

---

## Semantic HTML Structure

### Homepage Example

```html
<main>
  <section id="hero" aria-label="Hero section">
    <h1>See Hidden Connections in Your Deal Flow</h1>
    <p>Multi-modal relationship intelligence for PE/VC/IB professionals</p>
    <a href="#waitlist" class="cta-primary">Join Waitlist</a>
  </section>

  <section id="problem" aria-label="Problem statement">
    <h2>The Multi-Dimensional Relationship Problem</h2>
    <!-- Pain points -->
  </section>

  <section id="solution" aria-label="Solution overview">
    <h2>Multi-Modal Intelligence for Private Markets</h2>
    <!-- 4 pillars -->
  </section>

  <section id="features-preview" aria-label="Key features">
    <h2>Key Capabilities</h2>
    <!-- Feature cards -->
  </section>

  <section id="social-proof" aria-label="Credibility">
    <h2>Built on Proven Technology</h2>
    <!-- Founder + tech stack -->
  </section>

  <section id="use-cases" aria-label="Use cases">
    <h2>Real-World Applications</h2>
    <!-- 3 scenarios -->
  </section>

  <section id="waitlist" aria-label="Early access signup">
    <h2>Join the Waitlist</h2>
    <form><!-- Waitlist form --></form>
  </section>
</main>
```

**Benefits**:
- Screen reader friendly (aria-labels)
- SEO optimized (proper H1-H6 hierarchy)
- Jumplinks work (`#features`, `#waitlist`)

---

## Content Tone & Voice (Reminders)

**Do**:
- Use active voice ("We built this" not "This was built")
- Be specific ("Multi-hop connection strength" not "Better relationships")
- Explain jargon ("Graph database = relationships as first-class entities")
- Show, don't tell ("See who knows who" not "Revolutionary CRM")

**Don't**:
- Use superlatives without proof ("Best CRM ever")
- Be vague ("Industry-leading platform")
- Over-promise ("10x your deal flow")
- Use corporate speak ("Synergistic ecosystem")

---

## Accessibility Checklist

- [ ] All images have alt text
- [ ] Color contrast meets WCAG AA (4.5:1 minimum)
- [ ] Forms have proper labels (not just placeholders)
- [ ] Keyboard navigation works (tab through all interactive elements)
- [ ] Focus states visible
- [ ] ARIA landmarks on sections
- [ ] Headings in logical order (H1 → H2 → H3, no skips)
- [ ] Skip to content link (for screen readers)

---

## Mobile-First Considerations

**Navigation**:
- Hamburger menu (always accessible)
- CTA button visible without scrolling

**Hero**:
- Headline readable on 320px width
- Background graphics don't obscure text

**Forms**:
- Input fields 44px minimum height (touch-friendly)
- Form validation clear and immediate

**Images**:
- Responsive (use next/image)
- Load optimized sizes per breakpoint

---

## Version History

| Version | Date | Changes | Author |
|---------|------|---------|--------|
| 1.0 | 2025-12-08 | Initial sitemap and IA created | Claude Code |

---

## Next Steps

1. ✅ Sitemap complete
2. ⏳ Draft homepage copy → `docs/marketing/copy/homepage.md`
3. ⏳ Draft features copy → `docs/marketing/copy/features.md`
4. ⏳ Draft about copy → `docs/marketing/copy/about.md`
5. ⏳ Review with stakeholder (Geoff)
6. ⏳ Begin development (Story 4: Next.js setup)

---

**Maintained in Git**: `docs/marketing/sitemap.md`
**Synced to Confluence**: Pending
**Epic**: CHRONOS-280
**Story**: CHRONOS-281
