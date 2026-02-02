from pgvector.sqlalchemy import Vector
from sqlalchemy import Column, DateTime, ForeignKey, Integer, Text
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import declarative_base
from sqlalchemy.sql import func

Base = declarative_base()


class DocumentRaw(Base):
    __tablename__ = "documents_raw"
    __table_args__ = {"schema": "ingestion"}

    id = Column(UUID(as_uuid=True), primary_key=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    file_name = Column(Text, nullable=False)
    source_url = Column(Text, nullable=True)
    doc_type = Column(Text, nullable=True)
    docling_data = Column(JSONB, nullable=True)
    markdown_content = Column(Text, nullable=True)  # NEW: Full markdown with emojis ✅🚀📊


class DocumentChunk(Base):
    __tablename__ = "document_chunks"
    __table_args__ = {"schema": "ingestion"}

    id = Column(UUID(as_uuid=True), primary_key=True)
    document_id = Column(
        UUID(as_uuid=True),
        ForeignKey("ingestion.documents_raw.id", ondelete="CASCADE"),
        nullable=False,
    )
    chunk_index = Column(Integer, nullable=False)
    text_content = Column(Text, nullable=False)
    metadata_ = Column(
        "metadata", JSONB, nullable=True
    )  # mapped as 'metadata' in DB, 'metadata_' in python to avoid keywords if any
    embedding = Column(Vector(1536), nullable=True)
