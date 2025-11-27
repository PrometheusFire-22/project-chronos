# ADR 014: Documentation Single Source of Truth (SSOT) Strategy

**Status**: Proposed  
**Date**: 2025-11-25  
**Decision Makers**: Geoff Bevans, Claude Code  
**Tags**: `documentation`, `ssot`, `confluence`, `git`, `markdown`

---

## Context

Project Chronos documentation currently exists in multiple locations:
1. `/workspace/docs/` - Git-versioned markdown files
2. Confluence - Web-based wiki pages
3. Artifacts - AI-generated temporary files

This creates several problems:
- **Duplication**: Same content in multiple places
- **Drift**: Versions get out of sync
- **Confusion**: Unclear which is authoritative
- **Maintenance Burden**: Must update multiple locations

As the project scales and prepares for production, we need a clear documentation strategy that:
- Establishes a single source of truth
- Enables version control and code review
- Supports collaboration and discoverability
- Minimizes duplication and drift

---

## Decision

We will implement a **Docs-as-Code** strategy with Git as the Single Source of Truth.

### Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                   SSOT: /workspace/docs/                    │
│                  (Git-versioned Markdown)                   │
│                                                             │
│  - Version controlled                                       │
│  - Code review process                                      │
│  - Local editing                                            │
│  - CI/CD integration                                        │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       │ Auto-sync (CI/CD or manual)
                       ▼
┌─────────────────────────────────────────────────────────────┐
│              Publication Layer: Confluence                  │
│                  (Read-Only Mirror)                         │
│                                                             │
│  - Searchable                                               │
│  - Discoverable                                             │
│  - Stakeholder-friendly                                     │
│  - Comments/collaboration                                   │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│              Temporary: Artifacts Directory                 │
│                  (AI-Generated Drafts)                      │
│                                                             │
│  - Review and refine                                        │
│  - Move to /workspace/docs/ when finalized                  │
│  - Not permanent                                            │
└─────────────────────────────────────────────────────────────┘
```

---

## Implementation

### 1. Directory Structure

```
/workspace/docs/
├── README.md                          # Documentation index
├── 1_platform_concepts/
│   ├── overview.md
│   ├── style_guide.md
│   └── terminology.md
├── 2_architecture/
│   ├── system_architecture.md
│   ├── data_model.md
│   ├── adrs/                          # Architecture Decision Records
│   │   ├── README.md
│   │   ├── adr_001_timescaledb.md
│   │   ├── adr_002_postgis.md
│   │   └── ...
│   └── diagrams/
│       ├── system_overview.mmd
│       └── data_flow.mmd
├── 3_runbooks/
│   ├── backup_recovery_runbook.md
│   ├── deployment_runbook.md
│   ├── jira_cli_runbook.md
│   └── confluence_cli_runbook.md
├── 4_guides/
│   ├── developer_onboarding.md
│   ├── LLM_ONBOARDING_GUIDE.md
│   └── disaster_recovery_guide.md
└── 5_reference/
    ├── api_reference.md
    ├── cli_reference.md
    └── database_schema.md
```

**Note**: Deprecated `/docs/5_decisions/` → moved to `/docs/2_architecture/adrs/`

---

### 2. Workflow

#### Creating New Documentation

```bash
# 1. Create markdown file in appropriate directory
vim docs/3_runbooks/new_runbook.md

# 2. Commit to Git
git add docs/3_runbooks/new_runbook.md
git commit -m "docs(runbooks): Add new runbook for X"
git push origin main

# 3. Sync to Confluence (manual or automated)
confluence create \
  --title "New Runbook" \
  --space PC \
  --body-file docs/3_runbooks/new_runbook.md \
  --labels "runbook,documentation"
```

#### Updating Existing Documentation

```bash
# 1. Edit markdown file
vim docs/3_runbooks/existing_runbook.md

# 2. Commit changes
git add docs/3_runbooks/existing_runbook.md
git commit -m "docs(runbooks): Update existing runbook"
git push origin main

# 3. Update Confluence page
confluence update \
  --page-id 12345 \
  --body-file docs/3_runbooks/existing_runbook.md
```

#### AI-Generated Documentation

```bash
# 1. AI generates draft in artifacts directory
# /home/vscode/.gemini/antigravity/brain/.../draft.md

# 2. Review and refine draft

# 3. Move to appropriate docs/ directory
mv /path/to/artifact/draft.md docs/2_architecture/adrs/adr_015_new_decision.md

# 4. Commit to Git
git add docs/2_architecture/adrs/adr_015_new_decision.md
git commit -m "docs(adr): Add ADR 015 for new decision"
git push origin main

# 5. Publish to Confluence
confluence create --title "ADR 015" --body-file docs/2_architecture/adrs/adr_015_new_decision.md
```

---

### 3. Confluence Sync Strategy

**Phase 1 (Immediate)**: Manual Sync
- Use `confluence_cli.py` to manually publish/update
- Document sync process in runbook
- Track Confluence page IDs in Git

**Phase 2 (Future)**: Automated Sync
- GitHub Actions workflow on push to main
- Auto-publish changed markdown files to Confluence
- Use `markdown-confluence` or custom script

**Example GitHub Action** (Future):
```yaml
name: Sync Docs to Confluence

on:
  push:
    branches: [main]
    paths:
      - 'docs/**'

jobs:
  sync:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Sync to Confluence
        run: |
          for file in $(git diff --name-only HEAD~1 docs/); do
            python scripts/sync_to_confluence.py "$file"
          done
```

---

### 4. Metadata Tracking

Create `.confluence-mapping.json` to track page IDs:

```json
{
  "docs/2_architecture/adrs/adr_001_timescaledb.md": {
    "page_id": "12345",
    "space": "PC",
    "last_synced": "2025-11-25T10:00:00Z"
  },
  "docs/3_runbooks/backup_recovery_runbook.md": {
    "page_id": "67890",
    "space": "PC",
    "last_synced": "2025-11-25T11:00:00Z"
  }
}
```

---

## Rationale

### Why Git as SSOT?

1. **Version Control**: Full history of all changes
2. **Code Review**: Pull request workflow for documentation
3. **Branching**: Can work on documentation in feature branches
4. **Offline**: Can edit documentation without internet
5. **Tooling**: Standard Git tools (diff, blame, log)
6. **Backup**: Git is inherently distributed (every clone is a backup)
7. **Integration**: Works with CI/CD, linting, testing

### Why Confluence as Publication Layer?

1. **Discoverability**: Better search than Git
2. **Stakeholder-Friendly**: Non-technical users prefer web UI
3. **Collaboration**: Comments, @mentions, reactions
4. **Organization**: Spaces, labels, hierarchies
5. **Permissions**: Fine-grained access control
6. **Notifications**: Email alerts for changes

### Why Not Confluence as SSOT?

1. **No Version Control**: Limited history, no branching
2. **No Code Review**: Can't review changes before publish
3. **Vendor Lock-In**: Proprietary format
4. **Offline**: Requires internet connection
5. **Export**: Difficult to export and migrate
6. **Backup**: Must rely on Atlassian's backups

---

## Alternatives Considered

### Alternative 1: Confluence as SSOT

**Pros**:
- Simpler (one location)
- Better collaboration features
- Stakeholder-friendly

**Cons**:
- No version control
- Vendor lock-in
- Difficult to backup
- No code review

**Decision**: Rejected - Version control is critical

---

### Alternative 2: Separate Docs Repository

**Pros**:
- Cleaner separation
- Can have different permissions
- Easier to open-source

**Cons**:
- Another repository to manage
- Harder to keep in sync with code
- Duplication of CI/CD

**Decision**: Rejected - Keep docs with code (monorepo)

---

### Alternative 3: GitBook or Docusaurus

**Pros**:
- Beautiful documentation sites
- Version control built-in
- Search and navigation

**Cons**:
- Another tool to maintain
- Hosting costs
- Less familiar to stakeholders

**Decision**: Deferred - Consider for public documentation later

---

## Consequences

### Positive

1. **Single Source of Truth**: Clear authority (Git)
2. **Version Control**: Full history and branching
3. **Code Review**: Documentation quality improves
4. **Backup**: Git is distributed, inherently backed up
5. **Tooling**: Standard Git tools work
6. **Offline**: Can edit without internet

### Negative

1. **Sync Overhead**: Must sync to Confluence manually (initially)
2. **Two Locations**: Still have Git + Confluence (but clear roles)
3. **Learning Curve**: Stakeholders must learn markdown

### Risks

1. **Drift**: Confluence could drift from Git
   - *Mitigation*: Automate sync, make Confluence read-only
2. **Sync Failures**: Automated sync could fail
   - *Mitigation*: Monitoring, alerts, manual fallback

---

## Migration Plan

### Phase 1: Consolidate (Week 1)

1. **Audit Current Docs**:
   ```bash
   # Find all markdown files
   find /workspace -name "*.md" -type f
   
   # List Confluence pages
   confluence list --space PC
   ```

2. **Reorganize /workspace/docs/**:
   - Move ADRs from `5_decisions/` to `2_architecture/adrs/`
   - Consolidate duplicate files
   - Update internal links

3. **Create Mapping**:
   - Document which Confluence pages map to which markdown files
   - Create `.confluence-mapping.json`

---

### Phase 2: Sync (Week 2)

1. **Manual Sync**:
   - Update Confluence pages from Git
   - Add "Source: Git" notice to Confluence pages
   - Document sync process in runbook

2. **Test Workflow**:
   - Make change in Git
   - Sync to Confluence
   - Verify consistency

---

### Phase 3: Automate (Future)

1. **GitHub Actions**:
   - Set up automated sync on push
   - Add validation (markdown linting)
   - Add broken link checking

2. **Make Confluence Read-Only**:
   - Add banner: "This page is auto-generated from Git. Do not edit directly."
   - Restrict edit permissions
   - Direct users to Git for changes

---

## Verification

### Success Criteria

1. **SSOT Established**: All documentation in `/workspace/docs/`
2. **Confluence Synced**: All pages match Git content
3. **Mapping Documented**: `.confluence-mapping.json` complete
4. **Runbook Created**: Sync process documented
5. **Team Aligned**: Everyone knows Git is SSOT

### Testing Plan

1. **Create Test Document**:
   ```bash
   echo "# Test Document" > docs/test.md
   git add docs/test.md
   git commit -m "docs: Add test document"
   ```

2. **Sync to Confluence**:
   ```bash
   confluence create --title "Test Document" --body-file docs/test.md
   ```

3. **Verify Consistency**:
   - Check Confluence page matches markdown
   - Update markdown, re-sync, verify update

4. **Test Workflow**:
   - Make change in Git
   - Sync to Confluence
   - Verify change appears

---

## Future Enhancements

1. **Automated Sync**: GitHub Actions for auto-publish
2. **Bidirectional Sync**: Confluence comments → GitHub issues
3. **Public Docs**: Docusaurus site for public documentation
4. **Markdown Linting**: Enforce style guide
5. **Link Checking**: Validate internal and external links

---

## References

- [Docs as Code](https://www.writethedocs.org/guide/docs-as-code/)
- [Atlassian Confluence API](https://developer.atlassian.com/cloud/confluence/rest/v1/intro/)
- [GitHub Actions](https://docs.github.com/en/actions)
- [Markdown Best Practices](https://www.markdownguide.org/basic-syntax/)

---

**Approved By**: [Pending]  
**Implementation Date**: [Pending]
