#!/usr/bin/env python3
"""
Project Chronos: Jira Ticket Ingestion (SIMPLE VERSION)
========================================================
Creates tickets from CSV where status = "Pending"
Updates status to "Created" after success
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
JIRA_PROJECT_KEY = "CHRONOS"

print(f"🔧 Loaded Jira config: {JIRA_URL}")
print(f"✅ Project: {JIRA_PROJECT_KEY}\n")


def load_pending_tickets(catalog_path):
    """Load only Pending tickets from catalog"""
    pending = []

    with open(catalog_path) as f:
        reader = csv.DictReader(f)
        for row in reader:
            if row.get("status") == "Pending":
                pending.append(row)

    return pending


def create_jira_ticket(ticket_data):
    """Create Jira ticket via API"""

    # Build description with markdown
    description_text = f"""## 📋 Overview

{ticket_data['description']}

---

## 🎯 Acceptance Criteria

- [ ] Implementation complete
- [ ] Tests passing
- [ ] Documentation updated
- [ ] Code reviewed

---

## 🏷️ Labels: {ticket_data.get('labels', '')}
## ⚡ Priority: {ticket_data.get('priority', 'Medium')}
## 📊 Sprint: {ticket_data.get('sprint', 'Backlog')}
"""

    # Build payload
    payload = {
        "fields": {
            "project": {"key": JIRA_PROJECT_KEY},
            "summary": ticket_data["summary"],
            "description": {
                "type": "doc",
                "version": 1,
                "content": [
                    {"type": "paragraph", "content": [{"type": "text", "text": description_text}]}
                ],
            },
            "issuetype": {"name": ticket_data.get("issue_type", "Story")},
        }
    }

    # Add labels if present
    if ticket_data.get("labels"):
        labels = [label.strip() for label in ticket_data["labels"].split(";") if label.strip()]
        if labels:
            payload["fields"]["labels"] = labels

    # Create ticket
    response = requests.post(
        f"{JIRA_URL}/rest/api/3/issue",
        auth=(JIRA_EMAIL, JIRA_API_TOKEN),
        headers={"Content-Type": "application/json"},
        json=payload,
        timeout=30,
    )

    response.raise_for_status()
    return response.json()


def update_catalog_status(catalog_path, row_index, new_status):
    """Update status in catalog after ticket creation"""
    rows = []

    with open(catalog_path) as f:
        reader = csv.DictReader(f)
        fieldnames = reader.fieldnames

        for i, row in enumerate(reader):
            if i == row_index:
                row["status"] = new_status
            rows.append(row)

    with open(catalog_path, "w", newline="") as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(rows)


def main():
    """Main ingestion"""
    print("=" * 60)
    print("🚀 Project Chronos: Jira Ticket Ingestion")
    print("=" * 60 + "\n")

    # Locate catalog
    catalog_path = Path(__file__).parent.parent.parent / "workflows" / "jira" / "catalog.csv"

    if not catalog_path.exists():
        print(f"❌ Catalog not found: {catalog_path}")
        sys.exit(1)

    print(f"📊 Loading: {catalog_path}")
    pending_tickets = load_pending_tickets(catalog_path)

    if not pending_tickets:
        print("✅ No pending tickets to create")
        sys.exit(0)

    print(f"✅ Found {len(pending_tickets)} pending tickets\n")

    # Create each ticket
    created = 0
    failed = []

    for i, ticket in enumerate(pending_tickets):
        summary = ticket["summary"]

        print(f"[{i+1}/{len(pending_tickets)}] Creating: {summary[:60]}...")

        try:
            result = create_jira_ticket(ticket)
            jira_key = result["key"]
            jira_url = f"{JIRA_URL}/browse/{jira_key}"

            print(f"    ✅ Created: {jira_key}")
            print(f"    🔗 {jira_url}")

            # Update catalog
            update_catalog_status(catalog_path, i, "Created")

            created += 1

        except Exception as e:
            error_msg = str(e)[:100]
            print(f"    ❌ Error: {error_msg}")
            failed.append((summary, str(e)))

        print()

    # Summary
    print("=" * 60)
    print("✅ COMPLETE")
    print("=" * 60)
    print(f"\nCreated: {created}")
    print(f"Failed: {len(failed)}\n")

    if failed:
        print("Failed tickets:")
        for summary, _error in failed:
            print(f"  - {summary[:50]}")


if __name__ == "__main__":
    main()
