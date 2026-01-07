"""add primary key to economic_observations

Revision ID: ad3f8c9b2e14
Revises: 249e770f3757
Create Date: 2026-01-06 23:30:00.000000

"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "ad3f8c9b2e14"
down_revision: Union[str, Sequence[str], None] = "249e770f3757"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Add PRIMARY KEY constraint to economic_observations.id"""
    # The 'id' column already exists and has unique values
    # We just need to add the PRIMARY KEY constraint
    op.execute(
        """
        ALTER TABLE timeseries.economic_observations
        ADD PRIMARY KEY (id)
        """
    )


def downgrade() -> None:
    """Remove PRIMARY KEY constraint from economic_observations"""
    op.execute(
        """
        ALTER TABLE timeseries.economic_observations
        DROP CONSTRAINT economic_observations_pkey
        """
    )
