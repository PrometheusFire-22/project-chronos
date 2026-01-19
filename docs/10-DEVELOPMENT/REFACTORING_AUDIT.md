# Project Chronos - Refactoring Audit Report

**Date:** 2025-01-19
**Status:** In Progress
**Goal:** Complete choropleth map feature + comprehensive project cleanup

---

## Executive Summary

This document captures the findings from a comprehensive codebase audit. The project has accumulated significant technical debt from troubleshooting artifacts, with duplicated functionality and scattered configuration.

---

## 1. Immediate Bug: Great Lakes Not Rendering

### Root Cause
The API endpoint at `apps/api/src/routes/geo.ts:189-202` looks for:
```javascript
const filePath = path.join(process.cwd(), 'data', 'great_lakes.geojson');
```

But the file actually exists at:
```
apps/web/public/data/great_lakes.geojson
```

### Fix Applied
**Solution:** Created `apps/api/data/` directory and copied the GeoJSON file:
```bash
mkdir -p apps/api/data
cp apps/web/public/data/great_lakes.geojson apps/api/data/
```

**Status:** Fixed - file now at `apps/api/data/great_lakes.geojson` (172KB, 7288 lines)

---

## 2. Project Architecture Overview

### Apps (Nx Monorepo)
| App | Purpose | Tech Stack |
|-----|---------|------------|
| `apps/api` | REST API | Hono, PostgreSQL |
| `apps/web` | Marketing site + Analytics | Next.js, Tailwind |
| `apps/worker` | Edge functions | Cloudflare Workers |

### Packages
| Package | Purpose |
|---------|---------|
| `@chronos/database` | Drizzle ORM schemas |
| `@chronos/types` | Shared TypeScript types |
| `@chronos/ui` | React component library |
| `@chronos/utils` | Shared utilities |
| `@chronos/config` | Shared configuration |

### Python CLI (`src/chronos/`)
| Module | Purpose |
|--------|---------|
| `cli/` | Jira, Confluence, Google integrations |
| `ingestion/` | FRED, StatsCan, Valet, BOE data sources |
| `database/` | SQLAlchemy connections |
| `integrations/google/` | Google Workspace APIs |

---

## 3. Identified Issues

### 3.1 Duplicated Functionality

#### Jira Integration (7 implementations!)
1. `/src/chronos/cli/jira_ingest.py`
2. `/src/chronos/cli/jira_update.py`
3. `/scripts/ops/jira_close_ticket.py`
4. `/scripts/ops/jira_list_sprints.py`
5. `/src/_deprecated/jira_cli.py`
6. `/scripts/_archive/historical/cleanup_jira_backlog.py`
7. `/scripts/_archive/historical/organize_jira_retroactive.py`

#### Confluence Integration (5 implementations)
1. `/src/chronos/cli/confluence_cli.py`
2. `/scripts/ops/bulk_sync_confluence.py`
3. `/scripts/ops/organize_confluence_hierarchy.py`
4. `/scripts/ops/cleanup_confluence_duplicates.py`
5. `/scripts/ops/sync_docs.py`

#### Database Access (2 ORMs)
- **Python:** SQLAlchemy in `src/chronos/database/`
- **TypeScript:** Drizzle ORM in `packages/database/`

### 3.2 Troubleshooting Artifacts (Ghost Files)

#### scripts/ops/ - Geospatial debugging scripts
- `analyze_canadian_geo.py`
- `check_canadian_series.py`
- `check_choropleth_view.py`
- `fetch_canadian_vectors.py`
- `fetch_provincial_statscan.py`
- `fix_lakes_geometry.py`
- `ingest_canadian_territories.py`
- `ingest_statscan_provincial.py`
- `inspect_shapefile.py`
- `investigate_lakes_geometry.py`
- `replace_us_states.py`
- `retry_failed_hpi.py`
- `verify_cb_shapefile.py`

#### tmp/ - Should be deleted
- `describe_economic_observations.py`
- `describe_series_metadata.py`
- `list_all_tables.py`
- `list_geospatial_tables.py`
- `Jira.csv`
- `Jira_database_backups_&_geospatial.csv`
- `jira_description.txt`

#### Root level logs - Should be gitignored
- `api-direct.log`
- `api-final.log`
- `api-running.log`
- `build_output.log`
- `test-server.log`
- `test-server-db.log`
- `test-server-retry.log`

#### apps/api/ logs - Should be gitignored
- `api-3005.log`
- `api-debug.log`
- `api.log`
- `api-minimal.log`
- `api-step2.log`
- `api-step3.log`
- `api-stripped.log`

### 3.3 Large Files That Shouldn't Be in Git
- `ca_census_divisions.sql` (~500MB)
- `ca_provinces.sql` (~500MB)
- `us_cbsa.sql`, `us_counties.sql`, `us_csa.sql`, `us_metdiv.sql`
- `/backups/sprint2_complete_20251119.dump` (~531MB)
- `/backups/sprint2_final_20251119.dump` (~531MB)

### 3.4 Scattered Configuration
Multiple `.env` files:
- `.env.api.local`, `.env.api.production`
- `.env.aws`, `.env.local`, `.env.mcp`
- `.env.production`, `.env.production.vercel`, `.env.vercel`
- `deployment/lightsail/.env`
- `apps/api/.env`, `apps/web/.env.local`

---

## 4. Cleanup Plan

### Phase 1: Fix Great Lakes Feature (Immediate) ✅ COMPLETED
- [x] Fix file path for Great Lakes GeoJSON - **Fixed 2025-01-19**
- [x] Test choropleth map rendering - Deployed to production
- [x] Verify deployment works - Pushed to main

### Phase 2: Remove Ghost Files ✅ COMPLETED
- [x] Delete `tmp/` directory contents - **Deleted 2025-01-19**
- [x] Remove root-level log files - **Removed from git tracking**
- [x] Remove `apps/api/*.log` files - **Removed from git tracking**
- [ ] Archive or delete obsolete scripts in `scripts/ops/` → **CHRONOS-436**
- [ ] Move `scripts/_archive/` to proper archive

### Phase 3: Remove Large Files from Git ✅ VERIFIED
- [x] Large SQL dumps already gitignored (not in git history)
- [ ] Delete local SQL dumps (~1.5GB) → **CHRONOS-437**
- [ ] Document data import process

### Phase 4: Consolidate Duplications → **Jira Sprint Created**
- [ ] Create unified Jira client → **CHRONOS-434**
- [ ] Create unified Confluence client → **CHRONOS-435**
- [ ] Document dual ORM strategy → **CHRONOS-439**

### Phase 5: Organize Configuration
- [ ] Consolidate environment files → **CHRONOS-438**

---

## 5. Jira Sprint: Technical Debt Elimination

**Epic:** [CHRONOS-433](https://automatonicai.atlassian.net/browse/CHRONOS-433) - Technical Debt Elimination Sprint

| Ticket | Summary | Status |
|--------|---------|--------|
| CHRONOS-434 | Consolidate Jira integrations (7 → 1) | To Do |
| CHRONOS-435 | Consolidate Confluence integrations (5 → 1) | To Do |
| CHRONOS-436 | Archive/delete geospatial debugging scripts | To Do |
| CHRONOS-437 | Clean up large SQL data dumps | To Do |
| CHRONOS-438 | Consolidate environment configuration (11+ → 3) | To Do |
| CHRONOS-439 | Document dual ORM architecture strategy | To Do |

---

## 6. Git History Context (Recent Commits)

The recent git history shows extensive work on the choropleth/Great Lakes feature:

```
874e4faf feat(api): add Great Lakes endpoint
e910bd03 feat(map): add Great Lakes water bodies
b52166d3 fix(map): increase default zoom to 4.5
c38c389f fix(map): remove unsupported smoothFactor prop
b1bcae3e feat(map): make outlier colors much darker
d17418fe chore: add Canadian data ingestion scripts
aa8d9364 fix(map): disable Leaflet smoothFactor
8fb7e4f6 fix(api): add ST_MakeValid for Great Lakes geometry
cb6b2397 feat(map): add metric-specific color palettes
86cde604 feat(map): implement quantile-based scaling
```

This shows many iterations attempting to fix geometry rendering issues.

---

## 7. Next Steps

1. ~~**Fix the Great Lakes bug**~~ ✅ DONE
2. ~~**Test the fix**~~ ✅ Deployed
3. ~~**Create Jira sprint**~~ ✅ CHRONOS-433 created
4. **Execute Jira sprint** - Work through tickets systematically
5. **Architecture audit** - Review orchestration and deployment

---

## Appendix: File Counts by Type

| Location | Count | Notes |
|----------|-------|-------|
| scripts/ops/ | 35+ | Many are debug scripts |
| scripts/_archive/ | 20+ | Historical, should archive |
| tmp/ | 7 | Delete all |
| docs/ | 150+ | Well organized |
| Root logs | 7 | Delete/gitignore |

---

*Last Updated: 2025-01-19*
