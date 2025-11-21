# 🎯 Jira Ticket Template

**Location:** `docs/templates/jira_ticket_template.md`  
**Version:** 1.0  
**Last Updated:** 2025-11-20

---

## 📋 Standard Ticket Format

```markdown
As a [USER_ROLE], I want [FEATURE], so that [BENEFIT].

## Changes Needed

- Change 1
- Change 2
- Change 3

## Acceptance Criteria

- [ ] Criterion 1
- [ ] Criterion 2
- [ ] Criterion 3

## Definition of Done

- [ ] Tests pass
- [ ] Coverage >= 80%
- [ ] Documentation updated
- [ ] Code reviewed
- [ ] Deployed to staging

## Technical Notes (optional)

- Implementation detail 1
- Implementation detail 2
```

---

## ✅ Good Examples

### Example 1: Feature Story (Complete)

**Summary:** `feat(jira): add CLI tools for ticket management and updates`

**Description:**

```markdown
As a Developer, I want CLI tools for Jira ticket management, so that I can create and update tickets from the terminal without context switching.

## Changes Needed

- Create jira_cli.py with full CRUD operations
- Create jira_update.py for bulk programmatic updates
- Add jira_ingest.py for batch ticket creation from CSV
- Implement workflows/jira/catalog.csv for ticket metadata
- Add LAST_TICKET.txt tracker for auto-incrementing IDs
- Create comprehensive runbook documentation

## Acceptance Criteria

- [x] jira_cli.py supports create/read/update/delete/list commands
- [x] Rich formatting displays tickets cleanly
- [x] Authentication via environment variables (.env)
- [x] Ticket creation auto-increments from last ID
- [x] Bulk operations supported via catalog.csv

## Definition of Done

- [x] All CLI commands tested and working
- [x] Dependencies added to pyproject.toml
- [x] Runbook documentation created
- [ ] Integration with gh CLI workflow (future enhancement)

## Technical Stack

- click: CLI framework
- rich: Terminal formatting
- requests: Jira REST API client
- python-dotenv: Environment variable management
```

**Fields:**

- Type: Story
- Priority: High
- Labels: `cli`, `automation`, `issue-tracking`
- Story Points: 8
- Sprint: Sprint 3

---

### Example 2: Bug Fix

**Summary:** `fix(ingestion): handle FRED API rate limiting correctly`

**Description:**

```markdown
As a Developer, I want the FRED API ingestion to handle rate limiting, so that bulk ingestions complete successfully without data loss.

## Problem Description

During bulk ingestion of 100+ series, the FRED API returns 429 (rate limit) errors, causing incomplete data loads.

## Root Cause

- No rate limiting implementation
- Missing retry logic for transient failures
- API calls made in rapid succession

## Changes Needed

- Implement exponential backoff using tenacity
- Add rate limiter: 30 requests/minute max
- Retry on 429/500/503 errors with 3 attempts
- Add request timing logs for monitoring

## Acceptance Criteria

- [ ] No 429 errors during 100+ series ingestion
- [ ] Successful ingestion rate >= 95%
- [ ] Retry logic logs attempts and outcomes
- [ ] Rate limiter configurable via environment

## Definition of Done

- [ ] Bug reproduced in test environment
- [ ] Fix implemented and tested
- [ ] Integration tests pass
- [ ] Performance benchmarks show improvement
- [ ] Documentation updated with retry strategy

## Technical Notes

- Use tenacity.retry decorator
- Implement token bucket algorithm for rate limiting
- Log timing metrics to logs/ingestion_YYYYMMDD.log
```

**Fields:**

- Type: Bug
- Priority: Critical
- Labels: `ingestion`, `fred`, `api`, `bugfix`
- Story Points: 5
- Sprint: Sprint 3

---

### Example 3: Technical Debt / Chore

**Summary:** `chore(devcontainer): add GitHub CLI feature`

**Description:**

```markdown
As a Developer, I want GitHub CLI integrated into the dev container, so that I can manage PRs and repos from the terminal.

## Changes Needed

- Add ghcr.io/devcontainers/features/github-cli:1 to devcontainer.json
- Remove manual installation workaround comments
- Fix forwardPorts typo in devcontainer config

## Acceptance Criteria

- [x] GitHub CLI accessible in container
- [x] gh auth login works successfully
- [x] gh repo view displays project info
- [x] Container rebuilds without errors

## Definition of Done

- [x] Feature branch merged to develop
- [x] Container rebuilt with GitHub CLI
- [x] Authentication tested and working
- [x] Documentation updated (this ticket)
```

**Fields:**

- Type: Task
- Priority: Medium
- Labels: `devops`, `infrastructure`, `devcontainer`
- Story Points: 2
- Sprint: Sprint 3

---

### Example 4: Spike / Research

**Summary:** `spike(crm): research and select lead management tool`

**Description:**

```markdown
As a Founder, I want to evaluate CRM options, so that I can make an informed decision on the best tool for lead management.

## Research Questions

- What CRM tools have free tiers suitable for solo founders?
- Which integrate with Jira/Confluence?
- What are the API capabilities for automation?
- What are vendor lock-in risks?

## Research Activities

- Compare HubSpot, Salesforce, Pipedrive, Mautic
- Score each tool on: cost, features, integrations, lock-in
- Document findings in ADR format
- Present recommendation with rationale

## Acceptance Criteria

- [ ] At least 4 CRM tools evaluated
- [ ] Scorecard completed with weighted criteria
- [ ] ADR created: docs/5_decisions/adr_006_crm_selection.md
- [ ] Recommendation presented with pros/cons

## Definition of Done

- [ ] ADR published and reviewed
- [ ] Decision documented
- [ ] Implementation ticket created (if applicable)

## Time Box

- Maximum 4 hours of research
- Must produce decision even if incomplete data
```

**Fields:**

- Type: Spike
- Priority: Medium
- Labels: `research`, `discovery`, `strategy`, `crm`
- Story Points: 3
- Sprint: Sprint 3

---

## 🎨 Ticket Structure Breakdown

### Section 1: User Story (Required)

```markdown
As a [USER_ROLE], I want [FEATURE], so that [BENEFIT].
```

**User Roles:**

- Developer
- Founder
- Data Analyst
- DevOps Engineer
- End User
- System (for automated processes)

---

### Section 2: Changes Needed (Required)

```markdown
## Changes Needed

- Specific change 1
- Specific change 2
- Specific change 3
```

**Purpose:** Clear scope definition. What files/components will change?

---

### Section 3: Acceptance Criteria (Required)

```markdown
## Acceptance Criteria

- [ ] Criterion 1
- [ ] Criterion 2
- [ ] Criterion 3
```

**Rules:**

- Must be testable
- Must be specific
- Use checkboxes for tracking
- Focus on outcomes, not process

**Good:**

- ✅ "All unit tests pass"
- ✅ "API returns 200 status for valid requests"
- ✅ "Dashboard loads in < 2 seconds"

**Bad:**

- ❌ "Code is good"
- ❌ "Works correctly"
- ❌ "No bugs"

---

### Section 4: Definition of Done (Required)

```markdown
## Definition of Done

- [ ] Tests pass
- [ ] Coverage >= 80%
- [ ] Documentation updated
- [ ] Code reviewed
- [ ] Deployed to staging
```

**Purpose:** Quality gates that apply to ALL stories.

**Standard DoD Checklist:**

- [ ] All acceptance criteria met
- [ ] Unit tests written and passing
- [ ] Integration tests passing (if applicable)
- [ ] Code coverage >= 80%
- [ ] Pre-commit hooks pass
- [ ] Documentation updated
- [ ] Runbook created (if operational change)
- [ ] Code reviewed (if team > 1)
- [ ] Jira ticket updated with outcomes
- [ ] Related tickets linked

---

### Section 5: Technical Notes (Optional)

```markdown
## Technical Notes

- Implementation detail 1
- Library/framework choice
- Architecture considerations
```

**When to use:**

- Complex technical decisions
- Library/tool selection rationale
- Performance considerations
- Security implications

---

## 🏷️ Ticket Metadata

### Title Format

```
<type>(<scope>): <brief description>
```

**Examples:**

- `feat(jira): add CLI tools for ticket management`
- `fix(ingestion): handle API rate limiting`
- `chore(devcontainer): add GitHub CLI`
- `spike(crm): research lead management tools`

---

### Types

| Type  | Purpose                             | Story Points Range |
| ----- | ----------------------------------- | ------------------ |
| Story | New feature                         | 3-13               |
| Bug   | Fix broken behavior                 | 1-8                |
| Task  | Chore/maintenance                   | 1-5                |
| Spike | Research/investigation              | 2-5                |
| Epic  | Large initiative (contains stories) | N/A                |

---

### Labels (Use Ontology)

Follow `docs/2_data_governance/ontology_hub.md`:

**Work Type:**
`feature`, `bugfix`, `tech-debt`, `spike`, `documentation`

**Component:**
`database`, `devops`, `ingestion`, `cli`, `api`, `frontend`

**Domain:**
`backup`, `migration`, `time-series`, `spatial`

**Data Source:**
`fred`, `valet`, `census`

**Status:**
`blocked`, `critical-path`, `nice-to-have`

**Example:**

```
Labels: cli, automation, issue-tracking, devops
```

---

### Priority

| Priority | When to Use                  | Example                          |
| -------- | ---------------------------- | -------------------------------- |
| Critical | Blocker, data loss, security | Production database down         |
| High     | Impacts MVP delivery         | Core feature broken              |
| Medium   | Standard work                | New feature, planned improvement |
| Low      | Nice-to-have                 | UI polish, optimization          |

---

### Story Points (Fibonacci Scale)

| Points | Complexity   | Time Estimate                 |
| ------ | ------------ | ----------------------------- |
| 1      | Trivial      | 15-30 min                     |
| 2      | Simple       | 1-2 hours                     |
| 3      | Moderate     | Half day                      |
| 5      | Complex      | 1 day                         |
| 8      | Very complex | 2-3 days                      |
| 13     | Epic-level   | > 3 days (consider splitting) |

---

## 📋 Ticket Lifecycle

### Status Flow

```
To Do → In Progress → In Review → Done
```

### Status Definitions

**To Do:**

- Story is ready to start
- Acceptance criteria defined
- Dependencies resolved

**In Progress:**

- Developer actively working
- Feature branch created
- Regular updates in comments

**In Review:**

- PR created and open
- Code review in progress
- Tests passing

**Done:**

- PR merged to develop
- All acceptance criteria met
- Documentation updated
- Ticket closed

---

## 🚀 Creating Tickets via CLI

### Basic Creation

```bash
python src/scripts/jira_cli.py create \
  --summary "feat(api): add user authentication" \
  --description "As a Developer, I want user auth..." \
  --type "Story" \
  --priority "High" \
  --labels "api,authentication,security"
```

### With Full Template

```bash
python src/scripts/jira_cli.py create \
  --summary "feat(api): add user authentication endpoint" \
  --description "$(cat <<'EOF'
As a Developer, I want JWT-based authentication, so that users can securely access the API.

## Changes Needed
* Implement /auth/login endpoint
* Implement /auth/refresh endpoint
* Add JWT token generation
* Add authentication middleware

## Acceptance Criteria
- [ ] Login endpoint returns JWT token
- [ ] Refresh endpoint extends token validity
- [ ] Middleware validates tokens on protected routes
- [ ] Invalid tokens return 401 status

## Definition of Done
- [ ] Unit tests pass
- [ ] Integration tests for auth flow
- [ ] API documentation updated
- [ ] Security review completed

## Technical Notes
* Use PyJWT library
* Store secret in environment
* Token expiry: 1 hour
* Refresh token expiry: 30 days
EOF
)" \
  --type "Story" \
  --priority "High" \
  --labels "api,authentication,security" \
  --points 8
```

---

## 🔄 Updating Tickets via CLI

### Move to In Progress

```bash
python src/scripts/jira_cli.py update CHRONOS-XXX --status "In Progress"
```

### Update Acceptance Criteria

```bash
python src/scripts/jira_cli.py update CHRONOS-XXX \
  --description "$(cat updated_description.md)"
```

### Mark Complete

```bash
python src/scripts/jira_cli.py update CHRONOS-XXX --status "Done"
```

---

## 📚 Related Documentation

- Jira CLI Runbook: `docs/runbooks/jira_cli_runbook.md`
- Git Commit Template: `docs/templates/git_commit_template.md`
- GitHub PR Template: `docs/templates/github_pr_template.md`
- Ontology Hub: `docs/2_data_governance/ontology_hub.md`
- Agile Workflow ADR: `docs/5_decisions/adr_003_pragmatic_agile_jira_workflow.md`

---

## ✅ Quick Checklist

Before creating any ticket:

- [ ] User story is clear
- [ ] Changes are specific
- [ ] Acceptance criteria are testable
- [ ] Definition of Done is complete
- [ ] Title follows convention
- [ ] Labels are from ontology
- [ ] Priority is appropriate
- [ ] Story points estimated

---

**Questions?** See example tickets:

```bash
python src/scripts/jira_cli.py list --limit 10
python src/scripts/jira_cli.py read CHRONOS-142
```
