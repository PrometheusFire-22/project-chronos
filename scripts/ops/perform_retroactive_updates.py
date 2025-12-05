#!/usr/bin/env python3
"""
Master Retroactive Update Script
1. Assigns Sprint 6 tickets (195-201) to Sprint ID 237.
2. Updates Sprint 7 tickets (176, 202-205, 216) with forensic data and assigns to Sprint ID 238.
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
    print(f"\nProcessing {ticket_id}...")

    # 1. Labels
    print("  → Updating labels...")
    url = f"{JIRA_URL}/rest/api/3/issue/{ticket_id}"
    payload = {"fields": {"labels": data["labels"]}}
    requests.put(url, json=payload, auth=AUTH, headers=HEADERS)

    # 2. Sprint
    assign_sprint(ticket_id, sprint_id)

    # 3. Comment
    print("  → Adding forensic comment...")
    url = f"{JIRA_URL}/rest/api/3/issue/{ticket_id}/comment"
    comment_body = {
        "type": "doc",
        "version": 1,
        "content": [{"type": "paragraph", "content": [{"type": "text", "text": data["comment"]}]}],
    }
    r = requests.post(url, json={"body": comment_body}, auth=AUTH, headers=HEADERS)
    if r.status_code != 201:
        print(f"  ⚠ Comment failed: {r.text}")

    # 4. Success Status
    for status in ["In Progress", "Done"]:
        trans_id = get_transition_id(ticket_id, status)
        if trans_id:
            url = f"{JIRA_URL}/rest/api/3/issue/{ticket_id}/transitions"
            requests.post(url, json={"transition": {"id": trans_id}}, auth=AUTH, headers=HEADERS)
            print(f"  ✅ Transitioned to {status}")


def main():
    print("=== Starting Retroactive Updates ===")

    # Process Sprint 6 (Just assign Sprint)
    print(f"\n--- Assigning Sprint 6 Tickets (Sprint ID: {SPRINT_6_ID}) ---")
    for ticket in SPRINT_6_TICKETS:
        print(f"Processing {ticket}...")
        assign_sprint(ticket, SPRINT_6_ID)
        time.sleep(0.5)

    # Process Sprint 7 (Full Update)
    print(f"\n--- Updating Sprint 7 Tickets (Sprint ID: {SPRINT_7_ID}) ---")
    for ticket, data in SPRINT_7_UPDATES.items():
        update_ticket(ticket, data, SPRINT_7_ID)
        time.sleep(0.5)

    print("\n✅ All updates complete.")


if __name__ == "__main__":
    main()
