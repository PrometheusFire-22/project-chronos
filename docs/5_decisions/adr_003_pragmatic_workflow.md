# 💎 The "Ruthless Value" Agile Playbook**

You asked for the best practices for Scrum. Here they are, tailored for a solo founder. This is our new operational SSOT. We will create a formal ADR for this to lock it in.

## **ADR 003: The Pragmatic Scrum Workflow**

| Ceremony | Purpose: The "Why" | Your Role & Deliverable | LLM Prompting Template |
| :--- | :--- | :--- | :--- |
| **Sprint Planning** | **Decide WHAT to build.** Select high-priority stories from the Backlog and commit to them for the sprint. | **Product Owner:** You decide the priorities based on business value. <br/> **Deliverable:** A Sprint Backlog and a clear Sprint Goal. | `Create a Jira User Story with a Conventional Commit title for the feature "[FEATURE NAME]". The user is a [USER PERSONA]. The benefit is [BUSINESS BENEFIT]. Include Acceptance Criteria.` |
| **Daily Stand-up**| **Synchronize and unblock.** A brief, daily check-in (even with yourself) to maintain focus and momentum. | **Developer:** You answer three questions: 1. What did I do yesterday? 2. What will I do today? 3. Any blockers? <br/> **Deliverable:** A clear daily plan. | `This is my daily stand-up. Yesterday I worked on [YESTERDAY'S TASK]. Today I will work on [TODAY'S TASK]. I am blocked by [BLOCKER]. Please suggest a path forward.` |
| **Sprint Review** | **Showcase WHAT was built.** A demo of the completed work (the "increment"). This is your accountability checkpoint. | **Founder:** You demo the working software to yourself or a trusted advisor. <br/> **Deliverable:** A validated, working product increment. | `I am preparing for a Sprint Review. The goal of the sprint was "[SPRINT GOAL]". The completed stories are [LIST OF STORIES]. Generate a short, compelling script for my demo.` |
| **Sprint Retrospective** | **Improve HOW we build.** A brief moment to reflect on the process. What went well? What didn't? What can be improved? | **Architect:** You identify one key process improvement for the next sprint. <br/> **Deliverable:** One actionable improvement. | `My sprint goal was "[GOAL]". I succeeded/failed. The main challenge was [CHALLENGE]. Based on Agile principles, suggest one concrete process improvement for my next sprint.` |
