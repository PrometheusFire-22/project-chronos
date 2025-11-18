#!/usr/bin/env python3
"""
Project Chronos: Master Data Ingestion Orchestrator
===================================================
Purpose: Data-driven ingestion system that reads asset_catalog.csv
Pattern: Configuration over Code - add new series without changing code
"""

import csv
import logging
import sys
from datetime import datetime
from pathlib import Path

import click

# Add src to path
sys.path.insert(0, str(Path(__file__).parent.parent / "src"))

from chronos.config.settings import Settings
from chronos.database.connection import DatabaseConnection
from chronos.ingestion.fred import FREDIngestion
from chronos.ingestion.valet import ValetIngestion

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="[%(asctime)s] %(levelname)s - %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
)
logger = logging.getLogger(__name__)


class MasterIngestion:
    """
    Orchestrates data ingestion based on asset_catalog.csv

    This class replaces the old bash scripts by reading the catalog
    and dynamically calling the appropriate ingestion modules.
    """

    def __init__(self, catalog_path: Path):
        self.catalog_path = catalog_path
        self.settings = Settings()
        self.db = DatabaseConnection(self.settings)

        # Initialize ingestors
        self.fred = FREDIngestion(self.db, self.settings.fred_api_key)
        self.valet = ValetIngestion(self.db)

    def load_catalog(self, status_filter: str = "Planned") -> list[dict]:
        """
        Load series from asset_catalog.csv

        Args:
            status_filter: Only load series with this status

        Returns:
            List of series dictionaries
        """
        series_list = []

        with open(self.catalog_path) as f:
            reader = csv.DictReader(f)
            for row in reader:
                # Filter by status
                if row.get("ingest_status") == status_filter:
                    series_list.append(row)

        logger.info(f"📋 Loaded {len(series_list)} series with status '{status_filter}'")
        return series_list

    def ingest_series(self, series: dict) -> bool:
        """
        Ingest a single series based on its source

        Args:
            series: Dictionary from asset_catalog.csv row

        Returns:
            True if successful, False otherwise
        """
        source = series.get("data_source", "").upper()
        series_id = series.get("source_series_id", "")

        try:
            if source == "FRED":
                logger.info(f"🔄 Ingesting FRED series: {series_id}")
                self.fred.ingest_series(series_id)
                return True

            elif source == "VALET":
                logger.info(f"🔄 Ingesting Valet series: {series_id}")
                self.valet.ingest_series(series_id)
                return True

            else:
                logger.warning(f"⚠️  Unknown source '{source}' for series {series_id}")
                return False

        except Exception as e:
            logger.error(f"❌ Failed to ingest {series_id}: {str(e)}")
            return False

    def update_catalog_status(self, series_id: str, new_status: str):
        """
        Update the ingest_status in asset_catalog.csv

        Note: In production, you might update a database table instead
        """
        # Read all rows
        rows = []
        with open(self.catalog_path) as f:
            reader = csv.DictReader(f)
            fieldnames = reader.fieldnames
            for row in reader:
                if row["source_series_id"] == series_id:
                    row["ingest_status"] = new_status
                    row["last_ingested"] = datetime.now().strftime("%Y-%m-%d")
                rows.append(row)

        # Write back
        with open(self.catalog_path, "w", newline="") as f:
            writer = csv.DictWriter(f, fieldnames=fieldnames)
            writer.writeheader()
            writer.writerows(rows)

    def run_full_ingestion(self, status_filter: str = "Planned", update_catalog: bool = True):
        """
        Run full ingestion workflow

        Args:
            status_filter: Which series to ingest
            update_catalog: Whether to update catalog after success
        """
        logger.info("=" * 60)
        logger.info("🚀 Starting Master Data Ingestion")
        logger.info("=" * 60)

        # Load series from catalog
        series_list = self.load_catalog(status_filter)

        if not series_list:
            logger.warning("⚠️  No series found to ingest")
            return

        # Track results
        successful = []
        failed = []

        # Ingest each series
        for i, series in enumerate(series_list, 1):
            series_id = series["source_series_id"]
            logger.info(f"\n[{i}/{len(series_list)}] Processing: {series_id}")

            if self.ingest_series(series):
                successful.append(series_id)
                if update_catalog:
                    self.update_catalog_status(series_id, "Ingested")
            else:
                failed.append(series_id)

        # Summary
        logger.info("\n" + "=" * 60)
        logger.info("📊 Ingestion Summary")
        logger.info("=" * 60)
        logger.info(f"✅ Successful: {len(successful)}")
        logger.info(f"❌ Failed: {len(failed)}")

        if failed:
            logger.warning(f"\nFailed series: {', '.join(failed)}")

        logger.info("=" * 60)


@click.command()
@click.option(
    "--catalog",
    type=click.Path(exists=True),
    default="database/seeds/asset_catalog.csv",
    help="Path to asset_catalog.csv",
)
@click.option("--status", default="Planned", help="Ingest series with this status")
@click.option("--no-update", is_flag=True, help="Do not update catalog status after ingestion")
@click.option("--series", multiple=True, help="Ingest specific series IDs (overrides --status)")
def main(catalog, status, no_update, series):
    """
    Master data ingestion orchestrator for Project Chronos

    Examples:
        # Ingest all "Planned" series
        python master_ingest.py

        # Ingest all "Active" series for daily updates
        python master_ingest.py --status Active

        # Ingest specific series
        python master_ingest.py --series GDP --series UNRATE

        # Dry run (don't update catalog)
        python master_ingest.py --no-update
    """
    catalog_path = Path(catalog)
    orchestrator = MasterIngestion(catalog_path)

    # If specific series provided, override catalog
    if series:
        logger.info(f"📍 Ingesting specific series: {', '.join(series)}")
        for series_id in series:
            # Create mock series dict
            series_dict = {
                "source_series_id": series_id,
                "data_source": "FRED",  # TODO: detect source automatically
            }
            orchestrator.ingest_series(series_dict)
    else:
        # Run full catalog ingestion
        orchestrator.run_full_ingestion(status_filter=status, update_catalog=not no_update)


if __name__ == "__main__":
    main()
