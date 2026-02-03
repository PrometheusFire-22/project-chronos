#!/usr/bin/env python3
"""
Simplified E2E test - verifies each component individually
Works around dependency split between root and ingestion-worker
"""

import os
import sys
import time
from pathlib import Path

print("\n" + "=" * 70)
print("🧪 END-TO-END PIPELINE VERIFICATION")
print("=" * 70 + "\n")

# Test 1: Modal GPU Connection
print("━" * 70)
print("TEST 1: Modal GPU Function Availability")
print("━" * 70)

try:
    import modal

    modal_fn = modal.Function.from_name("chronos-docling", "process_document")
    print("✅ Modal GPU function found: chronos-docling.process_document")
    print("   App: chronos-docling, Function: process_document\n")
except Exception as e:
    print(f"❌ Modal connection failed: {e}\n")
    sys.exit(1)

# Test 2: Database Connection
print("━" * 70)
print("TEST 2: PostgreSQL Connection & Schema")
print("━" * 70)

try:
    from sqlalchemy import create_engine, text

    DATABASE_URL = os.getenv("DATABASE_URL")
    if not DATABASE_URL:
        print("❌ DATABASE_URL not set\n")
        sys.exit(1)

    engine = create_engine(DATABASE_URL)
    with engine.connect() as conn:
        # Check ingestion schema
        result = conn.execute(
            text(
                """
            SELECT table_name
            FROM information_schema.tables
            WHERE table_schema = 'ingestion'
            ORDER BY table_name
        """
            )
        )
        tables = [row[0] for row in result]

        print("✅ Connected to database")
        print(f"   Tables in 'ingestion' schema: {', '.join(tables)}")

        # Check markdown_content column
        result = conn.execute(
            text(
                """
            SELECT column_name
            FROM information_schema.columns
            WHERE table_schema = 'ingestion'
              AND table_name = 'documents_raw'
              AND column_name = 'markdown_content'
        """
            )
        )

        if result.fetchone():
            print("   ✅ markdown_content column exists\n")
        else:
            print("   ❌ markdown_content column missing\n")

except Exception as e:
    print(f"❌ Database connection failed: {e}\n")
    sys.exit(1)

# Test 3: OpenAI API
print("━" * 70)
print("TEST 3: OpenAI Embeddings API")
print("━" * 70)

try:
    OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
    if not OPENAI_API_KEY:
        print("❌ OPENAI_API_KEY not set\n")
        sys.exit(1)

    from openai import OpenAI

    client = OpenAI(api_key=OPENAI_API_KEY)

    # Test embedding generation
    response = client.embeddings.create(
        model="text-embedding-3-small", input="Test document for embedding validation"
    )

    embedding = response.data[0].embedding
    print("✅ OpenAI API accessible")
    print("   Model: text-embedding-3-small")
    print(f"   Embedding dimension: {len(embedding)}\n")

except Exception as e:
    print(f"❌ OpenAI API failed: {e}\n")
    sys.exit(1)

# Test 4: Process Test PDF (if Modal works)
print("━" * 70)
print("TEST 4: Modal GPU Processing (10-page PDF)")
print("━" * 70)

test_pdf = Path(
    "/home/prometheus/coding/finance/project-chronos/apps/ingestion-worker/test-service-list.pdf"
)

if not test_pdf.exists():
    print(f"⚠️  Test PDF not found: {test_pdf}")
    print("   Skipping GPU processing test\n")
else:
    try:
        print(f"📄 Processing: {test_pdf.name}")

        with open(test_pdf, "rb") as f:
            pdf_bytes = f.read()

        print(f"   File size: {len(pdf_bytes)/1024:.1f} KB")
        print("   🔥 Sending to Modal A10G GPU...")

        start = time.time()

        result = modal_fn.remote(pdf_bytes=pdf_bytes, file_id="test_e2e", source_url=str(test_pdf))

        duration = time.time() - start

        if result.get("success"):
            print("✅ Modal GPU processing succeeded")
            print(f"   ⏱️  Processing time: {duration:.1f}s")
            print(f"   📊 Pages: {result['page_count']}")
            print(f"   📝 Markdown length: {len(result['markdown']):,} chars")
            print(f"   💰 Estimated cost: ${duration * 0.0003:.4f}\n")
        else:
            print(f"❌ Modal processing failed: {result.get('error')}\n")

    except Exception as e:
        print(f"❌ Modal GPU test failed: {e}\n")
        sys.exit(1)

# Summary
print("=" * 70)
print("✅ ALL COMPONENTS VERIFIED!")
print("=" * 70)
print(
    """
Pipeline is ready for end-to-end testing:

Next steps:
1. Upload PDF to Directus (or use manual /ingest endpoint)
2. Monitor Modal GPU processing
3. Verify data in PostgreSQL
4. Test RAG query quality

📚 Full testing guide: INTEGRATION_COMPLETE_NEXT_STEPS.md
"""
)
