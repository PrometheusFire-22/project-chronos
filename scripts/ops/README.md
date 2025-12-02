# Operations Scripts

Operational automation scripts for Project Chronos.

## Available Scripts

### `sync_docs.py`
**Purpose:** Sync local markdown documentation to Confluence

**Usage:**
```bash
source .venv/bin/activate
python3 scripts/ops/sync_docs.py
```

**What it does:**
- Converts markdown files to Confluence storage format
- Syncs content to existing Confluence pages
- Updates `.confluence-mapping.json` with page IDs
- Adds "Read Only" banner to auto-generated pages

**When to run:**
- After updating documentation locally
- After creating new docs
- Before sharing docs with team

**Documentation:** `docs/3_runbooks/confluence_comprehensive_sync_guide.md`

---

### `organize_confluence_hierarchy.py` ⭐ NEW
**Purpose:** Organize Confluence pages into hierarchical folder structure

**Usage:**
```bash
source .venv/bin/activate

# Preview changes (recommended first)
python3 scripts/ops/organize_confluence_hierarchy.py --dry-run

# Execute reorganization
python3 scripts/ops/organize_confluence_hierarchy.py
```

**What it does:**
- Creates parent category pages with semantic emojis
- Moves existing pages under appropriate categories
- Matches local `docs/` folder structure exactly
- Improves Confluence navigation significantly

**When to run:**
- After sync_docs.py adds many new pages
- When Confluence navigation becomes messy
- After restructuring local docs folder
- Monthly maintenance

**Features:**
- 📂 Semantic emojis for visual navigation
- 🤖 Fully automated (no manual clicking!)
- 🎯 Pattern-based categorization
- 📊 Handles 50+ pages effortlessly

**Documentation:** `docs/3_runbooks/confluence_hierarchy_management.md`

---

## Typical Workflow

```bash
# 1. Activate virtual environment
source .venv/bin/activate

# 2. Sync documentation content
python3 scripts/ops/sync_docs.py

# 3. Organize hierarchy (if new pages added)
python3 scripts/ops/organize_confluence_hierarchy.py --dry-run
python3 scripts/ops/organize_confluence_hierarchy.py

# 4. View results
# Open: https://automatonicai.atlassian.net/wiki/spaces/PC/overview
```

## Future Automation (Planned)

**Combined sync + organize:**
```bash
# TODO: Add --organize flag to sync_docs.py
python3 scripts/ops/sync_docs.py --organize
```

**Cron automation:**
```bash
# TODO: Weekly hierarchy cleanup
0 2 * * 1 cd ~/project-chronos && python3 scripts/ops/organize_confluence_hierarchy.py
```

---

## Requirements

- Python 3.11+
- Virtual environment activated (`.venv`)
- Environment variables configured (`.env`):
  - `CONFLUENCE_URL` (or `JIRA_URL`)
  - `CONFLUENCE_EMAIL` (or `JIRA_EMAIL`)
  - `CONFLUENCE_API_TOKEN` (or `JIRA_API_TOKEN`)

**Check configuration:**
```bash
# Verify environment variables are set
source .venv/bin/activate
python3 -c "import os; from dotenv import load_dotenv; load_dotenv(); print(os.getenv('CONFLUENCE_URL'))"
```

---

## Troubleshooting

### "Failed to initialize Confluence client"

**Fix:**
```bash
# Check .env file exists
cat .env | grep CONFLUENCE

# Regenerate API token if needed (see KeePassXC)
```

### "No module named 'atlassian'"

**Fix:**
```bash
source .venv/bin/activate
pip install -r requirements.txt
```

### Rate Limiting

**Symptoms:** Many "Failed to move" errors

**Fix:**
- Wait 5-10 minutes
- Re-run script (will skip already-moved pages)
- Confluence API has rate limits (100 requests/minute)

---

**Last Updated:** 2025-12-01
