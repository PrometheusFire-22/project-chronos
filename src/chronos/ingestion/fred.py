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
    METADATA_URL = "https://api.stlouisfed.org/fred/series"

    def __init__(self, api_key: str):
        super().__init__(api_key)
        if not api_key:
            raise ValueError("FRED API key required")

    def get_source_id(self) -> int:
        return 1

    def get_source_name(self) -> str:
        return "Federal Reserve Economic Data"

    def fetch_metadata(self, series_id: str) -> dict[str, Any]:
        """Fetch series metadata from FRED API"""
        params = {
            "series_id": series_id,
            "api_key": self.api_key,
            "file_type": "json",
        }

        try:
            time.sleep(1)  # Rate limiting
            response = requests.get(self.METADATA_URL, params=params, timeout=30)
            response.raise_for_status()
            data = response.json()

            if "seriess" in data and len(data["seriess"]) > 0:
                series = data["seriess"][0]

                # Infer unit_type from units string
                units = series.get("units", "")
                unit_type = self._infer_unit_type(units, series_id)

                # Map FRED seasonal adjustment to DB enum
                seasonal_adj_raw = series.get("seasonal_adjustment", "")
                seasonal_adj = self._map_seasonal_adjustment(seasonal_adj_raw)

                return {
                    "units": units,
                    "units_short": series.get("units_short", ""),
                    "unit_type": unit_type,
                    "display_units": series.get("units_short") or units,
                    "seasonal_adjustment": seasonal_adj,
                    "frequency": series.get("frequency", ""),
                    "notes": series.get("notes", ""),
                    "last_updated": series.get("last_updated", ""),
                }

            return {}

        except Exception as e:
            print(f"Warning: Could not fetch metadata for {series_id}: {e}")
            return {}

    def _infer_unit_type(self, units: str, _series_id: str) -> str:
        """Infer unit_type enum from FRED units string"""
        units_lower = units.lower()

        # Check for percentage-related terms
        if any(term in units_lower for term in ["percent", "rate", "%"]):
            # Distinguish between rates and percentages
            if "basis" in units_lower:
                return "RATE"
            return "PERCENTAGE"

        # Currency
        if any(term in units_lower for term in ["dollar", "usd", "$", "euro", "cad"]):
            return "CURRENCY"

        # Index
        if any(term in units_lower for term in ["index", "idx", "="]):
            return "INDEX"

        # Count (people, thousands, millions of persons)
        if any(
            term in units_lower for term in ["persons", "people", "number", "count", "thousands of"]
        ):
            return "COUNT"

        return "OTHER"

    def _map_seasonal_adjustment(self, fred_value: str) -> str:
        """Map FRED seasonal adjustment strings to database ENUM values"""
        if not fred_value:
            return "NA"

        fred_lower = fred_value.lower()

        # Seasonally Adjusted Annual Rate
        if "annual rate" in fred_lower or "saar" in fred_lower:
            return "SAAR"

        # Seasonally Adjusted
        if "seasonally adjusted" in fred_lower and "not" not in fred_lower:
            return "SA"

        # Not Seasonally Adjusted
        if "not seasonally" in fred_lower or "unadjusted" in fred_lower:
            return "NSA"

        return "NA"

    def fetch_observations(
        self, series_id: str, start_date: str | None = None, max_retries: int = 3
    ) -> list[dict[str, Any]]:
        """Fetch observations from FRED API"""
        params = {
            "series_id": series_id,
            "api_key": self.api_key,
            "file_type": "json",
        }
        if start_date:
            params["observation_start"] = start_date

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
                    raise ValueError(f"Series {series_id} not found in FRED") from e
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
