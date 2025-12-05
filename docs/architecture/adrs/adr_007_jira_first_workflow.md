# ADR 007: Jira-First Workflow Order

**Date:** 2025-11-25  
**Status:** ✅ Accepted  
**Author:** Project Chronos Team

---

## 1. Context & Problem Statement

When working through the complete development workflow (Jira → Git → GitHub → Confluence), the order of artifact creation significantly impacts metadata quality and cross-referencing capabilities. We need to determine the optimal sequence that maximizes traceability while minimizing rework.

## 2. Decision

**We will follow a Jira-First workflow order:**

```
1. Jira Ticket (Create)
2. Git Branch (Reference ticket)
3. Git Commits (Reference ticket)
4. GitHub PR (Reference ticket + link to Jira)
5. Confluence Page (Reference ticket + PR)
6. Jira Ticket (Update to Done)
```

## 3. Rationale

### Why Jira First?

**✅ Enables Forward Referencing**
- Git branch names can include ticket ID: `feat/CHRONOS-XXX-description`
- Commit messages can reference ticket: `Implements: CHRONOS-XXX`
- PR descriptions can link to ticket: `[CHRONOS-XXX](jira-url)`
- Confluence pages can link to ticket: `Jira: CHRONOS-XXX`

**✅ Provides Context Early**
- Ticket description serves as specification for development
- Acceptance criteria guide implementation
- Labels inform code organization

**✅ Maintains Audit Trail**
- Ticket created timestamp = work start
- All subsequent artifacts reference back to source of truth
- Complete lineage: Ticket → Code → PR → Docs

**✅ Supports AI Collaboration**
- LLM can read ticket for context
- Ticket ID becomes session identifier
- Metadata flows naturally downstream

### Alternative Considered: Git-First

**❌ Backward Referencing Required**
- Must update commit messages retroactively
- Branch names lack context
- PR creation requires manual ticket linking

**❌ Metadata Fragmentation**
- Work starts without formal specification
- Acceptance criteria added after implementation
- Harder to track "why" behind changes

## 4. Workflow Implementation

### Phase 1: Planning (Jira)

```bash
# Create ticket with full specification
jira create \
  --summary "feat(component): Brief description" \
  --description "User story + AC + DoD" \
  --type "Story" \
  --labels "component,domain"

# Capture ticket ID
TICKET="CHRONOS-XXX"
```

### Phase 2: Development (Git)

```bash
# Create branch with ticket reference
git checkout -b feat/${TICKET}-brief-description

# Commit with ticket reference
git commit -m "feat(component): Description

Detailed changes...

Implements: ${TICKET}"
```

### Phase 3: Review (GitHub)

```bash
# Create PR with ticket link
gh pr create \
  --title "feat(component): Description" \
  --body "Implements: [${TICKET}](jira-url)

## Changes
...

## Testing
..."
```

### Phase 4: Documentation (Confluence)

```bash
# Create page with ticket + PR references
confluence create \
  --title "${TICKET}: Feature Name" \
  --jira-ticket "${TICKET}" \
  --body "Implementation of ${TICKET}

PR: [Link]
..."
```

### Phase 5: Closure (Jira)

```bash
# Update ticket to Done
jira update ${TICKET} --status "Done"
```

## 5. Consequences

### Positive

- ✅ Clean forward references throughout workflow
- ✅ Ticket serves as single source of truth
- ✅ Better context for AI assistants
- ✅ Complete audit trail from inception
- ✅ Easier to track work-in-progress

### Negative

- ⚠️ Requires discipline to create ticket first
- ⚠️ Small fixes may feel over-documented
- ⚠️ Ticket creation adds upfront time

### Mitigations

- Use `jira create` with minimal flags for quick tickets
- Reserve full workflow for Stories/Features only
- Allow hotfixes to skip Jira for true emergencies

## 6. Exceptions

**When to skip Jira-First:**

1. **Emergency Hotfixes**: Critical production issues
2. **Typo Fixes**: Documentation/comment corrections
3. **Dependency Updates**: Automated security patches

For these cases, create Jira ticket retrospectively for audit purposes.

## 7. Related Documentation

- ADR 003: Pragmatic Agile Jira Workflow
- ADR 004: Git Workflow and Branching Model
- Complete Workflow Runbook

---

**Last Updated:** 2025-11-25  
**Maintainer:** Prometheus + Claude Code
