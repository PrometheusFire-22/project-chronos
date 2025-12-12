# Archive: Pre-Payload CMS Documentation - 2025-12-12

## Why This Archive Exists

This archive was created during a major documentation refactor on 2025-12-12 as part of transitioning from rapid iteration phase to structured development phase.

## What's Archived Here

### Deprecated ADRs
**Location**: `adrs/`

- **ADR-005**: Focus Enforcer Protocol - Not currently in use
- **ADR-006**: CRM Selection - Superseded by current stack decisions

**Why Archived**: These ADRs represented earlier approaches that were explored but not adopted in the final architecture. They're preserved for historical context but are no longer active decisions.

### Outdated Marketing Documentation
**Location**: `marketing/`

- **READINESS_ASSESSMENT.md** - Initial marketing readiness assessment, now outdated
- **TECH_STACK_RECOMMENDATIONS.md** - Early tech stack exploration, superseded by ADRs 012, 015-017

**Why Archived**: These documents captured early exploration and decision-making but have been superseded by formal ADRs and the finalized tech stack.

### Planning Documents
**Location**: `planning/`

- **front-end-setup-sprint.md** - Planning document for frontend setup, now implemented

**Why Archived**: This was a planning/sprint document that has been executed. The actual implementation is now documented in the monorepo guides and ADRs.

## Current Documentation

### For ADR Information
- See `docs/architecture/adrs/` for active ADRs
- ADR-012: Frontend Stack Architecture
- ADR-015: Frontend Supporting Tools
- ADR-016: Frontend Design System Integration
- ADR-017: Nx Monorepo Tooling

### For Marketing Information
- See `docs/marketing/brand_guidelines.md` for brand standards
- See `docs/marketing/logo_usage_guide.md` for logo usage
- Marketing content (features, about, blog) will be managed in Payload CMS (Sprint 11)

### For Frontend Setup
- See `docs/guides/development/monorepo-complete-guide.md` for current setup
- See `docs/guides/development/FRONTEND_DEVELOPMENT.md` for development workflows
- See `docs/PROJECT_OVERVIEW.md` for high-level architecture

## Restore Instructions

If you need to reference these documents:

```bash
# They're right here in the archive
cd docs/_archive/2025-12-12_pre-payload-cms/

# View specific file
cat adrs/adr_005_focus_enforcer_protocol.md
```

## Related Documentation

- `docs/DOCUMENTATION_REFACTOR_DECISION.md` - Why this refactor happened
- `.backups/documentation-refactor-2025-12-12/` - Full backup of all docs before refactor
- `docs/DOCUMENTATION_INDEX.md` - Navigation guide to current documentation

---

**Archive Date**: 2025-12-12  
**Archived By**: Documentation refactor process  
**Branch**: `chore/documentation-refactor`  
**Related Decision**: Strategic decision to document before continuing development
