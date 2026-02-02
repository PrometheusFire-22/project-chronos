# Git Flow & Jira Integration Guide

**Status**: Active
**Last Updated**: 2026-02-02
**Applies To**: All development work

---

## 🎯 Overview

Project Chronos uses a **feature branch workflow** with **Jira ticket tagging** for traceability.

**Key Principles**:
1. **Never commit directly to `main`**
2. **Always create feature branches** from `main`
3. **Always reference Jira ticket** in branch name and commits
4. **Use Pull Requests** for code review
5. **Squash and merge** to keep history clean

---

## 📋 Branch Naming Convention

### Format

```
<type>/<JIRA-TICKET>-<short-description>
```

### Types

| Type | Usage | Example |
|------|-------|---------|
| `feat` | New features | `feat/CHRONOS-495-modal-gpu-integration` |
| `fix` | Bug fixes | `fix/CHRONOS-459-restore-directus-exports` |
| `chore` | Maintenance, deps | `chore/CHRONOS-484-env-consolidation` |
| `docs` | Documentation | `docs/CHRONOS-398-data-catalog-docs` |
| `refactor` | Code refactoring | `refactor/CHRONOS-456-fastapi-migration` |
| `test` | Adding tests | `test/CHRONOS-471-unit-metadata-tests` |
| `perf` | Performance | `perf/CHRONOS-XXX-optimize-queries` |

### Examples (Good)

```bash
✅ feat/CHRONOS-495-modal-gpu-integration
✅ fix/CHRONOS-459-restore-directus-exports
✅ chore/CHRONOS-484-consolidate-env-vars
✅ docs/CHRONOS-398-create-data-catalog-dashboard
```

### Examples (Bad)

```bash
❌ fix/restore-exports  # Missing Jira ticket
❌ CHRONOS-495  # Missing type and description
❌ modal-integration  # Missing Jira ticket
❌ geoff-working-on-stuff  # Not descriptive
```

---

## 🔄 Git Workflow

### Step 1: Create Feature Branch

```bash
# Ensure main is up to date
git checkout main
git pull origin main

# Create feature branch
git checkout -b feat/CHRONOS-XXX-short-description

# Example:
git checkout -b feat/CHRONOS-495-modal-gpu-integration
```

---

### Step 2: Work on Feature

```bash
# Make changes
# ... edit files ...

# Stage changes
git add apps/ingestion-worker/modal_functions/
git add docs/10-DEVELOPMENT/01-ARCHITECTURE/adrs/adr_020_modal_gpu_document_processing.md

# Commit with Jira tag
git commit -m "feat(ingestion): add Modal GPU integration for Docling [CHRONOS-495]

- Add Modal function for GPU-accelerated document processing
- Update IngestionService with hybrid CPU/GPU support
- Add ADR 020 documenting Modal decision
- Add cost analysis for GPU processing

Related: CHRONOS-494 (metadata ingestion)"
```

---

### Step 3: Commit Message Format

```
<type>(<scope>): <short summary> [JIRA-TICKET]

<detailed description>

- Bullet point 1
- Bullet point 2

Related: OTHER-TICKET
```

**Components**:
- `<type>`: feat, fix, chore, docs, refactor, test, perf
- `<scope>`: Component affected (ingestion, api, web, cms, db)
- `<short summary>`: Imperative mood, lowercase, no period (50 chars max)
- `[JIRA-TICKET]`: Always include in square brackets
- `<detailed description>`: Explain WHY, not WHAT (72 chars per line)

**Examples**:

```bash
# Feature
git commit -m "feat(api): add unit metadata to economic endpoints [CHRONOS-471]

Adds unit_type, scalar_factor, and display_units fields to:
- GET /api/economic/series
- GET /api/economic/timeseries

This enables proper frontend display of units (%, billions, etc.)

Related: CHRONOS-470 (scalar transformations)"

# Bug fix
git commit -m "fix(cms): restore old Directus exports alongside new cms_pages [CHRONOS-459]

Reverts accidental deletion of Directus collection exports.
Both old and new exports are now available for migration reference."

# Chore
git commit -m "chore(deps): add Modal for GPU document processing [CHRONOS-495]

Adds modal ^1.3.2 to dev dependencies for GPU-accelerated Docling processing.
Reduces Python version constraint to <3.15 for Modal compatibility."

# Documentation
git commit -m "docs(ops): add comprehensive cost analysis for 2026 Q1 [CHRONOS-XXX]

Documents current infrastructure costs and projections:
- Current: ~$120-150/mo
- After optimization: ~$80-100/mo
- At scale (10K users): ~$800-1,200/mo

Includes Modal GPU cost breakdown and optimization strategies."
```

---

### Step 4: Push to Remote

```bash
# First push
git push -u origin feat/CHRONOS-XXX-short-description

# Subsequent pushes
git push
```

---

### Step 5: Create Pull Request

**Via GitHub CLI** (recommended):

```bash
gh pr create \
  --title "feat(ingestion): Modal GPU integration for Docling [CHRONOS-495]" \
  --body "$(cat <<'EOF'
## Summary
Implements GPU-accelerated document processing using Modal:
- 10-20x faster than CPU processing (10-30s vs 2-5min)
- Scales to zero (no idle GPU costs)
- Cost-effective for PoC (~$0.01/doc)

## Changes
- ✅ Modal function for Docling processing
- ✅ Hybrid IngestionService (GPU + CPU fallback)
- ✅ ADR 020: Modal GPU decision
- ✅ Cost analysis document
- ✅ Quick start guide

## Test Plan
- [x] Modal function deploys successfully
- [x] Test PDF processes on GPU
- [x] Full pipeline (Directus → Modal → PostgreSQL)
- [x] CPU fallback works
- [ ] Production deployment

## Related
- Jira: CHRONOS-495
- Related: CHRONOS-494 (metadata ingestion)
- ADR: [ADR 020](../docs/10-DEVELOPMENT/01-ARCHITECTURE/adrs/adr_020_modal_gpu_document_processing.md)

🤖 Generated with [Claude Code](https://claude.com/claude-code)
EOF
)" \
  --base main \
  --head feat/CHRONOS-495-modal-gpu-integration
```

**Via GitHub Web UI**:

1. Go to: https://github.com/PrometheusFire-22/project-chronos/pulls
2. Click "New Pull Request"
3. Base: `main`, Compare: `feat/CHRONOS-XXX-...`
4. Fill in template (see above)

---

### Step 6: Code Review & Merge

**Self-Review Checklist** (before requesting review):

- [ ] All tests pass
- [ ] No linting errors
- [ ] Documentation updated
- [ ] Commit messages follow convention
- [ ] Jira ticket referenced in all commits
- [ ] PR description is clear and complete

**Merge Strategy**: **Squash and Merge**

This keeps `main` history clean with one commit per feature.

```bash
# After PR approval, squash and merge via GitHub UI
# Or via CLI:
gh pr merge --squash --delete-branch
```

Final commit on `main` will look like:
```
feat(ingestion): Modal GPU integration for Docling [CHRONOS-495] (#132)

- Add Modal function for GPU-accelerated document processing
- Update IngestionService with hybrid CPU/GPU support
- Add ADR 020 documenting Modal decision
- Add cost analysis for GPU processing

Related: CHRONOS-494
```

---

### Step 7: Update Jira Ticket

After merge:

1. Go to Jira ticket: https://automatonicai.atlassian.net/browse/CHRONOS-495
2. Add comment:
   ```
   ✅ Merged to main in PR #132
   https://github.com/PrometheusFire-22/project-chronos/pull/132

   Changes:
   - Modal GPU integration complete
   - 10-20x performance improvement
   - Cost analysis documented

   Next: Production deployment testing
   ```
3. Move ticket to "Done" (if complete) or "In Review" (if testing needed)

---

## 🔍 Current Branch Status (as of 2026-02-02)

```
* fix/CHRONOS-459-restore-directus-exports (current)
* main
```

**Action Required**:
1. ✅ Complete current work on CHRONOS-459
2. ✅ Create PR for CHRONOS-459
3. ✅ Merge to main
4. ✅ Create new branch for CHRONOS-495 (Modal integration)

---

## 🚨 Common Mistakes & Fixes

### Mistake 1: Forgot Jira tag in commit

**Fix** (before push):
```bash
# Amend last commit
git commit --amend -m "feat(api): add unit metadata [CHRONOS-471]"
```

**Fix** (after push):
```bash
# Don't rewrite history on shared branches
# Instead, add a follow-up commit with proper tagging
git commit --allow-empty -m "chore: link previous commit to [CHRONOS-471]"
```

---

### Mistake 2: Committed to `main` directly

**Fix**:
```bash
# Undo last commit (keep changes)
git reset --soft HEAD~1

# Create feature branch
git checkout -b feat/CHRONOS-XXX-description

# Re-commit with proper message
git commit -m "feat(scope): description [CHRONOS-XXX]"
```

---

### Mistake 3: Multiple unrelated changes in one commit

**Fix** (before push):
```bash
# Undo last commit, keep changes staged
git reset --soft HEAD~1

# Unstage all
git reset

# Stage and commit separately
git add file1.py
git commit -m "feat(api): feature 1 [CHRONOS-471]"

git add file2.py
git commit -m "feat(web): feature 2 [CHRONOS-472]"
```

---

### Mistake 4: Need to update branch with latest `main`

```bash
# Fetch latest main
git fetch origin main

# Rebase feature branch on main
git rebase origin/main

# If conflicts, resolve and continue
git add .
git rebase --continue

# Force push (only on feature branches!)
git push --force-with-lease
```

---

## 📊 Git Aliases (Optional but Recommended)

Add to `~/.gitconfig`:

```ini
[alias]
    # Quick commit with Jira tag
    c = "!f() { git commit -m \"$1 [$2]\"; }; f"

    # Create feature branch
    fb = "!f() { git checkout -b feat/$1-$2; }; f"

    # Quick push
    p = push

    # Pull with rebase
    pr = pull --rebase

    # Pretty log
    lg = log --graph --oneline --decorate --all

    # Show files in last commit
    last = diff-tree --no-commit-id --name-only -r HEAD

    # Undo last commit (keep changes)
    undo = reset --soft HEAD~1
```

Usage:
```bash
# Create feature branch
git fb CHRONOS-495 modal-gpu-integration

# Commit with Jira tag
git c "feat(api): add endpoint" CHRONOS-471

# Pretty log
git lg
```

---

## 🔗 Integration with Tools

### GitHub Actions (CI/CD)

Add to `.github/workflows/pr-checks.yml`:

```yaml
name: PR Checks

on:
  pull_request:
    branches: [main]

jobs:
  validate-pr:
    runs-on: ubuntu-latest
    steps:
      - name: Check PR title has Jira ticket
        run: |
          if ! echo "${{ github.event.pull_request.title }}" | grep -qE 'CHRONOS-[0-9]+'; then
            echo "❌ PR title must include Jira ticket (e.g., [CHRONOS-123])"
            exit 1
          fi

      - name: Check branch name
        run: |
          if ! echo "${{ github.head_ref }}" | grep -qE '^(feat|fix|chore|docs|refactor|test|perf)/CHRONOS-[0-9]+'; then
            echo "❌ Branch must follow naming convention: <type>/CHRONOS-XXX-description"
            exit 1
          fi
```

---

## ✅ Checklist for New Features

Use this checklist for every new feature:

**Before Starting**:
- [ ] Jira ticket created and assigned
- [ ] Ticket has clear acceptance criteria
- [ ] Branch created from latest `main`
- [ ] Branch follows naming convention

**During Development**:
- [ ] Commits reference Jira ticket
- [ ] Commits are atomic (one logical change)
- [ ] Commit messages are descriptive
- [ ] Tests added/updated
- [ ] Documentation updated

**Before PR**:
- [ ] All tests pass locally
- [ ] No linting errors
- [ ] Code reviewed by self
- [ ] Branch rebased on latest `main`

**PR**:
- [ ] Title includes Jira ticket
- [ ] Description follows template
- [ ] Test plan included
- [ ] Screenshots/demo (if UI changes)

**After Merge**:
- [ ] Jira ticket updated with PR link
- [ ] Ticket moved to appropriate status
- [ ] Feature branch deleted
- [ ] Verified on `main`

---

## 📚 References

- **Git Flow**: https://www.atlassian.com/git/tutorials/comparing-workflows/gitflow-workflow
- **Conventional Commits**: https://www.conventionalcommits.org/
- **Jira Integration**: https://support.atlassian.com/jira-cloud-administration/docs/integrate-with-github/
- **GitHub PR Best Practices**: https://github.com/blog/1943-how-to-write-the-perfect-pull-request

---

**Next**: Set up GitHub Actions for automated PR validation
