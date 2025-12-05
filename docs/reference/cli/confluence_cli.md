# confluence_cli(1) - Project Chronos Confluence CLI Tool

## NAME

**confluence_cli** - Manage Confluence pages from the command line

## SYNOPSIS

```bash
confluence create --title TITLE --body BODY [OPTIONS]
confluence read TITLE_OR_ID [OPTIONS]
confluence update PAGE_ID --title TITLE --body BODY [OPTIONS]
confluence delete PAGE_ID
confluence list [OPTIONS]
confluence search QUERY [OPTIONS]
```

## DESCRIPTION

The Confluence CLI tool provides command-line access to Confluence page operations for Project Chronos. It supports creating, reading, updating, deleting, listing, and searching Confluence pages with automatic markdown conversion.

## COMMANDS

### create
Create a new Confluence page.

**Options:**
- `--title TEXT` (required) - Page title
- `--body TEXT` (required) - Page content (markdown or HTML)
- `--space TEXT` - Space key (default: PC)
- `--parent TEXT` - Parent page title (for hierarchy)
- `--labels TEXT` - Comma-separated labels

**Example:**
```bash
confluence create \
  --title "Sprint 8 Planning" \
  --body "## Sprint Goal\nImplement frontend architecture" \
  --space PC \
  --parent "Sprints" \
  --labels "sprint-8,planning"
```

### read
Read and display a Confluence page.

**Arguments:**
- `TITLE_OR_ID` - Page title or page ID

**Options:**
- `--space TEXT` - Space key (default: PC)
- `--format TEXT` - Output format: markdown, html, storage (default: markdown)

**Examples:**
```bash
# Read by title
confluence read "Sprint 8 Planning" --space PC

# Read by ID
confluence read 12345678

# Get raw storage format
confluence read 12345678 --format storage
```

### update
Update an existing Confluence page.

**Arguments:**
- `PAGE_ID` - Confluence page ID

**Options:**
- `--title TEXT` - New title
- `--body TEXT` - New content
- `--parent TEXT` - New parent page title (moves the page)
- `--labels TEXT` - New labels (replaces existing)

**Example:**
```bash
confluence update 12345678 \
  --title "Sprint 8 Planning (Updated)" \
  --body "## Sprint Goal\nComplete frontend + backend integration"
```

### delete
Delete a Confluence page.

**Arguments:**
- `PAGE_ID` - Confluence page ID to delete

**Example:**
```bash
confluence delete 12345678
```

### list
List Confluence pages in a space.

**Options:**
- `--space TEXT` - Space key (default: PC)
- `--limit INTEGER` - Number of results (default: 20)

**Example:**
```bash
# List all pages in PC space
confluence list --space PC --limit 50
```

### search
Search Confluence pages.

**Arguments:**
- `QUERY` - Search query (CQL format)

**Options:**
- `--space TEXT` - Limit to specific space
- `--limit INTEGER` - Number of results (default: 10)

**Examples:**
```bash
# Search for pages with "Sprint 8"
confluence search "Sprint 8" --space PC

# Search using CQL
confluence search "type=page AND space=PC AND title~'Sprint 8'"
```

## MARKDOWN CONVERSION

The CLI automatically converts markdown to Confluence storage format:

**Supported Markdown:**
- Headers: `# H1`, `## H2`, etc.
- Bold: `**text**`
- Italic: `*text*`
- Code: `` `code` ``
- Code blocks: ` ```language\ncode\n``` `
- Lists: `- item` or `1. item`
- Links: `[text](url)`
- Images: `![alt](url)`
- Tables: Standard markdown tables
- Blockquotes: `> quote`

**Example:**
```bash
# Create page with markdown
confluence create \
  --title "API Documentation" \
  --body "$(cat <<'EOF'
# Authentication API

## Endpoints

### POST /auth/login
Login with credentials.

**Request:**
```json
{
  "email": "user@example.com",
  "password": "secret"
}
```

**Response:**
```json
{
  "token": "jwt-token-here"
}
```
EOF
)"
```

## ENVIRONMENT VARIABLES

The following environment variables must be set (typically in `.env`):

- `CONFLUENCE_URL` - Confluence instance URL (or `JIRA_URL`)
- `CONFLUENCE_EMAIL` - Confluence account email (or `JIRA_EMAIL`)
- `CONFLUENCE_API_TOKEN` - Confluence API token (or `JIRA_API_TOKEN`)

## FILES

- `.env` - Environment configuration
- `docs/.confluence-mapping.json` - Page ID mappings for sync

## EXIT STATUS

- `0` - Success
- `1` - Error (API failure, invalid arguments, page not found, etc.)

## EXAMPLES

### Workflow Example: Create and Update Documentation

```bash
# 1. Create initial page
confluence create \
  --title "Database Migration Guide" \
  --body "# Overview\n\nThis guide covers database migration procedures." \
  --space PC

# 2. Read the page
confluence read "Database Migration Guide" --space PC

# 3. Update with more content
confluence update 12345678 \
  --body "$(cat docs/4_guides/database_migration.md)"
```

### Sync Local Documentation

```bash
# Use the sync_docs.py script for automated syncing
python3 scripts/ops/sync_docs.py --organize

# Or manually sync a single file
confluence create \
  --title "Security Hardening Phase 2A" \
  --body "$(cat docs/3_runbooks/security_hardening_phase2a.md)" \
  --labels "security,runbook,sprint-7"
```

### Search and Cleanup

```bash
# Find outdated pages
confluence search "type=page AND space=PC AND lastModified < now('-90d')"

# Read page to verify
confluence read "Old Page Title"

# Delete if obsolete
confluence delete 12345678
```

## INTEGRATION

### With Jira CLI

```bash
# Create Jira ticket and Confluence page together
TICKET=$(jira_cli next-id)
jira_cli create \
  --summary "docs(runbook): Database backup procedures" \
  --description "Create comprehensive backup runbook"

confluence create \
  --title "$TICKET: Database Backup Runbook" \
  --body "$(cat docs/3_runbooks/pgbackrest_backup_restore.md)" \
  --labels "jira-$TICKET,runbook,database"
```

### With Automated Sync

```bash
# Daily sync cron job
# See: docs/3_runbooks/confluence_daily_sync_cron.md
0 9 * * * cd ~/project-chronos && python3 scripts/ops/sync_docs.py --organize
```

## SEE ALSO

- **Confluence CLI Runbook:** `docs/3_runbooks/confluence_cli_runbook.md`
- **Comprehensive Sync Guide:** `docs/3_runbooks/confluence_comprehensive_sync_guide.md`
- **Hierarchy Management:** `docs/3_runbooks/confluence_hierarchy_management.md`
- **Jira CLI:** `docs/man/jira_cli.md`
- **Complete Workflow:** `docs/3_runbooks/complete_workflow_runbook.md`
- **ADR-011:** Documentation SSOT (`docs/2_architecture/adrs/adr_011_documentation_ssot.md`)

## AUTOMATION SCRIPTS

- `scripts/ops/sync_docs.py` - Sync all local docs to Confluence
- `scripts/ops/organize_confluence_hierarchy.py` - Organize page hierarchy
- `scripts/organize` - Quick alias for hierarchy organization

## BUGS

Report bugs to: https://github.com/PrometheusFire-22/project-chronos/issues

## AUTHOR

Project Chronos Team (Geoff Bevans + Claude Code)

## COPYRIGHT

Copyright © 2025 Automatonic AI Inc.

## VERSION

1.0.0 - Initial man page

---

**Last Updated:** 2025-12-02
