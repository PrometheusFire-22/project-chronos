"""
FRED (Federal Reserve Economic Data) plugin
"""

import time
from typing import Any

import requests

from .base import DataSourcePlugin


class FREDPlugin(DataSourcePlugin):
    """Federal Reserve Economic Data API plugin"""

    BASE_URL = "https://api.stlouisfed.org/fred/series/observations"

    def __init__(self, api_key: str):
        super().__init__(api_key)
        if not api_key:
            raise ValueError("FRED API key required")

    def get_source_id(self) -> int:
        return 1

    def get_source_name(self) -> str:
        return "Federal Reserve Economic Data"

    def fetch_observations(self, series_id: str, max_retries: int = 3) -> list[dict[str, Any]]:
        """Fetch observations from FRED API"""
        params = {
            "series_id": series_id,
            "api_key": self.api_key,
            "file_type": "json",
        }

        for attempt in range(max_retries):
            try:
                time.sleep(2 + attempt)  # Rate limiting

                response = requests.get(self.BASE_URL, params=params, timeout=30)
                response.raise_for_status()

                data = response.json()
                observations = data.get("observations", [])

                # Filter out missing values
                valid_obs = []
                for obs in observations:
                    if obs.get("value") != ".":
                        valid_obs.append({"date": obs["date"], "value": obs["value"]})

                return valid_obs

            except requests.exceptions.HTTPError as e:
                if e.response.status_code == 400:
                    raise ValueError(f"Series {series_id} not found in FRED")
                elif e.response.status_code == 429:
                    wait_time = (attempt + 1) * 10
                    time.sleep(wait_time)
                    continue
                else:
                    raise
            except requests.exceptions.RequestException:
                if attempt < max_retries - 1:
                    continue
                else:
                    raise

        return []
