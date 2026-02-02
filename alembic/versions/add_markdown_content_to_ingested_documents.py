"""add markdown_content column to ingested_documents

Revision ID: add_markdown_content
Revises: 4108aca2dd8b
Create Date: 2026-02-02

Stores full markdown representation from Docling for:
- Human-readable debugging
- Rechunking without reprocessing (saves Modal GPU costs)
- Visual quality comparison
- Preserves emojis and special characters ✅🚀📊
"""

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = "add_markdown_content"
down_revision = "4108aca2dd8b"
branch_labels = None
depends_on = None


def upgrade():
    # Create ingestion schema if it doesn't exist
    op.execute("CREATE SCHEMA IF NOT EXISTS ingestion;")

    # Add markdown_content column to documents_raw table
    op.add_column(
        "documents_raw", sa.Column("markdown_content", sa.Text(), nullable=True), schema="ingestion"
    )

    # Add full-text search index for debugging/search
    op.execute(
        """
        CREATE INDEX IF NOT EXISTS idx_documents_raw_markdown_fts
        ON ingestion.documents_raw
        USING gin(to_tsvector('english', markdown_content));
    """
    )

    # Add comment
    op.execute(
        """
        COMMENT ON COLUMN ingestion.documents_raw.markdown_content IS
        'Full markdown representation from Docling. Preserves structure (headers, lists, tables)
         with emojis and special characters. Used for human-readable debugging, rechunking
         without reprocessing (saves Modal GPU costs), and quality assessment.';
    """
    )


def downgrade():
    op.drop_index("idx_documents_raw_markdown_fts", table_name="documents_raw", schema="ingestion")
    op.drop_column("documents_raw", "markdown_content", schema="ingestion")
