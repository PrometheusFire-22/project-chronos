#!/usr/bin/env python3
"""
Migration 003: Add unit metadata columns to series_metadata table

This migration adds systematic unit handling capabilities:
- unit_type: Categorizes series for proper formatting (PERCENTAGE, CURRENCY, etc.)
- scalar_factor: Multiplicative factor for ingestion-time transformations
- display_units: Human-readable unit description for UI display
"""
import os
import sys
from pathlib import Path

from dotenv import load_dotenv
from sqlalchemy import create_engine, text

# Load environment variables
repo_root = Path(__file__).resolve().parents[6]
load_dotenv(repo_root / ".env.local")
load_dotenv(repo_root / ".env")
load_dotenv(repo_root / "apps" / "chronos-api" / ".env")

# Get database URL
db_url = os.getenv("DATABASE_URL")
if not db_url:
    print("❌ DATABASE_URL environment variable not found")
    sys.exit(1)


def get_db_engine():
    """Create database engine"""
    return create_engine(db_url)


def run_migration():
    """Execute migration 003: Add unit metadata columns"""

    migration_sql = """
    -- ============================================================================
    -- Migration 003: Add Unit Metadata Columns to series_metadata
    -- ============================================================================

    BEGIN;

    -- Create ENUM type for unit categories
    CREATE TYPE metadata.unit_type_enum AS ENUM (
        'PERCENTAGE',    -- Interest rates, unemployment, growth rates (display as %)
        'CURRENCY',      -- Dollar amounts, should show currency symbol
        'INDEX',         -- CPI, S&P 500, dimensionless indices
        'RATE',          -- Basis points, ratios (not percentages)
        'COUNT',         -- Number of people, units, homes
        'OTHER'          -- Catch-all for edge cases
    );

    COMMENT ON TYPE metadata.unit_type_enum IS
    'Categorizes the semantic type of a series for proper formatting and display';

    -- Add columns to series_metadata
    ALTER TABLE metadata.series_metadata
    ADD COLUMN unit_type metadata.unit_type_enum DEFAULT 'OTHER',
    ADD COLUMN scalar_factor NUMERIC(20, 6) DEFAULT 1.0,
    ADD COLUMN display_units TEXT;

    -- Add comments for documentation
    COMMENT ON COLUMN metadata.series_metadata.unit_type IS
    'Semantic type of the series (PERCENTAGE, CURRENCY, INDEX, etc.) for proper display formatting';

    COMMENT ON COLUMN metadata.series_metadata.scalar_factor IS
    'Multiplicative factor applied at ingestion time to convert raw API values to absolute values.
    Example: If API returns thousands and we want to store actual values, scalar_factor = 1000.
    Example: If API returns decimals (0.05) but we want percentages (5), scalar_factor = 100.';

    COMMENT ON COLUMN metadata.series_metadata.display_units IS
    'Human-readable unit description shown in UI (e.g., "Millions of CAD", "% (percentage points)", "Index 2015=100")';

    -- Create index for filtering by unit type
    CREATE INDEX idx_series_unit_type ON metadata.series_metadata(unit_type);

    COMMIT;
    """

    print("=" * 70)
    print("🔧 Running Migration 003: Add Unit Metadata")
    print("=" * 70)
    print()

    engine = get_db_engine()

    try:
        with engine.begin() as conn:
            # Execute the migration
            conn.execute(text(migration_sql))
            print("✅ Migration completed successfully!")
            print()

            # Verify columns were added
            result = conn.execute(
                text(
                    """
                SELECT column_name, data_type, column_default
                FROM information_schema.columns
                WHERE table_schema = 'metadata'
                AND table_name = 'series_metadata'
                AND column_name IN ('unit_type', 'scalar_factor', 'display_units')
                ORDER BY column_name;
            """
                )
            ).fetchall()

            print("📊 Verified new columns:")
            for row in result:
                print(f"   • {row[0]}: {row[1]} (default: {row[2]})")
            print()

    except Exception as e:
        print(f"❌ Migration failed: {e}")
        print()
        print("This might be normal if the migration was already run.")
        print("To rollback, run the rollback script manually.")
        sys.exit(1)

    print("=" * 70)
    print("✅ Migration 003 complete!")
    print("=" * 70)


def rollback_migration():
    """Rollback migration 003"""

    rollback_sql = """
    BEGIN;
    ALTER TABLE metadata.series_metadata
      DROP COLUMN IF EXISTS unit_type,
      DROP COLUMN IF EXISTS scalar_factor,
      DROP COLUMN IF EXISTS display_units;
    DROP TYPE IF EXISTS metadata.unit_type_enum;
    COMMIT;
    """

    print("=" * 70)
    print("⚠️  Rolling back Migration 003")
    print("=" * 70)
    print()

    engine = get_db_engine()

    try:
        with engine.begin() as conn:
            conn.execute(text(rollback_sql))
            print("✅ Rollback completed successfully!")

    except Exception as e:
        print(f"❌ Rollback failed: {e}")
        sys.exit(1)

    print()
    print("=" * 70)
    print("✅ Rollback complete!")
    print("=" * 70)


if __name__ == "__main__":
    if len(sys.argv) > 1 and sys.argv[1] == "--rollback":
        rollback_migration()
    else:
        run_migration()
