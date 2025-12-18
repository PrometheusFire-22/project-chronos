#!/usr/bin/env python3
"""
Bulk Confluence Sync Script
Syncs entire docs/ directory to Confluence with proper hierarchy
"""

import json
import os
import subprocess
import sys
from datetime import UTC, datetime
from pathlib import Path

from dotenv import load_dotenv

# Configuration
DOCS_DIR = Path("/home/prometheus/coding/finance/project-chronos/docs")
MAPPING_FILE = DOCS_DIR / ".confluence-mapping.json"
CONFLUENCE_SPACE = "PC"

# Load environment variables from .env file
env_path = Path(__file__).parent.parent.parent / ".env"
load_dotenv(env_path)

# Environment variables (must be set)
REQUIRED_ENV = ["CONFLUENCE_URL", "CONFLUENCE_EMAIL", "CONFLUENCE_API_TOKEN"]

# Colors
GREEN = "\033[92m"
YELLOW = "\033[93m"
BLUE = "\033[94m"
RED = "\033[91m"
RESET = "\033[0m"

# Hierarchy mapping for top-level directories
HIERARCHY_MAP = {
    "10-DEVELOPMENT": "📂 10-DEVELOPMENT",
    "10-DEVELOPMENT/01-ARCHITECTURE": "🏛️ 01-ARCHITECTURE",
    "10-DEVELOPMENT/02-INFRASTRUCTURE": "🏗️ 02-INFRASTRUCTURE",
    "10-DEVELOPMENT/03-CODEBASE": "💻 03-CODEBASE",
    "10-DEVELOPMENT/04-DEVOPS": "⚙️ 04-DEVOPS",
    "20-PRODUCT": "🚀 20-PRODUCT",
    "20-PRODUCT/01-STRATEGY": "🎯 01-STRATEGY",
    "20-PRODUCT/03-ROADMAP": "🗓️ 03-ROADMAP",
    "30-OPERATIONS": "💼 30-OPERATIONS",
    "30-OPERATIONS/03-PEOPLE": "👥 03-PEOPLE",
    "_archive": "🗄️ _archive",
}


def check_environment():
    """Verify required environment variables are set"""
    missing = [var for var in REQUIRED_ENV if not os.getenv(var)]
    if missing:
        print(f"{RED}❌ Missing environment variables: {', '.join(missing)}{RESET}")
        print(f"\n{YELLOW}Please set:{RESET}")
        print("export CONFLUENCE_URL='https://automatonicai.atlassian.net'")
        print("export CONFLUENCE_EMAIL='axiologycapital@gmail.com'")
        print("export CONFLUENCE_API_TOKEN='your-token'")
        sys.exit(1)


def load_mapping():
    """Load existing Confluence mapping"""
    if MAPPING_FILE.exists():
        with open(MAPPING_FILE) as f:
            return json.load(f)
    return {}


def save_mapping(mapping):
    """Save Confluence mapping"""
    with open(MAPPING_FILE, "w") as f:
        json.dump(mapping, f, indent=2)


def run_confluence_cmd(args):
    """Run confluence CLI command"""
    cmd = ["confluence"] + args
    result = subprocess.run(cmd, capture_output=True, text=True)
    return result.returncode == 0, result.stdout, result.stderr


def get_or_create_parent(title, parent_title=None):
    """Get or create a parent page"""
    # Try to find existing page
    success, stdout, stderr = run_confluence_cmd(
        ["list", "--space", CONFLUENCE_SPACE, "--limit", "100"]
    )

    if success and title in stdout:
        # We only need to know it exists. The CLI uses title for --parent.
        return title

    # Create new parent page
    args = [
        "create",
        "--title",
        title,
        "--space",
        CONFLUENCE_SPACE,
        "--body",
        f"# {title}\n\nAuto-generated parent page for documentation organization.",
        "--labels",
        "documentation,auto-generated",
    ]

    if parent_title:
        args.extend(["--parent", parent_title])

    success, stdout, stderr = run_confluence_cmd(args)

    if success:
        return title

    return None


def extract_id(stdout):
    """Extract page ID from CLI table output using regex"""
    import re

    # Look for digits in the "Page ID" value column
    # Use robust regex to handle single (│) or double (║) borders
    # Matches: "Page ID   │ 123" or "Page ID   ║ 123"
    match = re.search(r"Page ID\s*[│║|]\s*(\d+)", stdout)
    if match:
        return match.group(1)

    # Debug if regex fails but output looks like a table
    if "Page ID" in stdout:
        print(f"{YELLOW}  ⚠ Debug: Regex failed to match 'Page ID' in output.{RESET}")
    return None


def sync_file_to_confluence(file_path, parent_title=None, retry_count=0):
    """Sync a single markdown file to Confluence"""
    rel_path = file_path.relative_to(DOCS_DIR)

    # Skip archived files
    if "_archive" in str(rel_path):
        return None, "skipped (archived)"

    # Generate title from filename
    title = file_path.stem.replace("_", " ").replace("-", " ").title()

    # Special handling for certain files
    if file_path.name == "README.md":
        title = f"{file_path.parent.name} - Overview"

    if retry_count == 0:
        print(f"{BLUE}→{RESET} Syncing: {rel_path}")
        print(f"  Title: {title}")

    # Check if page exists in mapping
    mapping = load_mapping()
    doc_key = f"docs/{rel_path}"

    if doc_key in mapping:
        page_id = mapping[doc_key].get("page_id")
        # Sanity check ID (fix corruption)
        if page_id and not page_id.isdigit():
            print(f"{YELLOW}  ⚠ Invalid ID in mapping ({page_id}), forcing lookup/create...{RESET}")
            page_id = None  # Force re-lookup/create logic

    # Logic to handle existing page confirmation needed here?
    # For now relying on update falling through or create failing if title exists.

    if (
        doc_key in mapping
        and mapping[doc_key].get("page_id")
        and mapping[doc_key]["page_id"].isdigit()
    ):
        # Update existing page
        args = ["update", title, "--space", CONFLUENCE_SPACE, "--body-file", str(file_path)]

        if parent_title:
            args.extend(["--parent", parent_title])

        success, stdout, stderr = run_confluence_cmd(args)

        if success:
            print(f"{GREEN}  ✓ Updated{RESET}")
            return mapping[doc_key]["page_id"], "updated"

        print(f"{YELLOW}  ⚠ Update failed: {stdout + stderr}{RESET}")
        print(f"{YELLOW}  ⚠ Attempting create/recovery...{RESET}")

    # Create new page
    args = [
        "create",
        "--title",
        title,
        "--space",
        CONFLUENCE_SPACE,
        "--body-file",
        str(file_path),
        "--labels",
        "documentation,auto-synced",
    ]

    if parent_title:
        args.extend(["--parent", parent_title])

    success, stdout, stderr = run_confluence_cmd(args)

    if success:
        page_id = extract_id(stdout)

        if page_id:
            # Update mapping
            mapping[doc_key] = {
                "page_id": page_id,
                "space": CONFLUENCE_SPACE,
                "title": title,
                "last_synced": datetime.now(UTC).isoformat() + "Z",
            }
            save_mapping(mapping)
            print(f"{GREEN}  ✓ Created (ID: {page_id}){RESET}")
            return page_id, "created"
        else:
            print(f"{YELLOW}  ⚠ Created but couldn't extract ID{RESET}")
            return None, "created (no ID)"
    else:
        # Check stdout for error (Rich console prints to stdout)
        combined_output = stdout + stderr

        # If create failed because it already exists, recover by mapping it
        if "already exists" in combined_output or "Conflict" in combined_output:
            if retry_count > 0:
                print(f"{RED}  ✗ Recursion limit reached. Cannot recover.{RESET}")
                return None, "error (recursion)"

            print(f"{YELLOW}  ⚠ Page exists but not mapped. Recovering ID...{RESET}")

            # Fetch the existing page ID
            read_args = ["read", title, "--space", CONFLUENCE_SPACE]
            r_success, r_stdout, r_stderr = run_confluence_cmd(read_args)

            if r_success:
                existing_id = extract_id(r_stdout)
                if existing_id:
                    print(
                        f"{GREEN}  ✓ Found existing ID: {existing_id}. Updating mapping...{RESET}"
                    )
                    mapping[doc_key] = {
                        "page_id": existing_id,
                        "space": CONFLUENCE_SPACE,
                        "title": title,
                        "last_synced": datetime.now(UTC).isoformat() + "Z",
                    }
                    save_mapping(mapping)

                    # Now retry as update
                    return sync_file_to_confluence(file_path, parent_title, retry_count=1)

        print(f"{RED}  ✗ Failed to create: {combined_output}{RESET}")
        return None, f"error: {combined_output}"


def ensure_index_page(title, parent_title=None):
    """Ensure a directory page exists and has the Children Display macro"""
    # Macro for listing child pages (makes mobile nav easy)
    index_body = '<p><ac:structured-macro ac:name="children" /></p>'

    # Check if exists
    success, stdout, stderr = run_confluence_cmd(
        ["list", "--space", CONFLUENCE_SPACE, "--limit", "1"]  # Limit for speed
    )

    # If we can't reliably check existence via list (it lists ALL pages),
    # we should try to read specific page or just try update then create.
    # The 'list' command in my CLI lists all pages. That's inefficient.
    # Let's try to READ the page to check existence.
    success, stdout, stderr = run_confluence_cmd(["read", title, "--space", CONFLUENCE_SPACE])

    if success:
        # Page exists, update it to be an index page
        # Remove --labels since it causes issues
        args = ["update", title, "--space", CONFLUENCE_SPACE, "--body", index_body]
        if parent_title:
            args.extend(["--parent", parent_title])

        u_success, u_stdout, u_stderr = run_confluence_cmd(args)
        if u_success:
            print(f"{GREEN}  ✓ Index page updated: {title}{RESET}")
            return title
        else:
            print(f"{YELLOW}  ⚠ Index update failed: {u_stdout}{RESET}")
            return title  # Return title anyway so children can find it

    else:
        # Page does not exist, create it
        args = ["create", "--title", title, "--space", CONFLUENCE_SPACE, "--body", index_body]
        if parent_title:
            args.extend(["--parent", parent_title])

        c_success, c_stdout, c_stderr = run_confluence_cmd(args)
        if c_success:
            print(f"{GREEN}  ✓ Index page created: {title}{RESET}")
            return title
        else:
            print(f"{RED}  ✗ Index create failed: {c_stdout}{RESET}")
            return None


def sync_directory(directory, parent_title="📚 Documentation"):
    """Recursively sync a directory to Confluence"""
    stats = {"created": 0, "updated": 0, "skipped": 0, "errors": 0}

    # Determine the Confluence parent title based on the directory structure
    dir_rel_path = str(directory.relative_to(DOCS_DIR))

    if dir_rel_path == ".":
        dir_title = "📚 Documentation"
    else:
        # Check if we have a specific mapping with an emoji
        dir_title = HIERARCHY_MAP.get(dir_rel_path)
        if not dir_title:
            dir_title = directory.name.replace("_", " ").replace("-", " ").title()

    # Skip certain directories
    skip_dirs = {".git", "__pycache__", "node_modules"}
    if directory.name in skip_dirs:
        return stats

    # Get or create parent page for this directory
    if directory != DOCS_DIR:
        current_parent = ensure_index_page(dir_title, parent_title)
        if not current_parent:
            print(f"{RED}  ⚠ Failed to ensure parent '{dir_title}'. skipping contents.{RESET}")
            return stats
    else:
        current_parent = parent_title

    # Sync markdown files in this directory
    for file_path in sorted(directory.glob("*.md")):
        page_id, status = sync_file_to_confluence(file_path, current_parent)

        if "created" in status:
            stats["created"] += 1
        elif "updated" in status:
            stats["updated"] += 1
        elif "skipped" in status:
            stats["skipped"] += 1
        else:
            stats["errors"] += 1

    # Recursively sync subdirectories
    for subdir in sorted(directory.iterdir()):
        if subdir.is_dir() and subdir.name not in skip_dirs:
            sub_stats = sync_directory(subdir, current_parent)
            for key in stats:
                stats[key] += sub_stats[key]

    return stats


def main():
    print(f"\n{BLUE}{'='*60}")
    print("  Bulk Confluence Sync - Project Chronos Documentation")
    print(f"{'='*60}{RESET}\n")

    # Check environment
    print(f"{YELLOW}Checking environment...{RESET}")
    check_environment()
    print(f"{GREEN}✓ Environment OK{RESET}\n")

    # Ensure Documentation parent exists
    print(f"{YELLOW}Ensuring Documentation parent page exists...{RESET}")
    doc_parent = get_or_create_parent("📚 Documentation")
    if doc_parent:
        print(f"{GREEN}✓ Documentation parent ready (ID: {doc_parent}){RESET}\n")
    else:
        print(f"{YELLOW}⚠ Using existing Documentation parent{RESET}\n")

    # Start sync
    print(f"{YELLOW}Starting bulk sync...{RESET}\n")
    stats = sync_directory(DOCS_DIR)

    # Print summary
    print(f"\n{BLUE}{'='*60}")
    print("  Sync Complete!")
    print(f"{'='*60}{RESET}\n")

    print(f"{GREEN}Created:{RESET}  {stats['created']} pages")
    print(f"{BLUE}Updated:{RESET}  {stats['updated']} pages")
    print(f"{YELLOW}Skipped:{RESET}  {stats['skipped']} pages")
    print(f"{RED}Errors:{RESET}   {stats['errors']} pages")

    print(f"\n{BLUE}View in Confluence:{RESET}")
    print("https://automatonicai.atlassian.net/wiki/spaces/PC/overview\n")


if __name__ == "__main__":
    main()
