"""
Modal GPU function for Docling document processing.

This function runs on Modal's GPU infrastructure (A10G or T4) to process PDF documents
using Docling's document AI capabilities (OCR, layout detection, content extraction).

Architecture:
    Directus Upload → FastAPI Webhook → Modal GPU Function → Response (JSON)

Cost Tracking:
    - Logs GPU processing time for cost analysis
    - Estimated cost: ~$0.01-0.03 per document (30 seconds @ $1.10/hour for A10G)

Usage:
    # Deploy to Modal
    modal deploy modal_functions/docling_processor.py

    # Test locally with GPU
    modal run modal_functions/docling_processor.py

    # Call from Python
    import modal
    fn = modal.Function.lookup("chronos-docling", "process_document")
    result = fn.remote(pdf_bytes, "file-123")
"""

import re
import tempfile
import time
from pathlib import Path

import modal

# ==================================================================
# Custom JSON to Markdown Renderer
# ==================================================================


def format_contact_info(text: str) -> str:
    """
    Format contact information with proper line breaks.

    Fixes merged contact blocks by adding <br/> tags before Direct: and E-mail:.
    """
    if not text:
        return text

    # Add line break before "Direct:"
    text = re.sub(r"\s+(Direct:)", r"\n\1", text)

    # Add line break before "E-mail:" or "Email:"
    text = re.sub(r"\s+(E-mail:|Email:)", r"\n\1", text)

    # Add line break after email when followed by a name
    text = re.sub(r"(@\S+)\s+([A-Z][a-z]+ [A-Z])", r"\1\n\n\2", text)

    return text


def render_table(table: dict) -> str:
    """
    Render a table from Docling JSON to markdown.

    Handles standard tables, merged cells, and contact info formatting.
    """
    data = table.get("data", {})
    num_rows = data.get("num_rows", 0)
    num_cols = data.get("num_cols", 0)
    cells = data.get("table_cells", [])

    if not cells:
        return ""

    # Build grid
    grid = [["" for _ in range(num_cols)] for _ in range(num_rows)]

    # Fill grid with cell data
    for cell in cells:
        text = cell.get("text", "")
        row = cell.get("start_row_offset_idx", 0) or cell.get("end_row_offset_idx", 0) - 1
        col = cell.get("start_col_offset_idx", 0) or cell.get("end_col_offset_idx", 0) - 1

        # Format contact info
        text = format_contact_info(text)

        # Handle merged cells - put content in first cell
        if row < num_rows and col < num_cols:
            grid[row][col] = text

    # Convert grid to markdown
    lines = []

    for i, row in enumerate(grid):
        # Replace internal newlines with <br/> for markdown tables
        cleaned_row = [cell.replace("\n", "<br/>") for cell in row]
        lines.append("| " + " | ".join(cleaned_row) + " |")

        # Add header separator after first row
        if i == 0:
            lines.append("|" + "|".join(["---" for _ in range(num_cols)]) + "|")

    return "\n".join(lines)


def render_text_block(text_obj: dict) -> str:
    """Render a text block from Docling JSON."""
    text = text_obj.get("text", "")
    label = text_obj.get("label", "")

    # Apply formatting based on label
    if label == "title":  # noqa: SIM116
        return f"# {text}\n"
    elif label == "section_header":
        return f"## {text}\n"
    elif label == "paragraph":
        return f"{text}\n"
    else:
        return f"{text}\n"


def json_to_markdown(docling_json: dict) -> str:
    """
    Convert Docling JSON to clean markdown.

    Returns properly formatted markdown with:
    - Tables with contact info formatting
    - Document structure preserved
    - Fixed merged contact blocks
    """
    output = []

    # Get document name
    name = docling_json.get("name", "")
    if name:
        output.append(f"# {name}\n")

    # Process body content in order
    body = docling_json.get("body", {})

    # Method 1: Process in document order using children
    if body and "children" in body:
        for child_ref in body["children"]:
            ref = child_ref.get("$ref", "")

            if "/texts/" in ref:
                idx = int(ref.split("/texts/")[-1])
                texts = docling_json.get("texts", [])
                if idx < len(texts):
                    output.append(render_text_block(texts[idx]))
                    output.append("")

            elif "/tables/" in ref:
                idx = int(ref.split("/tables/")[-1])
                tables = docling_json.get("tables", [])
                if idx < len(tables):
                    output.append(render_table(tables[idx]))
                    output.append("")

    # Method 2: Fallback - render all texts then all tables
    else:
        for text_obj in docling_json.get("texts", []):
            output.append(render_text_block(text_obj))
            output.append("")

        for table in docling_json.get("tables", []):
            output.append(render_table(table))
            output.append("")

    # Join and clean up
    markdown = "\n".join(output)
    markdown = re.sub(r"\n{3,}", "\n\n", markdown)

    return markdown.strip() + "\n"


# ==================================================================
# Modal Image Configuration
# ==================================================================

# Define Modal container image with Docling dependencies
image = (
    modal.Image.debian_slim(python_version="3.11")
    .apt_install(
        "libgl1",  # OpenCV dependency
        "libglib2.0-0",  # GTK dependency
    )
    .pip_install(
        "docling>=2.0.0",  # Use Docling 2.x with working API
        "torch",  # PyTorch for ML models
        "torchvision",  # Vision models
    )
)

# Create Modal app
app = modal.App("chronos-docling", image=image)

# ==================================================================
# GPU Function: Document Processing
# ==================================================================


@app.function(
    gpu="A10G",  # NVIDIA A10G GPU (~$1.10/hour)
    # Alternative: gpu="T4" for cheaper option (~$0.60/hour, slightly slower)
    timeout=600,  # 10 minutes max per document
    memory=8192,  # 8GB RAM
    retries=2,  # Retry on failure
)
def process_document(pdf_bytes: bytes, file_id: str, source_url: str = None) -> dict:
    """
    Process a PDF document using Docling on GPU.

    This function:
    1. Receives PDF as bytes
    2. Writes to temporary file
    3. Processes with Docling (OCR, layout detection, extraction)
    4. Returns structured JSON and markdown

    Args:
        pdf_bytes: PDF file content as bytes
        file_id: Unique identifier for the file (from Directus)
        source_url: Optional source URL for metadata

    Returns:
        dict: {
            "doc_json": {...},  # Docling native format (rich structure)
            "markdown": "...",  # Markdown representation
            "processing_time": 12.5,  # seconds
            "file_id": "abc123",
            "page_count": 10,
            "success": True
        }

    Raises:
        ValueError: If document conversion fails
    """
    start_time = time.time()

    # Import here (inside function) for Modal
    from docling.document_converter import DocumentConverter

    # Write bytes to temporary file
    with tempfile.NamedTemporaryFile(suffix=".pdf", delete=False) as tmp:
        tmp.write(pdf_bytes)
        tmp_path = Path(tmp.name)

    try:
        # Initialize Docling converter (Docling 2.x API)
        converter = DocumentConverter()

        # Process document (GPU-accelerated OCR and layout detection)
        # Docling 2.x returns ConversionResult directly
        result = converter.convert(tmp_path)
        doc = result.document

        # Export to formats
        doc_json = doc.export_to_dict()

        # Use custom renderer instead of Docling's markdown export
        # This fixes merged contact blocks and provides better formatting
        markdown_content = json_to_markdown(doc_json)

        # Calculate processing time
        processing_time = time.time() - start_time

        # Extract metadata
        page_count = len(doc_json.get("pages", []))

        return {
            "doc_json": doc_json,
            "markdown": markdown_content,
            "processing_time": processing_time,
            "file_id": file_id,
            "source_url": source_url,
            "page_count": page_count,
            "success": True,
            "error": None,
        }

    except Exception as e:
        processing_time = time.time() - start_time
        return {
            "doc_json": None,
            "markdown": None,
            "processing_time": processing_time,
            "file_id": file_id,
            "source_url": source_url,
            "page_count": 0,
            "success": False,
            "error": str(e),
        }

    finally:
        # Cleanup temporary file
        if tmp_path.exists():
            tmp_path.unlink()


# ==================================================================
# Batch Processing Function (Cost Optimization)
# ==================================================================


@app.function(
    gpu="A10G",
    timeout=1800,  # 30 minutes for batch
    memory=16384,  # 16GB for batch processing
    retries=1,
)
def process_document_batch(documents: list[dict]) -> list[dict]:
    """
    Process multiple documents in a single GPU session for cost optimization.

    This reduces cold start overhead and better utilizes GPU time.

    Args:
        documents: List of dicts with "pdf_bytes", "file_id", "source_url"

    Returns:
        list[dict]: List of processing results

    Cost Savings:
        - Single GPU spin-up for multiple documents
        - 30-50% cost reduction compared to individual processing
        - Ideal for batch uploads (5-10 documents)
    """
    results = []
    for doc in documents:
        result = process_document.local(
            pdf_bytes=doc["pdf_bytes"],
            file_id=doc["file_id"],
            source_url=doc.get("source_url"),
        )
        results.append(result)
    return results


# ==================================================================
# Local Testing & CLI
# ==================================================================


@app.local_entrypoint()
def main(test_pdf_path: str = "apps/ingestion-worker/test.pdf"):
    """
    Test the Modal function locally.

    Usage:
        modal run modal_functions/docling_processor.py --test-pdf-path path/to/test.pdf
    """
    from pathlib import Path

    pdf_path = Path(test_pdf_path)

    if not pdf_path.exists():
        print(f"Error: Test PDF not found at {pdf_path}")
        print(f"Current working directory: {Path.cwd()}")
        return

    print(f"Testing Modal Docling processor with {pdf_path.name}...")

    with open(pdf_path, "rb") as f:
        pdf_bytes = f.read()

    print(f"PDF size: {len(pdf_bytes) / 1024:.2f} KB")

    # Call the remote function
    result = process_document.remote(pdf_bytes, "test-123", str(pdf_path))

    if result["success"]:
        print("\n✅ Success!")
        print(f"   Processing time: {result['processing_time']:.2f}s")
        print(f"   Page count: {result['page_count']}")
        print(f"   Markdown length: {len(result['markdown'])} chars")
        print(f"   GPU cost: ~${result['processing_time'] / 3600 * 1.10:.4f}")
    else:
        print(f"\n❌ Failed: {result['error']}")

    return result
