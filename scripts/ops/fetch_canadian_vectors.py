import csv
import logging
import os

import requests

# Configure logging
logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s")
logger = logging.getLogger(__name__)

# Constants
CATALOG_PATH = os.path.join(os.getcwd(), "database/seeds/time-series_catalog.csv")
STATSCAN_API_URL = (
    "https://www150.statcan.gc.ca/t1/wds/rest/getDataFromCubePidCoordAndLatestNPeriods"
)

# Table 14-10-0287-01: Labour force characteristics
# Coord Pattern: Geo.7.1.1.1.1 (Unemployment rate, Total Sex, 15+, Estimate, Seasonally Adjusted)
UNEMPLOYMENT_COORDS = {
    "National": {"Canada": "1.7.1.1.1.1"},
    "Provincial": {
        "Newfoundland and Labrador": "2.7.1.1.1.1",
        "Prince Edward Island": "3.7.1.1.1.1",
        "Nova Scotia": "4.7.1.1.1.1",
        "New Brunswick": "5.7.1.1.1.1",
        "Québec": "6.7.1.1.1.1",
        "Ontario": "7.7.1.1.1.1",
        "Manitoba": "8.7.1.1.1.1",
        "Saskatchewan": "9.7.1.1.1.1",
        "Alberta": "10.7.1.1.1.1",
        "British Columbia": "11.7.1.1.1.1",
    },
}

# Table 18-10-0205-01: New Housing Price Index
# Coord Pattern: Geo.1 (Total house and land)
HPI_COORDS = {
    "National": {"Canada": "1.1"},
    "Provincial": {
        "Newfoundland and Labrador": "3.1",
        "Prince Edward Island": "5.1",
        "Nova Scotia": "7.1",
        "New Brunswick": "9.1",
        "Québec": "11.1",
        "Ontario": "17.1",
        "Manitoba": "29.1",
        "Saskatchewan": "31.1",
        "Alberta": "34.1",
        "British Columbia": "37.1",
    },
}


def fetch_vector_ids(coords: dict[str, str], product_id: int) -> dict[str, str]:
    """Fetch vector IDs from StatsCan API given coordinates."""
    payload = []

    # Preserve order for mapping back
    regions = list(coords.keys())

    for region in regions:
        payload.append({"productId": product_id, "coordinate": coords[region], "latestN": 1})

    try:
        headers = {
            "Content-Type": "application/json",
        }
        response = requests.post(STATSCAN_API_URL, json=payload, headers=headers)
        if response.status_code != 200:
            logger.error(f"Status: {response.status_code}, Content: {response.text[:200]}")
        response.raise_for_status()
        results = response.json()

        vector_map = {}
        for i, result in enumerate(results):
            region = regions[i]
            if result.get("status") == "SUCCESS" and result.get("object", {}).get(
                "vectorDataPoint"
            ):
                # StatsCan returns raw number (e.g. 12345), Valet/Catalog uses 'V12345'
                raw_id = result["object"]["vectorDataPoint"][0]["vectorId"]
                vector_map[region] = f"V{raw_id}"
            else:
                logger.warning(f"Failed to fetch vector for {region}: {result.get('status')}")

        return vector_map

    except Exception as e:
        logger.error(f"Error fetching vectors for product {product_id}: {e}")
        return {}


def append_to_catalog(vectors: dict[str, str], category: str, subcategory: str, frequency: str):
    """Append new series to the CSV catalog if they don't explicitly exist."""

    # Read existing
    existing_ids = set()
    rows = []
    if os.path.exists(CATALOG_PATH):
        with open(CATALOG_PATH, newline="") as f:
            reader = csv.DictReader(f)
            # Just read the file to get existing IDs
            for row in reader:
                existing_ids.add(row["series_id"])
                rows.append(row)

    new_rows = []

    for region, vector_id in vectors.items():
        if vector_id in existing_ids:
            logger.info(f"Skipping existing series {vector_id} ({region})")
            continue

        # Define Row Schema
        # series_id,source,status,series_name,asset_class,geography_type,geography_name,frequency,category,subcategory
        new_row = {
            "series_id": vector_id,
            "source": "StatsCan",
            "status": "Active",
            "series_name": f"{subcategory} - {region}",
            "asset_class": "Macro",
            "geography_type": "Provincial",
            "geography_name": region,
            "frequency": frequency,
            "category": category,
            "subcategory": subcategory,
        }
        new_rows.append(new_row)
        logger.info(f"Queued for addition: {vector_id} ({region} {subcategory})")

    if new_rows:
        # Append to file
        with open(CATALOG_PATH, "a", newline="") as f:
            writer = csv.DictWriter(
                f,
                fieldnames=[
                    "series_id",
                    "source",
                    "status",
                    "series_name",
                    "asset_class",
                    "geography_type",
                    "geography_name",
                    "frequency",
                    "category",
                    "subcategory",
                ],
            )
            # Check if empty (rewrite header if needed, but assuming file exists/has header)
            # writer.writeheader()
            for row in new_rows:
                writer.writerow(row)
        logger.info(f"Added {len(new_rows)} new series to catalog.")
    else:
        logger.info("No new series to add.")


def main():
    logger.info("Starting Canadian Vector Sync...")

    # 1. Unemployment (Provincial)
    logger.info("Fetching Unemployment Vectors...")
    unemployment_vectors = fetch_vector_ids(UNEMPLOYMENT_COORDS["Provincial"], 14100287)
    append_to_catalog(unemployment_vectors, "Employment", "Unemployment Rate", "Monthly")

    # 2. HPI (Provincial)
    logger.info("Fetching HPI Vectors...")
    hpi_vectors = fetch_vector_ids(HPI_COORDS["Provincial"], 18100205)
    append_to_catalog(hpi_vectors, "Housing", "New Housing Price Index", "Monthly")

    # 3. Deactivate FRED Series
    logger.info("Deactivating FRED series...")
    deactivate_fred_series()
    deactivate_fred_series()

    logger.info("Sync Complete.")


def deactivate_fred_series():
    """Set status to 'Deprecated' for all FRED source entries in the catalog."""
    if not os.path.exists(CATALOG_PATH):
        logger.warning("Catalog file not found.")
        return

    updated_rows = []
    modified_count = 0

    # mode = "r"  <-- Removed unused variable assignment
    # Use fieldnames from first read
    fieldnames = []

    with open(CATALOG_PATH, newline="") as f:
        reader = csv.DictReader(f)
        if reader.fieldnames:
            fieldnames = list(reader.fieldnames)

        for row in reader:
            if row["source"] == "FRED" and row["status"] == "Active":
                row["status"] = "Deprecated"
                modified_count += 1
            updated_rows.append(row)

    if modified_count > 0 and fieldnames:
        with open(CATALOG_PATH, "w", newline="") as f:
            writer = csv.DictWriter(f, fieldnames=fieldnames)
            writer.writeheader()
            writer.writerows(updated_rows)
        logger.info(f"Deactivated {modified_count} FRED series.")
    else:
        logger.info("No active FRED series found to deactivate.")


if __name__ == "__main__":
    main()
