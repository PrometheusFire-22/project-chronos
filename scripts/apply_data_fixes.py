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

        # 1. Deduplicate US GDP
        conn.execute(
            text(
                "DELETE FROM metadata.data_catalogs WHERE source = 'statscan' AND title ILIKE 'United States gross domestic product%'"
            )
        )

        # 2. Deduplicate Canada CPI (FRED version remove, keep StatCan or vice versa? "Resolving duplicate series entries for US GDP and Canada CPI" usually means keeping the primary source. Canada CPI primary is StatCan. So remove FRED.)
        # Check if I previously decided to remove FRED. "Resolving duplicate... for US GDP and Canada CPI".
        # Yes, usually remove the 'foreign' source.
        conn.execute(
            text(
                "DELETE FROM metadata.data_catalogs WHERE source = 'fred' AND series_id LIKE 'CPALTT%CA%'"
            )
        )

        # 3. HOUST Units
        print("Fixing HOUST...")
        conn.execute(
            text(
                """
            UPDATE timeseries.economic_observations
            SET value = value / 1000
            WHERE series_id = (SELECT id FROM metadata.data_catalogs WHERE series_id = 'HOUST' LIMIT 1)
        """
            )
        )
        conn.execute(
            text(
                "UPDATE metadata.data_catalogs SET units = 'Millions of Units' WHERE series_id = 'HOUST'"
            )
        )

        # 4. Mexico FX (Invert)
        print("Fixing DEXMXUS...")
        conn.execute(
            text(
                """
            UPDATE timeseries.economic_observations
            SET value = 1.0 / value
            WHERE series_id = (SELECT id FROM metadata.data_catalogs WHERE series_id = 'DEXMXUS' LIMIT 1)
            AND value != 0
        """
            )
        )
        conn.execute(
            text(
                "UPDATE metadata.data_catalogs SET title = 'U.S. / Mexico Foreign Exchange Rate', units = 'U.S. Dollars to One Mexican Peso' WHERE series_id = 'DEXMXUS'"
            )
        )

        # 5. Fed Funds Disambiguation
        print("Fixing Fed Funds metadata...")
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

        # 6. PAYEMS Units
        conn.execute(
            text(
                "UPDATE metadata.data_catalogs SET units = 'Thousands of Persons' WHERE series_id = 'PAYEMS'"
            )
        )

        # 7. Canada Balance Sheet Units
        conn.execute(
            text(
                "UPDATE metadata.data_catalogs SET units = 'Millions of CAD' WHERE series_id = 'V39079'"
            )
        )

        print("Done.")


if __name__ == "__main__":
    apply_fixes()
