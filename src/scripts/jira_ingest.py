#!/usr/bin/env python3
"""
Project Chronos: Jira Ticket Ingestion Script
==============================================
Reads master_automation_catalog.csv and creates Jira tickets automatically
Pattern: Same as FRED ingestion - configuration over code
"""
import csv
import os
import sys
from pathlib import Path

import requests
from dotenv import load_dotenv

# Load environment
env_path = Path(__file__).parent.parent.parent / ".env"
load_dotenv(env_path)

# Jira configuration
JIRA_URL = os.getenv("JIRA_URL")
JIRA_EMAIL = os.getenv("JIRA_EMAIL")
JIRA_API_TOKEN = os.getenv("JIRA_API_TOKEN")
JIRA_PROJECT_KEY = os.getenv("JIRA_PROJECT_KEY", "CHRONOS")

# Verify credentials
if not all([JIRA_URL, JIRA_EMAIL, JIRA_API_TOKEN]):
    print("❌ ERROR: Jira credentials not found in .env file")
    sys.exit(1)

print(f"🔧 Loaded Jira config: {JIRA_URL}")
print(f"✅ Project: {JIRA_PROJECT_KEY}\n")


def load_catalog(catalog_path: Path):
    """Load Jira tickets catalog"""
    pending_tickets = []

    with open(catalog_path) as f:
        reader = csv.DictReader(f)
        for row in reader:
            # Only process tickets with Pending status
            if row.get("status") == "Pending":
                pending_tickets.append(row)

    return pending_tickets


def create_jira_ticket(ticket_data):
    """Create a Jira ticket via REST API"""

    # Map priority to Jira values
    priority_map = {"Highest": "1", "High": "2", "Medium": "3", "Low": "4", "Lowest": "5"}

    # Get issue type from CSV or infer from summary
    issue_type = ticket_data.get("issue_type", "Story")

    # Build issue payload
    issue_payload = {
        "fields": {
            "project": {"key": JIRA_PROJECT_KEY},
            "summary": ticket_data["summary"],
            "description": {
                "type": "doc",
                "version": 1,
                "content": [
                    {
                        "type": "paragraph",
                        "content": [{"type": "text", "text": ticket_data["description"]}],
                    }
                ],
            },
            "issuetype": {"name": issue_type},
            "priority": {"id": priority_map.get(ticket_data.get("priority", "Medium"), "3")},
        }
    }

    # Add labels if present
    if ticket_data.get("labels"):
        issue_payload["fields"]["labels"] = ticket_data["labels"].split(",")

    # Add story points if present (custom field)
    if ticket_data.get("story_points"):
        # Note: Field ID varies by Jira instance - might need to adjust
        issue_payload["fields"]["customfield_10016"] = int(ticket_data["story_points"])

    # Add epic link if present
    if ticket_data.get("epic_link"):
        issue_payload["fields"]["customfield_10014"] = ticket_data["epic_link"]

    # Create ticket
    response = requests.post(
        f"{JIRA_URL}/rest/api/3/issue",
        auth=(JIRA_EMAIL, JIRA_API_TOKEN),
        headers={"Content-Type": "application/json"},
        json=issue_payload,
        timeout=30,
    )

    response.raise_for_status()
    return response.json()


def main():
    """Main ingestion orchestrator"""
    print("\n" + "=" * 60)
    print("🚀 Project Chronos: Jira Ticket Ingestion")
    print("=" * 60 + "\n")

    # Locate catalog
    catalog_path = (
        Path(__file__).parent.parent.parent / "database" / "seeds" / "jira_tickets_catalog.csv"
    )

    if not catalog_path.exists():
        print(f"❌ Catalog not found: {catalog_path}")
        sys.exit(1)

    print(f"📊 Loading catalog: {catalog_path}")
    pending_tickets = load_catalog(catalog_path)

    if not pending_tickets:
        print("✅ No pending Jira tickets found in catalog")
        sys.exit(0)

    print(f"✅ Found {len(pending_tickets)} pending Jira tickets\n")

    # Process each ticket
    created = 0
    failed = []

    for i, ticket in enumerate(pending_tickets, 1):
        ticket_id = ticket["ticket_id"]
        summary = ticket["summary"]

        print(f"[{i}/{len(pending_tickets)}] Creating: {ticket_id}")
        print(f"    Summary: {summary}")

        try:
            result = create_jira_ticket(ticket)
            jira_key = result["key"]
            jira_url = f"{JIRA_URL}/browse/{jira_key}"

            print(f"    ✅ Created: {jira_key}")
            print(f"    🔗 {jira_url}")

            created += 1

        except requests.exceptions.HTTPError as e:
            error_msg = e.response.text if hasattr(e, "response") else str(e)
            print(f"    ❌ Error: {error_msg[:100]}")
            failed.append((ticket_id, error_msg))
        except Exception as e:
            print(f"    ❌ Error: {str(e)}")
            failed.append((ticket_id, str(e)))

        print()

    # Summary
    print("=" * 60)
    print("✅ INGESTION COMPLETE!")
    print("=" * 60)
    print("\n📊 Summary:")
    print(f"  Total tickets processed: {len(pending_tickets)}")
    print(f"  Successfully created: {created}")
    print(f"  Failed: {len(failed)}")

    if failed:
        print("\n⚠️  Failed tickets:")
        for ticket_id, error in failed:
            error_short = error[:80] + "..." if len(error) > 80 else error
            print(f"    - {ticket_id}: {error_short}")

    print("\n" + "=" * 60 + "\n")


if __name__ == "__main__":
    main()
