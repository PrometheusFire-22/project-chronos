#!/usr/bin/env python3
"""
Google Workspace CLI Tool

Command-line interface for Google Workspace operations.

Usage:
    google_cli gmail send --to user@example.com --subject "Test" --body "Hello"
    google_cli drive upload file.pdf --folder-id abc123
    google_cli calendar create --summary "Meeting" --start "2025-12-05T10:00:00"
    google_cli sheets read spreadsheet_id "Sheet1!A1:C10"
    google_cli admin list-users --max-results 10

Environment Variables:
    GOOGLE_SERVICE_ACCOUNT_FILE - Path to service account JSON key
    GOOGLE_DELEGATED_USER - Email of user to impersonate
"""

import os
import sys

import click
from rich.console import Console
from rich.table import Table

# Add parent directory to path for imports
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", ".."))

from chronos.integrations.google import (
    AdminClient,
    CalendarClient,
    DriveClient,
    GmailClient,
    GoogleWorkspaceAuth,
    SheetsClient,
)

console = Console()


@click.group()
def google():
    """🔵 Google Workspace CLI Tool"""
    pass


# ============================================================================
# GMAIL COMMANDS
# ============================================================================


@google.group()
def gmail():
    """📧 Gmail operations"""
    pass


@gmail.command()
@click.command(name="list-messages")
@click.option("--to", required=True, help="Recipient email address")
@click.option("--subject", required=True, help="Email subject")
@click.option("--body", required=True, help="Email body")
@click.option("--cc", multiple=True, help="CC recipients (can specify multiple times)")
@click.option("--bcc", multiple=True, help="BCC recipients (can specify multiple times)")
@click.option("--html", is_flag=True, help="Send as HTML email")
@click.option("--attachment", multiple=True, help="File attachments (can specify multiple times)")
def send(to, subject, body, cc, bcc, html, attachment):
    """Send an email"""
    try:
        auth = GoogleWorkspaceAuth()
        client = GmailClient(auth)

        console.print(f"[cyan]Sending email to {to}...[/cyan]")

        result = client.send_email(
            to=to,
            subject=subject,
            body=body,
            cc=list(cc) if cc else None,
            bcc=list(bcc) if bcc else None,
            html=html,
            attachments=list(attachment) if attachment else None,
        )

        console.print("[green]✅ Email sent successfully![/green]")
        console.print(f"Message ID: {result.get('id')}")

    except Exception as e:
        console.print(f"[red]❌ Error: {e}[/red]")
        sys.exit(1)


@gmail.command(name="list")
@click.option("--query", default="", help='Gmail search query (e.g., "is:unread")')
@click.option("--max-results", default=10, help="Maximum number of messages to list")
def list_messages(query, max_results):
    """List emails"""
    try:
        auth = GoogleWorkspaceAuth()
        client = GmailClient(auth)

        console.print("[cyan]Fetching emails...[/cyan]")
        messages = client.list_messages(query=query, max_results=max_results)

        if not messages:
            console.print("[yellow]No messages found.[/yellow]")
            return

        table = Table(title=f"📧 Gmail Messages ({len(messages)})")
        table.add_column("From", style="cyan")
        table.add_column("Subject", style="white")
        table.add_column("Date", style="green")

        for msg in messages:
            headers = {h["name"]: h["value"] for h in msg.get("payload", {}).get("headers", [])}
            from_email = headers.get("From", "Unknown")
            subject = headers.get("Subject", "(No subject)")
            date = headers.get("Date", "Unknown")

            table.add_row(from_email, subject, date)

        console.print(table)

    except Exception as e:
        console.print(f"[red]❌ Error: {e}[/red]")
        sys.exit(1)


@gmail.command()
@click.command(name="list-messages")
@click.argument("label_name")
def create_label(label_name):
    """Create a new label"""
    try:
        auth = GoogleWorkspaceAuth()
        client = GmailClient(auth)

        console.print(f"[cyan]Creating label '{label_name}'...[/cyan]")
        result = client.create_label(label_name)

        console.print("[green]✅ Label created successfully![/green]")
        console.print(f"Label ID: {result.get('id')}")

    except Exception as e:
        console.print(f"[red]❌ Error: {e}[/red]")
        sys.exit(1)


# ============================================================================
# DRIVE COMMANDS
# ============================================================================


@google.group()
def drive():
    """📁 Google Drive operations"""
    pass


@drive.command()
@click.command(name="list-files")
@click.argument("file_path", type=click.Path(exists=True))
@click.option("--folder-id", help="ID of folder to upload to")
@click.option("--mime-type", help="MIME type (auto-detected if not specified)")
def upload(file_path, folder_id, mime_type):
    """Upload a file to Drive"""
    try:
        auth = GoogleWorkspaceAuth()
        client = DriveClient(auth)

        console.print(f"[cyan]Uploading {file_path}...[/cyan]")
        file_id = client.upload_file(file_path, folder_id=folder_id, mime_type=mime_type)

        console.print("[green]✅ File uploaded successfully![/green]")
        console.print(f"File ID: {file_id}")
        console.print(f"URL: https://drive.google.com/file/d/{file_id}/view")

    except Exception as e:
        console.print(f"[red]❌ Error: {e}[/red]")
        sys.exit(1)


@drive.command()
@click.command(name="list-files")
@click.option("--query", default="", help="Drive search query")
@click.option("--max-results", default=10, help="Maximum number of files to list")
def list_files(query, max_results):
    """List files in Drive"""
    try:
        auth = GoogleWorkspaceAuth()
        client = DriveClient(auth)

        console.print("[cyan]Fetching files...[/cyan]")
        files = client.list_files(query=query, max_results=max_results)

        if not files:
            console.print("[yellow]No files found.[/yellow]")
            return

        table = Table(title=f"📁 Drive Files ({len(files)})")
        table.add_column("Name", style="cyan")
        table.add_column("Type", style="yellow")
        table.add_column("Modified", style="green")

        for file in files:
            name = file.get("name", "Unknown")
            mime_type = file.get("mimeType", "Unknown").split(".")[-1]
            modified = file.get("modifiedTime", "Unknown")

            table.add_row(name, mime_type, modified)

        console.print(table)

    except Exception as e:
        console.print(f"[red]❌ Error: {e}[/red]")
        sys.exit(1)


@drive.command()
@click.command(name="list-files")
@click.argument("file_id")
@click.argument("destination_path", type=click.Path())
def download(file_id, destination_path):
    """Download a file from Drive"""
    try:
        auth = GoogleWorkspaceAuth()
        client = DriveClient(auth)

        console.print(f"[cyan]Downloading file {file_id}...[/cyan]")
        client.download_file(file_id, destination_path)

        console.print(f"[green]✅ File downloaded to {destination_path}[/green]")

    except Exception as e:
        console.print(f"[red]❌ Error: {e}[/red]")
        sys.exit(1)


@drive.command()
@click.command(name="list-files")
@click.argument("file_id")
@click.argument("email")
@click.option("--role", default="reader", type=click.Choice(["reader", "writer", "commenter"]))
def share(file_id, email, role):
    """Share a file with someone"""
    try:
        auth = GoogleWorkspaceAuth()
        client = DriveClient(auth)

        console.print(f"[cyan]Sharing file with {email} as {role}...[/cyan]")
        client.share_file(file_id, email, role=role)

        console.print("[green]✅ File shared successfully![/green]")

    except Exception as e:
        console.print(f"[red]❌ Error: {e}[/red]")
        sys.exit(1)


# ============================================================================
# CALENDAR COMMANDS
# ============================================================================


@google.group()
def calendar():
    """📅 Google Calendar operations"""
    pass


@calendar.command()
@click.command(name="list-events")
@click.option("--summary", required=True, help="Event title")
@click.option("--start", required=True, help="Start time (ISO 8601 format)")
@click.option("--end", required=True, help="End time (ISO 8601 format)")
@click.option("--description", help="Event description")
@click.option("--location", help="Event location")
@click.option("--attendee", multiple=True, help="Attendee emails (can specify multiple times)")
def create(summary, start, end, description, location, attendee):
    """Create a calendar event"""
    try:
        auth = GoogleWorkspaceAuth()
        client = CalendarClient(auth)

        console.print(f"[cyan]Creating event '{summary}'...[/cyan]")

        event = client.create_event(
            summary=summary,
            start_time=start,
            end_time=end,
            description=description,
            location=location,
            attendees=list(attendee) if attendee else None,
        )

        console.print("[green]✅ Event created successfully![/green]")
        console.print(f"Event ID: {event.get('id')}")
        console.print(f"URL: {event.get('htmlLink')}")

    except Exception as e:
        console.print(f"[red]❌ Error: {e}[/red]")
        sys.exit(1)


@calendar.command()
@click.command(name="list-events")
@click.option("--max-results", default=10, help="Maximum number of events to list")
def list_events(max_results):
    """List upcoming events"""
    try:
        auth = GoogleWorkspaceAuth()
        client = CalendarClient(auth)

        console.print("[cyan]Fetching upcoming events...[/cyan]")
        events = client.list_events(max_results=max_results)

        if not events:
            console.print("[yellow]No upcoming events found.[/yellow]")
            return

        table = Table(title=f"📅 Upcoming Events ({len(events)})")
        table.add_column("Summary", style="cyan")
        table.add_column("Start", style="green")
        table.add_column("End", style="yellow")

        for event in events:
            summary = event.get("summary", "(No title)")
            start = event.get("start", {}).get(
                "dateTime", event.get("start", {}).get("date", "Unknown")
            )
            end = event.get("end", {}).get("dateTime", event.get("end", {}).get("date", "Unknown"))

            table.add_row(summary, start, end)

        console.print(table)

    except Exception as e:
        console.print(f"[red]❌ Error: {e}[/red]")
        sys.exit(1)


# ============================================================================
# SHEETS COMMANDS
# ============================================================================


@google.group()
def sheets():
    """📊 Google Sheets operations"""
    pass


@sheets.command()
@click.command(name="create-spreadsheet")
@click.argument("spreadsheet_id")
@click.argument("range_name")
def read(spreadsheet_id, range_name):
    """Read data from a spreadsheet"""
    try:
        auth = GoogleWorkspaceAuth()
        client = SheetsClient(auth)

        console.print(f"[cyan]Reading {range_name}...[/cyan]")
        values = client.read_range(spreadsheet_id, range_name)

        if not values:
            console.print("[yellow]No data found.[/yellow]")
            return

        table = Table(title="📊 Spreadsheet Data")

        # Add columns based on first row
        for col in values[0]:
            table.add_column(str(col), style="cyan")

        # Add data rows
        for row in values[1:]:
            table.add_row(*[str(cell) for cell in row])

        console.print(table)

    except Exception as e:
        console.print(f"[red]❌ Error: {e}[/red]")
        sys.exit(1)


@sheets.command()
@click.command(name="create-spreadsheet")
@click.argument("spreadsheet_id")
@click.argument("range_name")
@click.argument("values")
def write(spreadsheet_id, range_name, values):
    """Write data to a spreadsheet (JSON format)"""
    try:
        import json

        auth = GoogleWorkspaceAuth()
        client = SheetsClient(auth)

        # Parse values as JSON
        data = json.loads(values)

        console.print(f"[cyan]Writing to {range_name}...[/cyan]")
        result = client.write_range(spreadsheet_id, range_name, data)

        console.print("[green]✅ Data written successfully![/green]")
        console.print(f"Updated cells: {result.get('updatedCells')}")

    except Exception as e:
        console.print(f"[red]❌ Error: {e}[/red]")
        sys.exit(1)


@sheets.command()
@click.command(name="create-spreadsheet")
@click.argument("title")
@click.option("--sheet", multiple=True, help="Sheet names (can specify multiple times)")
def create_spreadsheet(title, sheet):
    """Create a new spreadsheet"""
    try:
        auth = GoogleWorkspaceAuth()
        client = SheetsClient(auth)

        console.print(f"[cyan]Creating spreadsheet '{title}'...[/cyan]")

        spreadsheet_id = client.create_spreadsheet(
            title=title, sheet_titles=list(sheet) if sheet else None
        )

        console.print("[green]✅ Spreadsheet created successfully![/green]")
        console.print(f"Spreadsheet ID: {spreadsheet_id}")
        console.print(f"URL: https://docs.google.com/spreadsheets/d/{spreadsheet_id}/edit")

    except Exception as e:
        console.print(f"[red]❌ Error: {e}[/red]")
        sys.exit(1)


# ============================================================================
# ADMIN COMMANDS
# ============================================================================


@google.group()
def admin():
    """👥 Google Workspace Admin operations"""
    pass


@admin.command()
@click.option("--max-results", default=100, help="Maximum number of users to list")
@click.option("--query", help="Search query")
def list_users(max_results, query):
    """List users in the domain"""
    try:
        auth = GoogleWorkspaceAuth()
        client = AdminClient(auth)

        console.print("[cyan]Fetching users...[/cyan]")
        users = client.list_users(max_results=max_results, query=query)

        if not users:
            console.print("[yellow]No users found.[/yellow]")
            return

        table = Table(title=f"👥 Domain Users ({len(users)})")
        table.add_column("Email", style="cyan")
        table.add_column("Name", style="white")
        table.add_column("Admin", style="yellow")

        for user in users:
            email = user.get("primaryEmail", "Unknown")
            name = user.get("name", {}).get("fullName", "Unknown")
            is_admin = "✅" if user.get("isAdmin", False) else "❌"

            table.add_row(email, name, is_admin)

        console.print(table)

    except Exception as e:
        console.print(f"[red]❌ Error: {e}[/red]")
        sys.exit(1)


@admin.command()
@click.argument("user_email")
def get_user(user_email):
    """Get user details"""
    try:
        auth = GoogleWorkspaceAuth()
        client = AdminClient(auth)

        console.print(f"[cyan]Fetching user {user_email}...[/cyan]")
        user = client.get_user(user_email)

        console.print("\n[green]✅ User found![/green]\n")
        console.print(f"Email: {user.get('primaryEmail')}")
        console.print(f"Name: {user.get('name', {}).get('fullName')}")
        console.print(f"Admin: {'Yes' if user.get('isAdmin') else 'No'}")
        console.print(f"Suspended: {'Yes' if user.get('suspended') else 'No'}")
        console.print(f"Created: {user.get('creationTime')}")

    except Exception as e:
        console.print(f"[red]❌ Error: {e}[/red]")
        sys.exit(1)


@admin.command()
@click.option("--max-results", default=100, help="Maximum number of groups to list")
def list_groups(max_results):
    """List groups in the domain"""
    try:
        auth = GoogleWorkspaceAuth()
        client = AdminClient(auth)

        console.print("[cyan]Fetching groups...[/cyan]")
        groups = client.list_groups(max_results=max_results)

        if not groups:
            console.print("[yellow]No groups found.[/yellow]")
            return

        table = Table(title=f"👥 Domain Groups ({len(groups)})")
        table.add_column("Email", style="cyan")
        table.add_column("Name", style="white")
        table.add_column("Members", style="yellow")

        for group in groups:
            email = group.get("email", "Unknown")
            name = group.get("name", "Unknown")
            members = group.get("directMembersCount", "0")

            table.add_row(email, name, str(members))

        console.print(table)

    except Exception as e:
        console.print(f"[red]❌ Error: {e}[/red]")
        sys.exit(1)


if __name__ == "__main__":
    google()
