# Directus Dashboards Setup Guide

**Branch:** `feature/directus-dashboards`
**Production Database:** AWS PostgreSQL @ 16.52.210.100:5432
**Directus Instance:** https://admin.automatonicai.com (Production only, no local)

## Issue Identified

Collections registered in Directus but not accessible/clickable:
- `economic_observations` - missing PRIMARY KEY constraint at database level
- `series_metadata`, `data_sources`, geospatial tables - missing Directus field metadata

## Jira Tickets Created

- **CHRONOS-395**: Fix Directus data collection accessibility
- **CHRONOS-396**: Create Economic Indicators Dashboard (US + Canada)
- **CHRONOS-397**: Create Geographic Data Dashboard (US + Canada)
- **CHRONOS-398**: Create Data Catalog Dashboard

## Solution Components

### 1. Database Schema Fix

**Alembic Migration:** `ad3f8c9b2e14_add_primary_key_to_economic_observations.py`

```sql
ALTER TABLE timeseries.economic_observations ADD PRIMARY KEY (id);
```

**To Apply:**
```bash
# On production database
python -m alembic upgrade head
```

### 2. Directus Collection Configuration

**Script:** `scripts/fix-data-collections.ts`

Configures metadata for 11 data collections:

**Time-series & Economic:**
- `economic_observations` (112K+ observations, PK: id)
- `series_metadata` (39 series, PK: series_id)
- `data_sources` (3 sources, PK: source_id)

**US Geospatial:**
- `us_states` (56 records, PK: gid)
- `us_counties` (3,235 records, PK: gid)
- `us_cbsa` (935 records, PK: gid)
- `us_csa` (184 records, PK: gid)
- `us_metdiv` (37 records, PK: gid)

**Canadian Geospatial:**
- `ca_provinces` (13 records, PK: gid)
- `ca_census_divisions` (293 records, PK: gid)

**To Run:**
```bash
# Ensure .env.aws is active
npx tsx scripts/fix-data-collections.ts
```

## Deployment Steps

### Step 1: Run Database Migration
```bash
# Apply PRIMARY KEY to economic_observations
python -m alembic upgrade head

# Verify
psql -h 16.52.210.100 -U chronos -d chronos -c "
SELECT constraint_name
FROM information_schema.table_constraints
WHERE table_name = 'economic_observations'
  AND constraint_type = 'PRIMARY KEY'
"
```

### Step 2: Configure Directus Collections
```bash
npx tsx scripts/fix-data-collections.ts
```

Expected output:
- ✅ All 11 collections configured with icons, display templates, notes
- ✅ Primary keys registered
- ✅ Collections now browsable via Content menu

### Step 3: Verify Access
1. Go to https://admin.automatonicai.com/admin/content/
2. Click on each collection to verify data displays:
   - economic_observations
   - series_metadata
   - us_states
   - ca_provinces
3. Confirm geospatial tables show geometry data

## Dashboard Architecture

### Dashboard 1: Economic Indicators (CHRONOS-396)
**Focus:** US + Canada economic comparison

**Panels:**
- Line charts: GDP, Unemployment, CPI/Inflation (dual axis)
- Metric cards: Latest values
- Time range selector
- Category filters

**Data Query:**
```sql
SELECT
    eo.observation_date,
    sm.series_name,
    sm.geography,
    eo.value
FROM timeseries.economic_observations eo
JOIN metadata.series_metadata sm ON eo.series_id = sm.series_id
WHERE sm.category = 'GDP'
  AND sm.geography IN ('United States', 'Canada')
ORDER BY eo.observation_date DESC
LIMIT 100
```

### Dashboard 2: Geographic Data (CHRONOS-397)
**Focus:** US + Canada spatial visualization

**Panels:**
- Map: US states with choropleth
- Map: Canadian provinces with choropleth
- Table: Top CBSAs
- Metrics: Counts, areas

**Map Data:**
```sql
SELECT
    gid,
    name,
    ST_AsGeoJSON(geom) as geojson,
    aland,
    awater
FROM geospatial.us_states
ORDER BY name
```

### Dashboard 3: Data Catalog (CHRONOS-398)
**Focus:** Browse available datasets

**Panels:**
- Table: All 39 economic series (searchable)
- Metrics: Total counts
- Pie chart: Categories
- Bar chart: Sources

**Catalog Query:**
```sql
SELECT
    sm.series_id,
    sm.series_name,
    sm.category,
    sm.frequency,
    sm.geography,
    ds.source_name,
    COUNT(eo.id) as observation_count,
    MIN(eo.observation_date) as earliest_date,
    MAX(eo.observation_date) as latest_date
FROM metadata.series_metadata sm
JOIN metadata.data_sources ds ON sm.source_id = ds.source_id
LEFT JOIN timeseries.economic_observations eo ON sm.series_id = eo.series_id
GROUP BY sm.series_id, sm.series_name, sm.category, sm.frequency, sm.geography, ds.source_name
ORDER BY sm.category, sm.series_name
```

## Directus Insights Panel Types

Available for dashboards:
- **Metric**: Single number with label
- **Line Chart**: Time-series visualization
- **Bar Chart**: Categorical comparison
- **Table**: Searchable data grid
- **Map**: GeoJSON/geometry visualization
- **List**: Simple item list
- **Label**: Text/markdown

## US + Canada Comparison Features

**Key Requirement:** Side-by-side comparison capability

**Implementation Approaches:**

1. **Dual-Axis Line Charts**: One chart, two Y-axes
2. **Separate Panels**: Side-by-side layout
3. **Toggle Filter**: Switch between countries
4. **Overlay Mode**: Both series on same chart

**Example Panel Config:**
```json
{
  "type": "line-chart",
  "collection": "economic_observations",
  "joins": ["series_metadata"],
  "filters": {
    "series_metadata": {
      "category": { "_eq": "GDP" }
    }
  },
  "groupBy": "observation_date",
  "series": [
    {
      "field": "value",
      "filter": { "geography": "United States" },
      "color": "#3B82F6",
      "label": "US GDP"
    },
    {
      "field": "value",
      "filter": { "geography": "Canada" },
      "color": "#EF4444",
      "label": "Canada GDP"
    }
  ]
}
```

## Testing Checklist

After deployment:

- [ ] All 11 collections accessible in Content menu
- [ ] Can browse economic_observations records
- [ ] Can filter series_metadata by category
- [ ] Geospatial tables show geometry previews
- [ ] Dashboard creation works in Insights
- [ ] Can add panels to dashboards
- [ ] Line charts render time-series data
- [ ] Maps render GeoJSON geometries
- [ ] Filters work correctly
- [ ] Export functions work (CSV, PDF)

## Troubleshooting

### Collections Still Not Clickable
```bash
# Check if migration ran
psql -c "\d timeseries.economic_observations" | grep PRIMARY

# Re-run Directus config script
npx tsx scripts/fix-data-collections.ts

# Check Directus logs
docker logs chronos-directus --tail 100
```

### Dashboard Panels Not Loading Data
- Verify DB_SEARCH_PATH includes all schemas: `public,metadata,timeseries,geospatial`
- Check Directus permissions for Public role
- Verify SQL queries in panel config

### Geometry Not Rendering
- Confirm PostGIS extension enabled
- Check SRID matches (should be 4326)
- Verify ST_AsGeoJSON() format

## Next Steps

1. Run migration (Step 1)
2. Run Directus config script (Step 2)
3. Verify all collections accessible (Step 3)
4. Create Dashboard 1: Economic Indicators (CHRONOS-396)
5. Create Dashboard 2: Geographic Data (CHRONOS-397)
6. Create Dashboard 3: Data Catalog (CHRONOS-398)
7. Document and screenshot
8. Commit to feature branch
9. Create PR for review
