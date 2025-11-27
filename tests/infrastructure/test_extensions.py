import pytest
from sqlalchemy import text


@pytest.mark.infrastructure
def test_extensions_loaded(test_engine):
    """Verify that required extensions are loaded in shared_preload_libraries"""
    with test_engine.connect() as conn:
        # Check shared_preload_libraries
        result = conn.execute(text("SHOW shared_preload_libraries")).scalar()
        print(f"shared_preload_libraries: {result}")

        # We expect these to be present.
        # Note: If this test fails, it means the container needs to be rebuilt with the updated Dockerfile.
        assert "timescaledb" in result, "timescaledb not loaded"
        assert "pg_stat_statements" in result, "pg_stat_statements not loaded"
        assert (
            "age" in result
        ), "Apache AGE ('age') is NOT in shared_preload_libraries. Dockerfile fix required."


@pytest.mark.infrastructure
def test_pgvector_extension(test_engine):
    """Verify pgvector extension is installed and working"""
    with test_engine.connect() as conn:
        # Enable extension if not already (it should be from schema.sql)
        conn.execute(text("CREATE EXTENSION IF NOT EXISTS vector CASCADE"))
        conn.commit()

        # Test vector math
        # Calculate distance between two 3D vectors
        result = conn.execute(text("SELECT '[1,2,3]'::vector <-> '[1,2,3]'::vector")).scalar()
        assert result == 0.0, "Vector distance calculation failed"

        result = conn.execute(text("SELECT '[1,0,0]'::vector <-> '[0,1,0]'::vector")).scalar()
        # Distance between orthogonal unit vectors is sqrt(2) approx 1.414 (Euclidean)
        # Wait, <-> operator in pgvector is L2 distance (Euclidean) by default?
        # Yes, <-> is L2 distance.
        assert result > 1.4, "Vector distance calculation seems wrong"


@pytest.mark.infrastructure
def test_age_extension(test_engine):
    """Verify Apache AGE extension is installed and working"""
    with test_engine.connect() as conn:
        # Enable extension
        conn.execute(text("CREATE EXTENSION IF NOT EXISTS age CASCADE"))
        conn.commit()

        # Load AGE
        conn.execute(text("LOAD 'age'"))
        conn.execute(text("SET search_path = ag_catalog, '$user', public"))

        # Check if ag_graph table exists (basic smoke test)
        result = conn.execute(text("SELECT count(*) FROM ag_catalog.ag_graph")).scalar()
        assert result >= 0, "Could not query ag_catalog.ag_graph"
