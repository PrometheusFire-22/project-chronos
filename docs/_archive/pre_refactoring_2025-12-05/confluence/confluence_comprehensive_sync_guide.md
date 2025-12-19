# Confluence Comprehensive Documentation Sync Guide

**Last Updated:** 2025-12-01
**Status:** ✅ Production
**Audience:** Human operators & LLM assistants

---

## Overview

This guide documents the comprehensive Confluence sync system implemented on 2025-12-01, which maps **all Project Chronos documentation** to Confluence while protecting files containing secrets.

**What This System Provides:**
- **Single Source of Truth (SSOT):** Local markdown files in GitHub → Auto-synced to Confluence
- **Comprehensive Coverage:** 57 pages across all documentation categories
- **Secret Protection:** Files with actual credentials never synced to Confluence
- **Read-Only Confluence:** All synced pages have banners preventing direct edits
- **Selective Sync:** Full control over which files sync and when

---

## System Architecture

### Data Flow

```
┌─────────────────────────────────────────────────────────┐
│         Local Markdown Files (GitHub Source)            │
│              /home/prometheus/.../docs/                 │
│                                                          │
│  ├── 0_project_vision_and_strategy/                     │
│  ├── 1_platform_concepts/                               │
│  ├── 2_architecture/                                    │
│  ├── 3_runbooks/                                        │
│  ├── 4_guides/                                          │
│  ├── 5_troubleshooting/                                 │
│  └── session_notes/                                     │
└─────────────────┬───────────────────────────────────────┘
                  │
                  │ python3 scripts/ops/sync_docs.py
                  ↓
┌─────────────────────────────────────────────────────────┐
│        .confluence-mapping.json (Control File)          │
│                                                          │
│  {                                                       │
│    "docs/path/to/file.md": {                            │
│      "page_id": "1234567",                              │
│      "space": "PC",                                     │
│      "title": "Page Title",                             │
│      "last_synced": "2025-12-01T12:00:00Z"              │
│    }                                                     │
│  }                                                       │
└─────────────────┬───────────────────────────────────────┘
                  │
                  │ Atlassian Confluence API
                  ↓
┌─────────────────────────────────────────────────────────┐
│           Confluence Space (PC)                         │
│      https://automatonicai.atlassian.net/wiki           │
│                                                          │
│  📋 57 Total Pages (as of 2025-12-01)                   │
│  - 11 Protected (pre-existing, some with secrets)       │
│  - 46 Newly synced (comprehensive coverage)             │
│                                                          │
│  All pages have read-only banner:                       │
│  "⚠️ This page is auto-synced from GitHub.              │
│      Do not edit directly in Confluence."               │
└─────────────────────────────────────────────────────────┘
```

---

## Comprehensive Sync Results (2025-12-01)

### Summary Statistics

| Metric | Count |
|--------|-------|
| **Total Confluence Pages** | 57 |
| **Protected Pages (Untouched)** | 11 |
| **New Pages Created** | 46 |
| **Files Excluded (Archives)** | 21 |
| **Files Excluded (Secrets)** | 2 |
| **Files Excluded (Templates)** | 4 |

### Pages by Category

**Architecture Decision Records (10):**
- ADR 002: Project Management Stack
- ADR 003: Pragmatic Agile Jira Workflow
- ADR 004: Git Workflow and Branching Model
- ADR 005: Focus Enforcer Protocol
- ADR 006: CRM Selection
- ADR 007: Jira-First Workflow
- ADR 008: Backup Architecture (PostgreSQL 3-2-1)
- ADR 009: Database Backup Strategy (REVISED)
- ADR 012: Frontend Stack Architecture (Next.js/FastAPI)
- ADR 013: Geospatial Data Ingestion Strategy

**Runbooks & Operational Guides (10):**
- Complete Workflow: Jira + Confluence + Git + GitHub
- Confluence CLI Runbook
- Confluence Daily Sync - Cron Setup
- Jira CLI Runbook
- pgBackRest Backup & Restore Runbook
- Valet Data Ingestion Runbook
- Alembic Migration Setup Guide
- GIS Data Processing Workflow
- Git Workflow Guide: From Feature to Production
- 2025-11-17 Post Mortem: Data Persistence Failure

**Platform Concepts (7):**
- System Architecture
- Documentation Structure
- Layer Structure
- Orchestration Architecture
- Project Structure
- Resilient Project Workflow
- Documentation & Style Guide

**Strategy & Vision (7):**
- Consolidated Architectural Deep Dive
- The Phoenix Plan
- LLM Context Transfer Protocol
- 2025-11-15 Investor Pitch Script
- Conversation Navigator
- Sprint 4 Completion Summary
- SSOT Documentation Structure

**Session Notes (3):**
- CHRONOS-213: Quick Handoff - 95% Complete
- Sprint 7 Phase 1 Complete: pgBackRest + S3 Backup System
- Session Handoff: Sprint 6 Completion & Sprint 7 Planning

**Data Governance & Design (9):**
- Abstract Geospatial Views
- PostGIS Fundamentals Cheat Sheet
- RICE Framework for Insight Verticals
- Asset Catalog Guide
- Ontology Hub: The Language of Project Chronos
- Docker Fix (Antigravity Dev Container)
- LLM Onboarding Guide
- Operations Quick Reference Card
- Project Chronos Documentation (Root README)

### Protected Pages (Never Re-synced)

These pages exist in Confluence and contain **actual secrets**. They are permanently excluded from automated syncs:

| Page ID | File Path | Reason |
|---------|-----------|--------|
| 7897136 | `docs/4_guides/secrets_management_guide.md` | Contains actual AWS keys, DB passwords |
| 7012471 | `docs/3_runbooks/keepassxc_unified_workflow.md` | Contains KeePassXC master password hints |
| 6160386 | `docs/2_architecture/adrs/adr_011_documentation_ssot.md` | Pre-existing, stable |
| 6160414 | `docs/4_guides/ssot_workflow_test.md` | Pre-existing, stable |
| 6225935 | `docs/4_guides/ssot_automation_walkthrough.md` | Pre-existing, stable |
| 7045123 | `docs/session_notes/2025-11-27_AWS_CLI_SSO_Setup.md` | Pre-existing, stable |
| 7045146 | `docs/session_notes/2025-11-27_CHRONOS-213_Lightsail_Setup_COMPLETE.md` | Pre-existing, stable |
| 7208971 | `docs/session_notes/2025-11-27_SESSION_SUMMARY.md` | Pre-existing, stable |
| 7897116 | `docs/session_notes/2025-11-27_Sprint7_Execution_Plan.md` | Pre-existing, stable |
| 7766060 | `docs/session_notes/2025-11-30_AWS_Training_Belt_Progression.md` | Pre-existing, stable |
| 7012570 | `docs/2_architecture/adrs/adr_012_frontend_stack_architecture.md` | Pre-existing, stable |

### Files Permanently Excluded (Never Synced)

**Local-Only Files with Secrets:**
- `docs/session_notes/2025-11-30_KeePassXC_and_Sync_Workflow.md`
- `docs/session_notes/2025-11-30_Session_Complete_Summary.md`

**Archive Files (21):**
- `docs/_archive/CI_FIXES_SUMMARY.md`
- `docs/_archive/CI_QUALITY_FIX.md`
- `docs/_archive/DATABASE_QUERIES_GUIDE.md`
- `docs/_archive/EXECUTION_GUIDE.md`
- `docs/_archive/FX_RATES_METHODOLOGY.md`
- `docs/_archive/SCHEMA_REFERENCE.md`
- `docs/_archive/USER_GUIDE.md`
- `docs/_archive/timescaledb_business_logic_2025-11-05.md`
- `docs/_archive/context_files/*` (5 files)
- `docs/_archive/dev_logs/*` (1 file)
- `docs/_archive/TO_REFACTOR/*` (1 file)

**Template Files (4):**
- `docs/templates/confluence_page_template.md`
- `docs/templates/git_commit_template.md`
- `docs/templates/github_pr_template.md`
- `docs/templates/jira_ticket_template.md`

**Other Excluded:**
- `docs/.secrets-template.md`
- `docs/UPDATEME_README.md`

---

## How to Use the Fully-Mapped Documentation System

### Daily Workflow: Updating Documentation

**When you update a markdown file:**

1. **Edit the local markdown file** in your editor:
   ```bash
   vim docs/3_runbooks/jira_cli_runbook.md
   # Make your changes
   ```

2. **Commit to GitHub** (local source of truth):
   ```bash
   git add docs/3_runbooks/jira_cli_runbook.md
   git commit -m "docs: Update Jira CLI runbook with new examples"
   git push
   ```

3. **Sync to Confluence** (read-only mirror):
   ```bash
   source ..venv/bin/activate
   python3 scripts/ops/sync_docs.py
   ```

4. **Verify in Confluence:**
   - Go to https://automatonicai.atlassian.net/wiki
   - Find your updated page
   - Confirm changes are reflected

**That's it!** Your changes flow from GitHub → Confluence automatically.

---

### Adding a New Document to the Sync System

**Scenario:** You create a new file `docs/3_runbooks/new_feature_runbook.md`

**Steps:**

1. **Create the markdown file:**
   ```bash
   vim docs/3_runbooks/new_feature_runbook.md
   # Write your content with a clear title on line 1: "# New Feature Runbook"
   ```

2. **Add to `.confluence-mapping.json`:**
   ```bash
   # Open the mapping file
   vim docs/.confluence-mapping.json
   ```

   Add a new entry (no `page_id` yet):
   ```json
   {
     "docs/3_runbooks/new_feature_runbook.md": {
       "space": "PC",
       "title": "New Feature Runbook"
     }
   }
   ```

3. **Run sync to create Confluence page:**
   ```bash
   source ..venv/bin/activate
   python3 scripts/ops/sync_docs.py
   ```

4. **Check the mapping file** - it will now have a `page_id`:
   ```json
   {
     "docs/3_runbooks/new_feature_runbook.md": {
       "space": "PC",
       "title": "New Feature Runbook",
       "page_id": "7012999",
       "last_synced": "2025-12-01T12:34:56Z"
     }
   }
   ```

5. **Commit the updated mapping:**
   ```bash
   git add docs/.confluence-mapping.json
   git commit -m "docs: Add new feature runbook to Confluence mapping"
   git push
   ```

---

### Handling Files with Secrets

**CRITICAL: Never sync files with actual credentials to Confluence!**

**If a file contains secrets:**

1. **Keep it local-only** (don't add to `.confluence-mapping.json`)

2. **Ensure it's in `.gitignore`:**
   ```gitignore
   # Already in your .gitignore:
   .secrets_tmp/
   *.secrets.md
   *_SECRETS_*.md
   ```

3. **Or create a sanitized version:**
   ```bash
   # Original with secrets (local only)
   docs/session_notes/2025-12-01_setup_with_credentials.md

   # Sanitized version (safe to sync)
   docs/session_notes/2025-12-01_setup_guide.md
   ```

   In the sanitized version, use placeholders:
   ```markdown
   postgresql://chronos:[PASSWORD_FROM_KEEPASSXC]@16.52.210.100:5432/chronos
   ```

**Files Currently Excluded:**
- `docs/session_notes/2025-11-30_KeePassXC_and_Sync_Workflow.md` (has actual master password)
- `docs/session_notes/2025-11-30_Session_Complete_Summary.md` (has actual DB passwords)

These files are **never** in `.confluence-mapping.json` and will never sync.

---

### Managing Emojis and Manual Confluence Edits

**The Emoji Question:**

If you manually add emojis or favicons in Confluence, they will be **overwritten** the next time you sync that file.

**Two Approaches:**

**Option A: Add Emojis to Local Markdown (Recommended)**

Emojis in markdown will sync to Confluence automatically:

```markdown
# 🎯 Jira CLI Runbook

This runbook explains how to use the Jira CLI...
```

When you run `sync_docs.py`, the emoji appears in Confluence title: "🎯 Jira CLI Runbook"

**Advantages:**
- Single source of truth (GitHub)
- Emojis persist across syncs
- No manual work needed

**Option B: Add Emojis Manually in Confluence**

1. Go to Confluence page
2. Edit the page title to add emoji: "🎯 Jira CLI Runbook"
3. **Important:** Remove that file from `.confluence-mapping.json` to prevent overwrites

**Disadvantages:**
- Must maintain list of "don't sync" files
- Divergence between GitHub and Confluence
- Risk of accidental overwrites

**Recommendation:** Use **Option A** for consistency.

---

## LLM Assistant Instructions

### For Future Claude Code Sessions

**When a user asks you to update documentation:**

1. **Check if the file is in `.confluence-mapping.json`:**
   ```bash
   grep "path/to/file.md" docs/.confluence-mapping.json
   ```

2. **If mapped, edit the local file:**
   - Use the `Edit` or `Write` tool to update the markdown
   - Commit changes to Git
   - Run `sync_docs.py` to push to Confluence

3. **If NOT mapped, ask the user:**
   > "This file isn't currently synced to Confluence. Would you like me to:
   > 1. Add it to the mapping and sync it?
   > 2. Keep it local-only?"

4. **Check for secrets before syncing:**
   - Search for patterns: `password`, `api_key`, `secret`, `postgresql://.*:.*@`
   - If found, verify they're placeholders (e.g., `[PASSWORD]`, `<SECRET>`)
   - If actual credentials, **DO NOT SYNC** to Confluence

5. **After syncing, always verify:**
   ```bash
   # Check that page_id was added to mapping
   grep -A 3 "path/to/file.md" docs/.confluence-mapping.json
   ```

### Automated Sync Script Location

**Script:** `scripts/ops/sync_docs.py`
**Mapping File:** `docs/.confluence-mapping.json`
**Confluence Space:** `PC` (Project Chronos)

**Key Functions:**
- `load_mapping()` - Reads `.confluence-mapping.json`
- `sync_file(filepath, metadata, mapping)` - Syncs one file
- `save_mapping(mapping)` - Updates `.confluence-mapping.json` with page IDs

---

## Troubleshooting

### Issue: Sync Script Says "Page Not Found"

**Symptoms:**
```
Can't find 'Page Title' page on https://automatonicai.atlassian.net/wiki
Creating new page 'Page Title'...
```

**Cause:** The page doesn't exist in Confluence yet (first-time sync).

**Solution:** This is normal! The script will create the page automatically.

---

### Issue: "Failed to Update Page"

**Symptoms:**
```
Error: Failed to update page ID 1234567
```

**Possible Causes:**
1. **Confluence API credentials expired** - Check environment variables
2. **Page was deleted in Confluence** - Remove from mapping and re-sync
3. **Network timeout** - Retry the sync

**Solution:**
```bash
# Re-authenticate if needed
# Then retry
python3 scripts/ops/sync_docs.py
```

---

### Issue: Local File Has Secrets, But I Want to Sync It

**Solution:** Create a sanitized version.

**Example:**

**Original (local only):**
```markdown
<!-- docs/session_notes/2025-12-01_aws_setup.md -->
# AWS Setup

Database: postgresql://chronos:MySecretPassword123@16.52.210.100:5432/chronos
API Key: AKIAIOSFODNN7EXAMPLE
```

**Sanitized (safe to sync):**
```markdown
<!-- docs/session_notes/2025-12-01_aws_setup_guide.md -->
# AWS Setup Guide

Database: postgresql://chronos:[PASSWORD_FROM_KEEPASSXC]@16.52.210.100:5432/chronos
API Key: [AWS_ACCESS_KEY_FROM_KEEPASSXC]
```

Add only the sanitized version to `.confluence-mapping.json`.

---

### Issue: Mapping File Got Corrupted

**Symptoms:**
```
Error: Invalid JSON in .confluence-mapping.json
```

**Solution:**

1. **Restore from Git history:**
   ```bash
   git checkout HEAD -- docs/.confluence-mapping.json
   ```

2. **Or restore from backup:**
   ```bash
   # The sync script creates backups
   cp docs/.confluence-mapping.json.backup docs/.confluence-mapping.json
   ```

3. **Verify JSON syntax:**
   ```bash
   python3 -m json.tool docs/.confluence-mapping.json
   ```

---

## Security Best Practices

### ✅ DO:

1. **Keep secrets in local files only** (excluded from `.confluence-mapping.json`)
2. **Use placeholders in synced docs:** `[PASSWORD]`, `<API_KEY>`, `[REDACTED]`
3. **Review diffs before syncing** to ensure no secrets leaked in
4. **Commit `.confluence-mapping.json`** to Git (it only has page IDs, safe)
5. **Use the read-only banner** to prevent direct Confluence edits

### ❌ DON'T:

1. **Don't sync files with actual credentials** to Confluence
2. **Don't edit synced pages directly in Confluence** (changes will be overwritten)
3. **Don't commit secret files to GitHub** (they're in `.gitignore`)
4. **Don't remove the read-only banner** from synced pages
5. **Don't manually update page IDs** in `.confluence-mapping.json` (let script do it)

---

## File Structure Reference

```
project-chronos/
├── docs/
│   ├── .confluence-mapping.json          ← Control file (57 pages tracked)
│   ├── 0_project_vision_and_strategy/    ← Vision docs (7 synced)
│   ├── 1_platform_concepts/              ← Platform docs (7 synced)
│   ├── 2_architecture/                   ← ADRs + design (15 synced)
│   │   ├── adrs/                         ← Architecture Decision Records
│   │   ├── analytical_design/            ← PostGIS, geospatial abstractions
│   │   └── data_governance/              ← Ontology, asset catalog
│   ├── 3_runbooks/                       ← Operational runbooks (6 synced)
│   ├── 4_guides/                         ← How-to guides (6 synced)
│   ├── 5_troubleshooting/                ← Post-mortems (1 synced)
│   ├── session_notes/                    ← Session documentation (8 synced)
│   ├── templates/                        ← Templates (NOT synced)
│   ├── _archive/                         ← Old docs (NOT synced)
│   ├── DOCKER_FIX.md                     ← Synced
│   ├── LLM_ONBOARDING_GUIDE.md           ← Synced
│   ├── OPERATIONS_QUICK_REFERENCE.md     ← Synced
│   └── README.md                         ← Synced (root documentation index)
└── scripts/
    └── ops/
        └── sync_docs.py                  ← Sync script
```

---

## Confluence Space Organization

**Space Key:** `PC` (Project Chronos)
**URL:** https://automatonicai.atlassian.net/wiki/spaces/PC

**Suggested Page Hierarchy** (can organize manually in Confluence):

```
Project Chronos Documentation (Root)
├── 📚 Architecture
│   ├── ADR 002: Project Management Stack
│   ├── ADR 003: Pragmatic Agile Jira Workflow
│   ├── ADR 004: Git Workflow
│   ├── ADR 005: Focus Enforcer Protocol
│   ├── ADR 006: CRM Selection
│   ├── ADR 007: Jira-First Workflow
│   ├── ADR 008: Backup Architecture
│   ├── ADR 009: Backup Strategy
│   ├── ADR 011: Documentation SSOT
│   ├── ADR 012: Frontend Stack Architecture
│   └── ADR 013: Geospatial Ingestion
├── 🔧 Runbooks
│   ├── Complete Workflow: Jira + Confluence + Git
│   ├── Confluence CLI Runbook
│   ├── Jira CLI Runbook
│   ├── pgBackRest Backup & Restore
│   └── Valet Data Ingestion
├── 📖 Guides
│   ├── Git Workflow Guide
│   ├── GIS Data Processing
│   ├── Alembic Migration Setup
│   └── Secrets Management (🔒 Contains secrets)
├── 🏛️ Platform Concepts
│   ├── System Architecture
│   ├── Documentation Structure
│   ├── Layer Structure
│   └── Project Structure
├── 🎯 Strategy & Vision
│   ├── Architectural Deep Dive
│   ├── Phoenix Plan
│   └── LLM Context Transfer Protocol
└── 📝 Session Notes
    ├── Sprint 6 Completion
    ├── Sprint 7 Phase 1 Complete
    └── AWS Training Belt Progression
```

---

## Maintenance

### Weekly Tasks

**Every Friday:**

1. **Review unmapped docs:**
   ```bash
   find docs -name "*.md" | while read f; do
     grep -q "$f" docs/.confluence-mapping.json || echo "Not mapped: $f"
   done
   ```

2. **Verify sync health:**
   ```bash
   # Check last sync times
   python3 -c "
   import json
   with open('docs/.confluence-mapping.json') as f:
       m = json.load(f)
   for path, meta in m.items():
       if 'last_synced' in meta:
           print(f'{meta[\"last_synced\"]}: {path}')
   "
   ```

3. **Clean up stale pages** (pages in Confluence but not in mapping)

### Monthly Tasks

**First of each month:**

1. **Audit for secrets** in synced files:
   ```bash
   # Check all mapped files for potential secrets
   for file in $(jq -r 'keys[]' docs/.confluence-mapping.json); do
     echo "Checking: $file"
     grep -iE "(password|secret|api[_-]?key|token)" "$file" || true
   done
   ```

2. **Review `.gitignore`** to ensure secret files are protected

3. **Test sync script** in dry-run mode (if implemented)

---

## Metrics & Monitoring

### Key Metrics

**As of 2025-12-01:**

| Metric | Value |
|--------|-------|
| Total Markdown Files | 80 |
| Synced to Confluence | 57 (71.25%) |
| Protected (Secrets) | 13 (16.25%) |
| Archived (Excluded) | 21 (26.25%) |
| Templates (Excluded) | 4 (5%) |

**Sync Coverage by Category:**

| Category | Total Files | Synced | Coverage |
|----------|-------------|--------|----------|
| ADRs | 12 | 11 | 91.7% |
| Runbooks | 7 | 6 | 85.7% |
| Guides | 9 | 6 | 66.7% |
| Session Notes | 11 | 8 | 72.7% |
| Platform Concepts | 7 | 7 | 100% |
| Vision & Strategy | 7 | 7 | 100% |

---

## Change Log

| Date | Change | By |
|------|--------|-------|
| 2025-12-01 | Initial comprehensive sync of 46 new files | Claude Code |
| 2025-12-01 | Created this guide | Claude Code |
| 2025-11-30 | Established protected files list (11 pages with secrets) | Claude Code |
| 2025-11-27 | Initial Confluence mapping system created | Claude Code |

---

## Related Documentation

- `docs/2_architecture/adrs/adr_011_documentation_ssot.md` - SSOT strategy and rationale
- `docs/3_runbooks/confluence_cli_runbook.md` - Confluence CLI operations
- `docs/3_runbooks/confluence_daily_sync_cron.md` - Automated daily sync setup
- `docs/4_guides/ssot_workflow_test.md` - End-to-end testing guide
- `docs/4_guides/secrets_management_guide.md` - Secrets inventory (🔒 Contains actual secrets)

---

## Quick Reference Commands

```bash
# Sync all mapped docs to Confluence
source ..venv/bin/activate && python3 scripts/ops/sync_docs.py

# List all mapped files
jq -r 'keys[]' docs/.confluence-mapping.json

# Count total synced pages
jq '. | length' docs/.confluence-mapping.json

# Find files NOT in mapping
find docs -name "*.md" -not -path "*/\.*" | while read f; do
  grep -q "$f" docs/.confluence-mapping.json || echo "$f"
done

# Check for potential secrets in a file
grep -iE "(password|secret|api[_-]?key)" docs/path/to/file.md

# Validate mapping JSON syntax
python3 -m json.tool docs/.confluence-mapping.json > /dev/null && echo "Valid JSON"

# View last sync times
jq -r 'to_entries[] | "\(.value.last_synced // "NEVER") - \(.key)"' docs/.confluence-mapping.json | sort
```

---

## Support

**For issues or questions:**

1. **Check this guide** for common scenarios
2. **Review the troubleshooting section** above
3. **Check Git history** for `.confluence-mapping.json` changes
4. **Create a Jira ticket** with label: `confluence-sync`

**Script Location:** `scripts/ops/sync_docs.py`
**Mapping File:** `docs/.confluence-mapping.json`
**Confluence Space:** https://automatonicai.atlassian.net/wiki/spaces/PC

---

**End of Guide**
