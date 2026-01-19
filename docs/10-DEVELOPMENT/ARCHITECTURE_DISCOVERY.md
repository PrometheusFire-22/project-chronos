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

### 2.2 Schema Namespaces

| Schema | Owner | Purpose |
|--------|-------|---------|
| `public` | Mixed | Default, needs audit |
| `analytics` | Python | Views for economic data |
| `geospatial` | Python | PostGIS geographic data |
| `directus_*` | Directus | CMS tables (auto-managed) |
| `twenty_*` | TwentyCRM | CRM tables (auto-managed) |

### 2.3 Questions to Resolve

1. **Migration Conflicts**: How to prevent Alembic and Drizzle from conflicting?
2. **Schema Boundaries**: Clear ownership rules for each namespace?
3. **Performance**: Is shared DB causing contention?
4. **Backups**: What's the backup strategy for each schema?

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

### 3.2 Questions to Resolve

1. **Python Integration**: How does Python CLI fit into Nx monorepo?
2. **Dependency Management**: pnpm for JS, pip/poetry for Python?
3. **Build Pipeline**: How do Nx tasks coordinate Python/TS builds?
4. **Testing**: Unified test strategy across ecosystems?

---

## 4. Infrastructure (To Map)

### 4.1 AWS Lightsail Inventory

| Instance | Purpose | Specs | Status |
|----------|---------|-------|--------|
| TBD | PostgreSQL + PostGIS | TBD | Unknown |
| TBD | Directus CMS | TBD | Unknown |
| TBD | Node.js API? | TBD | Unknown |

### 4.2 Cloudflare Services

| Service | Purpose | Configuration |
|---------|---------|---------------|
| DNS | Domain routing | automatonicai.com |
| R2 | Object storage (DAM) | Directus media |
| Workers | Edge functions | apps/worker |

### 4.3 Vercel

| Project | Purpose | Domain |
|---------|---------|--------|
| Web | Next.js app | automatonicai.com |

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

## 7. Open Questions

### 7.1 Infrastructure
- [ ] Exact Lightsail instance inventory
- [ ] Network topology between components
- [ ] Cost breakdown by service
- [ ] Security group configuration

### 7.2 Database
- [ ] Complete schema inventory
- [ ] Unused table identification
- [ ] Migration workflow documentation
- [ ] Performance metrics baseline

### 7.3 Deployment
- [ ] CI/CD pipeline documentation
- [ ] Environment promotion strategy
- [ ] Rollback procedures

---

## 8. Next Actions

1. **CHRONOS-440**: Map infrastructure topology
2. **CHRONOS-441**: Audit database schema
3. **CHRONOS-439**: Document ORM strategy
4. **CHRONOS-442**: Research choropleth alternatives (deferred)

---

*Last Updated: 2025-01-19*
