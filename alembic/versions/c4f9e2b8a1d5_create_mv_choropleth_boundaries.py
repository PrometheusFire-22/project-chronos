"""create_mv_choropleth_boundaries

Revision ID: c4f9e2b8a1d5
Revises: ad3f8c9b2e14
Create Date: 2026-01-18 16:13:00.000000

"""

from typing import Sequence, Union

from alembic import op


# revision identifiers, used by Alembic.
revision: str = "c4f9e2b8a1d5"
down_revision: Union[str, Sequence[str], None] = "ad3f8c9b2e14"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """
    Create a materialized view for pre-simplified choropleth boundaries.
    This significantly improves map rendering performance by:
    1. Pre-computing simplified geometries (ST_SimplifyPreserveTopology)
    2. Materializing the UNION ALL of US states and Canadian provinces
    3. Adding spatial and attribute indexes for fast queries
    """

    # Create the materialized view
    op.execute(
        """
        CREATE MATERIALIZED VIEW analytics.mv_choropleth_boundaries AS
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
    """
    )

    # Create indexes for performance
    op.execute(
        """
        CREATE INDEX idx_mv_choropleth_name
        ON analytics.mv_choropleth_boundaries (region_name);
    """
    )

    op.execute(
        """
        CREATE INDEX idx_mv_choropleth_geom
        ON analytics.mv_choropleth_boundaries
        USING GIST (geometry);
    """
    )


def downgrade() -> None:
    """
    Drop the materialized view and its indexes.
    """
    op.execute("DROP MATERIALIZED VIEW IF EXISTS analytics.mv_choropleth_boundaries CASCADE;")
