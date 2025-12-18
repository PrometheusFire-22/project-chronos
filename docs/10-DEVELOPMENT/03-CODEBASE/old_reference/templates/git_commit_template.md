# Git Commit Message Template

**Use this template for ALL git commits in Project Chronos**

---

## Format
```
<type>(<scope>): <subject>

<body>

<footer>
```

---

## Quick Reference

### Types
- `feat` - New feature
- `fix` - Bug fix
- `refactor` - Code restructuring
- `docs` - Documentation only
- `test` - Tests only
- `chore` - Maintenance
- `ci` - CI/CD changes
- `perf` - Performance improvement

### Scopes (Component)
- `jira`, `confluence`, `cli`, `database`, `ingestion`, `devops`, `docker`, `ci`, `api`, `frontend`

---

## Template to Fill Out
```
<type>(<scope>): <subject line - max 72 chars>

## Changes
- Change 1
- Change 2
- Change 3

## Testing
- How you tested this
- What scenarios were verified

## Context (optional)
- Why this change was needed
- What problem it solves

AI-Assisted: <provider>/<model> (<interface>)
Session: YYYY-MM-DD

Implements: CHRONOS-XXX (if applicable)
Relates-to: CHRONOS-YYY (if applicable)
```

---

## Examples

### Example 1: Feature
```
feat(dns): configure Google Workspace DNS records

## Changes
- Added MX records for Gmail
- Added SPF record for email authentication
- Added DKIM records for domain verification
- Updated TXT records for domain ownership

## Testing
- Verified DNS propagation with dig
- Tested email sending/receiving
- Confirmed SPF/DKIM validation

## Context
Setting up professional email infrastructure for business operations.

AI-Assisted: google/gemini-2-flash (browser)
Session: 2025-11-21

Relates-to: CHRONOS-154
```

### Example 2: Configuration
```
chore(aws): configure IAM roles and permissions

## Changes
- Created admin IAM role
- Set up MFA for root account
- Configured billing alerts
- Created service account for automation

## Testing
- Verified role permissions
- Tested MFA login
- Confirmed billing alerts trigger

AI-Assisted: google/gemini-2-flash (browser)
Session: 2025-11-21

Relates-to: CHRONOS-155
```

### Example 3: Documentation
```
docs(setup): add Google Workspace onboarding guide

## Changes
- Created workspace setup guide
- Documented DNS configuration steps
- Added troubleshooting section
- Included verification checklist

## Testing
- Followed guide from scratch
- Verified all steps work
- Tested on fresh domain

AI-Assisted: google/gemini-2-flash (browser)
Session: 2025-11-21

Implements: CHRONOS-156
```

---

## AI Attribution Format

### For Gemini
```
AI-Assisted: google/gemini-2-flash (browser)
Session: YYYY-MM-DD
```

### For Claude
```
AI-Assisted: anthropic/claude-sonnet-4 (browser)
Session: YYYY-MM-DD
```

### For Claude Code
```
AI-Assisted: anthropic/claude-sonnet-4 (code)
Session: YYYY-MM-DD
```

### For GPT/Copilot
```
AI-Assisted: openai/gpt-4 (copilot)
Session: YYYY-MM-DD
```

---

## Jira Ticket Labels

Add corresponding label to Jira tickets:
- `ai-google-gemini-2-flash` - For Gemini work
- `ai-anthropic-sonnet-4-browser` - For Claude Browser
- `ai-anthropic-sonnet-4-code` - For Claude Code
- `ai-openai-gpt4-copilot` - For Copilot

---

## Checklist Before Committing

- [ ] Type and scope are accurate
- [ ] Subject line is imperative and < 72 chars
- [ ] Changes section lists all modifications
- [ ] Testing section describes verification
- [ ] AI attribution included with correct format
- [ ] Jira ticket referenced (if applicable)
- [ ] Pre-commit hooks will pass

---

**Save this file and provide it to ANY AI assistant you work with!**
