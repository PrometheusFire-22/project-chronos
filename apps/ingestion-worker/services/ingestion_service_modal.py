"""
Ingestion Service with Modal GPU integration.

This version of the ingestion service uses Modal for GPU-accelerated document processing
with Docling, while maintaining a fallback to local CPU processing for development.

Architecture:
    Directus → FastAPI → Modal GPU (Docling) → Local (LlamaIndex + Embeddings) → PostgreSQL

Environment Variables:
    USE_MODAL_GPU: "true" to use Modal, "false" for local CPU fallback (default: true)
    OPENAI_API_KEY: Required for embeddings
    MODAL_TOKEN_ID: Modal authentication (set via `modal token new`)
    MODAL_TOKEN_SECRET: Modal authentication
"""

import logging
import os
import uuid
from datetime import UTC, datetime
from pathlib import Path

# Modal
import modal

# LlamaIndex (for chunking/embedding)
from llama_index.core.node_parser import SentenceSplitter
from llama_index.embeddings.openai import OpenAIEmbedding
from models import DocumentChunk, DocumentRaw

# Database
from services.database import get_db

# Utilities
from utils.json_to_markdown import json_to_markdown

logger = logging.getLogger(__name__)


class IngestionService:
    """
    Document ingestion service with hybrid Modal GPU + local processing.

    Processing Pipeline:
        1. Docling (Modal GPU or Local CPU) → Document JSON + Markdown
        2. LlamaIndex SentenceSplitter (Local) → Text chunks
        3. OpenAI Embeddings (API) → Vector embeddings
        4. PostgreSQL + pgvector (Local/AWS) → Storage

    Cost Breakdown (per document):
        - Modal GPU (A10G): ~$0.01-0.03 (30 seconds @ $1.10/hour)
        - OpenAI Embeddings: ~$0.0001 (text-embedding-3-small)
        - Total: ~$0.01-0.03 per document
    """

    def __init__(self):
        """
        Initialize ingestion service with Modal GPU support.

        Environment Configuration:
            - USE_MODAL_GPU=true → Use Modal for Docling (default)
            - USE_MODAL_GPU=false → Fallback to local CPU
        """
        self.use_modal = os.getenv("USE_MODAL_GPU", "true").lower() == "true"

        if self.use_modal:
            logger.info("Initializing Modal GPU integration...")
            try:
                # Connect to Modal function
                self.modal_fn = modal.Function.lookup("chronos-docling", "process_document")
                logger.info("✅ Modal GPU connected: chronos-docling.process_document")
            except Exception as e:
                logger.warning(f"⚠️ Modal GPU unavailable: {e}")
                logger.warning("Falling back to local CPU processing")
                self.use_modal = False
                self._init_local_docling()
        else:
            logger.info("Using local CPU processing (Modal disabled)")
            self._init_local_docling()

        # Initialize chunking and embedding (always local)
        self.splitter = SentenceSplitter(chunk_size=1024, chunk_overlap=20)

        # Initialize OpenAI Embedding Model
        api_key = os.getenv("OPENAI_API_KEY")
        if not api_key:
            logger.warning("OPENAI_API_KEY not found. Embeddings will fail unless set.")

        self.embed_model = OpenAIEmbedding(
            model="text-embedding-3-small", api_key=api_key  # Cheaper and efficient
        )

    def _init_local_docling(self):
        """Initialize local Docling converter (CPU fallback) with advanced configuration."""
        from docling.datamodel.base_models import InputFormat
        from docling.datamodel.pipeline_options import (
            PdfPipelineOptions,
            TableFormerMode,
            TableStructureOptions,
        )
        from docling.document_converter import DocumentConverter, PdfFormatOption

        # Configure advanced table extraction (same as Modal GPU)
        pipeline_options = PdfPipelineOptions()
        pipeline_options.do_table_structure = True
        pipeline_options.table_structure_options = TableStructureOptions(
            mode=TableFormerMode.ACCURATE  # vs FAST (default)
        )
        pipeline_options.do_ocr = True

        # Initialize DocumentConverter with format-specific options (Docling 2.x API)
        self.converter = DocumentConverter(
            format_options={InputFormat.PDF: PdfFormatOption(pipeline_options=pipeline_options)}
        )
        logger.info("✅ Local Docling converter initialized (CPU) with ACCURATE table mode")

    def process_document(self, file_path: Path, file_id: str, source_url: str = None):
        """
        Process a document through the full ingestion pipeline.

        Pipeline:
            1. Convert with Docling (Modal GPU or Local CPU)
            2. Save Raw JSON to database
            3. Chunk with LlamaIndex
            4. Generate embeddings with OpenAI
            5. Save chunks + vectors to database

        Args:
            file_path: Path to PDF file
            file_id: Unique file identifier (from Directus)
            source_url: Optional source URL for metadata

        Returns:
            str: Document UUID

        Raises:
            ValueError: If conversion fails
        """
        logger.info(f"Processing document: {file_path} (Modal GPU: {self.use_modal})")
        start_time = datetime.now(UTC)

        # ================================================================
        # STEP 1: Document Conversion (Docling)
        # ================================================================

        if self.use_modal:
            # Process on Modal GPU
            logger.info(f"Sending {file_path.name} to Modal GPU...")

            with open(file_path, "rb") as f:
                pdf_bytes = f.read()

            try:
                result = self.modal_fn.remote(pdf_bytes, file_id, source_url)

                if not result["success"]:
                    raise ValueError(f"Modal processing failed: {result['error']}")

                doc_json = result["doc_json"]
                # Modal already uses custom JSON→MD renderer, no post-processing needed
                markdown_content = result["markdown"]
                processing_time = result["processing_time"]

                logger.info(
                    f"✅ Modal GPU processed {file_path.name} in {processing_time:.2f}s "
                    f"({result['page_count']} pages, cost: ~${processing_time / 3600 * 1.10:.4f})"
                )
                logger.info(f"   Markdown: {len(markdown_content):,} chars (custom renderer)")

            except Exception as e:
                logger.error(f"Modal GPU failed: {e}")
                logger.info("Falling back to local CPU processing...")
                self.use_modal = False
                self._init_local_docling()
                return self.process_document(file_path, file_id, source_url)

        else:
            # Process locally on CPU
            logger.info(f"Processing {file_path.name} on local CPU...")
            cpu_start = datetime.now(UTC)

            conv_results = list(self.converter.convert(file_path))
            if not conv_results:
                raise ValueError(f"No conversion result for {file_path}")

            result = conv_results[0]
            doc = result.document
            doc_json = doc.export_to_dict()

            # Use custom JSON→MD renderer (same as Modal)
            markdown_content = json_to_markdown(doc_json)

            cpu_time = (datetime.now(UTC) - cpu_start).total_seconds()
            logger.info(f"✅ Local CPU processed {file_path.name} in {cpu_time:.2f}s")
            logger.info(f"   Markdown: {len(markdown_content):,} chars (custom renderer)")

        # ================================================================
        # STEP 2: Save Raw Document to Database
        # ================================================================

        doc_uuid = uuid.uuid4()

        with get_db() as db:
            raw_entry = DocumentRaw(
                id=doc_uuid,
                file_name=file_path.name,
                source_url=source_url or str(file_path),
                doc_type="pdf",  # Simplified for now
                docling_data=doc_json,
                markdown_content=markdown_content,  # Save post-processed markdown
            )
            db.add(raw_entry)
            db.flush()  # Ensure ID is available
            logger.info(f"📄 Saved raw document: {doc_uuid}")
            logger.info(f"   Markdown: {len(markdown_content):,} chars saved to database")

            # ============================================================
            # STEP 3: Chunking with LlamaIndex
            # ============================================================

            text_chunks = self.splitter.split_text(markdown_content)
            logger.info(f"🔪 Split into {len(text_chunks)} chunks")

            # ============================================================
            # STEP 4: Generate Embeddings with OpenAI
            # ============================================================

            if text_chunks:
                logger.info(f"🧠 Generating embeddings for {len(text_chunks)} chunks...")
                embeddings = self.embed_model.get_text_embedding_batch(text_chunks)
                logger.info(f"✅ Generated {len(embeddings)} embeddings")
            else:
                embeddings = []
                logger.warning("No text chunks to embed")

            # ============================================================
            # STEP 5: Save Chunks + Embeddings to Database
            # ============================================================

            chunk_objs = []
            for i, (text, embedding) in enumerate(zip(text_chunks, embeddings, strict=True)):
                chunk_obj = DocumentChunk(
                    id=uuid.uuid4(),
                    document_id=doc_uuid,
                    chunk_index=i,
                    text_content=text,
                    metadata_={"source": "docling_markdown"},
                    embedding=embedding,
                )
                chunk_objs.append(chunk_obj)

            db.add_all(chunk_objs)
            db.commit()

            total_time = (datetime.now(UTC) - start_time).total_seconds()
            logger.info(
                f"✅ Saved {len(chunk_objs)} chunks for document {doc_uuid} "
                f"(total time: {total_time:.2f}s)"
            )

        return str(doc_uuid)
