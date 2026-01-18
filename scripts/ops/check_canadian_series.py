#!/usr/bin/env python3
"""
Check what Canadian series exist in the database
"""
import os

from sqlalchemy import create_engine, text


def main():
    conn_string = os.environ["DATABASE_URL"]
    engine = create_engine(conn_string)

    print("=" * 80)
    print("CANADIAN SERIES IN DATABASE")
    print("=" * 80)

    with engine.connect() as conn:
        # Check Canadian series
        print("\n1. CANADIAN SERIES:")
        print("-" * 80)
        result = conn.execute(
            text(
                """
            SELECT
                series_id,
                source_series_id,
                series_name,
                geography,
                category,
                units,
                frequency,
                is_active
            FROM metadata.series_metadata
            WHERE geography ILIKE '%canada%'
            ORDER BY series_name
        """
            )
        )

        print(f"{'ID':<6} {'Source ID':<15} {'Name':<50} {'Category':<20} {'Active':<8}")
        print("-" * 110)
        for row in result:
            print(f"{row[0]:<6} {row[1]:<15} {row[2]:<50} {row[4] or 'N/A':<20} {row[7]}")

        # Check if we have unemployment/HPI data
        print("\n2. UNEMPLOYMENT & HPI SERIES:")
        print("-" * 80)
        result = conn.execute(
            text(
                """
            SELECT
                series_id,
                source_series_id,
                series_name,
                geography,
                category
            FROM metadata.series_metadata
            WHERE (series_name ILIKE '%unemployment%' OR series_name ILIKE '%hpi%' OR series_name ILIKE '%housing%price%')
            AND geography ILIKE '%canada%'
            ORDER BY series_name
        """
            )
        )

        count = 0
        for row in result:
            print(f"  [{row[0]}] {row[2]} ({row[3]})")
            count += 1

        if count == 0:
            print("  ⚠️  No Canadian unemployment or HPI series found!")

    print("\n" + "=" * 80 + "\n")


if __name__ == "__main__":
    main()
