# Strategic Work Sequencing Plan
**Date:** 2026-01-27
**Context:** FastAPI migration cleanup, data quality fixes, geospatial issues

---

## ⚠️ CRITICAL BLOCKER ASSESSMENT

### Is Scalar Fix a Blocker?

**SHORT ANSWER: NO - Can defer full re-ingestion**

**Why it's NOT blocking other work:**
1. Frontend bugs (white line) are independent of data values
2. Geospatial work uses different data sources
3. AWS/orchestration refactor is infrastructure, not data
4. Can work on these in parallel while data re-ingests overnight

**What IS blocking:**
- ✅ Catalog fixes (15 series) - **DO THIS NOW** (10 minutes)
- ❌ Full re-ingestion - **DEFER to overnight/tomorrow**

---

## RECOMMENDED SEQUENCING

### Phase 1: TONIGHT (No Charger, 2-3 hours)

#### 1A. Fix Catalog (10 min) - CRITICAL
```bash
# Edit the 15 remaining series manually
vim database/seeds/time-series_catalog_fixed.csv

# Replace catalog
mv database/seeds/time-series_catalog_fixed.csv \
   database/seeds/time-series_catalog_expanded.csv

# Commit
git checkout -b chore/catalog-unit-metadata
git add database/seeds/time-series_catalog_expanded.csv
git commit -m "chore: add unit metadata to catalog for scalar transformations"
```

#### 1B. Create Jira Tickets (20 min)
- All work items below
- Proper epic structure
- Linked to git branches

#### 1C. HIGH-VALUE BUG FIXES (90-120 min)

**Priority 1: Chart White Line Bug**
- Branch: `bug/chart-hover-white-line`
- File: `apps/web/components/analytics/EconomicChart.tsx`
- Impact: User-facing visual bug
- Effort: Low (probably CSS/SVG rendering issue)
- **DO THIS FIRST**

**Priority 2: Geospatial - Great Lakes Rendering**
- Branch: `bug/geospatial-great-lakes-rendering`
- Files: `apps/web/components/analytics/GeospatialMap.tsx`, choropleth logic
- Impact: High (looks terrible, considering switching libraries)
- Effort: Medium-High
- Options to explore:
  - Fix Leaflet zIndex/layer ordering (again)
  - Switch to Mapbox GL JS (more modern, better performance)
  - Use TopoJSON instead of GeoJSON (smaller, faster)

---

### Phase 2: TOMORROW MORNING (With Charger, 1 hour)

#### 2A. Canadian Geospatial Data (30 min)
- Branch: `feat/geospatial-canadian-data`
- Add provincial boundary data to database
- Update API endpoint to serve Canadian geometries
- Test rendering

#### 2B. Geospatial Outlier Handling (30 min)
- Branch: `feat/geospatial-outlier-detection`
- Implement standard deviation-based outlier detection
- Add color scale clamping for extreme values
- Document approach in code

---

### Phase 3: TOMORROW AFTERNOON (Background Ingestion Running)

#### 3A. Start Data Re-Ingestion (Overnight)
```bash
# Clear data
poetry run python -c "from chronos.ingestion.timeseries_cli import get_db_connection; conn = get_db_connection(); conn.cursor().execute('TRUNCATE timeseries.economic_observations'); conn.commit()"

# Run in background
nohup poetry run python -m chronos.ingestion.timeseries_cli > logs/ingestion.log 2>&1 &

# Or use tmux for safety
tmux new -s ingestion
poetry run python -m chronos.ingestion.timeseries_cli
# Ctrl+B, D to detach
```

#### 3B. While Ingestion Runs: AWS/Orchestration Refactor (2-4 hours)
- Branch: `chore/aws-fastapi-migration-cleanup`
- Focus areas:
  1. AWS Lightsail configuration for FastAPI
  2. Cloudflare Workers routing to new Python API
  3. Environment variable consolidation
  4. Docker/deployment scripts update
  5. Health check endpoints
  6. Logging/monitoring setup

---

### Phase 4: AFTER INGESTION COMPLETE

#### 4A. Frontend Unit Display (1 hour)
- Branch: `feat/frontend-unit-metadata-display`
- Update API to return `unit_type`, `display_units`
- Update `EconomicChart.tsx` to show units in tooltips/legends
- Handle percentage formatting (no multiplication needed - already stored as %)

#### 4B. Delete Deprecated Scripts (5 min)
- Branch: `chore/remove-deprecated-scripts`
- Delete `apply_data_fixes.py`, debug scripts
- Clean up root directory clutter

---

## GIT FLOW STRATEGY

### Branch Naming Convention
- `feature/` - New functionality
- `bug/` - Bug fixes
- `chore/` - Maintenance, refactoring, tooling
- `hotfix/` - Critical production fixes

### Workflow
```bash
# Create branch
git checkout -b <type>/<descriptive-name>

# Work on feature
git add .
git commit -m "<type>: <description>"

# Push and create PR
git push -u origin <branch-name>

# Merge via PR (not direct to main)
# Delete branch after merge
```

### Commit Message Format
```
<type>: <short description>

<optional body>

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>
```

Types: `feat`, `fix`, `chore`, `docs`, `refactor`, `test`, `hotfix`

---

## JIRA EPIC STRUCTURE

### Epic 1: Data Quality & Unit Metadata (CHRONOS-XXX)
**Status:** In Progress (70% complete)
**Stories:**
- [x] CHRONOS-XXX: Add unit metadata columns to database
- [x] CHRONOS-XXX: Auto-populate catalog with unit metadata
- [x] CHRONOS-XXX: Fix catalog data quality issues
- [x] CHRONOS-XXX: Update ingestion plugins with scalar logic
- [ ] CHRONOS-XXX: Finalize catalog (15 remaining series)
- [ ] CHRONOS-XXX: Re-ingest data with correct scalars
- [ ] CHRONOS-XXX: Update FastAPI endpoints to return unit metadata
- [ ] CHRONOS-XXX: Update frontend to display units
- [ ] CHRONOS-XXX: Delete deprecated data fix scripts

### Epic 2: Economic Analytics UI/UX (CHRONOS-XXX)
**Status:** To Do
**Stories:**
- [ ] CHRONOS-XXX: BUG - White line on chart hover
- [ ] CHRONOS-XXX: Add geography selector (US/Canada, National/State-Provincial)
- [ ] CHRONOS-XXX: Improve chart performance for large datasets
- [ ] CHRONOS-XXX: Add data export functionality

### Epic 3: Geospatial Analytics (CHRONOS-XXX)
**Status:** In Progress
**Stories:**
- [ ] CHRONOS-XXX: BUG - Great Lakes rendering incorrectly
- [ ] CHRONOS-XXX: Add Canadian provincial boundary data
- [ ] CHRONOS-XXX: Implement outlier detection with std dev
- [ ] CHRONOS-XXX: Evaluate Mapbox GL JS migration
- [ ] CHRONOS-XXX: Add color scale legend with outlier indicators

### Epic 4: FastAPI Migration & DevOps (CHRONOS-XXX)
**Status:** In Progress
**Stories:**
- [ ] CHRONOS-XXX: AWS Lightsail configuration for FastAPI
- [ ] CHRONOS-XXX: Cloudflare Workers routing update
- [ ] CHRONOS-XXX: Environment variable consolidation
- [ ] CHRONOS-XXX: Docker deployment scripts
- [ ] CHRONOS-XXX: Monitoring & logging setup
- [ ] CHRONOS-XXX: Health check endpoints

---

## STATE/PROVINCIAL DATA - CRITICAL ISSUE

### Current Gap
You're right - I was neglecting state/provincial data in the re-ingestion guide!

### State-Level Data Coverage
**Current Catalog:**
- US State unemployment rates (50 states)
- Canadian provincial unemployment (10 provinces + 3 territories)
- Provincial housing price indices (10 provinces)

**All are in catalog and will be ingested** - just need to ensure they're included in staged approach.

### Updated Stage 3 Command
```bash
# US State-Level Data
poetry run python -m chronos.ingestion.timeseries_cli \
  --source FRED \
  --geo-type "State"

# Canadian Provincial Data
poetry run python -m chronos.ingestion.timeseries_cli \
  --source StatsCan \
  --geo-type "Province"
```

### Geography Selector Menu (New Feature)
Add to Epic 2:
```
CHRONOS-XXX: Add geography filter menu
- Multi-select: US and/or Canada
- Multi-select: National, State, Provincial
- Dynamic chart updates
- URL state persistence
```

---

## TONIGHT'S ACTION PLAN

1. **Fix Catalog** (10 min) ✅ DO NOW
2. **Create Jira Tickets** (20 min)
3. **Bug: Chart White Line** (60 min) - High ROI
4. **Bug: Great Lakes Rendering** (90 min) - High visibility issue

**Total:** ~3 hours of productive work

**Tomorrow:**
- Geospatial Canadian data + outliers (1 hour)
- Start overnight ingestion
- AWS/FastAPI refactor while ingestion runs (2-4 hours)

---

## SUCCESS METRICS

**By End of Tonight:**
- ✅ Catalog 100% complete
- ✅ All Jira tickets created & organized
- ✅ Chart white line bug fixed
- ✅ Great Lakes rendering acceptable (or migration path identified)

**By End of Tomorrow:**
- ✅ All data re-ingested with correct scalars
- ✅ Canadian geospatial data working
- ✅ Outlier detection implemented
- ✅ AWS/FastAPI infrastructure solid

**By End of Week:**
- ✅ Frontend displaying unit metadata
- ✅ Geography selector menu implemented
- ✅ Deprecated scripts removed
- ✅ All epics at 80%+ completion
