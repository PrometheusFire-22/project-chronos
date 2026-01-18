# Geospatial Performance Optimization - Manual Migration

## Context
This document describes the one-time manual SQL migration needed to optimize geospatial map performance. This is being done manually due to current infrastructure constraints (no CI/CD, limited server resources).

## SQL Migration Script

Run this directly on the production database via Docker:

```bash
ssh chronos-prod "docker exec chronos-db psql -U chronos -d chronos" << 'EOF'
-- Create materialized view with pre-simplified geometries
CREATE MATERIALIZED VIEW IF NOT EXISTS analytics.mv_choropleth_boundaries AS
SELECT 
    us_states."NAME" AS region_name,
    'US'::text AS country_code,
    st_simplifypreservetopology(us_states.geometry::geometry, 0.05::double precision) AS geometry
FROM geospatial.us_states
UNION ALL
SELECT 
    ca_provinces."PRENAME" AS region_name,
    'CA'::text AS country_code,
    st_simplifypreservetopology(ca_provinces.geometry::geometry, 0.05::double precision) AS geometry
FROM geospatial.ca_provinces;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_mv_choropleth_name 
ON analytics.mv_choropleth_boundaries (region_name);

CREATE INDEX IF NOT EXISTS idx_mv_choropleth_geom 
ON analytics.mv_choropleth_boundaries 
USING GIST (geometry);

-- Verify creation
SELECT COUNT(*) as row_count FROM analytics.mv_choropleth_boundaries;
EOF
```

## Verification

After running the migration:

1. **Verify materialized view exists:**
   ```bash
   ssh chronos-prod "docker exec chronos-db psql -U chronos -d chronos -c \"SELECT COUNT(*) FROM analytics.mv_choropleth_boundaries;\""
   ```
   Expected: ~60 rows (50 US states + 13 Canadian provinces/territories)

2. **Test API endpoint:**
   ```bash
   curl -w "\nTime: %{time_total}s\n" https://api.automatonicai.com/api/geo/choropleth?mode=boundaries
   ```
   Expected: < 500ms response time

3. **Test in browser:**
   Navigate to `https://automatonicai.com/analytics/geospatial` and verify map loads without 504 errors.

## Rollback

If needed, drop the materialized view:

```sql
DROP MATERIALIZED VIEW IF EXISTS analytics.mv_choropleth_boundaries CASCADE;
```

## Future State

This manual migration will be replaced by proper Alembic migrations once CI/CD is set up (see Jira tickets for CI/CD and staging environment).
