"""cleanup_economic_data_and_frequencies

Revision ID: e5800adf350c
Revises: eef0756a7daa
Create Date: 2026-01-27 10:42:58.044280

"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "e5800adf350c"
down_revision: Union[str, Sequence[str], None] = "eef0756a7daa"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    # 1. Delete duplicate/incorrect series
    # series_id 238: US / Euro FX Rate (incorrect/inverted)
    # series_id 239: Euro / CAD FX Rate (incorrect custom calc)
    # series_id 313: Federal Funds Effective Rate (Source-less duplicate)

    op.execute(
        """
        DELETE FROM timeseries.economic_observations
        WHERE series_id IN (238, 239, 313)
    """
    )

    op.execute(
        """
        DELETE FROM metadata.series_metadata
        WHERE series_id IN (238, 239, 313)
    """
    )

    # 2. Harmonize Frequencies to full words
    # metadata.series_metadata
    op.execute("UPDATE metadata.series_metadata SET frequency = 'Daily' WHERE frequency = 'D'")
    op.execute("UPDATE metadata.series_metadata SET frequency = 'Monthly' WHERE frequency = 'M'")
    op.execute("UPDATE metadata.series_metadata SET frequency = 'Quarterly' WHERE frequency = 'Q'")

    # metadata.data_catalogs
    op.execute("UPDATE metadata.data_catalogs SET frequency = 'Daily' WHERE frequency = 'D'")
    op.execute("UPDATE metadata.data_catalogs SET frequency = 'Monthly' WHERE frequency = 'M'")
    op.execute("UPDATE metadata.data_catalogs SET frequency = 'Quarterly' WHERE frequency = 'Q'")


def downgrade() -> None:
    """Downgrade schema."""
    # Data deletion is irreversible in a practical sense here.
    # We could theoretically re-insert the bad data, but that defeats the purpose.
    # We can at least revert the frequency labels if needed, but it's lossy if we had mixed data.
    pass
