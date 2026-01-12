# Geospatial Analytics Implementation Guide

**Status**: Implementation Complete (Priority 1)
**Date**: 2026-01-12
**Purpose**: Document schema changes, data architecture, and implementation details for state/province-level geospatial analytics

---

## Overview

The geospatial analytics system enables visualization of economic time-series data on interactive choropleth maps. This implementation supports state-level data for the United States and province-level data for Canada.

---

## Architecture

### Components

1. **Database Schema**:
   - `metadata.series_metadata` - Economic series metadata with geographic linkage
   - `geospatial.*` - Boundary tables (us_states, ca_provinces, etc.)
   - `timeseries.economic_observations` - Time-series observation values

2. **Data Ingestion**:
   - Catalog-based ingestion system (`src/chronos/ingestion/timeseries_cli.py`)
   - Supports FRED (Federal Reserve) and Valet (Statistics Canada) APIs
   - Idempotent processing with `ON CONFLICT` clauses

3. **API Endpoints**:
   - `GET /api/geospatial/choropleth` - Returns GeoJSON with economic values

4. **Frontend Components**:
   - `GeospatialMap.tsx` - Leaflet-based choropleth map
   - `MapLegend.tsx` - Color scale legend
   - `page.tsx` - Main geospatial dashboard

---

## Schema Changes

### Migration: `001_add_geography_id_to_series_metadata.sql`

Added `geography_id` column to `metadata.series_metadata` table:

```sql
ALTER TABLE metadata.series_metadata
ADD COLUMN IF NOT EXISTS geography_id TEXT;

CREATE INDEX IF NOT EXISTS idx_series_metadata_geography_id
ON metadata.series_metadata(geography_id);

CREATE INDEX IF NOT EXISTS idx_series_metadata_geography_composite
ON metadata.series_metadata(geography_type, geography_id);
```

### Column Purpose

**`geography_id`**: Stores the geographic identifier for linking economic series to specific regions:
- **US States**: 2-digit FIPS codes (e.g., `'06'` for California, `'36'` for New York)
- **Canadian Provinces**: 2-digit PRUID codes (e.g., `'35'` for Ontario, `'48'` for Alberta)
- **National Data**: `NULL` (no specific geographic region)

**`geography_type`**: (Already existed) Indicates the level of geographic aggregation:
- `'National'` - Country-level data
- `'State'` - US state-level data
- `'Province'` - Canadian province-level data
- `'County'` - US county-level data (future)

### Linkage Strategy

Economic series are linked to geospatial boundaries via `geography_id`:

**For US States**:
```sql
SELECT *
FROM metadata.series_metadata sm
JOIN geospatial.us_states g ON sm.geography_id = g.geoid
WHERE sm.geography_type = 'State';
```

**For Canadian Provinces**:
```sql
SELECT *
FROM metadata.series_metadata sm
JOIN geospatial.ca_provinces g ON sm.geography_id = g.pruid
WHERE sm.geography_type = 'Province';
```

---

## Data Catalog Structure

### Priority 1 Catalog: `geospatial-priority1-catalog.csv`

Contains 115 state/province-level economic series:
- **51 series**: US Unemployment Rate by State (FRED: `{STATE}UR`)
- **51 series**: US House Price Index by State (FRED: `{STATE}STHPI`)
- **13 series**: Canada Unemployment Rate by Province (StatCan)

### Catalog Columns

| Column | Description | Example |
|--------|-------------|---------|
| `series_id` | FRED/Valet series identifier | `CAUR` |
| `source` | Data source (FRED or Valet) | `FRED` |
| `status` | Active/Inactive | `Active` |
| `series_name` | Human-readable name | `California Unemployment Rate` |
| `asset_class` | Broad category | `Macro` |
| `geography_type` | Geographic level | `State` |
| `geography_name` | Region name | `California` |
| `geography_id` | FIPS/PRUID code | `06` |
| `frequency` | Update frequency | `Monthly` |
| `category` | Data category | `Employment` |
| `subcategory` | Subcategory | `Unemployment` |

### Example Entries

```csv
series_id,source,status,series_name,geography_type,geography_name,geography_id,frequency,category
CAUR,FRED,Active,California Unemployment Rate,State,California,06,Monthly,Employment
TXUR,FRED,Active,Texas Unemployment Rate,State,Texas,48,Monthly,Employment
CASTHPI,FRED,Active,California All-Transactions House Price Index,State,California,06,Quarterly,Housing
```

---

## Ingestion Process

### Prerequisites

1. **Run Migration**:
   ```bash
   psql -d chronos_db -f database/migrations/001_add_geography_id_to_series_metadata.sql
   ```

2. **Verify FRED API Key**:
   ```bash
   echo $FRED_API_KEY
   ```

### Running Ingestion

**Ingest All Priority 1 Series** (102 FRED series):
```bash
cd /home/prometheus/coding/finance/project-chronos
python3 src/chronos/ingestion/timeseries_cli.py \
  --source FRED
```

This will:
- Read `database/seeds/geospatial-priority1-catalog.csv`
- Filter series with `status = "Active"` and `source = "FRED"`
- For each series:
  1. Fetch observations from FRED API
  2. Insert/update metadata with geography_id and geography_type
  3. Insert observations with idempotent `ON CONFLICT` logic
  4. Sleep 1 second between series (rate limiting)

**Expected Duration**: ~2 minutes for 102 FRED series

### Idempotence Behavior

The ingestion system is **fully idempotent**:

**Series Metadata**:
```sql
ON CONFLICT (source_id, source_series_id)
DO UPDATE SET
  series_name = EXCLUDED.series_name,
  geography_type = EXCLUDED.geography_type,
  geography_id = EXCLUDED.geography_id,
  last_updated = NOW();
```

**Observations**:
```sql
ON CONFLICT (series_id, observation_date)
DO UPDATE SET value = EXCLUDED.value;
```

**What This Means**:
- Re-running ingestion will **update** existing data, not duplicate it
- Safe to run periodically to refresh data
- No data loss or duplication risk

---

## Choropleth Query Logic

### API Flow

1. **Request**: `GET /api/geospatial/choropleth?geography=US&level=state&seriesId=UR`

2. **Query Strategy**:
   ```sql
   WITH latest_observations AS (
     -- Get most recent observation for each state-level series
     SELECT DISTINCT ON (series_id)
       series_id, observation_date, value
     FROM timeseries.economic_observations
     WHERE series_id IN (
       SELECT series_id FROM metadata.series_metadata
       WHERE geography_type = 'State'
       AND source_series_id LIKE 'UR%'  -- Matches CAUR, TXUR, etc.
     )
     ORDER BY series_id, observation_date DESC
   ),
   series_with_geography AS (
     -- Join series metadata with latest observation
     SELECT sm.geography_id, sm.series_name, lo.value, lo.observation_date
     FROM metadata.series_metadata sm
     LEFT JOIN latest_observations lo ON sm.series_id = lo.series_id
     WHERE sm.geography_type = 'State'
   )
   -- Join with geospatial boundaries to create GeoJSON
   SELECT json_build_object(
     'type', 'Feature',
     'id', g.geoid,
     'properties', json_build_object(
       'name', g.name,
       'value', swg.value,
       'seriesName', swg.series_name,
       'date', swg.observation_date
     ),
     'geometry', ST_AsGeoJSON(g.geom)::json
   ) as feature
   FROM geospatial.us_states g
   LEFT JOIN series_with_geography swg ON g.geoid = swg.geography_id;
   ```

3. **Response**: GeoJSON FeatureCollection with choropleth values

### Query Parameters

| Parameter | Required | Description | Example |
|-----------|----------|-------------|---------|
| `geography` | No | `US` or `CANADA` | `US` |
| `level` | No | `state` or `province` | `state` |
| `seriesId` | Yes | Series ID pattern | `UR` (matches all unemployment rates) |
| `date` | No | ISO date for historical data | `2024-12-01` |

### Series ID Patterns

- `UR` - Matches all unemployment rate series (CAUR, TXUR, NYUR, etc.)
- `STHPI` - Matches all house price index series (CASTHPI, TXSTHPI, etc.)
- Specific series: `CAUR` - California unemployment only

---

## Frontend Implementation

### Component Hierarchy

```
GeospatialPage (page.tsx)
├── Geography Selector (US/Canada toggle)
├── FilterSidebar (left panel)
│   ├── Region Selector
│   └── MapLegend
└── GeospatialMap (right panel)
    └── LeafletChoroplethMap
```

### Map Rendering Flow

1. **User selects geography** (`US` or `CANADA`)
2. **GeospatialMap fetches data**:
   ```typescript
   const { data, loading, error } = useChoroplethData(
     geography,
     level,
     seriesId,
     date
   );
   ```
3. **API returns GeoJSON** with economic values
4. **Leaflet renders choropleth**:
   - Colors calculated from value range
   - Tooltips show: "California - 3.2%"
   - Click handlers for drill-down

### Color Scale Logic

```typescript
const getColor = (value: number | null): string => {
  if (value === null) return '#cccccc';  // Grey for missing data

  const normalized = (value - min) / (max - min);
  const index = Math.floor(normalized * (colorScale.length - 1));
  return colorScale[index];
};
```

Default scale: 9-step blue gradient from `#f7fbff` to `#08306b`

---

## Data Flow Diagram

```
┌─────────────────┐
│  FRED API       │
│  (US States)    │
└────────┬────────┘
         │
         │ fetch_observations()
         v
┌─────────────────────────────────────────┐
│  Ingestion Script                       │
│  (timeseries_cli.py)                    │
│  - Reads catalog CSV                    │
│  - Fetches from API                     │
│  - Inserts with geography_id            │
└────────┬────────────────────────────────┘
         │
         v
┌─────────────────────────────────────────┐
│  PostgreSQL Database                    │
│  ┌───────────────────────────────────┐  │
│  │ metadata.series_metadata          │  │
│  │ - geography_id (FIPS/PRUID)       │  │
│  │ - geography_type (State/Province) │  │
│  └───────────┬───────────────────────┘  │
│              │                           │
│              │ series_id FK              │
│              v                           │
│  ┌───────────────────────────────────┐  │
│  │ timeseries.economic_observations  │  │
│  │ - observation_date                │  │
│  │ - value                           │  │
│  └───────────────────────────────────┘  │
│                                          │
│  ┌───────────────────────────────────┐  │
│  │ geospatial.us_states              │  │
│  │ - geoid (FIPS)                    │  │
│  │ - geom (PostGIS)                  │  │
│  └───────────────────────────────────┘  │
└──────────────────┬──────────────────────┘
                   │
                   │ JOIN on geography_id
                   v
         ┌─────────────────────┐
         │  Choropleth API     │
         │  (/api/geospatial)  │
         │  Returns GeoJSON    │
         └─────────┬───────────┘
                   │
                   │ HTTP response
                   v
         ┌─────────────────────┐
         │  GeospatialMap.tsx  │
         │  Leaflet Rendering  │
         └─────────────────────┘
```

---

## FIPS and PRUID Reference

### US State FIPS Codes (Sample)

| State | FIPS | Series ID Example |
|-------|------|-------------------|
| Alabama | `01` | ALUR |
| Alaska | `02` | AKUR |
| California | `06` | CAUR |
| Texas | `48` | TXUR |
| New York | `36` | NYUR |

**Full List**: All 50 states + DC in Priority 1 catalog

### Canadian Province PRUID Codes

| Province | PRUID | Series ID Pattern |
|----------|-------|-------------------|
| Newfoundland and Labrador | `10` | CAUR_NL |
| Ontario | `35` | CAUR_ON |
| Quebec | `24` | CAUR_QC |
| Alberta | `48` | CAUR_AB |
| British Columbia | `59` | CAUR_BC |

**Note**: Canadian unemployment series require Statistics Canada vector IDs (currently `Inactive` in catalog)

---

## Remaining Work

### Completed (Priority 1)

- ✅ Schema migration with geography_id column
- ✅ Priority 1 catalog with 115 series (102 FRED active)
- ✅ Updated ingestion script to handle geography_id
- ✅ Choropleth API with real data queries
- ✅ Tooltip format improvements (concise "3.2%")
- ✅ Documentation of schema and architecture

### To Be Completed

1. **Run Database Migration**:
   ```bash
   psql -d chronos_db -f database/migrations/001_add_geography_id_to_series_metadata.sql
   ```

2. **Run Ingestion for FRED Series**:
   ```bash
   python3 src/chronos/ingestion/timeseries_cli.py --source FRED
   ```

3. **Verify Data**:
   ```sql
   -- Check series metadata
   SELECT series_id, series_name, geography_type, geography_id
   FROM metadata.series_metadata
   WHERE geography_type = 'State'
   LIMIT 10;

   -- Check observation counts
   SELECT COUNT(*) FROM timeseries.economic_observations
   WHERE series_id IN (
     SELECT series_id FROM metadata.series_metadata WHERE geography_type = 'State'
   );
   ```

4. **Test Choropleth in Browser**:
   - Navigate to `https://automatonicai.com/analytics/geospatial`
   - Verify map shows unemployment rates with color gradient
   - Hover over states to see tooltips with actual values
   - Check legend shows correct min/max range

5. **Canadian Province Series** (Future):
   - Identify Statistics Canada vector IDs for provincial unemployment
   - Update catalog with correct series_ids
   - Set status to `Active`
   - Run ingestion with `--source Valet`

6. **UI Enhancements** (Future):
   - FilterSidebar with series selection
   - Active Indicator Cards below map
   - Dropdown menu alignment fix
   - Map zoom adjustment
   - Grey bar elimination

---

## Troubleshooting

### Issue: Choropleth shows no data

**Diagnosis**:
```sql
-- Check if series exist
SELECT COUNT(*) FROM metadata.series_metadata WHERE geography_type = 'State';

-- Check if observations exist
SELECT COUNT(*) FROM timeseries.economic_observations WHERE series_id IN (
  SELECT series_id FROM metadata.series_metadata WHERE geography_type = 'State'
);
```

**Resolution**:
- If zero series: Run ingestion script
- If zero observations: Check FRED API key, re-run ingestion

### Issue: Some states show NULL values

**Diagnosis**:
```sql
-- Find states without data
SELECT g.name, g.geoid
FROM geospatial.us_states g
LEFT JOIN metadata.series_metadata sm ON g.geoid = sm.geography_id
WHERE sm.series_id IS NULL;
```

**Resolution**:
- Verify all FIPS codes in catalog match geospatial.us_states.geoid
- Check for typos in geography_id column

### Issue: Query performance slow

**Diagnosis**:
```sql
EXPLAIN ANALYZE
SELECT *
FROM geospatial.us_states g
LEFT JOIN metadata.series_metadata sm ON g.geoid = sm.geography_id
WHERE sm.geography_type = 'State';
```

**Resolution**:
- Ensure indexes exist: `idx_series_metadata_geography_composite`
- Consider materializing latest_observations as a view

---

## API Rate Limits

### FRED API
- **Limit**: 120 requests/minute
- **Strategy**: 1-second sleep between series (ingestion script handles this)
- **Total Time**: ~2 minutes for 102 series

### Statistics Canada
- **Limit**: Not specified, recommend 1 req/second
- **Status**: Not yet implemented (series inactive in catalog)

---

## Future Enhancements

### Priority 2 (Should-Have)
- US Real GDP by State (51 series)
- Canada Real GDP by Province (13 series)
- Canada Housing Price Index (10+ series)

### Priority 3 (Nice-to-Have)
- US Median Household Income (51 series)
- Labor Force data (64 series)
- Population data (13 series)

### Technical Improvements
- Migrate from Leaflet to deck.gl for better performance
- Add date selector for historical data
- Series comparison (multiple series on same map)
- Time-series animation (play through months)
- Export map as PNG/SVG

---

## References

- **FRED API Docs**: https://fred.stlouisfed.org/docs/api/fred/
- **Statistics Canada**: https://www.statcan.gc.ca/en/developers
- **PostGIS**: https://postgis.net/docs/
- **Leaflet**: https://leafletjs.com/reference.html
- **GeoJSON Spec**: https://geojson.org/

---

## Change Log

| Date | Change | Author |
|------|--------|--------|
| 2026-01-12 | Initial implementation with Priority 1 series | Claude Code |
| 2026-01-12 | Schema migration added geography_id column | Claude Code |
| 2026-01-12 | Choropleth API updated to query real data | Claude Code |
