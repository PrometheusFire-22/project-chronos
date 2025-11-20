"""
Base plugin class for economic data sources
"""

from abc import ABC, abstractmethod
from typing import Any


class DataSourcePlugin(ABC):
    """Base class for data source plugins"""

    def __init__(self, api_key: str = None):
        self.api_key = api_key

    @abstractmethod
    def fetch_observations(self, series_id: str) -> list[dict[str, Any]]:
        """
        Fetch observations for a series

        Returns:
            List of dicts with 'date' and 'value' keys
        """
        pass

    @abstractmethod
    def get_source_id(self) -> int:
        """Return database source_id for this plugin"""
        pass

    @abstractmethod
    def get_source_name(self) -> str:
        """Return human-readable source name"""
        pass
