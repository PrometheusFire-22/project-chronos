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

### 2.1 Dual ORM Strategy (BOUNDARIES EXIST)

**Good news:** Clear boundaries already exist in the codebase. We just need to document and enforce them.

| Ecosystem | ORM | Migrations | Use Case | Config |
|-----------|-----|------------|----------|--------|
| **Python** | SQLAlchemy | Alembic (5 migrations) | Data warehouse, economic data | `alembic.ini` |
| **TypeScript** | Drizzle | Drizzle-kit (2 migrations) | CMS content, app tables | `packages/database/drizzle.config.ts` |

**Drizzle Table Filter (already configured):**
```typescript
// packages/database/drizzle.config.ts
tablesFilter: ['cms_*', 'app_*']
```

**Drizzle-Managed Tables (cms.ts):**
- `cms_blog_posts` - Blog content
- `cms_docs_pages` - Documentation
- `cms_homepage_hero` - Marketing content
- `cms_features` - Product features
- `cms_announcements` - Site notifications
- `cms_legal_pages` - Terms/Privacy
- `cms_waitlist_submissions` - Lead capture

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
| **Schema Ownership** | ✅ Actually exists in code, just undocumented |
| **Performance** | Likely contention from shared DB |
| **Backups** | pgbackrest to S3 (cost-efficient) |
| **Migration Conflicts** | ✅ Already separated - Drizzle filters to `cms_*`/`app_*` only |

### 2.4 ORM Strategy: FINALIZED

**The boundary already exists. We just document and enforce it.**

| ORM | Owns | Hands Off |
|-----|------|-----------|
| **Alembic** | `timeseries.*`, `geospatial.*`, `metadata.*`, `analytics.*` | Everything else |
| **Drizzle** | `public.cms_*`, `public.app_*` (via table filter) | Everything else |
| **Directus** | `public.directus_*` (auto-managed) | N/A |
| **TwentyCRM** | `core.*`, `workspace_*` (TypeORM auto-managed) | N/A |

**Rules going forward:**
1. **Data warehouse work** → Python CLI with Alembic migrations
2. **CMS/App tables** → TypeScript with Drizzle migrations
3. **Never touch** → `directus_*`, `core.*`, `workspace_*` (auto-managed by apps)
4. **New tables** → Use `cms_` or `app_` prefix if Drizzle, dedicated schema if Alembic

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
| **Python in Nx** | Not integrated. Python predates Nx. |
| **Dependency Mgmt** | pnpm for JS. Standard venv for Python (not Poetry). |
| **Build Pipeline** | Nx coordinates TS builds. Python is manual. |
| **Testing** | No unified strategy. Some Python tests exist but may be stale. |

**Python Setup (Clarified):**
- `pyproject.toml` uses **setuptools** (not Poetry)
- No `poetry.lock` file exists
- Single `.venv/` at project root is correct
- Install: `python -m venv .venv && source .venv/bin/activate && pip install -e ".[dev]"`

**History:**
- Started as Python-only (Plotly Dash planned)
- Moved to Next.js for scalability/extensibility
- Added Nx for monorepo management (TS-focused)
- Python CLI now orphaned in structure (but functional)

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

## 7. Decisions & Status

### 7.1 ORM Strategy: ✅ RESOLVED

**Decision:** Option C - Keep both ORMs with clear boundaries (boundaries already exist in code).

See Section 2.4 for the finalized strategy. The Drizzle config already filters to `cms_*`/`app_*` tables.

### 7.2 Public Schema Cleanup

Tables in `public` that need attention:

| Table | Owner | Status |
|-------|-------|--------|
| `directus_*` | Directus | ✅ Leave (auto-managed) |
| `cms_*` | Drizzle | ✅ Keep in public (matches Drizzle config) |
| `users`, `users_sessions` | Drizzle | ⚠️ Review: may conflict with Directus auth |
| `alembic_version` | Alembic | ✅ Keep (migration tracking) |
| `backup_test` | Unknown | 🗑️ **DELETE** |
| `spatial_ref_sys` | PostGIS | ✅ Leave (system table) |

### 7.3 Python Dependency: ✅ CLARIFIED

**Finding:** Not using Poetry. Using standard setuptools + venv.

**Current setup is correct:**
- `.venv/` at project root (standard Python virtual environment)
- `pyproject.toml` with setuptools (modern Python packaging)
- No Poetry configuration exists

**Usage:**
```bash
# Activate existing venv
source .venv/bin/activate

# Or create new if needed
python -m venv .venv
source .venv/bin/activate
pip install -e ".[dev]"
```

### 7.4 Remaining Questions

- [ ] Cost breakdown by service (Lightsail, Vercel, Cloudflare)
- [ ] Security group configuration audit
- [ ] Backup verification (pgbackrest to S3)
- [ ] CI/CD pipeline (Vercel auto-deploy? Manual for Lightsail?)
- [ ] Cloudflare R2 integration (currently not configured)

---

## 8. Next Actions

| Ticket | Task | Status |
|--------|------|--------|
| **CHRONOS-440** | Map infrastructure topology | ✅ Done (Section 4) |
| **CHRONOS-441** | Audit database schema | ✅ Done (Section 2.2) |
| **CHRONOS-439** | Document ORM strategy | ✅ Done (Section 2.4) |
| **CHRONOS-442** | Research choropleth alternatives | 🔜 Deferred |

**Immediate cleanup tasks:**
1. Delete `backup_test` table from database
2. Review `users`/`users_sessions` tables (potential auth conflict)
3. Create ADR (Architecture Decision Record) formalizing ORM ownership

---

*Last Updated: 2025-01-19 (Session 2 - Architecture Discovery Complete)*
