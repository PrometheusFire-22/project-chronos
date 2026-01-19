#!/usr/bin/env python3
"""
Retry failed HPI series from Statistics Canada
"""
import os

import requests
from sqlalchemy import create_engine, text

DATABASE_URL = os.getenv("DATABASE_URL")
STATSCAN_API = "https://www150.statcan.gc.ca/t1/wds/rest/getDataFromVectorsAndLatestNPeriods"

# Failed HPI vectors
FAILED_HPI = {
    111955454: "Prince Edward Island",
    111955460: "Nova Scotia",
    111955490: "Ontario",
    111955526: "Manitoba",
    111955541: "Alberta",
    111955550: "British Columbia",
}


def fetch_and_ingest(vector_id, geography):
    """Fetch and ingest a single vector"""
    print(f"Retrying {geography} (v{vector_id})...", end=" ")

    try:
        # Fetch data
        payload = [{"vectorId": vector_id, "latestN": 500}]
        response = requests.post(STATSCAN_API, json=payload, timeout=60)
        response.raise_for_status()

        results = response.json()
        if not results or results[0].get("status") != "SUCCESS":
            print("❌ API returned non-success status")
            return False

        observations = results[0]["object"]["vectorDataPoint"]

        # Ingest to database
        engine = create_engine(DATABASE_URL)
        with engine.connect() as conn:
            # Get source_id and internal series_id
            result = conn.execute(
                text(
                    "SELECT source_id FROM metadata.data_sources WHERE source_name = 'Statistics Canada'"
                )
            )
            source_id = result.fetchone()[0]

            series_id_str = f"v{vector_id}"
            series_name = f"New Housing Price Index - {geography}"

            # Insert metadata
            conn.execute(
                text(
                    """
                    INSERT INTO metadata.series_metadata
                    (source_id, source_series_id, series_name, geography, frequency, category)
                    VALUES (:source_id, :series_id, :name, :geo, 'Monthly', 'Housing')
                    ON CONFLICT (source_id, source_series_id) DO UPDATE SET
                        series_name = EXCLUDED.series_name
                """
                ),
                {
                    "source_id": source_id,
                    "series_id": series_id_str,
                    "name": series_name,
                    "geo": geography,
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
                ref_date = obs["refPer"][:10]
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
            print(f"✓ {inserted} observations")
            return True

    except Exception as e:
        print(f"❌ {str(e)[:60]}")
        return False


def main():
    print("Retrying failed HPI series...\n")

    success_count = 0
    for vector_id, geography in FAILED_HPI.items():
        if fetch_and_ingest(vector_id, geography):
            success_count += 1

    print(f"\nRetry complete: {success_count}/{len(FAILED_HPI)} succeeded")


if __name__ == "__main__":
    main()
