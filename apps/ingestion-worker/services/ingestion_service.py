import logging
import os
import uuid
from pathlib import Path

# Modal for remote GPU processing
import modal

# LlamaIndex (for chunking/embedding)
from llama_index.core.node_parser import SentenceSplitter
from llama_index.embeddings.openai import OpenAIEmbedding
from models import DocumentChunk, DocumentRaw

# Database
from services.database import get_db

logger = logging.getLogger(__name__)


class IngestionService:
    def __init__(self):
        # NO LOCAL DOCLING! Use Modal GPU instead
        # self.converter = DocumentConverter()  # OLD - causes OOM!

        # Initialize Modal function lookup
        try:
            self.modal_fn = modal.Function.from_name("chronos-docling", "process_document")
            logger.info("✅ Modal GPU function connected: chronos-docling.process_document")
        except Exception as e:
            logger.error(f"❌ Failed to connect to Modal GPU function: {e}")
            logger.error(
                "Make sure Modal function is deployed: modal deploy apps/ingestion-worker/modal_functions/docling_processor.py"
            )
            raise

        self.splitter = SentenceSplitter(chunk_size=1024, chunk_overlap=20)

        # Initialize OpenAI Embedding Model
        # Requires OPENAI_API_KEY env var
        api_key = os.getenv("OPENAI_API_KEY")
        if not api_key:
            logger.warning("OPENAI_API_KEY not found. Embeddings will fail unless set.")

        self.embed_model = OpenAIEmbedding(
            model="text-embedding-3-small", api_key=api_key  # Cheaper and efficient
        )

    def process_document(self, file_path: Path, file_id: str, source_url: str = None):
        """
        1. Convert with Docling (on Modal GPU - REMOTE!)
        2. Save Raw JSON + Markdown
        3. Chunk & Embed
        4. Save Vectors

        Now calls Modal GPU remotely instead of running Docling locally.
        This eliminates OOM errors and leverages A10G GPU for 10-20x speedup.
        """
        logger.info(f"📄 Processing document: {file_path.name}")
        logger.info("🚀 Sending to Modal GPU for processing...")

        # 1. Read PDF bytes
        with open(file_path, "rb") as f:
            pdf_bytes = f.read()

        logger.info(f"📦 PDF size: {len(pdf_bytes) / 1024:.2f} KB")

        # 2. Call Modal GPU function remotely
        try:
            modal_result = self.modal_fn.remote(
                pdf_bytes=pdf_bytes, file_id=file_id, source_url=source_url
            )
        except Exception as e:
            logger.error(f"❌ Modal GPU processing failed: {e}")
            raise ValueError(f"Modal GPU processing failed for {file_path.name}: {e}") from e

        if not modal_result.get("success"):
            error_msg = modal_result.get("error", "Unknown error")
            raise ValueError(f"Modal processing failed: {error_msg}")

        # 3. Extract results from Modal
        doc_json = modal_result["doc_json"]
        markdown_content = modal_result["markdown"]
        processing_time = modal_result["processing_time"]
        page_count = modal_result["page_count"]

        logger.info("✅ Modal GPU processing complete:")
        logger.info(f"   - Processing time: {processing_time:.2f}s")
        logger.info(f"   - Pages: {page_count}")
        logger.info(f"   - Markdown length: {len(markdown_content):,} chars")
        logger.info(f"   - GPU cost: ~${processing_time / 3600 * 1.10:.4f}")

        # Database ID gen
        doc_uuid = uuid.uuid4()

        with get_db() as db:
            # 4. Save Raw Document + Markdown
            logger.info("💾 Saving to PostgreSQL (document + chunks + vectors)...")

            raw_entry = DocumentRaw(
                id=doc_uuid,
                file_name=file_path.name,
                source_url=source_url or str(file_path),
                doc_type="pdf",  # Simplified
                docling_data=doc_json,
                markdown_content=markdown_content,  # NEW: Store full markdown
            )
            db.add(raw_entry)
            db.flush()  # Get ID if needed, though we generated it

            logger.info(f"   ✓ Document metadata saved (id: {doc_uuid})")

            # 5. Chunking
            # We use LlamaIndex splitter on the Markdown representation
            logger.info("   ✂️  Chunking markdown text...")
            text_chunks = self.splitter.split_text(markdown_content)
            logger.info(f"   ✓ Created {len(text_chunks)} chunks")

            # 6. Save Chunks + Embeddings
            chunk_objs = []

            # Batch embedding generation for efficiency
            if text_chunks:
                logger.info("   🤖 Generating embeddings with OpenAI (text-embedding-3-small)...")
                embeddings = self.embed_model.get_text_embedding_batch(text_chunks)
                logger.info(f"   ✓ Generated {len(embeddings)} embeddings")
            else:
                embeddings = []
                logger.warning("   ⚠️  No text chunks to embed!")

            for i, (text, embedding) in enumerate(zip(text_chunks, embeddings, strict=True)):
                chunk_obj = DocumentChunk(
                    id=uuid.uuid4(),
                    document_id=doc_uuid,
                    chunk_index=i,
                    text_content=text,
                    metadata_={
                        "source": "docling_markdown",
                        "modal_processing_time": processing_time,
                    },
                    embedding=embedding,
                )
                chunk_objs.append(chunk_obj)

            db.add_all(chunk_objs)
            db.commit()  # Explicit commit for safety
            logger.info(f"   ✓ Saved {len(chunk_objs)} chunks with vectors to PostgreSQL")

        logger.info(f"🎉 Document processing complete! Document ID: {doc_uuid}")
        logger.info(
            f"📊 Summary: {page_count} pages → {len(text_chunks)} chunks → {len(embeddings)} vectors"
        )

        return str(doc_uuid)
