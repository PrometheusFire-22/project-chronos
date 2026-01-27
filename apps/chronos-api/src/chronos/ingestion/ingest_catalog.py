import os
import re

import pandas as pd
from sqlalchemy import create_engine, select
from sqlalchemy.orm import sessionmaker

from chronos.config.settings import settings
from chronos.database.models import DataCatalog
from chronos.utils.logging import get_logger

logger = get_logger(__name__)


def parse_markdown_catalog(file_path: str) -> pd.DataFrame:
    """Parses the StatsCan master list markdown file."""
    data = []
    current_category = None

    with open(file_path) as f:
        for line in f:
            line = line.strip()
            if line.startswith("## "):
                current_category = line.replace("## ", "").strip()
            elif line.startswith("|") and not line.startswith("| Product ID"):
                parts = [p.strip() for p in line.split("|")]
                if len(parts) >= 4:
                    # | Product ID | Title | CANSIM Reference |
                    product_id = parts[1]
                    title = parts[2]
                    # Clean title to remove links if present [Title](link)
                    title_match = re.search(r"\[(.*?)\]", title)
                    if title_match:
                        title = title_match.group(1)

                    if product_id and product_id != "---":
                        data.append(
                            {
                                "source": "statscan",
                                "series_id": product_id,  # Using Product ID as primary series ID for table level
                                "product_id": product_id,
                                "title": title,
                                "description": f"Category: {current_category}",
                                "frequency": None,  # Not available in MD
                                "units": None,  # Not available in MD
                            }
                        )

    return pd.DataFrame(data)


def parse_fred_catalog(file_path: str) -> pd.DataFrame:
    """Parses the FRED expanded catalog CSV file."""
    df = pd.read_csv(file_path)

    # Strict mappings to override/clean metadata for specific important series
    strict_mappings = {
        "FXEURCAD": {
            "title": "Euro to Canadian Dollar Exchange Rate",
            "units": "CAD",
            "frequency": "Daily",
        },
        "EXHOSLUSM495S": {
            "title": "Existing Home Sales",
            "units": "Number of Units",
            "frequency": "Monthly",
        },
        "GDPC1": {
            "title": "Real Gross Domestic Product",
            "units": "Billions of Chained 2017 Dollars",
            "frequency": "Quarterly",
        },
        "FEDFUNDS": {
            "title": "Federal Funds Effective Rate",
            "units": "Percent",
            "frequency": "Monthly",
        },
        "CPIAUCSL": {
            "title": "US CPI (1982-1984=100)",
            "units": "Index 1982-1984=100",
            "frequency": "Monthly",
        },
        "DCOILWTICO": {
            "title": "WTI Crude Oil Prices",
            "units": "Dollars per Barrel",
            "frequency": "Daily",
        },
        "DEXUSEU": {
            "title": "US / Euro FX Rate",
            "units": "USD per EUR",
            "frequency": "Daily",
        },
        "DEXCAUS": {
            "title": "Canada / US FX Rate",
            "units": "CAD per USD",
            "frequency": "Daily",
        },
        "DEXMXUS": {
            "title": "Mexico / US FX Rate",
            "units": "MXN per USD",
            "frequency": "Daily",
        },
    }

    # Map CSV columns to DataCatalog model fields
    mapped_data = []
    for _, row in df.iterrows():
        series_id = row["series_id"]

        # Default values from CSV
        title = row["series_name"]
        frequency = row.get("frequency")
        unit = None

        # Apply strict mapping if present
        if series_id in strict_mappings:
            mapping = strict_mappings[series_id]
            title = mapping.get("title", title)
            frequency = mapping.get("frequency", frequency)
            unit = mapping.get("units", unit)

        # Harmonize frequency
        if frequency == "D":
            frequency = "Daily"
        elif frequency == "M":
            frequency = "Monthly"
        elif frequency == "Q":
            frequency = "Quarterly"
        elif frequency == "A":
            frequency = "Annual"

        # Construct a descriptive string for context
        description = f"Category: {row.get('category', '')} - {row.get('subcategory', '')} | Geography: {row.get('geography_name', '')} ({row.get('geography_type', '')})"

        mapped_data.append(
            {
                "source": "fred",
                "series_id": series_id,
                "product_id": None,  # FRED series ID is unique enough
                "title": title,
                "frequency": frequency,
                "units": unit,  # CSV doesn't have units column explicitly, but mapping might
                "description": description,
            }
        )

    return pd.DataFrame(mapped_data)


def ingest_catalog():
    """Ingests the catalog into the database."""
    engine = create_engine(settings.database_url)
    session_factory = sessionmaker(bind=engine)
    session = session_factory()

    try:
        # 1. StatsCan Ingestion
        md_path = "statscan_master_list.md"
        if os.path.exists(md_path):
            logger.info(f"Parsing StatsCan catalog from {md_path}...")
            df_statscan = parse_markdown_catalog(md_path)
            logger.info(f"Found {len(df_statscan)} StatsCan entries.")
            upsert_catalog_data(session, df_statscan)
        else:
            logger.warning(f"StatsCan catalog file not found: {md_path}")

        # 2. FRED Ingestion
        fred_path = "database/seeds/time-series_catalog_expanded.csv"
        if os.path.exists(fred_path):
            logger.info(f"Parsing FRED catalog from {fred_path}...")
            df_fred = parse_fred_catalog(fred_path)
            logger.info(f"Found {len(df_fred)} FRED entries.")
            upsert_catalog_data(session, df_fred)
        else:
            logger.warning(f"FRED catalog file not found: {fred_path}")

        session.commit()
        logger.info("Catalog ingestion complete.")

    except Exception as e:
        logger.error(f"Ingestion failed: {e}")
        session.rollback()
    finally:
        session.close()


def upsert_catalog_data(session, df: pd.DataFrame):
    """Helper function to upsert catalog data."""
    if df.empty:
        return

    for _, row in df.iterrows():
        existing = session.execute(
            select(DataCatalog).where(
                DataCatalog.source == row["source"], DataCatalog.series_id == row["series_id"]
            )
        ).scalar_one_or_none()

        if not existing:
            catalog_entry = DataCatalog(
                source=row["source"],
                series_id=row["series_id"],
                product_id=row["product_id"],
                title=row["title"],
                frequency=row["frequency"],
                units=row["units"],
                description=row["description"],
            )
            session.add(catalog_entry)
        else:
            # Update fields
            existing.title = row["title"]
            existing.description = row["description"]
            existing.frequency = row["frequency"]
            # existing.units = row['units'] # Optional update


if __name__ == "__main__":
    ingest_catalog()
