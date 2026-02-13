"""add extractions table for contact extraction results

Revision ID: c544_extractions
Revises: add_markdown_content
Create Date: 2026-02-13

Stores extraction results (contacts + metadata) for:
- User extraction history and re-download
- Analytics (firms, roles, geographic patterns)
- Knowledge graph seeding
"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "c544_extractions"
down_revision: Union[str, Sequence[str], None] = "add_markdown_content"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "extractions",
        sa.Column(
            "id",
            sa.UUID(),
            server_default=sa.text("gen_random_uuid()"),
            nullable=False,
        ),
        sa.Column("user_id", sa.Text(), nullable=True),
        sa.Column("file_name", sa.Text(), nullable=False),
        sa.Column("r2_key", sa.Text(), nullable=True),
        sa.Column("contacts", sa.JSON(), nullable=False, server_default="[]"),
        sa.Column("document_metadata", sa.JSON(), server_default="{}"),
        sa.Column("contact_count", sa.Integer(), nullable=False, server_default="0"),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.PrimaryKeyConstraint("id"),
        sa.ForeignKeyConstraint(["user_id"], ["auth.user.id"], ondelete="SET NULL"),
        schema="ingestion",
    )

    op.create_index(
        "idx_extractions_user_id",
        "extractions",
        ["user_id"],
        schema="ingestion",
    )

    op.create_index(
        "idx_extractions_created_at",
        "extractions",
        ["created_at"],
        schema="ingestion",
    )


def downgrade() -> None:
    op.drop_index("idx_extractions_created_at", table_name="extractions", schema="ingestion")
    op.drop_index("idx_extractions_user_id", table_name="extractions", schema="ingestion")
    op.drop_table("extractions", schema="ingestion")
