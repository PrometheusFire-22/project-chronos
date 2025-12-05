#!/usr/bin/env python3
"""
Sprint 6 Retroactive Update Script (Direct API Version)
Based on forensic analysis of git logs from Nov 24-28, 2024.
"""

import os
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

# Ticket Updates Mapping
UPDATES = {
    "CHRONOS-195": {
        "summary": "Research pgBackRest + S3",
        "comment": "Forensic Analysis: Research completed alongside foundation work (Nov 25-26). Status: Done.",
        "labels": ["sprint-6", "retroactive-forensic", "infrastructure"],
    },
    "CHRONOS-196": {
        "summary": "Implement documentation SSOT strategy",
        "comment": "Forensic Analysis: Implementation confirmed via Git logs on Nov 25-26 (Commits d95ed129, ec059417). Status: Done.",
        "labels": ["sprint-6", "retroactive-forensic", "documentation"],
    },
    "CHRONOS-197": {
        "summary": "Load all time-series data",
        "comment": "Forensic Analysis: Implementation confirmed via Git logs on Nov 25-26 (Commits 44841ea9, 82cb9ce7). Status: Done.",
        "labels": ["sprint-6", "retroactive-forensic", "data"],
    },
    "CHRONOS-198": {
        "summary": "Load TIGER/StatsCan shapefiles",
        "comment": "Forensic Analysis: Implementation confirmed via Git logs on Nov 26 (Commits 055b8062, 52b5d1bc). Status: Done.",
        "labels": ["sprint-6", "retroactive-forensic", "geospatial"],
    },
    "CHRONOS-199": {
        "summary": "Clean invalid FRED series",
        "comment": "Forensic Analysis: Completed alongside time-series catalog expansion and validation (linked to Commit 82cb9ce7) on Nov 26. Status: Done.",
        "labels": ["sprint-6", "retroactive-forensic", "data"],
    },
    "CHRONOS-200": {
        "summary": "Implement local pgBackRest backups",
        "comment": "Forensic Analysis: Confirmed as completed foundation for broader backup system on Nov 26-27 (linked to Commit 7bb6da28). Status: Done.",
        "labels": ["sprint-6", "retroactive-forensic", "backup"],
    },
    "CHRONOS-201": {
        "summary": "Validate PITR recovery",
        "comment": "Forensic Analysis: Validation performed as part of the complete backup system delivery on Nov 27. Status: Done.",
        "labels": ["sprint-6", "retroactive-forensic", "testing"],
    },
}


def get_transition_id(ticket_id, status_name):
    """Get transition ID for a status name"""
    url = f"{JIRA_URL}/rest/api/3/issue/{ticket_id}/transitions"
    r = requests.get(url, auth=AUTH, headers=HEADERS)
    if r.status_code != 200:
        print(f"  ❌ Failed to get transitions: {r.text}")
        return None

    transitions = r.json().get("transitions", [])
    for t in transitions:
        if t["name"].lower() == status_name.lower():
            return t["id"]
    return None


def update_ticket(ticket_id, data):
    print(f"\nProcessing {ticket_id}...")

    # 1. Add Labels
    print("  → Updating labels...")
    url = f"{JIRA_URL}/rest/api/3/issue/{ticket_id}"
    payload = {"fields": {"labels": data["labels"]}}
    r = requests.put(url, json=payload, auth=AUTH, headers=HEADERS)
    if r.status_code == 204:
        print("  ✅ Labels updated")
    else:
        print(f"  ❌ Label update failed: {r.text}")

    # 2. Add Comment
    print("  → Adding forensic comment...")
    url = f"{JIRA_URL}/rest/api/3/issue/{ticket_id}/comment"
    # Jira doc format for rich text field
    comment_body = {
        "type": "doc",
        "version": 1,
        "content": [{"type": "paragraph", "content": [{"type": "text", "text": data["comment"]}]}],
    }
    payload = {"body": comment_body}
    r = requests.post(url, json=payload, auth=AUTH, headers=HEADERS)
    if r.status_code == 201:
        print("  ✅ Comment added")
    else:
        print(f"  ❌ Comment failed: {r.text}")

    # 3. Transition to Done
    # We try transition to "In Progress" then "Done" to respect workflow
    for status in ["In Progress", "Done"]:
        print(f"  → Transitioning to '{status}'...")
        trans_id = get_transition_id(ticket_id, status)
        if trans_id:
            url = f"{JIRA_URL}/rest/api/3/issue/{ticket_id}/transitions"
            payload = {"transition": {"id": trans_id}}
            r = requests.post(url, json=payload, auth=AUTH, headers=HEADERS)
            if r.status_code == 204:
                print(f"  ✅ Transitioned to {status}")
            else:
                print(f"  ❌ Transition to {status} failed: {r.text}")
        else:
            print(f"  ⚠ Transition to '{status}' not available (already in that status?)")


def main():
    print("Starting Sprint 6 Retroactive Updates (API)...")
    for ticket_id, data in UPDATES.items():
        update_ticket(ticket_id, data)
        time.sleep(1)
    print("\nAll updates complete.")


if __name__ == "__main__":
    main()
