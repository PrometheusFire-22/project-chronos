-- Migration 004: Add Methodology Metadata
-- Purpose: Track critical data methodology (seasonal adjustment, aggregation method, source table)
-- Date: 2026-01-29
-- Jira: CHRONOS-470

-- ============================================================================
-- PART 1: Create ENUM types for controlled vocabulary
-- ============================================================================

-- Seasonal adjustment type
CREATE TYPE metadata.seasonal_adjustment_enum AS ENUM (
    'SA',              -- Seasonally adjusted
    'NSA',             -- Not seasonally adjusted
    'SAAR',            -- Seasonally adjusted annual rate
    'NA'               -- Not applicable
);

-- Aggregation method (how data is calculated/averaged)
CREATE TYPE metadata.aggregation_method_enum AS ENUM (
    'MONTHLY',         -- Monthly observations
    'QUARTERLY',       -- Quarterly observations
    'ANNUAL',          -- Annual observations
    'DAILY',           -- Daily observations
    'WEEKLY',          -- Weekly observations
    '3M_MA',           -- 3-month moving average
    '6M_MA',           -- 6-month moving average
    '12M_MA',          -- 12-month moving average
    'YOY',             -- Year-over-year
    'MOM',             -- Month-over-month
    'QOQ',             -- Quarter-over-quarter
    'CUMULATIVE',      -- Cumulative (e.g., YTD)
    'OTHER'            -- Other aggregation method
);

-- Data variant (for distinguishing preliminary vs final, etc.)
CREATE TYPE metadata.data_variant_enum AS ENUM (
    'FINAL',           -- Final/official data
    'PRELIMINARY',     -- Preliminary estimate
    'REVISED',         -- Revised from preliminary
    'REAL_TIME',       -- Real-time/nowcast
    'FORECAST',        -- Forecasted values
    'FLASH',           -- Flash estimate (very preliminary)
    'STANDARD'         -- Standard/default variant
);

-- ============================================================================
-- PART 2: Add columns to metadata.data_catalogs
-- ============================================================================

ALTER TABLE metadata.data_catalogs
  ADD COLUMN seasonal_adjustment metadata.seasonal_adjustment_enum DEFAULT 'SA',
  ADD COLUMN aggregation_method metadata.aggregation_method_enum DEFAULT 'MONTHLY',
  ADD COLUMN data_variant metadata.data_variant_enum DEFAULT 'STANDARD',
  ADD COLUMN source_table_id VARCHAR(50),  -- e.g., "14100292" for StatsCan tables
  ADD COLUMN methodology_notes TEXT,       -- Free-text notes about calculation methodology
  ADD COLUMN api_endpoint TEXT,            -- Full API endpoint URL if applicable
  ADD COLUMN last_verified_at TIMESTAMPTZ; -- When metadata was last verified as correct

-- Add indexes for common queries
CREATE INDEX idx_data_catalogs_seasonal_adj ON metadata.data_catalogs(seasonal_adjustment);
CREATE INDEX idx_data_catalogs_aggregation ON metadata.data_catalogs(aggregation_method);
CREATE INDEX idx_data_catalogs_source_table ON metadata.data_catalogs(source_table_id);

-- Add comments for documentation
COMMENT ON COLUMN metadata.data_catalogs.seasonal_adjustment IS 'Whether data is seasonally adjusted (SA), not seasonally adjusted (NSA), etc.';
COMMENT ON COLUMN metadata.data_catalogs.aggregation_method IS 'How data is aggregated: monthly, 3-month moving average, etc.';
COMMENT ON COLUMN metadata.data_catalogs.data_variant IS 'Data variant: final, preliminary, revised, etc.';
COMMENT ON COLUMN metadata.data_catalogs.source_table_id IS 'Source system table/product ID (e.g., StatsCan table 14100292)';
COMMENT ON COLUMN metadata.data_catalogs.methodology_notes IS 'Free-text notes about calculation methodology, caveats, or special considerations';
COMMENT ON COLUMN metadata.data_catalogs.api_endpoint IS 'Full API endpoint URL for fetching this series';

-- ============================================================================
-- PART 3: Enhance metadata.series_metadata
-- ============================================================================

-- Convert existing text seasonal_adjustment to enum
-- First, update existing values to match enum
UPDATE metadata.series_metadata
SET seasonal_adjustment = CASE
  WHEN seasonal_adjustment ILIKE '%seasonally adjusted%' THEN 'SA'
  WHEN seasonal_adjustment ILIKE '%not seasonally%' THEN 'NSA'
  WHEN seasonal_adjustment ILIKE '%unadjusted%' THEN 'NSA'
  ELSE NULL
END;

-- Drop old text column and add enum column
ALTER TABLE metadata.series_metadata
  DROP COLUMN IF EXISTS seasonal_adjustment,
  ADD COLUMN seasonal_adjustment metadata.seasonal_adjustment_enum DEFAULT 'SA',
  ADD COLUMN aggregation_method metadata.aggregation_method_enum DEFAULT 'MONTHLY',
  ADD COLUMN data_variant metadata.data_variant_enum DEFAULT 'STANDARD',
  ADD COLUMN source_table_id VARCHAR(50),
  ADD COLUMN methodology_notes TEXT,
  ADD COLUMN data_quality_score NUMERIC(3,2) CHECK (data_quality_score >= 0 AND data_quality_score <= 1.0),
  ADD COLUMN last_verified_at TIMESTAMPTZ;

-- Add indexes
CREATE INDEX idx_series_metadata_seasonal_adj ON metadata.series_metadata(seasonal_adjustment);
CREATE INDEX idx_series_metadata_aggregation ON metadata.series_metadata(aggregation_method);
CREATE INDEX idx_series_metadata_source_table ON metadata.series_metadata(source_table_id);

-- Add comments
COMMENT ON COLUMN metadata.series_metadata.seasonal_adjustment IS 'Whether data is seasonally adjusted (SA), not seasonally adjusted (NSA), etc.';
COMMENT ON COLUMN metadata.series_metadata.aggregation_method IS 'How data is aggregated: monthly, 3-month moving average, etc.';
COMMENT ON COLUMN metadata.series_metadata.data_variant IS 'Data variant: final, preliminary, revised, etc.';
COMMENT ON COLUMN metadata.series_metadata.source_table_id IS 'Source system table/product ID (e.g., StatsCan table 14100292, FRED series)';
COMMENT ON COLUMN metadata.series_metadata.methodology_notes IS 'Free-text notes about calculation methodology, caveats, or special considerations';
COMMENT ON COLUMN metadata.series_metadata.data_quality_score IS 'Data quality score from 0.0 (poor) to 1.0 (excellent) based on completeness, timeliness, accuracy';

-- ============================================================================
-- PART 4: Update existing data with known methodology
-- ============================================================================

-- Mark territorial data as 3-month moving average
UPDATE metadata.series_metadata
SET
  aggregation_method = '3M_MA',
  source_table_id = '14100292',
  methodology_notes = 'Statistics Canada Table 14-10-0292-01: Labour force characteristics by territory, three-month moving average, seasonally adjusted',
  seasonal_adjustment = 'SA'
WHERE geography IN ('Yukon', 'Northwest Territories', 'Nunavut')
  AND category = 'Employment'
  AND source_id IN (SELECT source_id FROM metadata.data_sources WHERE source_name = 'Statistics Canada');

-- Mark provincial data as monthly
UPDATE metadata.series_metadata
SET
  aggregation_method = 'MONTHLY',
  source_table_id = '14100287',
  methodology_notes = 'Statistics Canada Table 14-10-0287-01: Labour force characteristics by province, monthly, seasonally adjusted',
  seasonal_adjustment = 'SA'
WHERE geography IN ('Alberta', 'British Columbia', 'Manitoba', 'New Brunswick',
                   'Newfoundland and Labrador', 'Nova Scotia', 'Ontario',
                   'Prince Edward Island', 'Québec', 'Saskatchewan')
  AND category = 'Employment'
  AND source_id IN (SELECT source_id FROM metadata.data_sources WHERE source_name = 'Statistics Canada');

-- Mark FRED data as monthly seasonally adjusted (most common)
UPDATE metadata.series_metadata
SET
  aggregation_method = 'MONTHLY',
  seasonal_adjustment = 'SA'
WHERE source_id IN (SELECT source_id FROM metadata.data_sources WHERE source_name LIKE '%FRED%')
  AND frequency = 'Monthly'
  AND aggregation_method IS NULL;

-- Mark Valet data as monthly
UPDATE metadata.series_metadata
SET
  aggregation_method = 'MONTHLY',
  seasonal_adjustment = 'SA'
WHERE source_id IN (SELECT source_id FROM metadata.data_sources WHERE source_name = 'Bank of Canada Valet API')
  AND frequency IN ('Monthly', 'Daily')
  AND aggregation_method IS NULL;

-- ============================================================================
-- PART 5: Create helper view for data comparability
-- ============================================================================

CREATE OR REPLACE VIEW metadata.series_comparability AS
SELECT
  sm1.series_id as series_id_1,
  sm2.series_id as series_id_2,
  sm1.series_name as series_1,
  sm2.series_name as series_2,
  sm1.geography as geography_1,
  sm2.geography as geography_2,
  CASE
    WHEN sm1.aggregation_method = sm2.aggregation_method
     AND sm1.seasonal_adjustment = sm2.seasonal_adjustment
     AND sm1.frequency = sm2.frequency
    THEN 'DIRECTLY_COMPARABLE'
    WHEN sm1.seasonal_adjustment != sm2.seasonal_adjustment
    THEN 'NOT_COMPARABLE_SEASONAL_ADJ'
    WHEN sm1.aggregation_method != sm2.aggregation_method
    THEN 'NOT_COMPARABLE_AGGREGATION'
    WHEN sm1.frequency != sm2.frequency
    THEN 'NOT_COMPARABLE_FREQUENCY'
    ELSE 'UNKNOWN'
  END as comparability_status,
  sm1.seasonal_adjustment as seasonal_adj_1,
  sm2.seasonal_adjustment as seasonal_adj_2,
  sm1.aggregation_method as aggregation_1,
  sm2.aggregation_method as aggregation_2,
  sm1.frequency as frequency_1,
  sm2.frequency as frequency_2
FROM metadata.series_metadata sm1
CROSS JOIN metadata.series_metadata sm2
WHERE sm1.series_id < sm2.series_id  -- Avoid duplicates
  AND sm1.category = sm2.category;   -- Only compare same category

COMMENT ON VIEW metadata.series_comparability IS 'Helper view to identify which series can be directly compared based on methodology';

-- ============================================================================
-- PART 6: Add data quality validation function
-- ============================================================================

CREATE OR REPLACE FUNCTION metadata.validate_series_metadata()
RETURNS TABLE (
  series_id INTEGER,
  series_name TEXT,
  issue_type TEXT,
  issue_description TEXT,
  severity TEXT
) AS $$
BEGIN
  -- Check for missing methodology metadata
  RETURN QUERY
  SELECT
    sm.series_id,
    sm.series_name,
    'MISSING_AGGREGATION_METHOD' as issue_type,
    'Aggregation method is NULL - cannot determine if data is monthly, MA, etc.' as issue_description,
    'HIGH' as severity
  FROM metadata.series_metadata sm
  WHERE sm.aggregation_method IS NULL
    AND sm.is_active = true;

  -- Check for missing seasonal adjustment
  RETURN QUERY
  SELECT
    sm.series_id,
    sm.series_name,
    'MISSING_SEASONAL_ADJ' as issue_type,
    'Seasonal adjustment is NULL - cannot determine if data is SA or NSA' as issue_description,
    'HIGH' as severity
  FROM metadata.series_metadata sm
  WHERE sm.seasonal_adjustment IS NULL
    AND sm.is_active = true;

  -- Check for potential territorial data issues
  RETURN QUERY
  SELECT
    sm.series_id,
    sm.series_name,
    'TERRITORIAL_AGGREGATION_MISMATCH' as issue_type,
    'Territorial data should use 3-month moving average, not monthly' as issue_description,
    'CRITICAL' as severity
  FROM metadata.series_metadata sm
  WHERE sm.geography IN ('Yukon', 'Northwest Territories', 'Nunavut')
    AND sm.aggregation_method != '3M_MA'
    AND sm.category = 'Employment';

  -- Check for provincial data marked as 3M MA (should be monthly)
  RETURN QUERY
  SELECT
    sm.series_id,
    sm.series_name,
    'PROVINCIAL_AGGREGATION_MISMATCH' as issue_type,
    'Provincial data should use monthly aggregation, not 3-month MA' as issue_description,
    'CRITICAL' as severity
  FROM metadata.series_metadata sm
  WHERE sm.geography IN ('Alberta', 'British Columbia', 'Manitoba', 'New Brunswick',
                        'Newfoundland and Labrador', 'Nova Scotia', 'Ontario',
                        'Prince Edward Island', 'Québec', 'Saskatchewan')
    AND sm.aggregation_method = '3M_MA'
    AND sm.category = 'Employment';
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION metadata.validate_series_metadata IS 'Validates series metadata for completeness and correctness. Returns issues with severity levels.';

-- ============================================================================
-- ROLLBACK SCRIPT (if needed)
-- ============================================================================

/*
-- To rollback this migration:

DROP VIEW IF EXISTS metadata.series_comparability;
DROP FUNCTION IF EXISTS metadata.validate_series_metadata();

ALTER TABLE metadata.series_metadata
  DROP COLUMN IF EXISTS seasonal_adjustment,
  DROP COLUMN IF EXISTS aggregation_method,
  DROP COLUMN IF EXISTS data_variant,
  DROP COLUMN IF EXISTS source_table_id,
  DROP COLUMN IF EXISTS methodology_notes,
  DROP COLUMN IF EXISTS data_quality_score,
  DROP COLUMN IF EXISTS last_verified_at;

ALTER TABLE metadata.data_catalogs
  DROP COLUMN IF EXISTS seasonal_adjustment,
  DROP COLUMN IF EXISTS aggregation_method,
  DROP COLUMN IF EXISTS data_variant,
  DROP COLUMN IF EXISTS source_table_id,
  DROP COLUMN IF EXISTS methodology_notes,
  DROP COLUMN IF EXISTS api_endpoint,
  DROP COLUMN IF EXISTS last_verified_at;

DROP TYPE IF EXISTS metadata.data_variant_enum;
DROP TYPE IF EXISTS metadata.aggregation_method_enum;
DROP TYPE IF EXISTS metadata.seasonal_adjustment_enum;
*/
