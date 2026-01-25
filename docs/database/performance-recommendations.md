# Database Performance Recommendations

**Date**: 2026-01-24  
**Ticket**: CHRONOS-452  
**Based on**: Schema Audit Report

---

## Priority 1: Critical Issues

### 1.1 Add Missing Foreign Key Constraint

**Issue**: `timeseries.economic_observations` has no foreign key to `metadata.series_metadata`

**Impact**:
- Risk of orphaned observations
- No referential integrity enforcement
- Potential data inconsistency

**Solution**:
```sql
-- First, check for orphaned records
SELECT DISTINCT eo.series_id
FROM timeseries.economic_observations eo
LEFT JOIN metadata.series_metadata sm ON eo.series_id = sm.series_id
WHERE sm.series_id IS NULL;

-- If no orphaned records, add the constraint
ALTER TABLE timeseries.economic_observations
ADD CONSTRAINT fk_observations_series
FOREIGN KEY (series_id) 
REFERENCES metadata.series_metadata(series_id)
ON DELETE CASCADE;
```

**Estimated Impact**: High data integrity improvement, minimal performance impact

---

## Priority 2: Index Optimization

### 2.1 Remove Duplicate Indexes

**Issue**: Multiple duplicate indexes consuming unnecessary storage

**Duplicates Identified**:

#### Geospatial Schema
```sql
-- ca_census_divisions has two identical geometry indexes
DROP INDEX IF EXISTS geospatial.idx_ca_census_divisions_geometry;
-- Keep: idx_ca_census_divisions_geom

-- ca_census_subdivisions has two identical geometry indexes
DROP INDEX IF EXISTS geospatial.idx_ca_census_subdivisions_geometry;
-- Keep: idx_ca_census_subdivisions_geom
```

#### Timeseries Schema
```sql
-- Two identical indexes on observation_date
DROP INDEX IF EXISTS timeseries.idx_obs_date;
-- Keep: economic_observations_observation_date_idx (more descriptive name)
```

**Estimated Impact**:
- Storage savings: ~5-10% reduction in index storage
- Faster writes: Fewer indexes to maintain
- Simpler maintenance

---

## Priority 3: Documentation

### 3.1 Add Table and Column Descriptions

**Issue**: No PostgreSQL comments on tables/columns

**Solution**:
```sql
-- Metadata schema
COMMENT ON SCHEMA metadata IS 'Series metadata, data sources, and ingestion tracking';

COMMENT ON TABLE metadata.data_sources IS 'Catalog of external economic data providers (FRED, BLS, etc.)';
COMMENT ON COLUMN metadata.data_sources.source_id IS 'Unique identifier for the data source (e.g., FRED, BLS)';
COMMENT ON COLUMN metadata.data_sources.rate_limit_per_minute IS 'API rate limit to avoid throttling';

COMMENT ON TABLE metadata.series_metadata IS 'Metadata for all economic time series tracked in the system';
COMMENT ON COLUMN metadata.series_metadata.series_id IS 'Internal unique identifier for the series';
COMMENT ON COLUMN metadata.series_metadata.source_series_id IS 'External series ID from the data provider';
COMMENT ON COLUMN metadata.series_metadata.frequency IS 'Data frequency: daily, weekly, monthly, quarterly, annual';

COMMENT ON TABLE metadata.ingestion_log IS 'Audit trail of all data ingestion attempts';
COMMENT ON COLUMN metadata.ingestion_log.status IS 'Ingestion status: success, failure, partial';

-- Timeseries schema
COMMENT ON SCHEMA timeseries IS 'Time-series economic observations (TimescaleDB hypertable)';

COMMENT ON TABLE timeseries.economic_observations IS 'Time-series data for all economic indicators';
COMMENT ON COLUMN timeseries.economic_observations.quality_flag IS 'Data quality indicator: preliminary, revised, final';
```

**Estimated Impact**: Improved developer experience, better schema documentation

---

## Priority 4: Query Optimization

### 4.1 Analyze Common Query Patterns

**Recommendation**: Run `EXPLAIN ANALYZE` on common queries to identify bottlenecks

**Common Query Patterns**:

#### 1. Fetch latest observations for a series
```sql
EXPLAIN ANALYZE
SELECT observation_date, value
FROM timeseries.economic_observations
WHERE series_id = 123
ORDER BY observation_date DESC
LIMIT 100;
```

**Current Performance**: ✅ Optimized with `idx_series_date_unique`

#### 2. Geospatial choropleth queries
```sql
EXPLAIN ANALYZE
SELECT region_name, geometry
FROM analytics.mv_choropleth_boundaries
WHERE region_name LIKE 'California%';
```

**Current Performance**: ✅ Optimized with `idx_mv_choropleth_name`

#### 3. Data quality dashboard
```sql
EXPLAIN ANALYZE
SELECT * FROM analytics.data_quality_dashboard
WHERE freshness_status = 'stale';
```

**Recommendation**: Add index on `freshness_status` if this query is frequent

---

## Priority 5: Maintenance Tasks

### 5.1 Regular VACUUM and ANALYZE

**Recommendation**:
```sql
-- Run weekly
VACUUM ANALYZE timeseries.economic_observations;
VACUUM ANALYZE metadata.series_metadata;

-- Check for bloat
SELECT schemaname, tablename, 
       pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
FROM pg_tables
WHERE schemaname IN ('metadata', 'timeseries', 'analytics')
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
```

### 5.2 Refresh Materialized Views

**Current Views**:
- `analytics.data_quality_dashboard`
- `analytics.fx_rates_normalized`
- `analytics.mv_choropleth_boundaries`

**Recommendation**:
```sql
-- Refresh daily or after significant data ingestion
REFRESH MATERIALIZED VIEW CONCURRENTLY analytics.data_quality_dashboard;
REFRESH MATERIALIZED VIEW CONCURRENTLY analytics.fx_rates_normalized;
REFRESH MATERIALIZED VIEW CONCURRENTLY analytics.mv_choropleth_boundaries;
```

---

## Priority 6: Future Considerations

### 6.1 Partitioning Strategy

**Current**: `timeseries.economic_observations` uses TimescaleDB hypertable (automatic partitioning)

**Recommendation**: Monitor partition sizes and adjust chunk interval if needed
```sql
-- Check current chunk interval
SELECT * FROM timescaledb_information.dimensions
WHERE hypertable_name = 'economic_observations';

-- Adjust if needed (example: change to monthly chunks)
SELECT set_chunk_time_interval('timeseries.economic_observations', INTERVAL '1 month');
```

### 6.2 Connection Pooling

**Recommendation**: Use PgBouncer or similar for connection pooling if not already implemented

### 6.3 Read Replicas

**Consideration**: If analytics queries impact write performance, consider read replicas for:
- Analytics views
- Geospatial queries
- Dashboard queries

---

## Implementation Plan

### Phase 1: Critical (This Sprint)
- [ ] Add missing foreign key constraint
- [ ] Remove duplicate indexes
- [ ] Add table/column descriptions

### Phase 2: Optimization (Next Sprint)
- [ ] Analyze query patterns
- [ ] Set up automated VACUUM/ANALYZE
- [ ] Implement materialized view refresh schedule

### Phase 3: Monitoring (Ongoing)
- [ ] Monitor query performance
- [ ] Track table sizes and bloat
- [ ] Review partition strategy

---

## Monitoring Queries

### Check Index Usage
```sql
SELECT schemaname, tablename, indexname, idx_scan, idx_tup_read, idx_tup_fetch
FROM pg_stat_user_indexes
WHERE schemaname IN ('metadata', 'timeseries', 'analytics')
ORDER BY idx_scan DESC;
```

### Check Table Sizes
```sql
SELECT schemaname, tablename,
       pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS total_size,
       pg_size_pretty(pg_relation_size(schemaname||'.'||tablename)) AS table_size,
       pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename) - pg_relation_size(schemaname||'.'||tablename)) AS index_size
FROM pg_tables
WHERE schemaname IN ('metadata', 'timeseries', 'analytics')
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
```

### Check Slow Queries (requires pg_stat_statements)
```sql
SELECT query, calls, total_exec_time, mean_exec_time, max_exec_time
FROM pg_stat_statements
WHERE query LIKE '%economic_observations%'
ORDER BY mean_exec_time DESC
LIMIT 10;
```
