"""baseline: existing schema from schema.sql

Revision ID: ea7e6a9e8df2
Revises:
Create Date: 2025-11-19 01:51:40.703483

"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "ea7e6a9e8df2"
down_revision: Union[str, Sequence[str], None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Baseline migration marking existing schema

    The database schema was loaded from database/schema.sql.
    This migration establishes version control from this point forward.

    Schemas: metadata, timeseries, analytics, economic_graph
    Tables: 5 tables across schemas
    Extensions: 17 PostgreSQL extensions including TimescaleDB, PostGIS, pgvector, AGE
    """
    pass


def downgrade() -> None:
    """Baseline cannot be downgraded

    Rolling back the baseline would destroy the entire schema.
    This is handled by database/schema.sql, not migrations.
    """
    pass
