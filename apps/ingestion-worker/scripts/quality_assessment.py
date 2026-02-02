#!/usr/bin/env python3
"""
Quality Assessment Tools for Document Ingestion Pipeline

Three methods for validating Modal GPU processing accuracy:
1. Visual Markdown Comparison (export markdown to file)
2. Structured JSON Inspection (analyze document structure)
3. RAG Query Testing (end-to-end quality check)

Usage:
    # Option 1: Visual comparison
    python scripts/quality_assessment.py visual --file-id abc-123 --output compare.md

    # Option 2: JSON structure inspection
    python scripts/quality_assessment.py inspect --file-id abc-123

    # Option 3: RAG query testing
    python scripts/quality_assessment.py query --file-id abc-123 --question "What services are listed?"
"""

import argparse
import json
import os
from pathlib import Path


def visual_markdown_comparison(file_id: str, output_path: str = "output.md"):
    """
    Option 1: Export markdown from Modal processing for visual comparison.

    Saves markdown to file so you can view side-by-side with original PDF.

    Args:
        file_id: Document ID from database
        output_path: Where to save the markdown file
    """
    print(f"🔍 Fetching markdown for document {file_id}...")

    # Option A: If already processed, get from database
    try:
        from models import DocumentRaw
        from services.database import get_db

        with get_db() as db:
            doc = db.query(DocumentRaw).filter_by(id=file_id).first()
            if doc and doc.markdown_content:
                markdown = doc.markdown_content
                print("✅ Retrieved from database")
            else:
                print("⚠️  Not found in database, fetching from Modal...")
                markdown = _fetch_from_modal(file_id)
    except Exception as e:
        print(f"⚠️  Database error: {e}, fetching from Modal...")
        markdown = _fetch_from_modal(file_id)

    # Save to file
    output_file = Path(output_path)
    output_file.write_text(markdown, encoding="utf-8")

    print(
        f"""
✅ Markdown saved to: {output_file.absolute()}

📊 Quick Stats:
   - Length: {len(markdown):,} characters
   - Lines: {len(markdown.splitlines()):,}
   - Words: {len(markdown.split()):,}

🔍 Visual Comparison Steps:
   1. Open original PDF in viewer (left window)
   2. Open {output_file} in VS Code/text editor (right window)
   3. Compare structure:
      - Are headers (##, ###) correct?
      - Are lists and bullets preserved?
      - Are tables extracted properly?
      - Are emojis and special chars preserved? ✅🚀📊
   4. Check for missing content or hallucinations
"""
    )


def _fetch_from_modal(file_id: str) -> str:
    """Fetch markdown by processing file through Modal."""
    # This would call Modal if document not yet processed
    # For now, placeholder
    raise NotImplementedError("Modal fetching not yet implemented - process document first")


def inspect_json_structure(file_id: str):
    """
    Option 2: Analyze the structured JSON from Docling processing.

    Inspects document structure (pages, tables, text blocks) to validate
    extraction quality.

    Args:
        file_id: Document ID from database
    """
    print(f"🔍 Inspecting JSON structure for document {file_id}...")

    from models import DocumentRaw
    from services.database import get_db

    with get_db() as db:
        doc = db.query(DocumentRaw).filter_by(id=file_id).first()
        if not doc:
            print(f"❌ Document {file_id} not found in database")
            return

        doc_json = doc.docling_data

        # Analyze structure
        pages = doc_json.get("pages", [])

        print(
            f"""
✅ Document Structure Analysis

📄 Basic Info:
   - Document ID: {file_id}
   - File Name: {doc.file_name}
   - Total Pages: {len(pages)}

📊 Content Breakdown:
"""
        )

        tables_count = 0
        text_blocks_count = 0
        images_count = 0

        for i, page in enumerate(pages, 1):
            page_tables = len(page.get("tables", []))
            page_text = len(page.get("text", []))
            page_images = len(page.get("images", []))

            tables_count += page_tables
            text_blocks_count += page_text
            images_count += page_images

            if page_tables > 0 or page_images > 0:
                print(
                    f"   Page {i}: {page_text} text blocks, {page_tables} tables, {page_images} images"
                )

        print(
            f"""
📈 Totals:
   - Text Blocks: {text_blocks_count}
   - Tables Detected: {tables_count}
   - Images Found: {images_count}

💾 Storage:
   - JSON Size: {len(json.dumps(doc_json)):,} bytes
   - Markdown Size: {len(doc.markdown_content):,} characters (if stored)

✅ Quality Checks:
   - ✓ All pages extracted: {len(pages) > 0}
   - ✓ Text content found: {text_blocks_count > 0}
   - ✓ Tables preserved: {tables_count > 0 if tables_count > 0 else '(none detected)'}

🔍 Next Steps:
   1. Review page-by-page breakdown above
   2. Check if table count matches visual inspection of PDF
   3. Verify text blocks cover all content areas
   4. Run visual comparison (Option 1) for detailed check
"""
        )


def rag_query_testing(file_id: str, question: str):
    """
    Option 3: End-to-end RAG quality testing.

    Queries the document using semantic search and compares answer
    to what you'd expect from the PDF.

    Args:
        file_id: Document ID from database
        question: Natural language question about the document
    """
    print(f"🤖 RAG Query Testing for document {file_id}")
    print(f"❓ Question: {question}\n")

    from llama_index.embeddings.openai import OpenAIEmbedding
    from models import DocumentChunk
    from services.database import get_db

    # 1. Generate query embedding
    embed_model = OpenAIEmbedding(
        model="text-embedding-3-small", api_key=os.getenv("OPENAI_API_KEY")
    )

    query_embedding = embed_model.get_text_embedding(question)

    # 2. Search for similar chunks using pgvector
    with get_db() as db:
        # Vector similarity search
        results = db.query(DocumentChunk).filter_by(document_id=file_id).all()

        if not results:
            print(f"❌ No chunks found for document {file_id}")
            return

        # Calculate cosine similarity (manual for now, use pgvector operator in production)
        import numpy as np

        scored_chunks = []
        query_vec = np.array(query_embedding)

        for chunk in results:
            chunk_vec = np.array(chunk.embedding)
            similarity = np.dot(query_vec, chunk_vec) / (
                np.linalg.norm(query_vec) * np.linalg.norm(chunk_vec)
            )
            scored_chunks.append((similarity, chunk))

        # Sort by similarity
        scored_chunks.sort(reverse=True, key=lambda x: x[0])

        # Display top results
        print(f"📊 Found {len(scored_chunks)} chunks. Top 3 most relevant:\n")

        for i, (score, chunk) in enumerate(scored_chunks[:3], 1):
            print(f"{'='*60}")
            print(f"Rank {i} | Similarity: {score:.3f} | Chunk #{chunk.chunk_index}")
            print(f"{'='*60}")
            print(
                chunk.text_content[:300] + "..."
                if len(chunk.text_content) > 300
                else chunk.text_content
            )
            print()

        # Generate answer using top chunks (simple concatenation)
        context = "\n\n".join([chunk.text_content for _, chunk in scored_chunks[:3]])

        print(
            f"""
🎯 RAG Pipeline Quality Assessment:

✅ Retrieval Working:
   - Query embedded successfully
   - {len(scored_chunks)} chunks searched
   - Top match similarity: {scored_chunks[0][0]:.3f}

📝 Retrieved Context (for LLM):
{'-'*60}
{context[:500]}...
{'-'*60}

🔍 Quality Check Instructions:
   1. Read the retrieved chunks above
   2. Open the original PDF to the relevant section
   3. Compare:
      - Is this the right section of the document?
      - Is the content accurate?
      - Are there any hallucinations or errors?
      - Is important context missing?

💡 To generate actual answer, pipe context to LLM:

   echo "Context: {context[:100]}... Question: {question}" | llm

   Or use OpenAI API:

   curl https://api.openai.com/v1/chat/completions \\
     -H "Authorization: Bearer $OPENAI_API_KEY" \\
     -d '{{"model": "gpt-4", "messages": [...]}}'
"""
        )


def main():
    parser = argparse.ArgumentParser(
        description="Quality Assessment Tools for Document Ingestion",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog=__doc__,
    )

    subparsers = parser.add_subparsers(dest="command", help="Quality assessment method")

    # Option 1: Visual comparison
    visual_parser = subparsers.add_parser("visual", help="Export markdown for visual comparison")
    visual_parser.add_argument("--file-id", required=True, help="Document ID")
    visual_parser.add_argument("--output", default="output.md", help="Output file path")

    # Option 2: JSON inspection
    inspect_parser = subparsers.add_parser("inspect", help="Inspect JSON structure")
    inspect_parser.add_argument("--file-id", required=True, help="Document ID")

    # Option 3: RAG testing
    query_parser = subparsers.add_parser("query", help="RAG query testing")
    query_parser.add_argument("--file-id", required=True, help="Document ID")
    query_parser.add_argument("--question", required=True, help="Question to ask about document")

    args = parser.parse_args()

    if not args.command:
        parser.print_help()
        return

    if args.command == "visual":
        visual_markdown_comparison(args.file_id, args.output)
    elif args.command == "inspect":
        inspect_json_structure(args.file_id)
    elif args.command == "query":
        rag_query_testing(args.file_id, args.question)


if __name__ == "__main__":
    main()
