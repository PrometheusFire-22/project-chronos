#!/usr/bin/env python3
"""
Standalone RAG Quality Test
Tests retrieval quality for the processed document
"""

import os
import sys
from pathlib import Path

# Add parent to path
sys.path.insert(0, str(Path(__file__).parent))

# Test configuration
DOCUMENT_ID = "c2a4e408-eab2-4f7f-a0ab-afb3c920ebc2"

TEST_QUESTIONS = [
    "What services are mentioned in this document?",
    "Who are the parties involved in this legal matter?",
    "What is the address of the property?",
    "What court is handling this case?",
]

print("\n" + "=" * 70)
print("🧪 RAG PIPELINE QUALITY TEST")
print("=" * 70 + "\n")

print(f"📄 Document ID: {DOCUMENT_ID}")
print(f"❓ Test Questions: {len(TEST_QUESTIONS)}\n")

# Load dependencies
try:
    import numpy as np
    from llama_index.embeddings.openai import OpenAIEmbedding
    from models import DocumentChunk, DocumentRaw
    from services.database import get_db
except ImportError as e:
    print(f"❌ Import error: {e}")
    print("Run: poetry install")
    sys.exit(1)

# Initialize embedding model
try:
    embed_model = OpenAIEmbedding(
        model="text-embedding-3-small", api_key=os.getenv("OPENAI_API_KEY")
    )
except Exception as e:
    print(f"❌ Failed to initialize OpenAI: {e}")
    sys.exit(1)

# Test each question
for q_num, question in enumerate(TEST_QUESTIONS, 1):
    print("━" * 70)
    print(f"QUESTION {q_num}: {question}")
    print("━" * 70)

    try:
        # Generate query embedding
        query_embedding = embed_model.get_text_embedding(question)

        # Search for similar chunks
        with get_db() as db:
            # Get document info
            doc = db.query(DocumentRaw).filter_by(id=DOCUMENT_ID).first()
            if not doc:
                print(f"❌ Document {DOCUMENT_ID} not found")
                continue

            # Get all chunks
            chunks = db.query(DocumentChunk).filter_by(document_id=DOCUMENT_ID).all()

            if not chunks:
                print("❌ No chunks found for document")
                continue

            # Calculate similarities
            query_vec = np.array(query_embedding)
            scored_chunks = []

            for chunk in chunks:
                chunk_vec = np.array(chunk.embedding)
                similarity = np.dot(query_vec, chunk_vec) / (
                    np.linalg.norm(query_vec) * np.linalg.norm(chunk_vec)
                )
                scored_chunks.append((similarity, chunk))

            # Sort by similarity
            scored_chunks.sort(reverse=True, key=lambda x: x[0])

            # Show top result
            top_score, top_chunk = scored_chunks[0]

            print(f"\n✅ Top Match (Similarity: {top_score:.3f}):")
            print(f"{'─' * 70}")
            print(
                top_chunk.text_content[:400] + "..."
                if len(top_chunk.text_content) > 400
                else top_chunk.text_content
            )
            print(f"{'─' * 70}\n")

    except Exception as e:
        print(f"❌ Error processing question: {e}\n")
        import traceback

        traceback.print_exc()

# Summary
print("=" * 70)
print("📊 RAG QUALITY ASSESSMENT COMPLETE")
print("=" * 70)
print(
    """
✅ Quality Indicators to Check:
1. Are retrieved chunks relevant to questions?
2. Is the similarity score reasonable (>0.2 for relevant content)?
3. Does the content match what's in the original PDF?
4. Are there any hallucinations or missing information?

💡 Next Steps:
- Review each retrieved chunk above
- Compare with original PDF (test-service-list.pdf)
- Assess if RAG pipeline is production-ready
"""
)
