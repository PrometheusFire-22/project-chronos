#!/usr/bin/env python3
"""
Test script to validate Docling configuration improvements.

This script:
1. Re-processes the test document with new configuration
2. Compares quality metrics before/after
3. Shows side-by-side comparison of specific problematic sections
"""

import sys
from pathlib import Path

# Add parent to path
sys.path.insert(0, str(Path(__file__).parent))

from dotenv import load_dotenv

load_dotenv(Path(__file__).parent / ".env")

from models import DocumentRaw  # noqa: E402
from services.database import get_db  # noqa: E402

# Configuration
OLD_DOCUMENT_ID = "c2a4e408-eab2-4f7f-a0ab-afb3c920ebc2"  # Existing test document
OUTPUT_DIR = Path(__file__).parent / "quality_review"


def analyze_quality_improvements():
    """Analyze quality improvements in the markdown."""
    print("\n" + "=" * 70)
    print("📊 DOCLING QUALITY IMPROVEMENT ANALYSIS")
    print("=" * 70 + "\n")

    with get_db() as db:
        old_doc = db.query(DocumentRaw).filter_by(id=OLD_DOCUMENT_ID).first()

        if not old_doc:
            print(f"❌ Document {OLD_DOCUMENT_ID} not found")
            print("   Run automated_quality_check.py first to create test document")
            return

        old_markdown = old_doc.markdown_content

        print(f"📄 Document: {old_doc.file_name}")
        print(f"   Created: {old_doc.created_at}")
        print()

        # Analyze specific quality issues
        print("🔍 Quality Issue Analysis:")
        print()

        # Issue 1: Line breaks
        old_header_transitions = count_header_to_text_breaks(old_markdown)
        print("1. Header-to-Text Transitions:")
        print(f"   Headers without blank line after: {old_header_transitions}")
        print()

        # Issue 2: Contact info formatting
        old_contact_blocks = count_merged_contact_info(old_markdown)
        print("2. Contact Information Formatting:")
        print(f"   Merged contact blocks found: {old_contact_blocks}")
        print()

        # Issue 3: Table quality
        old_tables = old_markdown.count("|")
        print("3. Table Cells:")
        print(f"   Total table separators: {old_tables}")
        print()

        # Show sample problematic sections
        print("=" * 70)
        print("📋 SAMPLE PROBLEMATIC SECTIONS")
        print("=" * 70 + "\n")

        # Find contact info example
        lines = old_markdown.split("\n")
        for _i, line in enumerate(lines):
            if "Direct:" in line and "E-mail:" in line and len(line) > 80:
                print("❌ BEFORE (merged contact info):")
                print(f"   {line[:100]}...")
                print()
                print("✅ EXPECTED AFTER (with post-processing):")
                print("   Name: John Doe")
                print("   Direct: 123.456.7890")
                print("   E-mail: jdoe@example.com")
                print()
                break

        print("=" * 70)
        print("💡 NEXT STEPS")
        print("=" * 70 + "\n")

        print("To test the improvements:")
        print()
        print("1. Deploy updated Modal function:")
        print("   modal deploy apps/ingestion-worker/modal_functions/docling_processor.py")
        print()
        print("2. Re-process a test document:")
        print("   python apps/ingestion-worker/main.py")
        print()
        print("3. Run quality check again:")
        print("   python apps/ingestion-worker/automated_quality_check.py")
        print()
        print("4. Compare the new markdown in PgAdmin4")
        print()


def count_header_to_text_breaks(markdown: str) -> int:
    """Count headers that don't have blank line after them."""
    lines = markdown.split("\n")
    issues = 0

    for i in range(len(lines) - 1):
        if lines[i].startswith("#") and lines[i + 1].strip() and not lines[i + 1].startswith("#"):
            issues += 1

    return issues


def count_merged_contact_info(markdown: str) -> int:
    """Count instances of merged contact information."""
    import re

    # Pattern: Direct: followed by more than just a phone number on same line
    pattern = r"Direct:.*E-mail:"
    matches = re.findall(pattern, markdown)

    return len(matches)


def main():
    """Run the quality improvement analysis."""
    analyze_quality_improvements()


if __name__ == "__main__":
    main()
