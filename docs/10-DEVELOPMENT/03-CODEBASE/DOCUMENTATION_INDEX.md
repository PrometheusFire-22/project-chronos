# Documentation Index

**Navigation Guide for Project Chronos Documentation**

**Last Updated:** 2025-12-12

---

## Start Here

**New to the project?**
1. [PROJECT_OVERVIEW.md](../../20-PRODUCT/01-STRATEGY/PROJECT_OVERVIEW.md) - High-level architecture and tech stack
2. [Developer Onboarding](../../30-OPERATIONS/03-PEOPLE/developer-onboarding.md) - Getting started guide
3. [Quick Reference](../../30-OPERATIONS/03-PEOPLE/quick_reference.md) - Common commands and workflows

---

## I Want To...

### Get Started

- **Understand the project** → [PROJECT_OVERVIEW.md](PROJECT_OVERVIEW.md)
- **Set up my development environment** → [Developer Onboarding](guides/onboarding/developer-onboarding.md)
- **Understand the monorepo** → [Monorepo Complete Guide](guides/development/monorepo-complete-guide.md)
- **Quick start commands** → [Monorepo Quick Start](guides/development/monorepo-quick-start.md)

### Develop Features

- **Create a new component** → [Component Development Workflow](workflows/COMPONENT_DEVELOPMENT.md)
- **Create a new feature** → [Feature Development Workflow](workflows/FEATURE_DEVELOPMENT.md)
- **Understand frontend stack** → [Frontend Development Guide](guides/development/FRONTEND_DEVELOPMENT.md)
- **Work with Git** → [Git Workflow](guides/development/git_workflow.md)
- **Work with Jira** → [Jira Workflow](guides/development/jira_workflow.md)

### Fix Problems

- **Build errors** → [Common Issues](reference/troubleshooting/COMMON_ISSUES.md)
- **Import resolution errors** → [Common Issues](reference/troubleshooting/COMMON_ISSUES.md)
- **Docker issues** → [Docker Fix](reference/troubleshooting/DOCKER_FIX.md)
- **Post-mortem analysis** → [Troubleshooting Archive](troubleshooting/)

### Manage Secrets

- **Set up KeePassXC** → [Secrets and Credentials](guides/security/SECRETS_AND_CREDENTIALS.md)
- **Rotate credentials** → [Secrets and Credentials](guides/security/SECRETS_AND_CREDENTIALS.md#rotation-schedule--procedures)
- **Emergency access** → [Secrets and Credentials](guides/security/SECRETS_AND_CREDENTIALS.md#emergency-access-procedures)
- **Backup KeePassXC** → [Secrets and Credentials](guides/security/SECRETS_AND_CREDENTIALS.md#backup-strategy)

### Understand Architecture

- **View all ADRs** → [Architecture Decision Records](architecture/adrs/README.md)
- **Frontend stack decisions** → [ADR-012](architecture/adrs/adr_012_frontend_stack_architecture.md)
- **Design system** → [ADR-016](architecture/adrs/adr_016_frontend_design_system_integration.md)
- **Nx monorepo** → [ADR-017](architecture/adrs/adr_017_nx_monorepo_tooling.md)
- **Payload CMS** → [ADR-015](architecture/adrs/adr_015_frontend_supporting_tools.md)

### Work with Tools

- **Atlassian CLI** → [Atlassian CLI Reference](reference/cli/atlassian_cli.md)
- **Jira CLI** → [Jira CLI Reference](reference/cli/jira_cli.md)
- **Confluence CLI** → [Confluence CLI Reference](reference/cli/confluence_cli.md)
- **Confluence sync** → [Confluence Sync](operations/development/confluence_sync.md)

### Deploy \u0026 Operations

- **Database backups** → [Database Backups](operations/infrastructure/database_backups.md)
- **Disaster recovery** → [Disaster Recovery](operations/disaster_recovery/disaster_recovery.md)
- **Monitoring** → [Monitoring](operations/infrastructure/monitoring.md)
- **Environment variables** → [Environment Variables](operations/environment-variables.md)

---

## Documentation by Category

### 📋 Core Documentation

| Document | Purpose |
|----------|---------|
| [PROJECT_OVERVIEW.md](PROJECT_OVERVIEW.md) | High-level architecture and tech stack |
| [DOCUMENTATION_INDEX.md](DOCUMENTATION_INDEX.md) | This file - navigation guide |
| [README.md](README.md) | Project README with quick links |
| [DOCUMENTATION_REFACTOR_DECISION.md](DOCUMENTATION_REFACTOR_DECISION.md) | Documentation refactor rationale and plan |

### 🏗️ Architecture

| Category | Location | Key Documents |
|----------|----------|---------------|
| **ADRs** | `architecture/adrs/` | All architecture decisions |
| **Concepts** | `architecture/concepts/` | Core concepts and patterns |
| **Security** | `architecture/security/` | Security policies |
| **Data Governance** | `architecture/data_governance/` | Data management |

**Key ADRs**:
- [ADR-011: Documentation SSOT](architecture/adrs/adr_011_documentation_ssot.md)
- [ADR-012: Frontend Stack](architecture/adrs/adr_012_frontend_stack_architecture.md)
- [ADR-015: Frontend Supporting Tools](architecture/adrs/adr_015_frontend_supporting_tools.md)
- [ADR-016: Design System](architecture/adrs/adr_016_frontend_design_system_integration.md)
- [ADR-017: Nx Monorepo](architecture/adrs/adr_017_nx_monorepo_tooling.md)

### 📚 Guides

| Category | Location | Purpose |
|----------|----------|---------|
| **Development** | `guides/development/` | Development workflows and setup |
| **Security** | `guides/security/` | Security practices and secrets management |
| **Integration** | `guides/integration/` | Third-party integrations |
| **Onboarding** | `guides/onboarding/` | Getting started guides |
| **Organization** | `guides/organization/` | Organization methods |

**Essential Guides**:
- [Frontend Development](guides/development/FRONTEND_DEVELOPMENT.md) ⭐ NEW
- [Monorepo Complete Guide](guides/development/monorepo-complete-guide.md)
- [Secrets and Credentials](guides/security/SECRETS_AND_CREDENTIALS.md) 🔐 CRITICAL
- [Developer Onboarding](guides/onboarding/developer-onboarding.md)

### 🔄 Workflows

| Workflow | Location | Purpose |
|----------|----------|---------|
| **Component Development** | `workflows/COMPONENT_DEVELOPMENT.md` | Step-by-step component creation ⭐ NEW |
| **Feature Development** | `workflows/FEATURE_DEVELOPMENT.md` | Feature branch workflow ⭐ NEW |
| **Git Workflow** | `guides/development/git_workflow.md` | Git and GitHub practices |
| **Jira Workflow** | `guides/development/jira_workflow.md` | Jira ticket management |

### ⚙️ Operations

| Category | Location | Purpose |
|----------|----------|---------|
| **Development** | `operations/development/` | Dev operations (Atlassian CLI, Confluence sync) |
| **Infrastructure** | `operations/infrastructure/` | Infrastructure management (backups, monitoring) |
| **Security** | `operations/security/` | Security operations |
| **Project Management** | `operations/project_management/` | PM practices (Scrumban) |
| **Disaster Recovery** | `operations/disaster_recovery/` | DR procedures |

### 📖 Reference

| Category | Location | Purpose |
|----------|----------|---------|
| **CLI Tools** | `reference/cli/` | CLI tool references (Atlassian, Jira, Confluence) |
| **Troubleshooting** | `reference/troubleshooting/` | Problem solutions and fixes |

**Key References**:
- [Common Issues](reference/troubleshooting/COMMON_ISSUES.md) ⭐ NEW
- [Atlassian CLI](reference/cli/atlassian_cli.md)
- [Docker Fix](reference/troubleshooting/DOCKER_FIX.md)

### 📝 Templates

| Template | Location | Purpose |
|----------|----------|---------|
| **Git Commit** | `templates/git_commit_template.md` | Commit message format |
| **GitHub PR** | `templates/github_pr_template.md` | Pull request template |
| **Jira Ticket** | `templates/jira_ticket_template.md` | Jira ticket format |
| **Confluence Page** | `templates/confluence_page_template.md` | Confluence page structure |

### 🎨 Marketing

| Category | Location | Purpose |
|----------|----------|---------|
| **Brand Guidelines** | `marketing/brand_guidelines.md` | Brand standards |
| **Logo Usage** | `marketing/logo_usage_guide.md` | Logo usage rules |
| **Copy** | `marketing/copy/` | Marketing content (will move to Payload CMS) |
| **Research** | `marketing/research/` | Market research and insights |

**Note**: Marketing copy (features, about, homepage) will be managed in Payload CMS (Sprint 11)

### 🧩 Components

| Component | Documentation |
|-----------|---------------|
| **HeroSection** | `components/hero-section.md` |

### 🗄️ Archive

| Archive | Location | Purpose |
|---------|----------|---------|
| **2025-12-12 Pre-Payload CMS** | `_archive/2025-12-12_pre-payload-cms/` | Documentation refactor archive |
| **2025-12-05 Pre-Refactoring** | `_archive/pre_refactoring_2025-12-05/` | Previous refactor archive |
| **Deprecated** | `_archive/deprecated/` | Deprecated workflows and docs |
| **Session Notes** | `_archive/session_notes/` | Historical session logs |

---

## Documentation Standards

### File Naming

- **Guides**: `lowercase_with_underscores.md`
- **ADRs**: `adr_NNN_descriptive_name.md`
- **Workflows**: `UPPERCASE_WITH_UNDERSCORES.md`
- **Core Docs**: `UPPERCASE.md`

### Document Structure

All documentation should include:
- **Title** (H1)
- **Purpose/Overview**
- **Last Updated** date
- **Table of Contents** (for long docs)
- **Related Documentation** links

### Markdown Conventions

- Use relative links for internal documentation
- Use absolute paths for file references
- Include code examples where applicable
- Use tables for structured data
- Use alerts/callouts for important information

---

## Finding Documentation

### By Role

**Frontend Developer**:
1. [Frontend Development Guide](guides/development/FRONTEND_DEVELOPMENT.md)
2. [Component Development Workflow](workflows/COMPONENT_DEVELOPMENT.md)
3. [Monorepo Complete Guide](guides/development/monorepo-complete-guide.md)
4. [Common Issues](reference/troubleshooting/COMMON_ISSUES.md)

**Backend Developer**:
1. [PROJECT_OVERVIEW.md](PROJECT_OVERVIEW.md)
2. [Database Backups](operations/infrastructure/database_backups.md)
3. [Disaster Recovery](operations/disaster_recovery/disaster_recovery.md)

**DevOps/Infrastructure**:
1. [Infrastructure Operations](operations/infrastructure/)
2. [Database Backups](operations/infrastructure/database_backups.md)
3. [Monitoring](operations/infrastructure/monitoring.md)
4. [Disaster Recovery](operations/disaster_recovery/disaster_recovery.md)

**Project Manager**:
1. [Jira Workflow](guides/development/jira_workflow.md)
2. [Scrumban Practices](operations/project_management/scrumban_practices.md)
3. [ADR-003: Pragmatic Agile](architecture/adrs/adr_003_pragmatic_agile_jira_workflow.md)

### By Task

**Setting up for first time**:
1. [Developer Onboarding](guides/onboarding/developer-onboarding.md)
2. [Monorepo Quick Start](guides/development/monorepo-quick-start.md)
3. [Secrets and Credentials](guides/security/SECRETS_AND_CREDENTIALS.md)

**Building a feature**:
1. [Feature Development Workflow](workflows/FEATURE_DEVELOPMENT.md)
2. [Component Development Workflow](workflows/COMPONENT_DEVELOPMENT.md)
3. [Git Workflow](guides/development/git_workflow.md)
4. [Jira Workflow](guides/development/jira_workflow.md)

**Fixing a bug**:
1. [Common Issues](reference/troubleshooting/COMMON_ISSUES.md)
2. [Troubleshooting Archive](reference/troubleshooting/)
3. [Git Workflow](guides/development/git_workflow.md)

**Deploying**:
1. [PROJECT_OVERVIEW.md](PROJECT_OVERVIEW.md#deployment)
2. [Environment Variables](operations/environment-variables.md)
3. [Database Backups](operations/infrastructure/database_backups.md)

---

## Recently Updated

**2025-12-12** (Documentation Refactor):
- ⭐ NEW: [PROJECT_OVERVIEW.md](PROJECT_OVERVIEW.md)
- ⭐ NEW: [DOCUMENTATION_INDEX.md](DOCUMENTATION_INDEX.md)
- ⭐ NEW: [Frontend Development Guide](guides/development/FRONTEND_DEVELOPMENT.md)
- ⭐ NEW: [Component Development Workflow](workflows/COMPONENT_DEVELOPMENT.md)
- ⭐ NEW: [Feature Development Workflow](workflows/FEATURE_DEVELOPMENT.md)
- ⭐ NEW: [Common Issues](reference/troubleshooting/COMMON_ISSUES.md)
- 🔐 CONSOLIDATED: [Secrets and Credentials](guides/security/SECRETS_AND_CREDENTIALS.md)
- 📦 ARCHIVED: Outdated ADRs, marketing assessments, planning docs

---

## Contributing to Documentation

### When to Update Documentation

- **Always**: When making architectural decisions (create ADR)
- **Always**: When adding new features (update relevant guides)
- **Always**: When fixing bugs (update troubleshooting)
- **Often**: When learning something non-obvious (add to guides)

### How to Update Documentation

1. **Find the right document** using this index
2. **Make changes** following markdown conventions
3. **Update "Last Updated" date**
4. **Commit with clear message**: `docs(scope): description`
5. **Sync to Confluence** if stakeholder-facing

### Creating New Documentation

1. **Check if it already exists** (use this index)
2. **Choose the right location** (see categories above)
3. **Follow naming conventions**
4. **Include standard sections** (title, purpose, last updated)
5. **Add to this index**
6. **Link from related documents**

---

## Questions?

**Can't find what you're looking for?**
1. Search this index for keywords
2. Check [PROJECT_OVERVIEW.md](PROJECT_OVERVIEW.md)
3. Browse relevant category above
4. Check [Archive](_archive/) for historical docs

**Documentation unclear or outdated?**
- Update it! (See "Contributing to Documentation" above)
- Create a Jira ticket if major work needed

---

**Last Updated**: 2025-12-12  
**Part of**: Documentation refactor to create SSOT documentation  
**Maintained by**: Project team (update as you go!)
