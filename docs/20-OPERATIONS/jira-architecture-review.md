# Jira Architecture Review: Node.js → FastAPI Migration
**Date**: 2026-01-29
**Tickets Reviewed**: CHRONOS-461, 465, 468, 471, 472, 482, 483, 484, 485

## Overview

Migration from Node.js backend to FastAPI with comprehensive cleanup of legacy infrastructure and code artifacts.

## Status Summary

### ✅ Completed
- **CHRONOS-482**: Configure AWS Lightsail for FastAPI deployment (Nginx, Uvicorn, SSL)
  - Status: Done
  - Completed: 2026-01-28

### 🔄 In Progress
- **CHRONOS-468**: Update Docker Orchestration for FastAPI App
  - Update Dockerfile.production to use apps/chronos-api
  - Status: In Progress since 2026-01-26

### 📋 To Do - Infrastructure & DevOps

**Directory Cleanup (DUPLICATE TICKETS):**
- **CHRONOS-461**: AWS Lightsail: Cleanup and Consolidate Directories
- **CHRONOS-465**: Cleanup AWS Lightsail Directories
**→ ACTION**: These are duplicates with the same goal. Consider closing one and keeping the more detailed ticket (CHRONOS-461).

**Routing & Infrastructure:**
- **CHRONOS-483**: Update Cloudflare Workers routing for Python API
  - Route /api/* from Node.js (port 3001) → FastAPI (port 8000)
  - Update CORS headers
  - Test all endpoints

- **CHRONOS-484**: Consolidate environment variables across services
  - Multiple .env files causing confusion
  - Need single source of truth for shared vars
  - Create .env.example files

- **CHRONOS-485**: Set up monitoring and logging for FastAPI
  - Structured logging with structlog
  - Sentry error tracking
  - Performance metrics (p50, p95, p99)
  - Health check dashboard

### 📋 To Do - API & Frontend (Epic: CHRONOS-469)

- **CHRONOS-471**: Update FastAPI endpoints to return unit metadata
  - File: apps/chronos-api/src/chronos/api/routers/economic.py
  - Add unit_type and display_units fields
  - Branch: feat/api-unit-metadata

- **CHRONOS-472**: Update frontend to display unit metadata
  - Files: EconomicChart.tsx, ActiveIndicatorCard.tsx
  - Show units in tooltips, legends, axes
  - Branch: feat/frontend-unit-display

## Architecture Insights

### Current State
```
Frontend (Next.js)
    ↓
Cloudflare Workers → Node.js API (port 3001) ← LEGACY
                  → FastAPI (port 8000) ← NEW
    ↓
PostgreSQL/TimescaleDB (AWS Lightsail)
```

### Target State
```
Frontend (Next.js)
    ↓
Cloudflare Workers → FastAPI (port 8000)
    ↓
PostgreSQL/TimescaleDB (AWS Lightsail)
```

### FastAPI Structure
```
apps/chronos-api/
├── src/chronos/api/
│   ├── routers/
│   │   ├── economic.py ← Needs unit metadata update
│   │   └── geo.py
│   └── main.py
└── Dockerfile.production ← Needs path update
```

### Environment Files (Current Mess)
```
.env (root) → symlink to .env.aws
.env.local (root)
.env.aws (root)
.env.mcp (root)
apps/chronos-api/.env (missing?)
apps/web/.env (missing?)
```

## Recommendations

### 1. Close Duplicate Ticket
**ACTION**: Close CHRONOS-465 as duplicate of CHRONOS-461.

CHRONOS-461 has more detailed acceptance criteria and rollback procedures.

### 2. Verify Directory Cleanup Already Done
The tickets reference AWS Lightsail directories that should exist at `~/chronos-db*` on the Lightsail instance. These directories don't exist locally (which is correct).

**ACTION**: SSH to AWS Lightsail and verify current directory structure:
```bash
ssh lightsail
ls -la ~ | grep chronos-db
docker ps
```

If only `~/chronos-db/` exists with running services, mark CHRONOS-461 as Done.

### 3. Check if Apps Structure Already Exists
The codebase should have `apps/chronos-api/` directory for FastAPI.

**Current Status**: Directory not found with glob pattern `apps/*/` in project root.

**ACTION**: Verify actual project structure:
```bash
find . -type d -name "apps" -o -name "chronos-api" | head -20
```

### 4. Environment Variables - Likely Partially Done
Current `.env` is a symlink to `.env.aws`, suggesting some consolidation already happened.

**ACTION**: Audit current state before CHRONOS-484:
```bash
find . -name ".env*" -type f -o -name ".env*" -type l
```

### 5. Priority Order for Remaining Work

**Phase 1: Infrastructure Completion**
1. CHRONOS-468 - Docker orchestration (In Progress)
2. CHRONOS-461/465 - Directory cleanup (verify first)
3. CHRONOS-484 - Environment consolidation (audit current state)

**Phase 2: API Migration**
4. CHRONOS-471 - FastAPI unit metadata
5. CHRONOS-472 - Frontend unit display
6. CHRONOS-483 - Cloudflare routing switch

**Phase 3: Observability**
7. CHRONOS-485 - Monitoring & logging

## Key Files & Locations

### Backend (FastAPI)
- `apps/chronos-api/src/chronos/api/routers/economic.py` (CHRONOS-471)
- `apps/chronos-api/Dockerfile.production` (CHRONOS-468)
- `apps/api/Dockerfile.production` (old location?)

### Frontend
- `apps/web/components/analytics/EconomicChart.tsx` (CHRONOS-472)
- `apps/web/components/analytics/ActiveIndicatorCard.tsx` (CHRONOS-472)

### Infrastructure
- `docker-compose.yml` (CHRONOS-468)
- Cloudflare Workers config (CHRONOS-483)
- `.env*` files (CHRONOS-484)
- Nginx config on Lightsail (CHRONOS-482 ✅)
- systemd service files on Lightsail (CHRONOS-482 ✅)

## Next Steps

1. **Verify what's already done**: Check Lightsail directories, apps/ structure
2. **Close CHRONOS-465** as duplicate
3. **Update CHRONOS-461 status** if cleanup already complete
4. **Continue CHRONOS-468** - Docker orchestration
5. **Begin CHRONOS-471 & 472** - Unit metadata (blocked by CHRONOS-468?)
6. **Schedule CHRONOS-483** - Cloudflare routing (after API endpoints confirmed working)

## Related Documentation
- Architecture: `docs/10-DEVELOPMENT/00-ARCHITECTURE/`
- Operations: `docs/20-OPERATIONS/`
- FastAPI app: `apps/chronos-api/README.md` (if exists)

---

**Sources**:
- [Manufacturing, Monthly - Economic Data Series | FRED](https://fred.stlouisfed.org/tags/series?t=manufacturing%3Bmonthly)
- [ISM® PMI® Reports](https://www.ismworld.org/supply-management-news-and-reports/reports/ism-pmi-reports/)
- [FRED-MD Database Documentation](http://www.columbia.edu/~sn2294/papers/fredmd.pdf)
