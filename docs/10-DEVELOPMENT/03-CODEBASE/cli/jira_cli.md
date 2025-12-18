# jira_cli(1) - Project Chronos Jira CLI Tool

## NAME

**jira_cli** - Full CRUD operations for Jira tickets

## SYNOPSIS

```bash
jira_cli create [OPTIONS]
jira_cli read TICKET_ID
jira_cli update TICKET_ID [OPTIONS]
jira_cli delete TICKET_ID
jira_cli list [OPTIONS]
jira_cli bulk-close TICKET_IDS --reason REASON
jira_cli next-id
```

## DESCRIPTION

The Jira CLI tool provides command-line access to Jira ticket operations for Project Chronos. It supports creating, reading, updating, deleting, and listing tickets with rich terminal formatting.

## COMMANDS

### create
Create a new Jira ticket.

**Options:**
- `--summary TEXT` (required) - Ticket summary
- `--description TEXT` - Ticket description
- `--type TEXT` - Issue type (default: Story)
- `--priority TEXT` - Priority level (default: Medium)
- `--labels TEXT` - Comma-separated labels
- `--points INTEGER` - Story points
- `--sprint TEXT` - Sprint name (default: Sprint 3)
- `--parent TEXT` - Parent issue key (for creating subtasks)

**Examples:**
```bash
# Create a story
jira_cli create \
  --summary "feat(api): Add user authentication" \
  --description "Implement JWT-based auth" \
  --type "Story" \
  --priority "High" \
  --labels "api,security" \
  --sprint "Sprint 8"

# Create a subtask under a story
jira_cli create \
  --summary "Write unit tests for auth" \
  --type "Task" \
  --parent "CHRONOS-248"
```

### read
Read and display ticket details.

**Arguments:**
- `TICKET_ID` - Jira ticket ID (e.g., CHRONOS-238)

**Example:**
```bash
jira_cli read CHRONOS-238
```

### update
Update an existing ticket.

**Arguments:**
- `TICKET_ID` - Jira ticket ID to update

**Options:**
- `--summary TEXT` - New summary
- `--description TEXT` - New description
- `--status TEXT` - New status (To Do, In Progress, Done)
- `--priority TEXT` - New priority
- `--points INTEGER` - Story points
- `--labels TEXT` - Comma-separated labels
- `--resolution TEXT` - Resolution (Done, Cancelled, Superseded)
- `--epic TEXT` - Epic key to link this issue to

**Examples:**
```bash
# Move ticket to In Progress
jira_cli update CHRONOS-238 --status "In Progress"

# Mark ticket as Done
jira_cli update CHRONOS-238 --status "Done"

# Link a story to an epic
jira_cli update CHRONOS-248 --epic CHRONOS-255

# Supersede a ticket
jira_cli update CHRONOS-204 \
  --status "Done" \
  --description "Superseded by CHRONOS-213"
```

### delete
Delete a ticket (requires confirmation).

**Arguments:**
- `TICKET_ID` - Jira ticket ID to delete

**Example:**
```bash
jira_cli delete CHRONOS-999
```

### list
List tickets with optional filters.

**Options:**
- `--status TEXT` - Filter by status
- `--sprint TEXT` - Filter by sprint label (e.g., 'sprint-7' or just '7')
- `--label TEXT` - Filter by any label
- `--resolution TEXT` - Filter by resolution
- `--limit INTEGER` - Number of results (default: 20)

**Examples:**
```bash
# List all To Do tickets
jira_cli list --status "To Do"

# List Sprint 7 tickets
jira_cli list --sprint 7

# List tickets with infrastructure label
jira_cli list --label infrastructure

# List superseded tickets
jira_cli list --resolution Superseded

# Combine filters
jira_cli list --sprint 7 --status Done --limit 50
```

### bulk-close
Close multiple tickets at once with a reason.

**Arguments:**
- `TICKET_IDS` - Comma-separated ticket IDs

**Options:**
- `--reason TEXT` (required) - Reason for closing
- `--status TEXT` - Status to set (default: Done)

**Example:**
```bash
jira_cli bulk-close CHRONOS-202,CHRONOS-204,CHRONOS-205 \
  --reason "Superseded by CHRONOS-213 (Lightsail setup)"
```

### next-id
Get the next available ticket ID.

**Example:**
```bash
jira_cli next-id
```

## ENVIRONMENT VARIABLES

The following environment variables must be set (typically in `.env`):

- `JIRA_URL` - Jira instance URL
- `JIRA_EMAIL` - Jira account email
- `JIRA_API_TOKEN` - Jira API token
- `JIRA_PROJECT_KEY` - Project key (default: CHRONOS)

## FILES

- `.env` - Environment configuration
- `src/chronos/workflows/jira/LAST_TICKET.txt` - Ticket ID tracker

## EXIT STATUS

- `0` - Success
- `1` - Error (API failure, invalid arguments, etc.)

## EXAMPLES

### Workflow Example: Create and Complete a Ticket

```bash
# 1. Get next ticket ID
jira_cli next-id
# Output: CHRONOS-240

# 2. Create ticket
jira_cli create \
  --summary "feat(security): Enable SSL for PostgreSQL" \
  --description "Configure SSL certificates for database connections" \
  --type "Story" \
  --labels "security,database,sprint-8"

# 3. Start work
jira_cli update CHRONOS-240 --status "In Progress"

# 4. Complete work
jira_cli update CHRONOS-240 --status "Done"
```

### Sprint Management Example

```bash
# View Sprint 7 tickets
jira_cli list --sprint 7

# View incomplete Sprint 7 tickets
jira_cli list --sprint 7 --status "To Do"

# View Sprint 7 completed tickets
jira_cli list --sprint 7 --status "Done"
```

### Cleanup Example

```bash
# Find duplicate tickets
jira_cli list --label "backup" --limit 10

# Close duplicates
jira_cli bulk-close CHRONOS-202,CHRONOS-204,CHRONOS-205 \
  --reason "Superseded by CHRONOS-213 (consolidated AWS setup)"
```

## SEE ALSO

- **Jira CLI Runbook:** `docs/3_runbooks/jira_cli_runbook.md`
- **Confluence CLI:** `docs/man/confluence_cli.md`
- **Complete Workflow:** `docs/3_runbooks/complete_workflow_runbook.md`
- **ADR-007:** Jira-First Workflow (`docs/2_architecture/adrs/adr_007_jira_first_workflow.md`)
- **ADR-003:** Pragmatic Agile Jira Workflow (`docs/2_architecture/adrs/adr_003_pragmatic_agile_jira_workflow.md`)

## BUGS

Report bugs to: https://github.com/PrometheusFire-22/project-chronos/issues

## AUTHOR

Project Chronos Team (Geoff Bevans + Claude Code)

## COPYRIGHT

Copyright © 2025 Automatonic AI Inc.

## VERSION

1.1.0 - Enhanced with sprint/resolution filtering and bulk operations

---

**Last Updated:** 2025-12-02
