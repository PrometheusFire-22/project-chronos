#!/usr/bin/env python3
"""
Master Retroactive Update Script
1. Assigns Sprint 6 tickets (195-201) to Sprint ID 237.
2. Updates Sprint 7 tickets (176, 202-205, 216) with forensic data and assigns to Sprint ID 238.

UPDATED: Migrated to official Atlassian CLI (ACLI) where possible
Related: CHRONOS-268 (Sprint 9 - ACLI Migration)

NOTE: This script uses REST API for sprint assignment (customfield_10020) as ACLI
doesn't directly support sprint field manipulation. ACLI is used for labels,
comments, and transitions.
"""

import os
import subprocess
import sys
import time
from pathlib import Path

import requests
from dotenv import load_dotenv

# Load environment
env_path = Path(__file__).resolve().parent.parent.parent / ".env"
load_dotenv(env_path)

JIRA_URL = os.getenv("JIRA_URL")
JIRA_EMAIL = os.getenv("JIRA_EMAIL")
JIRA_API_TOKEN = os.getenv("JIRA_API_TOKEN")

if not all([JIRA_URL, JIRA_EMAIL, JIRA_API_TOKEN]):
    print("❌ Missing Jira credentials in .env")
    sys.exit(1)

AUTH = (JIRA_EMAIL, JIRA_API_TOKEN)
HEADERS = {"Content-Type": "application/json"}

# Color codes for output
GREEN = "\033[92m"
YELLOW = "\033[93m"
RED = "\033[91m"
BLUE = "\033[94m"
RESET = "\033[0m"


def run_acli(args: list[str]) -> dict:
    """Run ACLI command with proper error handling"""
    cmd = ["acli"] + args
    try:
        result = subprocess.run(cmd, capture_output=True, text=True, check=False)
        if result.returncode == 0:
            return {"success": True, "output": result.stdout, "stderr": result.stderr}
        else:
            return {"success": False, "error": result.stderr, "output": result.stdout}
    except Exception as e:
        return {"success": False, "error": str(e)}


# Sprint 6: Assign to Sprint 237 (already status=Done)
SPRINT_6_ID = 237
SPRINT_6_TICKETS = [
    "CHRONOS-195",
    "CHRONOS-196",
    "CHRONOS-197",
    "CHRONOS-198",
    "CHRONOS-199",
    "CHRONOS-200",
    "CHRONOS-201",
]

# Sprint 7: Assign to Sprint 238, Status -> Done, Labels, Comments
SPRINT_7_ID = 238
SPRINT_7_UPDATES = {
    "CHRONOS-176": {
        "comment": "Forensic Analysis: AWS CLI setup confirmed via Commit 1bd2e46d (Nov 27). Status: Done.",
        "labels": ["sprint-7", "retroactive-forensic", "aws"],
    },
    "CHRONOS-202": {
        "comment": "Forensic Analysis: S3 Bucket setup completed as prereq for pgBackRest (Commit 7bb6da28, Nov 27). Status: Done.",
        "labels": ["sprint-7", "retroactive-forensic", "aws"],
    },
    "CHRONOS-203": {
        "comment": "Forensic Analysis: pgBackRest configuration deployed and validated (Commit 7bb6da28, Nov 27). Status: Done.",
        "labels": ["sprint-7", "retroactive-forensic", "backup"],
    },
    "CHRONOS-204": {
        "comment": "Forensic Analysis: Lightsail instance provisioning confirmed (Commit 7eef1151, Nov 27). Status: Done.",
        "labels": ["sprint-7", "retroactive-forensic", "aws"],
    },
    "CHRONOS-205": {
        "comment": "Forensic Analysis: PostgreSQL installation and configuration confirmed (Commit 7eef1151, Nov 27). Status: Done.",
        "labels": ["sprint-7", "retroactive-forensic", "db"],
    },
    "CHRONOS-216": {
        "comment": "Forensic Analysis: Security Hardening (Security Groups) finalized via Commit 6fd9a514 (Dec 2). Status: Done.",
        "labels": ["sprint-7", "retroactive-forensic", "security"],
    },
}


def get_transition_id(ticket_id, status_name):
    url = f"{JIRA_URL}/rest/api/3/issue/{ticket_id}/transitions"
    r = requests.get(url, auth=AUTH, headers=HEADERS)
    if r.status_code != 200:
        return None
    transitions = r.json().get("transitions", [])
    for t in transitions:
        if t["name"].lower() == status_name.lower():
            return t["id"]
    return None


def assign_sprint(ticket_id, sprint_id):
    print(f"  → Assigning to Sprint {sprint_id}...")
    url = f"{JIRA_URL}/rest/api/3/issue/{ticket_id}"
    payload = {"fields": {"customfield_10020": sprint_id}}  # 10020 is standard sprint field ID
    r = requests.put(url, json=payload, auth=AUTH, headers=HEADERS)
    if r.status_code == 204:
        print("  ✅ Sprint assigned")
    else:
        print(f"  ❌ Sprint assignment failed: {r.text}")


def update_ticket(ticket_id, data, sprint_id):
    print(f"\n{YELLOW}Processing {ticket_id}...{RESET}")

    # 1. Labels - Use ACLI
    print(f"  {BLUE}→ Updating labels...{RESET}")
    result = run_acli(
        ["jira", "workitem", "edit", "--key", ticket_id, "--label", ",".join(data["labels"])]
    )
    if result["success"]:
        print(f"  {GREEN}✅ Labels updated{RESET}")
    else:
        print(f"  {RED}⚠ Label update failed{RESET}")

    # 2. Sprint - Keep REST API (ACLI doesn't support sprint field directly)
    assign_sprint(ticket_id, sprint_id)

    # 3. Comment - Use ACLI
    print(f"  {BLUE}→ Adding forensic comment...{RESET}")
    result = run_acli(
        ["jira", "workitem", "comment", "--key", ticket_id, "--body", data["comment"]]
    )
    if result["success"]:
        print(f"  {GREEN}✅ Comment added{RESET}")
    else:
        print(f"  {RED}⚠ Comment failed{RESET}")

    # 4. Transition to Done - Use ACLI
    print(f"  {BLUE}→ Transitioning to In Progress...{RESET}")
    run_acli(["jira", "workitem", "transition", "--key", ticket_id, "--status", "In Progress"])

    print(f"  {BLUE}→ Transitioning to Done...{RESET}")
    result = run_acli(["jira", "workitem", "transition", "--key", ticket_id, "--status", "Done"])
    if result["success"]:
        print(f"  {GREEN}✅ Transitioned to Done{RESET}")
    else:
        print(f"  {RED}⚠ Transition failed{RESET}")


def main():
    print(f"\n{GREEN}{'='*60}")
    print("Retroactive Jira Updates")
    print("Sprint 6 & 7 Assignments and Forensic Data")
    print("Using: Atlassian CLI (ACLI)")
    print(f"{'='*60}{RESET}\n")

    # Process Sprint 6 (Just assign Sprint)
    print(f"\n{YELLOW}{'='*60}")
    print(f"Sprint 6: Assigning Tickets (Sprint ID: {SPRINT_6_ID})")
    print(f"{'='*60}{RESET}")
    for ticket in SPRINT_6_TICKETS:
        print(f"{YELLOW}Processing {ticket}...{RESET}")
        assign_sprint(ticket, SPRINT_6_ID)
        time.sleep(0.5)

    # Process Sprint 7 (Full Update)
    print(f"\n{YELLOW}{'='*60}")
    print(f"Sprint 7: Full Updates (Sprint ID: {SPRINT_7_ID})")
    print(f"{'='*60}{RESET}")
    for ticket, data in SPRINT_7_UPDATES.items():
        update_ticket(ticket, data, SPRINT_7_ID)
        time.sleep(0.5)

    print(f"\n{GREEN}{'='*60}")
    print("All Updates Complete!")
    print(f"{'='*60}{RESET}\n")

    print(f"{BLUE}Migration Note:{RESET}")
    print("  ✓ Successfully migrated labels, comments, transitions to ACLI")
    print("  ✓ Sprint assignment uses REST API (ACLI doesn't support sprint field)")
    print("  ✓ Related: CHRONOS-268 (Sprint 9)\n")


if __name__ == "__main__":
    main()
