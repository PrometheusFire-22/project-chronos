"""
Custom JSON to Markdown renderer for Docling output.

Handles:
- Table rendering with proper cell formatting
- Contact information formatting (fixes merged blocks)
- Merged cells in tables
- Document structure preservation
"""

import re


def format_contact_info(text: str) -> str:
    """
    Format contact information with proper line breaks.

    Fixes merged contact blocks like:
    "John Doe Direct: 123-456-7890 E-mail: john@example.com"

    Into:
    "John Doe
    Direct: 123-456-7890
    E-mail: john@example.com"
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

    Handles:
    - Standard tables with rows and columns
    - Merged cells (colspan/rowspan)
    - Contact information formatting within cells
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

    # Add each row
    for i, row in enumerate(grid):
        # Clean up cells (replace newlines with <br> for markdown compatibility)
        cleaned_row = []
        for cell in row:
            # Replace internal newlines with <br/> for markdown tables
            cell_text = cell.replace("\n", "<br/>")
            cleaned_row.append(cell_text)

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


def json_to_markdown(docling_json: dict, preserve_contact_formatting: bool = True) -> str:
    """
    Convert Docling JSON to clean markdown.

    Args:
        docling_json: Docling output JSON
        preserve_contact_formatting: If True, adds line breaks to contact info

    Returns:
        Clean markdown string with:
        - Properly formatted tables
        - Fixed contact information
        - Document structure preserved
    """
    output = []

    # Get document name
    name = docling_json.get("name", "")
    if name:
        output.append(f"# {name}\n")

    # Process body content in order
    body = docling_json.get("body", {})

    # Method 1: Try to process in document order using children
    if body and "children" in body:
        for child_ref in body["children"]:
            # child_ref is a reference like {'$ref': '#/texts/0'}
            ref = child_ref.get("$ref", "")

            if "/texts/" in ref:
                # Extract text index
                idx = int(ref.split("/texts/")[-1])
                texts = docling_json.get("texts", [])
                if idx < len(texts):
                    output.append(render_text_block(texts[idx]))
                    output.append("")  # Blank line

            elif "/tables/" in ref:
                # Extract table index
                idx = int(ref.split("/tables/")[-1])
                tables = docling_json.get("tables", [])
                if idx < len(tables):
                    output.append(render_table(tables[idx]))
                    output.append("")  # Blank line

    # Method 2: Fallback - render all texts then all tables
    else:
        # Render text blocks
        for text_obj in docling_json.get("texts", []):
            output.append(render_text_block(text_obj))
            output.append("")

        # Render tables
        for table in docling_json.get("tables", []):
            output.append(render_table(table))
            output.append("")

    # Join and clean up
    markdown = "\n".join(output)

    # Clean up excessive blank lines
    markdown = re.sub(r"\n{3,}", "\n\n", markdown)

    return markdown.strip() + "\n"


def render_json_file_to_markdown(json_file_path: str, output_file_path: str = None) -> str:
    """
    Render a Docling JSON file to markdown.

    Args:
        json_file_path: Path to Docling JSON file
        output_file_path: Optional path to save markdown (if None, returns string)

    Returns:
        Markdown string
    """
    import json
    from pathlib import Path

    json_path = Path(json_file_path)

    with open(json_path) as f:
        docling_json = json.load(f)

    markdown = json_to_markdown(docling_json)

    if output_file_path:
        output_path = Path(output_file_path)
        output_path.write_text(markdown, encoding="utf-8")
        print(f"✅ Markdown saved to: {output_path}")

    return markdown
