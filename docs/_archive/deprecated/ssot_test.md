# End-to-End SSOT Workflow Test Guide

**Jira Ticket**: CHRONOS-209  
**Created**: 2025-11-26  
**Purpose**: Verify the complete documentation SSOT workflow

---

## Overview

This guide demonstrates the complete workflow for managing documentation with Git as the Single Source of Truth, syncing to Confluence, and integrating with Jira.

## Workflow Steps

### 1. Create Jira Ticket

```bash
jira create \
  --summary "docs(feature): New documentation guide" \
  --description "Create guide for feature X" \
  --type "Task" \
  --labels "documentation"
```

### 2. Create Documentation Locally

Create markdown file in appropriate `docs/` subdirectory:

```bash
vim docs/4_guides/my_new_guide.md
```

### 3. Add to Confluence Mapping

Edit `docs/.confluence-mapping.json`:

```json
{
  "docs/4_guides/my_new_guide.md": {
    "page_id": "",
    "space": "PC",
    "last_synced": ""
  }
}
```

### 4. Sync to Confluence

```bash
python scripts/ops/sync_docs.py
```

The script will:
- Convert markdown to Confluence format
- Add read-only banner automatically
- Create/update the page
- Update mapping with Page ID

### 5. Verify in Confluence

- Check that page exists with banner
- Verify content matches Git version

### 6. Add Comments (Optional)

```bash
confluence add-comment "My New Guide" \
  --space PC \
  --text "This guide looks great!"
```

### 7. Commit Changes

```bash
git add docs/4_guides/my_new_guide.md docs/.confluence-mapping.json
git commit -m "docs(guides): Add new guide for feature X

Implements: CHRONOS-XXX"
git push origin feature/CHRONOS-XXX-new-guide
```

### 8. Create Pull Request

```bash
gh pr create \
  --title "docs(guides): Add new guide for feature X" \
  --body "Implements: CHRONOS-XXX"
```

### 9. Automated Checks

GitHub Actions will automatically:
- Lint markdown
- Check for broken links
- (After merge to main) Sync to Confluence

---

## CLI Reference

### Confluence Commands

```bash
# Create page
confluence create --title "Title" --space PC --body-file guide.md --banner

# Update page
confluence update "Title" --space PC --body-file guide.md --banner

# Read page
confluence read "Title" --space PC

# List pages
confluence list --space PC

# Add comment
confluence add-comment "Title" --space PC --text "Comment text"

# List comments
confluence list-comments "Title" --space PC
```

### Jira Commands

```bash
# Create ticket
jira create --summary "Summary" --description "Description" --type "Task"

# Update ticket
jira update CHRONOS-XXX --status "Done"

# Read ticket
jira read CHRONOS-XXX
```

---

## Best Practices

1. **Always create Jira ticket first** - Tracks all work
2. **Use conventional commits** - `docs(component): Description`
3. **Update mapping file** - Before syncing new docs
4. **Test locally** - Run sync script before pushing
5. **Link Jira tickets** - In commit messages and PRs

---

## Troubleshooting

### Sync fails with authentication error

Check `.env` file has correct credentials:
```bash
cat .env | grep CONFLUENCE
```

### Page not found in Confluence

Verify page title matches exactly (case-sensitive):
```bash
confluence list --space PC
```

### Mapping file not updating

Check file permissions and Git status:
```bash
ls -la docs/.confluence-mapping.json
git status
```

---

**Related Documentation**:
- [ADR 011: Documentation SSOT](../2_architecture/adrs/adr_011_documentation_ssot.md)
- [Confluence CLI Runbook](../3_runbooks/confluence_cli_runbook.md)
- [Jira CLI Runbook](../3_runbooks/jira_cli_runbook.md)
