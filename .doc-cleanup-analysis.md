# Documentation Cleanup Analysis - 2025-12-01

## Current State

**Total markdown files:** 83
**Confluence mapped pages:** 59
**Session notes:** 10

### Directory Structure Issues

1. ✅ **Empty directory:** `5_reference/` (no files)
2. ⚠️ **Gap in numbering:** `5_reference/` → `7_troubleshooting/` (skips 6)
3. 📁 **Session notes proliferation:** 10 files, multiple for 2025-11-27

---

## Proposed Changes

### 1. Renumber Directories

**Current:**
```
0_project_vision_and_strategy/
1_platform_concepts/
2_architecture/
3_runbooks/
4_guides/
5_reference/          ← EMPTY
7_troubleshooting/    ← SKIP FROM 5 to 7
```

**Proposed:**
```
0_project_vision_and_strategy/
1_platform_concepts/
2_architecture/
3_runbooks/
4_guides/
6_troubleshooting/    ← RENUMBERED (was 7)
```

**Action:** Remove empty `5_reference/`, renumber `7_troubleshooting/` → `6_troubleshooting/`

---

### 2. Session Notes Consolidation

**Problem:** Multiple session notes for 2025-11-27 creates confusion

**Current 2025-11-27 files:**
1. `2025-11-27_AWS_CLI_SSO_Setup.md` - AWS SSO setup guide
2. `2025-11-27_CHRONOS-213_HANDOFF.md` - Quick handoff note
3. `2025-11-27_CHRONOS-213_Lightsail_Setup_COMPLETE.md` - Full completion doc
4. `2025-11-27_SESSION_SUMMARY.md` - Session summary
5. `2025-11-27_sprint6_completion_session.md` - Sprint 6 completion
6. `2025-11-27_Sprint7_Execution_Plan.md` - Sprint 7 plan
7. `2025-11-27_Sprint7_Phase1_COMPLETE.md` - Phase 1 completion

**Analysis:**
- `AWS_CLI_SSO_Setup.md` → **KEEP** (reference guide, not session-specific)
- `CHRONOS-213_HANDOFF.md` → **ARCHIVE** (superseded by _COMPLETE version)
- `CHRONOS-213_Lightsail_Setup_COMPLETE.md` → **KEEP** (definitive completion doc)
- `SESSION_SUMMARY.md` → **KEEP** (canonical session summary)
- `sprint6_completion_session.md` → **KEEP** (different sprint)
- `Sprint7_Execution_Plan.md` → **KEEP** (planning doc, still relevant)
- `Sprint7_Phase1_COMPLETE.md` → **KEEP** (phase completion doc)

**Recommendation:** Move `CHRONOS-213_HANDOFF.md` to `_archive/session_notes/`

---

### 3. Potential Duplicates/Superseded Docs

#### Session Notes vs Completion Docs

**Pattern identified:**
- Session notes capture real-time progress
- Completion summaries provide canonical final state
- Both have value for different purposes

**No action needed** - Both serve different purposes:
- Session notes = chronological log
- Completion docs = definitive reference

#### SSOT Documentation (3 files)

**Files:**
1. `adr_011_documentation_ssot.md` - ADR (architectural decision)
2. `ssot_workflow_test.md` - Testing guide
3. `ssot_automation_walkthrough.md` - Implementation walkthrough

**Analysis:** All three serve different purposes
- ADR = "Why" (decision rationale)
- Test guide = "How to verify" (QA)
- Walkthrough = "How to build" (implementation)

**Recommendation:** Keep all, no duplication

---

### 4. Confluence Page Hierarchy Reorganization

**Problem:** 59 flat pages in Confluence = hard to navigate

**Proposed Hierarchy:**

```
📘 Project Chronos Documentation (ROOT)
├── 📂 0. Vision & Strategy
│   ├── Architectural Deep Dive
│   ├── Phoenix Plan
│   ├── LLM Context Transfer Protocol
│   └── 📁 Outreach
│       └── Investor Pitch Script
├── 📂 1. Platform Concepts
│   ├── Architecture Overview
│   ├── Documentation Structure
│   ├── Layer Structure
│   ├── Project Structure
│   └── Style Guide
├── 📂 2. Architecture
│   ├── 📁 ADRs (Architecture Decision Records)
│   │   ├── ADR 002: Project Management Stack
│   │   ├── ADR 003: Pragmatic Agile Jira Workflow
│   │   ├── ADR 004: Git Workflow
│   │   ├── ... (12 ADRs total)
│   │   └── README (ADR Index)
│   ├── 📁 Analytical Design
│   │   ├── Geospatial Abstractions
│   │   ├── PostGIS Fundamentals
│   │   └── RICE Framework
│   └── 📁 Data Governance
│       ├── Asset Catalog Guide
│       └── Ontology Hub
├── 📂 3. Runbooks (Operations)
│   ├── Complete Workflow Runbook
│   ├── Jira CLI Runbook
│   ├── Confluence CLI Runbook
│   ├── Confluence Sync Guide
│   ├── KeePassXC Unified Workflow
│   ├── pgBackRest Backup & Restore
│   ├── Security Hardening Phase 2A  ⭐ NEW
│   ├── Disaster Recovery: Lost Computer  ⭐ NEW
│   └── Valet Ingestion
├── 📂 4. Guides (How-To)
│   ├── Git Workflow Guide
│   ├── GIS Workflow
│   ├── Alembic Migration Setup
│   ├── Secrets Management Guide
│   ├── SSOT Workflow Test
│   └── SSOT Automation Walkthrough
├── 📂 6. Troubleshooting
│   └── 2025-11-17 Post Mortem: Data Persistence Failure
├── 📂 Session Notes (Chronological)
│   ├── 2025-11-27: AWS CLI SSO Setup
│   ├── 2025-11-27: CHRONOS-213 Lightsail Complete
│   ├── 2025-11-27: Session Summary
│   ├── 2025-11-27: Sprint 6 Completion
│   ├── 2025-11-27: Sprint 7 Execution Plan
│   ├── 2025-11-27: Sprint 7 Phase 1 Complete
│   ├── 2025-11-30: AWS Training Belt Progression
│   ├── 2025-11-30: KeePassXC Workflow
│   └── 2025-11-30: Session Complete Summary
└── 📄 Quick References
    ├── Operations Quick Reference
    ├── LLM Onboarding Guide
    └── Docker Fix

Total: 59 pages organized into 9 top-level folders
```

**Benefits:**
- Matches local file structure exactly
- Clear information hierarchy
- Easy to find documents by category
- Session notes chronologically grouped

---

## Outdated/Obsolete Documentation Candidates

### Low Risk (Probably Still Needed)

None identified. All documentation appears current and serves active purposes.

### Questions for User

1. **CHRONOS-213_HANDOFF.md** - This was a quick handoff note. The full completion doc exists. Archive?
2. **Sprint 6 completion session** - Is Sprint 6 historical context needed, or can it be archived?
3. **AWS Training Belt Progression** - Is this a permanent reference or session-specific training log?

---

## Implementation Plan

### Phase 1: Local Structure Cleanup (10 min)

```bash
# Remove empty 5_reference directory
rmdir docs/5_reference/

# Rename 7_troubleshooting to 6_troubleshooting
git mv docs/7_troubleshooting docs/6_troubleshooting

# Archive superseded handoff note (if approved)
mkdir -p docs/_archive/session_notes
git mv docs/session_notes/2025-11-27_CHRONOS-213_HANDOFF.md docs/_archive/session_notes/
```

### Phase 2: Update Internal Links (5 min)

Search and replace in all .md files:
- `docs/7_troubleshooting/` → `docs/6_troubleshooting/`
- `7_troubleshooting/` → `6_troubleshooting/`

### Phase 3: Update Confluence Mapping (5 min)

Update `.confluence-mapping.json`:
- Change paths from `7_troubleshooting` → `6_troubleshooting`

### Phase 4: Reorganize Confluence Hierarchy (10-15 min)

**Note:** Confluence page hierarchy is managed by setting parent pages.

**Methods:**
1. **Manual:** Use Confluence UI to move pages under parent pages
2. **Automated:** Use Confluence API to set parent_id for each page

**Recommendation:** Write a Python script to reorganize via API (preserves automation)

---

## Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| Broken internal links | Medium | Search/replace all references before committing |
| Confluence sync breaks | Medium | Update mapping file, test sync before deleting old structure |
| Lost archived docs | Low | Git history preserves everything |
| User confusion | Low | Document changes in commit message |

---

## Questions for User Approval

Before proceeding, please confirm:

1. ✅ **Remove empty `5_reference/` directory?**
2. ✅ **Renumber `7_troubleshooting/` → `6_troubleshooting/`?**
3. ❓ **Archive `2025-11-27_CHRONOS-213_HANDOFF.md`?** (superseded by _COMPLETE version)
4. ❓ **Keep all 10 session notes in active `session_notes/` folder?** OR move older ones to archive?
5. ✅ **Reorganize Confluence to match local folder structure?**

---

## Estimated Time

- **Phase 1:** 10 minutes (directory cleanup)
- **Phase 2:** 5 minutes (link updates)
- **Phase 3:** 5 minutes (mapping updates)
- **Phase 4:** 15 minutes (Confluence reorganization)

**Total:** 35 minutes

---

## Success Criteria

- [ ] No empty directories
- [ ] Sequential numbering (0, 1, 2, 3, 4, 6)
- [ ] All internal links working
- [ ] Confluence hierarchy matches local structure
- [ ] All 59 pages still synced and accessible
- [ ] Documentation easier to navigate
