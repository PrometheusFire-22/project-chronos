import os
import sys

from dotenv import load_dotenv
from sqlalchemy import create_engine, text

current_dir = os.path.dirname(os.path.abspath(__file__))
project_root = os.path.abspath(os.path.join(current_dir, "../"))
dotenv_path = os.path.join(project_root, ".env.local")

load_dotenv(dotenv_path)
db_url = os.getenv("DATABASE_URL")
if not db_url:
    print("DATABASE_URL not found")
    sys.exit(1)

engine = create_engine(db_url)


def apply_fixes():
    with engine.begin() as conn:
        print("Connected. Applying fixes...")

        # 1. Deduplicate US GDP & Canada CPI in data_catalogs
        print("Deduplicating data_catalogs...")
        conn.execute(
            text(
                "DELETE FROM metadata.data_catalogs WHERE source = 'statscan' AND title ILIKE 'United States gross domestic product%'"
            )
        )
        # Keep StatCan for Canada CPI, remove FRED's shadow version
        conn.execute(
            text(
                "DELETE FROM metadata.data_catalogs WHERE source = 'fred' AND (series_id LIKE 'CPALTT%CA%' OR title ILIKE 'Consumer Price Index: All Items for Canada')"
            )
        )

        # 2. Fix Metadata Source Duplication (Source 8 vs Source 10)
        # We prefer Source 10 (the most recent FRED ingestion config)
        print("Cleaning redundant series_metadata...")
        conn.execute(
            text(
                """
                DELETE FROM metadata.series_metadata
                WHERE source_id = 8
                AND source_series_id IN (SELECT source_series_id FROM metadata.series_metadata WHERE source_id = 10)
                AND series_id NOT IN (SELECT DISTINCT series_id FROM timeseries.economic_observations)
            """
            )
        )

        # 3. HOUST Units (Idempotent check)
        # If units are already 'Millions of Units', don't divide again.
        print("Checking HOUST...")
        res = conn.execute(
            text(
                "SELECT units FROM metadata.series_metadata WHERE source_series_id = 'HOUST' LIMIT 1"
            )
        ).fetchone()
        if res and res[0] != "Millions of Units":
            print("  Dividing HOUST values by 1000 and updating units...")
            conn.execute(
                text(
                    """
                UPDATE timeseries.economic_observations
                SET value = value / 1000
                WHERE series_id = (SELECT series_id FROM metadata.series_metadata WHERE source_series_id = 'HOUST' LIMIT 1)
            """
                )
            )
            conn.execute(
                text(
                    "UPDATE metadata.series_metadata SET units = 'Millions of Units' WHERE source_series_id = 'HOUST'"
                )
            )
            conn.execute(
                text(
                    "UPDATE metadata.data_catalogs SET units = 'Millions of Units' WHERE series_id = 'HOUST'"
                )
            )

        # 4. Mexico FX Inversion (Idempotent check)
        print("Checking DEXMXUS...")
        res = conn.execute(
            text(
                "SELECT units FROM metadata.series_metadata WHERE source_series_id = 'DEXMXUS' LIMIT 1"
            )
        ).fetchone()
        if res and "U.S. Dollars" not in str(res[0]):
            print("  Inverting DEXMXUS values...")
            conn.execute(
                text(
                    """
                UPDATE timeseries.economic_observations
                SET value = 1.0 / value
                WHERE series_id = (SELECT series_id FROM metadata.series_metadata WHERE source_series_id = 'DEXMXUS' LIMIT 1)
                AND value != 0
            """
                )
            )
            conn.execute(
                text(
                    """
                    UPDATE metadata.series_metadata
                    SET series_name = 'U.S. / Mexico Foreign Exchange Rate',
                        units = 'U.S. Dollars to One Mexican Peso'
                    WHERE source_series_id = 'DEXMXUS'
                    """
                )
            )
            conn.execute(
                text(
                    """
                    UPDATE metadata.data_catalogs
                    SET title = 'U.S. / Mexico Foreign Exchange Rate',
                        units = 'U.S. Dollars to One Mexican Peso'
                    WHERE series_id = 'DEXMXUS'
                    """
                )
            )

        # 5. Fed Funds Disambiguation
        print("Fixing Fed Funds metadata...")
        conn.execute(
            text(
                "UPDATE metadata.series_metadata SET series_name = 'Federal Funds Effective Rate (Daily)' WHERE source_series_id = 'DFF'"
            )
        )
        conn.execute(
            text(
                "UPDATE metadata.series_metadata SET series_name = 'Federal Funds Effective Rate (Monthly)' WHERE source_series_id = 'FEDFUNDS'"
            )
        )
        conn.execute(
            text(
                "UPDATE metadata.data_catalogs SET title = 'Federal Funds Effective Rate (Daily)' WHERE series_id = 'DFF'"
            )
        )
        conn.execute(
            text(
                "UPDATE metadata.data_catalogs SET title = 'Federal Funds Effective Rate (Monthly)' WHERE series_id = 'FEDFUNDS'"
            )
        )

        # 6. Units Polish (PAYEMS, V39079)
        print("Polishing units for PAYEMS/V39079...")
        conn.execute(
            text(
                "UPDATE metadata.series_metadata SET units = 'Thousands of Persons' WHERE source_series_id = 'PAYEMS'"
            )
        )
        conn.execute(
            text(
                "UPDATE metadata.data_catalogs SET units = 'Thousands of Persons' WHERE series_id = 'PAYEMS'"
            )
        )

        conn.execute(
            text(
                "UPDATE metadata.series_metadata SET units = 'Millions of CAD' WHERE source_series_id = 'V39079'"
            )
        )
        conn.execute(
            text(
                "UPDATE metadata.data_catalogs SET units = 'Millions of CAD' WHERE series_id = 'V39079'"
            )
        )

        print("All fixes applied successfully.")


if __name__ == "__main__":
    apply_fixes()
