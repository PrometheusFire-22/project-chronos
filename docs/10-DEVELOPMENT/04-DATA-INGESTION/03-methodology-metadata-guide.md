# Methodology Metadata Guide

## Overview

**Problem Solved**: Previously, our database couldn't distinguish between:
- Monthly vs 3-month moving average data
- Seasonally adjusted vs non-adjusted data
- Preliminary vs final data
- Different source table variants

This caused **Canadian territorial data to appear incorrect** because:
- Provinces use **monthly, seasonally adjusted** (Table 14-10-0287)
- Territories use **3-month moving average, seasonally adjusted** (Table 14-10-0292)

Without metadata tracking this, we couldn't tell them apart!

## Migration: 004_add_methodology_metadata.sql

**Alembic Migration**: `7f20cd5ba6ca_add_methodology_metadata_to_series.py`

**Jira**: CHRONOS-470

### New ENUM Types

```sql
-- Seasonal adjustment
'SA'    -- Seasonally adjusted
'NSA'   -- Not seasonally adjusted
'SAAR'  -- Seasonally adjusted annual rate
'NA'    -- Not applicable

-- Aggregation method
'MONTHLY', 'QUARTERLY', 'ANNUAL', 'DAILY', 'WEEKLY'
'3M_MA', '6M_MA', '12M_MA'  -- Moving averages
'YOY', 'MOM', 'QOQ'          -- Growth rates
'CUMULATIVE', 'OTHER'

-- Data variant
'FINAL', 'PRELIMINARY', 'REVISED', 'REAL_TIME', 'FORECAST', 'FLASH', 'STANDARD'
```

### New Columns Added

#### `metadata.data_catalogs` (catalog table)
| Column | Type | Purpose | Example |
|--------|------|---------|---------|
| `seasonal_adjustment` | ENUM | SA, NSA, etc. | `'SA'` |
| `aggregation_method` | ENUM | Monthly, 3M MA, etc. | `'3M_MA'` |
| `data_variant` | ENUM | Final, preliminary | `'FINAL'` |
| `source_table_id` | VARCHAR(50) | Source table/product ID | `'14100292'` |
| `methodology_notes` | TEXT | Free-text notes | `'3-month moving average per StatsCan'` |
| `api_endpoint` | TEXT | Full API URL | `'https://...'` |
| `last_verified_at` | TIMESTAMPTZ | When metadata verified | `'2026-01-29'` |

#### `metadata.series_metadata` (series table)
Same columns as above, plus:
| Column | Type | Purpose |
|--------|------|---------|
| `data_quality_score` | NUMERIC(3,2) | Quality from 0.0 to 1.0 |

### New Helper View: `metadata.series_comparability`

Identifies which series can be directly compared:

```sql
SELECT * FROM metadata.series_comparability
WHERE geography_1 = 'Ontario' AND geography_2 = 'Yukon';
```

**Returns**:
```
series_1          | series_2            | comparability_status
------------------+---------------------+--------------------------------
Ontario Unemp     | Yukon Unemp         | NOT_COMPARABLE_AGGREGATION
(Ontario monthly) | (Yukon 3-month MA)  | (Different aggregation methods)
```

### New Validation Function

```sql
SELECT * FROM metadata.validate_series_metadata();
```

**Returns**:
| series_name | issue_type | severity |
|-------------|------------|----------|
| Unemployment Rate - Yukon | MISSING_AGGREGATION_METHOD | HIGH |
| Ontario GDP | MISSING_SEASONAL_ADJ | HIGH |

---

## How to Use This

### 1. Apply the Migration

```bash
# SSH to production database server or use local connection
poetry run alembic upgrade head

# Verify migration applied
psql -h 16.52.210.100 -U chronos -d chronos -c "
  SELECT column_name
  FROM information_schema.columns
  WHERE table_name = 'series_metadata'
    AND column_name IN ('aggregation_method', 'seasonal_adjustment', 'source_table_id');
"
# Should return 3 rows
```

### 2. Update Existing Data

The migration **automatically updates**:
- ✅ Territorial series → marked as `3M_MA`, table `14100292`
- ✅ Provincial series → marked as `MONTHLY`, table `14100287`
- ✅ FRED series → marked as `MONTHLY`, `SA`
- ✅ Valet series → marked as `MONTHLY`, `SA`

### 3. Verify Updates

```sql
-- Check territorial data is marked correctly
SELECT
  source_series_id,
  series_name,
  geography,
  aggregation_method,
  seasonal_adjustment,
  source_table_id
FROM metadata.series_metadata
WHERE geography IN ('Yukon', 'Northwest Territories', 'Nunavut')
  AND category = 'Employment';
```

**Expected**:
```
source_series_id | series_name              | aggregation_method | source_table_id
-----------------+--------------------------+--------------------+-----------------
v2064894         | Unemployment - Yukon     | 3M_MA              | 14100292
v2065083         | Unemployment - NWT       | 3M_MA              | 14100292
v2065272         | Unemployment - Nunavut   | 3M_MA              | 14100292
```

### 4. Run Data Quality Validation

```sql
SELECT * FROM metadata.validate_series_metadata();
```

Should return **NO CRITICAL issues** after migration.

---

## Finding Correct Vector IDs

Now that we know territories need **3-month MA data**, we can search for the right vectors:

### Method 1: Check Source Table Directly

```bash
# Download StatsCan Table 14-10-0292 metadata
curl -s "https://www150.statcan.gc.ca/t1/wds/rest/getCubeMetadata" \
  -H "Content-Type: application/json" \
  -d '[{"productId": "14100292"}]' > table_14100292_metadata.json

# Search for "Unemployment rate" + "Yukon" combination
jq '.[] | .object.dimension[] | select(.dimensionNameEn == "Labour force characteristics")' table_14100292_metadata.json
```

### Method 2: Update data_catalogs with Correct Metadata

```sql
-- Mark the CURRENT vectors as incorrect/deprecated
UPDATE metadata.data_catalogs
SET
  aggregation_method = 'MONTHLY',  -- These are monthly, not 3M MA!
  methodology_notes = 'INCORRECT VECTOR - This is monthly data, not 3-month moving average. Do not use for territories.',
  seasonal_adjustment = 'NSA',     -- Likely unadjusted
  last_verified_at = NOW()
WHERE series_id IN ('v2064894', 'v2065083', 'v2065272');

-- Once correct vectors found, add them
INSERT INTO metadata.data_catalogs (
  source, series_id, title, frequency,
  seasonal_adjustment, aggregation_method, source_table_id,
  methodology_notes
) VALUES
  ('StatsCan', 'v####', 'Unemployment Rate - Yukon (3M MA)', 'Monthly',
   'SA', '3M_MA', '14100292',
   'Statistics Canada Table 14-10-0292-01: 3-month moving average, seasonally adjusted'),
  -- ... repeat for NWT and Nunavut
;
```

---

## Update Catalog CSV

After finding correct vectors, update `database/seeds/time-series_catalog.csv`:

```csv
# Old (wrong vectors - monthly data)
v2064894,StatsCan,Inactive,Unemployment Rate - Yukon (MONTHLY - DO NOT USE),Macro,Territory,Yukon,Monthly,Employment,Unemployment Rate

# New (correct vectors - 3-month MA)
v####,StatsCan,Active,Unemployment Rate - Yukon,Macro,Territory,Yukon,Monthly,Employment,Unemployment Rate
v####,StatsCan,Active,Unemployment Rate - Northwest Territories,Macro,Territory,Northwest Territories,Monthly,Employment,Unemployment Rate
v####,StatsCan,Active,Unemployment Rate - Nunavut,Macro,Territory,Nunavut,Monthly,Employment,Unemployment Rate
```

**Note**: `frequency` stays "Monthly" because observations are monthly, but `aggregation_method` in database is `'3M_MA'`.

---

## API Updates

### FastAPI Endpoint Enhancement

Update `/api/geo/choropleth` to return methodology metadata:

```python
# apps/chronos-api/src/chronos/api/routers/geo.py

@router.get("/api/geo/choropleth")
async def get_choropleth_data(metric: str, mode: str):
    if mode == "data":
        query = """
            SELECT
                b.name,
                b.country,
                d.value,
                sm.aggregation_method,
                sm.seasonal_adjustment,
                sm.source_table_id,
                CASE
                    WHEN sm.aggregation_method = '3M_MA'
                    THEN d.value || ' (3-month avg)'
                    ELSE d.value || ''
                END as display_value
            FROM geo_boundaries b
            LEFT JOIN metadata.series_metadata sm ON b.name = sm.geography
            LEFT JOIN timeseries.economic_observations d ON sm.series_id = d.series_id
            WHERE sm.category = 'Employment'
              AND d.observation_date = (SELECT MAX(observation_date) ...)
        """
```

### Frontend Display

Show methodology metadata in tooltips:

```typescript
// apps/web/components/analytics/map/GeospatialMapLibre.tsx

const tooltipContent = `
  <strong>${feature.properties.name}</strong><br/>
  Unemployment: ${feature.properties.value}%
  ${feature.properties.aggregation_method === '3M_MA' ? '<br/><em>(3-month average)</em>' : ''}
  <br/><small>Source: StatsCan ${feature.properties.source_table_id}</small>
`;
```

---

## Data Quality Checks

### Run After Every Ingestion

```sql
-- Check for missing methodology metadata
SELECT
  series_id,
  series_name,
  geography,
  CASE
    WHEN aggregation_method IS NULL THEN 'Missing aggregation_method'
    WHEN seasonal_adjustment IS NULL THEN 'Missing seasonal_adjustment'
    WHEN source_table_id IS NULL THEN 'Missing source_table_id'
  END as issue
FROM metadata.series_metadata
WHERE is_active = true
  AND (aggregation_method IS NULL OR seasonal_adjustment IS NULL);
```

### Check for Comparability Issues

```sql
-- Find series being compared that shouldn't be
SELECT
  s1.geography as geo1,
  s2.geography as geo2,
  s1.aggregation_method as method1,
  s2.aggregation_method as method2,
  'INCOMPARABLE' as warning
FROM metadata.series_metadata s1
CROSS JOIN metadata.series_metadata s2
WHERE s1.category = 'Employment'
  AND s2.category = 'Employment'
  AND s1.geography IN ('Ontario', 'Alberta')  -- Provinces
  AND s2.geography IN ('Yukon', 'Nunavut')    -- Territories
  AND s1.aggregation_method != s2.aggregation_method;
```

---

## Next Steps

1. **Find Correct Vectors**: Search StatsCan Table 14-10-0292 for proper 3-month MA unemployment vectors
2. **Update Catalog**: Replace v2064894, v2065083, v2065272 with correct vectors
3. **Re-ingest**: Run ingestion with correct vectors
4. **Verify Map**: Check that territorial values match official StatsCan website (Yukon 4.3%, NWT 4.2%, Nunavut 15.4%)
5. **Update API**: Add methodology metadata to API responses
6. **Update Frontend**: Display methodology notes in tooltips

---

## References

- **Migration File**: `database/migrations/004_add_methodology_metadata.sql`
- **Alembic Revision**: `7f20cd5ba6ca`
- **Jira Ticket**: CHRONOS-470
- **StatsCan Provincial Table**: 14-10-0287-01
- **StatsCan Territorial Table**: 14-10-0292-01
