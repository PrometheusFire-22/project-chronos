"""add_methodology_metadata_to_series

Adds critical methodology metadata to track:
- Seasonal adjustment (SA, NSA, etc.)
- Aggregation method (monthly, 3-month MA, etc.)
- Data variant (final, preliminary, revised)
- Source table ID for traceability

This fixes CHRONOS-470 - distinguishes provincial (monthly) from territorial (3-month MA) data.

Revision ID: 7f20cd5ba6ca
Revises: e5800adf350c
Create Date: 2026-01-29 13:59:01.168027

"""

from typing import Sequence, Union
from pathlib import Path

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "7f20cd5ba6ca"
down_revision: Union[str, Sequence[str], None] = "e5800adf350c"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema by executing SQL migration file."""
    # Read and execute the SQL migration file
    sql_file = (
        Path(__file__).parent.parent.parent
        / "database"
        / "migrations"
        / "004_add_methodology_metadata.sql"
    )

    with open(sql_file, "r") as f:
        sql_content = f.read()

    # Remove rollback comment section (everything after the rollback marker)
    sql_statements = sql_content.split(
        "-- ============================================================================"
    )[0:6]
    sql_to_execute = "\n".join(sql_statements)

    # Execute the SQL
    # Note: We use raw SQL execution for complex operations including ENUMs and functions
    op.execute(sql_to_execute)


def downgrade() -> None:
    """Downgrade schema by reverting changes."""
    # Drop view, function, and added columns
    op.execute("DROP VIEW IF EXISTS metadata.series_comparability;")
    op.execute("DROP FUNCTION IF EXISTS metadata.validate_series_metadata();")

    # Drop columns from series_metadata
    op.drop_column("series_metadata", "last_verified_at", schema="metadata")
    op.drop_column("series_metadata", "data_quality_score", schema="metadata")
    op.drop_column("series_metadata", "methodology_notes", schema="metadata")
    op.drop_column("series_metadata", "source_table_id", schema="metadata")
    op.drop_column("series_metadata", "data_variant", schema="metadata")
    op.drop_column("series_metadata", "aggregation_method", schema="metadata")
    op.drop_column("series_metadata", "seasonal_adjustment", schema="metadata")

    # Drop columns from data_catalogs
    op.drop_column("data_catalogs", "last_verified_at", schema="metadata")
    op.drop_column("data_catalogs", "api_endpoint", schema="metadata")
    op.drop_column("data_catalogs", "methodology_notes", schema="metadata")
    op.drop_column("data_catalogs", "source_table_id", schema="metadata")
    op.drop_column("data_catalogs", "data_variant", schema="metadata")
    op.drop_column("data_catalogs", "aggregation_method", schema="metadata")
    op.drop_column("data_catalogs", "seasonal_adjustment", schema="metadata")

    # Drop ENUMs
    op.execute("DROP TYPE IF EXISTS metadata.data_variant_enum;")
    op.execute("DROP TYPE IF EXISTS metadata.aggregation_method_enum;")
    op.execute("DROP TYPE IF EXISTS metadata.seasonal_adjustment_enum;")
