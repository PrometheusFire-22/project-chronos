#!/usr/bin/env python3
"""
Documentation Sync Script
=========================
Syncs local markdown files to Confluence based on .confluence-mapping.json.
Leverages logic from src/chronos/cli/confluence_cli.py.
"""

import json
import sys
from datetime import UTC, datetime
from pathlib import Path

# Add src to path to import confluence_cli
current_dir = Path(__file__).resolve().parent
project_root = current_dir.parent.parent
sys.path.append(str(project_root / "src"))

try:
    from chronos.cli.confluence_cli import confluence, markdown_to_confluence, prepend_banner
except ImportError as e:
    print(f"ImportError: {e}")
    print(
        "Error: Could not import confluence_cli. Make sure src/chronos/cli/confluence_cli.py exists."
    )
    print(f"sys.path: {sys.path}")
    sys.exit(1)
except Exception as e:
    print(f"Exception during import: {e}")
    sys.exit(1)

MAPPING_FILE = project_root / "docs" / ".confluence-mapping.json"


def load_mapping():
    if not MAPPING_FILE.exists():
        print(f"Warning: {MAPPING_FILE} not found. Creating empty mapping.")
        return {}
    with open(MAPPING_FILE) as f:
        return json.load(f)


def save_mapping(mapping):
    with open(MAPPING_FILE, "w") as f:
        json.dump(mapping, f, indent=2)


def sync_file(filepath, metadata, mapping):
    abs_path = project_root / filepath
    if not abs_path.exists():
        print(f"Skipping {filepath}: File not found.")
        return

    print(f"Syncing {filepath}...")

    with open(abs_path) as f:
        content = f.read()

    confluence_body = markdown_to_confluence(content)
    # Apply read-only banner to all synced pages
    confluence_body = prepend_banner(confluence_body)

    page_id = metadata.get("page_id")
    space = metadata.get("space", "PC")

    # Extract title from first line if possible, else use filename
    title = metadata.get("title")
    if not title:
        lines = content.splitlines()
        if lines and lines[0].startswith("# "):
            title = lines[0][2:].strip()
        else:
            title = abs_path.stem.replace("_", " ").title()

    try:
        if page_id:
            # Update existing page
            print(f"Updating page ID {page_id} ('{title}')...")
            confluence.update_page(
                page_id=page_id,
                title=title,
                body=confluence_body,
                type="page",
                representation="storage",
                minor_edit=False,
            )
        else:
            # Create new page (or find by title if ID missing)
            print(f"Page ID not found. Checking if page '{title}' exists in space '{space}'...")
            existing_page = confluence.get_page_by_title(space=space, title=title)

            if existing_page:
                page_id = existing_page["id"]
                print(f"Found existing page ID {page_id}. Updating...")
                confluence.update_page(
                    page_id=page_id,
                    title=title,
                    body=confluence_body,
                    type="page",
                    representation="storage",
                    minor_edit=False,
                )
            else:
                print(f"Creating new page '{title}'...")
                page = confluence.create_page(
                    space=space,
                    title=title,
                    body=confluence_body,
                    type="page",
                    representation="storage",
                )
                page_id = page["id"]

        # Update mapping
        mapping[filepath]["page_id"] = page_id
        mapping[filepath]["last_synced"] = datetime.now(UTC).isoformat() + "Z"
        print(f"Successfully synced {filepath}.")

    except Exception as e:
        print(f"Error syncing {filepath}: {e}")


def main():
    print(f"Using mapping file: {MAPPING_FILE}")
    mapping = load_mapping()

    if not mapping:
        print("No files to sync in mapping.")
        return

    for filepath, metadata in mapping.items():
        sync_file(filepath, metadata, mapping)

    save_mapping(mapping)
    print("Sync completed.")


if __name__ == "__main__":
    main()
