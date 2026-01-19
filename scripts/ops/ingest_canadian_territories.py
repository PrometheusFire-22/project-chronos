#!/usr/bin/env python3
"""
Add Canadian territory data (Yukon, NWT, Nunavut) from Statistics Canada
"""
import os

import requests
from sqlalchemy import create_engine, text

DATABASE_URL = os.getenv("DATABASE_URL")
STATSCAN_API = "https://www150.statcan.gc.ca/t1/wds/rest/getDataFromVectorsAndLatestNPeriods"

# Territory vector IDs (from StatsCan table 14-10-0287-01)
TERRITORY_UNEMPLOYMENT = {
    2062826: "Yukon",
    2063015: "Northwest Territories",
    2063204: "Nunavut",
}


def fetch_and_ingest(vector_id, geography):
    """Fetch and ingest a single vector"""
    print(f"Fetching {geography} (v{vector_id})...", end=" ")

    try:
        payload = [{"vectorId": vector_id, "latestN": 500}]
        response = requests.post(STATSCAN_API, json=payload, timeout=60)
        response.raise_for_status()

        results = response.json()
        if not results or results[0].get("status") != "SUCCESS":
            print("❌ API error")
            return False

        observations = results[0]["object"]["vectorDataPoint"]

        engine = create_engine(DATABASE_URL)
        with engine.connect() as conn:
            result = conn.execute(
                text(
                    "SELECT source_id FROM metadata.data_sources WHERE source_name = 'Statistics Canada'"
                )
            )
            source_id = result.fetchone()[0]

            series_id_str = f"v{vector_id}"
            series_name = f"Unemployment Rate - {geography}"

            conn.execute(
                text(
                    """
                    INSERT INTO metadata.series_metadata
                    (source_id, source_series_id, series_name, geography, frequency, category)
                    VALUES (:source_id, :series_id, :name, :geo, 'Monthly', 'Employment')
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

            result = conn.execute(
                text(
                    "SELECT series_id FROM metadata.series_metadata WHERE source_id = :source_id AND source_series_id = :series_id"
                ),
                {"source_id": source_id, "series_id": series_id_str},
            )
            internal_series_id = result.fetchone()[0]

            inserted = 0
            for obs in observations:
                if obs["value"] is not None:
                    conn.execute(
                        text(
                            """
                            INSERT INTO timeseries.economic_observations
                            (series_id, observation_date, value, quality_flag)
                            VALUES (:series_id, :date, :value, 'good')
                            ON CONFLICT (series_id, observation_date) DO UPDATE SET value = EXCLUDED.value
                        """
                        ),
                        {
                            "series_id": internal_series_id,
                            "date": obs["refPer"][:10],
                            "value": obs["value"],
                        },
                    )
                    inserted += 1

            conn.commit()
            print(f"✓ {inserted} observations")
            return True

    except Exception as e:
        print(f"❌ {str(e)[:60]}")
        return False


def main():
    print("Adding Canadian Territory Data...\n")

    for vector_id, geography in TERRITORY_UNEMPLOYMENT.items():
        fetch_and_ingest(vector_id, geography)

    print("\nTerritory data ingestion complete!")


if __name__ == "__main__":
    main()
