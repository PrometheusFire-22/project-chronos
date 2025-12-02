#!/usr/bin/env python3
"""
Documentation Sync Script
=========================
Syncs local markdown files to Confluence based on .confluence-mapping.json.
Leverages logic from src/chronos/cli/confluence_cli.py.

Usage:
    python3 sync_docs.py              # Sync content only
    python3 sync_docs.py --organize   # Sync content + organize hierarchy
"""

import argparse
import json
import subprocess
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


def organize_hierarchy(dry_run=False):
    """
    Run the Confluence hierarchy organization script

    Args:
        dry_run: If True, run in dry-run mode (preview only)
    """
    script_path = current_dir / "organize_confluence_hierarchy.py"

    if not script_path.exists():
        print(f"Warning: Hierarchy script not found at {script_path}")
        print("Skipping hierarchy organization.")
        return False

    print("\n" + "=" * 60)
    print("📂 Organizing Confluence Hierarchy...")
    print("=" * 60 + "\n")

    cmd = [sys.executable, str(script_path)]
    if dry_run:
        cmd.append("--dry-run")

    try:
        result = subprocess.run(cmd, check=True, capture_output=False)
        return result.returncode == 0
    except subprocess.CalledProcessError as e:
        print(f"Error organizing hierarchy: {e}")
        return False


def main():
    # Parse command-line arguments
    parser = argparse.ArgumentParser(description="Sync local markdown documentation to Confluence")
    parser.add_argument(
        "--organize",
        action="store_true",
        help="Organize Confluence hierarchy after syncing (creates folder structure)",
    )
    parser.add_argument(
        "--dry-run-organize",
        action="store_true",
        help="Preview hierarchy organization without making changes",
    )
    args = parser.parse_args()

    # Step 1: Sync documentation content
    print("=" * 60)
    print("📄 Syncing Documentation Content")
    print("=" * 60)
    print(f"Using mapping file: {MAPPING_FILE}\n")

    mapping = load_mapping()

    if not mapping:
        print("No files to sync in mapping.")
    else:
        for filepath, metadata in mapping.items():
            sync_file(filepath, metadata, mapping)

        save_mapping(mapping)
        print("\n✅ Content sync completed.")

    # Step 2: Organize hierarchy (if requested)
    if args.organize or args.dry_run_organize:
        success = organize_hierarchy(dry_run=args.dry_run_organize)
        if success:
            print("\n✅ Hierarchy organization completed.")
        else:
            print("\n⚠️ Hierarchy organization had issues (see above).")

    print("\n" + "=" * 60)
    print("🎉 All operations complete!")
    print("=" * 60)


if __name__ == "__main__":
    main()
