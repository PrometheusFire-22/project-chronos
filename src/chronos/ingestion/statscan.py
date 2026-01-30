"""
Statistics Canada WDS API plugin
"""

import time
from typing import Any

import requests

from .base import DataSourcePlugin


class StatsCanPlugin(DataSourcePlugin):
    """Statistics Canada Web Data Service (WDS) API plugin"""

    BASE_URL = "https://www150.statcan.gc.ca/t1/wds/rest"

    # Common UOM codes from StatsCan
    UOM_CODES = {
        239: ("Percent", "%", "PERCENTAGE"),
        240: ("Number", "Number", "COUNT"),
        241: ("Dollars", "$", "CURRENCY"),
        242: ("Index", "Index", "INDEX"),
        243: ("Rate", "Rate", "RATE"),
        244: ("Persons", "Persons", "COUNT"),
        245: ("Thousands", "Thousands", "COUNT"),
        246: ("Millions", "Millions", "COUNT"),
        247: ("Billions", "Billions", "CURRENCY"),
        249: ("Ratio", "Ratio", "RATE"),
    }

    # Frequency codes
    FREQUENCY_MAP = {
        6: "Monthly",
        9: "Quarterly",
        12: "Annual",
        3: "Weekly",
        8: "Daily",
    }

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
        payload = [{"vectorId": int(vector_num), "latestN": 1000}]

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

    def fetch_metadata(self, series_id: str) -> dict[str, Any]:
        """Fetch series metadata from StatsCan WDS API"""
        # Vector IDs are numeric, strip 'V' or 'v'
        vector_num = int(series_id.lstrip("Vv"))

        endpoint = f"{self.BASE_URL}/getSeriesInfoFromVector"
        payload = [{"vectorId": vector_num}]

        try:
            time.sleep(0.5)  # Rate limiting
            headers = {"Content-Type": "application/json", "Accept": "application/json"}
            response = requests.post(endpoint, json=payload, headers=headers, timeout=30)
            response.raise_for_status()

            results = response.json()
            if not results or results[0].get("status") != "SUCCESS":
                return {}

            data = results[0].get("object", {})

            # Get UOM info
            uom_code = data.get("memberUomCode")
            uom_info = self.UOM_CODES.get(uom_code, ("", "", "OTHER"))

            # Get frequency
            freq_code = data.get("frequencyCode")
            frequency = self.FREQUENCY_MAP.get(freq_code, "Unknown")

            # Get table/product ID for source_table_id
            product_id = str(data.get("productId", ""))

            # Series title (English)
            series_title = data.get("SeriesTitleEn", "")

            # Determine seasonal adjustment from title
            seasonal_adj = "NA"
            title_lower = series_title.lower()
            if "seasonally adjusted" in title_lower:
                seasonal_adj = "SA"
            elif "not seasonally adjusted" in title_lower or "unadjusted" in title_lower:
                seasonal_adj = "NSA"

            return {
                "units": uom_info[0],
                "units_short": uom_info[1],
                "unit_type": uom_info[2],
                "display_units": uom_info[1],
                "seasonal_adjustment": seasonal_adj,
                "frequency": frequency,
                "notes": series_title,  # Full series title as documentation
                "source_table_id": product_id,
                "last_updated": None,
            }

        except Exception as e:
            print(f"Warning: Could not fetch metadata for StatsCan vector {vector_num}: {e}")
            return {}
