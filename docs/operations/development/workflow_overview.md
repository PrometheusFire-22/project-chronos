# 🔄 Complete Workflow: Jira + Confluence + Git + GitHub

**Version:** 1.0  
**Last Updated:** 2025-11-21  
**Purpose:** Reproducible workflow for AI-assisted development

---

## 🎯 Overview

This workflow integrates Jira (tickets), Confluence (docs), Git (code), and GitHub (PRs) into a seamless, AI-assisted development cycle.

**Key Principle:** Every piece of work has 4 artifacts:

1. **Jira Ticket** (what/why)
2. **Git Commits** (implementation)
3. **GitHub PR** (review)
4. **Confluence Page** (documentation)

---

## 📋 Prerequisites

### Tools Installed

```bash
# Verify installations
python --version  # 3.11+
git --version
gh --version      # GitHub CLI
pip list | grep -E "click|rich|atlassian"
```

### Environment Variables (.env)

```bash
# Jira/Confluence
JIRA_URL=https://yourorg.atlassian.net
JIRA_EMAIL=your@email.com
JIRA_API_TOKEN=your_token_here
JIRA_PROJECT_KEY=CHRONOS

# Confluence (usually same as Jira)
CONFLUENCE_URL=${JIRA_URL}
CONFLUENCE_EMAIL=${JIRA_EMAIL}
CONFLUENCE_API_TOKEN=${JIRA_API_TOKEN}
```

### CLI Tools Available

```bash
# Jira CLI
python src/scripts/jira_cli.py --help

# Confluence CLI
python src/scripts/confluence_cli.py --help

# GitHub CLI
gh --version
```

---

## 🔁 The Complete Workflow

### **Phase 1: Plan (Jira)**

#### Step 1.1: Create Ticket

```bash
python src/scripts/jira_cli.py create \
  --summary "feat(component): Brief description" \
  --description "As a [ROLE], I want [FEATURE], so that [BENEFIT].

## Changes Needed
* Change 1
* Change 2

## Acceptance Criteria
- [ ] Criterion 1
- [ ] Criterion 2

## Definition of Done
- [ ] Tests pass
- [ ] Documentation updated
- [ ] PR merged

## AI Assistant
Created with: Claude (Anthropic)" \
  --type "Story" \
  --priority "High" \
  --labels "component,domain" \
  --points 5
```

**Output:** `CHRONOS-XXX created`

#### Step 1.2: Note Ticket Number

```bash
TICKET="CHRONOS-XXX"  # Save for later steps
```

---

### **Phase 2: Develop (Git)**

#### Step 2.1: Create Feature Branch

```bash
# Pull latest
git checkout develop
git pull origin develop

# Create feature branch
git checkout -b feat/${TICKET}-brief-description
```

#### Step 2.2: Make Changes

```bash
# Write code, create files, etc.
# ...

# Stage changes
git add .
```

#### Step 2.3: Commit with Template

```bash
git commit -m "feat(component): Brief description

Detailed explanation of what changed and why.

## Changes
- Change 1
- Change 2

## Testing
- Manual testing completed
- Unit tests added

Implements: ${TICKET}"
```

#### Step 2.4: Push Branch

```bash
git push -u origin feat/${TICKET}-brief-description
```

---

### **Phase 3: Review (GitHub)**

#### Step 3.1: Create Pull Request

```bash
gh pr create \
  --base develop \
  --title "feat(component): Brief description" \
  --body "## 🎯 Summary

What this PR accomplishes.

## ✨ Features

- Feature 1
- Feature 2

## 🔗 Related

Implements: [${TICKET}](https://yourorg.atlassian.net/browse/${TICKET})

## 🧪 Testing

- [x] Manual testing
- [x] Unit tests pass

## 📋 Checklist

- [x] Code follows conventions
- [x] Documentation updated
- [x] Tests added

## 🤖 AI Assistant

Developed with: Claude (Anthropic)"
```

#### Step 3.2: Merge PR

```bash
# After review/approval
gh pr merge --squash --delete-branch
```

---

### **Phase 4: Document (Confluence)**

#### Step 4.1: Create Documentation Page

```bash
python src/scripts/confluence_cli.py create \
  --title "${TICKET}: Feature Name" \
  --space PC \
  --body "# Feature Name

## Overview
Brief description of the feature.

## Implementation Details
How it was built.

## Usage
How to use the feature.

## Related Work
- Jira: ${TICKET}
- PR: [Link to PR]

## AI Assistant
Documented with: Claude (Anthropic)" \
  --labels "feature,documentation" \
  --jira-ticket "${TICKET}"
```

---

### **Phase 5: Close (Jira)**

#### Step 5.1: Update Ticket Status

```bash
python src/scripts/jira_cli.py update ${TICKET} \
  --status "Done" \
  --description "Updated with final implementation details

## Completed Work
- All acceptance criteria met
- PR merged: [Link]
- Documentation created: [Confluence Link]

## Outcomes
- Feature deployed successfully
- Tests passing
- Documentation complete

## AI Assistant
Implemented with: Claude (Anthropic)"
```

---

## 🎨 Attribution Standards

### In Jira Tickets

Add this section to descriptions:

```markdown
## 🤖 AI Assistant Attribution

- **Model:** Claude 3.5 Sonnet (Anthropic)
- **Session:** 2025-11-21
- **Role:** Code generation, documentation, workflow automation
```

### In Git Commits

Add to commit footer:

```
AI-Assisted: Claude 3.5 Sonnet (Anthropic)
```

### In Confluence Pages

Add metadata section:

```markdown
---
**Created by:** Geoff Bevans
**AI Assistant:** Claude 3.5 Sonnet (Anthropic)
**Date:** 2025-11-21
---
```

### In Code Files

Add comment at top:

```python
"""
Module: feature_name.py
Author: Geoff Bevans
AI Assistant: Claude 3.5 Sonnet (Anthropic)
Created: 2025-11-21
"""
```

### AI Attribution Labels

Use granular labels for tracking:

**Format:** `ai-{provider}-{model}-{interface}`

**Examples:**

- `ai-anthropic-sonnet-4-browser` - Claude 3.5 Sonnet via claude.ai
- `ai-anthropic-opus-4-code` - Claude Opus 4 via Claude Code
- `ai-anthropic-sonnet-4-api` - Claude 3.5 Sonnet via API
- `ai-openai-gpt4-copilot` - GPT-4 via GitHub Copilot
- `ai-google-gemini-pro` - Gemini Pro via Google AI Studio

**Usage in Jira:**

```bash
python src/scripts/jira_cli.py update CHRONOS-XXX \
  --labels "component,domain,ai-anthropic-sonnet-4-browser"
```

**Usage in Git Commits:**

```
feat(component): Description

AI-Assisted: anthropic/claude-sonnet-4 (browser)
Session: 2025-11-21
```

**Usage in Confluence:**

```markdown
---
**AI Provider:** Anthropic
**Model:** Claude 3.5 Sonnet (claude-sonnet-4-20250514)
**Interface:** Browser (claude.ai)
**Session:** 2025-11-21
---
```

---

## 🔧 AI Prompt Templates

### Template 1: Start New Feature

```
I need to implement [FEATURE]. Here's what I need:

1. Create Jira ticket CHRONOS-XXX with proper description
2. Generate the implementation code
3. Write comprehensive tests
4. Create Git commit message
5. Draft GitHub PR description
6. Generate Confluence documentation

Use these templates:
- Jira: docs/templates/jira_ticket_template.md
- Git: docs/templates/git_commit_template.md
- GitHub: docs/templates/github_pr_template.md

Requirements:
[Detailed requirements here]

Please attribute yourself in all artifacts.
```

---

### Template 2: Fix Bug

```
I have a bug in [COMPONENT]:

**Issue:** [Description]
**Expected:** [Behavior]
**Actual:** [Behavior]

Please:
1. Create Jira bug ticket
2. Diagnose the issue
3. Provide fix with tests
4. Generate commit/PR descriptions
5. Update relevant documentation

Attribute yourself in all work.
```

---

### Template 3: Create Documentation

```
I need documentation for [FEATURE]:

**Location:** [Component/file]
**Audience:** [Developers/Users/etc]
**Format:** [Runbook/Guide/Reference]

Please:
1. Generate Confluence page in markdown
2. Link to related Jira tickets
3. Include usage examples
4. Add troubleshooting section

Add attribution metadata.
```

---

## 📊 Tracking AI Contributions

### Create Attribution Log (Confluence)

Create a page: "AI Collaboration Log"

```markdown
# AI Collaboration Log

## 2025-11-21: Claude Session

### Artifacts Created

- CHRONOS-142: Jira CLI Tool
- CHRONOS-143: GitHub CLI Integration
- CHRONOS-145: Confluence CLI Tool

### Code Files

- src/scripts/jira_cli.py
- src/scripts/confluence_cli.py
- docs/templates/\*.md

### Documentation

- Jira CLI Runbook
- Git Commit Template
- GitHub PR Template
- Jira Ticket Template

### Metrics

- Lines of Code: ~2000
- Tests Added: 0 (manual testing only)
- Documentation Pages: 4
- Jira Tickets: 3
```

---

## 🚀 Quick Start Checklist

For each new AI session:

- [ ] Load context from GitHub
- [ ] Review recent Jira tickets
- [ ] Check latest Confluence pages
- [ ] Pull latest from develop branch
- [ ] Verify CLI tools working
- [ ] Set TICKET variable
- [ ] Follow 5-phase workflow
- [ ] Add attribution to all artifacts
- [ ] Update AI collaboration log

---

## 🎯 Success Criteria

After each workflow cycle, verify:

- [ ] Jira ticket created and closed
- [ ] Git branch merged to develop
- [ ] GitHub PR merged
- [ ] Confluence page published
- [ ] All artifacts cross-referenced
- [ ] AI attribution added
- [ ] Tests passing
- [ ] Documentation complete

---

## 📚 Related Documentation

- Jira CLI: `docs/runbooks/jira_cli_runbook.md`
- Git Template: `docs/templates/git_commit_template.md`
- GitHub Template: `docs/templates/github_pr_template.md`
- Jira Template: `docs/templates/jira_ticket_template.md`

---

## 🔄 Workflow Diagram

```
┌─────────────┐
│  Plan (Jira)│
└──────┬──────┘
       │ Create ticket
       ▼
┌─────────────┐
│Develop (Git)│
└──────┬──────┘
       │ Feature branch → Commit → Push
       ▼
┌─────────────┐
│Review (GH)  │
└──────┬──────┘
       │ PR → Merge
       ▼
┌─────────────┐
│Doc (Confl.) │
└──────┬──────┘
       │ Create page
       ▼
┌─────────────┐
│Close (Jira) │
└─────────────┘
  Update status
```

---

## ⚠️ Common Issues

### Issue: "Token limit reached"

**Solution:** Export workflow state:

```bash
# Save current state
echo "TICKET=${TICKET}" > /tmp/workflow_state.sh
echo "BRANCH=$(git branch --show-current)" >> /tmp/workflow_state.sh
git log --oneline -5 > /tmp/recent_commits.txt

# In new session, load state
source /tmp/workflow_state.sh
```

### Issue: "AI forgets context"

**Solution:** Provide context summary:

```
Resume from: ${TICKET}
Current branch: feat/CHRONOS-XXX-name
Last commit: [paste git log -1]
Remaining work: [list tasks]
Templates: Load from docs/templates/
```

---

## 🎓 Best Practices

1. **Always attribute AI work** - Transparency is key
2. **Use templates consistently** - Ensures quality
3. **Cross-reference everything** - Jira ↔ Git ↔ GitHub ↔ Confluence
4. **Document as you go** - Don't wait until end
5. **Test before committing** - Manual validation minimum
6. **Keep sessions focused** - One feature per session
7. **Export state frequently** - Prepare for token limits

---

**Questions?** Create ticket: `python src/scripts/jira_cli.py create --summary "docs(workflow): Clarify step X"`
