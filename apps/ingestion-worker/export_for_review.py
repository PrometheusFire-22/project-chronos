#!/usr/bin/env python3
"""
Quick Export Script for GUI Review
Exports markdown and JSON from PostgreSQL for visual inspection
"""

import json
import sys
from pathlib import Path

# Add parent to path
sys.path.insert(0, str(Path(__file__).parent))

from models import DocumentRaw
from services.database import get_db

# Configuration
DOCUMENT_ID = "c2a4e408-eab2-4f7f-a0ab-afb3c920ebc2"
OUTPUT_DIR = Path(__file__).parent / "exports"


def main():
    print("\n" + "=" * 70)
    print("📤 EXPORT DOCUMENT FOR GUI REVIEW")
    print("=" * 70 + "\n")

    print(f"📄 Document ID: {DOCUMENT_ID}")
    print(f"📁 Output directory: {OUTPUT_DIR}\n")

    # Create output directory
    OUTPUT_DIR.mkdir(exist_ok=True)

    try:
        with get_db() as db:
            doc = db.query(DocumentRaw).filter_by(id=DOCUMENT_ID).first()

            if not doc:
                print(f"❌ Document {DOCUMENT_ID} not found in database")
                print("\nAvailable documents:")
                docs = db.query(DocumentRaw).order_by(DocumentRaw.created_at.desc()).limit(5).all()
                for d in docs:
                    print(f"   - {d.id} | {d.file_name} | {d.created_at}")
                return

            print(f"✅ Found document: {doc.file_name}")
            print(f"   Created: {doc.created_at}")
            print(f"   Markdown length: {len(doc.markdown_content):,} chars")
            print(f"   JSON size: {len(json.dumps(doc.docling_data)):,} bytes\n")

            # Export markdown
            markdown_file = OUTPUT_DIR / f"{doc.file_name.replace('.pdf', '')}_exported.md"
            markdown_file.write_text(doc.markdown_content, encoding="utf-8")
            print(f"📝 Markdown exported to: {markdown_file}")

            # Export JSON (pretty-printed)
            json_file = OUTPUT_DIR / f"{doc.file_name.replace('.pdf', '')}_exported.json"
            json_file.write_text(
                json.dumps(doc.docling_data, indent=2, ensure_ascii=False), encoding="utf-8"
            )
            print(f"🗂️  JSON exported to: {json_file}")

            # Export metadata summary
            summary_file = OUTPUT_DIR / f"{doc.file_name.replace('.pdf', '')}_summary.txt"
            summary = f"""Document Processing Summary
{'=' * 70}

File: {doc.file_name}
Document ID: {doc.id}
Source: {doc.source_url}
Type: {doc.doc_type}
Created: {doc.created_at}

Content Statistics:
- Markdown: {len(doc.markdown_content):,} characters
- JSON: {len(json.dumps(doc.docling_data)):,} bytes
- Pages: {len(doc.docling_data.get('pages', []))}

Next Steps for Review:
1. Open {markdown_file.name} in Typora or VS Code
2. Open {json_file.name} in VS Code with JSON extension
3. Compare with original PDF: {doc.file_name}

Quality Checks:
[ ] Content complete (compare to original PDF)
[ ] No hallucinations (invented content)
[ ] Formatting preserved (headers, lists, tables)
[ ] Special characters intact
[ ] Page count matches

To convert markdown to PDF:
  pandoc {markdown_file.name} -o reconstructed.pdf --pdf-engine=xelatex

For detailed instructions, see: GUI_INSPECTION_GUIDE.md
"""
            summary_file.write_text(summary, encoding="utf-8")
            print(f"📋 Summary exported to: {summary_file}")

            print("\n" + "=" * 70)
            print("✅ EXPORT COMPLETE!")
            print("=" * 70)
            print(f"\n📂 All files in: {OUTPUT_DIR.absolute()}")
            print("\nNext steps:")
            print("1. Open the markdown file in Typora or VS Code")
            print("2. Compare with original PDF side-by-side")
            print("3. Review JSON structure for completeness")
            print("4. Convert MD to PDF for visual comparison")
            print("\nSee GUI_INSPECTION_GUIDE.md for detailed walkthrough.\n")

    except Exception as e:
        print(f"❌ Export failed: {e}")
        import traceback

        traceback.print_exc()
        sys.exit(1)


if __name__ == "__main__":
    main()
