import logging
import os
import uuid
from pathlib import Path

# Docling
from docling.document_converter import DocumentConverter

# LlamaIndex (for chunking/embedding)
from llama_index.core.node_parser import SentenceSplitter
from llama_index.embeddings.openai import OpenAIEmbedding
from models import DocumentChunk, DocumentRaw

# Database
from services.database import get_db

logger = logging.getLogger(__name__)


class IngestionService:
    def __init__(self):
        self.converter = DocumentConverter()
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
        1. Convert with Docling
        2. Save Raw JSON
        3. Chunk & Embed
        4. Save Vectors
        """
        logger.info(f"Processing document: {file_path}")

        # 1. Convert
        # DocumentConverter.convert() returns a generator
        conv_results = list(self.converter.convert(file_path))
        if not conv_results:
            raise ValueError(f"No conversion result for {file_path}")
        result = conv_results[0]
        doc = result.document

        # Serialize Docling native format to JSON
        doc_json = doc.export_to_dict()
        markdown_content = doc.export_to_markdown()

        # Database ID gen
        doc_uuid = uuid.uuid4()

        with get_db() as db:
            # 2. Save Raw Document
            raw_entry = DocumentRaw(
                id=doc_uuid,
                file_name=file_path.name,
                source_url=source_url or str(file_path),
                doc_type="pdf",  # Simplified
                docling_data=doc_json,
            )
            db.add(raw_entry)
            db.flush()  # Get ID if needed, though we generated it

            # 3. Chunking
            # We use LlamaIndex splitter on the Markdown representation
            text_chunks = self.splitter.split_text(markdown_content)

            # 4. Save Chunks + Embeddings
            chunk_objs = []

            # Batch embedding generation for efficiency
            if text_chunks:
                embeddings = self.embed_model.get_text_embedding_batch(text_chunks)
            else:
                embeddings = []

            for i, (text, embedding) in enumerate(zip(text_chunks, embeddings)):
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
            logger.info(f"Saved {len(chunk_objs)} chunks for document {doc_uuid}")

        return str(doc_uuid)
