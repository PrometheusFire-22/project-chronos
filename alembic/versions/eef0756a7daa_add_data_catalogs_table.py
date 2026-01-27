"""add_data_catalogs_table

Revision ID: eef0756a7daa
Revises: be7e246fee39
Create Date: 2026-01-26 22:47:22.548979

"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "eef0756a7daa"
down_revision: Union[str, Sequence[str], None] = "be7e246fee39"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.create_table(
        "data_catalogs",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("source", sa.String(length=50), nullable=False),
        sa.Column("series_id", sa.String(length=100), nullable=False),
        sa.Column("title", sa.Text(), nullable=False),
        sa.Column("frequency", sa.String(length=50), nullable=True),
        sa.Column("units", sa.String(length=100), nullable=True),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column("product_id", sa.String(length=50), nullable=True),
        sa.Column(
            "created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=True
        ),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=True),
        sa.PrimaryKeyConstraint("id"),
        schema="metadata",
    )
    op.create_index(
        op.f("ix_metadata_data_catalogs_id"),
        "data_catalogs",
        ["id"],
        unique=False,
        schema="metadata",
    )
    op.create_index(
        op.f("ix_metadata_data_catalogs_series_id"),
        "data_catalogs",
        ["series_id"],
        unique=False,
        schema="metadata",
    )
    op.create_index(
        op.f("ix_metadata_data_catalogs_source"),
        "data_catalogs",
        ["source"],
        unique=False,
        schema="metadata",
    )


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_index(
        op.f("ix_metadata_data_catalogs_source"), table_name="data_catalogs", schema="metadata"
    )
    op.drop_index(
        op.f("ix_metadata_data_catalogs_series_id"), table_name="data_catalogs", schema="metadata"
    )
    op.drop_index(
        op.f("ix_metadata_data_catalogs_id"), table_name="data_catalogs", schema="metadata"
    )
    op.drop_table("data_catalogs", schema="metadata")
