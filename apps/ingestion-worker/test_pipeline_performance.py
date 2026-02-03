#!/usr/bin/env python3
"""
End-to-end pipeline performance test
Measures latency at each step to identify bottlenecks
"""

import os

# Add parent directory to path for imports
import sys
import time
from pathlib import Path

import modal
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker

sys.path.insert(0, str(Path(__file__).parent))

from services.ingestion_service import IngestionService


def format_duration(seconds: float) -> str:
    """Format duration in human-readable form"""
    if seconds < 1:
        return f"{seconds*1000:.0f}ms"
    elif seconds < 60:
        return f"{seconds:.1f}s"
    else:
        mins = int(seconds // 60)
        secs = seconds % 60
        return f"{mins}m {secs:.1f}s"


def main():
    print("\n" + "=" * 70)
    print("🧪 INGESTION PIPELINE PERFORMANCE TEST")
    print("=" * 70 + "\n")

    # Setup
    test_pdf = Path(__file__).parent / "test-service-list.pdf"
    if not test_pdf.exists():
        print(f"❌ Test PDF not found: {test_pdf}")
        return

    print(f"📄 Test file: {test_pdf.name}")
    print(f"📦 File size: {test_pdf.stat().st_size / 1024:.1f} KB\n")

    # Initialize service
    print("⚙️  Initializing ingestion service...")
    start = time.time()
    service = IngestionService()
    init_time = time.time() - start
    print(f"   ✓ Service initialized in {format_duration(init_time)}\n")

    # Performance tracking
    timings = {}

    # STEP 1: Read PDF file
    print("━" * 70)
    print("STEP 1: Read PDF File")
    print("━" * 70)
    start = time.time()
    with open(test_pdf, "rb") as f:
        pdf_bytes = f.read()
    timings["read_file"] = time.time() - start
    print(f"   ✓ Read {len(pdf_bytes):,} bytes in {format_duration(timings['read_file'])}\n")

    # STEP 2: Process with Modal GPU
    print("━" * 70)
    print("STEP 2: Modal GPU Processing (Docling)")
    print("━" * 70)
    print("   🔥 Sending to Modal A10G GPU...")
    start = time.time()

    try:
        modal_fn = modal.Function.lookup("chronos-docling", "process_document")
        result = modal_fn.remote(
            pdf_bytes=pdf_bytes, file_id=test_pdf.stem, source_url=str(test_pdf)
        )
        timings["modal_gpu"] = time.time() - start

        if result.get("success"):
            print(f"   ✓ Modal GPU processing complete in {format_duration(timings['modal_gpu'])}")
            print(f"   📊 Pages processed: {result['page_count']}")
            print(f"   📝 Markdown length: {len(result['markdown']):,} chars")
            print(f"   💰 Estimated cost: ${result['processing_time'] * 0.0003:.4f}\n")
        else:
            print(f"   ❌ Modal processing failed: {result.get('error')}")
            return

    except Exception as e:
        print(f"   ❌ Modal GPU error: {e}")
        return

    # STEP 3: Text Chunking
    print("━" * 70)
    print("STEP 3: Text Chunking (LlamaIndex)")
    print("━" * 70)
    start = time.time()

    from llama_index.core.node_parser import SentenceSplitter

    splitter = SentenceSplitter(chunk_size=512, chunk_overlap=50)
    text_chunks = splitter.split_text(result["markdown"])

    timings["chunking"] = time.time() - start
    print(f"   ✓ Chunked into {len(text_chunks)} pieces in {format_duration(timings['chunking'])}")
    print(
        f"   📏 Avg chunk size: {sum(len(c) for c in text_chunks) / len(text_chunks):.0f} chars\n"
    )

    # STEP 4: Generate Embeddings
    print("━" * 70)
    print("STEP 4: Generate Embeddings (OpenAI)")
    print("━" * 70)
    start = time.time()

    from llama_index.embeddings.openai import OpenAIEmbedding

    embed_model = OpenAIEmbedding(model="text-embedding-3-small")

    print(f"   🤖 Generating embeddings for {len(text_chunks)} chunks...")
    embeddings = embed_model.get_text_embedding_batch(text_chunks[:100])  # Limit for test

    timings["embeddings"] = time.time() - start
    print(
        f"   ✓ Generated {len(embeddings)} embeddings in {format_duration(timings['embeddings'])}"
    )
    print(f"   📐 Embedding dimension: {len(embeddings[0])}\n")

    # STEP 5: Database Operations
    print("━" * 70)
    print("STEP 5: PostgreSQL Operations")
    print("━" * 70)

    DATABASE_URL = os.getenv("DATABASE_URL")
    if not DATABASE_URL:
        print("   ⚠️  DATABASE_URL not set, skipping DB writes")
    else:
        start = time.time()
        engine = create_engine(DATABASE_URL)
        Session = sessionmaker(bind=engine)
        session = Session()

        # Count existing documents (to verify connection)
        count = session.execute(text("SELECT COUNT(*) FROM ingestion.documents_raw")).scalar()

        timings["db_ops"] = time.time() - start
        print(f"   ✓ Connected to database in {format_duration(timings['db_ops'])}")
        print(f"   📊 Existing documents: {count}\n")
        session.close()

    # TOTAL SUMMARY
    print("=" * 70)
    print("📊 PERFORMANCE SUMMARY")
    print("=" * 70)

    total_time = sum(timings.values())

    print(f"\n{'Step':<30} {'Time':<15} {'% of Total':<10}")
    print("-" * 70)

    for step, duration in timings.items():
        percentage = (duration / total_time) * 100
        bar_length = int(percentage / 2)  # Scale to 50 chars max
        bar = "█" * bar_length

        print(f"{step:<30} {format_duration(duration):<15} {percentage:>5.1f}% {bar}")

    print("-" * 70)
    print(f"{'TOTAL PIPELINE TIME':<30} {format_duration(total_time):<15} 100.0%")
    print()

    # BOTTLENECK ANALYSIS
    print("=" * 70)
    print("🔍 BOTTLENECK ANALYSIS")
    print("=" * 70)

    bottleneck = max(timings.items(), key=lambda x: x[1])
    print(f"\n⚠️  Slowest step: {bottleneck[0]} ({format_duration(bottleneck[1])})")
    print(f"   This represents {(bottleneck[1]/total_time)*100:.1f}% of total processing time")

    if bottleneck[0] == "modal_gpu":
        print("\n💡 Optimization suggestions:")
        print("   • Batch process multiple PDFs in parallel (10x throughput)")
        print("   • Use T4 GPU for 50% cost savings (30% slower)")
        print("   • Use A100 GPU for 2x speed (2x cost)")
        print("   • Cache results by file hash to avoid reprocessing")
    elif bottleneck[0] == "embeddings":
        print("\n💡 Optimization suggestions:")
        print("   • Batch embeddings in larger groups (reduce API calls)")
        print("   • Use async/parallel embedding generation")
        print("   • Consider local embedding model for cost savings")

    print("\n" + "=" * 70)
    print("✅ Performance test complete!")
    print("=" * 70 + "\n")


if __name__ == "__main__":
    main()
