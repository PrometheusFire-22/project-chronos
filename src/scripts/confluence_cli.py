#!/usr/bin/env python3
"""
🎯 Project Chronos: Confluence CLI Tool
========================================
Full CRUD operations for Confluence pages with markdown support

Usage:
    ./confluence-cli create --title "Page Title" --space CHRONOS --body "Content"
    ./confluence-cli read "Page Title" --space CHRONOS
    ./confluence-cli update "Page Title" --space CHRONOS --body "New content"
    ./confluence-cli delete "Page Title" --space CHRONOS
    ./confluence-cli list --space CHRONOS
"""
import os
import sys
from pathlib import Path

import click
import markdown2
from atlassian import Confluence
from dotenv import load_dotenv
from rich import box
from rich.console import Console
from rich.panel import Panel
from rich.table import Table

# Load environment
env_path = Path(__file__).parent.parent.parent / ".env"
load_dotenv(env_path)

# Confluence configuration
CONFLUENCE_URL = os.getenv("CONFLUENCE_URL", os.getenv("JIRA_URL"))
CONFLUENCE_EMAIL = os.getenv("CONFLUENCE_EMAIL", os.getenv("JIRA_EMAIL"))
CONFLUENCE_API_TOKEN = os.getenv("CONFLUENCE_API_TOKEN", os.getenv("JIRA_API_TOKEN"))

# Rich console
console = Console()

# Initialize Confluence client
try:
    confluence = Confluence(
        url=CONFLUENCE_URL, username=CONFLUENCE_EMAIL, password=CONFLUENCE_API_TOKEN
    )
except Exception as e:
    console.print(f"[bold red]❌ Failed to initialize Confluence client:[/bold red] {str(e)}")
    sys.exit(1)


def markdown_to_confluence(markdown_text: str) -> str:
    """Convert markdown to Confluence storage format (XHTML)"""
    # Convert markdown to HTML
    html = markdown2.markdown(
        markdown_text,
        extras=[
            "fenced-code-blocks",
            "tables",
            "header-ids",
            "task_list",
            "strike",
            "code-friendly",
        ],
    )

    # Confluence storage format adjustments
    # Convert checkboxes
    html = html.replace(
        '<input type="checkbox" disabled>',
        "<ac:task><ac:task-status>incomplete</ac:task-status><ac:task-body>",
    )
    html = html.replace(
        '<input type="checkbox" checked disabled>',
        "<ac:task><ac:task-status>complete</ac:task-status><ac:task-body>",
    )
    html = html.replace("</li>", "</ac:task-body></ac:task></li>")

    return html


@click.group()
def cli():
    """🎯 Confluence CLI Tool - Full CRUD Operations"""
    pass


@cli.command()
@click.option("--title", required=True, help="Page title")
@click.option("--space", required=True, help="Confluence space key")
@click.option("--body", help="Page body (markdown supported)")
@click.option("--body-file", type=click.Path(exists=True), help="Path to markdown file")
@click.option("--parent", help="Parent page title (for hierarchy)")
@click.option("--labels", default="", help="Comma-separated labels")
@click.option("--jira-ticket", help="Link to Jira ticket (e.g., CHRONOS-123)")
def create(title, space, body, body_file, parent, labels, jira_ticket):
    """✨ Create new Confluence page"""

    console.print(Panel.fit("[bold cyan]Creating New Page[/bold cyan]", border_style="cyan"))

    # Get body content
    if body_file:
        with open(body_file) as f:
            body = f.read()
    elif not body:
        console.print("[bold red]❌ Must provide --body or --body-file[/bold red]")
        sys.exit(1)

    # Convert markdown to Confluence format
    confluence_body = markdown_to_confluence(body)

    # Add Jira ticket link if provided
    if jira_ticket:
        confluence_body = (
            f'<p><ac:structured-macro ac:name="jira"><ac:parameter ac:name="key">{jira_ticket}</ac:parameter></ac:structured-macro></p>'
            + confluence_body
        )

    try:
        # Get parent page ID if specified
        parent_id = None
        if parent:
            parent_page = confluence.get_page_by_title(space=space, title=parent)
            if parent_page:
                parent_id = parent_page["id"]

        # Create page
        page = confluence.create_page(
            space=space,
            title=title,
            body=confluence_body,
            parent_id=parent_id,
            type="page",
            representation="storage",
        )

        page_id = page["id"]
        page_url = f"{CONFLUENCE_URL}/wiki{page['_links']['webui']}"

        # Add labels (one at a time)
        if labels:
            for label in labels.split(","):
                label_name = label.strip()
                if label_name:
                    confluence.set_page_label(page_id, label_name)

        # Display result
        table = Table(title="✅ Page Created", box=box.ROUNDED)
        table.add_column("Field", style="cyan")
        table.add_column("Value", style="green")

        table.add_row("Page ID", str(page_id))
        table.add_row("Title", title)
        table.add_row("Space", space)
        table.add_row("URL", page_url)
        if parent:
            table.add_row("Parent", parent)
        if jira_ticket:
            table.add_row("Jira Ticket", jira_ticket)

        console.print(table)
        console.print(f"\n[bold green]🔗 {page_url}[/bold green]")

    except Exception as e:
        console.print(f"[bold red]❌ Error:[/bold red] {str(e)}")
        sys.exit(1)


@cli.command()
@click.argument("title")
@click.option("--space", required=True, help="Confluence space key")
def read(title, space):
    """📖 Read page details"""

    console.print(Panel.fit(f"[bold cyan]Reading Page: {title}[/bold cyan]", border_style="cyan"))

    try:
        page = confluence.get_page_by_title(
            space=space, title=title, expand="body.storage,version,space"
        )

        if not page:
            console.print(f"[bold red]❌ Page '{title}' not found in space {space}[/bold red]")
            sys.exit(1)

        # Display details
        table = Table(title=f"📄 {title}", box=box.DOUBLE)
        table.add_column("Field", style="cyan", width=20)
        table.add_column("Value", style="white")

        table.add_row("Page ID", page["id"])
        table.add_row("Space", page["space"]["key"])
        table.add_row("Version", str(page["version"]["number"]))
        table.add_row("Created", page["version"]["when"][:10])
        table.add_row("Author", page["version"]["by"]["displayName"])
        table.add_row("URL", f"{CONFLUENCE_URL}/wiki{page['_links']['webui']}")

        console.print(table)

        # Show body preview
        console.print("\n[bold]Content Preview:[/bold]")
        body_storage = page["body"]["storage"]["value"]
        # Strip HTML tags for preview
        import re

        body_text = re.sub("<[^<]+?>", "", body_storage)
        console.print(body_text[:500] + "..." if len(body_text) > 500 else body_text)

    except Exception as e:
        console.print(f"[bold red]❌ Error:[/bold red] {str(e)}")
        sys.exit(1)


@cli.command()
@click.argument("title")
@click.option("--space", required=True, help="Confluence space key")
@click.option("--new-title", help="New page title")
@click.option("--body", help="New page body (markdown)")
@click.option("--body-file", type=click.Path(exists=True), help="Path to markdown file")
@click.option("--labels", help="Comma-separated labels")
def update(title, space, new_title, body, body_file, labels):
    """✏️ Update existing page"""

    console.print(Panel.fit(f"[bold cyan]Updating Page: {title}[/bold cyan]", border_style="cyan"))

    try:
        # Get existing page
        page = confluence.get_page_by_title(space=space, title=title, expand="body.storage,version")

        if not page:
            console.print(f"[bold red]❌ Page '{title}' not found[/bold red]")
            sys.exit(1)

        page_id = page["id"]

        # Get body content
        if body_file:
            with open(body_file) as f:
                body = f.read()

        updates = {}

        if new_title:
            updates["title"] = new_title

        if body:
            confluence_body = markdown_to_confluence(body)
            updates["body"] = confluence_body

        # Update page
        if updates:
            confluence.update_page(
                page_id=page_id,
                title=updates.get("title", title),
                body=updates.get("body", page["body"]["storage"]["value"]),
                parent_id=None,
                type="page",
                representation="storage",
                minor_edit=False,
            )

        # Update labels
        if labels:
            label_list = [
                {"prefix": "global", "name": label.strip()}
                for label in labels.split(",")
                if label.strip()
            ]
            if label_list:
                confluence.set_page_label(page_id, label_list)

        console.print(f"[bold green]✅ Page '{title}' updated successfully[/bold green]")

    except Exception as e:
        console.print(f"[bold red]❌ Error:[/bold red] {str(e)}")
        sys.exit(1)


@cli.command()
@click.argument("title")
@click.option("--space", required=True, help="Confluence space key")
@click.confirmation_option(prompt="Are you sure you want to delete this page?")
def delete(title, space):
    """🗑️ Delete page"""

    console.print(Panel.fit(f"[bold red]Deleting Page: {title}[/bold red]", border_style="red"))

    try:
        page = confluence.get_page_by_title(space=space, title=title)

        if not page:
            console.print(f"[bold red]❌ Page '{title}' not found[/bold red]")
            sys.exit(1)

        page_id = page["id"]
        confluence.remove_page(page_id)

        console.print(f"[bold green]✅ Page '{title}' deleted[/bold green]")

    except Exception as e:
        console.print(f"[bold red]❌ Error:[/bold red] {str(e)}")
        sys.exit(1)


@cli.command()
@click.option("--space", required=True, help="Confluence space key")
@click.option("--limit", default=20, help="Number of results")
def list(space, limit):
    """📋 List pages in space"""

    console.print(Panel.fit("[bold cyan]Listing Pages[/bold cyan]", border_style="cyan"))

    try:
        pages = confluence.get_all_pages_from_space(space=space, limit=limit, expand="version")

        if not pages:
            console.print(f"[bold yellow]No pages found in space {space}[/bold yellow]")
            return

        # Display table
        table = Table(title=f"📋 {len(pages)} Pages in {space}", box=box.ROUNDED)
        table.add_column("Title", style="cyan", width=50)
        table.add_column("Version", style="yellow", width=10)
        table.add_column("Updated", style="white", width=15)

        for page in pages:
            table.add_row(
                page["title"][:47] + "..." if len(page["title"]) > 50 else page["title"],
                str(page["version"]["number"]),
                page["version"]["when"][:10],
            )

        console.print(table)

    except Exception as e:
        console.print(f"[bold red]❌ Error:[/bold red] {str(e)}")
        sys.exit(1)


if __name__ == "__main__":
    cli()
