# Confluence Bulk Synchronization Guide

**Purpose:** Document the procedures for syncing local documentation to Confluence in bulk, ensuring proper hierarchy and organization.

**Tools:** `scripts/ops/bulk_sync_confluence.py`, `confluence` CLI

---

## 📋 Prerequisites

Ensure the following environment variables are set (usually in `.env`):

```bash
export CONFLUENCE_URL="https://your-domain.atlassian.net"
export CONFLUENCE_EMAIL="your-email@example.com"
export CONFLUENCE_API_TOKEN="your-api-token"
```

## 🚀 Automated Bulk Sync

We have a Python script that handles the bulk synchronization of the `docs/` directory. This script:
1.  Creates necessary parent pages (Architecture, Operations, Guides, Reference).
2.  Syncs all markdown files.
3.  Maintains the `.confluence-mapping.json` file.

**Usage:**

```bash
# Activate virtual environment
source .venv/bin/activate

# Run the bulk sync script
python3 scripts/ops/bulk_sync_confluence.py
```

**What to Expect:**
- The script will output the status of each file (Created, Updated, Skipped, Error).
- It will verify the existence of the "📚 Documentation" root page or create it.
- It will recursively process the `docs/` directory.

## 🛠 Manual Hierarchy Management

You can also use the `confluence` CLI to manually organize pages or move them if needed.

### Moving a Page

To move a page under a new parent:

```bash
# usage: confluence update PAGE_ID --parent "New Parent Title" --space PC

confluence update 12345678 --parent "Operations" --space PC
```

### Creating a Page with a Parent

When creating a new single page, you can specify the parent immediately:

```bash
confluence create \
  --title "New Runbook" \
  --body-file docs/operations/new_runbook.md \
  --space PC \
  --parent "Operations"
```

## 🔍 Troubleshooting

### "Parent page not found"
If the script or CLI complains about a missing parent page:
1.  Verify the parent page exists in Confluence.
2.  Check for typos in the parent title (case-sensitive).
3.  Ensure you are using the correct Space key.

### Authentication Errors
- Verify your API token is valid (Atlassian tokens can be revoked).
- Check `CONFLUENCE_EMAIL` matches the token creator.

## 📄 Reference

- [Confluence CLI Manual](../../reference/cli/confluence_cli.md)
- [Project Chronos Documentation Structure](../../1_platform_concepts/documentation_structure.md)
