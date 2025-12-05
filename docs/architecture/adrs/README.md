# Architecture Decision Records (ADRs)

This directory contains all Architecture Decision Records for Project Chronos.

## What is an ADR?

An ADR documents a significant architectural decision made along with its context and consequences. Each ADR is immutable once approved - new decisions supersede old ones rather than modifying them.

## ADR Index

| ADR | Title | Status | Date |
|-----|-------|--------|------|
| [ADR-002](adr_002_project_management_stack.md) | Project Management Stack | Approved | 2025-11-16 |
| [ADR-003](adr_003_pragmatic_agile_jira_workflow.md) | Pragmatic Agile Jira Workflow | Approved | 2025-11-17 |
| [ADR-004](adr_004_git_workflow_and_branching_model.md) | Git Workflow and Branching Model | Approved | 2025-11-16 |
| [ADR-005](adr_005_focus_enforcer_protocol.md) | Focus Enforcer Protocol | Approved | 2025-11-17 |
| [ADR-006](adr_006_crm_selection.md) | CRM Selection | Approved | 2025-11-17 |
| [ADR-007](adr_007_jira_first_workflow.md) | Jira-First Workflow | Approved | 2025-11-25 |
| [ADR-008](adr_008_backup_architecture.md) | PostgreSQL 3-2-1 Backup Architecture | Proposed | 2025-11-25 |
| [ADR-009](adr_009_backup_strategy.md) | Database Backup Strategy (pgBackRest + S3) | Proposed | 2025-11-25 |
| [ADR-010](adr_010_geospatial_ingestion.md) | Geospatial Data Ingestion Strategy | Proposed | 2025-11-25 |
| [ADR-011](adr_011_documentation_ssot.md) | Documentation SSOT Strategy | Proposed | 2025-11-25 |

## ADR Lifecycle

1. **Proposed**: Under review, not yet approved
2. **Approved**: Accepted and implemented
3. **Superseded**: Replaced by a newer ADR
4. **Deprecated**: No longer applicable

## Creating a New ADR

1. Use the next available number (ADR-015, etc.)
2. Follow the template in `/workspace/docs/templates/`
3. Submit for review via pull request
4. Update this index when approved

## Note on ADR-001

ADR-001 was intentionally skipped. Numbering starts from ADR-002.
