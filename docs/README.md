# Project Chronos Documentation

**Single Source of Truth for Project Chronos**

---

## 🚀 Quick Start

**New to the project?**

1. **[Project Overview](PROJECT_OVERVIEW.md)** - High-level architecture, tech stack, current phase
2. **[Documentation Index](DOCUMENTATION_INDEX.md)** - Find what you need with "I want to..." guide
3. **[Frontend Development Guide](guides/development/FRONTEND_DEVELOPMENT.md)** - Start building with Next.js/React

**Developers:**
- [Monorepo Complete Guide](guides/development/monorepo-complete-guide.md) - Understand the structure
- [Component Development Workflow](workflows/COMPONENT_DEVELOPMENT.md) - Build UI components
- [Common Issues](reference/troubleshooting/COMMON_ISSUES.md) - Troubleshooting

---

## 📚 Documentation Structure

### Core Documentation
- **[PROJECT_OVERVIEW.md](PROJECT_OVERVIEW.md)** - Architecture, stack, deployment status
- **[DOCUMENTATION_INDEX.md](DOCUMENTATION_INDEX.md)** - Navigation hub

### [architecture/](architecture/)
System architecture, data models, and concepts.
- **[adrs/](architecture/adrs/)**: Architectural Decision Records (ADR-001 to ADR-017)
- **[concepts/](architecture/concepts/)**: Core platform concepts & style guide
- **[diagrams/](architecture/diagrams/)**: Architecture diagrams

### [guides/](guides/)
How-to guides for development, security, and operations.
- **[development/](guides/development/)**: Frontend, monorepo, Nx guides
- **[security/](guides/security/)**: Secrets management (🔐 sensitive)
- **[onboarding/](guides/onboarding/)**: LLM and developer onboarding

### [workflows/](workflows/)
Step-by-step workflows for common tasks.
- Component development, feature development, deployment

### [reference/](reference/)
Quick reference and troubleshooting.
- **[troubleshooting/](reference/troubleshooting/)**: Common issues and solutions

### [operations/](operations/)
Operational runbooks for common tasks and procedures.
- **[disaster_recovery/](operations/disaster_recovery/)**: DR plans

---

## 🔄 Documentation Workflow

**SSOT**: This Git repository (`/workspace/docs/`)  
**Publication**: Confluence (auto-synced or manual)  
**Artifacts**: Temporary AI-generated drafts (reviewed and moved here)

See [ADR-014](architecture/adrs/adr_014_documentation_ssot.md) for full details.

---

## 📝 Contributing

1. Edit markdown files in this directory
2. Commit to Git with conventional commit format
3. Sync to Confluence (manual or automated)

---

## 🔗 Quick Links

- **[ADR Index](architecture/adrs/README.md)** - All architectural decisions
- **[Frontend Development](guides/development/FRONTEND_DEVELOPMENT.md)** - Next.js/React guide
- **[Monorepo Guide](guides/development/monorepo-complete-guide.md)** - Understand the structure
- **[Secrets Management](guides/security/SECRETS_AND_CREDENTIALS.md)** 🔐 - Credential SSOT
- **[Style Guide](architecture/concepts/style_guide.md)** - Writing and code style

---

**Last Updated**: 2025-12-12  
**Maintained By**: Geoff Bevans + Antigravity
