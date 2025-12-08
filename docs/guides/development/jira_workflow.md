# Jira Workflow Guide

**Version:** 3.0.0
**Last Updated:** 2025-12-07
**CLI Tool:** Atlassian CLI (ACLI) - Official

---

## Overview

This guide provides workflow guidance for managing Jira tickets in Project Chronos using the official Atlassian CLI (ACLI), including epic/story/task hierarchy, sprint management, and automation scripts.

**Migration Note:** This guide has been updated for ACLI. See [ACLI Reference](../../reference/cli/atlassian_cli.md) for complete command documentation.

---

## Epic/Story/Task Hierarchy

### Structure

```
Epic (high-level initiative)
├── Story 1 (user-facing feature)
│   ├── Task 1 (implementation work)
│   ├── Task 2 (testing)
│   └── Task 3 (documentation)
├── Story 2 (another feature)
│   └── Task 4 (implementation)
└── Story 3 (final feature)
```

### When to Use Each Type

**Epic:**
- Large initiatives spanning multiple sprints
- 20+ story points
- Multiple related stories
- Examples: "AWS Infrastructure & Operations", "Google Workspace Integration"

**Story:**
- User-facing features or capabilities
- 3-13 story points
- Can be completed in 1-2 sprints
- Examples: "Lightsail PostgreSQL Setup", "Email Configuration"

**Task:**
- Implementation work, testing, documentation
- No story points (inherit from parent story)
- Completed within days
- Examples: "Configure PostgreSQL", "Write unit tests"

---

## Creating Tickets

### Create an Epic

```bash
acli jira workitem create \
  --project CHRONOS \
  --type Epic \
  --summary "Data Pipelines & Integration" \
  --description "Build data ingestion pipelines for EDGAR, Bank of England, and other financial data sources" \
  --label "data-pipelines,integration,backlog"
```

### Create a Story (Linked to Epic)

```bash
# Create the story
acli jira workitem create \
  --project CHRONOS \
  --type Story \
  --summary "EDGAR API Integration" \
  --description "Implement EDGAR API data ingestion" \
  --label "edgar,data-source"

# Link to epic (after creation)
acli jira workitem edit --key CHRONOS-XXX --parent CHRONOS-265

# Note: Story points must be set manually in Jira UI (ACLI limitation)
```

### Create a Task (Under Story)

```bash
acli jira workitem create \
  --project CHRONOS \
  --type Task \
  --summary "Design EDGAR data schema" \
  --label "edgar,schema" \
  --parent CHRONOS-XXX
```

---

## Epic Linking

### Link Story to Epic

```bash
# Link existing story to epic
acli jira workitem edit --key CHRONOS-248 --parent CHRONOS-255

# Bulk link multiple stories
for ticket in CHRONOS-109 CHRONOS-50 CHRONOS-26; do
  acli jira workitem edit --key $ticket --parent CHRONOS-265
done
```

### Verify Epic Links

```bash
# View epic details
acli jira workitem view --key CHRONOS-265

# List all stories in an epic (use Jira UI or JQL query)
```

---

## Sprint Management

### List Sprints

```bash
# List all sprints for board ID 1
acli jira board list-sprints --id 1

# List active sprints only
acli jira board list-sprints --id 1 --state active

# Use custom script
./scripts/ops/jira_list_sprints.py
```

### Assign Tickets to Sprint

**Note:** Sprint assignment requires REST API (ACLI doesn't support customfield_10020).

```bash
# Use labels for sprint tracking
acli jira workitem edit --key CHRONOS-248 --label "google,api,sprint-8"
```

---

## Bulk Operations

### Supersede Old Tickets

**Note:** ACLI doesn't have bulk-close. Loop through tickets individually.

```bash
# Bulk update script approach
for ticket in CHRONOS-175 CHRONOS-176 CHRONOS-180; do
  acli jira workitem edit --key $ticket --label "superseded"
  acli jira workitem transition --key $ticket --status "Done"
done
```

### Close Duplicates

```bash
acli jira workitem edit --key CHRONOS-220 --label "duplicate"
acli jira workitem transition --key CHRONOS-220 --status "Done"
# Note: Resolution must be set manually or via REST API
```

---

## Automation Scripts

**Note:** Historical automation scripts have been archived to `scripts/_archive/historical/`.

### Active Utility Script

**Script:** `scripts/ops/jira_list_sprints.py`

**Purpose:** List sprints for a board

**Usage:**
```bash
# List all sprints for board 1
python3 scripts/ops/jira_list_sprints.py

# List sprints for specific board
python3 scripts/ops/jira_list_sprints.py 2

# Filter by state
python3 scripts/ops/jira_list_sprints.py 1 active
```

---

## Resolutions

### Available Resolutions

- **Done:** Work completed successfully
- **Cancelled:** Work abandoned or no longer relevant
- **Superseded:** Work replaced by another ticket

### Setting Resolutions

**Note:** ACLI doesn't support resolution field directly. Use Jira UI or REST API.

```bash
# Transition to Done (resolution set in Jira UI)
acli jira workitem transition --key CHRONOS-248 --status "Done"

# Note: For resolution field, use Jira UI or REST API
```

---

## Labels

### Standard Labels

**By Sprint:**
- `sprint-7`, `sprint-8`, `sprint-9`

**By Epic:**
- `aws`, `infrastructure`, `google`, `integration`
- `data-pipelines`, `frontend`, `client-portal`
- `security`, `credentials`, `documentation`

**By Type:**
- `epic`, `backlog`
- `core:infrastructure:ops`, `data:pipelines`

### Adding Labels

```bash
# Single label
jira update CHRONOS-248 --labels "google,api,sprint-8"

# Multiple tickets
for ticket in CHRONOS-109 CHRONOS-50; do
  jira update $ticket --labels "data-pipelines,backlog"
done
```

---

## Best Practices

### 1. Epic Granularity
- **Good:** 8-24 story points per epic
- **Too broad:** "All Infrastructure" (100+ points)
- **Too narrow:** "Configure DKIM" (3 points)

### 2. Story Points
- **1-2 pts:** Simple tasks (< 1 day)
- **3-5 pts:** Standard stories (1-2 days)
- **8-13 pts:** Complex stories (3-5 days)
- **20+ pts:** Too large, split into multiple stories

### 3. Sprint Size
- **Target:** 20-30 story points per sprint
- **Duration:** 1-2 weeks
- **Velocity:** Track and adjust based on completion rate

### 4. Ticket Hygiene
- **Close duplicates** immediately
- **Supersede old tickets** when creating new ones
- **Link to epics** for organization
- **Use labels** for filtering and reporting

### 5. Documentation
- **Update descriptions** with links to related tickets
- **Document resolutions** (why was it superseded?)
- **Track time** for productivity analysis

---

## Common Workflows

### Workflow 1: Starting New Epic

```bash
# 1. Create epic
jira create \
  --summary "New Epic Name" \
  --description "Epic description" \
  --type "Epic" \
  --labels "epic-label,backlog"

# 2. Create stories under epic
jira create \
  --summary "Story 1" \
  --type "Story" \
  --points 8 \
  --labels "epic-label"

# 3. Link story to epic
jira update CHRONOS-XXX --epic CHRONOS-YYY

# 4. Create tasks under story
jira create \
  --summary "Task 1" \
  --type "Task" \
  --parent CHRONOS-XXX
```

### Workflow 2: Closing Old Work

```bash
# 1. Identify duplicates/superseded tickets
jira list --status "To Do" --limit 50

# 2. Bulk close superseded tickets
jira bulk-close CHRONOS-A,CHRONOS-B,CHRONOS-C \
  --reason "Superseded by CHRONOS-NEW" \
  --status "Done"

# 3. Verify closure
jira list --status "Done" --limit 20
```

### Workflow 3: Sprint Planning

```bash
# 1. List backlog tickets
jira list --status "To Do" --limit 30

# 2. Assign to sprint (via labels)
jira update CHRONOS-XXX --labels "sprint-9,priority-high"

# 3. Set story points
jira update CHRONOS-XXX --points 8

# 4. Verify sprint load
jira list --sprint 9
```

---

## Troubleshooting

### Epic Linking Fails

**Problem:** `jira update CHRONOS-XXX --epic CHRONOS-YYY` fails

**Solution:**
- Ensure epic exists: `jira read CHRONOS-YYY`
- Check ticket type (only Stories can link to Epics)
- Use Jira UI as fallback (drag-and-drop)

### Bulk Close Fails

**Problem:** Some tickets in bulk-close fail

**Solution:**
- Check ticket exists: `jira read CHRONOS-XXX`
- Verify status transition is valid
- Close tickets individually to see error messages

### Parent Link Fails

**Problem:** `--parent` flag doesn't work

**Solution:**
- Ensure parent ticket exists
- Check ticket type (Tasks can have parents, Epics cannot)
- Verify parent is not a Task (Tasks can't have Task children)

---

## Quick Reference

```bash
# Create epic
jira create --summary "Epic" --type "Epic" --labels "epic"

# Create story
jira create --summary "Story" --type "Story" --points 8

# Link story to epic
jira update STORY_ID --epic EPIC_ID

# Create task under story
jira create --summary "Task" --type "Task" --parent STORY_ID

# Bulk close
jira bulk-close ID1,ID2,ID3 --reason "Reason" --status "Done"

# List by sprint
jira list --sprint 8

# Update status
jira update ID --status "Done" --resolution "Done"
```

---

**For detailed CLI reference, see:** `docs/man/jira_cli.md`
