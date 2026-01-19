# Project Chronos - Architecture Discovery

**Date:** 2025-01-19
**Status:** Discovery In Progress
**Related Jira:** CHRONOS-440, CHRONOS-441, CHRONOS-439

---

## 1. Current Understanding

### 1.1 High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        CLOUDFLARE                                │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐         │
│  │   DNS/CDN   │    │     R2      │    │   Workers   │         │
│  │             │    │    (DAM)    │    │             │         │
│  └─────────────┘    └─────────────┘    └─────────────┘         │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      AWS LIGHTSAIL                               │
│                                                                  │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐         │
│  │  PostgreSQL │    │   Directus  │    │   Node.js   │         │
│  │  + PostGIS  │    │     CMS     │    │    API      │         │
│  └─────────────┘    └─────────────┘    └─────────────┘         │
│         │                  │                  │                  │
│         └──────────────────┴──────────────────┘                  │
│                    Shared Database                               │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                         VERCEL                                   │
│  ┌─────────────────────────────────────────────────┐           │
│  │              Next.js Web App                     │           │
│  │         (automatonicai.com)                      │           │
│  └─────────────────────────────────────────────────┘           │
└─────────────────────────────────────────────────────────────────┘
```

### 1.2 Technology Stack

| Layer | Technology | Notes |
|-------|------------|-------|
| **Frontend** | Next.js, React, Tailwind | Deployed to Vercel |
| **API** | Hono (TypeScript) | On Lightsail? |
| **CMS** | Directus | TypeScript ecosystem |
| **CRM** | TwentyCRM | TypeScript ecosystem |
| **Database** | PostgreSQL + PostGIS | AWS Lightsail |
| **Storage** | Cloudflare R2 | DAM for Directus |
| **Edge** | Cloudflare Workers | apps/worker |

---

## 2. Database Architecture

### 2.1 Dual ORM Strategy

| Ecosystem | ORM | Migrations | Use Case |
|-----------|-----|------------|----------|
| **Python** | SQLAlchemy | Alembic | Data pipelines, economic time series |
| **TypeScript** | Drizzle | Drizzle-kit | Frontend, API, content |

### 2.2 Schema Inventory (Actual)

| Schema | Tables | Size | Owner | Purpose |
|--------|--------|------|-------|---------|
| `public` | 46 | ~10MB | **MIXED** | Directus tables + cms_* + alembic + users |
| `core` | 53 | ~2MB | TwentyCRM | CRM metadata (TypeORM managed) |
| `workspace_*` | 29 | ? | TwentyCRM | CRM data per workspace |
| `geospatial` | 14 | **~1.1GB** | Python | PostGIS boundaries (US/CA) |
| `analytics` | 6 views | - | Python | Materialized views for API |
| `metadata` | 4 | ~1.4MB | Python | Series metadata, ingestion logs |
| `timeseries` | 1 | ~48KB | Python | economic_observations (hypertable) |
| `tiger` | 34 | ? | PostGIS | US Census TIGER data |

**Key Findings:**
- Directus tables are in `public` (not separate schema)
- TwentyCRM uses `core` + dynamic `workspace_*` schemas
- Geospatial data is **1.1GB** - largest by far
- `public` schema is a dumping ground (needs cleanup)

### 2.3 Current State (Honest Assessment)

| Issue | Reality |
|-------|---------|
| **Schema Ownership** | None. No clear boundaries or rules. |
| **Performance** | Likely contention from shared DB. |
| **Backups** | pgbackrest to S3 (cost-efficient). No schema-level strategy. |
| **Migration Conflicts** | Alembic and Drizzle both exist, unclear when to use which. |

### 2.4 ORM Decision Context

**History:**
- Started with Python/Alembic for data science exploration
- Moved to Next.js/TypeScript for frontend scalability
- Now have both ecosystems with no clear boundary

**Goal:** Simplify. One clear strategy going forward.

---

## 3. Monorepo Structure (Nx)

### 3.1 Current Layout

```
project-chronos/
├── apps/
│   ├── api/          # Hono TypeScript API
│   ├── web/          # Next.js frontend
│   └── worker/       # Cloudflare Workers
├── packages/
│   ├── database/     # Drizzle schemas/migrations
│   ├── types/        # Shared TypeScript types
│   ├── ui/           # React component library
│   ├── utils/        # Shared utilities
│   └── config/       # Shared configuration
└── src/chronos/      # Python CLI (data pipelines)
    ├── cli/          # CLI commands
    ├── database/     # SQLAlchemy models
    ├── ingestion/    # Data source connectors
    └── integrations/ # External service clients
```

### 3.2 Current State (Honest Assessment)

| Area | Reality |
|------|---------|
| **Python in Nx** | Unknown. Python existed before Nx was added. No integration. |
| **Dependency Mgmt** | pnpm for JS. Poetry for Python BUT also .venv dirs (conflicting). |
| **Build Pipeline** | Nx only coordinates TS builds. Python is separate/manual. |
| **Testing** | No unified strategy. Dated Python tests cause more problems than they solve. |

**History:**
- Started as Python-only (Plotly Dash planned)
- Moved to Next.js for scalability/extensibility
- Added Nx for monorepo management (TS-focused)
- Python CLI now orphaned in structure

---

## 4. Infrastructure (MAPPED)

### 4.1 AWS Lightsail - Single VM

**IP:** `16.52.210.100`
**SSH:** `ssh -i <key> ubuntu@16.52.210.100`
**Path:** `~/chronos-db`

| Container | Port | Purpose | Public URL |
|-----------|------|---------|------------|
| `chronos-db` | 5432 | PostgreSQL 16.4 + TimescaleDB + PostGIS + pgvector + AGE | Internal only |
| `chronos-directus` | 8055 | Directus CMS | https://admin.automatonicai.com |
| `twenty` | 3020 | TwentyCRM | https://crm.automatonicai.com |

**Note:** All three services run on ONE Lightsail VM via Docker Compose.

### 4.2 Cloudflare Services

| Service | Purpose | Configuration |
|---------|---------|---------------|
| DNS | Domain routing | automatonicai.com, admin.*, crm.* |
| R2 | Object storage (DAM) | **NOT CONFIGURED** - Directus uses local storage |
| Workers | Edge functions | apps/worker (deployment status unknown) |

### 4.3 Vercel

| Project | Purpose | Domain |
|---------|---------|--------|
| Web | Next.js app | automatonicai.com |

### 4.4 Simplified Architecture

```
                    CLOUDFLARE (DNS)
                          │
          ┌───────────────┼───────────────┐
          │               │               │
          ▼               ▼               ▼
    automatonicai    admin.automaton  crm.automaton
      .com             icai.com        icai.com
          │               │               │
          ▼               │               │
       VERCEL             │               │
    (Next.js app)         │               │
          │               └───────┬───────┘
          │                       │
          │                       ▼
          │            AWS LIGHTSAIL (single VM)
          │            ┌─────────────────────┐
          │            │  Docker Compose     │
          └───────────►│  ┌───────────────┐  │
           API calls   │  │ PostgreSQL    │  │
                       │  │ + PostGIS     │  │
                       │  │ + TimescaleDB │  │
                       │  └───────────────┘  │
                       │  ┌───────────────┐  │
                       │  │   Directus    │  │
                       │  └───────────────┘  │
                       │  ┌───────────────┐  │
                       │  │  TwentyCRM    │  │
                       │  └───────────────┘  │
                       └─────────────────────┘
```

---

## 5. Data Flow

### 5.1 Economic Data Ingestion (Python)

```
External APIs (FRED, StatsCan, etc.)
         │
         ▼
    Python CLI (chronos)
         │
         ▼
    SQLAlchemy/Alembic
         │
         ▼
    PostgreSQL (analytics.*, geospatial.*)
```

### 5.2 Content Management (TypeScript)

```
    Directus CMS
         │
         ├─► PostgreSQL (directus_*)
         │
         └─► Cloudflare R2 (media assets)
```

### 5.3 API Requests (TypeScript)

```
    Next.js (Vercel)
         │
         ▼
    API Proxy / Hono
         │
         ▼
    PostgreSQL (via Drizzle)
```

---

## 6. Tooling & Integrations

### 6.1 Development Tools

| Tool | Purpose | Status |
|------|---------|--------|
| Nx | Monorepo management | Active |
| Sentry | Error tracking | Free tier exhausted |
| Atlassian CLI | Jira operations | Active |
| Atlassian MCP | AI-assisted Jira | Active |

### 6.2 Abandoned Tooling

| Tool | Reason Abandoned |
|------|------------------|
| Python Jira scripts | Replaced by Atlassian CLI/MCP |
| Python Confluence scripts | Sync never worked properly |

---

## 7. Decisions Needed

### 7.1 ORM Simplification (PRIORITY)

**Current State:** Two ORMs (Alembic + Drizzle) with no clear boundaries.

**Options:**

| Option | Pros | Cons |
|--------|------|------|
| **A: All Drizzle** | Single toolchain, TS-native | Need to migrate Python ingestion to TS |
| **B: All Alembic** | Keep Python pipelines | Frontend devs need Python knowledge |
| **C: Clear Boundaries** | Keep both, document ownership | Complexity remains |

**Recommended: Option C with strict rules:**
- Alembic owns: `timeseries`, `geospatial`, `metadata`, `analytics`
- Drizzle owns: `public.cms_*`, `public.users*`, any new app tables
- Hands off: `core`, `workspace_*` (TwentyCRM), `directus_*` (Directus)

### 7.2 Public Schema Cleanup

Tables in `public` that need decisions:

| Table | Owner | Action |
|-------|-------|--------|
| `directus_*` | Directus | Leave (auto-managed) |
| `cms_*` | Drizzle? | Move to dedicated schema or keep |
| `users`, `users_sessions` | Drizzle | Keep or merge with Directus auth |
| `alembic_version` | Alembic | Keep (migration tracking) |
| `backup_test` | Unknown | **DELETE** |
| `spatial_ref_sys` | PostGIS | Leave (system table) |

### 7.3 Python Dependency Cleanup

**Current:** Both Poetry and .venv exist, causing confusion.

**Recommendation:**
1. Delete all `.venv` directories
2. Use Poetry exclusively (`poetry install`, `poetry run`)
3. Add `.venv/` to `.gitignore` if not already

### 7.4 Remaining Questions

- [ ] Cost breakdown by service (Lightsail, Vercel, Cloudflare)
- [ ] Security group configuration audit
- [ ] Backup verification (pgbackrest to S3)
- [ ] CI/CD pipeline (Vercel auto-deploy? Manual for Lightsail?)

---

## 8. Next Actions

1. **CHRONOS-440**: Map infrastructure topology
2. **CHRONOS-441**: Audit database schema
3. **CHRONOS-439**: Document ORM strategy
4. **CHRONOS-442**: Research choropleth alternatives (deferred)

---

*Last Updated: 2025-01-19*
