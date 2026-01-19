#!/usr/bin/env python3
"""
Ingest Canadian provincial data from Statistics Canada WDS API
Uses the working getDataFromVectorsAndLatestNPeriods endpoint
"""
import os

import requests
from sqlalchemy import create_engine, text

# Database connection
DATABASE_URL = os.getenv("DATABASE_URL")

# StatsCan WDS API
STATSCAN_API = "https://www150.statcan.gc.ca/t1/wds/rest/getDataFromVectorsAndLatestNPeriods"

# Vector IDs (without 'v' prefix - API expects numeric)
UNEMPLOYMENT_VECTORS = {
    2063004: "Newfoundland and Labrador",
    2063193: "Prince Edward Island",
    2063382: "Nova Scotia",
    2063571: "New Brunswick",
    2063760: "Québec",
    2063949: "Ontario",
    2064138: "Manitoba",
    2064327: "Saskatchewan",
    2064516: "Alberta",
    2064705: "British Columbia",
}

HPI_VECTORS = {
    111955448: "Newfoundland and Labrador",
    111955454: "Prince Edward Island",
    111955460: "Nova Scotia",
    111955466: "New Brunswick",
    111955472: "Québec",
    111955490: "Ontario",
    111955526: "Manitoba",
    111955532: "Saskatchewan",
    111955541: "Alberta",
    111955550: "British Columbia",
}


def fetch_vector_data(vector_id, latest_n=500):
    """Fetch data for a single vector"""
    payload = [{"vectorId": vector_id, "latestN": latest_n}]

    response = requests.post(STATSCAN_API, json=payload, timeout=30)
    response.raise_for_status()

    results = response.json()
    if results and results[0].get("status") == "SUCCESS":
        return results[0]["object"]["vectorDataPoint"]
    return []


def ingest_to_database(vector_id, geography, observations, metric_name):
    """Insert data into database"""
    engine = create_engine(DATABASE_URL)

    with engine.connect() as conn:
        # Ensure source exists
        result = conn.execute(
            text(
                "SELECT source_id FROM metadata.data_sources WHERE source_name = 'Statistics Canada'"
            )
        )
        row = result.fetchone()
        if row:
            source_id = row[0]
        else:
            result = conn.execute(
                text(
                    "INSERT INTO metadata.data_sources (source_name) VALUES ('Statistics Canada') RETURNING source_id"
                )
            )
            source_id = result.fetchone()[0]
            conn.commit()

        # Insert metadata
        series_id_str = f"v{vector_id}"
        series_name = f"{metric_name} - {geography}"

        conn.execute(
            text(
                """
                INSERT INTO metadata.series_metadata
                (source_id, source_series_id, series_name, geography, frequency, category)
                VALUES (:source_id, :series_id, :name, :geo, 'Monthly', :category)
                ON CONFLICT (source_id, source_series_id) DO UPDATE SET
                    series_name = EXCLUDED.series_name,
                    geography = EXCLUDED.geography
            """
            ),
            {
                "source_id": source_id,
                "series_id": series_id_str,
                "name": series_name,
                "geo": geography,
                "category": "Employment" if "Unemployment" in metric_name else "Housing",
            },
        )
        conn.commit()

        # Get internal series_id
        result = conn.execute(
            text(
                "SELECT series_id FROM metadata.series_metadata WHERE source_id = :source_id AND source_series_id = :series_id"
            ),
            {"source_id": source_id, "series_id": series_id_str},
        )
        internal_series_id = result.fetchone()[0]

        # Insert observations
        inserted = 0
        for obs in observations:
            ref_date = obs["refPer"][:10]  # Extract YYYY-MM-DD
            value = obs["value"]

            if value is not None:
                conn.execute(
                    text(
                        """
                        INSERT INTO timeseries.economic_observations
                        (series_id, observation_date, value, quality_flag)
                        VALUES (:series_id, :date, :value, 'good')
                        ON CONFLICT (series_id, observation_date) DO UPDATE SET value = EXCLUDED.value
                    """
                    ),
                    {"series_id": internal_series_id, "date": ref_date, "value": value},
                )
                inserted += 1

        conn.commit()
        return inserted


def main():
    print("=" * 80)
    print("STATSCAN PROVINCIAL DATA INGESTION")
    print("=" * 80)

    total_series = 0
    total_observations = 0

    # Ingest unemployment data
    print("\n1. Ingesting Unemployment Rate data...")
    for vector_id, geography in UNEMPLOYMENT_VECTORS.items():
        print(f"   {geography} (v{vector_id})...", end=" ")
        try:
            observations = fetch_vector_data(vector_id)
            if observations:
                inserted = ingest_to_database(
                    vector_id, geography, observations, "Unemployment Rate"
                )
                print(f"✓ {inserted} observations")
                total_observations += inserted
                total_series += 1
            else:
                print("⚠️ No data")
        except Exception as e:
            print(f"❌ {str(e)[:50]}")

    # Ingest HPI data
    print("\n2. Ingesting Housing Price Index data...")
    for vector_id, geography in HPI_VECTORS.items():
        print(f"   {geography} (v{vector_id})...", end=" ")
        try:
            observations = fetch_vector_data(vector_id)
            if observations:
                inserted = ingest_to_database(
                    vector_id, geography, observations, "New Housing Price Index"
                )
                print(f"✓ {inserted} observations")
                total_observations += inserted
                total_series += 1
            else:
                print("⚠️ No data")
        except Exception as e:
            print(f"❌ {str(e)[:50]}")

    print("\n" + "=" * 80)
    print("INGESTION COMPLETE!")
    print(f"  Series ingested: {total_series}")
    print(f"  Total observations: {total_observations}")
    print("=" * 80)


if __name__ == "__main__":
    main()
