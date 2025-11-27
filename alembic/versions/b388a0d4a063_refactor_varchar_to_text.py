"""refactor_varchar_to_text

Revision ID: b388a0d4a063
Revises: ea7e6a9e8df2
Create Date: 2025-11-24 04:45:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'b388a0d4a063'
down_revision: Union[str, Sequence[str], None] = 'ea7e6a9e8df2'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

# View Definitions
VIEW_FX_RATES = """
CREATE OR REPLACE VIEW analytics.fx_rates_normalized AS
SELECT
    sm.series_name,
    eo.observation_date,
    eo.value as original_rate,
    CASE
        WHEN sm.series_name LIKE '%USD%' THEN eo.value
        WHEN sm.series_name LIKE 'FX%CAD' THEN 1.0 / eo.value
        ELSE eo.value
    END as usd_rate,
    sm.source_series_id
FROM timeseries.economic_observations eo
JOIN metadata.series_metadata sm ON eo.series_id = sm.series_id
WHERE sm.series_type = 'FX'
  AND eo.value IS NOT NULL;
"""

VIEW_MACRO = """
CREATE OR REPLACE VIEW analytics.macro_indicators_latest AS
WITH latest_values AS (
    SELECT DISTINCT ON (series_id)
        series_id,
        observation_date,
        value
    FROM timeseries.economic_observations
    WHERE value IS NOT NULL
    ORDER BY series_id, observation_date DESC
),
year_ago_values AS (
    SELECT
        lv.series_id,
        eo.value as value_year_ago
    FROM latest_values lv
    LEFT JOIN timeseries.economic_observations eo
        ON lv.series_id = eo.series_id
        AND eo.observation_date = lv.observation_date - INTERVAL '1 year'
)
SELECT
    sm.series_name,
    sm.source_series_id,
    lv.observation_date,
    lv.value as current_value,
    yav.value_year_ago,
    CASE
        WHEN yav.value_year_ago IS NOT NULL AND yav.value_year_ago != 0
        THEN ((lv.value - yav.value_year_ago) / yav.value_year_ago * 100)
        ELSE NULL
    END as yoy_growth_pct
FROM latest_values lv
JOIN metadata.series_metadata sm ON lv.series_id = sm.series_id
LEFT JOIN year_ago_values yav ON lv.series_id = yav.series_id
ORDER BY sm.series_name;
"""

VIEW_QUALITY = """
CREATE OR REPLACE VIEW analytics.data_quality_dashboard AS
SELECT
    sm.series_name,
    sm.source_series_id,
    COUNT(eo.value) as total_observations,
    MIN(eo.observation_date) as first_observation,
    MAX(eo.observation_date) as last_observation,
    CURRENT_DATE - MAX(eo.observation_date) as days_since_update,
    CASE
        WHEN CURRENT_DATE - MAX(eo.observation_date) <= 7 THEN 'fresh'
        WHEN CURRENT_DATE - MAX(eo.observation_date) <= 30 THEN 'recent'
        WHEN CURRENT_DATE - MAX(eo.observation_date) <= 90 THEN 'stale'
        ELSE 'very_stale'
    END as freshness_status,
    ROUND(
        100.0 * COUNT(CASE WHEN eo.value IS NULL THEN 1 END) / COUNT(*),
        2
    ) as null_percentage
FROM metadata.series_metadata sm
LEFT JOIN timeseries.economic_observations eo ON sm.series_id = eo.series_id
GROUP BY sm.series_id, sm.series_name, sm.source_series_id
ORDER BY days_since_update;
"""


def upgrade() -> None:
    # Drop views that depend on columns being altered
    op.execute("DROP VIEW IF EXISTS analytics.fx_rates_normalized CASCADE")
    op.execute("DROP VIEW IF EXISTS analytics.macro_indicators_latest CASCADE")
    op.execute("DROP VIEW IF EXISTS analytics.data_quality_dashboard CASCADE")

    # metadata.data_sources
    op.alter_column('data_sources', 'source_name', type_=sa.Text(), existing_type=sa.VARCHAR(100), schema='metadata')
    op.alter_column('data_sources', 'base_url', type_=sa.Text(), existing_type=sa.VARCHAR(500), schema='metadata')

    # metadata.series_metadata
    op.alter_column('series_metadata', 'source_series_id', type_=sa.Text(), existing_type=sa.VARCHAR(100), schema='metadata')
    op.alter_column('series_metadata', 'series_name', type_=sa.Text(), existing_type=sa.VARCHAR(255), schema='metadata')
    op.alter_column('series_metadata', 'series_type', type_=sa.Text(), existing_type=sa.VARCHAR(50), schema='metadata')
    op.alter_column('series_metadata', 'frequency', type_=sa.Text(), existing_type=sa.VARCHAR(20), schema='metadata')
    op.alter_column('series_metadata', 'units', type_=sa.Text(), existing_type=sa.VARCHAR(100), schema='metadata')
    op.alter_column('series_metadata', 'seasonal_adjustment', type_=sa.Text(), existing_type=sa.VARCHAR(50), schema='metadata')
    op.alter_column('series_metadata', 'geography', type_=sa.Text(), existing_type=sa.VARCHAR(100), schema='metadata')
    op.alter_column('series_metadata', 'category', type_=sa.Text(), existing_type=sa.VARCHAR(100), schema='metadata')

    # metadata.ingestion_log
    op.alter_column('ingestion_log', 'status', type_=sa.Text(), existing_type=sa.VARCHAR(20), schema='metadata')

    # timeseries.economic_observations
    op.alter_column('economic_observations', 'quality_flag', type_=sa.Text(), existing_type=sa.VARCHAR(10), schema='timeseries')

    # metadata.schema_version
    op.alter_column('schema_version', 'version', type_=sa.Text(), existing_type=sa.VARCHAR(20), schema='metadata')

    # Recreate views
    op.execute(VIEW_FX_RATES)
    op.execute(VIEW_MACRO)
    op.execute(VIEW_QUALITY)


def downgrade() -> None:
    # Drop views
    op.execute("DROP VIEW IF EXISTS analytics.fx_rates_normalized CASCADE")
    op.execute("DROP VIEW IF EXISTS analytics.macro_indicators_latest CASCADE")
    op.execute("DROP VIEW IF EXISTS analytics.data_quality_dashboard CASCADE")

    # metadata.schema_version
    op.alter_column('schema_version', 'version', type_=sa.VARCHAR(20), existing_type=sa.Text(), schema='metadata')

    # timeseries.economic_observations
    op.alter_column('economic_observations', 'quality_flag', type_=sa.VARCHAR(10), existing_type=sa.Text(), schema='timeseries')

    # metadata.ingestion_log
    op.alter_column('ingestion_log', 'status', type_=sa.VARCHAR(20), existing_type=sa.Text(), schema='metadata')

    # metadata.series_metadata
    op.alter_column('series_metadata', 'category', type_=sa.VARCHAR(100), existing_type=sa.Text(), schema='metadata')
    op.alter_column('series_metadata', 'geography', type_=sa.VARCHAR(100), existing_type=sa.Text(), schema='metadata')
    op.alter_column('series_metadata', 'seasonal_adjustment', type_=sa.VARCHAR(50), existing_type=sa.Text(), schema='metadata')
    op.alter_column('series_metadata', 'units', type_=sa.VARCHAR(100), existing_type=sa.Text(), schema='metadata')
    op.alter_column('series_metadata', 'frequency', type_=sa.VARCHAR(20), existing_type=sa.Text(), schema='metadata')
    op.alter_column('series_metadata', 'series_type', type_=sa.VARCHAR(50), existing_type=sa.Text(), schema='metadata')
    op.alter_column('series_metadata', 'series_name', type_=sa.VARCHAR(255), existing_type=sa.Text(), schema='metadata')
    op.alter_column('series_metadata', 'source_series_id', type_=sa.VARCHAR(100), existing_type=sa.Text(), schema='metadata')

    # metadata.data_sources
    op.alter_column('data_sources', 'base_url', type_=sa.VARCHAR(500), existing_type=sa.Text(), schema='metadata')
    op.alter_column('data_sources', 'source_name', type_=sa.VARCHAR(100), existing_type=sa.Text(), schema='metadata')

    # Recreate views
    op.execute(VIEW_FX_RATES)
    op.execute(VIEW_MACRO)
    op.execute(VIEW_QUALITY)
