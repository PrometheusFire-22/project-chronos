#!/usr/bin/env python3
"""
Export US states and CA provinces from PostGIS as GeoJSON for tippecanoe.

This exports simplified geometries suitable for vector tile generation.
Output: gis_data/boundaries_for_tiles.geojson
"""

import json
import os
import sys
from pathlib import Path

# Add chronos to path
project_root = Path(__file__).parent.parent
sys.path.insert(0, str(project_root / "src"))

from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker

# Database connection
DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://postgres:postgres@localhost:5432/chronos")

engine = create_engine(DATABASE_URL)
Session = sessionmaker(bind=engine)


def export_boundaries():
    """Export boundaries as GeoJSON."""
    print("Exporting boundaries from PostGIS...")

    with Session() as session:
        # Export US states
        us_query = text(
            """
            SELECT
                "NAME" as name,
                'US' as country,
                ST_AsGeoJSON(ST_SimplifyPreserveTopology(geometry, 0.005))::json as geometry
            FROM geospatial.us_states
            ORDER BY "NAME"
        """
        )

        us_results = session.execute(us_query).mappings().all()
        print(f"✓ Exported {len(us_results)} US states")

        # Export CA provinces
        ca_query = text(
            """
            SELECT
                "PRENAME" as name,
                'CA' as country,
                ST_AsGeoJSON(ST_SimplifyPreserveTopology(geometry, 0.01))::json as geometry
            FROM geospatial.ca_provinces
            ORDER BY "PRENAME"
        """
        )

        ca_results = session.execute(ca_query).mappings().all()
        print(f"✓ Exported {len(ca_results)} CA provinces")

        # Build FeatureCollection
        features = []

        for row in us_results:
            features.append(
                {
                    "type": "Feature",
                    "geometry": row["geometry"],
                    "properties": {"name": row["name"], "country": row["country"]},
                }
            )

        for row in ca_results:
            features.append(
                {
                    "type": "Feature",
                    "geometry": row["geometry"],
                    "properties": {"name": row["name"], "country": row["country"]},
                }
            )

        geojson = {"type": "FeatureCollection", "features": features}

        # Write to file
        output_dir = project_root / "gis_data"
        output_dir.mkdir(exist_ok=True)
        output_file = output_dir / "boundaries_for_tiles.geojson"

        with open(output_file, "w") as f:
            json.dump(geojson, f, separators=(",", ":"))

        print(f"✓ Wrote {len(features)} features to {output_file}")
        print(f"  File size: {output_file.stat().st_size / 1024:.1f} KB")

        return output_file


if __name__ == "__main__":
    try:
        output_file = export_boundaries()
        print("\n✅ Export complete!")
        print("\nNext step: Run tippecanoe to generate vector tiles:")
        print(f"  tippecanoe -o regions.mbtiles -Z2 -z8 {output_file}")
    except Exception as e:
        print(f"\n❌ Export failed: {e}", file=sys.stderr)
        sys.exit(1)
