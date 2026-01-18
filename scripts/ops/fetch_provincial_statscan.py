#!/usr/bin/env python3
"""
Fetch provincial unemployment and HPI data from Statistics Canada
Using the stats_can library for clean programmatic access
"""
import os
import time

import stats_can
from requests.exceptions import HTTPError
from sqlalchemy import create_engine, text

# Database connection
CONN_STRING = os.environ["DATABASE_URL"]

# Rate limiting configuration
MAX_RETRIES = 5
INITIAL_BACKOFF = 5  # seconds
MAX_BACKOFF = 300  # 5 minutes


def fetch_with_retry(func, *args, **kwargs):
    """
    Wrapper to retry API calls with exponential backoff on rate limits
    """
    for attempt in range(MAX_RETRIES):
        try:
            return func(*args, **kwargs)
        except HTTPError as e:
            if e.response.status_code == 429:
                if attempt < MAX_RETRIES - 1:
                    backoff = min(INITIAL_BACKOFF * (2**attempt), MAX_BACKOFF)
                    print(
                        f"\n⚠️  Rate limited (429). Waiting {backoff}s before retry {attempt + 1}/{MAX_RETRIES}..."
                    )
                    time.sleep(backoff)
                else:
                    print("\n❌ Max retries reached. Giving up.")
                    raise
            else:
                raise
        except Exception as e:
            print(f"\n❌ Unexpected error: {e}")
            raise


def fetch_provincial_unemployment():
    """
    Fetch provincial unemployment data from Table 14-10-0287-03
    """
    print("=" * 80)
    print("FETCHING PROVINCIAL UNEMPLOYMENT DATA")
    print("=" * 80)

    # Table 14-10-0287-03: Labour force characteristics by province, monthly, seasonally adjusted
    table_id = "14100287"  # Without hyphens for stats_can

    print(f"\nDownloading table {table_id}...")
    df = fetch_with_retry(stats_can.sc.zip_table_to_dataframe, table_id)

    print(f"✓ Downloaded {len(df)} rows")
    print(f"\nColumns: {list(df.columns)}")

    # Filter for unemployment rate only
    if "Labour force characteristics" in df.columns:
        unemployment_df = df[df["Labour force characteristics"] == "Unemployment rate"].copy()
        print(f"\nFiltered to {len(unemployment_df)} unemployment rate rows")

        # Show sample
        print("\nSample data:")
        print(unemployment_df.head(10))

        # Show unique provinces
        if "GEO" in unemployment_df.columns:
            provinces = unemployment_df["GEO"].unique()
            print(f"\nProvinces found: {list(provinces)}")

        return unemployment_df
    else:
        print("\n⚠️  Column 'Labour force characteristics' not found")
        print(f"Available columns: {list(df.columns)}")
        return df


def fetch_provincial_hpi():
    """
    Fetch provincial housing price index from Table 18-10-0205
    """
    print("\n" + "=" * 80)
    print("FETCHING PROVINCIAL HOUSING PRICE INDEX")
    print("=" * 80)

    # Table 18-10-0205: New housing price index, monthly
    table_id = "18100205"  # Without hyphens

    print(f"\nDownloading table {table_id}...")
    # Add small delay between table downloads to avoid rate limits
    time.sleep(2)
    df = fetch_with_retry(stats_can.sc.zip_table_to_dataframe, table_id)

    print(f"✓ Downloaded {len(df)} rows")
    print(f"\nColumns: {list(df.columns)}")

    # Show sample
    print("\nSample data:")
    print(df.head(10))

    # Show unique geographies
    if "GEO" in df.columns:
        geos = df["GEO"].unique()
        print(f"\nGeographies found ({len(geos)}): {list(geos)[:10]}...")

    return df


def map_provinces_to_dguid():
    """
    Get province name to DGUID mapping from database
    """
    engine = create_engine(CONN_STRING)

    with engine.connect() as conn:
        result = conn.execute(
            text(
                """
            SELECT
                prename as province_name,
                dguid,
                pruid
            FROM geospatial.ca_provinces
            ORDER BY prename
        """
            )
        )

        mapping = {}
        print("\n" + "=" * 80)
        print("PROVINCE TO DGUID MAPPING")
        print("=" * 80)
        for row in result:
            mapping[row[0]] = {"dguid": row[1], "pruid": row[2]}
            print(f"  {row[0]:<30} -> DGUID: {row[1]}, PRUID: {row[2]}")

        return mapping


def main():
    # Fetch data
    unemployment_df = fetch_provincial_unemployment()
    hpi_df = fetch_provincial_hpi()

    # Get DGUID mapping
    province_mapping = map_provinces_to_dguid()

    print("\n" + "=" * 80)
    print("DATA FETCH COMPLETE")
    print("=" * 80)
    print(f"\nUnemployment rows: {len(unemployment_df)}")
    print(f"HPI rows: {len(hpi_df)}")
    print(f"Provinces mapped: {len(province_mapping)}")


if __name__ == "__main__":
    main()
