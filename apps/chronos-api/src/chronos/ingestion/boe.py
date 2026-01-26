"""
Bank of England API plugin
"""

import time
from typing import Any

import requests

from .base import DataSourcePlugin


class BOEPlugin(DataSourcePlugin):
    """Bank of England API plugin"""

    BASE_URL = "https://www.bankofengland.co.uk/boeapps/database/_iadb-fromshowcolumns.asp"

    def get_source_id(self) -> int:
        return 3

    def get_source_name(self) -> str:
        return "Bank of England"

    def fetch_observations(self, series_id: str, max_retries: int = 3) -> list[dict[str, Any]]:
        """Fetch observations from BoE API"""
        params = {
            "CodeVer": "new",
            "xml.x": "yes",
            "Datefrom": "01/Jan/2020",  # Shorter timeframe
            "Dateto": "now",
            "SeriesCodes": series_id,
        }

        headers = {
            "User-Agent": "Mozilla/5.0 (compatible; ProjectChronos/1.0; +https://github.com/project-chronos)",
            "Accept": "application/xml, text/xml",
        }

        for attempt in range(max_retries):
            try:
                if attempt > 0:
                    time.sleep(5)

                response = requests.get(self.BASE_URL, params=params, headers=headers, timeout=30)
                response.raise_for_status()

                # BoE returns XML - parse it
                import xml.etree.ElementTree as ElementTree

                root = ElementTree.fromstring(response.content)  # nosec B314 - prototype code

                valid_obs = []
                for cube in root.findall(
                    ".//{http://www.SDMX.org/resources/SDMXML/schemas/v1_0/generic}Obs"
                ):
                    date_elem = cube.find(
                        ".//{http://www.SDMX.org/resources/SDMXML/schemas/v1_0/generic}ObsValue"
                    )
                    time_elem = cube.find(
                        ".//{http://www.SDMX.org/resources/SDMXML/schemas/v1_0/generic}Time"
                    )

                    if date_elem is not None and time_elem is not None:
                        value = date_elem.get("value")
                        date = time_elem.text

                        if value and value != "":
                            valid_obs.append({"date": date, "value": value})

                return valid_obs

            except requests.exceptions.HTTPError as e:
                if e.response.status_code == 403:
                    raise ValueError(
                        f"BoE blocked request for {series_id} - may need authentication"
                    ) from e
                elif e.response.status_code == 404:
                    raise ValueError(f"Series {series_id} not found in BoE") from e
                else:
                    raise
            except Exception as e:
                if attempt < max_retries - 1:
                    time.sleep(5)
                    continue
                else:
                    raise ValueError(f"Error fetching {series_id}: {str(e)}") from e

        return []
