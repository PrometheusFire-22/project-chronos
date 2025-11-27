#!/usr/bin/env python3
"""
🎯 Project Chronos: Jira CLI Tool
==================================
Full CRUD operations for Jira tickets with rich formatting

Usage:
    ./jira-cli create --summary "New ticket" --description "Details"
    ./jira-cli read CHRONOS-140
    ./jira-cli update CHRONOS-140 --status "In Progress" --points 5
    ./jira-cli delete CHRONOS-140
    ./jira-cli list --status "To Do"
    ./jira-cli next-id
"""
import os
import sys
from pathlib import Path

import click
import requests
from dotenv import load_dotenv
from rich import box
from rich.console import Console
from rich.markdown import Markdown
from rich.panel import Panel
from rich.table import Table

# Load environment
env_path = Path(__file__).parent.parent / ".env"
load_dotenv(env_path)

# Jira configuration
JIRA_URL = os.getenv("JIRA_URL")
JIRA_EMAIL = os.getenv("JIRA_EMAIL")
JIRA_API_TOKEN = os.getenv("JIRA_API_TOKEN")
JIRA_PROJECT_KEY = "CHRONOS"

# Rich console
console = Console()

# Tracker file
TRACKER_FILE = Path(__file__).parent.parent / "workflows" / "jira" / "LAST_TICKET.txt"


def get_next_ticket_id():
    """Get next available ticket number"""
    if TRACKER_FILE.exists():
        last = TRACKER_FILE.read_text().strip()
        num = int(last.split("-")[1])
        return f"CHRONOS-{num + 1}"
    return "CHRONOS-140"


def update_tracker(ticket_id: str):
    """Update last ticket number"""
    TRACKER_FILE.parent.mkdir(parents=True, exist_ok=True)
    TRACKER_FILE.write_text(ticket_id)


def format_description(text: str) -> str:
    """Format description as Jira-compatible markdown"""
    return {
        "type": "doc",
        "version": 1,
        "content": [{"type": "paragraph", "content": [{"type": "text", "text": text}]}],
    }


@click.group()
def cli():
    """🎯 Jira CLI Tool - Full CRUD Operations"""
    pass


@cli.command()
@click.option("--summary", required=True, help="Ticket summary")
@click.option("--description", default="", help="Ticket description")
@click.option("--type", "issue_type", default="Story", help="Issue type")
@click.option("--priority", default="Medium", help="Priority")
@click.option("--labels", default="", help="Comma-separated labels")
@click.option("--points", type=int, help="Story points")
@click.option("--sprint", default="Sprint 3", help="Sprint name")
def create(summary, description, issue_type, priority, labels, points, sprint):
    """✨ Create new Jira ticket"""

    console.print(Panel.fit("[bold cyan]Creating New Ticket[/bold cyan]", border_style="cyan"))

    # Build payload
    payload = {
        "fields": {
            "project": {"key": JIRA_PROJECT_KEY},
            "summary": summary,
            "description": format_description(description),
            "issuetype": {"name": issue_type},
            "priority": {"name": priority},
        }
    }

    # Add labels
    if labels:
        payload["fields"]["labels"] = [label.strip() for label in labels.split(",")]

    try:
        response = requests.post(
            f"{JIRA_URL}/rest/api/3/issue",
            auth=(JIRA_EMAIL, JIRA_API_TOKEN),
            headers={"Content-Type": "application/json"},
            json=payload,
            timeout=30,
        )
        response.raise_for_status()

        data = response.json()
        ticket_key = data["key"]

        # Update tracker
        update_tracker(ticket_key)

        # Display result
        table = Table(title="✅ Ticket Created", box=box.ROUNDED)
        table.add_column("Field", style="cyan")
        table.add_column("Value", style="green")

        table.add_row("Ticket ID", ticket_key)
        table.add_row("Summary", summary)
        table.add_row("Type", issue_type)
        table.add_row("Priority", priority)
        table.add_row("URL", f"{JIRA_URL}/browse/{ticket_key}")

        console.print(table)

    except Exception as e:
        console.print(f"[bold red]❌ Error:[/bold red] {str(e)}")
        sys.exit(1)


@cli.command()
@click.argument("ticket_id")
def read(ticket_id):
    """📖 Read ticket details"""

    console.print(
        Panel.fit(f"[bold cyan]Reading Ticket: {ticket_id}[/bold cyan]", border_style="cyan")
    )

    try:
        response = requests.get(
            f"{JIRA_URL}/rest/api/3/issue/{ticket_id}",
            auth=(JIRA_EMAIL, JIRA_API_TOKEN),
            timeout=30,
        )
        response.raise_for_status()

        data = response.json()
        fields = data["fields"]

        # Display details
        table = Table(title=f"📋 {ticket_id}", box=box.DOUBLE)
        table.add_column("Field", style="cyan", width=20)
        table.add_column("Value", style="white")

        table.add_row("Summary", fields["summary"])
        table.add_row("Type", fields["issuetype"]["name"])
        table.add_row("Status", fields["status"]["name"])
        table.add_row("Priority", fields["priority"]["name"])
        table.add_row("Assignee", fields.get("assignee", {}).get("displayName", "Unassigned"))
        table.add_row("Created", fields["created"][:10])
        table.add_row("Updated", fields["updated"][:10])

        if fields.get("labels"):
            table.add_row("Labels", ", ".join(fields["labels"]))

        console.print(table)

        # Show description if present
        if fields.get("description"):
            console.print("\n[bold]Description:[/bold]")
            # Extract text from Jira's doc format
            try:
                desc_text = fields["description"]["content"][0]["content"][0]["text"]
                console.print(Markdown(desc_text))
            except (KeyError, IndexError, TypeError):
                console.print("[dim]Unable to parse description[/dim]")

    except requests.exceptions.HTTPError as e:
        if e.response.status_code == 404:
            console.print(f"[bold red]❌ Ticket {ticket_id} not found[/bold red]")
        else:
            console.print(f"[bold red]❌ Error:[/bold red] {str(e)}")
        sys.exit(1)


@cli.command()
@click.argument("ticket_id")
@click.option("--summary", help="New summary")
@click.option("--description", help="New description")
@click.option("--status", help="New status (To Do, In Progress, Done)")
@click.option("--priority", help="New priority")
@click.option("--points", type=int, help="Story points")
@click.option("--labels", help="Comma-separated labels")
@click.option("--resolution", help="Resolution (Done, Cancelled, Superseded)")
def update(ticket_id, summary, description, status, priority, points, labels, resolution):
    """✏️  Update existing ticket"""

    console.print(
        Panel.fit(f"[bold cyan]Updating Ticket: {ticket_id}[/bold cyan]", border_style="cyan")
    )

    # Build updates
    updates = {}

    if summary:
        updates["summary"] = summary

    if description:
        updates["description"] = format_description(description)

    if priority:
        updates["priority"] = {"name": priority}

    if labels:
        updates["labels"] = [label.strip() for label in labels.split(",")]

    if resolution:
        # Map common resolution names to Jira resolution values
        resolution_map = {
            "done": "Done",
            "cancelled": "Cancelled",
            "canceled": "Cancelled",  # Support US spelling
            "superseded": "Superseded",
        }
        resolution_name = resolution_map.get(resolution.lower(), resolution)
        updates["resolution"] = {"name": resolution_name}

    if not updates and not status:
        console.print("[yellow]⚠️  No updates specified[/yellow]")
        return

    try:
        # Update fields
        if updates:
            response = requests.put(
                f"{JIRA_URL}/rest/api/3/issue/{ticket_id}",
                auth=(JIRA_EMAIL, JIRA_API_TOKEN),
                headers={"Content-Type": "application/json"},
                json={"fields": updates},
                timeout=30,
            )
            response.raise_for_status()

        # Update status (separate transition API)
        if status:
            # Get available transitions
            trans_response = requests.get(
                f"{JIRA_URL}/rest/api/3/issue/{ticket_id}/transitions",
                auth=(JIRA_EMAIL, JIRA_API_TOKEN),
                timeout=30,
            )
            trans_response.raise_for_status()

            transitions = trans_response.json()["transitions"]
            trans_id = next(
                (t["id"] for t in transitions if t["name"].lower() == status.lower()), None
            )

            if trans_id:
                requests.post(
                    f"{JIRA_URL}/rest/api/3/issue/{ticket_id}/transitions",
                    auth=(JIRA_EMAIL, JIRA_API_TOKEN),
                    headers={"Content-Type": "application/json"},
                    json={"transition": {"id": trans_id}},
                    timeout=30,
                )

        console.print(f"[bold green]✅ {ticket_id} updated successfully[/bold green]")

    except Exception as e:
        console.print(f"[bold red]❌ Error:[/bold red] {str(e)}")
        sys.exit(1)


@cli.command()
@click.argument("ticket_id")
@click.confirmation_option(prompt="Are you sure you want to delete this ticket?")
def delete(ticket_id):
    """🗑️  Delete ticket"""

    console.print(
        Panel.fit(f"[bold red]Deleting Ticket: {ticket_id}[/bold red]", border_style="red")
    )

    try:
        response = requests.delete(
            f"{JIRA_URL}/rest/api/3/issue/{ticket_id}",
            auth=(JIRA_EMAIL, JIRA_API_TOKEN),
            timeout=30,
        )
        response.raise_for_status()

        console.print(f"[bold green]✅ {ticket_id} deleted[/bold green]")

    except Exception as e:
        console.print(f"[bold red]❌ Error:[/bold red] {str(e)}")
        sys.exit(1)


@cli.command()
@click.option("--status", help="Filter by status")
@click.option("--limit", default=20, help="Number of results")
def list(status, limit):
    """📋 List tickets"""

    console.print(Panel.fit("[bold cyan]Listing Tickets[/bold cyan]", border_style="cyan"))

    # Build JQL query
    jql = f"project = {JIRA_PROJECT_KEY}"
    if status:
        jql += f" AND status = '{status}'"
    jql += " ORDER BY created DESC"

    try:
        response = requests.get(
            f"{JIRA_URL}/rest/api/3/search/jql",
            auth=(JIRA_EMAIL, JIRA_API_TOKEN),
            params={
                "jql": jql,
                "maxResults": limit,
                "fields": "key,summary,status,issuetype",
            },
            timeout=30,
        )
        response.raise_for_status()

        data = response.json()
        issues = data["issues"]

        # Display table
        table = Table(title=f"📋 {len(issues)} Tickets", box=box.ROUNDED)
        table.add_column("ID", style="cyan")
        table.add_column("Summary", style="white", width=50)
        table.add_column("Status", style="yellow")
        table.add_column("Type", style="magenta")

        for issue in issues:
            table.add_row(
                issue["key"],
                (
                    issue["fields"]["summary"][:47] + "..."
                    if len(issue["fields"]["summary"]) > 50
                    else issue["fields"]["summary"]
                ),
                issue["fields"]["status"]["name"],
                issue["fields"]["issuetype"]["name"],
            )

        console.print(table)

    except Exception as e:
        console.print(f"[bold red]❌ Error:[/bold red] {str(e)}")
        sys.exit(1)


@cli.command()
def next_id():
    """🔢 Get next available ticket ID"""
    next_id = get_next_ticket_id()

    console.print(
        Panel(f"[bold green]{next_id}[/bold green]", title="Next Ticket ID", border_style="green")
    )


if __name__ == "__main__":
    cli()
