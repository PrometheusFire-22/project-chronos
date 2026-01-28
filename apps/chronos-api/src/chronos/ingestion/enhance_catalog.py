#!/usr/bin/env python3
"""
Catalog Enhancement Script: Auto-populate unit metadata from APIs

This script:
1. Reads the existing catalog CSV
2. Fetches metadata from FRED/StatsCan/Valet APIs for each series
3. Infers unit_type, scalar_factor, and display_units
4. Generates an enhanced CSV for manual review
"""
import csv
import os
import time
from pathlib import Path

import requests
from dotenv import load_dotenv

# Load environment
repo_root = Path(__file__).resolve().parents[5]
load_dotenv(repo_root / ".env.local")
load_dotenv(repo_root / ".env")

FRED_API_KEY = os.getenv("FRED_API_KEY")


def infer_unit_metadata_from_fred(series_id: str) -> dict:
    """
    Fetch series metadata from FRED API and infer unit metadata

    Returns dict with: unit_type, scalar_factor, display_units, raw_units
    """
    if not FRED_API_KEY:
        return {
            "unit_type": "OTHER",
            "scalar_factor": 1.0,
            "display_units": "Unknown",
            "raw_units": "",
        }

    url = "https://api.stlouisfed.org/fred/series"
    params = {"series_id": series_id, "api_key": FRED_API_KEY, "file_type": "json"}

    try:
        time.sleep(0.5)  # Rate limiting
        response = requests.get(url, params=params, timeout=10)
        response.raise_for_status()
        data = response.json()

        if "seriess" in data and len(data["seriess"]) > 0:
            series_info = data["seriess"][0]
            units = series_info.get("units", "")
            units_short = series_info.get("units_short", "")
            title = series_info.get("title", "")

            # Infer unit_type and scalar_factor
            unit_type, scalar_factor, display_units = infer_from_fred_units(
                units, units_short, title
            )

            return {
                "unit_type": unit_type,
                "scalar_factor": scalar_factor,
                "display_units": display_units,
                "raw_units": units,
                "raw_units_short": units_short,
            }

        return {
            "unit_type": "OTHER",
            "scalar_factor": 1.0,
            "display_units": "Unknown",
            "raw_units": "",
        }

    except Exception as e:
        print(f"   ⚠️  Error fetching FRED metadata for {series_id}: {e}")
        return {
            "unit_type": "OTHER",
            "scalar_factor": 1.0,
            "display_units": "Unknown",
            "raw_units": "",
        }


def infer_from_fred_units(units: str, units_short: str, title: str) -> tuple[str, float, str]:
    """
    Infer unit_type, scalar_factor, and display_units from FRED metadata

    FRED units examples:
    - "Percent" -> PERCENTAGE, 1.0 (FRED stores as actual %, not decimal)
    - "Billions of Dollars" -> CURRENCY, 1000000000, "Billions USD"
    - "Millions of Dollars" -> CURRENCY, 1000000, "Millions USD"
    - "Thousands" -> COUNT, 1000, "Thousands"
    - "Index 2015=100" -> INDEX, 1.0, "Index 2015=100"
    """
    units_lower = units.lower()

    # Percentage detection
    if "percent" in units_lower or "rate" in units_lower:
        # FRED stores percentages as actual percentages (5.0 = 5%), not decimals
        # So scalar_factor = 1.0 (no transformation needed)
        return ("PERCENTAGE", 1.0, "% (percentage points)")

    # Currency detection
    if "dollar" in units_lower:
        if "billions" in units_lower:
            return ("CURRENCY", 1000000000.0, "Billions USD")
        elif "millions" in units_lower:
            return ("CURRENCY", 1000000.0, "Millions USD")
        elif "thousands" in units_lower:
            return ("CURRENCY", 1000.0, "Thousands USD")
        else:
            return ("CURRENCY", 1.0, "USD")

    # Count/Quantity detection
    if "thousands of" in units_lower and "dollar" not in units_lower:
        # e.g., "Thousands of Persons"
        return (
            "COUNT",
            1000.0,
            f"Thousands of {units.split('of')[-1].strip() if 'of' in units else 'Units'}",
        )

    if "millions of" in units_lower and "dollar" not in units_lower:
        return (
            "COUNT",
            1000000.0,
            f"Millions of {units.split('of')[-1].strip() if 'of' in units else 'Units'}",
        )

    # Index detection
    if "index" in units_lower or "index" in title.lower():
        return ("INDEX", 1.0, units if units else "Index")

    # Basis points
    if "basis point" in units_lower:
        return ("RATE", 1.0, "Basis Points")

    # Default
    return ("OTHER", 1.0, units if units else "Unknown")


def infer_unit_metadata_from_statscan(series_id: str) -> dict:
    """
    Fetch series metadata from StatsCan API and infer unit metadata

    StatsCan provides scalarFactorCode and scalarFactorDesc
    """
    # Strip V prefix if present
    vector_num = series_id.lstrip("Vv")

    url = "https://www150.statcan.gc.ca/t1/wds/rest/getDataFromVectorsAndLatestNPeriods"
    payload = [{"vectorId": int(vector_num), "latestN": 1}]

    try:
        time.sleep(0.5)
        response = requests.post(url, json=payload, timeout=10)
        response.raise_for_status()
        results = response.json()

        if results and len(results) > 0 and results[0].get("status") == "SUCCESS":
            vector_data = results[0].get("object", {})

            # Get scalar factor
            scalar_code = vector_data.get("scalarFactorCode", 0)
            scalar_desc = vector_data.get("scalarFactorDesc", "")

            # scalarFactorCode in StatsCan:
            # 0 = units, 3 = thousands, 6 = millions, 9 = billions
            scalar_map = {0: 1.0, 3: 1000.0, 6: 1000000.0, 9: 1000000000.0}
            scalar_factor = scalar_map.get(scalar_code, 1.0)

            # Infer unit type from description
            unit_type = "OTHER"
            display_units = scalar_desc or "Units"

            # Check if it's a percentage/rate
            coord = vector_data.get("coordinateDescriptionEn", "").lower()
            if "rate" in coord or "percent" in coord or "ratio" in coord:
                unit_type = "PERCENTAGE"
                display_units = "% (percentage points)"
                scalar_factor = 1.0  # StatsCan stores as actual percentages
            elif "index" in coord:
                unit_type = "INDEX"
                display_units = "Index"
                scalar_factor = 1.0
            elif "dollar" in coord.lower():
                unit_type = "CURRENCY"
                display_units = f"{scalar_desc} CAD" if scalar_desc else "CAD"
            elif scalar_code > 0:
                unit_type = "COUNT"
                display_units = scalar_desc or f"x10^{scalar_code} units"

            return {
                "unit_type": unit_type,
                "scalar_factor": scalar_factor,
                "display_units": display_units,
                "raw_scalar_code": scalar_code,
                "raw_scalar_desc": scalar_desc,
            }

        return {"unit_type": "OTHER", "scalar_factor": 1.0, "display_units": "Unknown"}

    except Exception as e:
        print(f"   ⚠️  Error fetching StatsCan metadata for {series_id}: {e}")
        return {"unit_type": "OTHER", "scalar_factor": 1.0, "display_units": "Unknown"}


def infer_unit_metadata_from_valet(series_id: str) -> dict:
    """
    Infer metadata for Bank of Canada Valet series

    Valet doesn't have great metadata APIs, so we use heuristics
    """
    # Manual mapping for common BoC series
    valet_mappings = {
        "FXCADUSD": {"unit_type": "RATE", "scalar_factor": 1.0, "display_units": "CAD per USD"},
        "V39079": {"unit_type": "RATE", "scalar_factor": 1.0, "display_units": "% (annual)"},
        "V36610": {
            "unit_type": "CURRENCY",
            "scalar_factor": 1000000.0,
            "display_units": "Millions CAD",
        },
    }

    if series_id in valet_mappings:
        return valet_mappings[series_id]

    # Default
    return {"unit_type": "OTHER", "scalar_factor": 1.0, "display_units": "Unknown"}


def enhance_catalog():
    """Main function to enhance catalog with unit metadata"""

    catalog_path = repo_root / "database" / "seeds" / "time-series_catalog_expanded.csv"
    output_path = repo_root / "database" / "seeds" / "time-series_catalog_with_units.csv"

    print("=" * 70)
    print("📊 Catalog Enhancement: Auto-populate Unit Metadata")
    print("=" * 70)
    print()
    print(f"Input:  {catalog_path}")
    print(f"Output: {output_path}")
    print()

    # Read existing catalog
    with open(catalog_path, encoding="utf-8") as f:
        reader = csv.DictReader(f)
        series_list = list(reader)

    print(f"Loaded {len(series_list)} series from catalog")
    print()

    # Enhance each series
    enhanced_series = []

    for i, series in enumerate(series_list, 1):
        series_id = series["series_id"]
        source = series["source"]

        print(f"[{i}/{len(series_list)}] {series_id} ({source})")

        # Fetch metadata based on source
        if source == "FRED":
            metadata = infer_unit_metadata_from_fred(series_id)
        elif source == "StatsCan":
            metadata = infer_unit_metadata_from_statscan(series_id)
        elif source == "Valet":
            metadata = infer_unit_metadata_from_valet(series_id)
        else:
            metadata = {"unit_type": "OTHER", "scalar_factor": 1.0, "display_units": "Unknown"}

        # Merge with existing series data
        enhanced = {**series, **metadata}
        enhanced_series.append(enhanced)

        print(
            f"   → {metadata['unit_type']}, x{metadata['scalar_factor']}, '{metadata['display_units']}'"
        )

    # Write enhanced catalog
    fieldnames = list(series_list[0].keys()) + [
        "unit_type",
        "scalar_factor",
        "display_units",
        "raw_units",
        "raw_units_short",
        "raw_scalar_code",
        "raw_scalar_desc",
    ]

    # Clean up fieldnames (remove keys that might not exist in all rows)
    fieldnames = [
        f for f in fieldnames if not f.startswith("raw_") or any(f in s for s in enhanced_series)
    ]

    with open(output_path, "w", encoding="utf-8", newline="") as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames, extrasaction="ignore")
        writer.writeheader()
        writer.writerows(enhanced_series)

    print()
    print("=" * 70)
    print(f"✅ Enhanced catalog saved to: {output_path}")
    print("=" * 70)
    print()
    print("⚠️  MANUAL REVIEW REQUIRED:")
    print("   1. Open the enhanced catalog CSV")
    print("   2. Verify unit_type, scalar_factor, and display_units are correct")
    print("   3. Fix any 'Unknown' or 'OTHER' entries")
    print("   4. When satisfied, replace the original catalog:")
    print(f"      mv {output_path} {catalog_path}")
    print()


if __name__ == "__main__":
    enhance_catalog()
