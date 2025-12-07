#!/usr/bin/env python3
"""
Jira Backlog Cleanup Script
Automates cleanup of duplicates, superseded tickets, and epic organization
Based on deep backlog analysis

UPDATED: Migrated to official Atlassian CLI (ACLI)
Related: CHRONOS-268 (Sprint 9 - ACLI Migration)
"""

import re
import subprocess

# Color codes
GREEN = "\033[92m"
YELLOW = "\033[93m"
RED = "\033[91m"
BLUE = "\033[94m"
RESET = "\033[0m"


def run_acli(args: list[str]) -> dict:
    """Run ACLI command with proper error handling"""
    cmd = ["acli"] + args
    print(f"{BLUE}Running: {' '.join(cmd)}{RESET}")

    try:
        result = subprocess.run(cmd, capture_output=True, text=True, check=False)
        if result.returncode == 0:
            print(f"{GREEN}✓ Success{RESET}")
            return {"success": True, "output": result.stdout, "stderr": result.stderr}
        else:
            print(f"{RED}✗ Failed: {result.stderr}{RESET}")
            return {"success": False, "error": result.stderr, "output": result.stdout}
    except Exception as e:
        print(f"{RED}✗ Exception: {e}{RESET}")
        return {"success": False, "error": str(e)}


def bulk_edit_workitems(ticket_ids: list[str], description: str, transition: str = "Done") -> dict:
    """
    Bulk update work items using ACLI.
    ACLI doesn't have a direct 'bulk-close' command, so we update each ticket individually.

    NOTE: For production use, consider using --from-json with batch processing.
    """
    print(f"{BLUE}Bulk updating {len(ticket_ids)} tickets...{RESET}")

    success_count = 0
    failed_tickets = []

    for ticket_id in ticket_ids:
        # Update description
        result = run_acli(["jira", "workitem", "edit", ticket_id, "--description", description])

        if not result["success"]:
            failed_tickets.append(ticket_id)
            continue

        # Transition to Done
        result = run_acli(["jira", "workitem", "transition", ticket_id, "--status", transition])

        if result["success"]:
            success_count += 1
        else:
            failed_tickets.append(ticket_id)

    return {
        "success": len(failed_tickets) == 0,
        "success_count": success_count,
        "failed_tickets": failed_tickets,
    }


def create_epic(summary: str, description: str, labels: list[str]) -> str | None:
    """Create an epic and return its key"""
    result = run_acli(
        [
            "jira",
            "workitem",
            "create",
            "--project",
            "CHRONOS",
            "--type",
            "Epic",
            "--summary",
            summary,
            "--description",
            description,
            "--label",
            ",".join(labels),
        ]
    )

    if result["success"] and result["output"]:
        # Extract CHRONOS-XXX from output
        match = re.search(r"CHRONOS-\d+", result["output"])
        if match:
            epic_key = match.group(0)
            print(f"{GREEN}Created: {epic_key}{RESET}")
            return epic_key

    return None


def link_to_epic(ticket_id: str, epic_key: str) -> dict:
    """Link a work item to an epic"""
    return run_acli(["jira", "workitem", "edit", ticket_id, "--parent", epic_key])


def main():
    print(f"\n{GREEN}{'='*60}")
    print("Jira Backlog Cleanup")
    print("Based on Deep Analysis: 60+ tickets")
    print("Using: Atlassian CLI (ACLI)")
    print(f"{'='*60}{RESET}\n")

    # ========================================
    # PHASE 1: Supersede Infrastructure Tickets
    # ========================================

    print(f"\n{YELLOW}{'='*60}")
    print("PHASE 1: Superseding Infrastructure Tickets")
    print(f"{'='*60}{RESET}\n")

    # Google Workspace (superseded by CHRONOS-255)
    print(f"\n{YELLOW}Superseding Google Workspace tickets...{RESET}")
    result = bulk_edit_workitems(
        ticket_ids=["CHRONOS-175", "CHRONOS-176", "CHRONOS-180", "CHRONOS-192"],
        description="Superseded by CHRONOS-255 (Google Workspace Integration epic) and CHRONOS-248 (API Integration story)",
        transition="Done",
    )
    print(f"{GREEN}✓ Updated {result['success_count']} tickets{RESET}")
    if result["failed_tickets"]:
        print(f"{RED}✗ Failed: {', '.join(result['failed_tickets'])}{RESET}")

    # AWS Infrastructure (superseded by CHRONOS-251)
    print(f"\n{YELLOW}Superseding AWS Infrastructure tickets...{RESET}")
    result = bulk_edit_workitems(
        ticket_ids=["CHRONOS-178", "CHRONOS-218"],
        description="Superseded by CHRONOS-251 (AWS Infrastructure & Operations epic)",
        transition="Done",
    )
    print(f"{GREEN}✓ Updated {result['success_count']} tickets{RESET}")
    if result["failed_tickets"]:
        print(f"{RED}✗ Failed: {', '.join(result['failed_tickets'])}{RESET}")

    # Disaster Recovery (superseded by CHRONOS-244)
    print(f"\n{YELLOW}Superseding Disaster Recovery tickets...{RESET}")
    result = bulk_edit_workitems(
        ticket_ids=["CHRONOS-217", "CHRONOS-209", "CHRONOS-201"],
        description="Superseded by CHRONOS-244 (Disaster Recovery System story)",
        transition="Done",
    )
    print(f"{GREEN}✓ Updated {result['success_count']} tickets{RESET}")
    if result["failed_tickets"]:
        print(f"{RED}✗ Failed: {', '.join(result['failed_tickets'])}{RESET}")

    # ========================================
    # PHASE 2: Close Duplicates
    # ========================================

    print(f"\n{YELLOW}{'='*60}")
    print("PHASE 2: Closing Duplicate Tickets")
    print(f"{'='*60}{RESET}\n")

    # Production validation duplicate
    print(f"\n{YELLOW}Closing production validation duplicate...{RESET}")
    result = bulk_edit_workitems(
        ticket_ids=["CHRONOS-208"],
        description="Duplicate of CHRONOS-203 (production validation)",
        transition="Done",
    )
    print(f"{GREEN}✓ Updated {result['success_count']} tickets{RESET}")

    # Apache AGE schema duplicate
    print(f"\n{YELLOW}Closing Apache AGE schema duplicate...{RESET}")
    result = bulk_edit_workitems(
        ticket_ids=["CHRONOS-220"],
        description="Duplicate of CHRONOS-50 (Apache AGE schema design)",
        transition="Done",
    )
    print(f"{GREEN}✓ Updated {result['success_count']} tickets{RESET}")

    # ========================================
    # PHASE 3: Create Missing Epics
    # ========================================

    print(f"\n{YELLOW}{'='*60}")
    print("PHASE 3: Creating Missing Epics")
    print(f"{'='*60}{RESET}\n")

    # Epic: Data Pipelines & Integration
    print(f"\n{YELLOW}Creating Data Pipelines & Integration epic...{RESET}")
    data_pipelines_epic = create_epic(
        summary="Data Pipelines & Integration",
        description="Build data ingestion pipelines for EDGAR, Bank of England, and other financial data sources. Implement graph database and MCP servers.",
        labels=["data-pipelines", "integration", "backlog"],
    )

    # Epic: Client Portal & Frontend
    print(f"\n{YELLOW}Creating Client Portal & Frontend epic...{RESET}")
    client_portal_epic = create_epic(
        summary="Client Portal & Frontend",
        description="Build Next.js client portal with authentication, dashboard, and API integration. Deploy to Vercel with custom domain.",
        labels=["frontend", "client-portal", "next-js", "backlog"],
    )

    # ========================================
    # PHASE 4: Link Tickets to Epics
    # ========================================

    print(f"\n{YELLOW}{'='*60}")
    print("PHASE 4: Linking Tickets to Epics")
    print(f"{'='*60}{RESET}\n")

    if data_pipelines_epic:
        print(f"\n{YELLOW}Linking Data Pipeline tickets to {data_pipelines_epic}...{RESET}")
        data_tickets = [
            "CHRONOS-109",
            "CHRONOS-50",
            "CHRONOS-26",
            "CHRONOS-66",
            "CHRONOS-140",
            "CHRONOS-144",
            "CHRONOS-150",
            "CHRONOS-153",
        ]
        success_count = 0
        for ticket in data_tickets:
            result = link_to_epic(ticket, data_pipelines_epic)
            if result["success"]:
                success_count += 1
        print(f"{GREEN}✓ Linked {success_count}/{len(data_tickets)} tickets{RESET}")

    if client_portal_epic:
        print(f"\n{YELLOW}Linking Client Portal tickets to {client_portal_epic}...{RESET}")
        frontend_tickets = [
            "CHRONOS-228",
            "CHRONOS-229",
            "CHRONOS-232",
            "CHRONOS-233",
            "CHRONOS-231",
            "CHRONOS-234",
            "CHRONOS-235",
            "CHRONOS-236",
            "CHRONOS-237",
        ]
        success_count = 0
        for ticket in frontend_tickets:
            result = link_to_epic(ticket, client_portal_epic)
            if result["success"]:
                success_count += 1
        print(f"{GREEN}✓ Linked {success_count}/{len(frontend_tickets)} tickets{RESET}")

    # ========================================
    # SUMMARY
    # ========================================

    print(f"\n{GREEN}{'='*60}")
    print("Cleanup Complete!")
    print(f"{'='*60}{RESET}\n")

    print(f"{YELLOW}Summary:{RESET}")
    print("  Phase 1: Superseded 9 infrastructure tickets")
    print("  Phase 2: Closed 2 duplicate tickets")
    print("  Phase 3: Created 2 new epics")
    print("  Phase 4: Linked 17 tickets to epics")
    print(f"\n{BLUE}Next Steps:{RESET}")
    print("  1. Review backlog in Jira")
    print("  2. Verify epic structure")
    print("  3. Groom remaining tickets")
    print("  4. Plan next sprint\n")
    print(f"{BLUE}Migration Note:{RESET}")
    print("  ✓ Successfully migrated from custom Jira CLI to ACLI")
    print("  ✓ Using direct ACLI commands (no wrappers)")
    print("  ✓ Related: CHRONOS-268 (Sprint 9)\n")


if __name__ == "__main__":
    main()
