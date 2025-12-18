# 🎨 Project Chronos: Documentation & Style Guide

**Version:** 2.0
**Status:** ✅ Accepted

## 1. Guiding Principles

1.  **Clarity Over Brevity:** Explain thoroughly. Our documentation is for understanding, not just reference.
2.  **SSOT in Git:** All formal documentation lives in the `/docs` directory, is written in Markdown, and is version-controlled.
3.  **Visuals First:** Use diagrams (Mermaid) and visual cues (emojis) to make documents scannable and intuitive.
4.  **Adopt, Don't Invent:** We will adopt industry-standard conventions (Conventional Commits, Gitmoji) wherever possible to eliminate guesswork and improve interoperability.

## 2. Platform-Specific Conventions

###  Git & GitHub: Commits and Pull Requests

For all Git commit messages and GitHub Pull Request titles, we will adhere to the **Gitmoji** and **Conventional Commits** specifications.

**Format:** `emoji type(scope): subject`

**Reference:** The official guide is at [https://gitmoji.dev/](https://gitmoji.dev/)

| Emoji | Code | Commit Type | Example |
| :--- | :--- | :--- | :--- |
| ✨ | `:sparkles:` | `feat` (New Feature) | `✨ feat(ingestion): Add Valet API ingestor` |
| 🐛 | `:bug:` | `fix` (Bug Fix) | `🐛 fix(db): Correct primary key constraint` |
| ♻️ | `:recycle:` | `refactor` | `♻️ refactor(ingestion): Improve API request logic` |
| 📝 | `:memo:` | `docs` | `📝 docs(adr): Create new ADR for Git workflow` |
| 🧪 | `:test_tube:` | `test` | `🧪 test(coverage): Add unit tests for settings module` |
| 🧹 | `:broom:` | `chore` | `🧹 chore(ci): Update linting dependencies` |
| 🚀 | `:rocket:` | `ci`, `deploy` | `🚀 ci: Add new deployment stage to workflow` |

### Jira: Epics, Stories, and Labels

*   **Story Titles:** **Must** follow the Conventional Commit format (`type(scope): subject`). **Do not** use Gitmoji emojis in Jira titles; the `type` serves the same purpose and keeps the UI clean.
*   **Epic Names:** **Must** be a thematic, noun-based phrase (e.g., `MVP Dashboard`).
*   **Labels:** **Must** be `all-lowercase` and `kebab-case` (e.g., `tech-debt`).

### Markdown (`/docs` directory)

#### Visual Cue Lexicon

For long-form documentation, we use a specific set of emojis as **semantic section headers**. This provides a high-level "visual grep" for document structure.

| Emoji | Meaning | Example |
| :--- | :--- | :--- |
| 🏛️ | **Architecture / Concepts:** Core concepts, structural decisions. | `## 🏛️ Core Architectural Concepts` |
| 🚀 | **Action Plan / The "How":** The specific implementation or next steps. | `### 🚀 The Path Forward` |
| 💎 | **Strength / Best Practice:** A positive attribute or a correct way of doing things. | `**💎 Strength:** The multi-modal database design...` |
| 🧱 | **Weakness / Technical Debt:** A problem to be addressed. | `**🧱 Weakness:** The schema is managed via a single file...` |
| 🗺️ | **Roadmap / Diagram:** A high-level plan or visual representation. | `## 🗺️ The 3-Sprint Roadmap` |
| 💡 | **Insight / The "Why":** An explanation of the reasoning behind a decision. | `### 💡 The "Aha!" Moment` |
| ✅ | **Action Item / Checklist:** A task to be performed or a verification step. | `**✅ Action:** Create a new file...` |
| 📜 | **Documentation / Policy:** A formal document or established rule. | `## 📜 The Agile Generation RFP Toolkit` |

#### General Formatting

| Element | Convention | Rationale |
| :--- | :--- | :--- |
| **Emphasis** | `**Bold**` for emphasis. `` `code` `` for technical terms, filenames, and variables. | Creates a clear visual distinction between narrative and technical elements. |
| **Code Blocks**| Use triple backticks (```` ``` ````) with a language identifier (e.g., `python`, `sql`, `bash`). | Enables syntax highlighting and makes code easy to copy. |
| **Tables** | Use Markdown tables to present structured data and comparisons. | Forces information into a structured, easy-to-scan format. |
| **Mermaid** | All diagrams **must** use the `%%{init: {'theme': 'dark'}}%%` directive for dark mode compatibility. | Ensures readability across all developer environments. |

---
