import os
import sys

from dotenv import load_dotenv
from sqlalchemy import create_engine, text

# Add apps/chronos-api/src to path for imports if needed, though we'll use direct sql here
sys.path.append(os.path.join(os.getcwd(), "apps/chronos-api/src"))

load_dotenv(os.path.join(os.getcwd(), ".env.local"))

DB_URL = os.getenv("DATABASE_URL")
if not DB_URL:
    print("DATABASE_URL not found")
    sys.exit(1)

engine = create_engine(DB_URL)


def run_audit():
    with engine.connect() as conn:
        print("=== 1. Frequency Check ('D' vs 'Daily') ===")
        res = conn.execute(
            text("SELECT frequency, COUNT(*) FROM metadata.series_metadata GROUP BY frequency")
        ).fetchall()
        for row in res:
            print(f"  {row[0]}: {row[1]}")

        print("\n=== 2. Duplicate 'Federal Funds Effective Rate' ===")
        res = conn.execute(
            text(
                "SELECT series_id, series_name, source_id, frequency, units FROM metadata.series_metadata WHERE series_name ILIKE '%Federal Funds Effective Rate%'"
            )
        ).fetchall()
        for row in res:
            print(
                f"  ID: {row[0]} | Name: {row[1]} | SourceID: {row[2]} | Freq: {row[3]} | Unit: {row[4]}"
            )

        print("\n=== 3. Duplicate 'US GDP' ===")
        res = conn.execute(
            text(
                "SELECT series_id, series_name, source_id, frequency, units FROM metadata.series_metadata WHERE series_name ILIKE '%Gross Domestic Product%' AND geography = 'United States'"
            )
        ).fetchall()
        for row in res:
            print(
                f"  ID: {row[0]} | Name: {row[1]} | SourceID: {row[2]} | Freq: {row[3]} | Unit: {row[4]}"
            )
            # Check observation count for each
            count = conn.execute(
                text(
                    "SELECT COUNT(*) FROM timeseries.economic_observations WHERE series_id = :sid"
                ),
                {"sid": row[0]},
            ).scalar()
            print(f"     -> Observations: {count}")

        print("\n=== 4. Euro / CAD Duplicates ===")
        res = conn.execute(
            text(
                "SELECT series_id, series_name, source_id, frequency FROM metadata.series_metadata WHERE series_name ILIKE '%Euro%' AND series_name ILIKE '%Canadian Dollar%'"
            )
        ).fetchall()
        for row in res:
            print(f"  ID: {row[0]} | Name: {row[1]} | SourceID: {row[2]} | Freq: {row[3]}")
            count = conn.execute(
                text(
                    "SELECT COUNT(*) FROM timeseries.economic_observations WHERE series_id = :sid"
                ),
                {"sid": row[0]},
            ).scalar()
            print(f"     -> Observations: {count}")

        print("\n=== 5. JPY to CAD Values (for precision check) ===")
        res = conn.execute(
            text(
                """
            SELECT sm.series_name, td.value
            FROM metadata.series_metadata sm
            JOIN timeseries.economic_observations td ON sm.series_id = td.series_id
            WHERE sm.series_name ILIKE '%Japanese Yen%' AND sm.series_name ILIKE '%Canadian Dollar%'
            ORDER BY td.observation_date DESC LIMIT 5
        """
            )
        ).fetchall()
        for row in res:
            print(f"  {row[0]}: {row[1]}")

        print("\n=== 6. US / Mexico FX Rate Values (Inversion check) ===")
        res = conn.execute(
            text(
                """
            SELECT sm.series_name, sm.units, td.value
            FROM metadata.series_metadata sm
            JOIN timeseries.economic_observations td ON sm.series_id = td.series_id
            WHERE sm.source_series_id = 'DEXMXUS'
            ORDER BY td.observation_date DESC LIMIT 5
        """
            )
        ).fetchall()
        for row in res:
            print(f"  {row[0]} ({row[1]}): {row[2]}")

        print("\n=== 7. Existing Home Sales (EXHOS...) Range ===")
        res = conn.execute(
            text(
                """
            SELECT sm.source_series_id, MIN(td.observation_date), MAX(td.observation_date), COUNT(*)
            FROM metadata.series_metadata sm
            JOIN timeseries.economic_observations td ON sm.series_id = td.series_id
            WHERE sm.source_series_id = 'EXHOSLUSM495S'
            GROUP BY sm.source_series_id
        """
            )
        ).fetchall()
        for row in res:
            print(f"  ID: {row[0]} | Range: {row[1]} to {row[2]} | Count: {row[3]}")


if __name__ == "__main__":
    run_audit()
