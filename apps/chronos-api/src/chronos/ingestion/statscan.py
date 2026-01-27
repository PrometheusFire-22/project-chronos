"""
Statistics Canada WDS API plugin
"""

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

        endpoint = f"{self.BASE_URL}/getBulkVectorDataByRange"

        # Default range: last 15 years to current
        end_date = datetime.now(UTC).strftime("%Y-%m-%d")
        start_date = "2010-01-01"

        payload = {
            "vectorIds": [int(vector_num)],
            "startDataPointReleaseDate": start_date + "T00:00",
            "endDataPointReleaseDate": end_date + "T00:00",
        }

        # headers = {"Content-Type": "application/json", "Accept": "application/json"}
        # print(f"    → Requesting vector {vector_num} from {start_date} to {end_date}")

        max_retries = 3
        for attempt in range(max_retries):
            try:
                response = requests.post(endpoint, json=payload, timeout=30)
                response.raise_for_status()

                results = response.json()
                if not results or results[0].get("status") != "SUCCESS":
                    error_status = results[0].get("status") if results else "Empty"
                    print(f"    ⚠️ StatsCan API returned non-success status: {error_status}")
                    return []

                vector_data = results[0].get("object", {}).get("vectorDataPoint", [])

                valid_obs = []
                for pt in vector_data:
                    val_str = str(pt.get("value", ""))
                    ref_date = pt.get("refPer", "")

                    # Skip empty or invalid
                    if val_str == "" or val_str is None:
                        continue

                    try:
                        # Try parsing value
                        val = float(val_str)
                        valid_obs.append({"date": ref_date, "value": val})
                    except ValueError:
                        continue

                return valid_obs

            except Exception as e:
                print(f"    ⚠️ StatsCan Fetch Attempt {attempt + 1} failed: {e}")
                if attempt < max_retries - 1:
                    continue
                else:
                    raise

        return []
