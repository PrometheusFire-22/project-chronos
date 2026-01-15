#!/usr/bin/env python3
"""
Project Chronos: Universal Economic Data Ingestion
===================================================
Plugin-based architecture for extensibility

Supported sources:
- FRED (Federal Reserve)
- Valet (Bank of Canada)
- Future: BOE, ECB, BOJ, etc.
"""
import csv
import os
import sys
import time
import argparse
from datetime import UTC, datetime
from pathlib import Path

import psycopg2
from dotenv import load_dotenv

# Import plugins
from chronos.ingestion.fred import FREDPlugin
from chronos.ingestion.valet import ValetPlugin

# Load environment
# Load environment (look in project root)
env_path = Path(__file__).parent.parent.parent.parent / ".env"
load_dotenv(env_path)

# Database configuration
DB_CONFIG = {
    "host": os.getenv("DATABASE_HOST", "chronos-db"),
    "database": os.getenv("DATABASE_NAME", "chronos_db"),
    "user": os.getenv("DATABASE_USER", "prometheus"),
    "password": os.getenv("DATABASE_PASSWORD"),
}

# Initialize plugins
PLUGINS = {
    "FRED": FREDPlugin(os.getenv("FRED_API_KEY")),
    "Valet": ValetPlugin(),
    # Add future plugins here:
    # "BOE": BOEPlugin(os.getenv("BOE_API_KEY")),
    # "ECB": ECBPlugin(),
    # "BOJ": BOJPlugin(os.getenv("BOJ_API_KEY")),
}


def get_db_connection():
    """Create database connection"""
    return psycopg2.connect(**DB_CONFIG)


def load_catalog(catalog_path: Path):
    """Load time-series catalog"""
    series_list = []

    with open(catalog_path, encoding="utf-8") as f:
        reader = csv.DictReader(f)
        for row in reader:
            if row.get("status") == "Active":
                series_list.append(row)

    return series_list


def ensure_data_source(conn, plugin):
    """Ensure data source exists in database and return actual source_id"""
    cursor = conn.cursor()

    source_name = plugin.get_source_name()

    # Check if source exists by name
    cursor.execute(
        "SELECT source_id FROM metadata.data_sources WHERE source_name = %s", (source_name,)
    )
    result = cursor.fetchone()

    if result:
        source_id = result[0]
        print(f"✅ {source_name} already exists (ID: {source_id})\n")
    else:
        # Insert new source (let source_id auto-generate)
        cursor.execute(
            """
            INSERT INTO metadata.data_sources (source_name)
            VALUES (%s)
            RETURNING source_id
            """,
            (source_name,),
        )
        source_id = cursor.fetchone()[0]
        conn.commit()
        print(f"✅ Added {source_name} to data_sources (ID: {source_id})\n")

    cursor.close()
    return source_id


def insert_series_metadata(conn, source_id: int, series_id: str, series_data: dict):
    """Insert or update series metadata"""
    cursor = conn.cursor()

    query = """
    INSERT INTO metadata.series_metadata (
        source_id, source_series_id, series_name,
        frequency, category, geography
    ) VALUES (%s, %s, %s, %s, %s, %s)
    ON CONFLICT (source_id, source_series_id)
    DO UPDATE SET
        series_name = EXCLUDED.series_name,
        last_updated = NOW();
    """

    cursor.execute(
        query,
        (
            source_id,
            series_id,
            series_data.get("series_name", "Unknown"),
            series_data.get("frequency", "Unknown"),
            series_data.get("category", "Unknown"),
            series_data.get("geography_name", "Unknown"),
        ),
    )

    conn.commit()
    cursor.close()


def insert_observations(conn, series_id: str, observations: list, source_id: int):
    """Insert observations with batch processing"""
    cursor = conn.cursor()

    # Get internal series_id
    cursor.execute(
        """
        SELECT series_id FROM metadata.series_metadata
        WHERE source_id = %s AND source_series_id = %s
    """,
        (source_id, series_id),
    )

    result = cursor.fetchone()
    if not result:
        cursor.close()
        raise ValueError(f"Series {series_id} not found in metadata")

    internal_series_id = result[0]

    inserted = 0
    skipped = 0
    batch = []

    for obs in observations:
        try:
            batch.append((internal_series_id, obs["date"], float(obs["value"]), "good"))

            if len(batch) >= 100:
                cursor.executemany(
                    """
                    INSERT INTO timeseries.economic_observations
                    (series_id, observation_date, value, quality_flag)
                    VALUES (%s, %s, %s, %s)
                    ON CONFLICT (series_id, observation_date)
                    DO UPDATE SET value = EXCLUDED.value
                """,
                    batch,
                )
                inserted += len(batch)
                batch = []

        except Exception:
            skipped += 1
            continue

    # Insert remaining
    if batch:
        try:
            cursor.executemany(
                """
                INSERT INTO timeseries.economic_observations
                (series_id, observation_date, value, quality_flag)
                VALUES (%s, %s, %s, %s)
                ON CONFLICT (series_id, observation_date)
                DO UPDATE SET value = EXCLUDED.value
            """,
                batch,
            )
            inserted += len(batch)
        except Exception:
            skipped += len(batch)

    conn.commit()
    cursor.close()

    return inserted, skipped


def main():
    """Main ingestion orchestrator"""
    parser = argparse.ArgumentParser(description="Project Chronos: Universal Economic Data Ingestion")
    parser.add_argument("--source", help="Filter by data source (FRED, Valet)")
    parser.add_argument("--series", action="append", help="Filter by series ID (can be repeated)")
    parser.add_argument("--geography", help="Filter by geography name (e.g., Canada, United States)")
    args = parser.parse_args()

    print("\n" + "=" * 60)
    print("🚀 Project Chronos: Universal Economic Data Ingestion")
    print("=" * 60 + "\n")

    start_time = datetime.now(UTC)

    # Locate catalog (go up 4 levels: file -> ingestion -> chronos -> src -> project root)
    catalog_path = (
        Path(__file__).parent.parent.parent.parent / "database" / "seeds" / "time-series_catalog.csv"
    )

    if not catalog_path.exists():
        print(f"❌ Catalog not found: {catalog_path}")
        sys.exit(1)

    print(f"📊 Loading catalog: {catalog_path}")
    all_series = load_catalog(catalog_path)

    # Filter series list
    series_list = []
    for s in all_series:
        if args.source and s["source"] != args.source:
            continue
        if args.geography and s["geography_name"] != args.geography:
            continue
        if args.series and s["series_id"] not in args.series:
            continue
        series_list.append(s)

    if not series_list:
        print("⚠️  No series matching filters found in catalog")
        sys.exit(0)

    print(f"✅ Loaded {len(series_list)} series for processing\n")

    # Connect to database
    conn = get_db_connection()
    print("✅ Connected to database\n")

    # Ensure all sources exist and store actual source_ids
    source_id_map = {}
    for source_name, plugin in PLUGINS.items():
        actual_source_id = ensure_data_source(conn, plugin)
        source_id_map[source_name] = actual_source_id

    # Process each series
    total_observations = 0
    successful = 0
    failed = []

    for i, series in enumerate(series_list, 1):
        series_id = series["series_id"]
        source = series["source"]
        name = series["series_name"]

        print(f"[{i}/{len(series_list)}] {series_id} ({source})")
        print(f"    Name: {name}")

        try:
            # Get plugin for this source
            if source not in PLUGINS:
                raise ValueError(f"No plugin for source: {source}")

            plugin = PLUGINS[source]
            actual_source_id = source_id_map[source]

            # Fetch observations
            observations = plugin.fetch_observations(series_id)
            time.sleep(1)  # Rate limiting between series

            if not observations:
                print("    ⚠️  No data returned")
                failed.append((series_id, "No data"))
                continue

            print(f"    ✅ Fetched {len(observations)} observations")

            # Insert metadata
            insert_series_metadata(conn, actual_source_id, series_id, series)

            # Insert observations
            inserted, skipped = insert_observations(
                conn, series_id, observations, actual_source_id
            )

            print(f"    ✅ Inserted {inserted} observations (skipped {skipped})")

            total_observations += inserted
            successful += 1

        except ValueError as e:
            print(f"    ❌ {str(e)}")
            failed.append((series_id, str(e)))
        except Exception as e:
            print(f"    ❌ Error: {str(e)}")
            failed.append((series_id, str(e)))
            conn.rollback()

        print()

    conn.close()

    # Summary
    duration = datetime.now(UTC) - start_time

    print("=" * 60)
    print("✅ INGESTION COMPLETE!")
    print("=" * 60)
    print("\n📊 Summary:")
    print(f"  Total series processed: {len(series_list)}")
    print(f"  Successful: {successful}")
    print(f"  Failed: {len(failed)}")
    print(f"  Total observations loaded: {total_observations:,}")
    print(f"  Duration: {duration}")
    print(f"  Success rate: {successful/len(series_list)*100:.1f}%")

    if failed:
        print("\n⚠️  Failed series:")
        for series_id, error in failed:
            error_short = error[:80] + "..." if len(error) > 80 else error
            print(f"    - {series_id}: {error_short}")

    print("\n" + "=" * 60 + "\n")


if __name__ == "__main__":
    main()
