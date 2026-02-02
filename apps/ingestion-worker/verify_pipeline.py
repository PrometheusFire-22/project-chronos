import asyncio
import logging
import os
from pathlib import Path

from services.ingestion_service import IngestionService

# Simple setup
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("verifier")


# Mock Directus Client to just "provide" a local file
async def mock_ingest(file_path_str: str):
    file_path = Path(file_path_str)
    if not file_path.exists():
        logger.error(f"File {file_path} not found.")
        return

    logger.info("Initializing Service...")
    # Explicitly log which DB we are trying to connect to (safe part only)
    db_url = os.getenv("DATABASE_URL", "DEFAULT (chronos-db)")
    logger.info(
        f"Target Database URL: {db_url.split('@')[-1] if '@' in db_url else db_url}"
    )  # mask creds

    service = IngestionService()

    logger.info("Starting Processing...")
    # In a real run, file_id would be UUID, here we use "verify_manual"
    doc_id = service.process_document(file_path, "verify_manual_" + file_path.stem)

    logger.info(f"SUCCESS: Processed with Doc ID: {doc_id}")


if __name__ == "__main__":
    import sys

    if len(sys.argv) < 2:
        print("Usage: python verify_pipeline.py <path_to_pdf>")
        sys.exit(1)

    input_path = sys.argv[1]
    # Allow overriding DB host for verification
    # e.g. DATABASE_URL=postgresql://postgres:password@localhost:5432/chronos_db

    asyncio.run(mock_ingest(input_path))
