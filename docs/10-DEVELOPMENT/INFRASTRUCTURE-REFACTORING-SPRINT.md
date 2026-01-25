# Infrastructure Refactoring Sprint - Progress Tracker

**Last Updated**: 2026-01-25  
**Sprint Goal**: Clean up infrastructure before feature development  
**Total Tickets**: 8 (CHRONOS-390, 438, 451, 441, 443, 444, 394/449, 450)

---

## 🎯 Sprint Overview

Comprehensive cleanup of:
- **Environment files**: 11+ → 3 files
- **Docker orchestration**: Consolidate and document 4 compose files
- **Database schema**: Remove legacy, consolidate, clarify ownership
- **Python tooling**: Migrate to Poetry, integrate with Nx

**Estimated Time**: 13.5 hours over 3 weeks  
**Progress**: 0% complete

---

## Phase 1: Environment & Configuration

### ✅ CHRONOS-390: Configure Production DB Connection

**Status**: ✅ Complete  
**Time**: 15 minutes  
**Started**: 2026-01-25 15:01 EST  
**Completed**: 2026-01-25 15:03 EST

#### Tasks:
- [x] Add DATABASE_* variables to `.env.local`
- [x] Verify FRED_API_KEY placeholder exists
- [x] Check Python CLI configuration (uses env vars ✅)
- [ ] User: Add actual FRED_API_KEY from KeePassXC
- [ ] User: Add actual DATABASE_PASSWORD from KeePassXC
- [ ] User: Test database connection to Lightsail

#### Changes:
- `.env.local` - Added production DB credentials (commented out by default)
- `.env.local` - Added FRED_API_KEY placeholder

#### Notes:
- Python CLI (`timeseries_cli.py` and `geospatial_cli.py`) already use environment variables correctly
- Production credentials are commented out to avoid conflicts with local Docker
- User needs to uncomment and fill in actual secrets from KeePassXC

---

### ⏳ CHRONOS-438: Consolidate Environment Files

**Status**: Not Started  
**Time**: 2 hours  
**Dependencies**: CHRONOS-390

#### Current State:
11+ environment files scattered across project

#### Target State:
- `.env.example` - Template (committed)
- `.env.local` - Local development (gitignored)
- `.env.production` - Production (gitignored)

#### Tasks:
- [ ] Audit all 11+ .env files
- [ ] Create comprehensive `.env.example`
- [ ] Consolidate to 3 files
- [ ] Update all code references
- [ ] Update `.gitignore`
- [ ] Document environment strategy

---

### ⏳ CHRONOS-451: Docker Orchestration Cleanup

**Status**: Not Started  
**Time**: 1.5 hours  
**Dependencies**: CHRONOS-438

#### Current State:
4 docker-compose files with unclear purposes

#### Tasks:
- [ ] Document each compose file purpose
- [ ] Fix production gaps (pgbackrest.conf mount)
- [ ] Consider consolidation strategy
- [ ] Create deployment README

---

## Phase 2: Database Schema Cleanup

### ⏳ CHRONOS-443: Remove Legacy Tables

**Status**: Not Started  
**Time**: 1 hour  
**Dependencies**: CHRONOS-390

#### Progress:
- ✅ `backup_test` already removed in migration `ec45f2f8f2b7`

#### Tasks:
- [ ] SSH to Lightsail database
- [ ] Query for remaining legacy tables
- [ ] Create Alembic migration if needed
- [ ] Test and deploy

---

### ⏳ CHRONOS-441: Consolidate Schemas

**Status**: Not Started  
**Time**: 2 hours  
**Dependencies**: CHRONOS-443

#### Goal:
Organize schemas for better clarity

#### Tasks:
- [ ] Analyze current schema structure
- [ ] Create migration plan
- [ ] Create Alembic migration
- [ ] Test locally
- [ ] Deploy to production

---

### ⏳ CHRONOS-444: Clarify Schema Ownership

**Status**: Not Started  
**Time**: 1.5 hours  
**Dependencies**: CHRONOS-441

#### Questions:
- Should `cms_*` tables move to dedicated schema?
- Are `users` tables conflicting with Directus?

#### Tasks:
- [ ] Define naming conventions
- [ ] Identify tables to rename/move
- [ ] Create Alembic migration
- [ ] Update application code
- [ ] Document ownership rules

---

## Phase 3: Python Tooling

### ⏳ CHRONOS-394/449: Migrate to Poetry

**Status**: Not Started  
**Time**: 2 hours  
**Dependencies**: None (can run in parallel)

#### Current State:
- setuptools + venv
- No poetry.lock

#### Target State:
- Poetry-managed dependencies
- poetry.lock for reproducibility

#### Tasks:
- [ ] Install Poetry
- [ ] Convert pyproject.toml
- [ ] Generate poetry.lock
- [ ] Test all scripts
- [ ] Update documentation

---

### ⏳ CHRONOS-450: Nx Integration

**Status**: Not Started  
**Time**: 3 hours  
**Dependencies**: CHRONOS-394/449

#### Goal:
Integrate Python CLI into Nx monorepo

#### Tasks:
- [ ] Research @nx/python plugin
- [ ] Create project.json
- [ ] Configure Nx targets
- [ ] Integrate with nx affected
- [ ] Update documentation

---

## 📊 Progress Summary

| Phase | Tickets | Status | Time Spent | Time Remaining |
|-------|---------|--------|------------|----------------|
| **Phase 1: Config** | 3 | 🔄 In Progress | 0h | 4h |
| **Phase 2: Database** | 3 | ⏳ Not Started | 0h | 4.5h |
| **Phase 3: Python** | 2 | ⏳ Not Started | 0h | 5h |
| **Total** | **8** | **0%** | **0h** | **13.5h** |

---

## 🔄 Recent Updates

### 2026-01-25 15:01 EST
- Created tracking document
- Started CHRONOS-390 (DB config)
- Identified all tickets and dependencies

---

## 📝 Notes

- Using Alembic for all database migrations
- Testing locally before deploying to Lightsail
- Documenting as we go
- Backing up database before schema changes

---

## 🎯 Next Steps

1. ✅ Complete CHRONOS-390 (DB config)
2. Start CHRONOS-438 (env consolidation)
3. Request review before Phase 2
