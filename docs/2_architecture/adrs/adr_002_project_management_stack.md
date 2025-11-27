# ADR 002: Selecting the Project Management & Knowledge Stack

**Date:** 2025-11-15
**Status:** ✍️ Proposed

## 1. Context

As a solo founder, the project's operational workflow has been managed within Notion. While flexible, this setup is showing strain and lacks the formal structure required for a production-grade software development lifecycle. Key challenges include:
*   Blurring lines between long-term documentation, sprint planning, and personal notes.
*   Lack of native Agile/Scrum features (e.g., velocity tracking, burndown charts, story points).
*   Risk of duplication between the local, version-controlled documentation (the true SSOT) and the wiki-like features of Notion.

This is a critical juncture to select a professional, scalable, and non-duplicative toolchain that supports our new "Dual-Track Workflow" before migrating the existing backlog.

## 2. The Core Question

What is the optimal, cost-effective tool stack for Project Chronos that satisfies these three core needs:
1.  **Work Tracking:** A robust system for Agile (Scrum/Kanban) project management.
2.  **Knowledge Management:** A permanent, version-controlled home for all documentation and strategic plans.
3.  **Ideation & Notes:** A flexible space for personal brainstorming and unstructured thought.

## 3. The Contenders & Evaluation Criteria

We will evaluate three primary contenders for the "Work Tracking" role against five critical criteria.

| | **Jira** | **Notion** | **Trello** |
| :--- | :--- | :--- | :--- |
| **Primary Use Case** | Enterprise-grade Agile Project Management | All-in-one Workspace & Knowledge Base | Simple, Visual Task/Kanban Board |

### Evaluation Criteria:
*   **Agile Native Support:** How well does the tool support core Scrum/Kanban concepts out-of-the-box?
*   **Free Tier Generosity:** How functional is the free tier for a solo developer with a potential +1-2 collaborators?
*   **Integration & Extensibility:** How well does it connect with our core developer tools (GitHub, VS Code)?
*   **Knowledge Management:** Can it serve as a reliable "Single Source of Truth" for documentation?
*   **Developer Community Adoption:** Is this a standard, respected tool in the professional software world?

## 4. Analysis & Scorecard

| Criteria | Jira Software | Notion | Trello |
| :--- | :--- | :--- | :--- |
| **Agile Native Support** | 💎 **5/5** (Gold standard: sprints, backlogs, story points, velocity charts) | 🧱 **2/5** (DIY with templates; lacks robust reporting and formal structure) | 🧱 **3/5** (Excellent for Kanban; poor for Scrum out-of-the-box) |
| **Free Tier Generosity** | 💎 **5/5** (Free for up to 10 users with almost all core features. Extremely generous.) | 🟡 **4/5** (Excellent for personal use; team features are gated behind paid plans.) | 🟡 **4/5** (Good free tier for boards/cards; advanced features "Power-Ups" are limited.) |
| **Integration** | 💎 **5/5** (Deep, native integration with GitHub is its killer feature. Link commits/PRs to tickets.) | 🟡 **4/5** (Excellent API and many integrations, but GitHub link is less seamless than Jira.) | 🧱 **3/5** (Good integrations, but less developer-focused than Jira.) |
| **Knowledge Mgmt** | 🧱 **2/5** (This is what Confluence is for, which is a separate product. Jira itself is poor for docs.) | 💎 **5/5** (Best-in-class, flexible, beautiful documentation and database features.) | 🧱 **1/5** (Not designed for this at all. Card descriptions are its limit.) |
| **Community Adoption**| 💎 **5/5** (The undisputed industry standard for professional software teams.) | 🟡 **4/5** (Extremely popular, but more so in product/design/startup circles than pure dev.) | 🟡 **4/5** (Very popular, but often seen as a stepping stone to Jira for serious dev work.) |
| **Final Score** | **22 / 25** | **19 / 25** | **16 / 25** |

---

## 5. Critical Questions for You, the Product Owner

The scorecard provides a clear winner, but the final decision depends on your personal workflow preferences. Please answer these questions to finalize our direction.

1.  **Question 1: What is your "Process Overhead" tolerance?**
    *   Jira enforces a structured, formal process (Epics -> Stories -> Sub-tasks). This adds discipline but also overhead. Notion and Trello are far more flexible and free-form. **Do you crave the rigid structure to enforce discipline, or do you prefer a lighter-weight, more fluid system?**

2.  **Question 2: Where will your "Second Brain" live?**
    *   We've agreed that `docs/` in Git is the **SSOT for formal documentation**. However, there's a need for unstructured notes, meeting minutes, and brainstorming.
    *   **Option A:** Use Notion for this unstructured "Second Brain" and Jira for structured "Work Tracking."
    *   **Option B:** Use a simpler local-first tool like Obsidian for notes (which can also live in your repo) and Jira for work.
    *   **Which model feels more natural and less duplicative to you?**

3.  **Question 3: What is your "Collaboration Future"?**
    *   Jira's free tier for 10 users is built for team collaboration. If you bring on a freelance developer, they will almost certainly know Jira. Sharing a Notion workspace for dev work can be confusing. **How much do you want to optimize for a future where you are delegating development tasks to others?**

4.  **Question 4: Is Trello "Good Enough"?**
    *   Trello is essentially "Jira-lite." If your workflow is purely Kanban (Backlog -> To Do -> In Progress -> Done), Trello is simpler and faster. If you want to run formal, time-boxed Sprints with velocity tracking, it is the wrong tool. **Do you plan to run real Sprints, or do you just need a better To-Do list?**

## 6. Recommendation & Proposed Path Forward

Based on the analysis and your stated goals, the following stack represents the industry best practice and offers the best combination of power, cost-effectiveness, and non-duplication:

1.  **📚 Knowledge Management (SSOT):** **Local `docs/` Directory, Versioned with Git/GitHub.** (Status Quo - Confirmed)
2.  **✅ Work Tracking:** **Jira Software.** Its free tier is unbeatable, its GitHub integration is unparalleled, and it is the professional standard. It will grow with you from a solo dev to a small team without any changes.
3.  **💡 Ideation & Notes:** **Your choice of a dedicated notes app (Notion, Obsidian, etc.).** This tool is explicitly *not* part of the core project workflow, preventing duplication. It is your personal scratchpad.

This "Two-Part Brain" approach is extremely common and effective: **Jira tracks the work, Git tracks the knowledge.**

### **Action Plan:**
1.  **You Decide:** Answer the four critical questions above.
2.  **We Commit:** Based on your answers, we will formally adopt a tool stack by changing the status of this ADR to `✅ Accepted`.
3.  **We Execute:** We will create a new "Project Chronos" board in the chosen tool (likely Jira).
4.  **We Migrate:** We will dedicate 2-3 hours to migrating all relevant tasks from your Notion pages and your backlog list into the new system as Epics and Stories.
5.  **We Deprecate:** We formally state that Notion is no longer to be used for Agile project management.
