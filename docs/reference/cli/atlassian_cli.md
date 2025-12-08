# Atlassian CLI (ACLI) Reference

**Status**: Active
**Version**: 1.3.7-stable
**Related ADR**: ADR-016 (ACLI Migration)
**Migration Ticket**: CHRONOS-268

---

## Overview

The official Atlassian CLI (ACLI) provides command-line access to Jira and Confluence. Project Chronos uses ACLI for all Jira automation and operations.

## Installation

```bash
# Add Atlassian repository
wget -qO - https://packages.atlassian.com/api/gpg/key/public | sudo gpg --dearmor -o /usr/share/keyrings/atlassian-archive-keyring.gpg
echo "deb [signed-by=/usr/share/keyrings/atlassian-archive-keyring.gpg] https://packages.atlassian.com/debian/atlassian-cli stable main" | sudo tee /etc/apt/sources.list.d/atlassian-cli.list

# Install
sudo apt update
sudo apt install atlassian-cli
```

## Authentication

```bash
# Interactive login
acli jira auth login

# Credentials stored in: ~/.config/acli/config.toml
```

## Common Commands

### Work Items

```bash
# Create work item
acli jira workitem create --project CHRONOS --type Story --summary "Title" --description "Description"

# Edit work item
acli jira workitem edit --key CHRONOS-XXX --label "label1,label2"
acli jira workitem edit --key CHRONOS-XXX --parent CHRONOS-YYY  # Link to epic

# Transition status
acli jira workitem transition --key CHRONOS-XXX --status "In Progress"
acli jira workitem transition --key CHRONOS-XXX --status "Done"

# Add comment
acli jira workitem comment --key CHRONOS-XXX --body "Comment text"

# View work item
acli jira workitem view --key CHRONOS-XXX
```

### Sprints

```bash
# List sprints for a board
acli jira board list-sprints --id 1
acli jira board list-sprints --id 1 --state active,closed

# List work items in sprint
acli jira sprint list-workitems --sprint-id 123
```

### Projects

```bash
# List projects
acli jira project list

# Get project details
acli jira project get --key CHRONOS
```

## Output Formats

ACLI supports multiple output formats:

```bash
# JSON output
acli jira workitem view --key CHRONOS-XXX --json

# CSV output
acli jira board list-sprints --id 1 --csv

# Default table format
acli jira board list-sprints --id 1
```

## Limitations

### Features Not Supported

1. **Story Points**: Cannot set story points via `--points` flag
   - Workaround: Set manually in Jira UI or via custom field REST API

2. **Sprint Assignment**: Cannot assign work items to sprints directly
   - Workaround: Use REST API with `customfield_10020`

3. **Resolution Field**: Cannot set resolution during transition
   - Workaround: Set via REST API or manually

### Hybrid Approach

For unsupported features, use REST API alongside ACLI:

```python
# Example: Sprint assignment via REST API
import requests

url = f"{JIRA_URL}/rest/api/3/issue/{ticket_id}"
payload = {"fields": {"customfield_10020": sprint_id}}
requests.put(url, json=payload, auth=(email, token))
```

## Migration from Custom Jira CLI

### Command Mapping

| Custom CLI | ACLI Equivalent |
|------------|----------------|
| `jira create --summary "..."` | `acli jira workitem create --project CHRONOS --summary "..."` |
| `jira update CHRONOS-XXX --status Done` | `acli jira workitem transition --key CHRONOS-XXX --status Done` |
| `jira update CHRONOS-XXX --epic CHRONOS-YYY` | `acli jira workitem edit --key CHRONOS-XXX --parent CHRONOS-YYY` |
| `jira bulk-close CHRONOS-1,CHRONOS-2` | Loop with `acli jira workitem transition` |

### Key Differences

1. **Project Required**: ACLI requires `--project` flag for creation
2. **Key Flag**: Most commands need `--key` not positional arguments
3. **No Bulk Operations**: Must loop for bulk updates
4. **Explicit Transitions**: Use `transition` command, not `update --status`

## Shell Autocompletion

### Bash

```bash
# Add to ~/.bashrc
source <(acli completion bash)
```

### Zsh

```bash
# Add to ~/.zshrc
source <(acli completion zsh)
```

## Best Practices

1. **Use JSON for Parsing**: Parse ACLI output with `--json` flag
2. **Error Handling**: Check exit codes and stderr
3. **Rate Limiting**: Add delays between bulk operations
4. **Idempotency**: Check current state before updates

## Example Scripts

### Python Helper Function

```python
import subprocess

def run_acli(args: list[str]) -> dict:
    """Run ACLI command with proper error handling"""
    cmd = ["acli"] + args
    try:
        result = subprocess.run(cmd, capture_output=True, text=True, check=False)
        if result.returncode == 0:
            return {"success": True, "output": result.stdout}
        else:
            return {"success": False, "error": result.stderr}
    except Exception as e:
        return {"success": False, "error": str(e)}
```

### Create and Link Epic

```bash
#!/bin/bash
# Create epic
EPIC_KEY=$(acli jira workitem create \
  --project CHRONOS \
  --type Epic \
  --summary "Epic Title" \
  --description "Epic description" \
  | grep -oP 'CHRONOS-\d+')

# Create story under epic
STORY_KEY=$(acli jira workitem create \
  --project CHRONOS \
  --type Story \
  --summary "Story Title" \
  --parent "$EPIC_KEY" \
  | grep -oP 'CHRONOS-\d+')

echo "Created: $EPIC_KEY → $STORY_KEY"
```

## Troubleshooting

### Authentication Issues

```bash
# Re-authenticate
acli jira auth login

# Check config
cat ~/.config/acli/config.toml
```

### Permission Errors

- Ensure API token has correct permissions
- Check Jira project permissions
- Verify user is in correct Jira groups

### Command Not Found

```bash
# Check installation
which acli
acli --version

# Reinstall if needed
sudo apt install --reinstall atlassian-cli
```

## Resources

- Official Docs: https://developer.atlassian.com/cloud/cli/
- GitHub: https://github.com/atlassian/cli
- Migration Plan: `docs/operations/development/atlassian_cli_migration_plan.md`

---

**Last Updated**: 2025-12-07
**Maintainer**: Project Chronos Team
