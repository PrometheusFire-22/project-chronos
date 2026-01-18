#!/usr/bin/env python3
"""
Check if the choropleth view exists and what data it contains
"""
import os

from sqlalchemy import create_engine, text


def main():
    conn_string = os.environ["DATABASE_URL"]
    engine = create_engine(conn_string)

    print("=" * 80)
    print("CHECKING CHOROPLETH VIEW")
    print("=" * 80)

    with engine.connect() as conn:
        # Check if view exists
        print("\n1. VIEW EXISTS CHECK:")
        print("-" * 80)
        result = conn.execute(
            text(
                """
            SELECT EXISTS (
                SELECT 1
                FROM information_schema.views
                WHERE table_schema = 'analytics'
                AND table_name = 'vw_choropleth_boundaries'
            ) as view_exists
        """
            )
        )
        exists = result.scalar()
        print(f"  analytics.vw_choropleth_boundaries exists: {exists}")

        if exists:
            # Count rows by country
            print("\n2. ROW COUNTS BY COUNTRY:")
            print("-" * 80)
            result = conn.execute(
                text(
                    """
                SELECT
                    country_code,
                    COUNT(*) as count
                FROM analytics.vw_choropleth_boundaries
                GROUP BY country_code
                ORDER BY country_code
            """
                )
            )
            for row in result:
                print(f"  {row[0]}: {row[1]} regions")

            # Sample Canadian data
            print("\n3. SAMPLE CANADIAN REGIONS:")
            print("-" * 80)
            result = conn.execute(
                text(
                    """
                SELECT region_name, country_code
                FROM analytics.vw_choropleth_boundaries
                WHERE country_code = 'CA'
                ORDER BY region_name
                LIMIT 5
            """
                )
            )
            for row in result:
                print(f"  {row[0]} ({row[1]})")
        else:
            print("\n  ⚠️  View does not exist! Need to create it.")

    print("\n" + "=" * 80 + "\n")


if __name__ == "__main__":
    main()
