# 🎯 Confluence Page Template

**Location:** `docs/templates/confluence_page_template.md`  
**Version:** 1.0  
**Last Updated:** 2025-11-24

---

## 📋 Standard Page Format

```markdown
# [Page Title]

**Date**: YYYY-MM-DD  
**Jira Ticket**: [CHRONOS-XXX](link)  
**Status**: 🚧 Draft | ✅ Complete | 📝 In Progress

---

## Overview

Brief description of what this page documents.

## [Main Content Sections]

### Section 1

Content here...

### Section 2

Content here...

## References

- Link 1
- Link 2

---

**Last Updated**: YYYY-MM-DD  
**Maintained By**: [Your Name]
```

---

## ✅ Page Types & Examples

### Type 1: Technical Documentation

**Use Case:** Document completed work, fixes, implementations

**Example:**

```markdown
# Database Migration to TimescaleDB (CHRONOS-145)

**Date**: 2025-11-20  
**Jira Ticket**: [CHRONOS-145](https://automatonicai.atlassian.net/browse/CHRONOS-145)  
**PR**: [#25](https://github.com/PrometheusFire-22/project-chronos/pull/25)  
**Status**: ✅ Complete

---

## Overview

Migrated PostgreSQL database to TimescaleDB for improved time-series performance.

## Changes Made

### Database Schema
- Added TimescaleDB extension
- Created hypertables for observations table
- Configured retention policies

### Performance Improvements
- Query time reduced from 2.5s to 0.3s
- Storage compression: 40% reduction
- Automatic data retention after 2 years

## Testing

✅ All integration tests pass  
✅ Performance benchmarks meet targets  
✅ Data integrity verified

## References

- [TimescaleDB Docs](https://docs.timescale.com/)
- [Migration Script](file:///.../migrations/001_timescaledb.sql)

---

**Completed**: 2025-11-20  
**Verified By**: Geoff Bevans
```

---

### Type 2: Sprint Summary

**Use Case:** Document sprint completion, retrospectives

**Example:**

```markdown
# Sprint 4 Completion Summary

**Sprint**: 4  
**Duration**: Nov 15-22, 2025  
**Status**: ✅ Complete

---

## Overview

Sprint 4 focused on project structure refactoring and configuration consolidation.

## Completed Tickets

### CHRONOS-147: Config Consolidation
- Moved alembic.ini to config/
- Consolidated pytest/coverage into pyproject.toml
- **Impact**: Single source of truth for configuration

### CHRONOS-148: Src Organization
- Created src/chronos/cli/ module
- Added console_scripts to pyproject.toml
- **Impact**: Installable CLI commands

## Metrics

- **Velocity**: 23 story points
- **Tickets Completed**: 6
- **PRs Merged**: 4
- **Code Coverage**: 9% (temporary, tests skipped)

## Retrospective

### What Went Well
- Clean separation of concerns
- Improved developer experience
- All CI checks passing

### What to Improve
- Re-enable skipped tests (CHRONOS-165, 166)
- Increase coverage back to 25%

## Next Sprint

Focus on test refactoring and analytics view fixtures.

---

**Completed**: 2025-11-22  
**Team**: Geoff Bevans + Claude Code
```

---

### Type 3: Decision Record (ADR)

**Use Case:** Document architectural decisions

**Example:**

```markdown
# ADR 004: Selecting PostgreSQL + TimescaleDB

**Date**: 2025-10-15  
**Status**: ✅ Accepted  
**Deciders**: Geoff Bevans

---

## Context

Need a database solution for storing 100M+ time-series observations with:
- Fast time-range queries
- Automatic data retention
- PostGIS compatibility for spatial data

## Decision

Use PostgreSQL 16 with TimescaleDB extension.

## Rationale

### Pros
- TimescaleDB optimized for time-series workloads
- Native PostgreSQL compatibility (no migration needed)
- Automatic partitioning and compression
- PostGIS integration for geospatial data
- Open source with commercial support

### Cons
- Additional extension dependency
- Learning curve for hypertable management
- Slightly more complex backup/restore

### Alternatives Considered

**InfluxDB**
- ❌ No PostGIS support
- ❌ Different query language (Flux)
- ✅ Better for pure time-series

**MongoDB**
- ❌ No native time-series optimization
- ❌ Weaker ACID guarantees
- ✅ Flexible schema

## Implementation

- Install TimescaleDB extension
- Convert observations table to hypertable
- Configure retention policies
- Update backup scripts

## References

- [TimescaleDB vs InfluxDB Benchmark](https://blog.timescale.com/...)
- [PostGIS + TimescaleDB Integration](https://docs.timescale.com/...)

---

**Decision Date**: 2025-10-15  
**Review Date**: 2026-04-15 (6 months)
```

---

### Type 4: Runbook / How-To Guide

**Use Case:** Operational procedures, troubleshooting guides

**Example:**

```markdown
# Database Backup & Restore Runbook

**Purpose**: Guide for backing up and restoring the Chronos database  
**Audience**: DevOps, Developers  
**Last Updated**: 2025-11-20

---

## Quick Reference

```bash
# Backup
./scripts/ops/backup_production.sh

# Restore
./scripts/ops/restore_production.sh backup_20251120.sql.gz
```

## Backup Procedure

### 1. Automated Daily Backups

Backups run automatically via cron:
```bash
0 2 * * * /path/to/backup_production.sh
```

### 2. Manual Backup

```bash
# Full database backup
pg_dump -h localhost -U prometheus -d chronos_db | gzip > backup.sql.gz

# Schema only
pg_dump -h localhost -U prometheus -d chronos_db --schema-only > schema.sql

# Data only
pg_dump -h localhost -U prometheus -d chronos_db --data-only > data.sql
```

## Restore Procedure

### Prerequisites
- Database must exist
- User must have CREATE privileges

### Steps

1. **Stop application**
   ```bash
   docker compose down app
   ```

2. **Drop existing database** (⚠️ DESTRUCTIVE)
   ```bash
   dropdb -h localhost -U prometheus chronos_db
   createdb -h localhost -U prometheus chronos_db
   ```

3. **Restore backup**
   ```bash
   gunzip < backup.sql.gz | psql -h localhost -U prometheus -d chronos_db
   ```

4. **Verify restoration**
   ```bash
   psql -h localhost -U prometheus -d chronos_db -c "SELECT COUNT(*) FROM metadata.data_sources;"
   ```

5. **Restart application**
   ```bash
   docker compose up -d app
   ```

## Troubleshooting

### Error: "role does not exist"
```bash
createuser -h localhost -U postgres prometheus
```

### Error: "database already exists"
```bash
dropdb -h localhost -U prometheus chronos_db
```

## References

- [PostgreSQL Backup Docs](https://www.postgresql.org/docs/current/backup.html)
- [Backup Scripts](file:///.../scripts/ops/)

---

**Maintained By**: DevOps Team  
**On-Call**: Geoff Bevans
```

---

## 🎨 Page Structure Elements

### Headers

```markdown
# Main Title (H1) - Page title only
## Major Sections (H2)
### Subsections (H3)
#### Details (H4) - Use sparingly
```

### Status Badges

Use emojis for visual status indicators:

- 🚧 **Draft** - Work in progress
- ✅ **Complete** - Finished and verified
- 📝 **In Progress** - Actively being worked on
- ⚠️ **Deprecated** - No longer recommended
- 🔒 **Archived** - Historical reference only

### Code Blocks

```markdown
\`\`\`python
def example():
    return "Use language-specific syntax highlighting"
\`\`\`

\`\`\`bash
# Shell commands
docker compose up -d
\`\`\`
```

### Tables

```markdown
| Column 1 | Column 2 | Column 3 |
|----------|----------|----------|
| Data 1   | Data 2   | Data 3   |
```

### Alerts/Callouts

```markdown
> **Note**: Important information

> **Warning**: Potential issues

> **Tip**: Helpful suggestions
```

### Links

```markdown
# Internal Confluence links
[Page Title](https://automatonicai.atlassian.net/wiki/spaces/PC/pages/123456)

# Jira tickets
[CHRONOS-123](https://automatonicai.atlassian.net/browse/CHRONOS-123)

# GitHub
[PR #25](https://github.com/PrometheusFire-22/project-chronos/pull/25)

# File links (use file:/// for local files in documentation)
[Script](file:///path/to/script.sh)
```

---

## 🏷️ Page Metadata

### Labels

Use consistent labels for organization:

**Work Type:**
- `documentation`, `runbook`, `adr`, `sprint-summary`, `technical-doc`

**Component:**
- `database`, `devops`, `ingestion`, `cli`, `api`, `frontend`

**Status:**
- `draft`, `complete`, `deprecated`, `archived`

**Sprint:**
- `sprint-1`, `sprint-2`, `sprint-3`, etc.

**Example:**
```bash
confluence create --labels "documentation,database,complete,sprint-4"
```

---

## 📝 Unicode Emoji Reference

Enhance pages with Unicode emojis (no custom upload needed):

### Status & Progress
- ✅ Complete
- 🚧 In Progress
- ⏳ Pending
- ❌ Failed
- ⚠️ Warning
- 🔒 Locked/Archived

### Work Types
- 🎯 Goal/Objective
- 📋 Task/Checklist
- 🐛 Bug
- ✨ Feature
- 🔧 Fix
- 📝 Documentation

### Technical
- 🗄️ Database
- 🐳 Docker
- 🔗 API
- 📊 Analytics
- 🔍 Search
- 🌐 Web

### Data & Metrics
- 📈 Growth/Increase
- 📉 Decline/Decrease
- 💰 Financial
- 📅 Calendar/Date
- ⏱️ Time/Performance

### Communication
- 💡 Idea/Tip
- 🎓 Learning
- 🤝 Collaboration
- 📢 Announcement
- ❓ Question

---

## 🚀 Creating Pages via CLI

### Basic Creation

```bash
confluence create \
  --title "Page Title" \
  --space PC \
  --body "Page content in markdown"
```

### From File

```bash
confluence create \
  --title "Database Migration Guide" \
  --space PC \
  --body-file docs/migration_guide.md \
  --labels "documentation,database,runbook"
```

### With Jira Link

```bash
confluence create \
  --title "Sprint 4 Summary" \
  --space PC \
  --body-file SPRINT4_SUMMARY.md \
  --jira-ticket "CHRONOS-147" \
  --labels "sprint-summary,sprint-4"
```

### With Parent Page

```bash
confluence create \
  --title "Child Page" \
  --space PC \
  --body "Content" \
  --parent "Parent Page Title"
```

---

## 📚 Related Documentation

- Confluence CLI Runbook: `docs/runbooks/confluence_cli_runbook.md`
- Jira Ticket Template: `docs/templates/jira_ticket_template.md`
- Git Workflow Guide: `docs/4_guides/git_workflow_guide.md`

---

## ✅ Quick Checklist

Before creating any Confluence page:

- [ ] Title is clear and descriptive
- [ ] Status badge included
- [ ] Date and metadata present
- [ ] Jira ticket linked (if applicable)
- [ ] Code blocks use syntax highlighting
- [ ] Labels are consistent with ontology
- [ ] References section included
- [ ] Maintained by / Last updated fields present

---

**Questions?** See example pages:

```bash
confluence list --space PC --limit 10
confluence read "Sprint 4 Completion Summary" --space PC
```
