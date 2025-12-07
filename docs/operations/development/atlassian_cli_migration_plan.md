# Atlassian CLI Migration Plan

**Document Status**: Active Migration Plan
**Created**: 2025-12-07
**Author**: Claude Code (AI Assistant)
**Project**: Project Chronos

---

## Executive Summary

This document outlines the migration from custom-built Jira and Confluence CLI tools to Atlassian's official CLI (`acli`). After comprehensive analysis, we've determined:

- ✅ **Jira CLI**: Can be fully migrated to official Atlassian CLI
- ⚠️ **Confluence CLI**: Must remain custom - official Atlassian CLI does not support Confluence (only Jira and Admin commands)
- ✅ **Google Workspace CLI**: Keep as-is (no official alternative)

---

## Current State Assessment

### Installed Tools

| Tool | Status | Version | Functionality |
|------|--------|---------|---------------|
| Atlassian CLI (`acli`) | ✅ Installed | 1.3.7-stable | Jira + Admin commands |
| Custom Jira CLI | 🔄 To Deprecate | Custom | Full CRUD for Jira tickets |
| Custom Confluence CLI | ✅ Keep Active | Custom | Full CRUD for Confluence pages |
| Custom Google CLI | ✅ Keep Active | Custom | Gmail, Drive, Sheets, Calendar, Admin |

### Authentication Status

- ✅ ACLI authenticated with automatonicai.atlassian.net
- ✅ User: axiologycapital@gmail.com (Geoff Bevans)
- ✅ Authentication type: API Token
- ✅ Verified working with Project Chronos (CHRONOS)

---

## Migration Strategy

### Phase 1: Jira CLI Migration (Sprint 9 - IMMEDIATE)

**Goal**: Replace custom Jira CLI (`src/chronos/cli/jira_cli.py`) with official ACLI

**Approach**: CLEAN REPLACEMENT (no wrappers)
- Direct substitution of custom CLI with ACLI commands
- Update automation scripts to call ACLI natively
- Remove all traces of proprietary Jira CLI
- Preserve and enhance existing workflows

#### Feature Mapping

| Custom CLI Command | ACLI Equivalent | Notes |
|-------------------|-----------------|-------|
| `jira create` | `acli jira workitem create` | Direct replacement |
| `jira read CHRONOS-X` | `acli jira workitem view CHRONOS-X` | Direct replacement |
| `jira update` | `acli jira workitem edit` | Direct replacement |
| `jira delete` | `acli jira workitem delete` | Direct replacement |
| `jira list` | `acli jira workitem search` | Enhanced with JQL support |
| `jira bulk-close` | `acli jira workitem edit` (bulk) | Use `--issue` flag multiple times |
| `jira next-id` | Custom script (keep) | ACLI doesn't track next ID |
| N/A | `acli jira workitem create-bulk` | **NEW**: Bulk creation capability |
| N/A | `acli jira workitem transition` | **NEW**: Status transitions |
| N/A | `acli jira workitem assign` | **NEW**: Assignment operations |
| N/A | `acli jira workitem comment` | **NEW**: Comment management |
| N/A | `acli jira workitem attachment` | **NEW**: Attachment handling |

#### Additional ACLI Capabilities

**Sprint Management**:
- `acli jira sprint list-workitems` - List work items in sprint

**Board Management**:
- `acli jira board` commands for Kanban/Scrum boards

**Dashboard Management**:
- `acli jira dashboard` commands

**Filter Management**:
- `acli jira filter` commands for saved JQL filters

**Field Management**:
- `acli jira field` commands for custom fields

**Project Management**:
- `acli jira project create|delete|list|view|update|archive|restore`

#### Migration Steps

**NO WRAPPER SCRIPTS** - Direct ACLI integration only

1. **Update automation scripts** (Week 1-2)
   - Files to update:
     - `scripts/ops/cleanup_jira_backlog.py`
     - `scripts/ops/organize_jira_retroactive.py`
     - `scripts/ops/perform_retroactive_updates.py`
     - `scripts/ops/list_sprints.py`
   - Action: Replace custom CLI calls with ACLI commands

3. **Update documentation** (Week 2)
   - Files to update:
     - `docs/reference/cli/jira_cli.md`
     - `docs/guides/development/jira_workflow.md`
     - `docs/operations/development/workflow_overview.md`
   - Action: Document ACLI usage patterns and examples

4. **Update shell integrations** (Week 2)
   - Check for any shell aliases or functions
   - Update PATH references
   - Update autocompletion (ACLI supports this)

5. **Deprecate custom Jira CLI** (Week 3)
   - Move `src/chronos/cli/jira_cli.py` to `src/chronos/cli/_deprecated/`
   - Remove `jira` entry point from `pyproject.toml`
   - Archive documentation to `docs/_archive/deprecated/`
   - Update `.gitignore` if needed

6. **Clean up LAST_TICKET.txt tracker** (Week 3)
   - Decision needed: Keep or deprecate?
   - ACLI doesn't provide next-ID functionality
   - Consider: Create standalone script if needed

#### Testing Checklist

- [ ] Test work item creation with all fields (summary, description, type, priority, labels, points)
- [ ] Test work item viewing/reading
- [ ] Test work item editing (status, priority, description)
- [ ] Test work item deletion
- [ ] Test work item search with filters (status, sprint, labels)
- [ ] Test bulk operations
- [ ] Test sprint operations
- [ ] Verify integration with existing automation scripts
- [ ] Verify Git commit hooks still work
- [ ] Verify PR creation workflow still works

---

### Phase 2: Confluence CLI - Keep Custom Implementation

**Decision**: RETAIN custom Confluence CLI indefinitely

**Rationale**:
- Official Atlassian CLI does **NOT** support Confluence operations
- Only third-party marketplace tools available (Appfire ACLI - different product)
- Custom CLI provides critical functionality:
  - Markdown-to-Confluence conversion
  - Smart linking with `.confluence-mapping.json`
  - Read-only banner automation
  - Hierarchical page organization
  - Jira ticket macro embedding

**Actions**:
- ✅ No migration needed
- ✅ Keep `src/chronos/cli/confluence_cli.py` active
- ✅ Keep all Confluence automation scripts:
  - `scripts/ops/sync_docs.py`
  - `scripts/ops/bulk_sync_confluence.py`
  - `scripts/ops/organize_confluence_hierarchy.py`
  - `scripts/ops/cleanup_confluence_duplicates.py`
  - `scripts/ops/daily_confluence_sync.sh`
- ✅ Maintain documentation:
  - `docs/reference/cli/confluence_cli.md`
  - `docs/operations/development/confluence_bulk_sync.md`

**Future Considerations**:
- Monitor Atlassian CLI roadmap for Confluence support
- Consider third-party Appfire CLI if official support never materializes
- Current custom solution is working well - no urgency to change

---

### Phase 3: Google Workspace CLI - Keep Custom Implementation

**Decision**: RETAIN custom Google Workspace CLI

**Rationale**:
- Highly customized integration with service account delegation
- Tailored to specific business workflows
- No official Google CLI equivalent for Workspace Admin operations
- Well-integrated with project architecture

**Actions**:
- ✅ No changes needed
- ✅ Continue using `src/chronos/cli/google_cli.py`
- ✅ Maintain all Google integration modules:
  - `src/chronos/integrations/google/auth.py`
  - `src/chronos/integrations/google/client.py`
  - `src/chronos/integrations/google/gmail.py`
  - `src/chronos/integrations/google/drive.py`
  - `src/chronos/integrations/google/sheets.py`
  - `src/chronos/integrations/google/calendar.py`
  - `src/chronos/integrations/google/admin.py`

---

## Detailed ACLI Command Reference

### Common Jira Work Item Operations

#### Create a Work Item
```bash
acli jira workitem create \
  --project "CHRONOS" \
  --type "Story" \
  --summary "Implement user authentication" \
  --description "Add JWT-based authentication to the API" \
  --priority "High" \
  --labels "backend,security,sprint-9"
```

#### View a Work Item
```bash
acli jira workitem view CHRONOS-140
```

#### Edit a Work Item
```bash
acli jira workitem edit CHRONOS-140 \
  --summary "Updated summary" \
  --priority "Medium" \
  --labels "backend,security"
```

#### Search for Work Items
```bash
# Search by status
acli jira workitem search --jql "project=CHRONOS AND status='To Do'"

# Search by sprint (using labels)
acli jira workitem search --jql "project=CHRONOS AND labels='sprint-9'"

# Search by assignee
acli jira workitem search --jql "project=CHRONOS AND assignee=currentUser()"
```

#### Transition Work Item (Change Status)
```bash
acli jira workitem transition CHRONOS-140 --status "In Progress"
acli jira workitem transition CHRONOS-140 --status "Done"
```

#### Delete Work Items
```bash
acli jira workitem delete CHRONOS-140
acli jira workitem delete CHRONOS-140 CHRONOS-141 CHRONOS-142  # Bulk delete
```

#### Bulk Create
```bash
acli jira workitem create-bulk --file tickets.json
```

#### Assign Work Items
```bash
acli jira workitem assign CHRONOS-140 --assignee "geoff@example.com"
```

#### Add Comments
```bash
acli jira workitem comment add CHRONOS-140 --body "Fixed authentication bug"
```

### Sprint Operations

```bash
# List work items in a sprint
acli jira sprint list-workitems --sprint-id 7
```

### Project Operations

```bash
# List all projects
acli jira project list

# View project details
acli jira project view --project "CHRONOS"

# Create new project
acli jira project create --name "New Project" --key "NP" --type "software"
```

---

## Workflow Integration Updates

### Git Commit Hooks

**Current workflow** (ADR-007):
```
1. Create Jira Ticket (CHRONOS-XXX) with spec
2. Create Git branch (feat/CHRONOS-XXX-description)
3. Make commits (referencing CHRONOS-XXX)
4. Create GitHub PR (linked to CHRONOS-XXX)
5. Create Confluence page (linked to CHRONOS-XXX)
6. Update Jira ticket to Done
```

**Updated commands**:
```bash
# Step 1: Create ticket (NEW)
acli jira workitem create \
  --project "CHRONOS" \
  --type "Story" \
  --summary "Feature description" \
  --description "Detailed spec" \
  --labels "sprint-9"

# Step 6: Update ticket status (NEW)
acli jira workitem transition CHRONOS-XXX --status "Done"
```

### Documentation Sync Workflow

**No changes needed** - Confluence CLI remains custom:
```bash
# Still use existing workflow
python scripts/ops/sync_docs.py
python scripts/ops/bulk_sync_confluence.py
./scripts/ops/daily_confluence_sync.sh
```

---

## Configuration Files to Update

### pyproject.toml

**Remove** (after migration complete):
```toml
[project.scripts]
jira = "chronos.cli.jira_cli:cli"  # REMOVE THIS LINE
```

**Keep**:
```toml
[project.scripts]
confluence = "chronos.cli.confluence_cli:cli"  # KEEP
google = "chronos.cli.google_cli:cli"  # KEEP
```

### Shell Configuration

**Add to ~/.bashrc or ~/.zshrc**:
```bash
# Atlassian CLI autocompletion
eval "$(acli completion bash)"  # or zsh, fish, powershell
```

### Environment Variables

**No changes needed** - `.env` file remains the same:
- ACLI uses same API tokens as custom CLI
- Credentials already configured during installation

---

## Documentation Updates Required

### Files to Create/Update

1. **Create**: `docs/reference/cli/atlassian_cli.md`
   - ACLI installation guide
   - ACLI authentication setup
   - ACLI command reference
   - ACLI best practices

2. **Update**: `docs/guides/development/jira_workflow.md`
   - Replace custom CLI examples with ACLI
   - Add ACLI-specific patterns
   - Document bulk operations

3. **Update**: `docs/operations/development/workflow_overview.md`
   - Update Jira integration section
   - Keep Confluence integration as-is
   - Document hybrid CLI approach

4. **Archive**: `docs/reference/cli/jira_cli.md`
   - Move to `docs/_archive/deprecated/jira_cli_legacy.md`
   - Add deprecation notice with migration date
   - Keep for historical reference

5. **Update**: `docs/reference/templates/`
   - Update any templates that reference Jira CLI commands
   - Ensure commit message templates still work

### Confluence Pages to Update

**Required syncs** (after documentation updates):
```bash
python scripts/ops/sync_docs.py \
  docs/reference/cli/atlassian_cli.md \
  docs/guides/development/jira_workflow.md \
  docs/operations/development/workflow_overview.md
```

---

## Risk Assessment and Mitigation

### Risks

| Risk | Severity | Probability | Mitigation |
|------|----------|-------------|------------|
| Breaking existing automation scripts | High | Medium | Comprehensive testing; gradual rollout |
| Lost functionality from custom CLI | Medium | Low | Feature mapping shows ACLI has more features |
| Learning curve for new commands | Low | High | Documentation and examples; wrappers |
| ACLI bugs or instability | Medium | Low | Keep custom CLI available during transition |
| Confluence CLI still needed | Low | Certain | Already decided - keep custom solution |

### Rollback Plan

If migration encounters critical issues:

1. **Immediate rollback**: Custom Jira CLI code is archived, not deleted
2. **Restore entry point**: Re-add to `pyproject.toml`
3. **Reinstall**: `pip install -e .` to restore `jira` command
4. **Revert scripts**: Use Git to revert automation scripts
5. **Timeline**: Can rollback in < 30 minutes

---

## Success Criteria

### Phase 1 (Jira Migration) Complete When:

- [ ] All automation scripts using ACLI instead of custom CLI
- [ ] All documentation updated and synced to Confluence
- [ ] Testing checklist 100% complete
- [ ] No references to custom Jira CLI in active code
- [ ] Custom Jira CLI moved to `_deprecated/` directory
- [ ] Team comfortable with ACLI commands
- [ ] Shell autocompletion configured
- [ ] No regressions in workflow efficiency

### Phase 2 (Confluence) Complete When:

- [ ] N/A - Keeping custom implementation
- [ ] Documentation updated to clarify decision
- [ ] Monitoring plan for official Atlassian CLI roadmap

### Phase 3 (Google Workspace) Complete When:

- [ ] N/A - Keeping custom implementation
- [ ] Integration tests passing
- [ ] Documentation current

---

## Timeline

**REVISED**: Sequential, focused sprints (NO parallel major projects)

| Sprint | Focus | Duration | Status |
|--------|-------|----------|--------|
| **Sprint 9** | ACLI Migration (ONLY) | 2-3 weeks | 🔜 Starting |
| **Sprint 10** | Marketing Site (ONLY) | 2-3 weeks | 📋 Planned |
| **Sprint 11** | Database Hardening (ONLY) | 2-3 weeks | 📋 Planned |
| **Sprint 12-13** | FastAPI Backend | 4-6 weeks | 📋 Planned |
| **Sprint 14-15** | Next.js Dynamic App | 4-6 weeks | 📋 Planned |

### Sprint 9 Breakdown (ACLI Migration)

**Week 1**: Direct Replacement Implementation
- Update automation scripts to call ACLI directly
- Remove custom CLI calls from all scripts
- Test basic CRUD operations

**Week 2**: Testing and Documentation
- Comprehensive testing of all workflows
- Update documentation with ACLI examples
- Update shell configurations
- Verify Git/GitHub integrations

**Week 3**: Deprecation and Cleanup
- Move custom Jira CLI to `_deprecated/`
- Remove entry points from `pyproject.toml`
- Archive old documentation
- Final validation

---

## Post-Migration Maintenance

### Ongoing Activities

1. **Monitor ACLI Updates**
   - Check for new releases every 6 months
   - Test new features for workflow improvements
   - Update when new capabilities added

2. **Watch for Confluence Support**
   - Monitor Atlassian CLI roadmap
   - Evaluate when/if Confluence commands added
   - Plan migration if official support emerges

3. **Keep Documentation Current**
   - Update examples as workflows evolve
   - Add new ACLI capabilities to runbooks
   - Sync to Confluence quarterly

4. **Shell Configuration**
   - Ensure new team members configure autocompletion
   - Add to onboarding documentation

---

## Appendix A: Command Comparison Matrix

| Operation | Custom CLI | ACLI | Complexity Change |
|-----------|-----------|------|-------------------|
| Create ticket | `jira create --summary "X" --description "Y"` | `acli jira workitem create --project CHRONOS --summary "X" --description "Y"` | Slightly more verbose |
| Read ticket | `jira read CHRONOS-140` | `acli jira workitem view CHRONOS-140` | Equivalent |
| Update ticket | `jira update CHRONOS-140 --status "Done"` | `acli jira workitem transition CHRONOS-140 --status "Done"` | Different command |
| Delete ticket | `jira delete CHRONOS-140` | `acli jira workitem delete CHRONOS-140` | Equivalent |
| List tickets | `jira list --sprint 9` | `acli jira workitem search --jql "project=CHRONOS AND labels='sprint-9'"` | More powerful (JQL) |
| Bulk close | `jira bulk-close CHRONOS-140,141,142 --reason "X"` | `acli jira workitem edit CHRONOS-140 CHRONOS-141 CHRONOS-142 --description "X"` | Different approach |

---

## Appendix B: Useful ACLI Resources

- **Installation Guide**: https://developer.atlassian.com/cloud/acli/guides/install-linux/
- **Getting Started**: https://developer.atlassian.com/cloud/acli/guides/how-to-get-started/
- **Jira Commands**: `acli jira --help`
- **Autocompletion Setup**: `acli completion --help`
- **Feedback/Issues**: `acli feedback`

---

## Appendix C: Scripts Requiring Updates

### High Priority (Directly Call Jira CLI)

1. `scripts/ops/cleanup_jira_backlog.py` - Bulk ticket operations
2. `scripts/ops/organize_jira_retroactive.py` - Retroactive ticket updates
3. `scripts/ops/perform_retroactive_updates.py` - Batch updates
4. `scripts/ops/list_sprints.py` - Sprint listing

### Medium Priority (May Reference Jira CLI)

5. `scripts/ops/update_sprint9_tickets.py` - Sprint-specific updates
6. Any shell scripts in `scripts/workflows/jira/`

### Low Priority (Documentation Only)

7. `docs/reference/cli/jira_cli.md`
8. `docs/guides/development/jira_workflow.md`
9. `docs/operations/development/workflow_overview.md`

---

## Questions for User

Before proceeding with migration, please confirm:

1. **Timeline**: When would you like to start Phase 1 (Jira migration)?
2. **Testing**: Do you want a parallel testing period where both CLIs are available?
3. **LAST_TICKET.txt**: Should we keep the next-ID tracker or deprecate it?
4. **Automation Priority**: Which automation scripts are most critical to test first?
5. **Rollback Threshold**: What would trigger a rollback decision?

---

**End of Migration Plan**
