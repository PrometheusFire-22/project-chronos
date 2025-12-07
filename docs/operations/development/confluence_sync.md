# Confluence Sync & Operations Guide

**Purpose:** Comprehensive guide to the GitHub-to-Confluence documentation sync system, CLI usage, and operational workflows.

**Last Updated:** 2025-12-05

---

## 📋 System Overview

This system maps **Project Chronos documentation** from local GitHub markdown files to Confluence pages, serving as the Single Source of Truth (SSOT).

**Key Features:**
- **Auto-Sync:** `scripts/ops/sync_docs.py` pushes changes from GitHub to Confluence.
- **Smart Linking:** Automatically converts relative markdown links (`[Guide](../guide.md)`) to Confluence Smart Links.
- **Secret Protection:** Files with sensitive credentials are strictly excluded.
- **Read-Only:** Confluence pages are marked "read-only" to prevent divergence.
- **Coverage:** Maps Project Vision, Architecture, Runbooks, and Guides.

### Architecture

```
GitHub Markdown Source  →  docs/.confluence-mapping.json  →  Confluence API  →  Confluence Page
(SSOT)                     (Control File)                    (Sync Script)      (Read-Only Mirror)
```

**Components:**
- **Script:** `scripts/ops/sync_docs.py`
- **Mapping:** `docs/.confluence-mapping.json`
- **Space:** `PC` (Project Chronos)

---

## 🛠️ CLI Operations (Manual)

The `confluence` CLI tool allows ad-hoc management of pages.

**Location:** `src/chronos/cli/confluence_cli.py`

### 1. Create Page

```bash
confluence create \
  --title "Sprint 4 Summary" \
  --space PC \
  --body-file SPRINT4_SUMMARY.md \
  --labels "sprint-summary,documentation" \
  --jira-ticket "CHRONOS-147"
```

### 2. Update Page

```bash
confluence update "Page Title" \
  --space PC \
  --body-file updated_content.md
```

### 3. Read Page

```bash
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

1.  **Add to Mapping:** Edit `docs/.confluence-mapping.json`:
    ```json
    {
      "docs/runbooks/new_guide.md": {
        "space": "PC",
        "title": "New Guide Title"
      }
    }
    ```
    **OR** run schema rebuilder:
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
3.  **Audit:** The sync script does NOT auto-scan for secrets; manual vigilance is required before adding to mapping.

---

## 🚨 Troubleshooting

### "Page Not Found"
- **Cause:** First run for a new file.
- **Fix:** Allow the script to create it.

### "Failed to Update Page"
- **Cause:** Expired credentials or network issue.
- **Fix:** Check `.env` vars `CONFLUENCE_API_TOKEN` and `CONFLUENCE_EMAIL`.

### "Manual Edits Lost"
- **Cause:** You edited Confluence directly.
- **Fix:** **Always edit in GitHub.** Confluence is a mirror.

---

## 📚 Related Documentation

- [Confluence CLI Source](file:///home/prometheus/coding/finance/project-chronos/src/chronos/cli/confluence_cli.py)
- [Sync Script](file:///home/prometheus/coding/finance/project-chronos/scripts/ops/sync_docs.py)

**Version:** 2.0.0
**Consolidated from:** confluence_comprehensive_sync_guide.md, confluence_cli_runbook.md
