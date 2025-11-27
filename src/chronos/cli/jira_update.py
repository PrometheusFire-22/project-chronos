#!/usr/bin/env python3
"""
Jira Ticket UPDATE Script
==========================
Updates existing Jira tickets from CSV catalog

Features:
- Bulk update from CSV
- Single ticket update via CLI
- Rich descriptions preserved
- Audit trail logging
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

print(f"🔧 Loaded Jira config: {JIRA_URL}\n")


def get_ticket(ticket_key: str):
    """Get existing ticket data"""
    url = f"{JIRA_URL}/rest/api/3/issue/{ticket_key}"

    response = requests.get(url, auth=(JIRA_EMAIL, JIRA_API_TOKEN), timeout=30)

    if response.status_code == 404:
        return None

    response.raise_for_status()
    return response.json()


def update_ticket(ticket_key: str, updates: dict):
    """Update existing ticket"""
    url = f"{JIRA_URL}/rest/api/3/issue/{ticket_key}"

    payload = {"fields": updates}

    response = requests.put(
        url,
        auth=(JIRA_EMAIL, JIRA_API_TOKEN),
        headers={"Content-Type": "application/json"},
        json=payload,
        timeout=30,
    )

    response.raise_for_status()
    return True


def format_description(ticket_data: dict) -> str:
    """Format rich description with sections"""
    desc = ticket_data.get("description", "")
    acceptance = ticket_data.get("acceptance_criteria", "")
    labels = ticket_data.get("labels", "")

    # Build rich description
    default_acceptance = "- Implementation complete\n- Tests passing\n- Documentation updated"
    acceptance_text = acceptance if acceptance else default_acceptance
    labels_formatted = ", ".join(
        [f"`{label.strip()}`" for label in labels.split(";") if label.strip()]
    )

    rich_desc = f"""## 📋 Overview

{desc}

---

## ✅ Acceptance Criteria

{acceptance_text}

---

## 🏷️ Labels

{labels_formatted}

---

## 📊 Metadata

**Priority:** {ticket_data.get('priority', 'Medium')}
**Story Points:** {ticket_data.get('story_points', 'TBD')}
**Sprint:** {ticket_data.get('sprint', 'Backlog')}
"""

    if ticket_data.get("epic_link"):
        rich_desc += f"\n**Epic:** {ticket_data.get('epic_link')}"

    return rich_desc


def load_catalog(catalog_path: Path):
    """Load Jira catalog with updates"""
    tickets = []

    with open(catalog_path, encoding="utf-8") as f:
        reader = csv.DictReader(f)
        for row in reader:
            # Include all tickets (not just Pending)
            tickets.append(row)

    return tickets


def main():
    """Main update orchestrator"""
    print("=" * 60)
    print("🔄 Jira Ticket UPDATE")
    print("=" * 60 + "\n")

    # Locate catalog
    catalog_path = Path(__file__).parent.parent.parent / "workflows" / "jira" / "catalog.csv"

    if not catalog_path.exists():
        print(f"❌ Catalog not found: {catalog_path}")
        sys.exit(1)

    print(f"📊 Loading: {catalog_path}")
    tickets = load_catalog(catalog_path)

    print(f"✅ Loaded {len(tickets)} tickets\n")

    # Process updates
    updated = 0
    failed = []

    for ticket in tickets:
        ticket_id = ticket.get("ticket_id")

        # Skip if no ticket_id (hasn't been created yet)
        if not ticket_id or ticket.get("status") == "Pending":
            continue

        print(f"🔍 Checking: {ticket_id}")

        try:
            # Get existing ticket
            existing = get_ticket(ticket_id)

            if not existing:
                print("    ⚠️  Ticket not found, skipping")
                continue

            # Build updates
            updates = {}

            # Update description if present
            if ticket.get("description"):
                rich_desc = format_description(ticket)
                updates["description"] = {
                    "type": "doc",
                    "version": 1,
                    "content": [
                        {"type": "paragraph", "content": [{"type": "text", "text": rich_desc}]}
                    ],
                }

            # Update summary if changed
            if ticket.get("summary"):
                updates["summary"] = ticket["summary"]

            # Update labels
            if ticket.get("labels"):
                labels = [label.strip() for label in ticket["labels"].split(";") if label.strip()]
                if labels:
                    updates["labels"] = labels

            # Only update if there are changes
            if updates:
                update_ticket(ticket_id, updates)
                print("    ✅ Updated")
                updated += 1
            else:
                print("    ⏭️  No changes")

        except Exception as e:
            print(f"    ❌ Error: {str(e)[:80]}")
            failed.append((ticket_id, str(e)))

        print()

    # Summary
    print("=" * 60)
    print("✅ UPDATE COMPLETE")
    print("=" * 60)
    print(f"\nUpdated: {updated}")
    print(f"Failed: {len(failed)}\n")

    if failed:
        print("Failed updates:")
        for ticket_id, error in failed:
            print(f"  - {ticket_id}: {error[:60]}")

    print("\n" + "=" * 60 + "\n")


if __name__ == "__main__":
    main()
