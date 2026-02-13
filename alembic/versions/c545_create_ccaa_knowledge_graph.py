"""create ccaa_kg knowledge graph with Apache AGE

Revision ID: c545_ccaa_kg
Revises: c544_extractions
Create Date: 2026-02-13

Creates the ccaa_kg graph for CCAA filing knowledge graph.
Vertex labels: Person, Firm, Case, Filing
Edge labels: WORKS_AT, HAS_ROLE, FILED_IN, EXTRACTED_FROM, REPRESENTS
"""

from typing import Sequence, Union

from alembic import op


# revision identifiers, used by Alembic.
revision: str = "c545_ccaa_kg"
down_revision: Union[str, Sequence[str], None] = "c544_extractions"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    conn = op.get_bind()

    # Load AGE extension and set search path
    conn.execute(op.inline_literal("LOAD 'age'"))
    conn.execute(op.inline_literal('SET search_path = ag_catalog, "$user", public'))

    # Create the graph
    conn.execute(op.inline_literal("SELECT create_graph('ccaa_kg')"))

    # Vertex labels
    for label in ("Person", "Firm", "Case", "Filing"):
        conn.execute(op.inline_literal(f"SELECT create_vlabel('ccaa_kg', '{label}')"))

    # Edge labels
    for label in ("WORKS_AT", "HAS_ROLE", "FILED_IN", "EXTRACTED_FROM", "REPRESENTS"):
        conn.execute(op.inline_literal(f"SELECT create_elabel('ccaa_kg', '{label}')"))


def downgrade() -> None:
    conn = op.get_bind()
    conn.execute(op.inline_literal("LOAD 'age'"))
    conn.execute(op.inline_literal('SET search_path = ag_catalog, "$user", public'))
    conn.execute(op.inline_literal("SELECT drop_graph('ccaa_kg', true)"))
