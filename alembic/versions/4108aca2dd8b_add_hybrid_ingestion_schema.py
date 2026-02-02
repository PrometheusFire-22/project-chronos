"""add_hybrid_ingestion_schema

Revision ID: 4108aca2dd8b
Revises: 7f20cd5ba6ca
Create Date: 2026-02-01 14:24:24.051483

"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "4108aca2dd8b"
down_revision: Union[str, Sequence[str], None] = "7f20cd5ba6ca"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


import pgvector  # Should be available if not we use sa.text


def upgrade() -> None:
    """Upgrade schema."""
    # Ensure ingestion schema exists
    op.execute("CREATE SCHEMA IF NOT EXISTS ingestion")

    # Enable vector extension if not enabled (handled in dockerfile but good for safety)
    op.execute("CREATE EXTENSION IF NOT EXISTS vector")

    # 1. documents_raw table (The Source of Truth)
    op.create_table(
        "documents_raw",
        sa.Column("id", sa.UUID(), nullable=False),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.Column("file_name", sa.Text(), nullable=False),
        sa.Column("source_url", sa.Text(), nullable=True),
        sa.Column("doc_type", sa.Text(), nullable=True),
        sa.Column(
            "docling_data", sa.JSON(), nullable=True
        ),  # Use JSONB in Postgres, mapped as JSON in SA
        sa.PrimaryKeyConstraint("id"),
        schema="ingestion",
    )

    # 2. document_chunks table (The Vector Store)
    # Note: We use sa.text for existing types like vector to avoid dependency issues if library missing in env
    op.create_table(
        "document_chunks",
        sa.Column("id", sa.UUID(), nullable=False),
        sa.Column("document_id", sa.UUID(), nullable=False),
        sa.Column("chunk_index", sa.Integer(), nullable=False),
        sa.Column("text_content", sa.Text(), nullable=False),
        sa.Column("metadata", sa.JSON(), nullable=True),
        sa.Column(
            "embedding", sa.NullType(), nullable=True
        ),  # Placeholder for custom type definition below
        sa.ForeignKeyConstraint(
            ["document_id"], ["ingestion.documents_raw.id"], ondelete="CASCADE"
        ),
        sa.PrimaryKeyConstraint("id"),
        schema="ingestion",
    )

    # Add vector column manually to ensure correct type
    op.execute("ALTER TABLE ingestion.document_chunks ADD COLUMN embedding vector(1536)")

    # Add HNSW Index for fast retrieval
    op.execute(
        """
        CREATE INDEX idx_document_chunks_embedding
        ON ingestion.document_chunks
        USING hnsw (embedding vector_cosine_ops)
    """
    )


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_table("document_chunks", schema="ingestion")
    op.drop_table("documents_raw", schema="ingestion")
    op.execute("DROP SCHEMA IF EXISTS ingestion")
