#!/usr/bin/env python3
"""
Analyze Canadian geography data in the database
"""
import os

from sqlalchemy import create_engine, text


def main():
    # Connection string
    conn_string = os.environ["DATABASE_URL"]
    engine = create_engine(conn_string)

    print("=" * 80)
    print("CANADIAN GEOGRAPHY DATA ANALYSIS")
    print("=" * 80)

    with engine.connect() as conn:
        # 1. List all geospatial tables
        print("\n1. GEOSPATIAL SCHEMA TABLES:")
        print("-" * 80)
        result = conn.execute(
            text(
                """
            SELECT table_name
            FROM information_schema.tables
            WHERE table_schema = 'geospatial'
            AND table_name LIKE 'ca_%'
            ORDER BY table_name
        """
            )
        )
        ca_tables = [row[0] for row in result]
        for table in ca_tables:
            print(f"  - {table}")

        # 2. Detailed analysis of ca_provinces
        print("\n2. CA_PROVINCES TABLE STRUCTURE:")
        print("-" * 80)
        result = conn.execute(
            text(
                """
            SELECT column_name, data_type, is_nullable
            FROM information_schema.columns
            WHERE table_schema = 'geospatial'
            AND table_name = 'ca_provinces'
            ORDER BY ordinal_position
        """
            )
        )
        print(f"{'Column':<20} {'Type':<20} {'Nullable':<10}")
        print("-" * 50)
        for row in result:
            print(f"{row[0]:<20} {row[1]:<20} {row[2]:<10}")

        # 3. Sample data from ca_provinces
        print("\n3. CA_PROVINCES SAMPLE DATA:")
        print("-" * 80)
        result = conn.execute(
            text(
                """
            SELECT
                pruid,
                dguid,
                prname,
                prename,
                preabbr,
                landarea
            FROM geospatial.ca_provinces
            ORDER BY prname
            LIMIT 5
        """
            )
        )
        print(
            f"{'PRUID':<8} {'DGUID':<15} {'Name (FR)':<25} {'Name (EN)':<25} {'Abbr':<6} {'Area':<12}"
        )
        print("-" * 100)
        for row in result:
            print(f"{row[0]:<8} {row[1]:<15} {row[2]:<25} {row[3]:<25} {row[4]:<6} {row[5]:<12}")

        # 4. Count rows
        print("\n4. ROW COUNTS:")
        print("-" * 80)
        for table in ca_tables:
            count = conn.execute(text(f"SELECT COUNT(*) FROM geospatial.{table}")).scalar()
            print(f"  {table:<30} {count:>6} rows")

        # 5. Check for economic data with Canadian geography
        print("\n5. CANADIAN ECONOMIC DATA (TIME SERIES):")
        print("-" * 80)
        result = conn.execute(
            text(
                """
            SELECT
                sm.source_series_id,
                sm.series_name,
                sm.geography,
                sm.category,
                COUNT(eo.value) as observation_count
            FROM metadata.series_metadata sm
            LEFT JOIN timeseries.economic_observations eo ON sm.series_id = eo.series_id
            WHERE sm.geography LIKE '%Canada%'
               OR sm.geography LIKE '%Canadian%'
               OR sm.source_series_id LIKE 'V%'
            GROUP BY sm.series_id, sm.source_series_id, sm.series_name, sm.geography, sm.category
            ORDER BY sm.series_name
            LIMIT 10
        """
            )
        )
        print(f"{'Series ID':<15} {'Name':<40} {'Geography':<20} {'Obs Count':<10}")
        print("-" * 90)
        for row in result:
            print(f"{row[0]:<15} {row[1]:<40} {row[2] or 'N/A':<20} {row[4]:<10}")

        # 6. Check geometry validity
        print("\n6. GEOMETRY VALIDATION:")
        print("-" * 80)
        result = conn.execute(
            text(
                """
            SELECT
                COUNT(*) as total,
                COUNT(geometry) as with_geometry,
                SUM(CASE WHEN ST_IsValid(geometry) THEN 1 ELSE 0 END) as valid_geometry
            FROM geospatial.ca_provinces
        """
            )
        )
        row = result.fetchone()
        print(f"  Total rows: {row[0]}")
        print(f"  With geometry: {row[1]}")
        print(f"  Valid geometry: {row[2]}")

    print("\n" + "=" * 80)
    print("ANALYSIS COMPLETE")
    print("=" * 80 + "\n")


if __name__ == "__main__":
    main()
