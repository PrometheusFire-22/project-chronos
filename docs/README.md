# Project Chronos Documentation

**Single Source of Truth for Project Chronos**

This directory contains all project documentation following the structure defined in [ADR-014: Documentation SSOT Strategy](2_architecture/adrs/adr_014_documentation_ssot.md).

---

## 📚 Documentation Structure

### [0_project_vision_and_strategy/](0_project_vision_and_strategy/)
Strategic vision, architectural deep dive, and long-term planning documents.

### [1_platform_concepts/](1_platform_concepts/)
Core platform concepts, architecture overview, project structure, and style guide.

### [2_architecture/](2_architecture/)
System architecture, data models, and Architecture Decision Records (ADRs).
- **[adrs/](2_architecture/adrs/)**: All architectural decisions
- **[diagrams/](2_architecture/diagrams/)**: Architecture diagrams

### [3_runbooks/](3_runbooks/)
Operational runbooks for common tasks and procedures.
- Jira CLI operations
- Confluence CLI operations
- Complete workflow runbook
- Data ingestion procedures

### [4_guides/](4_guides/)
Step-by-step guides for developers and operators.
- Developer onboarding
- LLM onboarding
- Git workflow
- GIS workflow
- Alembic migrations

### [5_reference/](5_reference/)
API references, CLI references, and database schema documentation.

### [6_project_tracking/](6_project_tracking/)
Sprint summaries, investor materials, and project tracking documents.

### [7_troubleshooting/](7_troubleshooting/)
Post-mortems, troubleshooting guides, and incident reports.

### [templates/](templates/)
Templates for Jira tickets, Confluence pages, GitHub PRs, and Git commits.

### [_archive/](_archive/)
Archived documentation no longer in active use.

---

## 🔄 Documentation Workflow

**SSOT**: This Git repository (`/workspace/docs/`)  
**Publication**: Confluence (auto-synced or manual)  
**Artifacts**: Temporary AI-generated drafts (reviewed and moved here)

See [ADR-014](2_architecture/adrs/adr_014_documentation_ssot.md) for full details.

---

## 📝 Contributing

1. Edit markdown files in this directory
2. Commit to Git
3. Sync to Confluence (manual or automated)

---

## 🔗 Quick Links

- [ADR Index](2_architecture/adrs/README.md)
- [LLM Onboarding Guide](LLM_ONBOARDING_GUIDE.md)
- [Complete Workflow Runbook](3_runbooks/complete_workflow_runbook.md)
- [Style Guide](1_platform_concepts/style_guide.md)

---

**Last Updated**: 2025-11-25  
**Maintained By**: Geoff Bevans + Claude Code
