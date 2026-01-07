-- ============================================================================
-- Economic Observations View for Directus
-- ============================================================================
-- Purpose: Provide Directus-compatible read-only access to economic_observations
-- Reason: TimescaleDB partitioned table has composite PK which Directus cannot manage
-- Solution: View with synthetic primary key (ROW_NUMBER) for Directus compatibility
-- ============================================================================

-- Drop existing view if present
DROP VIEW IF EXISTS analytics.economic_observations_view CASCADE;

-- Create view with synthetic primary key
CREATE OR REPLACE VIEW analytics.economic_observations_view AS
SELECT
    -- Synthetic primary key (required by Directus)
    ROW_NUMBER() OVER (ORDER BY eo.observation_date DESC, eo.series_id) as view_id,
    
    -- Core observation data
    eo.series_id,
    eo.observation_date,
    eo.value,
    eo.quality_flag,
    
    -- Enriched metadata from series_metadata
    sm.series_name,
    sm.source_series_id,
    sm.geography,
    sm.units,
    sm.frequency,
    sm.seasonal_adjustment,
    
    -- Data source information
    ds.source_name
    
FROM timeseries.economic_observations eo
JOIN metadata.series_metadata sm ON eo.series_id = sm.series_id
JOIN metadata.data_sources ds ON sm.source_id = ds.source_id
WHERE sm.is_active = TRUE
ORDER BY eo.observation_date DESC, eo.series_id;

-- Add helpful comment
COMMENT ON VIEW analytics.economic_observations_view IS
'Read-only view of economic observations for Directus dashboard access.

Features:
- Synthetic primary key (view_id) for Directus compatibility
- Enriched with series metadata (name, geography, units, frequency)
- Includes data source information
- Filtered to active series only
- Ordered by date (newest first) for dashboard performance

Usage:
- Register this view in Directus as "economic_observations_view"
- Use for dashboards, charts, and data exploration
- Data writes should go directly to timeseries.economic_observations table

Note: This view is read-only. All data ingestion should continue to use
the partitioned timeseries.economic_observations table directly.';

-- Grant read permissions (adjust based on your access control)
-- GRANT SELECT ON analytics.economic_observations_view TO directus_user;
-- GRANT SELECT ON analytics.economic_observations_view TO analytics_readonly;
