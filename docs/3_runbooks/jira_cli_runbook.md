# 🎯 Jira CLI Runbook

**Version:** 1.0  
**Last Updated:** 2025-11-20  
**Owner:** Project Chronos Team

---

## 📋 Overview

The Jira CLI tool provides full CRUD operations for managing Jira tickets directly from the terminal, eliminating context switching and enabling automation workflows.

**Location:** `src/scripts/jira_cli.py`

---

## 🚀 Quick Start

### Installation

```bash
# Dependencies are in pyproject.toml
pip install -e '.[dev]'

# Verify installation
python src/scripts/jira_cli.py --help
```

### Authentication

Uses environment variables from `.env`:

```bash
JIRA_URL=https://automatonicai.atlassian.net
JIRA_EMAIL=your-email@domain.com
JIRA_API_TOKEN=your-api-token
JIRA_PROJECT_KEY=CHRONOS
```

---

## 📖 Commands Reference

### 1. Create Ticket

**Basic Usage:**

```bash
python src/scripts/jira_cli.py create \
  --summary "feat(component): Brief description" \
  --description "Detailed description" \
  --type "Story"
```

**Full Example:**

```bash
python src/scripts/jira_cli.py create \
  --summary "feat(database): Add PostgreSQL connection pooling" \
  --description "As a Developer, I want connection pooling, so that database performance improves under load.

## Changes Needed
* Implement SQLAlchemy connection pool
* Configure pool size and timeout
* Add connection retry logic

## Acceptance Criteria
- [ ] Pool size configurable via environment
- [ ] Connections reused efficiently
- [ ] Timeout handles gracefully

## Definition of Done
- [ ] Tests pass with pool enabled
- [ ] Performance benchmarks show improvement
- [ ] Documentation updated" \
  --type "Story" \
  --priority "High" \
  --labels "database,performance,infrastructure"
```

**Options:**

- `--summary` (required): Ticket title (use Conventional Commits format)
- `--description`: Detailed description (supports markdown)
- `--type`: Story, Task, Bug, Epic (default: Story)
- `--priority`: Low, Medium, High, Critical (default: Medium)
- `--labels`: Comma-separated labels
- `--points`: Story points (integer)
- `--sprint`: Sprint name (default: Backlog)

---

### 2. Read Ticket

```bash
# Basic read
python src/scripts/jira_cli.py read CHRONOS-143

# Displays:
# - Summary
# - Type & Status
# - Priority & Assignee
# - Created/Updated dates
# - Labels
# - Full description (formatted)
```

---

### 3. Update Ticket

**Update Description:**

```bash
python src/scripts/jira_cli.py update CHRONOS-143 \
  --description "Updated detailed description here"
```

**Update Status:**

```bash
python src/scripts/jira_cli.py update CHRONOS-143 \
  --status "In Progress"
```

**Update Multiple Fields:**

```bash
python src/scripts/jira_cli.py update CHRONOS-143 \
  --summary "Updated summary" \
  --priority "High" \
  --labels "urgent,blocker" \
  --points 8
```

**Available Statuses:**

- To Do
- In Progress
- In Review
- Done

---

### 4. List Tickets

**List all tickets:**

```bash
python src/scripts/jira_cli.py list
```

**Filter by status:**

```bash
python src/scripts/jira_cli.py list --status "To Do"
python src/scripts/jira_cli.py list --status "In Progress"
```

**Limit results:**

```bash
python src/scripts/jira_cli.py list --limit 10
```

---

### 5. Delete Ticket

```bash
python src/scripts/jira_cli.py delete CHRONOS-999
# Prompts for confirmation
```

---

### 6. Get Next Ticket ID

```bash
python src/scripts/jira_cli.py next-id
# Returns: CHRONOS-144
```

---

## 📝 Description Template

Use this structure for all tickets:

```markdown
As a [USER_ROLE], I want [FEATURE], so that [BENEFIT].

## Changes Needed

- Change 1
- Change 2
- Change 3

## Acceptance Criteria

- [ ] Criterion 1
- [ ] Criterion 2
- [ ] Criterion 3

## Definition of Done

- [ ] Tests pass
- [ ] Coverage >= 80%
- [ ] Documentation updated
- [ ] Code reviewed
- [ ] Deployed to staging

## Technical Notes (optional)

- Implementation detail 1
- Implementation detail 2
```

---

## 🔄 Common Workflows

### Workflow 1: Start New Feature

```bash
# 1. Create ticket
python src/scripts/jira_cli.py create \
  --summary "feat(api): Add user authentication endpoint" \
  --description "..." \
  --type "Story" \
  --labels "api,authentication"

# 2. Move to In Progress
python src/scripts/jira_cli.py update CHRONOS-XXX --status "In Progress"

# 3. Create feature branch
git checkout -b feature/CHRONOS-XXX-user-auth

# 4. Work on feature...

# 5. Create PR via GitHub CLI
gh pr create --base develop --title "feat(api): Add user authentication endpoint"

# 6. After merge, mark Done
python src/scripts/jira_cli.py update CHRONOS-XXX --status "Done"
```

---

### Workflow 2: Bug Fix

```bash
# 1. Create bug ticket
python src/scripts/jira_cli.py create \
  --summary "fix(database): Connection pool exhaustion" \
  --description "..." \
  --type "Bug" \
  --priority "Critical"

# 2. Follow feature workflow above
```

---

### Workflow 3: Retrospective Documentation

```bash
# Document work already completed
python src/scripts/jira_cli.py create \
  --summary "chore(devops): Completed GitHub CLI integration" \
  --description "..." \
  --type "Task"

# Immediately mark as done
python src/scripts/jira_cli.py update CHRONOS-XXX --status "Done"
```

---

## 🎨 Label Taxonomy

Follow the ontology from `docs/2_architecture/data_governance/ontology_hub.md`:

**Work Type:**

- `feature`, `bugfix`, `tech-debt`, `spike`, `documentation`, `testing`, `chore`

**Component:**

- `database`, `devops`, `ingestion`, `automation`, `gis`, `graph`, `analytics`, `frontend`

**Domain:**

- `backup`, `migration`, `time-series`, `vector`, `spatial`

**Data Source:**

- `fred`, `valet`, `census`, `statcan`, `edgar`

**Status:**

- `blocked`, `critical-path`, `blocked-external`, `nice-to-have`

**Usage Example:**

```bash
--labels "feature,database,migration,critical-path"
```

---

## ⚠️ Best Practices

### DO:

✅ Use Conventional Commits format in summaries  
✅ Include user story in description  
✅ Add acceptance criteria as checkboxes  
✅ Link related tickets in description  
✅ Update status as work progresses  
✅ Use labels consistently with ontology

### DON'T:

❌ Create tickets without descriptions  
❌ Use vague summaries like "Fix bug"  
❌ Skip acceptance criteria  
❌ Leave tickets in "To Do" after starting work  
❌ Create duplicate tickets

---

## 🔧 Troubleshooting

### "No module named 'rich'"

```bash
pip install rich click
```

### "Authentication failed"

Check `.env` file has correct credentials:

```bash
cat .env | grep JIRA
```

### "Ticket not found"

Verify ticket exists:

```bash
python src/scripts/jira_cli.py list
```

### "Status transition not available"

Check available transitions:

```bash
python src/scripts/jira_cli.py read CHRONOS-XXX
```

---

## 🚀 Advanced Usage

### Bulk Operations via CSV

Use `jira_ingest.py` for batch ticket creation:

```bash
# Create tickets from catalog
python src/scripts/jira_ingest.py

# CSV format (workflows/jira/catalog.csv):
# summary,description,issue_type,priority,labels,sprint,status
```

### Programmatic Updates

Use `jira_update.py` for automated updates:

```bash
python src/scripts/jira_update.py
```

---

## 📊 Integration with Other Tools

### GitHub CLI Integration

```bash
# Create ticket, then PR
TICKET=$(python src/scripts/jira_cli.py next-id)
git checkout -b feature/$TICKET-description
# ... work ...
gh pr create --title "$(python src/scripts/jira_cli.py read $TICKET | grep Summary)"
```

### Automation Hooks

Add to `.git/hooks/post-commit`:

```bash
#!/bin/bash
TICKET=$(git branch --show-current | grep -oP 'CHRONOS-\d+')
if [ -n "$TICKET" ]; then
  python src/scripts/jira_cli.py update $TICKET --status "In Progress"
fi
```

---

## 📚 Related Documentation

- `docs/5_decisions/adr_003_pragmatic_agile_jira_workflow.md`
- `docs/2_architecture/data_governance/ontology_hub.md`
- `docs/4_guides/git_workflow_guide.md`

---

## 🔄 Version History

| Version | Date       | Changes                  |
| ------- | ---------- | ------------------------ |
| 1.0     | 2025-11-20 | Initial runbook creation |

---

**Questions?** Open a ticket: `python src/scripts/jira_cli.py create --summary "docs(jira): Clarify runbook section X"`
