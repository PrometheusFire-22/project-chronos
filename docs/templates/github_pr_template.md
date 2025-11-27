# 📋 GitHub Pull Request Template

**Location:** `docs/templates/github_pr_template.md`  
**Version:** 1.0  
**Last Updated:** 2025-11-20

---

## 🎯 Standard PR Format

```markdown
## 🎯 Summary

[One paragraph explaining what this PR does and why]

## ✨ Features / Changes

- Feature 1
- Feature 2
- Feature 3

## 🔗 Related Tickets

- Closes: [CHRONOS-XXX](https://automatonicai.atlassian.net/browse/CHRONOS-XXX)
- Related: [CHRONOS-YYY](https://automatonicai.atlassian.net/browse/CHRONOS-YYY)

## 📚 Documentation

- [Link to runbook / guide]
- [Link to ADR if applicable]

## 🧪 Testing

- [x] Manual testing completed
- [x] Unit tests pass
- [ ] Integration tests pass (future)
- [ ] E2E tests pass (future)

## 📋 Checklist

- [x] Code follows conventions
- [x] Documentation created/updated
- [x] Dependencies added to pyproject.toml
- [x] Pre-commit hooks pass
- [x] Jira ticket updated
```

---

## ✅ Good Examples

### Example 1: Feature PR (Jira CLI)

```markdown
## 🎯 Summary

Implements full CRUD operations for Jira tickets directly from the terminal, eliminating context switching and enabling automation workflows.

## ✨ Features

- **Create tickets** with rich descriptions and metadata
- **Read tickets** with formatted display
- **Update tickets** including status transitions
- **Delete tickets** with confirmation prompts
- **List tickets** with filtering by status
- **Auto-increment** ticket IDs from tracker

## 🔗 Related Tickets

- Closes: [CHRONOS-142](https://automatonicai.atlassian.net/browse/CHRONOS-142)
- Related: [CHRONOS-143](https://automatonicai.atlassian.net/browse/CHRONOS-143)

## 📚 Documentation

- Comprehensive runbook created: `docs/runbooks/jira_cli_runbook.md`
- Usage examples and workflows included
- Label taxonomy documented

## 🧪 Testing

- [x] Manual testing of all commands
- [x] Authentication tested with environment variables
- [x] Ticket creation and updates verified in Jira
- [x] Rich formatting displays correctly
- [ ] Automated tests (future enhancement)

## 🎨 Screenshots
```

✅ CHRONOS-143 updated successfully

```

## 📋 Checklist

- [x] Code follows Conventional Commits format
- [x] Documentation created
- [x] Dependencies added to pyproject.toml
- [x] Manual testing completed
- [x] Jira tickets updated and closed
```

### Example 2: Bug Fix PR

```markdown
## 🎯 Summary

Fixes FRED API rate limiting errors that were causing bulk ingestion failures.

## 🐛 Bug Description

During bulk ingestion of 100+ series, the FRED API was returning 429 (rate limit) errors, causing data loss and incomplete ingestions.

## 🔧 Root Cause

- No rate limiting implementation
- Missing retry logic for transient failures
- API calls made in rapid succession

## ✅ Solution

- Implemented exponential backoff using `tenacity`
- Added rate limiter: 30 requests/minute max
- Retry on 429/500/503 errors with 3 attempts
- Added request timing logs for monitoring

## 🔗 Related Tickets

- Fixes: [CHRONOS-XXX](https://automatonicai.atlassian.net/browse/CHRONOS-XXX)

## 🧪 Testing

- [x] Tested with 150+ series ingestion
- [x] No 429 errors observed
- [x] Average delay: 2.1 seconds between requests
- [x] All series ingested successfully

## 📊 Performance Impact

| Metric           | Before | After |
| ---------------- | ------ | ----- |
| Success Rate     | 67%    | 100%  |
| Avg Request Time | 0.8s   | 2.1s  |
| 429 Errors       | 45/150 | 0/150 |

## 📋 Checklist

- [x] Bug reproduced and verified
- [x] Fix tested in isolation
- [x] Integration tests pass
- [x] Performance benchmarks run
- [x] Jira ticket updated
```

### Example 3: Infrastructure PR

```markdown
## 🎯 Summary

Adds GitHub CLI to the dev container via the official devcontainer feature, enabling PR management from the terminal.

## 🔧 Changes

- Added `ghcr.io/devcontainers/features/github-cli:1` to `devcontainer.json`
- Removed manual installation workaround comments
- Fixed `forwardPorts` typo (was `forwardsPort`)

## 🔗 Related Tickets

- Relates-to: [CHRONOS-143](https://automatonicai.atlassian.net/browse/CHRONOS-143)

## 🧪 Testing

- [x] Container rebuilt successfully
- [x] `gh --version` returns 2.83.1
- [x] `gh auth login` completed successfully
- [x] `gh repo view` displays project info
- [x] `gh pr create` tested and working

## 📋 Checklist

- [x] Feature added to devcontainer.json
- [x] Container rebuilds without errors
- [x] GitHub CLI functional
- [x] Documentation updated
```

---

## ❌ Bad Examples (Don't Do This)

```markdown
❌ Title: "Update"
❌ Description: "Fixed some stuff"
❌ No ticket references
❌ No testing section
❌ Vague bullet points
❌ No links to documentation
```

---

## 🎨 Visual Elements

### Use Emojis for Sections

- 🎯 Summary
- ✨ Features
- 🐛 Bug Description
- 🔧 Changes / Solution
- 🔗 Related Tickets
- 📚 Documentation
- 🧪 Testing
- 🎨 Screenshots
- 📊 Performance / Metrics
- 📋 Checklist
- ⚠️ Breaking Changes
- 🚀 Deployment Notes

### Use Checkboxes

```markdown
## 🧪 Testing

- [x] Completed item
- [ ] Pending item
```

### Use Tables for Comparisons

```markdown
| Metric | Before | After |
| ------ | ------ | ----- |
| Speed  | 100ms  | 50ms  |
```

### Use Code Blocks

```markdown
\`\`\`bash
gh pr create --base develop --title "feat: add feature"
\`\`\`
```

---

## 🔗 Footer Links

Always include:

- Link to Jira ticket(s)
- Link to documentation
- Link to related PRs (if applicable)

```markdown
## 🔗 Related

- Jira: [CHRONOS-142](https://automatonicai.atlassian.net/browse/CHRONOS-142)
- Docs: [Jira CLI Runbook](docs/runbooks/jira_cli_runbook.md)
- Related PR: #18
```

---

## 🚀 PR Workflow

### 1. Create Feature Branch

```bash
git checkout -b feat/CHRONOS-XXX-description
```

### 2. Make Changes & Commit

```bash
git commit -m "feat(scope): description

Detailed commit message here

Closes: CHRONOS-XXX"
```

### 3. Push Branch

```bash
git push -u origin feat/CHRONOS-XXX-description
```

### 4. Create PR

```bash
gh pr create \
  --base develop \
  --title "feat(scope): description" \
  --body "$(cat PR_DESCRIPTION.md)"
```

### 5. Link to Jira

PR URL automatically appears in Jira ticket's "Development" section.

---

## 🎯 PR Title Format

**Same as commit message first line:**

```
<type>(<scope>): <subject>
```

**Examples:**

- `feat(jira): add CLI tools for ticket management`
- `fix(ingestion): handle FRED API rate limiting`
- `chore(devcontainer): add GitHub CLI feature`
- `docs(runbook): add Confluence CLI guide`

---

## 📐 Size Guidelines

### Small PR (< 200 lines)

- Single feature or bug fix
- Review time: < 30 minutes
- Example: Add single CLI command

### Medium PR (200-500 lines)

- Multiple related changes
- Review time: 30-60 minutes
- Example: Full CLI tool implementation

### Large PR (> 500 lines)

- Consider splitting
- Review time: > 60 minutes
- Example: Major refactor or new subsystem

---

## 🔍 Review Checklist (for Reviewers)

- [ ] Code follows project conventions
- [ ] Tests are adequate
- [ ] Documentation is clear
- [ ] Jira ticket linked
- [ ] No security issues
- [ ] Performance acceptable
- [ ] Breaking changes documented

---

## 🛠️ PR Template Automation

### Create `.github/pull_request_template.md`

```markdown
## 🎯 Summary

[Brief description of changes]

## 🔗 Related Tickets

- Closes: [CHRONOS-XXX](https://automatonicai.atlassian.net/browse/CHRONOS-XXX)

## 🧪 Testing

- [ ] Manual testing completed
- [ ] Tests pass

## 📋 Checklist

- [ ] Code follows conventions
- [ ] Documentation updated
- [ ] Jira ticket updated
```

This template auto-populates when creating PRs via GitHub web UI.

---

## 📚 Related Documentation

- Git Commit Template: `docs/templates/git_commit_template.md`
- Jira Ticket Template: `docs/templates/jira_ticket_template.md`
- Git Workflow Guide: `docs/4_guides/git_workflow_guide.md`
- Style Guide: `docs/1_platform_concepts/style_guide.md`

---

## ✅ Quick Reference

```bash
# Create PR with GitHub CLI
gh pr create \
  --base develop \
  --title "feat(scope): description" \
  --body "Full description here"

# View PR
gh pr view

# List PRs
gh pr list

# Merge PR
gh pr merge --squash --delete-branch
```

---

**Questions?** See recent PRs:

```bash
gh pr list --state all --limit 10
```
