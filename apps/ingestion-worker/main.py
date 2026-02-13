import io
import logging
from pathlib import Path

import modal
from fastapi import BackgroundTasks, FastAPI, File, HTTPException, Query, UploadFile
from fastapi.concurrency import run_in_threadpool
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from services.contact_extractor import extract_contacts
from services.directus_client import DirectusClient
from services.ingestion_service import IngestionService
from utils.csv_generator import contacts_to_csv

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="Chronos Ingestion Worker", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "https://chronos.automatonicai.com"],
    allow_methods=["POST"],
    allow_headers=["*"],
)

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


MAX_FILE_SIZE = 50 * 1024 * 1024  # 50MB


@app.post("/api/extract-contacts")
async def extract_contacts_endpoint(
    file: UploadFile = File(...),
    format: str = Query("json", pattern="^(json|csv)$"),
):
    """
    Upload a CCAA filing PDF → extract contacts via Docling + GPT-4o NER.
    Returns JSON (default) or CSV.
    """
    if not file.filename or not file.filename.lower().endswith(".pdf"):
        raise HTTPException(415, "Only PDF files are supported")

    pdf_bytes = await file.read()
    if len(pdf_bytes) > MAX_FILE_SIZE:
        raise HTTPException(413, "File too large (max 50MB)")

    logger.info(f"📄 Received PDF: {file.filename} ({len(pdf_bytes) / 1024:.1f} KB)")

    # Step 1: Docling processing (Modal GPU)
    try:
        docling_fn = modal.Function.from_name("chronos-docling", "process_document")
        modal_result = docling_fn.remote(
            pdf_bytes=pdf_bytes,
            file_id=file.filename,
        )
    except Exception as e:
        logger.error(f"❌ Docling processing failed: {e}")
        raise HTTPException(502, f"PDF processing failed: {e}") from e

    if not modal_result.get("success"):
        raise HTTPException(502, f"PDF processing failed: {modal_result.get('error')}")

    markdown_content = modal_result["markdown"]
    logger.info(
        f"✅ Docling complete: {modal_result['page_count']} pages, "
        f"{len(markdown_content):,} chars, {modal_result['processing_time']:.1f}s"
    )

    # Step 2: NER extraction (GPT-4o)
    try:
        extraction = await extract_contacts(markdown_content)
    except Exception as e:
        logger.error(f"❌ NER extraction failed: {e}")
        raise HTTPException(502, f"Contact extraction failed: {e}") from e

    # Step 3: Return results
    if format == "csv":
        csv_content = contacts_to_csv(extraction["contacts"])
        csv_filename = file.filename.replace(".pdf", "_contacts.csv").replace(
            ".PDF", "_contacts.csv"
        )
        return StreamingResponse(
            io.BytesIO(csv_content.encode()),
            media_type="text/csv",
            headers={"Content-Disposition": f'attachment; filename="{csv_filename}"'},
        )

    return extraction
