#!/usr/bin/env python3
"""
Cleanup Confluence Orphans
==========================
Identifies pages in Confluence Space 'PC' that are NOT in the local mapping file.
Moves them to an 'Orphaned Pages Archive' page.
"""

import json
import os
from pathlib import Path

from atlassian import Confluence
from dotenv import load_dotenv

PROJECT_ROOT = Path(__file__).resolve().parent.parent.parent
# Fix env loading path
load_dotenv(PROJECT_ROOT / ".env")

# Config
MAPPING_FILE = PROJECT_ROOT / "docs" / ".confluence-mapping.json"
SPACE_KEY = "PC"
ARCHIVE_PAGE_TITLE = "🗑️ Refactoring Archive (2025-12-06)"

CONFLUENCE_URL = os.getenv("CONFLUENCE_URL", os.getenv("JIRA_URL"))
CONFLUENCE_EMAIL = os.getenv("CONFLUENCE_EMAIL", os.getenv("JIRA_EMAIL"))
CONFLUENCE_API_TOKEN = os.getenv("CONFLUENCE_API_TOKEN", os.getenv("JIRA_API_TOKEN"))


def main():
    confluence = Confluence(
        url=CONFLUENCE_URL, username=CONFLUENCE_EMAIL, password=CONFLUENCE_API_TOKEN
    )

    # 1. Load Local Active IDs
    with open(MAPPING_FILE) as f:
        mapping = json.load(f)
    active_ids = set()
    for meta in mapping.values():
        if "page_id" in meta:
            active_ids.add(str(meta["page_id"]))

    print(f"Loaded {len(active_ids)} active pages from valid local files.")

    # 2. Fetch All Confluence Pages
    print("Fetching all pages from Confluence...")
    all_pages = confluence.get_all_pages_from_space(SPACE_KEY, start=0, limit=500)

    orphans = []
    print(f"Found {len(all_pages)} total pages in space {SPACE_KEY}.")

    # 3. Create/Find Archive Page
    archive_page = confluence.get_page_by_title(SPACE_KEY, ARCHIVE_PAGE_TITLE)
    if not archive_page:
        print(f"Creating Archive Page: {ARCHIVE_PAGE_TITLE}")
        archive_page = confluence.create_page(
            SPACE_KEY, ARCHIVE_PAGE_TITLE, body="<p>Storage for orphaned pages.</p>"
        )
    archive_id = archive_page["id"]
    print(f"Archive Page ID: {archive_id}")

    # 4. Filter Orphans
    for page in all_pages:
        pid = str(page["id"])

        # Don't archive the archive itself!
        if pid == str(archive_id):
            continue

        if pid not in active_ids:
            orphans.append(page)

    print(f"\nFound {len(orphans)} orphaned pages.")

    # 5. Move Orphans
    if not orphans:
        print("No orphans to clean up.")
        return

    print("Moving orphans to archive...")
    for p in orphans:
        print(f"Moving: '{p['title']}' ({p['id']}) -> Archive")
        try:
            confluence.move_page(p["id"], archive_id)
        except Exception as e:
            print(f"Failed to move {p['title']}: {e}")


if __name__ == "__main__":
    main()
