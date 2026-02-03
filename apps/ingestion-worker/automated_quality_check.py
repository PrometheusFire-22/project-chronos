#!/usr/bin/env python3
"""
Automated RAG Quality Check - Programmatic End-to-End
Exports from PostgreSQL, generates PDF, and validates quality
"""

import json
import subprocess
import sys
from pathlib import Path

# Add parent to path
sys.path.insert(0, str(Path(__file__).parent))

# Load environment variables from .env file
from dotenv import load_dotenv

load_dotenv(Path(__file__).parent / ".env")

from models import DocumentChunk, DocumentRaw  # noqa: E402
from services.database import get_db  # noqa: E402

# Configuration
DOCUMENT_ID = "c2a4e408-eab2-4f7f-a0ab-afb3c920ebc2"
OUTPUT_DIR = Path(__file__).parent / "quality_review"


def export_data():
    """Export markdown and JSON from PostgreSQL"""
    print("\n" + "=" * 70)
    print("📤 STEP 1: EXPORT FROM POSTGRESQL")
    print("=" * 70 + "\n")

    OUTPUT_DIR.mkdir(exist_ok=True)

    with get_db() as db:
        doc = db.query(DocumentRaw).filter_by(id=DOCUMENT_ID).first()

        if not doc:
            print(f"❌ Document {DOCUMENT_ID} not found")
            return None

        print(f"✅ Found: {doc.file_name}")

        # Export markdown
        md_file = OUTPUT_DIR / f"{doc.file_name.replace('.pdf', '')}.md"
        md_file.write_text(doc.markdown_content, encoding="utf-8")
        print(f"   📝 Markdown → {md_file}")

        # Export JSON (for programmatic review)
        json_file = OUTPUT_DIR / f"{doc.file_name.replace('.pdf', '')}.json"
        json_file.write_text(
            json.dumps(doc.docling_data, indent=2, ensure_ascii=False),
            encoding="utf-8",
        )
        print(f"   🗂️  JSON     → {json_file}")

        # Export chunks summary
        chunks = db.query(DocumentChunk).filter_by(document_id=DOCUMENT_ID).all()
        chunks_file = OUTPUT_DIR / "chunks_summary.txt"
        with open(chunks_file, "w") as f:
            f.write(f"Document: {doc.file_name}\n")
            f.write(f"Total Chunks: {len(chunks)}\n\n")
            for chunk in chunks:
                f.write(f"--- Chunk {chunk.chunk_index} ---\n")
                f.write(f"{chunk.text_content}\n\n")
        print(f"   📦 Chunks   → {chunks_file}")

        # Access markdown_content before session closes
        markdown_content = doc.markdown_content

        return md_file, json_file, markdown_content


def convert_to_pdf(md_file):
    """Convert markdown to PDF using Pandoc"""
    print("\n" + "=" * 70)
    print("📄 STEP 2: CONVERT MARKDOWN TO PDF")
    print("=" * 70 + "\n")

    pdf_file = md_file.with_suffix(".pdf")

    # Check if pandoc is installed
    try:
        subprocess.run(["pandoc", "--version"], capture_output=True, check=True, timeout=5)
    except (subprocess.CalledProcessError, FileNotFoundError):
        print("❌ Pandoc not installed")
        print("   Install: sudo apt-get install pandoc texlive-latex-base")
        return None

    # Convert with Pandoc
    try:
        cmd = [
            "pandoc",
            str(md_file),
            "-o",
            str(pdf_file),
            "--pdf-engine=xelatex",
            "-V",
            "geometry:margin=1in",
        ]

        print(f"   🔄 Converting: {md_file.name} → {pdf_file.name}")
        result = subprocess.run(cmd, capture_output=True, text=True, timeout=60)

        if result.returncode == 0:
            print(f"   ✅ PDF created: {pdf_file}")
            return pdf_file
        else:
            print(f"   ❌ Conversion failed: {result.stderr}")
            return None

    except subprocess.TimeoutExpired:
        print("   ❌ Conversion timed out (>60s)")
        return None


def analyze_quality(json_file, markdown_content):
    """Programmatic quality analysis"""
    print("\n" + "=" * 70)
    print("🔍 STEP 3: AUTOMATED QUALITY CHECKS")
    print("=" * 70 + "\n")

    with open(json_file) as f:
        doc_json = json.load(f)

    # Check 1: Page count
    # Docling stores pages as dict with string keys '1', '2', '3', etc.
    pages_dict = doc_json.get("pages", {})
    page_count = len(pages_dict) if isinstance(pages_dict, dict) else 0
    print(f"✓ Page Count: {page_count} pages extracted")

    # Check 2: Content completeness (Docling-specific structure)
    total_text_blocks = len(doc_json.get("texts", []))
    total_tables = len(doc_json.get("tables", []))
    total_images = len(doc_json.get("pictures", []))

    print("✓ Content Breakdown:")
    print(f"   - Text blocks: {total_text_blocks}")
    print(f"   - Tables: {total_tables}")
    print(f"   - Images: {total_images}")

    # Check 3: Markdown size
    md_length = len(markdown_content)
    expected_min = page_count * 100  # Expect at least 100 chars/page
    if md_length < expected_min:
        print(f"⚠️  Warning: Markdown seems short ({md_length} chars)")
    else:
        print(f"✓ Markdown length: {md_length:,} characters")

    # Check 4: JSON structure integrity
    required_keys = ["pages", "texts"]
    missing_keys = [k for k in required_keys if k not in doc_json]
    if missing_keys:
        print(f"❌ Missing JSON keys: {missing_keys}")
    else:
        print("✓ JSON structure complete")

    return {
        "page_count": page_count,
        "text_blocks": total_text_blocks,
        "tables": total_tables,
        "images": total_images,
        "markdown_length": md_length,
        "json_valid": len(missing_keys) == 0,
    }


def generate_report(stats, md_file, pdf_file):
    """Generate quality assessment report"""
    print("\n" + "=" * 70)
    print("📊 QUALITY ASSESSMENT REPORT")
    print("=" * 70 + "\n")

    report_file = OUTPUT_DIR / "quality_report.txt"
    with open(report_file, "w") as f:
        f.write("RAG PIPELINE QUALITY ASSESSMENT\n")
        f.write("=" * 70 + "\n\n")

        f.write("Document Statistics:\n")
        f.write(f"  Pages extracted: {stats['page_count']}\n")
        f.write(f"  Text blocks: {stats['text_blocks']}\n")
        f.write(f"  Tables detected: {stats['tables']}\n")
        f.write(f"  Images found: {stats['images']}\n")
        f.write(f"  Markdown length: {stats['markdown_length']:,} chars\n\n")

        f.write("Output Files:\n")
        f.write(f"  Markdown: {md_file}\n")
        if pdf_file:
            f.write(f"  PDF: {pdf_file}\n")
        f.write(f"  Report: {report_file}\n\n")

        f.write("Manual Review Steps:\n")
        f.write("1. Open PgAdmin4 → Connect to database\n")
        f.write("2. Query: SELECT * FROM ingestion.documents_raw\n")
        f.write(f"3. Find document: {DOCUMENT_ID}\n")
        f.write("4. Click JSONB column → View in tree mode\n")
        f.write(f"5. Open {md_file.name} in Typora\n")
        if pdf_file:
            f.write(f"6. Compare {pdf_file.name} with original PDF\n\n")

        f.write("Quality Checklist:\n")
        f.write("[ ] Content complete (all pages present)\n")
        f.write("[ ] No hallucinations (no invented content)\n")
        f.write("[ ] Formatting preserved (headers, lists)\n")
        f.write("[ ] Tables intact (if applicable)\n")
        f.write("[ ] Special characters correct\n\n")

        overall = (
            "PASS ✅" if stats["json_valid"] and stats["page_count"] > 0 else "REVIEW NEEDED ⚠️"
        )
        f.write(f"Overall Status: {overall}\n")

    print(f"📋 Report saved: {report_file}\n")
    with open(report_file) as f:
        print(f.read())


def main():
    print("\n🚀 AUTOMATED RAG QUALITY CHECK")
    print("   Document ID: " + DOCUMENT_ID)
    print("   Output: " + str(OUTPUT_DIR) + "\n")

    # Step 1: Export from PostgreSQL
    result = export_data()
    if not result:
        sys.exit(1)
    md_file, json_file, markdown_content = result

    # Step 2: Convert to PDF
    pdf_file = convert_to_pdf(md_file)

    # Step 3: Analyze quality
    stats = analyze_quality(json_file, markdown_content)

    # Step 4: Generate report
    generate_report(stats, md_file, pdf_file)

    print("\n" + "=" * 70)
    print("✅ QUALITY CHECK COMPLETE")
    print("=" * 70)
    print(f"\n📂 All files in: {OUTPUT_DIR.absolute()}")
    print("\nNext: Open PgAdmin4 and Typora for manual review")
    print("      See quality_report.txt for checklist\n")


if __name__ == "__main__":
    main()
