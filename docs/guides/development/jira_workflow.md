# Jira Workflow Guide

**Version:** 2.0.0  
**Last Updated:** 2025-12-05

---

## Overview

This guide provides workflow guidance for managing Jira tickets in Project Chronos, including epic/story/task hierarchy, sprint management, and automation scripts.

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
jira create \
  --summary "Data Pipelines & Integration" \
  --description "Build data ingestion pipelines for EDGAR, Bank of England, and other financial data sources" \
  --type "Epic" \
  --labels "data-pipelines,integration,backlog"
```

### Create a Story (Linked to Epic)

```bash
# Create the story
jira create \
  --summary "EDGAR API Integration" \
  --description "Implement EDGAR API data ingestion" \
  --type "Story" \
  --labels "edgar,data-source" \
  --points 8

# Link to epic (after creation)
jira update CHRONOS-XXX --epic CHRONOS-265
```

### Create a Task (Under Story)

```bash
jira create \
  --summary "Design EDGAR data schema" \
  --type "Task" \
  --labels "edgar,schema" \
  --parent CHRONOS-XXX
```

---

## Epic Linking

### Link Story to Epic

```bash
# Link existing story to epic
jira update CHRONOS-248 --epic CHRONOS-255

# Bulk link multiple stories
for ticket in CHRONOS-109 CHRONOS-50 CHRONOS-26; do
  jira update $ticket --epic CHRONOS-265
done
```

### Verify Epic Links

```bash
# Read epic to see linked stories
jira read CHRONOS-265

# List all stories in an epic (use Jira UI)
```

---

## Sprint Management

### Assign Tickets to Sprint

```bash
# Use labels for sprint assignment
jira update CHRONOS-248 --labels "google,api,sprint-8"

# Or update multiple tickets
jira bulk-close CHRONOS-175,CHRONOS-176 \
  --reason "Superseded by CHRONOS-255" \
  --status "Done"
```

### Create Retroactive Sprints

1. **In Jira UI:**
   - Go to Project Settings → Sprints
   - Create sprint with historical dates
   - Assign tickets with `sprint-X` labels

2. **Filter tickets by sprint:**
```bash
jira list --sprint 7
jira list --sprint sprint-8
```

---

## Bulk Operations

### Supersede Old Tickets

```bash
jira bulk-close CHRONOS-175,CHRONOS-176,CHRONOS-180 \
  --reason "Superseded by CHRONOS-255 (Google Workspace Integration epic)" \
  --status "Done"
```

### Close Duplicates

```bash
jira bulk-close CHRONOS-220 \
  --reason "Duplicate of CHRONOS-50 (Apache AGE schema design)" \
  --status "Done"
```

---

## Automation Scripts

### Retroactive Organization

**Script:** `scripts/ops/organize_jira_retroactive.py`

**Purpose:** Create epic/story/task hierarchy from forensic git analysis

**Usage:**
```bash
# Set environment variables
export JIRA_URL="https://automatonicai.atlassian.net"
export JIRA_EMAIL="your-email@example.com"
export JIRA_API_TOKEN="your-token"
export JIRA_PROJECT_KEY="CHRONOS"

# Run script
python3 scripts/ops/organize_jira_retroactive.py
```

**What it does:**
- Creates epics for major work streams
- Creates stories under epics
- Creates tasks under stories
- Sets proper labels, points, and resolutions

---

### Backlog Cleanup

**Script:** `scripts/ops/cleanup_jira_backlog.py`

**Purpose:** Supersede duplicates and organize backlog

**Usage:**
```bash
# Same environment variables as above
python3 scripts/ops/cleanup_jira_backlog.py
```

**What it does:**
- Closes superseded infrastructure tickets
- Closes duplicate tickets
- Creates missing epics
- Links unorganized tickets to epics

---

## Resolutions

### Available Resolutions

- **Done:** Work completed successfully
- **Cancelled:** Work abandoned or no longer relevant
- **Superseded:** Work replaced by another ticket

### Setting Resolutions

```bash
# Mark as Done
jira update CHRONOS-248 --status "Done" --resolution "Done"

# Mark as Superseded
jira update CHRONOS-175 \
  --status "Done" \
  --resolution "Superseded" \
  --description "Superseded by CHRONOS-255"

# Mark as Cancelled
jira update CHRONOS-999 \
  --status "Done" \
  --resolution "Cancelled" \
  --description "No longer needed"
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
