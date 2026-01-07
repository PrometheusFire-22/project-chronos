"""add updated_at to series_metadata

Revision ID: 249e770f3757
Revises: b388a0d4a063
Create Date: 2026-01-06 19:00:32.069911

"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "249e770f3757"
down_revision: Union[str, Sequence[str], None] = "b388a0d4a063"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.add_column(
        "series_metadata",
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
        schema="metadata",
    )


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_column("series_metadata", "updated_at", schema="metadata")
