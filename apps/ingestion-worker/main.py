import logging
from pathlib import Path

from fastapi import BackgroundTasks, FastAPI
from fastapi.concurrency import run_in_threadpool
from pydantic import BaseModel
from services.directus_client import DirectusClient
from services.ingestion_service import IngestionService

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="Chronos Ingestion Worker", version="0.1.0")

# Initialize Services
# Note: In a real app we might use dependency injection or lifespan events
directus_client = DirectusClient()
ingestion_service = IngestionService()

TMP_DIR = Path("/tmp/ingestion_processing")
TMP_DIR.mkdir(parents=True, exist_ok=True)


class IngestionRequest(BaseModel):
    file_id: str
    file_url: str | None = None
    metadata: dict | None = None


class DirectusWebhookPayload(BaseModel):
    event: str
    collection: str
    keys: list[str]
    payload: dict | None = None


async def process_file_job(file_id: str):
    """
    Background job to process a file using Docling.
    """
    logger.info(f"Starting processing for file_id: {file_id}")

    file_path = (
        TMP_DIR / f"{file_id}.pdf"
    )  # Assist: infer extension later? Directus usually stores as generic, assume PDF for PoC for now or fetch metadata first.

    try:
        # 1. Download (Async I/O)
        # Verify if file exists locally first? No, always fresh for now.
        await directus_client.download_file(file_id, file_path)

        # 2. Process (Blocking CPU - run in thread)
        # We pass file_path (Path object) and ID
        doc_uuid = await run_in_threadpool(
            ingestion_service.process_document, file_path=file_path, file_id=file_id
        )

        logger.info(f"Processing complete. Document ID: {doc_uuid}")

    except Exception as e:
        logger.error(f"Error processing file {file_id}: {e}", exc_info=True)
    finally:
        # Cleanup
        if file_path.exists():
            file_path.unlink()


@app.get("/health")
async def health_check():
    return {"status": "online", "service": "ingestion-worker"}


@app.post("/webhook/directus")
async def directus_webhook(body: DirectusWebhookPayload, background_tasks: BackgroundTasks):
    """
    Receives 'files.upload' (or 'files.create') webhook from Directus.
    """
    logger.info(
        f"Received webhook: event={body.event} collection={body.collection} keys={body.keys}"
    )

    if body.collection != "directus_files":
        # We only care about file uploads, but Directus might send other events if configured broadly
        return {"status": "ignored", "reason": "not_directus_files_collection"}

    # Trigger processing for each file key
    count = 0
    for file_id in body.keys:
        background_tasks.add_task(process_file_job, file_id)
        count += 1

    return {"status": "processing_queued", "files_count": count}


@app.post("/ingest")
async def manual_ingest(ingest_request: IngestionRequest, background_tasks: BackgroundTasks):
    """
    Manually trigger ingestion for a file URL.
    """
    logger.info(f"Manual ingestion trigger for file_id: {ingest_request.file_id}")
    background_tasks.add_task(process_file_job, ingest_request.file_id)
    return {"status": "processing_queued", "file_id": ingest_request.file_id}
