"""
Bank of Canada Valet API plugin
"""

import time
from typing import Any

import requests

from .base import DataSourcePlugin


class ValetPlugin(DataSourcePlugin):
    """Bank of Canada Valet API plugin"""

    BASE_URL = "https://www.bankofcanada.ca/valet/observations"

    def get_source_id(self) -> int:
        return 2

    def get_source_name(self) -> str:
        return "Bank of Canada Valet API"

    def fetch_observations(self, series_id: str, max_retries: int = 3) -> list[dict[str, Any]]:
        """Fetch observations from Valet API"""
        url = f"{self.BASE_URL}/{series_id}/json"

        for attempt in range(max_retries):
            try:
                # Gentle rate limiting: 1 second between requests
                if attempt > 0:
                    time.sleep(3)  # Only sleep on retries

                response = requests.get(url, timeout=30)
                response.raise_for_status()

                data = response.json()
                observations = data.get("observations", [])

                # Convert Valet format to standard format
                valid_obs = []
                for obs in observations:
                    # Valet uses dynamic keys: obs[series_id]['v'] for value
                    if series_id in obs and obs[series_id] is not None:
                        series_data = obs[series_id]
                        if isinstance(series_data, dict) and "v" in series_data:
                            value = series_data["v"]
                            if value is not None:
                                valid_obs.append({"date": obs.get("d"), "value": str(value)})

                return valid_obs

            except requests.exceptions.HTTPError as e:
                if e.response.status_code == 404:
                    raise ValueError(f"Series {series_id} not found in Valet") from e
                elif e.response.status_code == 429:
                    # Rate limited - wait longer
                    time.sleep(10 * (attempt + 1))
                    continue
                else:
                    raise
            except requests.exceptions.RequestException:
                if attempt < max_retries - 1:
                    time.sleep(5)
                    continue
                else:
                    raise

        return []
