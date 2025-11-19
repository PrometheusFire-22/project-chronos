#!/usr/bin/env python3
"""
Project Chronos: Master Data Ingestion Orchestrator (Production Grade)
======================================================================
Features:
- Database logging to metadata.ingestion_log
- Exponential backoff with retries
- Initial warmup delay
- Progress tracking
- Graceful error handling
"""
import csv
import os
import sys
import time
from datetime import datetime
from pathlib import Path

import psycopg2
import requests
from dotenv import load_dotenv

# Load environment variables
env_path = Path(__file__).parent.parent.parent / ".env"
load_dotenv(env_path)
print(f"🔧 Loaded environment from: {env_path}")

# Database configuration
DB_CONFIG = {
    "host": os.getenv("DATABASE_HOST", "chronos-db"),
    "database": os.getenv("DATABASE_NAME", "chronos_db"),
    "user": os.getenv("DATABASE_USER", "prometheus"),
    "password": os.getenv("DATABASE_PASSWORD"),
}

FRED_API_KEY = os.getenv("FRED_API_KEY")
FRED_BASE_URL = "https://api.stlouisfed.org/fred/series/observations"

# Verify API key
if not FRED_API_KEY or FRED_API_KEY == "your_key_here":
    print("❌ ERROR: FRED_API_KEY not found in .env file")
    sys.exit(1)
else:
    masked_key = FRED_API_KEY[:8] + "..." + FRED_API_KEY[-4:]
    print(f"✅ FRED API Key loaded: {masked_key}\n")


def get_db_connection():
    """Create database connection"""
    return psycopg2.connect(**DB_CONFIG)


def log_ingestion_event(
    conn, series_id: str, status: str, records_loaded: int, error_msg: str = None
):
    """Log ingestion event to metadata.ingestion_log"""
    cursor = conn.cursor()

    query = """
    INSERT INTO metadata.ingestion_log (
        source_id, source_series_id, ingestion_status,
        records_loaded, error_message, ingestion_timestamp
    ) VALUES (1, %s, %s, %s, %s, NOW())
    """

    try:
        cursor.execute(query, (series_id, status, records_loaded, error_msg))
        conn.commit()
    except Exception as e:
        print(f"    ⚠️  Warning: Could not log to database: {e}")
        conn.rollback()
    finally:
        cursor.close()


def load_catalog(catalog_path: Path):
    """Load asset catalog and filter for 'Planned' FRED series"""
    planned_series = []

    with open(catalog_path) as f:
        reader = csv.DictReader(f)
        for row in reader:
            if not row.get("asset_id") or row.get("source") != "FRED":
                continue

            if row.get("status") == "Planned":
                planned_series.append(
                    {
                        "series_id": row["asset_id"],
                        "name": row["name"],
                        "category": row.get("category", ""),
                        "sub_category": row.get("sub_category", ""),
                    }
                )

    return planned_series


def fetch_fred_data(series_id: str, max_retries=3, initial_delay=2):
    """
    Fetch data from FRED API with intelligent rate limiting

    Args:
        series_id: FRED series identifier
        max_retries: Number of retry attempts
        initial_delay: Seconds to wait on first attempt (warmup)

    Returns:
        List of observations or empty list on failure
    """
    params = {
        "series_id": series_id,
        "api_key": FRED_API_KEY,
        "file_type": "json",
    }

    for attempt in range(max_retries):
        try:
            # Progressive delay: 2s, 3s, 5s
            delay = initial_delay + attempt
            if attempt > 0:
                print(f"    ⏱️  Retry {attempt}/{max_retries} after {delay}s delay...")

            time.sleep(delay)

            response = requests.get(FRED_BASE_URL, params=params, timeout=30)
            response.raise_for_status()

            data = response.json()
            return data.get("observations", [])

        except requests.exceptions.HTTPError as e:
            if e.response.status_code == 400:
                # Bad request - series doesn't exist, don't retry
                raise ValueError(f"Series {series_id} not found in FRED database")
            elif e.response.status_code == 429:
                # Rate limited - wait longer
                wait_time = (attempt + 1) * 10
                print(f"    ⏱️  Rate limited! Waiting {wait_time}s before retry...")
                time.sleep(wait_time)
            else:
                raise

        except requests.exceptions.Timeout:
            if attempt < max_retries - 1:
                print("    ⏱️  Timeout - retrying...")
                continue
            else:
                raise

        except requests.exceptions.RequestException:
            if attempt < max_retries - 1:
                wait_time = (attempt + 1) * 3
                print(f"    ⏱️  Network error, retrying in {wait_time}s...")
                time.sleep(wait_time)
            else:
                raise

    return []


def ensure_data_source(conn):
    """Ensure FRED exists in data_sources table"""
    cursor = conn.cursor()

    cursor.execute("SELECT COUNT(*) FROM metadata.data_sources WHERE source_id = 1")
    count = cursor.fetchone()[0]

    if count == 0:
        cursor.execute(
            """
            INSERT INTO metadata.data_sources (source_id, source_name)
            VALUES (1, 'Federal Reserve Economic Data (FRED)')
            ON CONFLICT DO NOTHING
        """
        )
        conn.commit()
        print("✅ Added FRED to data_sources\n")
    else:
        print("✅ FRED already exists in data_sources\n")

    cursor.close()


def insert_series_metadata(conn, series_id: str, name: str, category: str, sub_category: str):
    """Insert or update series metadata"""
    cursor = conn.cursor()

    query = """
    INSERT INTO metadata.series_metadata (
        source_id, source_series_id, series_name,
        frequency, category, geography
    ) VALUES (1, %s, %s, %s, %s, %s)
    ON CONFLICT (source_id, source_series_id)
    DO UPDATE SET
        series_name = EXCLUDED.series_name,
        last_updated = NOW();
    """

    cursor.execute(query, (series_id, name, "daily", category, sub_category))
    conn.commit()
    cursor.close()


def insert_observations(conn, series_id: str, observations: list):
    """Insert observations into timeseries table with batch processing"""
    cursor = conn.cursor()

    # Get internal series_id
    cursor.execute(
        """
        SELECT series_id FROM metadata.series_metadata
        WHERE source_id = 1 AND source_series_id = %s
    """,
        (series_id,),
    )

    result = cursor.fetchone()
    if not result:
        cursor.close()
        raise ValueError(f"Series {series_id} not found in metadata")

    internal_series_id = result[0]

    inserted = 0
    skipped = 0
    batch_size = 100
    batch = []

    for obs in observations:
        # Skip missing values
        if obs.get("value") == ".":
            skipped += 1
            continue

        try:
            batch.append((internal_series_id, obs["date"], float(obs["value"]), "good"))

            # Execute batch when full
            if len(batch) >= batch_size:
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

        except Exception as e:
            print(f"    ⚠️  Error in batch: {e}")
            skipped += 1
            conn.rollback()
            continue

    # Insert remaining batch
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
        except Exception as e:
            print(f"    ⚠️  Error in final batch: {e}")
            skipped += len(batch)
            conn.rollback()

    conn.commit()
    cursor.close()

    return inserted, skipped


def main():
    """Main ingestion orchestrator with comprehensive logging"""
    print("\n" + "=" * 60)
    print("🚀 Project Chronos: Master Data Ingestion (Production)")
    print("=" * 60 + "\n")

    start_time = datetime.now()

    # Locate catalog
    catalog_path = (
        Path(__file__).parent.parent.parent / "database" / "seeds" / "time-series_catalog.csv"
    )

    if not catalog_path.exists():
        print(f"❌ Catalog not found: {catalog_path}")
        sys.exit(1)

    print(f"📊 Loading catalog: {catalog_path}")
    planned_series = load_catalog(catalog_path)

    if not planned_series:
        print("⚠️  No 'Planned' FRED series found in catalog")
        sys.exit(0)

    print(f"✅ Found {len(planned_series)} FRED series marked as 'Planned'\n")

    # Connect to database
    conn = get_db_connection()
    print("✅ Connected to database\n")

    # Ensure FRED exists
    ensure_data_source(conn)

    # Initial warmup delay
    print("⏱️  Initial warmup delay (3 seconds)...\n")
    time.sleep(3)

    # Process each series
    total_observations = 0
    successful_series = 0
    failed_series = []

    for i, series in enumerate(planned_series, 1):
        series_id = series["series_id"]
        name = series["name"]

        print(f"[{i}/{len(planned_series)}] Processing: {series_id}")
        print(f"    Name: {name}")

        try:
            # Fetch data
            observations = fetch_fred_data(series_id, initial_delay=2 if i > 1 else 1)

            if not observations:
                print("    ⚠️  No data returned")
                # log_ingestion_event(conn, series_id, "failed", 0, "No data returned from API")
                failed_series.append((series_id, "No data"))
                continue

            print(f"    ✅ Fetched {len(observations)} observations")

            # Insert metadata
            insert_series_metadata(
                conn, series_id, name, series["category"], series["sub_category"]
            )

            # Insert observations
            inserted, skipped = insert_observations(conn, series_id, observations)

            print(f"    ✅ Inserted {inserted} observations (skipped {skipped})")

            # Log success
            # log_ingestion_event(conn, series_id, "success", inserted)

            total_observations += inserted
            successful_series += 1

        except ValueError as e:
            # Known error (series doesn't exist)
            error_msg = str(e)
            print(f"    ❌ {error_msg}")
            # log_ingestion_event(conn, series_id, "failed", 0, error_msg)
            failed_series.append((series_id, error_msg))

        except Exception as e:
            # Unexpected error
            error_msg = f"{type(e).__name__}: {str(e)}"
            print(f"    ❌ Error: {error_msg}")
            # log_ingestion_event(conn, series_id, "failed", 0, error_msg)
            failed_series.append((series_id, error_msg))
            conn.rollback()

        print()

    # Close connection
    conn.close()

    # Calculate duration
    duration = datetime.now() - start_time

    # Summary
    print("=" * 60)
    print("✅ INGESTION COMPLETE!")
    print("=" * 60)
    print("\n📊 Summary:")
    print(f"  Total series processed: {len(planned_series)}")
    print(f"  Successful: {successful_series}")
    print(f"  Failed: {len(failed_series)}")
    print(f"  Total observations loaded: {total_observations:,}")
    print(f"  Duration: {duration}")
    print(f"  Average: {duration.total_seconds() / len(planned_series):.1f}s per series")

    if failed_series:
        print("\n⚠️  Failed series:")
        for series_id, error in failed_series:
            error_short = error[:80] + "..." if len(error) > 80 else error
            print(f"    - {series_id}: {error_short}")

    print("\n" + "=" * 60 + "\n")

    # Exit code based on success rate
    success_rate = (successful_series / len(planned_series)) * 100
    if success_rate >= 80:
        print(f"✅ Success rate: {success_rate:.1f}% - PASSED")
        sys.exit(0)
    else:
        print(f"⚠️  Success rate: {success_rate:.1f}% - REVIEW NEEDED")
        sys.exit(1)


if __name__ == "__main__":
    main()
