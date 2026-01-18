#!/usr/bin/env python3
"""
Fix the choropleth view to preserve interior rings (Great Lakes)
"""
import os

from sqlalchemy import create_engine, text

CONN_STRING = os.environ["DATABASE_URL"]


def main():
    engine = create_engine(CONN_STRING)

    print("=" * 80)
    print("FIXING CHOROPLETH VIEW - PRESERVE TOPOLOGY")
    print("=" * 80)

    with engine.connect() as conn:
        # Drop and recreate view with better simplification
        print("\nRecreating view with ST_SimplifyPreserveTopology...")

        conn.execute(
            text(
                """
            CREATE OR REPLACE VIEW analytics.vw_choropleth_boundaries AS
            SELECT
                name as region_name,
                'US' as country_code,
                ST_SimplifyPreserveTopology(geom::geometry, 0.01) as geometry
            FROM geospatial.us_states
            UNION ALL
            SELECT
                prename as region_name,
                'CA' as country_code,
                ST_SimplifyPreserveTopology(geometry::geometry, 0.01) as geometry
            FROM geospatial.ca_provinces;
        """
            )
        )

        conn.commit()
        print("✓ View recreated with topology preservation")

        # Verify Michigan now has interior rings
        print("\nVerifying Michigan geometry...")
        result = conn.execute(
            text(
                """
            SELECT
                region_name,
                ST_NumInteriorRings(geometry) as interior_rings
            FROM analytics.vw_choropleth_boundaries
            WHERE region_name = 'Michigan'
        """
            )
        )

        for row in result:
            print(f"  {row[0]}: {row[1]} interior rings")
            if row[1] and row[1] > 0:
                print("  ✓ Great Lakes preserved!")
            else:
                print("  ⚠️  Still no interior rings - may need to check source data")

    print("\n" + "=" * 80 + "\n")


if __name__ == "__main__":
    main()
