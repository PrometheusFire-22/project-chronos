#!/usr/bin/env python3
"""
Jira Backlog Cleanup Script
Automates cleanup of duplicates, superseded tickets, and epic organization
Based on deep backlog analysis
"""

import subprocess

# Color codes
GREEN = "\033[92m"
YELLOW = "\033[93m"
RED = "\033[91m"
BLUE = "\033[94m"
RESET = "\033[0m"


def run_jira(args: list[str]) -> dict:
    """Run jira CLI command"""
    cmd = ["jira"] + args
    print(f"{BLUE}Running: {' '.join(cmd)}{RESET}")

    try:
        result = subprocess.run(cmd, capture_output=True, text=True, check=False)
        if result.returncode == 0:
            print(f"{GREEN}✓ Success{RESET}")
            return {"success": True, "output": result.stdout}
        else:
            print(f"{RED}✗ Failed: {result.stderr}{RESET}")
            return {"success": False, "error": result.stderr}
    except Exception as e:
        print(f"{RED}✗ Exception: {e}{RESET}")
        return {"success": False, "error": str(e)}


def main():
    print(f"\n{GREEN}{'='*60}")
    print("Jira Backlog Cleanup")
    print("Based on Deep Analysis: 60+ tickets")
    print(f"{'='*60}{RESET}\n")

    # ========================================
    # PHASE 1: Supersede Infrastructure Tickets
    # ========================================

    print(f"\n{YELLOW}{'='*60}")
    print("PHASE 1: Superseding Infrastructure Tickets")
    print(f"{'='*60}{RESET}\n")

    # Google Workspace (superseded by CHRONOS-255)
    print(f"\n{YELLOW}Superseding Google Workspace tickets...{RESET}")
    run_jira(
        [
            "bulk-close",
            "CHRONOS-175,CHRONOS-176,CHRONOS-180,CHRONOS-192",
            "--reason",
            "Superseded by CHRONOS-255 (Google Workspace Integration epic) and CHRONOS-248 (API Integration story)",
            "--status",
            "Done",
        ]
    )

    # AWS Infrastructure (superseded by CHRONOS-251)
    print(f"\n{YELLOW}Superseding AWS Infrastructure tickets...{RESET}")
    run_jira(
        [
            "bulk-close",
            "CHRONOS-178,CHRONOS-218",
            "--reason",
            "Superseded by CHRONOS-251 (AWS Infrastructure & Operations epic)",
            "--status",
            "Done",
        ]
    )

    # Disaster Recovery (superseded by CHRONOS-244)
    print(f"\n{YELLOW}Superseding Disaster Recovery tickets...{RESET}")
    run_jira(
        [
            "bulk-close",
            "CHRONOS-217,CHRONOS-209,CHRONOS-201",
            "--reason",
            "Superseded by CHRONOS-244 (Disaster Recovery System story)",
            "--status",
            "Done",
        ]
    )

    # ========================================
    # PHASE 2: Close Duplicates
    # ========================================

    print(f"\n{YELLOW}{'='*60}")
    print("PHASE 2: Closing Duplicate Tickets")
    print(f"{'='*60}{RESET}\n")

    # Production validation duplicate
    print(f"\n{YELLOW}Closing production validation duplicate...{RESET}")
    run_jira(
        [
            "bulk-close",
            "CHRONOS-208",
            "--reason",
            "Duplicate of CHRONOS-203 (production validation)",
            "--status",
            "Done",
        ]
    )

    # Apache AGE schema duplicate
    print(f"\n{YELLOW}Closing Apache AGE schema duplicate...{RESET}")
    run_jira(
        [
            "bulk-close",
            "CHRONOS-220",
            "--reason",
            "Duplicate of CHRONOS-50 (Apache AGE schema design)",
            "--status",
            "Done",
        ]
    )

    # ========================================
    # PHASE 3: Create Missing Epics
    # ========================================

    print(f"\n{YELLOW}{'='*60}")
    print("PHASE 3: Creating Missing Epics")
    print(f"{'='*60}{RESET}\n")

    # Epic: Data Pipelines & Integration
    print(f"\n{YELLOW}Creating Data Pipelines & Integration epic...{RESET}")
    result = run_jira(
        [
            "create",
            "--summary",
            "Data Pipelines & Integration",
            "--description",
            "Build data ingestion pipelines for EDGAR, Bank of England, and other financial data sources. Implement graph database and MCP servers.",
            "--type",
            "Epic",
            "--labels",
            "data-pipelines,integration,backlog",
        ]
    )

    data_pipelines_epic = None
    if result["success"] and "CHRONOS-" in result["output"]:
        data_pipelines_epic = result["output"].split("CHRONOS-")[1].split()[0]
        data_pipelines_epic = f"CHRONOS-{data_pipelines_epic}"
        print(f"{GREEN}Created: {data_pipelines_epic}{RESET}")

    # Epic: Client Portal & Frontend
    print(f"\n{YELLOW}Creating Client Portal & Frontend epic...{RESET}")
    result = run_jira(
        [
            "create",
            "--summary",
            "Client Portal & Frontend",
            "--description",
            "Build Next.js client portal with authentication, dashboard, and API integration. Deploy to Vercel with custom domain.",
            "--type",
            "Epic",
            "--labels",
            "frontend,client-portal,next-js,backlog",
        ]
    )

    client_portal_epic = None
    if result["success"] and "CHRONOS-" in result["output"]:
        client_portal_epic = result["output"].split("CHRONOS-")[1].split()[0]
        client_portal_epic = f"CHRONOS-{client_portal_epic}"
        print(f"{GREEN}Created: {client_portal_epic}{RESET}")

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
        for ticket in data_tickets:
            run_jira(["update", ticket, "--epic", data_pipelines_epic])

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
        for ticket in frontend_tickets:
            run_jira(["update", ticket, "--epic", client_portal_epic])

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


if __name__ == "__main__":
    main()
