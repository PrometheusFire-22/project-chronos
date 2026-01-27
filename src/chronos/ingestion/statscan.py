"""
Statistics Canada WDS API plugin
"""

import time
from datetime import UTC, datetime
from typing import Any

import requests

from .base import DataSourcePlugin


class StatsCanPlugin(DataSourcePlugin):
    """Statistics Canada Web Data Service (WDS) API plugin"""

    BASE_URL = "https://www150.statcan.gc.ca/t1/wds/rest"

    def get_source_id(self) -> int:
        # We will let the CLI determine the actual source_id from the database
        return 0

    def get_source_name(self) -> str:
        return "Statistics Canada"

    def fetch_observations(self, series_id: str, max_retries: int = 3) -> list[dict[str, Any]]:
        """
        Fetch observations from StatsCan WDS API
        series_id is the vector ID (e.g., 'V12345' or 'v12345')
        """
        # Vector IDs in StatsCan API are numeric, strip both 'V' and 'v'
        vector_num = series_id.lstrip("Vv")

        endpoint = f"{self.BASE_URL}/getDataFromVectorsAndLatestNPeriods"
        
        # Request a large number of latest periods to cover historical data
        payload = [
            {
                "vectorId": int(vector_num),
                "latestN": 1000
            }
        ]

        for attempt in range(max_retries):
            try:
                if attempt > 0:
                    time.sleep(5)

                headers = {"Content-Type": "application/json", "Accept": "application/json"}

                print(f"    → Requesting vector {vector_num} (latest 1000 periods)")
                response = requests.post(endpoint, json=payload, headers=headers, timeout=30)

                if response.status_code != 200:
                    print(f"    → Response status: {response.status_code}")
                    print(f"    → Response body: {response.text[:300]}")

                response.raise_for_status()

                results = response.json()
                if not results or results[0].get("status") != "SUCCESS":
                    error_status = results[0].get("status") if results else "Empty"
                    print(f"    ⚠️ StatsCan API returned non-success status: {error_status}")
                    return []

                vector_data = results[0].get("object", {}).get("vectorDataPoint", [])

                valid_obs = []
                for pt in vector_data:
                    ref_period = pt.get("refPer")  # format varies: YYYY-MM-DD or YYYY-MM
                    value = pt.get("value")

                    if ref_period and value is not None:
                        # Normalize date
                        date_str = ref_period
                        if len(date_str) == 7:  # YYYY-MM
                            date_str += "-01"

                        valid_obs.append({"date": date_str, "value": str(value)})

                # Sort by date
                valid_obs.sort(key=lambda x: x["date"])

                return valid_obs

            except Exception as e:
                print(f"    ⚠️ StatsCan Fetch Attempt {attempt + 1} failed: {e}")
                if attempt < max_retries - 1:
                    continue
                else:
                    raise

        return []
