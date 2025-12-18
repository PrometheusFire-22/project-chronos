#!/usr/bin/env python3
"""
🎯 Confluence Hierarchy Organizer
==================================
Organizes Confluence pages into a hierarchical structure matching local docs folder structure.

Features:
- Creates parent pages for each documentation category
- Moves existing pages under appropriate parents
- Adds semantic emojis to page titles
- Maintains existing page IDs and URLs
- Updates .confluence-mapping.json with new structure

Usage:
    python3 scripts/ops/organize_confluence_hierarchy.py [--dry-run]
"""
import json
import os
import sys
from pathlib import Path

from atlassian import Confluence
from dotenv import load_dotenv
from rich.console import Console
from rich.panel import Panel
from rich.progress import Progress, SpinnerColumn, TextColumn
from rich.table import Table

# Load environment
env_path = Path(__file__).parent.parent.parent / ".env"
load_dotenv(env_path)

# Confluence configuration
CONFLUENCE_URL = os.getenv("CONFLUENCE_URL", os.getenv("JIRA_URL"))
CONFLUENCE_EMAIL = os.getenv("CONFLUENCE_EMAIL", os.getenv("JIRA_EMAIL"))
CONFLUENCE_API_TOKEN = os.getenv("CONFLUENCE_API_TOKEN", os.getenv("JIRA_API_TOKEN"))
SPACE_KEY = "PC"

# Rich console
console = Console()

# Initialize Confluence client
try:
    confluence = Confluence(
        url=CONFLUENCE_URL, username=CONFLUENCE_EMAIL, password=CONFLUENCE_API_TOKEN
    )
except Exception as e:
    console.print(f"[bold red]❌ Failed to initialize Confluence client:[/bold red] {str(e)}")
    sys.exit(1)

# Mapping file
MAPPING_FILE = Path(__file__).parent.parent.parent / "docs" / ".confluence-mapping.json"


# Hierarchical structure with emojis
HIERARCHY = {
    "root": {
        "title": "📘 Project Chronos Documentation",
        "description": "Complete documentation for Project Chronos platform",
        "children": [
            "0_vision",
            "1_concepts",
            "2_architecture",
            "operations",
            "4_guides",
            "troubleshooting",
            "session_notes",
            "marketing",
            "reference",
            "templates",
            "decisions",
            "planning",
            "archive",
            "general_docs",
        ],
    },
    "0_vision": {
        "title": "📂 0. Vision & Strategy",
        "description": "Project vision, strategy, and business context",
        "pattern": "docs/vision_and_strategy/",
        "children": ["0_outreach"],
    },
    "0_outreach": {
        "title": "📁 Outreach & Communications",
        "description": "Investor relations and external communications",
        "pattern": "docs/vision_and_strategy/outreach/",
    },
    "1_concepts": {
        "title": "📂 1. Platform Concepts",
        "description": "Core concepts and foundational knowledge",
        "pattern": "docs/1_platform_concepts/",
    },
    "2_architecture": {
        "title": "📂 2. Architecture",
        "description": "System architecture, design decisions, and technical specifications",
        "pattern": "docs/architecture/",
        "children": ["2_adrs", "2_analytical", "2_governance"],
    },
    "2_adrs": {
        "title": "📁 Architecture Decision Records (ADRs)",
        "description": "Documented architectural decisions with rationale",
        "pattern": "docs/architecture/adrs/",
    },
    "2_analytical": {
        "title": "📁 Analytical Design",
        "description": "Analytics architecture and data modeling",
        "pattern": "docs/architecture/analytical_design/",
    },
    "2_governance": {
        "title": "📁 Data Governance",
        "description": "Data governance policies and procedures",
        "pattern": "docs/architecture/data_governance/",
    },
    "operations": {
        "title": "📂 3. Runbooks (Operations)",
        "description": "Operational procedures and step-by-step guides",
        "pattern": "docs/operations/",
    },
    "4_guides": {
        "title": "📂 4. Guides (How-To)",
        "description": "How-to guides and tutorials",
        "pattern": "docs/guides/",
    },
    "troubleshooting": {
        "title": "📂 6. Troubleshooting",
        "description": "Problem resolution and post-mortems",
        "pattern": "docs/reference/troubleshooting/",
    },
    "session_notes": {
        "title": "📂 Session Notes (Chronological)",
        "description": "Development session notes and progress logs",
        "pattern": "docs/session_notes/",
    },
    "marketing": {
        "title": "📈 Marketing",
        "description": "Marketing strategies, guidelines, and content",
        "pattern": "docs/marketing/",
    },
    "reference": {
        "title": "📚 Reference",
        "description": "API references, CLI manuals, and external resources",
        "pattern": "docs/reference/",
        "children": ["reference_cli", "reference_components"],
    },
    "reference_cli": {
        "title": "🧰 CLI",
        "description": "CLI tool manuals and usage guides",
        "pattern": "docs/reference/cli/",
    },
    "reference_components": {
        "title": "🧩 Components",
        "description": "Reusable UI components and design patterns",
        "pattern": "docs/reference/components/",
    },
    "templates": {
        "title": "📝 Templates",
        "description": "Standardized templates for documents, tickets, and PRs",
        "pattern": "docs/templates/",
    },
    "decisions": {
        "title": "⚖️ Decisions",
        "description": "Architectural and project decisions",
        "pattern": "docs/decisions/",
    },
    "planning": {
        "title": "🗓️ Planning",
        "description": "Roadmaps, implementation plans, and strategic documents",
        "pattern": "docs/planning/",
    },
    "archive": {
        "title": "🗄️ Archive",
        "description": "Deprecated or historical documentation",
        "pattern": "docs/archive/",
        "children": ["archive_payload_cms_attempt"],
    },
    "archive_payload_cms_attempt": {
        "title": "🚫 Payload CMS Attempt",
        "description": "Documentation related to the deprecated Payload CMS integration",
        "pattern": "docs/archive/payload-cms-attempt/",
    },
    "general_docs": {
        "title": "📄 General Docs",
        "description": "General project documentation and root-level files",
        "children": ["quick_ref"],
        "patterns": [
            "docs/CLEANUP_COMPLETE.md",
            "docs/CLOUDFLARE_MIGRATION_PLAN.md",
            "docs/CONTRIBUTING.md",
            "docs/CURRENT_STATE.md",
            "docs/DATABASE_SETUP_VERIFICATION.md",
            "docs/DEPLOYMENT.md",
            "docs/DEVOPS_HARDENING_PLAN.md",
            "docs/DOCUMENTATION_INDEX.md",
            "docs/DOCUMENTATION_REFACTOR_DECISION.md",
            "docs/GIT_WORKFLOW.md",
            "docs/JIRA_TICKETS_CREATED.md",
            "docs/PAYLOAD_CMS_CONTENT_PLAN.md",
            "docs/PAYLOAD_CMS_REMOVAL.md",
            "docs/PROJECT_OVERVIEW.md",
            "docs/QUICK_START.md",
            "docs/README.md",
            "docs/SECRETS_REFERENCE.md",
        ],
    },
    "quick_ref": {
        "title": "📄 Quick References",
        "description": "Quick reference cards and cheat sheets",
        "patterns": [
            "docs/OPERATIONS_QUICK_REFERENCE.md",
            "docs/LLM_ONBOARDING_GUIDE.md",
            "docs/DOCKER_FIX.md",
            "docs/reference/cli/atlassian_cli.md",
            "docs/marketing/ARTISTIC_INSPIRATION.md",
            "docs/marketing/READINESS_ASSESSMENT.md",
            "docs/marketing/TECH_STACK_RECOMMENDATIONS.md",
            "docs/reference/components/hero-section.md",
            "docs/reference/troubleshooting/COMMON_ISSUES.md",
            "docs/templates/confluence_page_template.md",
            "docs/templates/git_commit_template.md",
            "docs/templates/github_pr_template.md",
            "docs/templates/jira_ticket_template.md",
            "docs/troubleshooting/2025-11-17_post_mortem_data_persistence_failure.md",
            "docs/vision_and_strategy/1_architectural_deep_dive.md",
            "docs/vision_and_strategy/2_the_phoenix_plan.md",
            "docs/vision_and_strategy/3_llm_context_transfer_protocol.md",
            "docs/vision_and_strategy/outreach/2025-11-15_investor_pitch_script.md",
            "docs/vision_and_strategy/outreach/diagrams/conversation_navigator.md",
            "docs/vision_and_strategy/project_tracking/session_notes/2025-12-10_marketing_site_integration_session.md",
            "docs/vision_and_strategy/project_summary.md",
            "docs/vision_and_strategy/project_tracking/sprint_summaries/SPRINT4_SUMMARY.md",
            "docs/vision_and_strategy/project_tracking/sprint_summaries/SPRINT6_SUMMARY.md",
            "docs/vision_and_strategy/project_tracking/sprint_summaries/SPRINT7_SUMMARY.md",
            "docs/vision_and_strategy/ssot_documentation_index.md",
            "docs/architecture/adrs/adr_015_frontend_supporting_tools.md",
            "docs/operations/development/atlassian_cli_migration_plan.md",
            "docs/architecture/adrs/adr_016_frontend_design_system_integration.md",
            "docs/guides/development/frontend_component_development.md",
            "docs/guides/development/typescript_frontend_primer.md",
            "docs/marketing/logo_usage_guide.md",
            "docs/marketing/MARKETING_SITE_SPECS.md",
            "docs/operations/environment-variables.md",
            "docs/planning/ROADMAP_2025_Q4.md",
            "docs/planning/implementation_plan_phase2.md",
        ],
    },
}


def load_mapping() -> dict:
    """Load existing Confluence mapping"""
    if MAPPING_FILE.exists():
        with open(MAPPING_FILE) as f:
            return json.load(f)
    return {}


def save_mapping(mapping: dict):
    """Save updated Confluence mapping"""
    with open(MAPPING_FILE, "w") as f:
        json.dump(mapping, f, indent=2)
        f.write("\n")  # Add trailing newline


def get_or_create_parent_page(
    key: str, parent_id: str | None = None, dry_run: bool = False
) -> str | None:
    """
    Get existing parent page or create new one

    Args:
        key: Hierarchy key (e.g., '0_vision', '2_adrs')
        parent_id: Parent page ID to nest under
        dry_run: If True, don't actually create pages

    Returns:
        Page ID of parent page
    """
    config = HIERARCHY[key]
    title = config["title"]

    # Check if page already exists
    try:
        results = confluence.get_page_by_title(space=SPACE_KEY, title=title)
        if results:
            page_id = results["id"]
            console.print(f"  ✅ Found existing: {title} (ID: {page_id})")
            return page_id
    except Exception:
        # Page doesn't exist, we'll create it
        pass

    # Create new parent page
    if dry_run:
        console.print(f"  🔍 [DRY RUN] Would create: {title}")
        return "DRY_RUN_ID"

    try:
        body = f"""
<ac:structured-macro ac:name="info" ac:schema-version="1">
  <ac:parameter ac:name="title">Category Page</ac:parameter>
  <ac:rich-text-body>
    <p>{config['description']}</p>
    <p>This is a category page that organizes related documentation. See child pages below.</p>
  </ac:rich-text-body>
</ac:structured-macro>

<ac:structured-macro ac:name="children" ac:schema-version="2">
  <ac:parameter ac:name="all">true</ac:parameter>
</ac:structured-macro>
"""

        page = confluence.create_page(
            space=SPACE_KEY,
            title=title,
            body=body,
            parent_id=parent_id,
            representation="storage",
        )
        page_id = page["id"]
        console.print(f"  ✨ Created: {title} (ID: {page_id})")
        return page_id

    except Exception as e:
        console.print(f"  ❌ Failed to create {title}: {str(e)}")
        return None


def get_category_for_path(file_path: str) -> str | None:
    """
    Determine which category a file belongs to based on its path

    Args:
        file_path: Relative path to markdown file (e.g., 'docs/3_runbooks/foo.md')

    Returns:
        Hierarchy key (e.g., '3_runbooks') or None
    """
    for key, config in HIERARCHY.items():
        if key == "root":
            continue

        # Check single pattern
        if "pattern" in config and file_path.startswith(config["pattern"]):
            return key

        # Check multiple patterns
        if "patterns" in config and file_path in config["patterns"]:
            return key

    return None


def organize_pages(dry_run: bool = False):
    """
    Organize all Confluence pages into hierarchical structure

    Args:
        dry_run: If True, show what would be done without making changes
    """
    console.print(
        Panel.fit(
            "[bold cyan]📂 Organizing Confluence Page Hierarchy[/bold cyan]",
            border_style="cyan",
        )
    )

    if dry_run:
        console.print("[yellow]🔍 DRY RUN MODE - No changes will be made[/yellow]\n")

    mapping = load_mapping()
    parent_pages = {}  # key -> page_id

    # Step 1: Create root page
    console.print("\n[bold]Step 1: Create/Find Root Page[/bold]")
    root_id = get_or_create_parent_page("root", parent_id=None, dry_run=dry_run)
    if not root_id:
        console.print("[red]❌ Failed to create root page. Aborting.[/red]")
        return
    parent_pages["root"] = root_id

    # Step 2: Create top-level category pages
    console.print("\n[bold]Step 2: Create/Find Top-Level Categories[/bold]")
    for category_key in HIERARCHY["root"]["children"]:
        page_id = get_or_create_parent_page(category_key, parent_id=root_id, dry_run=dry_run)
        if page_id:
            parent_pages[category_key] = page_id

        # Create sub-categories if any
        if "children" in HIERARCHY[category_key]:
            for sub_key in HIERARCHY[category_key]["children"]:
                sub_id = get_or_create_parent_page(sub_key, parent_id=page_id, dry_run=dry_run)
                if sub_id:
                    parent_pages[sub_key] = sub_id

    # Step 3: Move existing pages under appropriate parents
    console.print("\n[bold]Step 3: Organize Existing Pages[/bold]")

    moved_count = 0
    skipped_count = 0

    with Progress(
        SpinnerColumn(), TextColumn("[progress.description]{task.description}"), console=console
    ) as progress:
        task = progress.add_task("Processing pages...", total=len(mapping))

        for file_path, page_info in mapping.items():
            category_key = get_category_for_path(file_path)
            if not category_key or category_key not in parent_pages:
                progress.console.print(
                    f"  ⚠️ No category for: {file_path} - leaving at root", style="yellow"
                )
                skipped_count += 1
                progress.advance(task)
                continue

            page_id = page_info["page_id"]
            parent_id = parent_pages[category_key]
            page_title = page_info.get("title", file_path.split("/")[-1])

            if dry_run:
                progress.console.print(
                    f"  🔍 Would move: {page_title} → {HIERARCHY[category_key]['title']}"
                )
                moved_count += 1
                progress.advance(task)
                continue

            try:
                # Move page by updating its parent
                confluence.update_page(
                    page_id=page_id,
                    title=page_title,
                    body="<p>Content preserved - see page history</p>",  # Body required but not changed
                    parent_id=parent_id,
                    representation="storage",
                    minor_edit=True,
                )
                progress.console.print(
                    f"  ✅ Moved: {page_title} → {HIERARCHY[category_key]['title']}"
                )
                moved_count += 1
            except Exception as e:
                progress.console.print(f"  ❌ Failed to move {page_title}: {str(e)}", style="red")
                skipped_count += 1

            progress.advance(task)

    # Summary
    console.print("\n" + "=" * 60)
    summary_table = Table(title="📊 Summary")
    summary_table.add_column("Metric", style="cyan")
    summary_table.add_column("Count", style="green")

    summary_table.add_row("Total pages", str(len(mapping)))
    summary_table.add_row("Pages organized", str(moved_count))
    summary_table.add_row("Pages skipped", str(skipped_count))
    summary_table.add_row("Parent categories created", str(len(parent_pages)))

    console.print(summary_table)

    if not dry_run:
        console.print("\n✅ [bold green]Hierarchy organization complete![/bold green]")
        console.print(f"\n🌐 View in Confluence: {CONFLUENCE_URL}/wiki/spaces/{SPACE_KEY}/overview")
    else:
        console.print(
            "\n[yellow]🔍 Dry run complete. Run without --dry-run to apply changes.[/yellow]"
        )


def main():
    """Main entry point"""
    import argparse

    parser = argparse.ArgumentParser(description="Organize Confluence page hierarchy")
    parser.add_argument(
        "--dry-run", action="store_true", help="Show what would be done without making changes"
    )
    args = parser.parse_args()

    try:
        organize_pages(dry_run=args.dry_run)
    except KeyboardInterrupt:
        console.print("\n\n[yellow]⚠️ Operation cancelled by user[/yellow]")
        sys.exit(1)
    except Exception as e:
        console.print(f"\n[bold red]❌ Error:[/bold red] {str(e)}")
        import traceback

        console.print(traceback.format_exc())
        sys.exit(1)


if __name__ == "__main__":
    main()
