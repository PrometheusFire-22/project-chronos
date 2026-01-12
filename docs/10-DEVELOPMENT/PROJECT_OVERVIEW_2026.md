# Project Chronos: Comprehensive Overview 2026

**Document Version:** 1.0
**Last Updated:** January 11, 2026
**Status:** Production (Time-Series), Planning (Geospatial & Graph)

---

## Executive Summary

Project Chronos is a multi-modal economic intelligence platform that combines time-series analytics, geospatial visualizations, and graph-based relationship mapping to provide actionable insights for consulting and SaaS customers. The platform integrates data from multiple authoritative sources (FRED, Bank of Canada, Bank of England) with advanced PostgreSQL capabilities (TimescaleDB, PostGIS, Apache AGE, pgvector).

**Current State:**
- ✅ **Time-Series Dashboard**: Successfully deployed to Cloudflare Pages
- 🔄 **Geospatial Visualizations**: Planning phase (Q1 2026)
- 📋 **Graph Visualizations**: Roadmap (Q2 2026)
- 📋 **Vector/Semantic Search**: Roadmap (Q2-Q3 2026)

---

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Technology Stack](#technology-stack)
3. [Database Architecture](#database-architecture)
4. [Current Implementation](#current-implementation)
5. [Routing & Information Architecture](#routing--information-architecture)
6. [Data Ingestion Pipeline](#data-ingestion-pipeline)
7. [Deployment Infrastructure](#deployment-infrastructure)
8. [Recent Accomplishments](#recent-accomplishments)
9. [Next Phase: Geospatial Features](#next-phase-geospatial-features)
10. [Future Roadmap](#future-roadmap)

---

## Architecture Overview

### Monorepo Structure

Project Chronos uses a **pnpm workspace monorepo** orchestrated by **Nx 22.3.3**, enabling efficient code sharing and build optimization across multiple packages.

```
project-chronos/
├── apps/                      # Application packages
│   ├── web/                   # Next.js 15 frontend (Cloudflare Pages)
│   └── worker/                # Cloudflare Worker runtime
├── packages/                  # Shared libraries
│   ├── config/                # TypeScript, Tailwind configs
│   ├── database/              # Drizzle ORM utilities
│   ├── types/                 # Shared TypeScript types
│   ├── ui/                    # Reusable React components
│   └── utils/                 # Formatting, validation
├── src/chronos/               # Python backend (ingestion & workflows)
│   ├── cli/                   # Command-line interfaces
│   ├── database/              # SQLAlchemy connection management
│   ├── ingestion/             # Data source plugins (FRED, BOC, BOE, geospatial)
│   └── integrations/          # Google Workspace, Confluence, Jira
├── database/                  # SQL schemas, migrations, seeds
├── tests/                     # Unit, integration, e2e, infrastructure tests
└── scripts/                   # Development & operational utilities
```

### Multi-Modal Database Capabilities

The platform leverages PostgreSQL's extensibility to provide four primary data modalities:

| Modality | Extension | Purpose | Status |
|----------|-----------|---------|--------|
| **Time-Series** | TimescaleDB | Economic indicators over time | ✅ Production |
| **Geospatial** | PostGIS | Regional comparisons, choropleth maps | 🔄 Infrastructure ready |
| **Graph** | Apache AGE | Investment networks, relationships | 📋 Schema ready |
| **Vector/Semantic** | pgvector | Semantic search, embeddings | 📋 Infrastructure ready |

---

## Technology Stack

### Frontend
- **Framework:** Next.js 15.4.10 (App Router)
- **Runtime:** React 19.2.1
- **Styling:** Tailwind CSS 3.4.3
- **Charts:** Recharts (current), deck.gl (planned)
- **Icons:** lucide-react 0.562.0
- **Animations:** Framer Motion 12.23.26
- **Database Client:** pg 8.16.3 (via Cloudflare Hyperdrive)

### Backend (Python)
- **Version:** Python 3.10+
- **ORM:** SQLAlchemy
- **CLI Framework:** Typer + Rich
- **Geospatial:** GeoPandas, Shapely
- **Data Processing:** Pandas, NumPy
- **HTTP Client:** httpx, requests

### Infrastructure
- **Deployment:** Cloudflare Pages (Next.js via OpenNext adapter)
- **Database:** PostgreSQL 15+ with TimescaleDB 2.x
- **Container Orchestration:** Docker Compose (development)
- **Error Tracking:** Sentry @sentry/cloudflare
- **Email:** Resend

### Development Tools
- **Monorepo:** Nx 22.3.3
- **Package Manager:** pnpm 9.1.0
- **Type Checking:** TypeScript 5.9.3
- **Linting:** Prettier 2.8.8
- **Build:** SWC @swc/core 1.5.29

---

## Database Architecture

### PostgreSQL Extensions

```sql
-- Time-Series
timescaledb                    -- Hypertables, continuous aggregates

-- Geospatial
postgis                        -- Geometry/geography types
postgis_topology               -- Advanced spatial relationships
postgis_raster                 -- Raster data support
earthdistance                  -- Great circle distance calculations

-- Vector/Semantic
vector (pgvector)              -- 384-dimensional embeddings

-- Graph Database
age (Apache AGE)               -- Cypher query language (openCypher)

-- Text Processing
pg_trgm                        -- Trigram matching
fuzzystrmatch                  -- Levenshtein/Soundex
unaccent                       -- Accent removal

-- Analytics/Statistical
tablefunc                      -- Crosstab (pivot tables)
intarray                       -- Integer array operations
cube                           -- OLAP operations

-- Key-Value & Cryptography
hstore                         -- Key-value pairs
pgcrypto                       -- Hashing, encryption
```

### Schema Organization

```sql
CREATE SCHEMA metadata;        -- Series definitions, data sources
CREATE SCHEMA timeseries;      -- TimescaleDB hypertables
CREATE SCHEMA analytics;       -- Materialized views
CREATE SCHEMA geospatial;      -- PostGIS layers (auto-created)
CREATE SCHEMA ag_catalog;      -- Apache AGE graph infrastructure
```

### Core Tables

#### metadata.data_sources
External data providers (FRED, Bank of Canada, Bank of England)
- API configuration
- Rate limiting rules
- Authentication requirements

#### metadata.series_metadata
Economic indicator definitions with multi-modal capabilities:
- **series_id** (PK): Unique identifier
- **series_name**: Human-readable name
- **geography**: Region (CANADA, US, UK, etc.)
- **frequency**: Daily, Weekly, Monthly, Quarterly, Annual
- **units**: Percentage, Index, Currency
- **description_embedding** (vector 384): Semantic search capability
- **location** (geography POINT): PostGIS coordinate
- **metadata_json** (hstore): Flexible key-value metadata

#### timeseries.economic_observations (Hypertable)
Time-series data optimized by TimescaleDB:
- Partitioned by `observation_date` (monthly buckets)
- Indexed on `(series_id, observation_date)`
- Supports `time_bucket()` for interval aggregation
- Foreign key to `metadata.series_metadata`

#### geospatial.* (Dynamic)
PostGIS layers created during ingestion:
- `us_counties` - US county boundaries
- `us_cbsa` - Core-Based Statistical Areas
- `us_csa` - Combined Statistical Areas
- `ca_provinces` - Canadian provinces
- `ca_census_divisions` - Canadian census divisions
- Each table: `geometry` column + `GIST` spatial index

---

## Current Implementation

### Time-Series Dashboard

**Route:** `/analytics/economic` (also accessible via `/solutions`)

#### Key Features
1. **Multi-Series Line Chart** (Recharts)
   - Responsive container (400px mobile, 550px desktop)
   - Dual-axis support for different scales (>3x difference triggers right axis)
   - Smart axis mapping: series <33% of dominant scale go to right axis
   - Color-coded by geography:
     - Canada: Red (`#f87171`)
     - US: Blue (`#60a5fa`)
     - Others: Dashboard palette
   - Adaptive formatting (k suffix for values >1000)
   - Null value handling with `connectNulls={true}`

2. **Filter Sidebar**
   - Temporal scope picker (start/end dates)
   - Geographic focus toggle (multi-select)
   - Indicator catalog with scrollable list
   - Series count indicator

3. **Active Indicator Cards**
   - Displays selected series metadata
   - Shows frequency, units, geography
   - Color-coded badges
   - Remove button per series

#### Data Flow
```typescript
// 1. Server-side data fetching (apps/web/lib/analytics.ts)
export async function getTimeseriesData(filter: AnalyticsFilter): Promise<TimeseriesPoint[]>

// 2. TimescaleDB query with time_bucket aggregation
SELECT
  time_bucket($1, eo.observation_date) AS time,
  eo.series_id,
  AVG(eo.value)::float AS value,
  sm.series_name
FROM timeseries.economic_observations eo
JOIN metadata.series_metadata sm ON eo.series_id = sm.series_id
WHERE eo.series_id = ANY($2) AND observation_date >= $3 AND observation_date <= $4
GROUP BY time, eo.series_id, sm.series_name
ORDER BY time ASC;

// 3. React server component (apps/web/app/(frontend)/analytics/economic/page.tsx)
export default async function EconomicAnalyticsPage({ searchParams })

// 4. Client-side chart rendering (apps/web/components/analytics/EconomicChart.tsx)
<ResponsiveContainer><LineChart>...</LineChart></ResponsiveContainer>
```

#### Query Parameters
- `?series=71,107,72` - Comma-separated series IDs
- `&geos=CANADA,US` - Geographic filter
- `&start=2020-01-01` - Start date
- `&end=2024-01-01` - End date

**Default Series** (on initial load):
- Series ID 71: Federal Funds Effective Rate
- Series ID 107: 10-Year Treasury Constant Maturity Rate
- Series ID 72: 30-Year Treasury Constant Maturity Rate

---

## Routing & Information Architecture

### Current Structure

```
/(frontend)/
├── /                          # Homepage (hero, features)
├── /solutions                 # Reuses EconomicAnalyticsPage (consulting showcase)
├── /analytics/economic        # Main time-series dashboard
├── /features                  # Feature showcase
├── /about                     # About page
├── /docs                      # Documentation hub
├── /blog/[slug]              # Blog posts
├── /community                # Community page
├── /contact                  # Contact form
├── /help-center              # Help resources
└── /security                 # Security information
```

### Current Issue (CHRONOS-403)

**Problem:**
- `/solutions` and `/analytics/economic` are identical (code reuse via import)
- Unclear how to organize multiple visualization types
- Need separate navigation for different dashboard types

**Requirement:**
Plan information architecture for:
1. Time-series charts (current)
2. Geospatial visualizations (planned)
3. Graph charts (planned)

**Business Context:**
- **Consulting-first strategy**: Dashboards as portfolio pieces
- **SaaS transition**: Same dashboards serve as product demos
- **Dual purpose**: Portfolio for consulting + functional product for SaaS

---

## Data Ingestion Pipeline

### Architecture

**Python CLI-based ingestion** (`src/chronos/ingestion/`)

#### Plugin System
1. **FREDPlugin** (`fred.py`)
   - Federal Reserve Economic Data
   - Uses `FRED_API_KEY` environment variable
   - Fetches US economic indicators
   - Rate limiting: 120 requests/minute

2. **ValetPlugin** (`valet.py`)
   - Bank of Canada data source
   - Canadian economic indicators
   - Public API (no key required)

3. **BOEPlugin** (placeholder)
   - Bank of England integration
   - Planned for UK data

4. **GeospatialIngestion** (`geospatial_cli.py`)
   - Shapefile loading via GeoPandas
   - PostGIS integration
   - TIGER/Line (US) and Statistics Canada boundaries

#### Catalog-Driven Configuration

**Catalog Format** (database/seeds/*.csv)
```csv
source_name,series_id,source_series_id,status
FRED,1,GDP,Active
BOC,2,USDCAD,Active
```

#### Ingestion CLI (`timeseries_cli.py`)
```bash
# Full catalog ingestion
python -m chronos.cli.timeseries_cli ingest --catalog database/seeds/time-series_catalog.csv

# Single series update
python -m chronos.cli.timeseries_cli update --series-id 71
```

#### Features
- Transaction-safe bulk operations
- Automatic `source_id` management
- Duplicate detection
- Comprehensive error logging
- Ingestion metadata tracking

---

## Deployment Infrastructure

### Cloudflare Pages (Production)

**Build Configuration:**
```json
{
  "framework": "next",
  "buildCommand": "pnpm nx build web",
  "outputDirectory": "apps/web/.open-next",
  "nodeVersion": "18"
}
```

**Adapter:** OpenNext (Cloudflare Workers-compatible Next.js adapter)

**Bindings:**
- `DB`: Cloudflare Hyperdrive (PostgreSQL connection pooling)
- Environment variables via Cloudflare dashboard

### Database Connection Strategy

**Development:**
```typescript
// Direct PostgreSQL connection
DATABASE_HOST=localhost
DATABASE_PORT=5432
```

**Production:**
```typescript
// Cloudflare Hyperdrive binding
const connectionString = env.DB.connectionString;
const pool = new Pool({
  connectionString,
  max: 10,
  maxUses: 1  // Required for Cloudflare Workers
});
```

**Caching:**
```typescript
import { cache } from 'react';

// SSR/SSG: Synchronous pool
export const getPool = cache((): DbClient => { ... });

// ISR/Dynamic: Async pool
export const getPoolAsync = cache(async (): Promise<DbClient> => { ... });
```

### Recent Deployment Challenges (Resolved)

**Issue:** TimescaleDB dashboard deployment blocked by Cloudflare Workers constraints

**Root Causes:**
1. Singleton connection pools incompatible with Workers runtime
2. `postgres.js` library issues with Hyperdrive
3. Nx Cloud connection attempts causing build failures

**Solutions Implemented:**
1. ✅ Switched from `postgres.js` to `pg` client (per OpenNext docs pattern)
2. ✅ Configured per-request connections (`maxUses: 1`)
3. ✅ Removed `nx-cloud` package from dependencies
4. ✅ Added `neverConnectToCloud: true` to nx.json
5. ✅ Configured Hyperdrive local connection via environment variable

**Reference Commits:**
- `108a9c0d` - Remove nx-cloud package to unblock deployment
- `c42a3f96` - Use per-request connections instead of singleton
- `3e3186a5` - Use getPoolAsync for dynamic pages
- `6d92b312` - Simplify database pool, remove legacy workarounds

---

## Recent Accomplishments

### Sprint 2 Completion (November 2025 - January 2026)

**✅ Time-Series Dashboard (CHRONOS-398, CHRONOS-399)**
- Multi-series line chart with Recharts
- Dual-axis support for vastly different scales
- Geography-based color coding
- Responsive mobile design (400px → 500px chart height)
- Legend repositioning (top → bottom) to prevent overflow

**✅ Production Deployment**
- Successfully deployed to Cloudflare Pages
- Hyperdrive database connection working
- OpenNext adapter configuration complete
- No Nx Cloud dependencies

**✅ Code Quality Improvements**
- Resolved zod version conflicts (4.2.1 → 3.25.76)
- Fixed @hookform/resolvers compatibility (5.2.2 → 3.10.0)
- All TypeScript build errors resolved
- Clean production build

**✅ Database Infrastructure**
- TimescaleDB hypertables operational
- PostGIS extensions loaded and verified
- Apache AGE graph infrastructure ready
- pgvector embeddings infrastructure ready

**✅ Documentation & Observability**
- Sentry integration configured (currently disabled)
- Comprehensive schema documentation (database/schema.sql)
- MCP server integrations (Directus, Resend, Cloudflare)

---

## Next Phase: Geospatial Features

### Objectives (Q1 2026)

**Primary Goal:** Implement interactive geospatial visualizations for economic data analysis

**Target Ticket:** CHRONOS-403 (Information Architecture)

### Planned Visualization Types

#### 1. Temporal Choropleth Maps
**Purpose:** Map economic volatility over time

**Data Blend:**
- PostGIS Boundaries: State/County polygons
- FRED/BoC Time-Series: Unemployment rate, housing starts, inflation by MSA

**Key Insight:**
Show 12-month rate of change (momentum) for unemployment rate, visualized on US/Canada map

**Actionable Question:**
> "Where is the job market cooling the fastest, despite the national average holding steady?"

**Technical Requirements:**
- TimescaleDB `time_bucket()` for monthly aggregation
- PostGIS joins to boundary polygons
- deck.gl ChoroplethLayer with time animation

#### 2. Regional Risk Signal Clustering
**Purpose:** Visualize composite financial risk density

**Data Blend:**
- PostGIS Point Data: Company HQs, infrastructure projects
- FRED API Data: Corporate bond spreads, regional PMI

**Key Insight:**
Create heatmap representing composite risk score based on multiple indicators

**Actionable Question:**
> "Where are the critical geographic areas where macroeconomic indicators suggest heightened risk of loan default?"

**Technical Requirements:**
- PostGIS `ST_Buffer()` for radius calculations
- Risk score computation (low consumer confidence + high commercial vacancy)
- deck.gl HeatmapLayer

#### 3. Proximity & Influence Analysis
**Purpose:** Determine economic impact zones

**Data Blend:**
- PostGIS Points: Federal Reserve banks, ports, political centers
- BoC Policy Rate Changes: Time-series
- FRED Industrial Production Index

**Key Insight:**
Determine if economic activity is disproportionately affected within geographic radius (50-mile buffer) of major hubs

**Actionable Question:**
> "Show all economic indicators within the direct economic influence zone (30-mile radius) of the port that just received federal funding, and plot their performance over the last 6 months."

**Technical Requirements:**
- PostGIS `ST_DWithin()`, `ST_Buffer()`
- Spatial joins with economic observations
- deck.gl ScatterplotLayer + ArcLayer

#### 4. Graph-Enhanced Spatial Relationship Mapping (Future)
**Purpose:** Find clusters of investment activity with geographic co-location

**Data Blend:**
- PostGIS Polygons: Economic development zones
- Apache AGE Nodes/Edges: Investment relationships
- FRED Time-Series

**Key Insight:**
Identify geographic areas where multiple unconnected PE firms have made recent investments

**Actionable Question:**
> "Identify all geographic regions in Canada where average investment activity has increased 50% YoY, and which also show recession-resistant job growth."

**Technical Requirements:**
- PostGIS + Apache AGE integration
- Cypher queries with spatial predicates
- deck.gl PolygonLayer + GraphLayer

### Technology Recommendation: deck.gl

**Rationale:**
- **Future-proof**: WebGL-based, high performance for large datasets
- **Comprehensive**: 40+ layer types (Choropleth, Heatmap, Arc, Graph, etc.)
- **Mapbox integration**: Seamless basemap support
- **React-first**: Official @deck.gl/react bindings
- **Open-source**: MIT license, active community

**Concerns to Address:**
1. **Bundle size impact**: deck.gl core ~500KB gzipped
   - *Mitigation*: Dynamic imports, code splitting
2. **WebGL/WebGPU costs**: CloudflarePages egress charges
   - *Mitigation*: Client-side rendering (no server-side WebGL)
3. **Learning curve**: More complex than Leaflet/Maplibre
   - *Mitigation*: Excellent documentation, TypeScript support

**Alternatives Considered:**
- **Leaflet**: Simple but limited (no WebGL, basic styling)
- **Maplibre**: Good middle ground but less comprehensive
- **Mapbox GL JS**: Commercial license concerns

---

## Future Roadmap

### Q1 2026: Geospatial Foundation
- [ ] Design information architecture for multiple visualization types (CHRONOS-403)
- [ ] Implement deck.gl integration with Next.js
- [ ] Create basemap configuration (Mapbox or OpenStreetMap)
- [ ] Build temporal choropleth layer
- [ ] Develop filtering UI for geospatial dashboards
- [ ] Add geospatial route (`/analytics/geospatial`)

### Q2 2026: Graph Visualizations
- [ ] Apache AGE schema design for economic relationships
- [ ] Investment network data ingestion
- [ ] Graph visualization component (deck.gl GraphLayer or D3.js)
- [ ] Cypher query interface for relationship discovery
- [ ] Add graph route (`/analytics/graph`)

### Q3 2026: Vector/Semantic Search
- [ ] pgvector embeddings for all series descriptions
- [ ] Semantic search interface
- [ ] Related series recommendations (cosine similarity)
- [ ] Natural language query parsing

### Q4 2026: Advanced Analytics
- [ ] Continuous aggregates (TimescaleDB)
- [ ] Real-time data streaming (Kafka or Cloudflare Queues)
- [ ] Custom alert system (Sentry integration)
- [ ] API rate limiting and authentication

---

## Key Project Metrics

### Codebase Size
- **Total Files:** 335 (excluding node_modules)
- **Directories:** 197
- **Lines of Code (TypeScript):** ~15,000
- **Lines of Code (Python):** ~8,000

### Database
- **Extensions:** 18 active
- **Schemas:** 5 (metadata, timeseries, analytics, geospatial, ag_catalog)
- **Tables:** 10+ core tables
- **Series Count:** 107 active series (FRED + BoC)
- **Observations:** ~500,000 data points

### Test Coverage
- **Unit Tests:** 12 test files
- **Integration Tests:** 5 test files
- **E2E Tests:** 1 test file
- **Coverage:** 78% (as of November 2025)

---

## Development Workflow

### Local Development
```bash
# Start all services
docker-compose up -d

# Install dependencies
pnpm install

# Start Next.js development server
pnpm nx dev web

# Run Python ingestion CLI
python -m chronos.cli.timeseries_cli --help
```

### Database Migrations
```bash
# Create new migration
alembic revision --autogenerate -m "description"

# Apply migrations
alembic upgrade head

# Rollback one migration
alembic downgrade -1
```

### Testing
```bash
# Run all tests
pnpm nx test web

# Python tests
pytest tests/
pytest --cov=chronos tests/  # With coverage
```

### Building for Production
```bash
# Build Next.js app
pnpm nx build web

# Output: apps/web/.open-next/
```

---

## Key Contacts & Resources

### Documentation
- **Project Docs:** `/docs/`
- **Architecture Decisions:** `/docs/10-DEVELOPMENT/01-ADRS/`
- **Database Reference:** `/database/schema.sql`
- **API Guide:** `/docs/_archive/DATABASE_QUERIES_GUIDE.md`

### External Resources
- **TimescaleDB Docs:** https://docs.timescale.com
- **PostGIS Manual:** https://postgis.net/documentation
- **Apache AGE:** https://age.apache.org
- **deck.gl:** https://deck.gl
- **Next.js App Router:** https://nextjs.org/docs/app

### Repository
- **Git Host:** GitHub (private repository)
- **Main Branch:** `main`
- **CI/CD:** Cloudflare Pages automatic deployment

---

## Conclusion

Project Chronos represents a sophisticated multi-modal economic intelligence platform with a solid foundation in time-series analytics and an extensible architecture ready for geospatial and graph-based visualizations. The successful deployment of the TimescaleDB dashboard to Cloudflare Pages validates the technical approach and positions the project for rapid expansion in Q1-Q2 2026.

The next phase focuses on leveraging the existing PostGIS infrastructure to deliver interactive geospatial visualizations using deck.gl, providing consulting clients and SaaS users with unprecedented insights into regional economic dynamics and investment opportunities.

**Current Status:** ✅ Production-ready time-series dashboard
**Next Milestone:** 🎯 Geospatial choropleth maps (Q1 2026)
**Vision:** 🚀 Multi-modal intelligence platform integrating time, space, and relationships

---

**Document Maintainer:** Geoff Bevans
**Last Review:** January 11, 2026
**Next Review:** March 1, 2026
