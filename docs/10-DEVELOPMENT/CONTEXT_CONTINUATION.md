# Project Chronos - Context Continuation

**Created:** 2025-01-19
**Updated:** 2025-01-19 (Technical Debt Sprint Complete)
**Purpose:** Preserve refactoring context across LLM sessions

---

## Quick Status

| Area | Status | Notes |
|------|--------|-------|
| **Great Lakes Bug** | ✅ Fixed | GeoJSON moved to `apps/api/data/` |
| **Architecture Discovery** | ✅ Complete | See `ARCHITECTURE_DISCOVERY.md` |
| **ORM Strategy** | ✅ Decided | Dual ORM: Alembic (Python) + Drizzle (TS) |
| **Tech Debt Sprint** | ✅ **5/6 Done** | 42 files deleted, 1.4GB freed |
| **Jira/Confluence** | ✅ Removed | Superseded by Atlassian CLI + MCP |

---

## Architecture Summary

```
Cloudflare (DNS) → Vercel (Next.js) + AWS Lightsail (DB + Directus + CRM)
```

**ORM Boundaries:**
- `Alembic` → `timeseries.*`, `geospatial.*`, `metadata.*`, `analytics.*`
- `Drizzle` → `public.cms_*`, `public.app_*`
- `Directus` → `public.directus_*` (auto-managed)
- `TwentyCRM` → `core.*`, `workspace_*` (auto-managed)

---

## Tech Debt Sprint - COMPLETED

| Ticket | Summary | Status |
|--------|---------|--------|
| CHRONOS-434 | Jira integrations | ✅ **DELETED** (superseded by CLI/MCP) |
| CHRONOS-435 | Confluence integrations | ✅ **DELETED** (superseded by MCP) |
| CHRONOS-436 | Geospatial debug scripts | ✅ **DELETED** (13 files) |
| CHRONOS-437 | SQL dumps | ✅ **DELETED** (1.4GB) |
| CHRONOS-438 | Env consolidation | 🔜 Deferred |
| CHRONOS-439 | ORM documentation | ✅ **DONE** |

**Cleanup Summary:**
- 10 Jira scripts deleted
- 7 Confluence scripts deleted
- 13 geospatial debug scripts deleted
- 5 misc ops scripts deleted
- 5 SQL dumps deleted (~1.4GB)
- 2 empty directories removed

---

## Remaining Python CLI

After cleanup, `src/chronos/cli/` contains:
- `google_cli.py` - Google Workspace integration
- `generate_embeddings.py` - Vector embeddings

Jira/Confluence operations now use:
- **Atlassian CLI** (`atlas` command)
- **Atlassian MCP** (AI-assisted via Claude)

---

## Future Work (Backlog)

| Priority | Task |
|----------|------|
| Low | Consolidate 11+ env files → 3 (CHRONOS-438) |
| Low | Integrate Python into Nx build pipeline |
| Low | Increase test coverage (26% → 60%+) |

---

## Key Files

| File | Purpose |
|------|---------|
| `ARCHITECTURE_DISCOVERY.md` | Infrastructure + ORM mapping |
| `REFACTORING_AUDIT.md` | Tech debt inventory (updated) |
| `src/chronos/ingestion/` | Data pipeline code (FRED, StatsCan) |
| `packages/database/` | Drizzle schemas (TypeScript) |

---

## Commands

```bash
# Python
source .venv/bin/activate
chronos ingest --help

# TypeScript (Nx)
pnpm nx run api:serve
pnpm nx run web:dev

# Atlassian (replaces Python scripts)
atlas jira issue list
atlas confluence page get
```

---

*Read `ARCHITECTURE_DISCOVERY.md` for full infrastructure context.*
