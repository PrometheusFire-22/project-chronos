import os

from sqlalchemy import create_engine, text

# Database connection details (matching docker-compose override)
DB_HOST = os.getenv("DATABASE_HOST", "localhost")
DB_PORT = os.getenv("DATABASE_PORT", "5432")
DB_USER = os.getenv("DATABASE_USER", "postgres")
DB_PASSWORD = os.getenv("DATABASE_PASSWORD", "password")
DB_NAME = os.getenv("DATABASE_NAME", "chronos")

DATABASE_URL = f"postgresql://{DB_USER}:{DB_PASSWORD}@{DB_HOST}:{DB_PORT}/{DB_NAME}"


def check_database():
    print(f"Connecting to database: postgresql://{DB_USER}:***@{DB_HOST}:{DB_PORT}/{DB_NAME}")
    try:
        engine = create_engine(DATABASE_URL)
        with engine.connect() as connection:
            # Check documents_raw
            result = connection.execute(text("SELECT count(*) FROM ingestion.documents_raw"))
            raw_count = result.scalar()
            print(f"Raw Documents Count: {raw_count}")

            # Check document_chunks
            result = connection.execute(text("SELECT count(*) FROM ingestion.document_chunks"))
            chunk_count = result.scalar()
            print(f"Vector Chunks Count: {chunk_count}")

            # Sample query
            if chunk_count > 0:
                print("\nSample Chunk Data (Metadata):")
                result = connection.execute(
                    text("SELECT metadata_ FROM ingestion.document_chunks LIMIT 1")
                )
                row = result.fetchone()
                print(row[0])

    except Exception as e:
        print(f"Error connecting to database: {e}")


if __name__ == "__main__":
    check_database()
