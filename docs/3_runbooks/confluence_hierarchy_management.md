# Confluence Hierarchy Management Runbook

**Status:** ✅ Active
**Last Updated:** 2025-12-01
**Script:** `scripts/ops/organize_confluence_hierarchy.py`

---

## Overview

This runbook documents the automated Confluence page hierarchy management system that keeps your Confluence space organized to match your local `docs/` folder structure.

**Benefits:**
- 📂 **Organized Navigation:** Pages grouped into logical categories with semantic emojis
- 🎯 **Matches Local Structure:** Confluence mirrors your local docs folder exactly
- 🤖 **Fully Automated:** One command reorganizes all pages
- 📊 **Scalable:** Handles 50+ pages effortlessly

---

## Current Hierarchy Structure

```
📘 Project Chronos Documentation (ROOT)
├── 📂 0. Vision & Strategy
│   └── 📁 Outreach & Communications
├── 📂 1. Platform Concepts
├── 📂 2. Architecture
│   ├── 📁 Architecture Decision Records (ADRs)
│   ├── 📁 Analytical Design
│   └── 📁 Data Governance
├── 📂 3. Runbooks (Operations)
├── 📂 4. Guides (How-To)
├── 📂 6. Troubleshooting
├── 📂 Session Notes (Chronological)
└── 📄 Quick References
```

**Total:** 13 parent pages organizing 58+ child pages

---

## How It Works

### Automatic Page Placement

The script uses **file path pattern matching** to determine where each page belongs:

| Local Path | Confluence Parent | Example |
|------------|-------------------|---------|
| `docs/0_project_vision_and_strategy/` | 📂 0. Vision & Strategy | Vision docs |
| `docs/2_architecture/adrs/` | 📁 Architecture Decision Records | ADR files |
| `docs/3_runbooks/` | 📂 3. Runbooks (Operations) | Runbooks |
| `docs/session_notes/` | 📂 Session Notes (Chronological) | Session logs |
| `docs/README.md` | 📄 Quick References | Top-level docs |

### Semantic Emojis

Emojis are automatically added to page titles to improve visual navigation:

- 📂 = Major section (numbered categories)
- 📁 = Subsection (nested categories)
- 📄 = Reference page
- 📚 = Guide/documentation
- 🎯 = Tool/CLI runbook
- 🔄 = Workflow
- ⚡ = Quick reference

---

## Usage

### Reorganize Entire Hierarchy

**When to run:**
- After adding many new pages
- After restructuring local docs folder
- When Confluence navigation becomes messy
- Quarterly maintenance

**Command:**
```bash
# Activate virtual environment
source .venv/bin/activate

# Preview changes (dry-run)
python3 scripts/ops/organize_confluence_hierarchy.py --dry-run

# Execute reorganization
python3 scripts/ops/organize_confluence_hierarchy.py
```

**Output:**
```
📂 Organizing Confluence Page Hierarchy

Step 1: Create/Find Root Page
  ✅ Found existing: 📘 Project Chronos Documentation (ID: 1234567)

Step 2: Create/Find Top-Level Categories
  ✅ Found existing: 📂 0. Vision & Strategy (ID: 2345678)
  ✨ Created: 📂 6. Troubleshooting (ID: 3456789)

Step 3: Organize Existing Pages
  ✅ Moved: Security Hardening Phase 2A → 📂 3. Runbooks (Operations)
  ✅ Moved: ADR-012: Frontend Stack → 📁 Architecture Decision Records
  ...

📊 Summary
Total pages:        58
Pages organized:    57
Pages skipped:       1
Parent categories:  13

✅ Hierarchy organization complete!
```

### Automatic Tree Sync

**Question:** Can I automatically sync my local `docs/` tree to Confluence?

**Answer:** YES! You already have this via `scripts/ops/sync_docs.py`.

**How it works together:**
1. **Content sync:** `sync_docs.py` pushes markdown content to Confluence
2. **Hierarchy sync:** `organize_confluence_hierarchy.py` organizes pages into folders

**Recommended workflow:**
```bash
# Step 1: Sync new/updated content
python3 scripts/ops/sync_docs.py

# Step 2: Organize hierarchy (if new pages added)
python3 scripts/ops/organize_confluence_hierarchy.py --dry-run
python3 scripts/ops/organize_confluence_hierarchy.py
```

**Future automation (TODO):**
- Add `--organize` flag to `sync_docs.py` to run both steps automatically
- Create cron job for weekly hierarchy cleanup

---

## Configuration

### Hierarchy Definition

Hierarchy is defined in `scripts/ops/organize_confluence_hierarchy.py`:

```python
HIERARCHY = {
    "root": {
        "title": "📘 Project Chronos Documentation",
        "description": "Complete documentation for Project Chronos platform",
        "children": ["0_vision", "1_concepts", "2_architecture", ...],
    },
    "3_runbooks": {
        "title": "📂 3. Runbooks (Operations)",
        "description": "Operational procedures and step-by-step guides",
        "pattern": "docs/3_runbooks/",  # ← File path pattern
    },
    # ... more categories
}
```

### Adding New Categories

**To add a new category:**

1. Edit `organize_confluence_hierarchy.py`
2. Add new entry to `HIERARCHY` dict:
   ```python
   "8_examples": {
       "title": "📂 8. Examples",
       "description": "Code examples and snippets",
       "pattern": "docs/8_examples/",
   }
   ```
3. Add to parent's children list:
   ```python
   "root": {
       "children": [..., "8_examples"],
   }
   ```
4. Run reorganization script

### Customizing Emojis

**To change category emoji:**

Simply edit the `"title"` field in hierarchy definition:

```python
"3_runbooks": {
    "title": "🔧 3. Runbooks (Operations)",  # Changed from 📂 to 🔧
    ...
}
```

---

## Integration with Existing Tools

### Works With

✅ **`sync_docs.py`** - Content synchronization (pages created/updated)
✅ **`confluence_cli.py`** - Manual page CRUD operations
✅ **`.confluence-mapping.json`** - Tracks all synced pages

### Workflow Integration

**Standard workflow:**
```bash
# 1. Write docs locally
vim docs/3_runbooks/new_runbook.md

# 2. Sync to Confluence
python3 scripts/ops/sync_docs.py

# 3. Organize (if needed)
python3 scripts/ops/organize_confluence_hierarchy.py
```

**One-command future (TODO):**
```bash
# Proposed: Combined sync + organize
python3 scripts/ops/sync_docs.py --organize
```

---

## Troubleshooting

### Issue: Page Not Organized

**Symptoms:** Page remains at root level after reorganization

**Cause:** No matching pattern in hierarchy definition

**Solution:**
1. Check file path: `docs/.confluence-mapping.json`
2. Add pattern to hierarchy definition
3. Re-run script

**Example:**
```python
# If page is at docs/new_category/file.md
"new_category": {
    "title": "📂 New Category",
    "pattern": "docs/new_category/",
}
```

### Issue: "Failed to move" Error

**Symptoms:** Script shows `❌ Failed to move [page]`

**Causes:**
- Page locked by another user
- Confluence API rate limiting
- Invalid parent ID

**Solutions:**
```bash
# Check specific error in logs
grep "Failed to move" /tmp/confluence-hierarchy.log

# Re-run after a few minutes (rate limiting)
python3 scripts/ops/organize_confluence_hierarchy.py

# Use dry-run to diagnose
python3 scripts/ops/organize_confluence_hierarchy.py --dry-run
```

### Issue: Duplicate Parent Pages

**Symptoms:** Multiple pages with same category name

**Cause:** Script created new parent instead of finding existing

**Solution:**
```bash
# Manually delete duplicate via Confluence UI
# Re-run script (will find existing page)
python3 scripts/ops/organize_confluence_hierarchy.py
```

---

## Maintenance

### Weekly

- [ ] Run dry-run to check for disorganized pages
- [ ] Review new pages added to Confluence

```bash
python3 scripts/ops/organize_confluence_hierarchy.py --dry-run | grep "Would move"
```

### Monthly

- [ ] Full reorganization to clean up any manual changes
- [ ] Review hierarchy definition for new categories needed

```bash
python3 scripts/ops/organize_confluence_hierarchy.py
```

### Quarterly

- [ ] Review emoji choices (update if needed)
- [ ] Archive old session notes (move to Archive category)
- [ ] Optimize hierarchy depth (max 3 levels recommended)

---

## Future Enhancements (TODO)

### Planned Features

1. **Automatic Sync Integration**
   - Add `--organize` flag to `sync_docs.py`
   - Run hierarchy organization after content sync

2. **Enhanced Emoji Support**
   - Add emoji to individual page titles (not just categories)
   - Configurable emoji mapping (e.g., security pages get 🔒)

3. **Archive Management**
   - Automatically move old session notes to Archive category
   - Age-based categorization (>90 days → Archive)

4. **Cron Automation**
   - Weekly hierarchy cleanup cron job
   - Email report of changes made

5. **Confluence CLI Integration**
   - Add `organize` subcommand to `confluence_cli.py`
   - `python3 src/chronos/cli/confluence_cli.py organize`

---

## Related Documentation

- `docs/3_runbooks/confluence_cli_runbook.md` - Manual page management
- `docs/3_runbooks/confluence_comprehensive_sync_guide.md` - Content sync system
- `scripts/ops/sync_docs.py` - Content synchronization script
- `scripts/ops/organize_confluence_hierarchy.py` - This script

---

## Change Log

| Date | Change | Notes |
|------|--------|-------|
| 2025-12-01 | Initial hierarchy system created | 13 categories, 58 pages organized |
| 2025-12-01 | Added semantic emojis to all categories | Improves visual navigation |
| 2025-12-01 | Automated via Python script | Fully reproducible |

---

**🤖 Generated with Claude Code (Anthropic)**
**Last Updated:** 2025-12-01
**Status:** ✅ Production - Use Regularly
