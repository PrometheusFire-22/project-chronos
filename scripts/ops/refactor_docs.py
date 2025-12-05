#!/usr/bin/env python3
"""
Documentation Refactoring Script
Systematically consolidates duplicate documentation files
"""

import shutil
from pathlib import Path

# Base paths
DOCS_DIR = Path("/home/prometheus/coding/finance/project-chronos/docs")
ARCHIVE_DIR = DOCS_DIR / "_archive" / "pre_refactoring_2025-12-05"

# Color codes
GREEN = "\033[92m"
YELLOW = "\033[93m"
BLUE = "\033[94m"
RESET = "\033[0m"


def create_archive_dir():
    """Create archive directory for old files"""
    ARCHIVE_DIR.mkdir(parents=True, exist_ok=True)
    print(f"{GREEN}✓ Created archive directory: {ARCHIVE_DIR}{RESET}")


def archive_file(source: Path, category: str = "misc"):
    """Archive a file before deletion"""
    if not source.exists():
        print(f"{YELLOW}⚠ File not found: {source}{RESET}")
        return

    dest_dir = ARCHIVE_DIR / category
    dest_dir.mkdir(parents=True, exist_ok=True)
    dest = dest_dir / source.name

    shutil.copy2(source, dest)
    print(f"{BLUE}→ Archived: {source.name} to {category}/{RESET}")


def consolidate_google_workspace():
    """Consolidate 7 Google Workspace files into 2"""
    print(f"\n{GREEN}{'='*60}")
    print("Consolidating Google Workspace Documentation")
    print(f"{'='*60}{RESET}\n")

    # Files to archive
    files_to_archive = [
        DOCS_DIR / "3_runbooks" / "google_workspace_api_setup.md",
        DOCS_DIR / "3_runbooks" / "google_workspace_cli.md",
        DOCS_DIR / "3_runbooks" / "google_workspace_email_config.md",
        DOCS_DIR / "4_guides" / "google_workspace_api_guide.md",
        DOCS_DIR / "4_guides" / "google_workspace_keepassxc_complete_guide.md",
        DOCS_DIR / "4_guides" / "google_workspace_keepassxc_security_guide.md",
    ]

    for file in files_to_archive:
        archive_file(file, "google_workspace")

    print(f"{GREEN}✓ Google Workspace files archived{RESET}")
    print(f"{YELLOW}→ Manual action required: Create consolidated files{RESET}")
    print("  - operations/integrations/google_workspace_setup.md")
    print("  - guides/integration/google_workspace_guide.md")


def consolidate_keepassxc():
    """Consolidate 4 KeePassXC files into 2"""
    print(f"\n{GREEN}{'='*60}")
    print("Consolidating KeePassXC Documentation")
    print(f"{'='*60}{RESET}\n")

    files_to_archive = [
        DOCS_DIR / "3_runbooks" / "keepassxc_unified_workflow.md",
        DOCS_DIR / "4_guides" / "keepassxc_tagging_methodology.md",
        DOCS_DIR / "4_guides" / "google_workspace_keepassxc_complete_guide.md",
        DOCS_DIR / "4_guides" / "google_workspace_keepassxc_security_guide.md",
    ]

    for file in files_to_archive:
        archive_file(file, "keepassxc")

    print(f"{GREEN}✓ KeePassXC files archived{RESET}")
    print(f"{YELLOW}→ Manual action required: Create consolidated files{RESET}")
    print("  - operations/security/keepassxc_workflow.md")
    print("  - guides/organization/keepassxc_organization.md")


def consolidate_disaster_recovery():
    """Consolidate 3 DR files into 1"""
    print(f"\n{GREEN}{'='*60}")
    print("Consolidating Disaster Recovery Documentation")
    print(f"{'='*60}{RESET}\n")

    files_to_archive = [
        DOCS_DIR / "3_runbooks" / "disaster_recovery_lost_computer.md",
        DOCS_DIR / "3_runbooks" / "disaster_recovery_operational.md",
        DOCS_DIR / "3_runbooks" / "disaster_recovery_technical.md",
    ]

    for file in files_to_archive:
        archive_file(file, "disaster_recovery")

    print(f"{GREEN}✓ DR files archived{RESET}")
    print(f"{YELLOW}→ Manual action required: Create consolidated file{RESET}")
    print("  - operations/disaster_recovery/disaster_recovery.md")


def consolidate_confluence():
    """Consolidate 4 Confluence files into 1"""
    print(f"\n{GREEN}{'='*60}")
    print("Consolidating Confluence Documentation")
    print(f"{'='*60}{RESET}\n")

    files_to_archive = [
        DOCS_DIR / "3_runbooks" / "confluence_cli_runbook.md",
        DOCS_DIR / "3_runbooks" / "confluence_comprehensive_sync_guide.md",
        DOCS_DIR / "3_runbooks" / "confluence_daily_sync_cron.md",
        DOCS_DIR / "3_runbooks" / "confluence_hierarchy_management.md",
    ]

    for file in files_to_archive:
        archive_file(file, "confluence")

    print(f"{GREEN}✓ Confluence files archived{RESET}")
    print(f"{YELLOW}→ Manual action required: Create consolidated file{RESET}")
    print("  - operations/development/confluence_sync.md")


def main():
    print(f"\n{GREEN}{'='*60}")
    print("Documentation Refactoring Script")
    print(f"{'='*60}{RESET}\n")

    # Create archive directory
    create_archive_dir()

    # Consolidate each category
    consolidate_google_workspace()
    consolidate_keepassxc()
    consolidate_disaster_recovery()
    consolidate_confluence()

    print(f"\n{GREEN}{'='*60}")
    print("Archival Complete!")
    print(f"{'='*60}{RESET}\n")

    print(f"{YELLOW}Next Steps:{RESET}")
    print(f"1. Review archived files in: {ARCHIVE_DIR}")
    print("2. Create consolidated files in new structure")
    print("3. Update internal links")
    print("4. Update .confluence-mapping.json")
    print("5. Commit changes\n")


if __name__ == "__main__":
    main()
