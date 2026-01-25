# Database Schema Audit Report

**Date**: 2026-01-24  
**Ticket**: CHRONOS-452  
**Branch**: `feature/chronos-452-schema-audit`

---

## Executive Summary

Project Chronos database consists of **5 application schemas** containing **19 tables** and **4 materialized views**. The database is well-structured with proper foreign key relationships, comprehensive indexing, and separation of concerns across schemas.

### Key Findings

✅ **Strengths**:
- Clear schema separation by domain (metadata, timeseries, analytics, geospatial, economic_graph)
- Proper foreign key constraints in metadata schema
- Comprehensive indexing strategy (42 indexes across all schemas)
- TimescaleDB hypertable for time-series data
- PostGIS spatial indexes for geospatial queries

⚠️ **Areas for Improvement**:
- No foreign key from `timeseries.economic_observations` to `metadata.series_metadata`
- Duplicate geometry indexes on some geospatial tables
- `backup_test` table in public schema (legacy)
- Missing table/column descriptions (pg_description)

---

## Schema Overview

| Schema | Tables | Views | Purpose | Status |
|--------|--------|-------|---------|--------|
| **metadata** | 4 | 0 | Series metadata, data sources, ingestion tracking | ✅ Active |
| **timeseries** | 1 | 0 | Economic observations (hypertable) | ✅ Active |
| **analytics** | 0 | 4 | Analytical views and dashboards | ✅ Active |
| **geospatial** | 8 | 0 | Geographic boundaries and shapes | ✅ Active |
| **economic_graph** | 2 | 0 | Graph database (Apache AGE) | ✅ Active |

---

## Metadata Schema

### Tables

#### 1. `data_sources`
**Purpose**: Catalog of external data providers

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| source_id | text | NO | - | Primary key |
| source_name | text | YES | - | Display name |
| api_endpoint | text | YES | - | API URL |
| api_key_required | boolean | YES | false | Whether API key needed |
| rate_limit_per_minute | integer | YES | - | Rate limiting |
| last_successful_fetch | timestamp with time zone | YES | - | Last successful API call |
| created_at | timestamp with time zone | YES | CURRENT_TIMESTAMP | - |
| updated_at | timestamp with time zone | YES | CURRENT_TIMESTAMP | - |

**Indexes**:
- `data_sources_pkey` (UNIQUE) on `source_id`

---

#### 2. `series_metadata`
**Purpose**: Metadata for all economic time series

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| series_id | integer | NO | nextval(...) | Primary key |
| source_id | text | NO | - | FK to data_sources |
| source_series_id | text | NO | - | External series ID |
| series_name | text | YES | - | Display name |
| frequency | text | YES | - | Data frequency (daily, monthly, etc.) |
| units | text | YES | - | Measurement units |
| seasonal_adjustment | text | YES | - | Seasonal adjustment type |
| last_updated | timestamp with time zone | YES | - | Last data update |
| created_at | timestamp with time zone | YES | CURRENT_TIMESTAMP | - |
| updated_at | timestamp with time zone | YES | CURRENT_TIMESTAMP | - |
| geography_type | text | YES | - | Geographic level |
| geography_id | text | YES | - | Geographic identifier |

**Indexes**:
- `series_metadata_pkey` (UNIQUE) on `series_id`
- `series_metadata_source_id_source_series_id_key` (UNIQUE) on `source_id, source_series_id`
- `idx_series_source` on `source_id`

**Foreign Keys**:
- `source_id` → `data_sources.source_id`

---

#### 3. `ingestion_log`
**Purpose**: Track data ingestion history and status

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| log_id | integer | NO | nextval(...) | Primary key |
| source_id | text | YES | - | FK to data_sources |
| series_id | integer | YES | - | FK to series_metadata |
| ingestion_timestamp | timestamp with time zone | YES | CURRENT_TIMESTAMP | When ingestion occurred |
| status | text | YES | - | success/failure/partial |
| records_inserted | integer | YES | - | Number of records added |
| error_message | text | YES | - | Error details if failed |

**Indexes**:
- `ingestion_log_pkey` (UNIQUE) on `log_id`

**Foreign Keys**:
- `source_id` → `data_sources.source_id`
- `series_id` → `series_metadata.series_id`

---

#### 4. `schema_version`
**Purpose**: Track database schema migrations

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| version_id | integer | NO | nextval(...) | Primary key |
| version_number | text | NO | - | Version identifier |
| description | text | YES | - | Migration description |
| applied_at | timestamp with time zone | YES | CURRENT_TIMESTAMP | When applied |

**Indexes**:
- `schema_version_pkey` (UNIQUE) on `version_id`

---

## Timeseries Schema

### Tables

#### 1. `economic_observations`
**Purpose**: Time-series data for all economic indicators (TimescaleDB hypertable)

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | integer | NO | nextval(...) | Primary key |
| series_id | integer | NO | - | Reference to series_metadata |
| observation_date | date | NO | - | Date of observation |
| value | numeric | YES | - | Observed value |
| quality_flag | text | YES | - | Data quality indicator |
| created_at | timestamp with time zone | YES | CURRENT_TIMESTAMP | - |
| updated_at | timestamp with time zone | YES | CURRENT_TIMESTAMP | - |

**Indexes**:
- `economic_observations_pkey` (UNIQUE) on `id, observation_date`
- `idx_series_date_unique` (UNIQUE) on `series_id, observation_date`
- `economic_observations_observation_date_idx` on `observation_date DESC`
- `idx_obs_date` on `observation_date DESC`
- `idx_obs_value` on `value` WHERE value IS NOT NULL

**Foreign Keys**: ⚠️ **MISSING** - No FK to `metadata.series_metadata`

---

## Analytics Schema

### Materialized Views

#### 1. `data_quality_dashboard`
Aggregated data quality metrics per series

#### 2. `fx_rates_normalized`
Normalized foreign exchange rates

#### 3. `mv_choropleth_boundaries`
Geospatial boundaries for choropleth maps

**Indexes**:
- `idx_mv_choropleth_geom` (GIST) on `geometry`
- `idx_mv_choropleth_name` on `region_name`

#### 4. `observations_analytics_view`
Analytical view of observations (also in public schema)

---

## Geospatial Schema

### Tables

All geospatial tables use PostGIS geometry types with GIST indexes:

1. `ca_census_divisions` - Canadian census divisions
2. `ca_census_subdivisions` - Canadian census subdivisions
3. `ca_cma` - Canadian Census Metropolitan Areas
4. `ca_provinces` - Canadian provinces
5. `us_cbsa` - US Core-Based Statistical Areas
6. `us_counties` - US counties
7. `us_states` - US states
8. `world_countries` - World countries

**Common Pattern**:
- All have `geometry` column (PostGIS)
- All have GIST spatial indexes
- ⚠️ Some have duplicate indexes (e.g., `idx_*_geom` and `idx_*_geometry`)

---

## Economic Graph Schema

### Tables

1. `_ag_label_edge` - Apache AGE graph edges
2. `_ag_label_vertex` - Apache AGE graph vertices

These are managed by Apache AGE extension for graph database functionality.

---

## Data Quality Analysis

### Foreign Key Integrity

✅ **Metadata Schema**: All foreign keys properly defined
- `series_metadata.source_id` → `data_sources.source_id`
- `ingestion_log.source_id` → `data_sources.source_id`
- `ingestion_log.series_id` → `series_metadata.series_id`

⚠️ **Missing Constraint**:
```sql
-- Recommended: Add FK from timeseries to metadata
ALTER TABLE timeseries.economic_observations
ADD CONSTRAINT fk_observations_series
FOREIGN KEY (series_id) REFERENCES metadata.series_metadata(series_id);
```

### Index Analysis

**Total Indexes**: 42 across all schemas

**Duplicate Indexes Found**:
- `geospatial.ca_census_divisions`: `idx_ca_census_divisions_geom` + `idx_ca_census_divisions_geometry`
- `geospatial.ca_census_subdivisions`: `idx_ca_census_subdivisions_geom` + `idx_ca_census_subdivisions_geometry`
- `timeseries.economic_observations`: `economic_observations_observation_date_idx` + `idx_obs_date`

**Recommendation**: Remove duplicate indexes to reduce storage and maintenance overhead.

---

## Legacy Tables Identified

### Public Schema

1. **`backup_test`** - Test table, safe to remove
2. **Directus tables** (27 tables) - Keep, actively used by CMS
3. **CMS tables** (20 tables) - Keep, actively used
4. **User tables** (2 tables) - Keep, actively used

---

## Performance Recommendations

### 1. Add Missing Foreign Key
```sql
ALTER TABLE timeseries.economic_observations
ADD CONSTRAINT fk_observations_series
FOREIGN KEY (series_id) REFERENCES metadata.series_metadata(series_id)
ON DELETE CASCADE;
```

### 2. Remove Duplicate Indexes
```sql
-- Geospatial schema
DROP INDEX IF EXISTS geospatial.idx_ca_census_divisions_geometry;
DROP INDEX IF EXISTS geospatial.idx_ca_census_subdivisions_geometry;

-- Timeseries schema (keep the more descriptive name)
DROP INDEX IF EXISTS timeseries.idx_obs_date;
```

### 3. Add Table Descriptions
```sql
-- Example
COMMENT ON TABLE metadata.series_metadata IS 'Metadata for all economic time series tracked in the system';
COMMENT ON COLUMN metadata.series_metadata.series_id IS 'Unique identifier for the series';
```

### 4. Consider Partitioning
For `timeseries.economic_observations`, consider partitioning by date range if data volume grows significantly (currently using TimescaleDB hypertable which handles this).

---

## Next Steps

1. ✅ Schema audit complete
2. ⏭️ Create ER diagrams (see `schema-diagrams/` directory)
3. ⏭️ Implement performance recommendations
4. ⏭️ Proceed with CHRONOS-443 (Remove Legacy Tables)
5. ⏭️ Proceed with CHRONOS-441 (Consolidate Schemas)
6. ⏭️ Proceed with CHRONOS-444 (Rename/Organize)
