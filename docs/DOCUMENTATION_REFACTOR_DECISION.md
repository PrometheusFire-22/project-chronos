# Documentation Refactor Decision Record

**Date**: 2025-12-12  
**Type**: Major Infrastructure Decision  
**Status**: In Progress  
**Branch**: `chore/documentation-refactor`

---

## Context: The Clean Break

This documentation refactor represents a **clean break** from rapid iteration phase to structured development phase. After weeks of exploring different tech stacks and approaches, we've settled on a definitive architecture and need documentation that reflects current reality, not historical exploration.

### The Problem

**Symptoms**:
- 120+ documentation files with significant duplication
- Multiple guides for the same topics (KeePassXC, Google Workspace, etc.)
- Outdated ADRs referencing deprecated approaches
- Tech stack discussions from previous iterations causing confusion
- Secrets documentation scattered across multiple files
- No clear entry point for new developers or AI context

**Root Cause**:
- Rapid iteration without deprecating old documentation
- "Vibe coding" sessions creating content faster than documentation updates
- Multiple refactors leaving archived content without clear organization
- No systematic approach to documentation lifecycle

### Why This Matters

**For AI Collaboration**:
- LLMs need clean, current context
- Outdated docs cause confusion and incorrect suggestions
- Every session starts fresh - documentation is only persistent memory

**For Solo Development**:
- Future-you needs to understand current-you's decisions
- Context switching requires quick re-orientation
- Onboarding potential collaborators must be possible

**For Project Success**:
- Technical debt compounds without documentation
- Refactoring becomes risky without understanding current state
- Scaling requires clear patterns and conventions

---

## The Decision

**Execute comprehensive documentation refactor NOW before continuing development.**

### Scope

**Phase 2** of strategic plan (see `strategic-decision-documentation-first.md`):
1. Archive legacy/outdated content
2. Consolidate duplicative documentation
3. Create new SSOT (Single Source of Truth) documents
4. Update existing docs with current reality
5. Create navigation and troubleshooting guides

**Timeline**: 4 hours of focused work

**Branch**: `chore/documentation-refactor`

---

## Documentation Best Practices Adopted

### 1. Local Markdown in Git (Primary)

**Decision**: Keep all technical documentation as markdown files in Git repository

**Rationale**:
- ✅ Version controlled alongside code
- ✅ AI-friendly (LLMs can read directly)
- ✅ Works offline, no external dependencies
- ✅ Simple - no build step, no deployment
- ✅ Searchable with standard tools (grep, ripgrep, IDE)
- ✅ Diff-friendly for code review

**When to use alternatives**:
- **Docusaurus/GitBook**: Only if publishing public documentation
- **ReadTheDocs**: Only for open-source projects
- **Payload CMS**: For marketing content (blog, features, about) - NOT technical docs
- **Confluence**: Sync important docs for stakeholder visibility

### 2. Documentation Structure

**Adopted Structure**:
```
docs/
├── PROJECT_OVERVIEW.md          # Start here - high-level architecture
├── DOCUMENTATION_INDEX.md       # Navigation guide
├── README.md                    # Quick links
├── .secrets-template.md         # Template for local secrets
│
├── architecture/                # Design decisions and concepts
│   ├── adrs/                   # Architecture Decision Records
│   ├── concepts/               # Core concepts and patterns
│   ├── security/               # Security policies
│   └── data_governance/        # Data management
│
├── guides/                      # How-to guides
│   ├── development/            # Development workflows
│   ├── security/               # Security practices
│   ├── integration/            # Third-party integrations
│   ├── onboarding/             # Getting started
│   └── organization/           # Organization methods
│
├── workflows/                   # Step-by-step procedures
│   ├── COMPONENT_DEVELOPMENT.md
│   ├── FEATURE_DEVELOPMENT.md
│   └── ...
│
├── operations/                  # Operational procedures
│   ├── development/            # Dev operations
│   ├── infrastructure/         # Infrastructure management
│   ├── security/               # Security operations
│   └── project_management/     # PM practices
│
├── reference/                   # Reference documentation
│   ├── cli/                    # CLI tool references
│   └── troubleshooting/        # Problem solutions
│
├── templates/                   # Document templates
├── marketing/                   # Marketing content
├── components/                  # Component documentation
│
└── _archive/                    # Historical documentation
    ├── 2025-12-12_pre-payload-cms/
    ├── pre_refactoring_2025-12-05/
    └── ...
```

### 3. Documentation Lifecycle

**States**:
1. **Active** - Current, maintained documentation
2. **Deprecated** - Marked for archival, with replacement reference
3. **Archived** - Historical, kept for reference with context

**Process**:
```
Active → (Superseded) → Deprecated → (Archived with context) → Archived
```

**Archival Best Practices**:
- ✅ Never delete - always archive
- ✅ Create dated archive directories
- ✅ Add README explaining why archived
- ✅ Reference replacement documentation
- ✅ Keep Git history intact (use `git mv`)

### 4. Single Source of Truth (SSOT)

**Principle**: Each topic has ONE authoritative document

**Implementation**:
- Consolidate duplicates into single comprehensive guide
- Archive old versions with clear references
- Cross-link related documentation
- Maintain DOCUMENTATION_INDEX for navigation

**Example**: KeePassXC/Secrets Management
- **Before**: 4+ scattered guides
- **After**: Single `docs/guides/security/SECRETS_AND_CREDENTIALS.md`
- **Archived**: Old versions with reference to new SSOT

### 5. Documentation for AI Context

**Optimize for LLM consumption**:
- ✅ Clear hierarchical structure
- ✅ Comprehensive but concise
- ✅ Code examples with context
- ✅ Explicit decision rationale
- ✅ Links to related documentation
- ✅ No ambiguous references

**Entry Points**:
1. `PROJECT_OVERVIEW.md` - Architecture and stack
2. `DOCUMENTATION_INDEX.md` - "I want to..." guide
3. `README.md` - Quick links

### 6. Secrets Documentation

**Extra Care Required**:
- 🔐 Multiple redundant backups
- 🔐 Consolidate carefully, verify nothing lost
- 🔐 Keep archived versions accessible
- 🔐 Test all workflows after consolidation
- 🔐 Never commit actual secrets (only templates/workflows)

**Structure**:
```markdown
# SECRETS_AND_CREDENTIALS.md

## Overview
## KeePassXC Setup
## Daily Workflow
## Secret Categories
## Integration with Development
## Backup and Recovery
## Troubleshooting
```

### 7. ADR (Architecture Decision Record) Best Practices

**Format**:
```markdown
# ADR-XXX: Title

**Status**: Accepted/Deprecated/Superseded
**Date**: YYYY-MM-DD
**Decision Makers**: Names
**Related ADRs**: Links

## Context
## Decision
## Consequences
## Lessons Learned (add after implementation)
```

**Lifecycle**:
- **Active**: Current decisions
- **Deprecated**: Mark status, reference replacement
- **Archived**: Move to `_archive/adrs/` with context

**This Refactor**:
- Archive ADR-005 (Focus Enforcer) - not currently used
- Archive ADR-006 (CRM Selection) - superseded by current stack
- Update ADR-015, 016, 017 with "Lessons Learned"

---

## Execution Plan

### Phase 1: Backup and Safety ✅ COMPLETE

**Actions**:
- [x] Create `chore/documentation-refactor` branch
- [x] Full tarball backup of `docs/`
- [x] Extra copies of all secrets documentation
- [x] Inventory of all files before changes
- [x] Backup README with restore instructions

**Location**: `.backups/documentation-refactor-2025-12-12/`

### Phase 2: Archive Legacy Content (Next)

**Target Files**:
- `docs/marketing/READINESS_ASSESSMENT.md` → Archive (outdated)
- `docs/marketing/TECH_STACK_RECOMMENDATIONS.md` → Archive (superseded by ADRs)
- `docs/front-end-setup-sprint.md` → Archive (planning doc, now implemented)
- `docs/architecture/adrs/adr_005_focus_enforcer_protocol.md` → Archive
- `docs/architecture/adrs/adr_006_crm_selection.md` → Archive

**Archive Location**: `docs/_archive/2025-12-12_pre-payload-cms/`

**Process**:
1. Create archive directory with README
2. Use `git mv` to preserve history
3. Add references in archived files to current docs
4. Update any links in active documentation

### Phase 3: Consolidate Secrets Documentation 🔐

**Create**: `docs/guides/security/SECRETS_AND_CREDENTIALS.md`

**Consolidate from**:
1. `docs/guides/security/secrets_management.md` (primary source)
2. `docs/operations/security/keepassxc_workflow.md`
3. `docs/guides/organization/keepassxc_organization.md`
4. Review archived KeePassXC guides for missing info

**After Consolidation**:
- Archive old files with reference to new SSOT
- Update all cross-references
- Test workflows to ensure nothing lost

### Phase 4: Create New Core Documentation

**New Files**:

1. **`docs/PROJECT_OVERVIEW.md`**
   - High-level architecture
   - Current tech stack (definitive)
   - Monorepo structure
   - Key design decisions
   - Navigation to detailed docs

2. **`docs/DOCUMENTATION_INDEX.md`**
   - Categorized list of all docs
   - "I want to..." quick reference
   - Navigation guide for different roles

3. **`docs/guides/development/FRONTEND_DEVELOPMENT.md`**
   - Next.js 16 conventions
   - Component development workflow
   - Styling patterns (Tailwind + CSS variables)
   - Animation patterns (Framer Motion)
   - Theme system (light/dark mode)

4. **`docs/workflows/COMPONENT_DEVELOPMENT.md`**
   - Step-by-step component creation
   - File structure conventions
   - Import patterns
   - Documentation requirements

5. **`docs/workflows/FEATURE_DEVELOPMENT.md`**
   - Git branching (GitFlow)
   - Jira ticket linking
   - PR process
   - Deployment workflow

6. **`docs/reference/troubleshooting/COMMON_ISSUES.md`**
   - Build errors and solutions
   - Import resolution
   - TypeScript configuration
   - Nx cache issues
   - Recent fixes documented

### Phase 5: Update Existing Documentation

**Update**:
1. `docs/guides/development/monorepo-complete-guide.md`
   - Current Nx setup (not planned)
   - Actual package structure
   - Working commands
   - Remove outdated Turborepo references

2. `docs/guides/development/monorepo-quick-start.md`
   - Quick commands that actually work
   - Common tasks
   - Troubleshooting

3. ADRs 015-017
   - Add "Lessons Learned" sections
   - Document build error fixes
   - Note what worked vs. what was planned

4. `docs/README.md`
   - Update with new structure
   - Link to DOCUMENTATION_INDEX
   - Quick start guide

### Phase 6: Consolidate Duplicates

**Google Workspace** (3+ files):
- Consolidate into `docs/guides/integration/GOOGLE_WORKSPACE.md`
- Archive old versions

**Confluence Sync** (multiple files):
- Keep operational guides in `docs/operations/development/`
- Add references to archived comprehensive guides

### Phase 7: Create Troubleshooting Guide

**`docs/reference/troubleshooting/COMMON_ISSUES.md`**

**Sections**:
- Build errors (from recent experience)
- Import resolution
- TypeScript configuration
- Nx cache issues
- Docker issues
- Database connection issues
- Git workflow issues

### Phase 8: Final Cleanup

**Actions**:
1. Update all internal links
2. Verify no broken references
3. Create archive READMEs
4. Run link checker (if available)
5. Final review
6. Commit with detailed message
7. Create inventory of files after refactor

---

## Success Criteria

### Documentation Quality
- [ ] Single SSOT for each topic
- [ ] No duplicative content
- [ ] All secrets documentation consolidated safely
- [ ] Clear navigation structure
- [ ] All links working
- [ ] No orphaned content

### Usability
- [ ] New developer can find what they need
- [ ] AI can understand system from docs
- [ ] Quick reference guide exists
- [ ] Troubleshooting guide covers common issues
- [ ] Entry points clearly defined

### Maintainability
- [ ] Clear ownership of each doc
- [ ] Archive strategy documented
- [ ] Update process defined
- [ ] Documentation lifecycle clear

---

## Risk Mitigation

### Information Loss
- ✅ Full backup before any changes
- ✅ Extra backups of secrets documentation
- ✅ Archive, never delete
- ✅ Document why things were archived
- ✅ Use `git mv` to preserve history

### Breaking Changes
- ✅ All work on feature branch
- ✅ Can revert if needed
- ✅ Add redirects/references in archived docs
- ✅ Update all internal links
- ✅ Commit frequently with clear messages

### Secrets Handling
- ✅ Multiple redundant backups
- ✅ Review archived versions for missing info
- ✅ Test all workflows after consolidation
- ✅ Keep archived versions accessible
- ✅ Never commit actual secrets

---

## Documentation Best Practices Summary

### What We're Adopting

1. **Local Markdown in Git** - Primary documentation method
2. **SSOT Principle** - One authoritative doc per topic
3. **Clear Structure** - Hierarchical organization
4. **Archive, Don't Delete** - Preserve history with context
5. **AI-Optimized** - Clear, comprehensive, well-linked
6. **Secrets Extra Care** - Multiple backups, careful consolidation
7. **ADR Lifecycle** - Active → Deprecated → Archived
8. **Documentation Index** - Navigation guide

### What We're NOT Doing

- ❌ Docusaurus/GitBook (not publishing publicly)
- ❌ ReadTheDocs (not open-source)
- ❌ Payload CMS for technical docs (only for marketing content)
- ❌ Deleting old documentation (archiving instead)
- ❌ Hardcoding content that will be CMS-managed

### Integration Points

**Payload CMS** (Sprint 11):
- Marketing copy (features, about, blog)
- NOT technical documentation

**Confluence**:
- Sync important docs for stakeholder visibility
- Operational runbooks
- Team collaboration

**Git**:
- All technical documentation
- Version controlled
- Code review process

---

## Timeline

| Phase | Estimated Time | Status |
|-------|---------------|--------|
| 1. Backup & Safety | 15 min | ✅ Complete |
| 2. Archive Legacy | 30 min | ⏳ Next |
| 3. Consolidate Secrets | 45 min | Pending |
| 4. Create Core Docs | 60 min | Pending |
| 5. Update Existing | 45 min | Pending |
| 6. Consolidate Duplicates | 30 min | Pending |
| 7. Troubleshooting Guide | 20 min | Pending |
| 8. Final Cleanup | 15 min | Pending |
| **Total** | **4 hours** | |

---

## Related Documents

- `strategic-decision-documentation-first.md` - Overall strategy
- `documentation-audit-and-refactor-plan.md` - Detailed audit
- `.backups/documentation-refactor-2025-12-12/README.md` - Backup info

---

## Commit Message Template

```
chore(docs): comprehensive documentation refactor

Phase X: [Phase Name]

- Archive legacy/outdated documentation
- Consolidate duplicative content
- Create new SSOT documentation
- Update existing docs with current state

This refactor represents a clean break from rapid iteration phase
to structured development. Documentation now reflects current
reality, not historical exploration.

Backups: .backups/documentation-refactor-2025-12-12/
Related: Strategic decision to document before continuing development

[Detailed changes]
```

---

**Status**: Phase 1 Complete, Phase 2 Starting  
**Branch**: `chore/documentation-refactor`  
**Next**: Archive legacy content
