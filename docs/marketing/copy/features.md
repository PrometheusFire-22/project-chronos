# Features Page Copy - Automatonic AI

**Version**: 1.0
**Date**: 2025-12-08
**Status**: Draft for Review
**Epic**: CHRONOS-280
**Story**: CHRONOS-281

---

## Page Hero

### Eyebrow Text
TECHNICAL DEEP DIVE

### Headline (H1)
Multi-Modal Database Intelligence

### Subheadline
Four database paradigms working in concert. PostgreSQL at the core, specialized extensions for graph, vector, geospatial, and time-series queries. Enterprise-grade technology, purpose-built for private market relationship intelligence.

### Visual Description
- Dark gradient background (slate-900 → black)
- Animated diagram showing 4 quadrants, each representing a database paradigm
- Center: PostgreSQL logo (subtle, faded)
- Quadrants rotate slowly or pulse with brand colors
- Each quadrant has icon: Graph (nodes/edges), Vector (3D points), Geo (map), Time (chart)

---

## Section 1: Graph Database Intelligence

### Eyebrow Text
APACHE AGE | GRAPH DATABASE

### Headline (H2)
Relationship Networks, Revealed

###Sub Headline
Traditional CRMs store relationships as foreign keys in flat tables. Graph databases treat relationships as first-class entities—enabling multi-hop traversal, influence mapping, and network effect discovery that SQL queries can't match.

### Problem Statement
**What You Can't Do in Salesforce**:

Imagine you want to answer: *"Show me the shortest introduction path from me to the CEO of Target Company X, ranked by relationship strength."*

In a traditional CRM:
```sql
SELECT contact_name FROM contacts
WHERE company = 'Target Company X'
AND role = 'CEO';
-- Returns: John Smith

-- Now what? How do you find who knows him?
-- Manual LinkedIn stalking begins...
```

**You can't traverse multi-hop relationships in SQL without complex self-joins that become unmanageable beyond 2 degrees.**

### Solution: Graph Queries with Apache AGE

With Project Chronos (powered by Apache AGE Cypher queries):

```cypher
MATCH path = shortestPath(
  (you:Person {name: 'Your Name'})-[:KNOWS*1..5]-(ceo:Person {role: 'CEO', company: 'Target Company X'})
)
RETURN path, length(path) as hops
ORDER BY hops ASC
LIMIT 5;

-- Returns:
-- Path 1 (2 hops): You → LP Contact → CEO (relationship strength: 0.85)
-- Path 2 (3 hops): You → Board Member → Consultant → CEO (strength: 0.72)
```

**Result**: Instant visualization of warm introduction routes, ranked by relationship strength and path length.

### Key Capabilities

#### Capability 1: Multi-Hop Connection Strength
**Icon**: Network with highlighted path

**What It Does**:
Calculate cumulative relationship strength across multiple hops. Not just "Who knows who?" but "How strong is the 3-degree connection through these intermediaries?"

**Use Case**:
You're targeting a portfolio company CEO. Graph query reveals:
- Your LP sits on the board of the CEO's previous company
- That board also includes a consultant your firm uses
- Relationship strength score: 0.78 (strong)

**Why It Matters**:
Instead of cold-calling, you route the intro through your consultant → board member → CEO. Higher response rate, faster deal velocity.

#### Capability 2: Board Network Influence Mapping
**Icon**: Interconnected boards (Venn diagram style)

**What It Does**:
Identify overlapping board seats across portfolio companies, target companies, and LP networks. Surface hidden influence patterns.

**Cypher Query Example**:
```cypher
MATCH (person:Person)-[:BOARD_MEMBER]->(company1:Company)
MATCH (person)-[:BOARD_MEMBER]->(company2:Company)
WHERE company1 <> company2
RETURN person.name, collect(company1.name) as boards, count(company1) as board_count
ORDER BY board_count DESC
LIMIT 20;

-- Returns: Top 20 "super-connectors" who sit on multiple boards in your network
```

**Use Case**:
Discover that a single individual sits on boards of 3 companies in your portfolio + 2 target acquisition companies. They're a key influencer you should cultivate.

#### Capability 3: Co-Investment Syndication Patterns
**Icon**: Cluster diagram showing co-investor groups

**What It Does**:
Analyze historical co-investment patterns to predict future syndication opportunities. Which LPs consistently invest together? Which GPs have overlapping portfolio strategies?

**Cypher Query Example**:
```cypher
MATCH (lp1:LP)-[:INVESTED_IN]->(fund:Fund)<-[:INVESTED_IN]-(lp2:LP)
WHERE lp1 <> lp2
RETURN lp1.name, lp2.name, count(fund) as co_investments
ORDER BY co_investments DESC
LIMIT 10;

-- Returns: LP pairs who have co-invested in X funds (strong syndication signal)
```

**Use Case**:
You're raising Fund III. Query reveals which LPs have historically co-invested with your top commitments. Proactive outreach to likely syndicate partners.

#### Capability 4: Re-Up Rate Intelligence
**Icon**: Time-series chart with fund subscription periods

**What It Does**:
Track which LPs re-committed to subsequent funds and which didn't. Graph + time-series combination shows relationship evolution.

**Combined Query** (Graph + Time-Series):
```cypher
MATCH (lp:LP)-[inv:INVESTED_IN]->(fund:Fund {manager: 'Apollo'})
RETURN lp.name, fund.name, inv.commitment_date, inv.amount
ORDER BY lp.name, inv.commitment_date;

-- Cross-reference: Which LPs invested in Fund XII but NOT Fund XIII?
-- Relationship decay signal
```

**Use Case**:
Identify LPs who stopped re-upping with specific managers. Reach out to understand why—potential new relationship opportunity.

### Visual: Interactive Graph Diagram

**Description for Development**:
- Force-directed graph layout (D3.js)
- Center node: "You" (purple)
- First degree: Your direct contacts (teal)
- Second/third degree: Extended network (green → white gradient by distance)
- Edges: Lines with varying thickness = relationship strength
- Hover: Shows relationship details (last contact date, interaction count)
- Click: Expands node to show connections

---

## Section 2: Vector Search Intelligence

### Eyebrow Text
PGVECTOR | SEMANTIC SEARCH

### Headline (H2)
Semantic Matching, Powered by AI

### Subheadline
Keyword search finds exact matches. Vector search understands meaning—enabling semantic similarity queries that surface relevant companies, deals, and contacts even when descriptions vary.

### Problem Statement
**The Keyword Search Limitation**:

You want to find companies similar to your successful SaaS investment:
- Company A: "Cloud-based customer data platform with real-time analytics"
- Company B: "CDP enabling unified customer insights through data integration"
- Company C: "Marketing automation with embedded BI tools"

**Keyword Search** (traditional):
```sql
SELECT name FROM companies
WHERE description LIKE '%cloud%'
AND description LIKE '%analytics%';

-- Returns: Only Company A (exact keyword match)
-- Misses: Company B (says "CDP" not "platform") and C (different wording, similar function)
```

### Solution: Vector Embeddings with pgvector

**How It Works**:
1. Every company description is converted to a vector embedding (AI model)
2. Similar companies cluster together in high-dimensional vector space
3. Cosine similarity search finds nearest neighbors

**pgvector Query Example**:
```sql
SELECT name, description,
       1 - (embedding <=> '[query_embedding]') as similarity
FROM companies
ORDER BY embedding <=> '[query_embedding]'
LIMIT 10;

-- Returns: Companies ranked by semantic similarity
-- Company B: 0.92 similarity (CDP = customer data platform)
-- Company C: 0.87 similarity (analytics/BI overlap)
```

**Result**: Discover relevant companies even with different terminology.

### Key Capabilities

#### Capability 1: Lookalike Company Discovery
**Icon**: Geometric shapes clustering in 3D space

**What It Does**:
Input a successful portfolio company → Get ranked list of similar companies based on business model, sector, growth stage, etc.

**Use Case**:
Your top-performing investment is a vertical SaaS company in healthcare. Vector search finds 15 similar companies in adjacent verticals (legal tech, fintech) with comparable metrics—expansion targets.

**Why It Matters**:
Pattern-match successful investments without manual research. Identify adjacent opportunities faster.

#### Capability 2: Natural Language Querying
**Icon**: Search bar with brain/AI icon

**What It Does**:
Describe what you're looking for in plain English → System converts to vector embedding → Returns semantically relevant results.

**Example Queries**:
- "Series B SaaS companies with strong network effects in vertical markets"
- "PE funds focused on industrial roll-ups in fragmented markets"
- "Family offices with appetite for direct co-investments in tech"

**Technical Implementation**:
```python
# Convert natural language to vector embedding
query = "Series B SaaS companies with network effects"
embedding = openai.embed(query)

# Search pgvector
results = db.query("""
    SELECT name, description, stage,
           1 - (embedding <=> %s) as score
    FROM companies
    WHERE stage = 'Series B'
    ORDER BY score DESC
    LIMIT 20;
""", [embedding])
```

#### Capability 3: Deal Pattern Recognition
**Icon**: Deal documents with similarity lines connecting them

**What It Does**:
Analyze historical deal structures to find similar transactions. Vector embeddings capture deal characteristics (structure, terms, sector, size).

**Use Case**:
You're structuring a complex secondary transaction. Vector search finds 8 similar deals from the past 3 years—providing comp analysis and structuring precedents.

#### Capability 4: Investment Thesis Matching
**Icon**: Document with AI sparkle

**What It Does**:
Encode your fund's investment thesis as a vector → Automatically score incoming deal flow by semantic alignment.

**Example Workflow**:
1. Input thesis: "B2B SaaS, $5-20M ARR, 100%+ NRR, capital-efficient growth"
2. System encodes as vector
3. Every new company in pipeline scored 0-1 for thesis fit
4. Top matches surfaced automatically

**Result**: Less time on non-fit deals, more focus on thesis-aligned opportunities.

### Visual: Vector Space Diagram

**Description for Development**:
- 2D projection of high-dimensional vector space (t-SNE or PCA)
- Dots = companies, colored by sector or stage
- Clusters visible (similar companies group together)
- Query point highlighted in purple
- Nearest neighbors highlighted in teal (connected by dotted lines)
- Hover: Shows company name + similarity score

---

## Section 3: Geospatial Intelligence

### Eyebrow Text
POSTGIS | GEOSPATIAL ANALYSIS

### Headline (H2)
Geography Meets Opportunity

### Subheadline
Your relationships have location context. Overlay economic indicators, identify portfolio clustering, analyze regional market trends. PostGIS brings spatial intelligence to relationship management.

### Problem Statement
**The Missing Dimension: Location**

Traditional CRMs have an "Address" field. That's it. No spatial queries, no proximity analysis, no economic context.

Questions you can't answer:
- "Which portfolio companies are within 50 miles of Austin, TX?"
- "Show me all LPs headquartered in high-growth metro areas (GDP >3% YoY)"
- "Identify geographic gaps in our portfolio coverage"

### Solution: PostGIS Spatial Queries

**PostGIS Query Examples**:

**Proximity Search**:
```sql
SELECT name, city, state,
       ST_Distance(geography, ST_MakePoint(-97.7431, 30.2672)::geography) / 1609.34 as miles
FROM companies
WHERE ST_DWithin(geography, ST_MakePoint(-97.7431, 30.2672)::geography, 80000) -- 50 miles in meters
ORDER BY miles ASC;

-- Returns: All companies within 50 miles of Austin, TX
```

**Geographic Clustering**:
```sql
SELECT ST_ClusterKMeans(geography, 5) OVER() as cluster_id, name, city, state
FROM portfolio_companies;

-- Returns: Companies grouped into 5 geographic clusters
-- Reveals regional concentration patterns
```

### Key Capabilities

#### Capability 1: Regional Portfolio Mapping
**Icon**: Map with pins/clusters

**What It Does**:
Visualize all portfolio companies, LP headquarters, target acquisitions on an interactive map. Color-code by sector, stage, investment size.

**Use Case**:
Discover you have 12 portfolio companies in the Southeast but only 2 LPs in that region. Relationship leverage mismatch—territory expansion opportunity.

**Why It Matters**:
Strategic decisions informed by geographic distribution of your network.

#### Capability 2: Economic Indicator Overlay
**Icon**: Map with gradient heatmap (GDP growth, employment)

**What It Does**:
Integrate FRED economic data, Census data, local market indicators. Overlay on your network map.

**PostGIS + FRED Data Query**:
```sql
SELECT c.name, c.city, c.state, e.gdp_growth, e.unemployment_rate
FROM companies c
JOIN economic_data e ON ST_Within(c.geography, e.geography)
WHERE e.gdp_growth > 3.0 AND e.unemployment_rate < 4.0
ORDER BY e.gdp_growth DESC;

-- Returns: Companies in high-growth, low-unemployment regions
```

**Use Case**:
Identify which portfolio companies are in economically strong markets (tailwinds) vs. weak markets (headwinds). Inform investment decisions.

#### Capability 3: Market Expansion Analysis
**Icon**: Map with highlighted expansion zones

**What It Does**:
Identify underserved geographic markets where you have weak relationship coverage but strong economic opportunity.

**Spatial Analysis**:
1. Map all existing relationships (portfolio companies, LPs, advisors)
2. Identify "cold zones" (low relationship density)
3. Overlay economic data (high-growth metros)
4. Prioritize expansion targets: High growth + low coverage = opportunity

**Use Case**:
Your fund focuses on industrial roll-ups. Geospatial analysis reveals:
- Strong coverage in Midwest (15 companies)
- Weak coverage in Southwest (2 companies)
- Southwest GDP growth: 4.2% (above national avg)
- **Action**: Prioritize Arizona, New Mexico, Texas for sourcing

#### Capability 4: Proximity-Based Recommendations
**Icon**: Concentric circles radiating from a center point

**What It Does**:
When you're traveling to a city, automatically surface all contacts within X miles. Optimize face-to-face relationship building.

**Query Example**:
```sql
SELECT name, title, company, phone,
       ST_Distance(geography, ST_MakePoint($your_lon, $your_lat)::geography) / 1609.34 as miles
FROM contacts
WHERE ST_DWithin(geography, ST_MakePoint($your_lon, $your_lat)::geography, 16000) -- 10 miles
AND last_contact_date < NOW() - INTERVAL '6 months'
ORDER BY last_contact_date ASC;

-- Returns: Contacts you haven't spoken to in 6+ months, ranked by staleness
-- When you're in their city—maximize relationship ROI
```

### Visual: Interactive Map with Layers

**Description for Development**:
- Base map: Dark theme (Mapbox/Leaflet)
- Layer 1: Portfolio companies (purple pins)
- Layer 2: LP headquarters (teal pins)
- Layer 3: Economic heatmap (green gradient = high GDP growth)
- Layer 4: Clustering circles (geographic concentration)
- Hover: Shows entity details (name, metrics)
- Click: Drills into entity profile

---

## Section 4: Time-Series Intelligence

### Eyebrow Text
TIMESCALEDB | TIME-SERIES ANALYTICS

### Headline (H2)
Relationships Evolve. Track Them.

### Subheadline
CRMs show current state. TimescaleDB tracks how relationships change over time—enabling decay detection, trend analysis, and optimal outreach timing.

### Problem Statement
**The Snapshot Problem**:

Traditional CRMs:
- Last Contact Date: 2024-06-15
- Relationship Strength: "Strong"

But you don't see:
- Interaction frequency declining over past 6 months?
- Response rate dropped from 80% to 40%?
- Deal velocity slowing (used to close in 90 days, now 180 days)?

**Relationships aren't static snapshots. They're evolving time-series.**

### Solution: TimescaleDB Hypertables

**How It Works**:
- Every interaction (email, call, meeting, deal) is a timestamped event
- TimescaleDB hypertables optimize time-series queries
- Continuous aggregations pre-compute metrics (rolling averages, decay rates)
- Alert on anomalies (relationship decay, unusual inactivity)

**Time-Series Query Example**:
```sql
SELECT time_bucket('1 month', interaction_date) AS month,
       contact_id,
       count(*) as interaction_count,
       avg(response_time_hours) as avg_response_time
FROM interactions
WHERE contact_id = 123
AND interaction_date > NOW() - INTERVAL '12 months'
GROUP BY month, contact_id
ORDER BY month DESC;

-- Returns: Monthly interaction frequency + response time trend
-- Declining pattern = relationship decay signal
```

### Key Capabilities

#### Capability 1: Relationship Decay Detection
**Icon**: Line chart trending downward with alert icon

**What It Does**:
Automatically detect when interaction frequency or response rates decline. Alert you before relationships go cold.

**Decay Algorithm**:
```sql
-- Calculate relationship strength decay
WITH interaction_trends AS (
  SELECT contact_id,
         time_bucket('1 month', interaction_date) AS month,
         count(*) as interactions
  FROM interactions
  GROUP BY contact_id, month
)
SELECT contact_id,
       regr_slope(interactions, extract(epoch from month)) as trend
FROM interaction_trends
GROUP BY contact_id
HAVING regr_slope(interactions, extract(epoch from month)) < -0.5
-- Returns: Contacts with declining interaction trend (negative slope)
```

**Alert Example**:
> "⚠️ Relationship decay detected: John Smith (LP, XYZ Capital). Interaction frequency down 60% in past 6 months. Last contact: 4 months ago."

#### Capability 2: Optimal Outreach Timing
**Icon**: Calendar with AI suggestion

**What It Does**:
Analyze historical response patterns to predict optimal outreach timing. When is this contact most likely to respond?

**Time-Series Analysis**:
```sql
SELECT extract(dow from interaction_date) as day_of_week,
       extract(hour from interaction_date) as hour,
       avg(CASE WHEN response_received THEN 1 ELSE 0 END) as response_rate
FROM interactions
WHERE contact_id = 123
GROUP BY day_of_week, hour
ORDER BY response_rate DESC
LIMIT 5;

-- Returns: Best days/times to reach this contact (highest historical response rate)
```

**Use Case**:
System suggests: "Best time to email Sarah Johnson: Tuesday at 9 AM (78% historical response rate)."

#### Capability 3: Deal Velocity Trends
**Icon**: Funnel with time markers

**What It Does**:
Track how long deals take to close over time. Identify slowdowns, optimize processes.

**Pipeline Velocity Query**:
```sql
SELECT time_bucket('1 quarter', deal_close_date) AS quarter,
       avg(deal_close_date - deal_start_date) as avg_days_to_close,
       count(*) as deals_closed
FROM deals
WHERE status = 'closed_won'
GROUP BY quarter
ORDER BY quarter DESC;

-- Returns: Quarterly trend of average deal cycle time
-- Increasing trend = process inefficiency signal
```

**Use Case**:
Notice deal velocity slowing from 90 days (Q1 2024) to 120 days (Q3 2024). Investigate: More complex deals? Slower LP decision-making? Process bottleneck?

#### Capability 4: Market Trend Correlation
**Icon**: Two overlaid time-series charts (deal flow + economic indicator)

**What It Does**:
Correlate your deal flow, fundraising success, LP activity with macroeconomic indicators (interest rates, GDP, market volatility).

**Correlation Query** (TimeScaleDB + FRED data):
```sql
SELECT time_bucket('1 month', d.close_date) AS month,
       count(d.deal_id) as deals_closed,
       avg(e.interest_rate) as avg_fed_rate,
       corr(count(d.deal_id), avg(e.interest_rate)) OVER() as correlation
FROM deals d
JOIN economic_indicators e ON time_bucket('1 month', d.close_date) = time_bucket('1 month', e.date)
GROUP BY month;

-- Returns: Correlation between deal closures and interest rates
-- Positive correlation = rate-sensitive deal flow
```

**Use Case**:
Discover strong negative correlation between Fed rate hikes and LP fundraising commitments. Adjust timing of fundraising efforts accordingly.

### Visual: Time-Series Dashboard

**Description for Development**:
- Line chart: Interaction frequency over time (smoothed with rolling average)
- Overlaid: Relationship strength score (0-1 scale)
- Annotations: Major events (deal closed, fund raised, board change)
- Color coding: Green (improving), yellow (stable), red (declining)
- Hover: Shows exact metrics for that time period

---

## Comparison Table Section

### Headline (H2)
Feature Comparison: Multi-Modal vs. Traditional

### Table

| Feature | Salesforce | HubSpot | LinkedIn Sales Nav | **Project Chronos** |
|---------|------------|---------|---------------------|---------------------|
| **Graph Queries** | | | | |
| Multi-hop relationship paths | ❌ Manual | ❌ Manual | 2 degrees (limited) | ✅ Unlimited (Cypher) |
| Board network overlap | ❌ | ❌ | ❌ | ✅ Automated |
| Co-investment pattern analysis | ❌ | ❌ | ❌ | ✅ Native graph |
| Influence scoring across network | ❌ | ❌ | Basic | ✅ Weighted algorithms |
| | | | | |
| **Vector Search** | | | | |
| Semantic similarity matching | ❌ Keyword only | ❌ Keyword only | ❌ Keyword only | ✅ pgvector embeddings |
| Natural language queries | ❌ | ❌ | ❌ | ✅ AI-powered |
| Lookalike company discovery | Manual tagging | Manual tagging | Manual | ✅ Automated |
| Deal pattern recognition | ❌ | ❌ | ❌ | ✅ Vector clustering |
| | | | | |
| **Geospatial** | | | | |
| Proximity queries | ❌ | ❌ | ❌ | ✅ PostGIS |
| Economic indicator overlay | ❌ | ❌ | ❌ | ✅ FRED/Census data |
| Geographic clustering | ❌ | ❌ | ❌ | ✅ Spatial analysis |
| Territory gap analysis | Manual | Manual | Manual | ✅ Automated |
| | | | | |
| **Time-Series** | | | | |
| Relationship decay detection | ❌ | ❌ | ❌ | ✅ TimescaleDB |
| Interaction trend analysis | Basic reports | Basic reports | Basic | ✅ Continuous aggregations |
| Optimal outreach timing | ❌ | ❌ | ❌ | ✅ Predictive |
| Historical relationship evolution | Logs only | Logs only | Logs only | ✅ Full time-series |
| | | | | |
| **Specialization** | | | | |
| PE/VC/IB focus | Generic B2B | Generic B2B | Social network | ✅ Purpose-built |
| Self-hosted option | ❌ Cloud only | ❌ Cloud only | ❌ Cloud only | ✅ Your infrastructure |
| Data privacy (on-prem) | ❌ | ❌ | ❌ | ✅ Full control |

---

## Integration Roadmap Section

### Eyebrow Text
COMING SOON

### Headline (H2)
Seamless Integration with Your Existing Tools

### Subheadline
Real-time data sync with the platforms you already use. No manual CSV imports—your network stays unified across systems.

### Integrations Grid (3 x 3)

**Row 1: CRM & Sales**
1. **Salesforce**
   - Icon: Salesforce logo (faded)
   - Badge: "Q2 2026"
   - Description: "Bi-directional sync of contacts, companies, opportunities"

2. **HubSpot**
   - Icon: HubSpot logo
   - Badge: "Q2 2026"
   - Description: "Marketing automation + deal pipeline integration"

3. **LinkedIn Sales Navigator**
   - Icon: LinkedIn logo
   - Badge: "Q3 2026"
   - Description: "Social network data enrichment"

**Row 2: Data Providers**
4. **PitchBook**
   - Icon: PitchBook logo
   - Badge: "Q2 2026"
   - Description: "Deal history, fund performance, LP commitments"

5. **Bloomberg Terminal**
   - Icon: Bloomberg logo
   - Badge: "Q3 2026"
   - Description: "Market data, company financials, economic indicators"

6. **Crunchbase**
   - Icon: Crunchbase logo
   - Badge: "Q2 2026"
   - Description: "Startup funding data, founder networks"

**Row 3: Productivity**
7. **Gmail / Google Workspace**
   - Icon: Gmail logo
   - Badge: "Q1 2026 (Beta)"
   - Description: "Automatic interaction logging, email sentiment analysis"

8. **Outlook / Microsoft 365**
   - Icon: Outlook logo
   - Badge: "Q2 2026"
   - Description: "Calendar integration, meeting notes sync"

9. **Slack**
   - Icon: Slack logo
   - Badge: "Q3 2026"
   - Description: "Team collaboration, deal flow alerts"

### Note on Integrations
"**Data sovereignty first**: All integrations run through your infrastructure. Third-party data never touches our servers—it flows directly to your self-hosted instance."

---

## FAQ Accordion

### Headline (H2)
Technical FAQs

### Questions (Expandable Accordion)

**Q: Can I run Project Chronos on-premise?**
A: Yes. We're built on PostgreSQL with open-source extensions (Apache AGE, pgvector, TimescaleDB, PostGIS). Deploy on your own infrastructure—AWS, GCP, Azure, or bare metal. Your data never leaves your control.

**Q: What about data privacy for LP/investor information?**
A: Self-hosted deployment means 100% data sovereignty. Sensitive LP data, fund performance, deal terms—all stays on your servers. No cloud provider access, no third-party data sharing.

**Q: How do I import existing CRM data?**
A: Standard CSV import for initial migration. For ongoing sync, we support API integrations with Salesforce, HubSpot, and custom connectors. Our team assists with schema mapping.

**Q: Do I need to know Cypher (graph query language)?**
A: No. The UI provides visual graph exploration and natural language querying. For advanced users, direct Cypher/SQL access is available for custom analyses.

**Q: What's the learning curve?**
A: If you're familiar with traditional CRMs, you'll adapt quickly. Graph concepts are intuitive ("who knows who?"). We provide onboarding, training materials, and dedicated support for beta users.

**Q: Can I start with just one database modality?**
A: Yes, but you'd miss the multi-modal advantage. Graph, vector, geospatial, and time-series work together—relationship paths (graph) + semantic matching (vector) + location context (geo) + decay detection (time-series). The sum is greater than the parts.

**Q: What's required for self-hosting?**
A: Minimum:
- PostgreSQL 16.4+
- 4 vCPUs, 8GB RAM (scales up based on data volume)
- Ubuntu 22.04+ or similar Linux distribution
- Docker (recommended for deployment)

Our team provides deployment scripts and infrastructure-as-code (Terraform) for AWS/GCP.

**Q: How does pricing work?**
A: Pricing will be announced closer to beta launch (Q1 2026). Early access members get exclusive discounts. Self-hosted deployments have different pricing than managed cloud options.

---

## Final CTA

### Eyebrow Text
READY TO GO DEEPER?

### Headline (H2)
Join the Waitlist for Technical Deep Dives

### Subheadline
Early access members receive monthly technical updates, architecture diagrams, and direct access to our development roadmap. Be part of shaping the product.

### CTA Button
```
[Join Early Access Waitlist →] (Links to /contact)
```

### Alternative CTA
```
[Read the About Page →] (Links to /about)
"Learn about the founder's journey from investment banking to database architecture"
```

---

## SEO Meta Tags

### Title Tag
`Features | Multi-Modal Database Intelligence for PE/VC/IB`

### Meta Description
`Graph queries (Apache AGE), vector search (pgvector), geospatial analysis (PostGIS), time-series tracking (TimescaleDB). Purpose-built for private market relationship intelligence.`

### Keywords
- Apache AGE graph queries
- pgvector semantic search
- PostGIS geospatial CRM
- TimescaleDB relationship tracking
- Multi-modal database
- Cypher query language
- Investment banking software
- Private equity deal flow
- Relationship intelligence platform

---

## Design Notes

### Code Snippet Styling
```css
/* Cypher/SQL code blocks */
background: #1E293B (slate-800)
border: 1px solid #334155 (slate-700)
border-radius: 8px
padding: 24px
font-family: 'JetBrains Mono', monospace
font-size: 14px
color: #E2E8F0 (slate-200)
syntax-highlighting: monokai theme
```

### Interactive Diagrams
- Graph visualization: Force-directed layout (D3.js)
- Vector space: t-SNE projection (Plotly or custom canvas)
- Map: Mapbox GL JS (dark theme)
- Time-series: Recharts with Framer Motion animations

### Animations
- Code blocks: Syntax highlight on scroll-into-view (0.3s delay)
- Diagrams: Fade-in + scale (0.6s)
- Accordion: Smooth expand/collapse (0.4s ease-out)

---

**Maintained in Git**: `docs/marketing/copy/features.md`
**Epic**: CHRONOS-280
**Story**: CHRONOS-281
