#!/usr/bin/env python3
"""
Close Jira Ticket with Resolution
Closes a Jira ticket with proper resolution field (Done/Cancelled/Superseded).
Uses hybrid ACLI + REST API approach since ACLI doesn't support resolution field.

Usage:
    python3 scripts/ops/jira_close_ticket.py CHRONOS-XXX Done
    python3 scripts/ops/jira_close_ticket.py CHRONOS-XXX Superseded "Replaced by CHRONOS-YYY"
    python3 scripts/ops/jira_close_ticket.py CHRONOS-XXX Cancelled "No longer needed"
"""

import os
import subprocess
import sys
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

# Color codes
GREEN = "\033[92m"
YELLOW = "\033[93m"
RED = "\033[91m"
BLUE = "\033[94m"
RESET = "\033[0m"

VALID_RESOLUTIONS = ["Done", "Cancelled", "Superseded"]


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


def set_resolution(ticket_id: str, resolution: str) -> bool:
    """Set resolution via REST API"""
    url = f"{JIRA_URL}/rest/api/3/issue/{ticket_id}"
    payload = {"fields": {"resolution": {"name": resolution}}}

    response = requests.put(url, json=payload, auth=AUTH, headers=HEADERS)
    return response.status_code == 204


def close_ticket(ticket_id: str, resolution: str, comment: str = None) -> None:
    """Close ticket with resolution and optional comment"""
    print(f"\n{BLUE}{'='*60}")
    print(f"Closing Ticket: {ticket_id}")
    print(f"Resolution: {resolution}")
    print(f"{'='*60}{RESET}\n")

    # Validate resolution
    if resolution not in VALID_RESOLUTIONS:
        print(f"{RED}✗ Invalid resolution: {resolution}{RESET}")
        print(f"{YELLOW}Valid resolutions: {', '.join(VALID_RESOLUTIONS)}{RESET}")
        sys.exit(1)

    # 1. Add comment if provided
    if comment:
        print(f"{BLUE}→ Adding comment...{RESET}")
        result = run_acli(["jira", "workitem", "comment", "--key", ticket_id, "--body", comment])
        if result["success"]:
            print(f"{GREEN}✓ Comment added{RESET}")
        else:
            print(f"{YELLOW}⚠ Comment failed{RESET}")

    # 2. Transition to "In Progress" first (may be needed for workflow)
    print(f"{BLUE}→ Transitioning to In Progress...{RESET}")
    run_acli(["jira", "workitem", "transition", "--key", ticket_id, "--status", "In Progress"])

    # 3. Transition to "Done"
    print(f"{BLUE}→ Transitioning to Done...{RESET}")
    result = run_acli(["jira", "workitem", "transition", "--key", ticket_id, "--status", "Done"])
    if result["success"]:
        print(f"{GREEN}✓ Transitioned to Done{RESET}")
    else:
        print(f"{RED}✗ Transition failed{RESET}")
        sys.exit(1)

    # 4. Set resolution via REST API
    print(f"{BLUE}→ Setting resolution to '{resolution}'...{RESET}")
    if set_resolution(ticket_id, resolution):
        print(f"{GREEN}✓ Resolution set to {resolution}{RESET}")
    else:
        print(f"{RED}✗ Failed to set resolution{RESET}")
        sys.exit(1)

    print(f"\n{GREEN}✓ Successfully closed {ticket_id} with resolution: {resolution}{RESET}\n")


def main():
    """Main execution function"""
    if len(sys.argv) < 3:
        print(f"{YELLOW}Usage:{RESET}")
        print(f"  python3 {sys.argv[0]} TICKET_ID RESOLUTION [COMMENT]")
        print(f"\n{YELLOW}Examples:{RESET}")
        print(f"  python3 {sys.argv[0]} CHRONOS-123 Done")
        print(f'  python3 {sys.argv[0]} CHRONOS-456 Superseded "Replaced by CHRONOS-789"')
        print(f'  python3 {sys.argv[0]} CHRONOS-999 Cancelled "No longer needed"')
        print(f"\n{YELLOW}Valid Resolutions:{RESET}")
        for res in VALID_RESOLUTIONS:
            print(f"  - {res}")
        sys.exit(1)

    ticket_id = sys.argv[1]
    resolution = sys.argv[2]
    comment = sys.argv[3] if len(sys.argv) > 3 else None

    close_ticket(ticket_id, resolution, comment)


if __name__ == "__main__":
    main()
