"""performance_optimizations_remove_duplicates

Revision ID: f9a3b2c1d4e5
Revises: ec45f2f8f2b7
Create Date: 2026-01-24 21:54:00.000000

"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "f9a3b2c1d4e5"
down_revision: Union[str, Sequence[str], None] = "ec45f2f8f2b7"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Remove duplicate FK constraint, keep the original."""

    # Drop the duplicate FK constraint we just added in ec45f2f8f2b7
    # Keep the original economic_observations_series_id_fkey
    op.drop_constraint(
        "fk_observations_series",
        "economic_observations",
        schema="timeseries",
        type_="foreignkey",
    )


def downgrade() -> None:
    """Recreate the duplicate FK constraint if rolling back."""

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
