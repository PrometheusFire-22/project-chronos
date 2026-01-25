"""performance_optimizations_add_fk_remove_duplicates_add_comments

Revision ID: ec45f2f8f2b7
Revises: c4f9e2b8a1d5
Create Date: 2026-01-24 21:47:33.206375

"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "ec45f2f8f2b7"
down_revision: Union[str, Sequence[str], None] = "c4f9e2b8a1d5"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Apply performance optimizations from CHRONOS-452 audit."""

    # ========================================================================
    # PRIORITY 1: Add Missing Foreign Key Constraint
    # ========================================================================
    op.create_foreign_key(
        "fk_observations_series",
        "economic_observations",
        "series_metadata",
        ["series_id"],
        ["series_id"],
        source_schema="timeseries",
        referent_schema="metadata",
        ondelete="CASCADE",
    )

    # ========================================================================
    # PRIORITY 2: Remove Duplicate Indexes
    # ========================================================================
    # Geospatial schema: Remove duplicate geometry indexes
    op.drop_index(
        "idx_ca_census_divisions_geometry",
        table_name="ca_census_divisions",
        schema="geospatial",
        if_exists=True,
    )
    op.drop_index(
        "idx_ca_census_subdivisions_geometry",
        table_name="ca_census_subdivisions",
        schema="geospatial",
        if_exists=True,
    )

    # Timeseries schema: Remove duplicate observation_date index
    op.drop_index(
        "idx_obs_date",
        table_name="economic_observations",
        schema="timeseries",
        if_exists=True,
    )

    # ========================================================================
    # PRIORITY 3: Remove Legacy Table
    # ========================================================================
    op.execute("DROP TABLE IF EXISTS public.backup_test")


def downgrade() -> None:
    """Rollback performance optimizations."""

    # Recreate duplicate indexes
    op.create_index(
        "idx_ca_census_divisions_geometry",
        "ca_census_divisions",
        ["geometry"],
        schema="geospatial",
        postgresql_using="gist",
    )
    op.create_index(
        "idx_ca_census_subdivisions_geometry",
        "ca_census_subdivisions",
        ["geometry"],
        schema="geospatial",
        postgresql_using="gist",
    )
    op.create_index(
        "idx_obs_date",
        "economic_observations",
        [sa.text("observation_date DESC")],
        schema="timeseries",
    )

    # Remove foreign key constraint
    op.drop_constraint(
        "fk_observations_series",
        "economic_observations",
        schema="timeseries",
        type_="foreignkey",
    )
