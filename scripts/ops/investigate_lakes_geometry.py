#!/usr/bin/env python3
"""
Investigate Great Lakes geometry issue
Check if interior rings (holes) are being preserved
"""
import os

from sqlalchemy import create_engine, text

CONN_STRING = os.environ["DATABASE_URL"]


def main():
    engine = create_engine(CONN_STRING)

    print("=" * 80)
    print("GREAT LAKES GEOMETRY INVESTIGATION")
    print("=" * 80)

    with engine.connect() as conn:
        # Check Michigan's geometry
        print("\n1. MICHIGAN GEOMETRY ANALYSIS:")
        print("-" * 80)
        result = conn.execute(
            text(
                """
            SELECT
                name,
                ST_GeometryType(geom) as geom_type,
                ST_NRings(geom) as num_rings,
                ST_NumInteriorRings(geom) as num_interior_rings,
                ST_Area(geom) as area
            FROM geospatial.us_states
            WHERE name = 'Michigan'
        """
            )
        )

        for row in result:
            print(f"  State: {row[0]}")
            print(f"  Geometry Type: {row[1]}")
            print(f"  Total Rings: {row[2]}")
            print(f"  Interior Rings (holes): {row[3]}")
            print(f"  Area: {row[4]}")

        # Check view's simplified geometry
        print("\n2. VIEW SIMPLIFIED GEOMETRY:")
        print("-" * 80)
        result = conn.execute(
            text(
                """
            SELECT
                region_name,
                ST_GeometryType(geometry) as geom_type,
                ST_NRings(geometry) as num_rings,
                ST_NumInteriorRings(geometry) as num_interior_rings
            FROM analytics.vw_choropleth_boundaries
            WHERE region_name = 'Michigan'
        """
            )
        )

        for row in result:
            print(f"  State: {row[0]}")
            print(f"  Geometry Type: {row[1]}")
            print(f"  Total Rings: {row[2]}")
            print(f"  Interior Rings (holes): {row[3]}")

        # Check view definition
        print("\n3. VIEW DEFINITION:")
        print("-" * 80)
        result = conn.execute(
            text(
                """
            SELECT definition
            FROM pg_views
            WHERE schemaname = 'analytics'
            AND viewname = 'vw_choropleth_boundaries'
        """
            )
        )

        for row in result:
            print(row[0])

        # Check other Great Lakes states
        print("\n4. OTHER GREAT LAKES STATES:")
        print("-" * 80)
        result = conn.execute(
            text(
                """
            SELECT
                name,
                ST_NumInteriorRings(geom) as interior_rings
            FROM geospatial.us_states
            WHERE name IN ('Michigan', 'Wisconsin', 'Illinois', 'Indiana', 'Ohio', 'Minnesota', 'New York', 'Pennsylvania')
            ORDER BY name
        """
            )
        )

        print(f"{'State':<20} {'Interior Rings (Lakes)':<25}")
        print("-" * 45)
        for row in result:
            print(f"{row[0]:<20} {row[1]:<25}")

    print("\n" + "=" * 80 + "\n")


if __name__ == "__main__":
    main()
