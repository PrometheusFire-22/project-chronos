# 🎯 Confluence CLI Runbook

**Version:** 1.0  
**Last Updated:** 2025-11-24  
**Owner:** Project Chronos Team

---

## 📋 Overview

The Confluence CLI tool provides full CRUD operations for managing Confluence pages directly from the terminal, with markdown-to-Confluence conversion and Jira integration.

**Location:** `src/chronos/cli/confluence_cli.py`

---

## 🚀 Quick Start

### Installation

```bash
# Dependencies in pyproject.toml
pip install -e '.[dev]'

# Verify installation
confluence --help
```

### Authentication

Uses environment variables from `.env`:

```bash
CONFLUENCE_URL=https://automatonicai.atlassian.net
CONFLUENCE_EMAIL=your-email@domain.com
CONFLUENCE_API_TOKEN=your-api-token
```

---

## 📖 Commands Reference

### 1. Create Page

**Basic Usage:**

```bash
confluence create \
  --title "Page Title" \
  --space PC \
  --body "Page content in markdown"
```

**From File:**

```bash
confluence create \
  --title "Database Migration Guide" \
  --space PC \
  --body-file docs/migration_guide.md
```

**Full Example:**

```bash
confluence create \
  --title "Sprint 4 Completion Summary" \
  --space PC \
  --body-file SPRINT4_SUMMARY.md \
  --labels "sprint-summary,documentation,sprint-4" \
  --jira-ticket "CHRONOS-147" \
  --parent "Sprint Summaries"
```

**Options:**
- `--title` (required): Page title
- `--space` (required): Confluence space key (e.g., PC)
- `--body`: Inline markdown content
- `--body-file`: Path to markdown file
- `--labels`: Comma-separated labels
- `--jira-ticket`: Link to Jira ticket (e.g., CHRONOS-123)
- `--parent`: Parent page title (for hierarchy)
- `--banner`: Add read-only banner (auto-generated from Git notice)

---

### 2. Read Page

```bash
# Read page details
confluence read "Page Title" --space PC

# Displays:
# - Title
# - Space
# - Version
# - Created/Updated dates
# - Labels
# - Full content (converted from Confluence storage format)
```

---

### 3. Update Page

**Update Content:**

```bash
confluence update "Page Title" \
  --space PC \
  --body "Updated content in markdown"
```

**Update from File:**

```bash
confluence update "Page Title" \
  --space PC \
  --body-file updated_content.md
```

**Update Title:**

```bash
confluence update "Old Title" \
  --space PC \
  --new-title "New Title"
```

**Update Labels:**

```bash
confluence update "Page Title" \
  --space PC \
  --labels "new-label,another-label"
```

**Options:**
- `--new-title`: Rename the page
- `--body`: New inline content
- `--body-file`: New content from file
- `--labels`: Replace all labels
- `--banner`: Add read-only banner (auto-generated from Git notice)

---

### 4. Add Comment

**Add comment to page:**

```bash
confluence add-comment "Page Title" \
  --space PC \
  --text "Great work on this documentation!"
```

**Options:**
- `--space` (required): Confluence space key
- `--text` (required): Comment text

---

### 5. List Comments

**List all comments on a page:**

```bash
confluence list-comments "Page Title" --space PC
```

Displays table with:
- Author name
- Comment date
- Comment text (truncated to 100 chars)

---

### 6. List Pages

**List all pages in space:**

```bash
confluence list --space PC
```

**Limit results:**

```bash
confluence list --space PC --limit 10
```

---

### 7. Delete Page

```bash
confluence delete "Page Title" --space PC
# Prompts for confirmation
```

---

## 📝 Markdown Support

The CLI automatically converts markdown to Confluence storage format (XHTML).

### Supported Markdown

```markdown
# Headers (H1-H6)
**Bold** and *italic*
[Links](https://example.com)
- Bullet lists
1. Numbered lists
> Blockquotes

\`\`\`python
# Code blocks with syntax highlighting
def example():
    return "Hello"
\`\`\`

| Tables | Are | Supported |
|--------|-----|-----------|
| Data   | 123 | ✅        |
```

### Unicode Emojis

Use Unicode emojis directly in markdown:

```markdown
✅ Complete
🚧 In Progress
📋 Documentation
🐛 Bug Fix
```

See `docs/templates/confluence_page_template.md` for full emoji reference.

---

## 🔄 Common Workflows

### Workflow 1: Document Completed Work

```bash
# 1. Write documentation in markdown
cat > sprint4_summary.md << 'EOF'
# Sprint 4 Completion Summary

**Status**: ✅ Complete

## Overview
Sprint 4 focused on...
EOF

# 2. Create Confluence page
confluence create \
  --title "Sprint 4 Completion Summary" \
  --space PC \
  --body-file sprint4_summary.md \
  --labels "sprint-summary,sprint-4" \
  --jira-ticket "CHRONOS-147"

# 3. Update Jira ticket with Confluence link
jira update CHRONOS-147 --status "Done"
```

---

### Workflow 2: Create Technical Documentation

```bash
# 1. Document technical implementation
confluence create \
  --title "Database Migration to TimescaleDB (CHRONOS-145)" \
  --space PC \
  --body-file docs/timescaledb_migration.md \
  --labels "documentation,database,technical" \
  --jira-ticket "CHRONOS-145" \
  --parent "Technical Documentation"
```

---

### Workflow 3: Update Existing Page

```bash
# 1. Read current content
confluence read "Page Title" --space PC > current.md

# 2. Edit content
vim current.md

# 3. Update page
confluence update "Page Title" \
  --space PC \
  --body-file current.md
```

---

## 🎨 Label Taxonomy

Follow the ontology from `docs/2_data_governance/ontology_hub.md`:

**Page Type:**
- `documentation`, `runbook`, `adr`, `sprint-summary`, `technical-doc`, `how-to`

**Component:**
- `database`, `devops`, `ingestion`, `cli`, `api`, `frontend`

**Status:**
- `draft`, `complete`, `deprecated`, `archived`

**Sprint:**
- `sprint-1`, `sprint-2`, `sprint-3`, etc.

**Usage Example:**
```bash
--labels "documentation,database,complete,sprint-4"
```

---

## ⚠️ Best Practices

### DO:

✅ Use descriptive page titles  
✅ Include status badges (✅ ⚠️ 🚧)  
✅ Link to related Jira tickets  
✅ Use consistent labels  
✅ Organize pages with parent hierarchy  
✅ Include "Last Updated" date

### DON'T:

❌ Create pages without content  
❌ Use vague titles like "Notes"  
❌ Skip labels  
❌ Forget to link Jira tickets  
❌ Create duplicate pages

---

## 🔧 Troubleshooting

### "Page already exists"

```bash
# Update instead of create
confluence update "Page Title" --space PC --body "New content"
```

### "Authentication failed"

Check `.env` file:
```bash
cat .env | grep CONFLUENCE
```

### "Page not found"

Verify page exists:
```bash
confluence list --space PC
```

### "Markdown not converting properly"

Check markdown syntax - Confluence has limitations:
- No nested code blocks
- Tables must have headers
- Some HTML tags not supported

---

## 🚀 Advanced Usage

### Batch Page Creation

Create multiple pages from a directory:

```bash
for file in docs/runbooks/*.md; do
  title=$(basename "$file" .md | tr '_' ' ')
  confluence create \
    --title "$title" \
    --space PC \
    --body-file "$file" \
    --labels "runbook,documentation" \
    --parent "Runbooks"
done
```

### Template-Based Creation

```bash
# Use template
cp docs/templates/confluence_page_template.md new_page.md
# Edit new_page.md
confluence create --title "New Page" --space PC --body-file new_page.md
```

---

## 📊 Integration with Other Tools

### Jira Integration

```bash
# Create page and link to Jira
TICKET="CHRONOS-167"
confluence create \
  --title "Jira CLI API Fix ($TICKET)" \
  --space PC \
  --body-file walkthrough.md \
  --jira-ticket "$TICKET" \
  --labels "bugfix,jira,api"

# Update Jira ticket
jira update $TICKET --status "Done"
```

### Git Workflow Integration

```bash
# After PR merge, document in Confluence
PR_NUM=$(gh pr view --json number -q .number)
confluence create \
  --title "PR #$PR_NUM: Feature Implementation" \
  --space PC \
  --body-file PR_SUMMARY.md \
  --labels "documentation,pr"
```

---

## 📚 Related Documentation

- `docs/templates/confluence_page_template.md` - Page structure guide
- `docs/runbooks/jira_cli_runbook.md` - Jira CLI reference
- `docs/4_guides/git_workflow_guide.md` - Git workflow

---

## 🔄 Version History

| Version | Date       | Changes                      |
|---------|------------|------------------------------|
| 1.0     | 2025-11-24 | Initial runbook creation     |

---

**Questions?** Test the CLI:

```bash
confluence --help
confluence list --space PC --limit 5
```
