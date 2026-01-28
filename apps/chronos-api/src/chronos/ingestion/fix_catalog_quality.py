#!/usr/bin/env python3
"""
Fix known catalog data quality issues programmatically

This script applies systematic fixes for:
1. Wrong BoC Balance Sheet series ID
2. Duplicate entries
3. Discontinued series
4. Manual overrides for series that couldn't be auto-detected
"""
import csv
from pathlib import Path

repo_root = Path(__file__).resolve().parents[5]
input_path = repo_root / "database" / "seeds" / "time-series_catalog_with_units.csv"
output_path = repo_root / "database" / "seeds" / "time-series_catalog_fixed.csv"


# Manual overrides for series that couldn't be auto-detected
MANUAL_OVERRIDES = {
    # FRED
    "EXHOSLUSM495S": {
        "unit_type": "COUNT",
        "scalar_factor": 1000000.0,
        "display_units": "Millions of Units (SAAR)",
    },
    "NAPM": {
        "status": "Inactive",
        "unit_type": "INDEX",
        "scalar_factor": 1.0,
        "display_units": "Index (Discontinued)",
    },
    "NAPMNOI": {
        "status": "Inactive",
        "unit_type": "INDEX",
        "scalar_factor": 1.0,
        "display_units": "Index (Discontinued)",
    },
    # Valet (Bank of Canada) - Manual entry since API doesn't provide metadata
    "V41690973": {"unit_type": "INDEX", "scalar_factor": 1.0, "display_units": "Index 2002=100"},
    "V41690914": {"unit_type": "INDEX", "scalar_factor": 1.0, "display_units": "Index 2002=100"},
    "V41693271": {"unit_type": "INDEX", "scalar_factor": 1.0, "display_units": "Index 2002=100"},
    "V41693240": {"unit_type": "INDEX", "scalar_factor": 1.0, "display_units": "Index 2002=100"},
    "V62305752": {
        "unit_type": "CURRENCY",
        "scalar_factor": 1000000.0,
        "display_units": "Millions CAD (2012)",
    },
    "V62305753": {
        "unit_type": "CURRENCY",
        "scalar_factor": 1000000.0,
        "display_units": "Millions CAD",
    },
    "V2062815": {
        "unit_type": "CURRENCY",
        "scalar_factor": 1000000.0,
        "display_units": "Millions CAD (2012)",
    },
    "V2091072": {
        "unit_type": "PERCENTAGE",
        "scalar_factor": 1.0,
        "display_units": "% (percentage points)",
    },
    "V2091073": {
        "unit_type": "COUNT",
        "scalar_factor": 1000.0,
        "display_units": "Thousands of Persons",
    },
    "V2091074": {
        "unit_type": "COUNT",
        "scalar_factor": 1000.0,
        "display_units": "Thousands of Persons",
    },
    "V2091075": {
        "unit_type": "PERCENTAGE",
        "scalar_factor": 1.0,
        "display_units": "% (percentage points)",
    },
    "V735": {
        "unit_type": "COUNT",
        "scalar_factor": 1000.0,
        "display_units": "Thousands of Units (SAAR)",
    },
    "V1992067": {
        "unit_type": "CURRENCY",
        "scalar_factor": 1000000.0,
        "display_units": "Millions CAD (2012)",
    },
    "FXUSDCAD": {"unit_type": "RATE", "scalar_factor": 1.0, "display_units": "CAD per USD"},
    "FXEURCAD": {"unit_type": "RATE", "scalar_factor": 1.0, "display_units": "CAD per EUR"},
    # Fix wrong BoC Balance Sheet series
    "V39079": {
        "status": "Inactive",
        "series_name": "Bank Rate (Deprecated - was incorrectly used)",
        "unit_type": "PERCENTAGE",
        "scalar_factor": 1.0,
        "display_units": "% (annual)",
    },
    "V36610": {
        "status": "Active",
        "series_name": "Bank of Canada Balance Sheet - Total Assets",
        "unit_type": "CURRENCY",
        "scalar_factor": 1000000.0,
        "display_units": "Millions CAD",
    },
    # More Valet/StatsCan series
    "V62305723": {
        "unit_type": "CURRENCY",
        "scalar_factor": 1000000.0,
        "display_units": "Millions CAD (2012)",
    },
    "V62305724": {
        "unit_type": "CURRENCY",
        "scalar_factor": 1000000.0,
        "display_units": "Millions CAD (2012)",
    },
    "V62305725": {
        "unit_type": "CURRENCY",
        "scalar_factor": 1000000.0,
        "display_units": "Millions CAD (2012)",
    },
    "V122530": {"unit_type": "PERCENTAGE", "scalar_factor": 1.0, "display_units": "% (annual)"},
    "V122531": {"unit_type": "PERCENTAGE", "scalar_factor": 1.0, "display_units": "% (annual)"},
    "V80691311": {"unit_type": "INDEX", "scalar_factor": 1.0, "display_units": "Index 2010=100"},
    "V41692930": {"unit_type": "INDEX", "scalar_factor": 1.0, "display_units": "Index 2010=100"},
    "V52367348": {"unit_type": "INDEX", "scalar_factor": 1.0, "display_units": "Index"},
    "V80245347": {"unit_type": "INDEX", "scalar_factor": 1.0, "display_units": "Index"},
    "V122620": {
        "unit_type": "CURRENCY",
        "scalar_factor": 1000000.0,
        "display_units": "Millions CAD",
    },
    # FX Rates
    "FXGBPCAD": {"unit_type": "RATE", "scalar_factor": 1.0, "display_units": "CAD per GBP"},
    "FXJPYCAD": {"unit_type": "RATE", "scalar_factor": 1.0, "display_units": "CAD per 100 JPY"},
    "FXCADMXN": {"unit_type": "RATE", "scalar_factor": 1.0, "display_units": "MXN per CAD"},
    # Commodities (FRED)
    "DCOILBRENTEU": {
        "unit_type": "CURRENCY",
        "scalar_factor": 1.0,
        "display_units": "USD per Barrel",
    },
    "GOLDAMGBD228NLBM": {
        "unit_type": "CURRENCY",
        "scalar_factor": 1.0,
        "display_units": "USD per Troy Ounce",
    },
    # FRED Alternative Canada Data
    "CANGDPASQ": {
        "unit_type": "CURRENCY",
        "scalar_factor": 1000000.0,
        "display_units": "Millions CAD",
    },
    # Provincial unemployment rates (StatsCan v-codes - all percentages)
    "v2063004": {
        "unit_type": "PERCENTAGE",
        "scalar_factor": 1.0,
        "display_units": "% (percentage points)",
    },
    "v2063193": {
        "unit_type": "PERCENTAGE",
        "scalar_factor": 1.0,
        "display_units": "% (percentage points)",
    },
    "v2063382": {
        "unit_type": "PERCENTAGE",
        "scalar_factor": 1.0,
        "display_units": "% (percentage points)",
    },
    "v2063571": {
        "unit_type": "PERCENTAGE",
        "scalar_factor": 1.0,
        "display_units": "% (percentage points)",
    },
    "v2063760": {
        "unit_type": "PERCENTAGE",
        "scalar_factor": 1.0,
        "display_units": "% (percentage points)",
    },
    "v2063949": {
        "unit_type": "PERCENTAGE",
        "scalar_factor": 1.0,
        "display_units": "% (percentage points)",
    },
    "v2064138": {
        "unit_type": "PERCENTAGE",
        "scalar_factor": 1.0,
        "display_units": "% (percentage points)",
    },
    "v2064327": {
        "unit_type": "PERCENTAGE",
        "scalar_factor": 1.0,
        "display_units": "% (percentage points)",
    },
    "v2064516": {
        "unit_type": "PERCENTAGE",
        "scalar_factor": 1.0,
        "display_units": "% (percentage points)",
    },
    "v2064705": {
        "unit_type": "PERCENTAGE",
        "scalar_factor": 1.0,
        "display_units": "% (percentage points)",
    },
}

# Series to remove (duplicates)
SERIES_TO_REMOVE = set()  # Will be populated based on duplicate detection


def fix_catalog():
    """Apply systematic fixes to catalog"""

    print("=" * 70)
    print("🔧 Fixing Catalog Data Quality Issues")
    print("=" * 70)
    print()
    print(f"Input:  {input_path}")
    print(f"Output: {output_path}")
    print()

    # Read catalog
    with open(input_path, encoding="utf-8") as f:
        reader = csv.DictReader(f)
        series_list = list(reader)
        fieldnames = reader.fieldnames

    print(f"Loaded {len(series_list)} series")
    print()

    # Apply fixes
    fixed_series = []
    removed_count = 0
    fixed_count = 0

    for series in series_list:
        series_id = series["series_id"]

        # Skip series marked for removal
        if series_id in SERIES_TO_REMOVE:
            removed_count += 1
            print(f"  ✂️  Removing duplicate: {series_id}")
            continue

        # Apply manual overrides
        if series_id in MANUAL_OVERRIDES:
            overrides = MANUAL_OVERRIDES[series_id]
            for key, value in overrides.items():
                if key in series:
                    series[key] = value
            fixed_count += 1
            print(
                f"  ✅ Fixed: {series_id} → {series.get('unit_type', 'N/A')}, {series.get('display_units', 'N/A')}"
            )

        fixed_series.append(series)

    # Write fixed catalog
    with open(output_path, "w", encoding="utf-8", newline="") as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(fixed_series)

    print()
    print("=" * 70)
    print(f"✅ Fixed catalog saved to: {output_path}")
    print("=" * 70)
    print()
    print("📊 Summary:")
    print(f"   • Series processed: {len(series_list)}")
    print(f"   • Series fixed: {fixed_count}")
    print(f"   • Duplicates removed: {removed_count}")
    print(f"   • Final count: {len(fixed_series)}")
    print()
    print("⚠️  NEXT STEPS:")
    print("   1. Review the fixed catalog CSV")
    print("   2. Manually fix any remaining 'OTHER' or 'Unknown' entries")
    print("   3. When satisfied, replace the original catalog:")
    print(f"      mv {output_path} {input_path}")
    print()


if __name__ == "__main__":
    fix_catalog()
