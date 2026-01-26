# LAST_TICKET Tracker Files

## Active File

**Location**: `/workspace/src/chronos/workflows/jira/LAST_TICKET.txt`

This file tracks the last Jira ticket ID created by the `jira_cli.py` tool. It is used to auto-increment ticket numbers.

**Referenced by**: `src/chronos/cli/jira_cli.py` (line 42)

## Deprecated Files

The following files are no longer used and have been deprecated:

- `/workspace/src/workflows/jira/LAST_TICKET.txt.deprecated` (was CHRONOS-162)
- `/workspace/workflows/jira/LAST_TICKET.txt.deprecated` (was CHRONOS-142)

These files were from earlier project structure iterations and are kept for historical reference only.

## Usage

The tracker file is automatically updated when creating tickets via:

```bash
jira create --summary "..." --description "..."
```

To manually check the next ticket ID:

```bash
jira next-id
```

## Manual Updates

If tickets are created manually in Jira (not via CLI), update the tracker file to reflect the latest ticket number:

```bash
echo "CHRONOS-XXX" > src/chronos/workflows/jira/LAST_TICKET.txt
```

This ensures the CLI tool continues to generate correct ticket IDs.
