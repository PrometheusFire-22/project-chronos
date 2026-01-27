import csv
from pathlib import Path

# Mapping of State Name to Abbreviation
US_STATES_MAP = {
    "Alabama": "AL", "Alaska": "AK", "Arizona": "AZ", "Arkansas": "AR", "California": "CA",
    "Colorado": "CO", "Connecticut": "CT", "Delaware": "DE", "District of Columbia": "DC",
    "Florida": "FL", "Georgia": "GA", "Hawaii": "HI", "Idaho": "ID", "Illinois": "IL",
    "Indiana": "IN", "Iowa": "IA", "Kansas": "KS", "Kentucky": "KY", "Louisiana": "LA",
    "Maine": "ME", "Maryland": "MD", "Massachusetts": "MA", "Michigan": "MI", "Minnesota": "MN",
    "Mississippi": "MS", "Missouri": "MO", "Montana": "MT", "Nebraska": "NE", "Nevada": "NV",
    "New Hampshire": "NH", "New Jersey": "NJ", "New Mexico": "NM", "New York": "NY",
    "North Carolina": "NC", "North Dakota": "ND", "Ohio": "OH", "Oklahoma": "OK", "Oregon": "OR",
    "Pennsylvania": "PA", "Rhode Island": "RI", "South Carolina": "SC", "South Dakota": "SD",
    "Tennessee": "TN", "Texas": "TX", "Utah": "UT", "Vermont": "VT", "Virginia": "VA",
    "Washington": "WA", "West Virginia": "WV", "Wisconsin": "WI", "Wyoming": "WY"
}

# Canadian Provinces Map (Unemployment & HPI IDs are often table-specific)
# We'll use the ones already in the base catalog as templates or just list them here
CA_PROVINCES_MAP = {
    "Newfoundland and Labrador": {"UR": "v2063004", "HPI": "v111955448"},
    "Prince Edward Island": {"UR": "v2063193", "HPI": "v111955454"},
    "Nova Scotia": {"UR": "v2063382", "HPI": "v111955460"},
    "New Brunswick": {"UR": "v2063571", "HPI": "v111955466"},
    "Quebec": {"UR": "v2063760", "HPI": "v111955472"},
    "Ontario": {"UR": "v2063949", "HPI": "v111955490"},
    "Manitoba": {"UR": "v2064138", "HPI": "v111955526"},
    "Saskatchewan": {"UR": "v2064327", "HPI": "v111955532"},
    "Alberta": {"UR": "v2064516", "HPI": "v111955541"},
    "British Columbia": {"UR": "v2064705", "HPI": "v111955550"},
    "Yukon": {"UR": "v2064894", "HPI": None},
    "Northwest Territories": {"UR": "v2065083", "HPI": None},
    "Nunavut": {"UR": "v2065272", "HPI": None}
}

BASE_CATALOG = "database/seeds/time-series_catalog.csv"
OUTPUT_FILE = "database/seeds/time-series_catalog_expanded.csv"

def generate_catalog():
    rows = []
    
    # 1. Start with the Base Catalog (National Indicators, Markets, etc.)
    if Path(BASE_CATALOG).exists():
        with open(BASE_CATALOG, "r", encoding="utf-8") as f:
            reader = csv.DictReader(f)
            for row in reader:
                if row["series_id"].startswith("#"): continue
                rows.append(row)
    
    # 2. Add US State Series (Unemployment & HPI)
    for name, abbr in US_STATES_MAP.items():
        # Unemployment
        rows.append({
            "series_id": f"{abbr}UR",
            "source": "FRED",
            "status": "Active",
            "series_name": f"Unemployment Rate in {name}",
            "asset_class": "Macro",
            "geography_type": "State",
            "geography_name": name,
            "frequency": "Monthly",
            "category": "Employment",
            "subcategory": "Unemployment Rate"
        })
        # House Price Index (All-Transactions)
        rows.append({
            "series_id": f"ATNHPIUS{abbr}",
            "source": "FRED",
            "status": "Active",
            "series_name": f"All-Transactions House Price Index in {name}",
            "asset_class": "Macro",
            "geography_type": "State",
            "geography_name": name,
            "frequency": "Quarterly",
            "category": "Housing",
            "subcategory": "House Price Index"
        })

    # 3. Add Canadian Provincial Series (if not already in base)
    # We'll check for existing IDs to avoid duplicates
    existing_ids = {r["series_id"] for r in rows}
    
    for name, ids in CA_PROVINCES_MAP.items():
        if ids["UR"] and ids["UR"] not in existing_ids:
            rows.append({
                "series_id": ids["UR"],
                "source": "StatsCan",
                "status": "Active",
                "series_name": f"Unemployment Rate - {name}",
                "asset_class": "Macro",
                "geography_type": "Provincial",
                "geography_name": name,
                "frequency": "Monthly",
                "category": "Employment",
                "subcategory": "Unemployment Rate"
            })
        if ids["HPI"] and ids["HPI"] not in existing_ids:
            rows.append({
                "series_id": ids["HPI"],
                "source": "StatsCan",
                "status": "Active",
                "series_name": f"New Housing Price Index - {name}",
                "asset_class": "Macro",
                "geography_type": "Provincial",
                "geography_name": name,
                "frequency": "Monthly",
                "category": "Housing",
                "subcategory": "House Price Index"
            })

    # Write to CSV
    header = ["series_id", "source", "status", "series_name", "asset_class", "geography_type", "geography_name", "frequency", "category", "subcategory"]
    with open(OUTPUT_FILE, "w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=header)
        writer.writeheader()
        writer.writerows(rows)
    
    print(f"✅ Generated {len(rows)} series in {OUTPUT_FILE}")

if __name__ == "__main__":
    generate_catalog()
