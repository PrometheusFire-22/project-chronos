"""
Graph populator for CCAA knowledge graph (Apache AGE).

Takes extraction results and upserts Person, Firm, Case, Filing nodes
with relationship edges into the ccaa_kg graph.

Uses MERGE semantics for idempotent operations — safe to call multiple
times with the same extraction data.
"""

import logging
from typing import Any

from services.database import get_db

logger = logging.getLogger(__name__)


def _escape(value: str | None) -> str:
    """Escape a string for use in Cypher string literals."""
    if value is None:
        return ""
    return value.replace("\\", "\\\\").replace("'", "\\'")


def _run_cypher(session: Any, query: str) -> Any:
    """Execute a Cypher query against the ccaa_kg graph via AGE."""
    sql = f"""
        SELECT * FROM ag_catalog.cypher('ccaa_kg', $$
            {query}
        $$) AS (result agtype)
    """
    return session.execute(sql)


def _setup_age(session: Any) -> None:
    """Load AGE extension and configure search path for the session."""
    session.execute("LOAD 'age'")
    session.execute('SET search_path = ag_catalog, "$user", public')


def populate_graph(
    extraction_id: str,
    contacts: list[dict],
    document_metadata: dict,
    file_name: str,
) -> dict:
    """
    Populate the ccaa_kg graph from an extraction result.

    Uses MERGE to deduplicate nodes across filings — the same Person/Firm/Case
    will be reused if they appear in multiple documents.

    Returns counts of nodes and edges created/merged.
    """
    nodes_merged = 0
    edges_merged = 0

    case_name = _escape(document_metadata.get("case_name", ""))
    court_file_no = _escape(document_metadata.get("court_file_no", ""))
    filing_date = _escape(document_metadata.get("filing_date") or "")

    with get_db() as session:
        _setup_age(session)

        # 1. Create/merge the Filing node
        _run_cypher(
            session,
            f"""
            MERGE (f:Filing {{extraction_id: '{_escape(extraction_id)}'}})
            SET f.file_name = '{_escape(file_name)}',
                f.created_at = timestamp()
        """,
        )
        nodes_merged += 1

        # 2. Create/merge the Case node (if we have case info)
        if court_file_no:
            _run_cypher(
                session,
                f"""
                MERGE (c:Case {{court_file_no: '{court_file_no}'}})
                SET c.name = '{case_name}',
                    c.filing_date = '{filing_date}'
            """,
            )
            nodes_merged += 1

            # Filing -> Case
            _run_cypher(
                session,
                f"""
                MATCH (f:Filing {{extraction_id: '{_escape(extraction_id)}'}}),
                      (c:Case {{court_file_no: '{court_file_no}'}})
                MERGE (f)-[:FILED_IN]->(c)
            """,
            )
            edges_merged += 1

        # 3. Process each contact
        for contact in contacts:
            name = _escape(contact.get("name", ""))
            if not name:
                continue

            role = _escape(contact.get("role", ""))
            firm = _escape(contact.get("firm", ""))
            email = _escape(contact.get("email"))
            phone = _escape(contact.get("phone"))
            address = _escape(contact.get("address"))

            # Create/merge Person node
            person_set_parts = []
            if email:
                person_set_parts.append(f"p.email = '{email}'")
            if phone:
                person_set_parts.append(f"p.phone = '{phone}'")
            if address:
                person_set_parts.append(f"p.address = '{address}'")
            person_set = f"SET {', '.join(person_set_parts)}" if person_set_parts else ""

            _run_cypher(
                session,
                f"""
                MERGE (p:Person {{name: '{name}'}})
                {person_set}
            """,
            )
            nodes_merged += 1

            # Person -> Filing (EXTRACTED_FROM)
            _run_cypher(
                session,
                f"""
                MATCH (p:Person {{name: '{name}'}}),
                      (f:Filing {{extraction_id: '{_escape(extraction_id)}'}})
                MERGE (p)-[:EXTRACTED_FROM]->(f)
            """,
            )
            edges_merged += 1

            # Person -> Firm (WORKS_AT)
            if firm:
                _run_cypher(
                    session,
                    f"""
                    MERGE (fi:Firm {{name: '{firm}'}})
                """,
                )
                nodes_merged += 1

                _run_cypher(
                    session,
                    f"""
                    MATCH (p:Person {{name: '{name}'}}),
                          (fi:Firm {{name: '{firm}'}})
                    MERGE (p)-[:WORKS_AT]->(fi)
                """,
                )
                edges_merged += 1

                # Firm -> Case (REPRESENTS) — if we have a case
                if court_file_no and role:
                    _run_cypher(
                        session,
                        f"""
                        MATCH (fi:Firm {{name: '{firm}'}}),
                              (c:Case {{court_file_no: '{court_file_no}'}})
                        MERGE (fi)-[r:REPRESENTS]->(c)
                        SET r.role = '{role}'
                    """,
                    )
                    edges_merged += 1

            # Person -> Case (HAS_ROLE)
            if court_file_no and role:
                _run_cypher(
                    session,
                    f"""
                    MATCH (p:Person {{name: '{name}'}}),
                          (c:Case {{court_file_no: '{court_file_no}'}})
                    MERGE (p)-[r:HAS_ROLE]->(c)
                    SET r.role = '{role}'
                """,
                )
                edges_merged += 1

    logger.info(
        f"Graph populated: {nodes_merged} nodes merged, "
        f"{edges_merged} edges merged for extraction {extraction_id}"
    )

    return {
        "nodes_merged": nodes_merged,
        "edges_merged": edges_merged,
    }
