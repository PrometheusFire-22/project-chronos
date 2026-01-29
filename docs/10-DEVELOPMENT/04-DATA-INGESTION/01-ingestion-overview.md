# Data Ingestion System: Architecture & Operations Guide

## Executive Summary

Project Chronos uses a **catalog-driven, plugin-based ingestion system** to fetch economic time-series data from multiple sources (FRED, Bank of Canada Valet, Statistics Canada) and store it in a PostgreSQL database with TimescaleDB and PostGIS extensions.

**Current Status** (as of 2026-01-29):
- ✅ **Valet (Bank of Canada)**: 11 series, 20,431 observations - **COMPLETE**
- ✅ **Statistics Canada**: 20 series, 10,692 observations - **COMPLETE**
- ⚠️ **FRED (Federal Reserve)**: 15/141 series ingested, 36,662 observations - **126 SERIES NEED INGESTION**

**Key Jira Tickets:**
- **CHRONOS-470**: Re-ingest all economic data with correct scalar transformations
- **CHRONOS-467**: Port legacy ingestion scripts to FastAPI
- **CHRONOS-471**: Update FastAPI endpoints to return unit metadata
- **CHRONOS-472**: Update frontend to display unit metadata
- **CHRONOS-398**: Create Data Catalog Dashboard

---

## System Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           CATALOG-DRIVEN INGESTION                          │
│                                                                             │
│  ┌──────────────────────────────────────────────────────────────────────┐  │
│  │ 1. CATALOG (CSV)                                                     │  │
│  │    database/seeds/time-series_catalog.csv                            │  │
│  │    - 106 active series defined                                       │  │
│  │    - Filters: source, geography, category, status                    │  │
│  └──────────────────────────────┬───────────────────────────────────────┘  │
│                                 │                                           │
│                                 ▼                                           │
│  ┌──────────────────────────────────────────────────────────────────────┐  │
│  │ 2. CLI ORCHESTRATOR                                                  │  │
│  │    src/chronos/ingestion/timeseries_cli.py                           │  │
│  │    - Loads catalog and applies filters                               │  │
│  │    - Connects to database (psycopg2)                                 │  │
│  │    - Orchestrates plugin execution                                   │  │
│  └──────────────────────────────┬───────────────────────────────────────┘  │
│                                 │                                           │
│              ┌──────────────────┼──────────────────┐                       │
│              │                  │                  │                       │
│              ▼                  ▼                  ▼                       │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐           │
│  │ 3A. FRED PLUGIN │  │ 3B. VALET       │  │ 3C. STATSCAN    │           │
│  │                 │  │     PLUGIN      │  │     PLUGIN      │           │
│  │ • HTTP GET      │  │ • HTTP GET      │  │ • HTTP POST     │           │
│  │ • Rate limited  │  │ • JSON parsing  │  │ • Vector IDs    │           │
│  │ • Retry 3x      │  │ • Date formats  │  │ • Normalization │           │
│  └────────┬────────┘  └────────┬────────┘  └────────┬────────┘           │
│           │                    │                     │                     │
│           └────────────────────┼─────────────────────┘                     │
│                                │                                           │
│                                ▼                                           │
│  ┌──────────────────────────────────────────────────────────────────────┐  │
│  │ 4. DATABASE (PostgreSQL + TimescaleDB + PostGIS)                     │  │
│  │                                                                      │  │
│  │  metadata.data_sources          timeseries.economic_observations    │  │
│  │  ├─ FRED                         ├─ series_id (FK)                  │  │
│  │  ├─ Bank of Canada Valet API     ├─ observation_date               │  │
│  │  └─ Statistics Canada            ├─ value (NUMERIC)                │  │
│  │                                   └─ quality_flag                   │  │
│  │  metadata.series_metadata        (Hypertable: 1-year chunks)       │  │
│  │  ├─ source_series_id (unique)                                      │  │
│  │  ├─ series_name                  metadata.ingestion_log            │  │
│  │  ├─ category, geography          ├─ ingestion_start/end            │  │
│  │  ├─ frequency                    ├─ records_fetched/inserted       │  │
│  │  ├─ unit_type (NEW)              ├─ status (success/failed)        │  │
│  │  ├─ scalar_factor (NEW)          └─ error_message                  │  │
│  │  └─ display_units (NEW)                                            │  │
│  └──────────────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Quick Start: Running Ingestion

### Prerequisites

```bash
# 1. Navigate to project root
cd /home/prometheus/coding/finance/project-chronos

# 2. Ensure database is running
psql -h 16.52.210.100 -U chronos -d chronos -c "SELECT version();"

# 3. Check catalog exists
ls -lh database/seeds/time-series_catalog.csv
```

### Basic Ingestion Commands

```bash
# Ingest ALL active series (106 series, ~1-2 hours)
poetry run python -m chronos.ingestion.timeseries_cli

# Filter by source
poetry run python -m chronos.ingestion.timeseries_cli --source FRED
poetry run python -m chronos.ingestion.timeseries_cli --source Valet
poetry run python -m chronos.ingestion.timeseries_cli --source StatsCan

# Filter by geography
poetry run python -m chronos.ingestion.timeseries_cli --geography "United States"
poetry run python -m chronos.ingestion.timeseries_cli --geography Canada

# Filter by category
poetry run python -m chronos.ingestion.timeseries_cli --category Employment
poetry run python -m chronos.ingestion.timeseries_cli --category Inflation
poetry run python -m chronos.ingestion.timeseries_cli --category Housing

# Specific series (repeatable flag)
poetry run python -m chronos.ingestion.timeseries_cli --series UNRATE --series CPIAUCSL

# Custom catalog path
poetry run python -m chronos.ingestion.timeseries_cli --catalog /path/to/custom_catalog.csv
```

### Staged Ingestion Strategy (Recommended)

**Objective**: Ingest 126 missing FRED series in manageable batches to avoid overwhelming your machine.

```bash
# Stage 1: US Core National Indicators (~20 series, ~10 minutes)
poetry run python -m chronos.ingestion.timeseries_cli \
  --source FRED \
  --geography "United States" \
  --category Growth

poetry run python -m chronos.ingestion.timeseries_cli \
  --source FRED \
  --geography "United States" \
  --category Employment

poetry run python -m chronos.ingestion.timeseries_cli \
  --source FRED \
  --geography "United States" \
  --category Inflation

# Stage 2: US Financial Markets (~15 series, ~5 minutes)
poetry run python -m chronos.ingestion.timeseries_cli \
  --source FRED \
  --category "Interest Rates"

poetry run python -m chronos.ingestion.timeseries_cli \
  --source FRED \
  --category Equities

# Stage 3: US State-Level Data (~50 series for unemployment, ~20 minutes)
poetry run python -m chronos.ingestion.timeseries_cli \
  --source FRED \
  --category Employment \
  --geography Alabama  # Repeat for each state

# Stage 4: Commodities & FX (~10 series, ~5 minutes)
poetry run python -m chronos.ingestion.timeseries_cli \
  --source FRED \
  --category Currency

poetry run python -m chronos.ingestion.timeseries_cli \
  --source FRED \
  --category Energy
```

### Background Ingestion (Overnight)

```bash
# Run in background with nohup
nohup poetry run python -m chronos.ingestion.timeseries_cli > ingestion.log 2>&1 &

# Check progress
tail -f ingestion.log

# Monitor process
ps aux | grep timeseries_cli

# Kill if needed
pkill -f timeseries_cli
```

---

## Data Sources & Plugins

### 1. FRED (Federal Reserve Economic Data)

**Plugin**: `src/chronos/ingestion/fred.py`

**Base URL**: `https://api.stlouisfed.org/fred/series/observations`

**Authentication**: API key required (set in environment)

**Rate Limiting**:
- Base delay: 2 seconds between requests
- Exponential backoff on retry (3 attempts)
- Respectful of FRED API guidelines

**Series Count**: 141 registered (15 ingested, **126 pending**)

**Sample Series**:
- **Macro**: `GDP`, `GDPC1`, `UNRATE`, `CPIAUCSL`, `PAYEMS`
- **Financial**: `SP500`, `DJIA`, `DGS10`, `VIXCLS`, `FEDFUNDS`
- **State-Level**: `ALUR`, `AKUR`, `AZUR`, ... (50 states)
- **Commodities**: `DCOILWTICO`, `GOLDAMGBD228NLBM`
- **FX**: `DEXUSEU`, `DEXJPUS`, `DEXCHUS`

**Observation Format**:
```json
{
  "observations": [
    {"date": "2024-01-01", "value": "5.2"},
    {"date": "2024-02-01", "value": "5.1"}
  ]
}
```

**Data Cleaning**:
- Filters out `.` (missing values)
- Converts `value` to `NUMERIC`
- Retries on HTTP errors

---

### 2. Valet (Bank of Canada)

**Plugin**: `src/chronos/ingestion/valet.py`

**Base URL**: `https://www.bankofcanada.ca/valet/observations`

**Authentication**: None required (public API)

**Rate Limiting**: 3-second delay on retry

**Series Count**: 11 (**all complete** ✅)

**Sample Series**:
- **Inflation**: `V41690973` (CPI), `V80691311` (IPPI)
- **Monetary Policy**: `V122530` (Policy Rate), `V122531` (Overnight Target), `V39079` (Balance Sheet)
- **FX**: `FXUSDCAD`, `FXEURCAD`, `FXGBPCAD`, `FXJPYCAD`, `FXCADMXN`

**Observation Format**:
```json
{
  "observations": [
    {
      "d": "2024-01-01",
      "V41690973": {"v": "152.3"}
    }
  ]
}
```

**Data Cleaning**:
- Extracts series value from nested structure
- Normalizes date format

---

### 3. Statistics Canada

**Plugin**: `src/chronos/ingestion/statscan.py`

**Base URL**: `https://www150.statcan.gc.ca/t1/wds/rest`

**Authentication**: None required (public API)

**Rate Limiting**: Standard retry (3 attempts)

**Series Count**: 20 (**all complete** ✅)

**Sample Series**:
- **Provincial Unemployment**: `v2063004` (NL), `v2063949` (ON), `v2064516` (AB), etc.
- **Provincial Housing**: `v111955448` (NL HPI), `v111955490` (ON HPI), etc.

**Observation Format** (POST request):
```json
{
  "object": {
    "vectorDataPoint": [
      {"refPer": "2024-01", "value": "5.2"}
    ]
  }
}
```

**Data Cleaning**:
- Strips `v` prefix from vector IDs for API calls
- Normalizes `YYYY-MM` dates to `YYYY-MM-01`
- Sorts by date ascending

---

## Database Schema

### Core Tables

#### `metadata.data_sources`

Stores information about each data provider.

```sql
CREATE TABLE metadata.data_sources (
  source_id SERIAL PRIMARY KEY,
  source_name TEXT UNIQUE NOT NULL,  -- 'FRED', 'Bank of Canada Valet API', 'Statistics Canada'
  source_description TEXT,
  base_url TEXT,
  api_key_required BOOLEAN,
  rate_limit_per_minute INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Current Sources**:
- `source_id=8`: FRED (legacy)
- `source_id=10`: Federal Reserve Economic Data
- `source_id=11`: Bank of Canada Valet API
- `source_id=12`: Statistics Canada

---

#### `metadata.series_metadata`

Central registry of all economic series.

```sql
CREATE TABLE metadata.series_metadata (
  series_id SERIAL PRIMARY KEY,
  source_id INTEGER NOT NULL REFERENCES metadata.data_sources(source_id),
  source_series_id TEXT NOT NULL,  -- External API ID (e.g., 'UNRATE', 'V41690973')
  series_name TEXT NOT NULL,
  series_description TEXT,
  frequency TEXT,  -- 'Monthly', 'Quarterly', 'Daily', 'Annual', 'Irregular'
  units TEXT,
  category TEXT,  -- 'Employment', 'Inflation', 'Growth', etc.
  geography TEXT,  -- 'United States', 'Canada', 'Alabama', etc.

  -- NEW: Unit System (Migration 003)
  unit_type metadata.unit_type_enum,  -- 'PERCENTAGE', 'CURRENCY', 'INDEX', 'COUNT', 'OTHER'
  scalar_factor NUMERIC(20, 6),  -- Multiplicative conversion factor
  display_units TEXT,  -- Human-readable (e.g., "% (percentage points)", "Billions USD")

  -- Multi-modal features
  description_embedding vector(384),  -- Sentence-transformer for semantic search
  location geography(POINT, 4326),  -- PostGIS for regional series
  metadata_json hstore,  -- Flexible key-value storage

  last_updated TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(source_id, source_series_id)
);
```

**Unit Type Enumeration** (NEW in Migration 003):
```sql
CREATE TYPE metadata.unit_type_enum AS ENUM (
  'PERCENTAGE',  -- Unemployment rates, interest rates, growth rates
  'CURRENCY',    -- GDP, dollar amounts
  'INDEX',       -- CPI, S&P 500 (dimensionless)
  'RATE',        -- Basis points, ratios (not percentages)
  'COUNT',       -- Number of people, units, homes
  'OTHER'        -- Catch-all
);
```

**Scalar Transformation Examples**:

| Series | Raw Value | Scalar Factor | Stored Value | Display Units |
|--------|-----------|---------------|--------------|---------------|
| GDP (Billions) | 123.45 | 1,000,000,000 | 123,450,000,000 | Billions USD |
| UNRATE (%) | 5.5 | 1.0 | 5.5 | % (percentage points) |
| HOUST (Thousands) | 1.234 | 1,000 | 1,234 | Thousands of Units |
| CPIAUCSL (Index) | 298.15 | 1.0 | 298.15 | Index 1982-1984=100 |

**Formula**: `Stored Value = Raw API Value × scalar_factor`

---

#### `timeseries.economic_observations` (TimescaleDB Hypertable)

Stores actual time-series data points.

```sql
CREATE TABLE timeseries.economic_observations (
  series_id INTEGER NOT NULL REFERENCES metadata.series_metadata(series_id),
  observation_date DATE NOT NULL,
  value NUMERIC(20, 6),
  quality_flag TEXT,  -- 'preliminary', 'revised', etc.
  created_at TIMESTAMPTZ DEFAULT NOW(),

  PRIMARY KEY (series_id, observation_date)
);

-- Convert to TimescaleDB hypertable (1-year chunks)
SELECT create_hypertable('timeseries.economic_observations', 'observation_date',
  chunk_time_interval => INTERVAL '1 year');
```

**Current Observations**:
- **Valet**: 20,431 observations
- **StatsCan**: 10,692 observations
- **FRED**: 36,662 observations (incomplete - only 15/141 series)
- **Total**: 67,785 observations

**ON CONFLICT Behavior**:
```sql
INSERT INTO timeseries.economic_observations (series_id, observation_date, value)
VALUES (%s, %s, %s)
ON CONFLICT (series_id, observation_date)
DO UPDATE SET value = EXCLUDED.value, created_at = NOW();
```

Re-ingestion updates existing records without duplication.

---

#### `metadata.ingestion_log`

Audit trail for ingestion jobs.

```sql
CREATE TABLE metadata.ingestion_log (
  log_id SERIAL PRIMARY KEY,
  source_id INTEGER REFERENCES metadata.data_sources(source_id),
  series_id INTEGER REFERENCES metadata.series_metadata(series_id),
  series_count INTEGER,  -- Number of series in this batch
  ingestion_start TIMESTAMPTZ NOT NULL,
  ingestion_end TIMESTAMPTZ,
  records_fetched INTEGER,
  records_inserted INTEGER,
  records_updated INTEGER,
  status TEXT,  -- 'running', 'success', 'failed', 'partial'
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## Catalog Format

**File**: `database/seeds/time-series_catalog.csv`

**Structure**:
```csv
series_id,source,status,series_name,asset_class,geography_type,geography_name,frequency,category,subcategory
GDP,FRED,Active,Gross Domestic Product,Macro,National,United States,Quarterly,Growth,GDP
UNRATE,FRED,Active,Unemployment Rate,Macro,National,United States,Monthly,Employment,Unemployment
V41690973,Valet,Active,Consumer Price Index: All Items,Macro,National,Canada,Monthly,Inflation,CPI
v2063004,StatsCan,Active,Unemployment Rate - Newfoundland and Labrador,Macro,Provincial,Newfoundland and Labrador,Monthly,Employment,Unemployment Rate
```

**Fields**:
- `series_id`: Source-specific series ID (e.g., `UNRATE`, `V41690973`)
- `source`: Data provider (`FRED`, `Valet`, `StatsCan`)
- `status`: `Active` (ingest) or `Inactive` (skip)
- `series_name`: Human-readable name
- `asset_class`: `Macro`, `Financial Markets`, `Foreign Exchange`, `Commodities`
- `geography_type`: `National`, `Provincial`, `State`, `Global`
- `geography_name`: `United States`, `Canada`, `Alberta`, `California`, `World`
- `frequency`: `Daily`, `Weekly`, `Monthly`, `Quarterly`, `Annual`, `Irregular`
- `category`: `Growth`, `Employment`, `Inflation`, `Interest Rates`, `Currency`, etc.
- `subcategory`: `GDP`, `Unemployment`, `CPI`, `Treasury Rates`, etc.

**Enhanced Catalog** (with unit metadata):
```csv
series_id,source,status,series_name,...,unit_type,scalar_factor,display_units
GDP,FRED,Active,Gross Domestic Product,...,CURRENCY,1000000000,Billions USD
UNRATE,FRED,Active,Unemployment Rate,...,PERCENTAGE,1.0,% (percentage points)
HOUST,FRED,Active,Housing Starts,...,COUNT,1000,Thousands of Units
```

---

## Current Ingestion Status

### Summary by Source

| Source | Series Registered | Series with Data | Missing Data | Observations |
|--------|-------------------|------------------|--------------|--------------|
| **FRED** | 141 | 15 (11%) | **126 (89%)** | 36,662 |
| **Valet** | 11 | 11 (100%) ✅ | 0 | 20,431 |
| **StatsCan** | 20 | 20 (100%) ✅ | 0 | 10,692 |
| **TOTAL** | 172 | 46 (27%) | 126 (73%) | 67,785 |

### FRED Series Missing Data (126 series)

**Categories**:
- **Employment** (50): All US state unemployment rates (`ALUR`, `AKUR`, ..., `WYUR`)
- **Housing** (50): All US state housing price indices
- **National Macro** (10): `GDP`, `GDPC1`, `INDPRO`, `RSXFS`, `HOUST`, `EXHOSLUSM495S`, `PAYEMS`, `CIVPART`, `U6RATE`
- **Inflation** (5): `CPIAUCSL`, `CPILFESL`, `PCEPI`, `PCEPILFE`, `PPIACO`
- **Financial Markets** (5): `DGS2`, `DGS5`, `DGS10`, `DGS30`, `BAMLC0A0CM`, etc.
- **Sentiment** (2): `UMCSENT`, `MICH`
- **Activity** (2): `NAPM`, `NAPMNOI`
- **Other** (2): `STLFSI3`, `DFEDTARU`, etc.

---

## Troubleshooting

### Issue: Series Not Ingesting

**Symptoms**:
- CLI completes but `obs_count = 0` in database
- Error message in console

**Diagnosis**:
```bash
# Check if series exists in catalog
grep "UNRATE" database/seeds/time-series_catalog.csv

# Check if series exists in database
psql -h 16.52.210.100 -U chronos -d chronos -c "
  SELECT sm.series_id, sm.source_series_id, sm.series_name,
         (SELECT COUNT(*) FROM timeseries.economic_observations WHERE series_id = sm.series_id) as obs_count
  FROM metadata.series_metadata sm
  WHERE sm.source_series_id = 'UNRATE';
"

# Check ingestion logs
psql -h 16.52.210.100 -U chronos -d chronos -c "
  SELECT * FROM metadata.ingestion_log
  WHERE error_message IS NOT NULL
  ORDER BY ingestion_start DESC
  LIMIT 10;
"
```

**Common Causes**:
1. **Status = Inactive**: Change to `Active` in catalog
2. **Invalid Series ID**: Verify ID exists in source API
3. **API Authentication**: Check FRED API key in environment
4. **Rate Limiting**: Increase delay between requests
5. **Network Issues**: Check connectivity to source API

**Fixes**:
```bash
# 1. Update catalog status
sed -i 's/UNRATE,FRED,Inactive/UNRATE,FRED,Active/g' database/seeds/time-series_catalog.csv

# 2. Test API directly
curl "https://api.stlouisfed.org/fred/series/observations?series_id=UNRATE&api_key=YOUR_KEY&file_type=json"

# 3. Re-run ingestion for specific series
poetry run python -m chronos.ingestion.timeseries_cli --series UNRATE
```

---

### Issue: Scalar Transformations Not Applied

**Symptoms**:
- GDP shows as `123.45` instead of `123450000000`
- Unemployment shows as `0.052` instead of `5.2`

**Root Cause**: Unit metadata not populated in database (Migration 003 not applied)

**Fix**:
```bash
# 1. Check if migration applied
psql -h 16.52.210.100 -U chronos -d chronos -c "
  SELECT column_name, data_type
  FROM information_schema.columns
  WHERE table_name = 'series_metadata'
    AND column_name IN ('unit_type', 'scalar_factor', 'display_units');
"

# 2. Apply migration if missing
cd /path/to/project
python -m alembic upgrade head

# 3. Update catalog with unit metadata
# Edit: database/seeds/time-series_catalog_with_units.csv

# 4. Re-ingest (TRUNCATE first if needed)
psql -h 16.52.210.100 -U chronos -d chronos -c "TRUNCATE timeseries.economic_observations;"
poetry run python -m chronos.ingestion.timeseries_cli
```

---

### Issue: Slow Ingestion Performance

**Symptoms**:
- Takes > 5 minutes for 10 series
- High CPU/memory usage

**Diagnosis**:
```bash
# Check batch size in code
grep "batch_size" src/chronos/ingestion/timeseries_cli.py

# Monitor database connections
psql -h 16.52.210.100 -U chronos -d chronos -c "
  SELECT count(*), state
  FROM pg_stat_activity
  WHERE datname = 'chronos'
  GROUP BY state;
"
```

**Optimizations**:
1. **Increase Batch Size**: Change from 100 to 500 observations per INSERT
2. **Use Connection Pooling**: Switch from psycopg2 to SQLAlchemy with pooling
3. **Disable Triggers**: Temporarily disable triggers during bulk ingestion
4. **Parallel Ingestion**: Run multiple CLI instances for different sources

---

## Integration with Jira Tickets

### CHRONOS-470: Re-ingest all economic data with correct scalar transformations

**Objective**: Truncate observations table and re-run ingestion CLI with new scalar logic.

**Status**: To Do

**Steps**:
```bash
# 1. Backup existing data (optional)
pg_dump -h 16.52.210.100 -U chronos -d chronos \
  -t timeseries.economic_observations \
  > economic_observations_backup_$(date +%Y%m%d).sql

# 2. Truncate observations
psql -h 16.52.210.100 -U chronos -d chronos -c "TRUNCATE timeseries.economic_observations;"

# 3. Run full ingestion
poetry run python -m chronos.ingestion.timeseries_cli

# 4. Validate scalar transformations
psql -h 16.52.210.100 -U chronos -d chronos -c "
  SELECT sm.source_series_id, sm.series_name, sm.unit_type, sm.scalar_factor,
         MIN(eo.value) as min_value, MAX(eo.value) as max_value
  FROM metadata.series_metadata sm
  JOIN timeseries.economic_observations eo ON sm.series_id = eo.series_id
  WHERE sm.source_series_id IN ('UNRATE', 'GDP', 'HOUST')
  GROUP BY sm.series_id;
"

# Expected: UNRATE between 3-8%, GDP in billions (> 1000000000)
```

**Expected Duration**: 1-2 hours for 106 active series

**Branch**: `chore/data-reingestion`

---

### CHRONOS-467: Port Legacy Ingestion to FastAPI

**Objective**: Ensure legacy ingestion scripts are correctly migrated to new FastAPI structure.

**Status**: To Do

**Tasks**:
1. Port utility modules from `src/chronos` to `apps/chronos-api/src/chronos`
2. Ensure database models and configuration load correctly
3. Update Docker to support running ingestion tasks via API container

**Future API Pattern**:
```python
# apps/chronos-api/src/chronos/api/routers/ingestion.py
from fastapi import APIRouter, BackgroundTasks
from chronos.ingestion.timeseries_cli import run_ingestion

router = APIRouter()

@router.post("/ingest/fred")
async def trigger_fred_ingestion(background_tasks: BackgroundTasks):
    """Trigger FRED data ingestion in background."""
    background_tasks.add_task(run_ingestion, source="FRED")
    return {"status": "started", "source": "FRED"}

@router.post("/ingest/valet")
async def trigger_valet_ingestion(background_tasks: BackgroundTasks):
    """Trigger Bank of Canada Valet ingestion in background."""
    background_tasks.add_task(run_ingestion, source="Valet")
    return {"status": "started", "source": "Valet"}
```

---

### CHRONOS-471: Update FastAPI endpoints to return unit metadata

**Objective**: Modify `/api/economic/series` and `/api/economic/timeseries` to include unit metadata.

**Status**: To Do

**Files**: `apps/chronos-api/src/chronos/api/routers/economic.py`

**Response Format**:
```json
{
  "series_id": "UNRATE",
  "series_name": "Unemployment Rate",
  "unit_type": "PERCENTAGE",
  "scalar_factor": 1.0,
  "display_units": "% (percentage points)",
  "observations": [
    {"date": "2024-01-01", "value": 5.2}
  ]
}
```

**Branch**: `feat/api-unit-metadata`

---

### CHRONOS-472: Update frontend to display unit metadata

**Objective**: Show units in chart tooltips, legends, and axis labels.

**Status**: To Do

**Files**:
- `apps/web/components/analytics/EconomicChart.tsx`
- `apps/web/components/analytics/ActiveIndicatorCard.tsx`

**Requirements**:
- Display `display_units` in tooltip (e.g., "5.2% (percentage points)")
- Add unit labels to Y-axes
- Handle percentage formatting (no multiplication needed - already stored as %)

**Branch**: `feat/frontend-unit-display`

---

### CHRONOS-398: Create Data Catalog Dashboard

**Objective**: Build Directus dashboard for browsing available datasets.

**Status**: To Do (depends on CHRONOS-395)

**Data Sources**:
- `metadata.series_metadata` (172 economic series)
- `metadata.data_sources` (3 sources)
- Geospatial catalog (11 layers)

**Dashboard Panels**:
1. **Table**: All Economic Series (searchable, sortable)
   - Series Name, Category, Frequency, Source, Geography
   - Last Updated, Observation Count
2. **Metrics**:
   - Total Series (172)
   - Total Observations (67K+)
   - Total Geospatial Layers (11)
   - Data Sources (3)
3. **Charts**:
   - Category Breakdown (pie chart)
   - Source Distribution (bar chart)
   - Frequency Distribution (bar chart)

**Requirements**:
- Search/filter by category, source, geography
- Click to view series details
- Export catalog to CSV
- Last updated timestamps

**Deliverables**:
- Directus dashboard
- Data catalog documentation
- Screenshots

---

## Next Steps

### Immediate (CHRONOS-470)

1. **Validate Unit Metadata**: Ensure `scalar_factor` and `display_units` are correct in database
2. **Backup Existing Data**: `pg_dump` before truncating
3. **Truncate Observations**: `TRUNCATE timeseries.economic_observations;`
4. **Run Full Ingestion**: Focus on 126 missing FRED series
5. **Validate Results**: Check unemployment rates (3-8%), GDP (billions), etc.

### Short-Term (1-2 weeks)

1. **CHRONOS-471**: Update FastAPI endpoints to return unit metadata
2. **CHRONOS-472**: Update frontend to display units properly
3. **CHRONOS-467**: Refactor CLI into callable API functions

### Medium-Term (1-2 months)

1. **CHRONOS-398**: Create Directus Data Catalog Dashboard
2. **Add Canadian Territories**: Yukon, NWT, Nunavut data ingestion
3. **Automated Scheduling**: Cron jobs for daily/weekly ingestion
4. **Data Quality Monitoring**: Alerting for stale/missing data

---

## References

- **Ingestion CLI**: `src/chronos/ingestion/timeseries_cli.py`
- **Plugins**: `src/chronos/ingestion/fred.py`, `valet.py`, `statscan.py`
- **Catalog**: `database/seeds/time-series_catalog.csv`
- **Database Schema**: `database/schema.sql`
- **Migration 003**: `database/migrations/003_add_unit_metadata.sql`
- **Jira Board**: https://automatonicai.atlassian.net/jira/software/projects/CHRONOS
