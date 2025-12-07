#!/usr/bin/env python3
"""
Rebuild Confluence Mapping
==========================
Scans docs/ directory (skipping _archive) and rebuilds .confluence-mapping.json.
Preserves existing Page IDs if paths match or titles match (heuristic).
"""

import json
from pathlib import Path

PROJECT_ROOT = Path(__file__).resolve().parent.parent.parent
MAPPING_FILE = PROJECT_ROOT / "docs" / ".confluence-mapping.json"
DOCS_DIR = PROJECT_ROOT / "docs"


def load_old_mapping():
    if MAPPING_FILE.exists():
        with open(MAPPING_FILE) as f:
            return json.load(f)
    return {}


def get_markdown_files():
    files = []
    for path in DOCS_DIR.rglob("*.md"):
        # Skip _archive and templates (templates don't need sync usually, but keeping them might be useful? User said "profusion", let's skip templates for now unless requested)
        # Actually user said "templates" folder exists. Let's sync templates but definitely skip _archive
        rel_path = path.relative_to(PROJECT_ROOT)
        if "_archive" in str(rel_path):
            continue
        files.append(str(rel_path))
    return sorted(files)


def extract_title(filepath):
    try:
        with open(PROJECT_ROOT / filepath) as f:
            line = f.readline()
            if line.startswith("# "):
                return line[2:].strip()
    except Exception:
        pass
    return Path(filepath).stem.replace("_", " ").title()


def main():
    old_mapping = load_old_mapping()
    old_by_title = {v.get("title"): k for k, v in old_mapping.items() if v.get("title")}

    new_mapping = {}
    current_files = get_markdown_files()

    print(f"Found {len(current_files)} active markdown files.")

    mapped_count = 0
    new_count = 0
    migrated_count = 0

    for filepath in current_files:
        title = extract_title(filepath)

        # 1. Exact path match
        if filepath in old_mapping:
            new_mapping[filepath] = old_mapping[filepath]
            new_mapping[filepath]["title"] = title  # Update title in case it changed
            mapped_count += 1
            print(f"Kept: {filepath}")

        # 2. Title match (File moved)
        elif title in old_by_title:
            old_path = old_by_title[title]
            new_mapping[filepath] = old_mapping[old_path]
            new_mapping[filepath]["title"] = title
            migrated_count += 1
            print(f"Migrated: {filepath} (was {old_path})")

        # 3. New file
        else:
            new_mapping[filepath] = {"title": title, "space": "PC"}  # Default space
            new_count += 1
            print(f"New: {filepath}")

    # Save
    with open(MAPPING_FILE, "w") as f:
        json.dump(new_mapping, f, indent=2, sort_keys=True)

    print("\nSummary:")
    print(f"  Kept: {mapped_count}")
    print(f"  Migrated: {migrated_count}")
    print(f"  New: {new_count}")
    print(f"  Total: {len(new_mapping)}")
    print(f"Mappling file updated: {MAPPING_FILE}")


if __name__ == "__main__":
    main()
