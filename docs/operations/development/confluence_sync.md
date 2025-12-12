# Confluence Sync & Operations Guide

**Purpose:** Comprehensive guide to the GitHub-to-Confluence documentation sync system, CLI usage, and operational workflows.

**Last Updated:** 2025-12-12

> **📍 Navigation:** For CLI command reference, see [Confluence CLI Manual](../../reference/cli/confluence_cli.md).

---

## 📋 System Overview

This system maps **Project Chronos documentation** from local GitHub markdown files to Confluence pages, serving as the Single Source of Truth (SSOT).

**Key Features:**
- **Auto-Sync:** `scripts/ops/sync_docs.py` pushes changes from GitHub to Confluence.
- **Bulk Sync:** `scripts/ops/bulk_sync_confluence.py` handles recursive sync and hierarchy.
- **Smart Linking:** Automatically converts relative markdown links (`[Guide](../guide.md)`) to Confluence Smart Links.
- **Secret Protection:** Files with sensitive credentials are strictly excluded.
- **Read-Only:** Confluence pages are marked "read-only" to prevent divergence.

### Architecture

```
GitHub Markdown Source  →  docs/.confluence-mapping.json  →  Confluence API  →  Confluence Page
(SSOT)                     (Control File)                    (Sync Script)      (Read-Only Mirror)
```

**Components:**
- **Scripts:** `scripts/ops/sync_docs.py`, `scripts/ops/bulk_sync_confluence.py`
- **Mapping:** `docs/.confluence-mapping.json`
- **Space:** `PC` (Project Chronos)

---

## 🚀 Automated Bulk Sync (Recommended)

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

---

## 🛠️ CLI Operations (Manual)

For ad-hoc management, use the `confluence` CLI. See [Confluence CLI Manual](../../reference/cli/confluence_cli.md) for full command reference.

**Common Commands:**

```bash
# Update a page
confluence update "Page Title" --space PC --body-file updated_content.md

# Read a page
confluence read "Page Title" --space PC
```

---

## 🔄 Daily Sync Workflow

### 1. Documenting Work (The "Happy Path")

1.  **Write/Edit Local Markdown:**
    ```bash
    vim docs/runbooks/new_guide.md
    ```

2.  **Commit to GitHub:**
    ```bash
    git add .
    git commit -m "docs: Add new guide"
    git push
    ```

3.  **Run Sync Script:**
    ```bash
    source .venv/bin/activate
    python3 scripts/ops/sync_docs.py
    ```

4.  **Verify:** Check Confluence for the new update.

### 2. Adding New Files to Sync

1.  **Add to Mapping:** Edit `docs/.confluence-mapping.json` OR run schema rebuilder:
    ```bash
    python3 scripts/ops/rebuild_mapping.py
    ```
2.  **Run Sync:** Calling the script will generaete the `page_id`.
3.  **Commit Mapping:** `git commit docs/.confluence-mapping.json`

---

## 🔐 Handling Secrets

**CRITICAL: Never sync files with actual credentials!**

1.  **Keep it Local:** Do not add files with secrets (e.g., `*.secrets.md`) to the mapping.
2.  **Sanitize:** Create a public version with placeholders if needed:
    - **Bad:** `db_password: "super_secret"`
    - **Good:** `db_password: "[PASSWORD_FROM_KEEPASSXC]"`
3.  **Audit:** The sync script does NOT auto-scan for secrets; manual vigilance is required.

---

## 🚨 Troubleshooting

### "Page Not Found" or "Parent page not found"
- **Cause:** First run for a new file or missing hierarchy.
- **Fix:** Verify parent page exists in Confluence. Check for typos in parent title (case-sensitive).

### "Failed to Update Page" / Authentication Errors
- **Cause:** Expired credentials or network issue.
- **Fix:** Check `.env` vars `CONFLUENCE_API_TOKEN` and `CONFLUENCE_EMAIL`. Note that Atlassian tokens can be revoked.

### "Manual Edits Lost"
- **Cause:** You edited Confluence directly.
- **Fix:** **Always edit in GitHub.** Confluence is a mirror.

---

## 📚 Related Documentation

- [Confluence CLI Manual](../../reference/cli/confluence_cli.md)
- [Sync Script](file:///home/prometheus/coding/finance/project-chronos/scripts/ops/sync_docs.py)

**Version:** 2.1.0
**Consolidated from:** confluence_comprehensive_sync_guide.md, confluence_cli_runbook.md, confluence_bulk_sync.md
