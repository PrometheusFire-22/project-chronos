#!/usr/bin/env python3
"""
Backfill metadata for existing series in the database
"""
import os
import time
from pathlib import Path

import psycopg2
from dotenv import load_dotenv

from chronos.ingestion.fred import FREDPlugin
from chronos.ingestion.statscan import StatsCanPlugin
from chronos.ingestion.valet import ValetPlugin

# Load environment
root_dir = Path(__file__).parent.parent.parent.parent
load_dotenv(root_dir / ".env")
load_dotenv(root_dir / ".env.local")
load_dotenv(root_dir / ".env.production")

# Database configuration
DB_CONFIG = {
    "host": os.getenv("DATABASE_HOST", "localhost"),
    "database": os.getenv("DATABASE_NAME", "chronos"),
    "user": os.getenv("DATABASE_USER", "chronos"),
    "password": os.getenv("DATABASE_PASSWORD"),
}

# Initialize plugins
PLUGINS = {
    "Federal Reserve Economic Data": FREDPlugin(os.getenv("FRED_API_KEY")),
    "Bank of Canada Valet": ValetPlugin(),
    "Statistics Canada": StatsCanPlugin(),
}


def get_db_connection():
    """Create database connection"""
    return psycopg2.connect(**DB_CONFIG)


def backfill_metadata():
    """Backfill metadata for all existing series"""
    print("\n" + "=" * 60)
    print("🔄 Backfilling Metadata for Existing Series")
    print("=" * 60 + "\n")

    conn = get_db_connection()
    cursor = conn.cursor()

    # Get all series that need metadata updates
    cursor.execute(
        """
        SELECT sm.series_id, sm.source_series_id, sm.series_name, ds.source_name
        FROM metadata.series_metadata sm
        JOIN metadata.data_sources ds ON sm.source_id = ds.source_id
        WHERE sm.units IS NULL OR sm.unit_type = 'OTHER'
        ORDER BY sm.series_id;
    """
    )

    series_list = cursor.fetchall()
    print(f"Found {len(series_list)} series to update\n")

    updated = 0
    skipped = 0

    for i, (series_id, source_series_id, series_name, source_name) in enumerate(series_list, 1):
        print(f"[{i}/{len(series_list)}] {source_series_id} - {series_name}")

        # Get the appropriate plugin
        plugin = PLUGINS.get(source_name)
        if not plugin or not hasattr(plugin, "fetch_metadata"):
            print("    ⚠️  No metadata fetcher for this source")
            skipped += 1
            continue

        try:
            # Fetch metadata from API
            metadata = plugin.fetch_metadata(source_series_id)
            time.sleep(1)  # Rate limiting

            if not metadata:
                print("    ⚠️  No metadata returned")
                skipped += 1
                continue

            # Update the series
            cursor.execute(
                """
                UPDATE metadata.series_metadata
                SET
                    units = %s,
                    unit_type = %s::metadata.unit_type_enum,
                    display_units = %s,
                    seasonal_adjustment = %s,
                    series_description = %s,
                    last_updated = NOW()
                WHERE series_id = %s;
            """,
                (
                    metadata.get("units"),
                    metadata.get("unit_type", "OTHER"),
                    metadata.get("display_units"),
                    metadata.get("seasonal_adjustment"),
                    metadata.get("notes"),
                    series_id,
                ),
            )

            conn.commit()
            print(f"    ✅ Updated: {metadata.get('unit_type')} - {metadata.get('display_units')}")
            updated += 1

        except Exception as e:
            print(f"    ❌ Error: {str(e)}")
            conn.rollback()
            skipped += 1
            continue

    cursor.close()
    conn.close()

    print("\n" + "=" * 60)
    print("✅ BACKFILL COMPLETE!")
    print("=" * 60)
    print(f"\nUpdated: {updated}")
    print(f"Skipped: {skipped}")
    print(f"Total: {len(series_list)}\n")


if __name__ == "__main__":
    backfill_metadata()
