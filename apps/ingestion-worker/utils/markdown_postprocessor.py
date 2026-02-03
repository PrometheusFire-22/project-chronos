"""
Markdown Post-Processor for Docling Output

Improves markdown quality by:
1. Adding proper line breaks in contact information
2. Restructuring merged table cells for better readability
3. Preserving semantic structure while improving human readability
"""

import re
from typing import Any


class MarkdownPostProcessor:
    """Post-processes Docling markdown output to improve quality."""

    def __init__(self):
        # Patterns for contact information
        self.email_pattern = re.compile(r"E-mail:\s*(\S+@\S+)")
        self.phone_pattern = re.compile(r"Direct:\s*([\d\.\-\(\)\s]+)")
        self.name_email_pattern = re.compile(r"([A-Z][a-z]+(?:\s+[A-Z][a-z]+)+)\s+Direct:")

    def process_markdown(self, markdown: str, doc_json: dict[str, Any]) -> str:
        """
        Post-process markdown to improve quality.

        Args:
            markdown: Raw markdown from Docling
            doc_json: Docling JSON output for context

        Returns:
            Improved markdown with better formatting
        """
        # Apply processing steps
        markdown = self._improve_contact_info_formatting(markdown)
        markdown = self._add_semantic_line_breaks(markdown)
        markdown = self._improve_table_spacing(markdown)

        return markdown

    def _improve_contact_info_formatting(self, markdown: str) -> str:
        """
        Improve formatting of contact information in tables.

        Addresses the issue where contact details are merged on one line like:
        "boneill@goodmans.ca Christopher Armstrong Direct: 416.849.6013"

        Restructures to:
        "boneill@goodmans.ca

        Christopher Armstrong
        Direct: 416.849.6013"
        """

        def format_contact_block(match):
            """Format a single contact information block."""
            text = match.group(0)

            # Split on email addresses to identify person boundaries
            # Pattern: Email followed by Name followed by contact details
            parts = []
            current = ""

            for line in text.split():
                if "@" in line and "." in line:
                    # Found an email - save previous contact block
                    if current:
                        parts.append(current.strip())
                    current = line
                else:
                    current += " " + line

            if current:
                parts.append(current.strip())

            # Reformat each part with better line breaks
            formatted_parts = []
            for part in parts:
                # Add line breaks before "Direct:" and "E-mail:"
                part = re.sub(r"\s+(Direct:)", r"\n\1", part)
                part = re.sub(r"\s+(E-mail:)", r"\n\1", part)

                # Add line break after email address if followed by name
                part = re.sub(r"(@\S+)\s+([A-Z][a-z]+)", r"\1\n\n\2", part)

                formatted_parts.append(part)

            return "\n\n".join(formatted_parts)

        # Find table cells with multiple contact entries
        # This is a heuristic: lines with multiple email addresses or multiple "Direct:"
        contact_blocks = re.finditer(
            r"(?:[^\n]*(?:Direct:|E-mail:)[^\n]*\n?){2,}", markdown, re.MULTILINE
        )

        for match in contact_blocks:
            original = match.group(0)
            formatted = format_contact_block(match)
            markdown = markdown.replace(original, formatted, 1)

        return markdown

    def _add_semantic_line_breaks(self, markdown: str) -> str:
        """
        Add line breaks between semantic sections.

        Addresses the issue where headers run into body text.
        """
        # Add extra line break after headers (##, ###, etc.)
        markdown = re.sub(r"^(#{1,6}\s+.+)$", r"\1\n", markdown, flags=re.MULTILINE)

        # Add line break before tables
        markdown = re.sub(r"([^\n])\n(\|)", r"\1\n\n\2", markdown)

        # Add line break after tables
        markdown = re.sub(r"(\|[^\n]+)\n([^|\n])", r"\1\n\n\2", markdown)

        return markdown

    def _improve_table_spacing(self, markdown: str) -> str:
        """
        Improve spacing within table cells for better readability.

        Addresses cells that contain multiple logical items without line breaks.
        """
        # Find table rows
        table_pattern = re.compile(r"\|([^|\n]+)\|", re.MULTILINE)

        def format_cell(match):
            cell_content = match.group(1).strip()

            # If cell has multiple sentences or items, add internal structure
            # Look for patterns like "Item1 Item2 Item3" where each starts with capital
            if len(cell_content) > 100:  # Only process long cells
                # Add line breaks before new sentences starting with capital letters
                # after periods
                cell_content = re.sub(r"(\.\s+)([A-Z])", r"\1<br/>\2", cell_content)

            return f" {cell_content} |"

        # Process all table cells
        markdown = table_pattern.sub(format_cell, markdown)

        return markdown

    def get_quality_metrics(self, original_md: str, improved_md: str) -> dict[str, Any]:
        """
        Calculate quality improvement metrics.

        Args:
            original_md: Original markdown from Docling
            improved_md: Post-processed markdown

        Returns:
            Dictionary of quality metrics
        """
        return {
            "original_length": len(original_md),
            "improved_length": len(improved_md),
            "line_breaks_added": improved_md.count("\n") - original_md.count("\n"),
            "original_line_count": original_md.count("\n"),
            "improved_line_count": improved_md.count("\n"),
            "improvement_ratio": len(improved_md) / len(original_md) if original_md else 1.0,
        }


# Convenience function for quick post-processing
def postprocess_markdown(markdown: str, doc_json: dict[str, Any] = None) -> str:
    """
    Quick post-processing of markdown.

    Args:
        markdown: Raw markdown from Docling
        doc_json: Optional Docling JSON for context

    Returns:
        Improved markdown
    """
    processor = MarkdownPostProcessor()
    return processor.process_markdown(markdown, doc_json or {})
