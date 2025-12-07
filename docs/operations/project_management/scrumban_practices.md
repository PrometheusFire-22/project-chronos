# Scrumban Best Practices for Project Chronos

**Status:** ✅ Active
**Adoption Date:** 2025-12-05
**Reference:** Based on [ADR-003: Pragmatic Agile](../../architecture/adrs/adr_003_pragmatic_agile_jira_workflow.md)

---

## 🎯 Core Philosophy

**Scrumban = Scrum Structure + Kanban Flow**
We use the planning rigor of Scrum (Sprints) with the execution flexibility of Kanban (WIP limits, Pull system).

### The Golden Rules
1.  **Visualise Work:** If it's not on the board, it doesn't exist.
2.  **Limit WIP:** Stop starting, start finishing.
3.  **Manage Flow:** Focus on cycle time (time from "In Progress" to "Done").

---

## 📋 The Board Structure

### Columns & Limits

| Column | WIP Limit | Definition of Done (DoD) |
|--------|-----------|--------------------------|
| **To Do** | ∞ | Ticket has clear title, description, and "Definition of Ready". |
| **In Progress** | **3** | Developer is actively coding. Branch created. |
| **Review** | **2** | PR open. CI passed. Reviewer assigned. |
| **Done** | ∞ | Merged to `develop`. Deployed to Dev/Staging. |

*> **Note:** WIP limits apply to **active tickets per person**, not total tickets.*

---

## 🔄 The Rituals

### 1. Daily Stand-up (Async)
*   **Format:** Slack/Discord message.
*   **Questions:**
    1.  What did I finish yesterday?
    2.  What will I finish today?
    3.  **Blockers:** Any red flags?

### 2. Replenishment (Weekly)
*   **When:** Monday morning.
*   **Action:** Move tickets from Backlog → To Do.
*   **Goal:** Ensure "To Do" has enough work for ~1 week.

### 3. Retrospective (End of "Sprint")
*   **Trigger:** End of 2-week cycle.
*   **Focus:** Process improvement, not shame.
*   **Output:** 1 actionable improvement for the next cycle.

---

## 🎫 Ticket Lifecycle

### 1. Creation (The "Idea")
*   **Title:** Action-oriented (e.g., "Implement OAuth Login", not "Auth").
*   **Desc:** User Story format ("As a... I want to... So that...").
*   **Labels:** `frontend`, `backend`, `bug`, `debt`.

### 2. Selection ( The "Pull")
*   Developer pulls top ticket from "To Do".
*   **Assign:** Self.
*   **Move:** To "In Progress".

### 3. Execution (The "Work")
*   **Branch:** `feat/ID-short-desc`.
*   **Commit:** Conventional Commits (`feat: ...`, `fix: ...`).
*   **Draft PR:** Open early for visibility.

### 4. Completion (The "Merge")
*   **Review:** 1 approval required.
*   **Merge:** Squash & Merge.
*   **Ticket:** Move to "Done".

---

## 📈 Metric Tracking

We track what matters:
1.  **Cycle Time:** Avg time in "In Progress". (Target: < 2 days).
2.  **Throughput:** Tickets completed per week.
3.  **WIP Violations:** How often do we break limits?

---

## 🛠️ Jira Automation Rules (Implemented)

1.  **Auto-Assign:** When moved to "In Progress" → Assign to actor.
2.  **Stale Flag:** If in "In Progress" > 5 days → Flag as "Stale".
3.  **PR Link:** When PR created → Transition to "Review".
