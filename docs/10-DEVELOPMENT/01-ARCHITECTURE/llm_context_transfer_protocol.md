# 🧠 Project Chronos: LLM Context Transfer Protocol

**Version:** 1.0
**Status:** ✅ Live
**Purpose:** This document is the **Single Source of Truth (SSOT)** for rapidly onboarding an LLM assistant or new developer to the Project Chronos codebase. Following this protocol will transfer >95% of the necessary architectural and operational context in a structured, repeatable manner.

---

## 🧭 1. Guiding Principles

*   **Code First, Questions Second:** The codebase itself is the ultimate source of truth. We provide the key files first to ground the LLM in the project's reality.
*   **Logical Layering:** We transfer context from the "outside in," starting with high-level orchestration and moving progressively deeper into application and data logic. This mirrors how a human would learn the system.
*   **Verifiable Turns:** The transfer is done in discrete, verifiable "turns." This allows for course correction and ensures each layer of context is successfully loaded before proceeding to the next.

---

## 📋 2. The Master Prompt Template

Begin every new session with a new LLM instance by using this master prompt. This sets the persona, core principles, and guardrails for the collaboration.

```markdown
You are the Lead Data Architect and Senior DevOps Engineer for Project Chronos, a production-grade macroeconomic data platform built with Python, PostgreSQL/TimescaleDB, and Docker.

**Core Principles:**
1.  Architecture First: Discuss design before implementation
2.  Verifiable Steps: Propose → Build → Verify → Proceed
3.  Production Quality: Robust error handling, logging, testing
4.  Git Discipline: Feature branches, meaningful commits, PRs
5.  Security: No hardcoded credentials, use environment variables

**Technical Context:**
-   Dev Environment: VS Code Dev Containers (Native Docker)
-   Database: Multi-modal PostgreSQL with TimescaleDB, PostGIS, pgvector, and Apache AGE.
-   Primary Data Sources: FRED API, Bank of Canada Valet API, US Census, Statistics Canada.
-   Testing: Pytest with a full suite of unit, integration, and e2e tests.
-   Automation: Ingestion and operational tasks orchestrated via Python CLI scripts and Bash.
-   Git: Gitflow workflow on github.com/PrometheusFire-22/project-chronos

**Strict Collaboration Guardrails:**
1.  **Code First, Explanation Second:** Present complete, final code blocks *first*, followed by the explanation.
2.  **No "Snippets" for Replacement:** Always provide the **entire, complete function or file** that needs to be replaced.
3.  **Assume Zero Trust on Syntax:** Mentally lint all code (YAML, SQL, Mermaid, Bash) for common errors before outputting.
4.  **Embrace "Better Comments":** All code must be generously commented, explaining the "why."
5.  **Always Re-state the Full Workflow:** After providing a fix, re-state the complete, step-by-step action plan.
```

---

## 📦 3. The 5-Turn Context Ingestion Protocol

After the master prompt, provide the full contents of the following files in five sequential turns. Do not combine turns. After each turn, wait for the LLM to acknowledge receipt and processing before proceeding.

### **Turn 1: The Orchestration Layer (The "How It Runs")**
*   **Goal:** To understand the system's runtime environment, services, and developer experience.
*   **Files to Provide:**
    1.  `docker-compose.yml`
    2.  `docker-compose.override.yml`
    3.  `Dockerfile` (main application)
    4.  `Dockerfile.postgres`
    5.  `Makefile`
    6.  `.github/workflows/ci.yml`

### **Turn 2: The Data Layer (The "Heart")**
*   **Goal:** To understand the database's structure, the entities it stores, and the business logic embedded within it.
*   **Files to Provide:**
    1.  `database/schema.sql`
    2.  `database/views.sql` (and other core view files)
    3.  `database/analytics_views/real_estate.sql` (as an example of a vertical)
    4.  `database/seeds/asset_catalog.csv`
    5.  `database/seeds/ontology_hub.csv`

### **Turn 3: The Application Layer (The "Engine Room")**
*   **Goal:** To understand the core Python logic for configuration, database interaction, and data ingestion.
*   **Files to Provide:**
    1.  `src/chronos/config/settings.py`
    2.  `src/chronos/database/connection.py`
    3.  `src/chronos/ingestion/base.py`
    4.  `src/chronos/ingestion/fred.py` (as a primary example)
    5.  `src/scripts/ingest_fred.py` (to show the CLI)

### **Turn 4: The Verification Layer (The "Proof")**
*   **Goal:** To understand how the system's correctness is guaranteed.
*   **Files to Provide:**
    1.  `tests/conftest.py`
    2.  `tests/unit/test_calculations.py` (as an example of a pure unit test)
    3.  `tests/integration/test_database.py` (as an example of an integration test)
    4.  `tests/e2e/test_ingestion_workflow.py` (as an example of an end-to-end test)

### **Turn 5: The Strategic Layer (The "Why")**
*   **Goal:** To understand the project's business goals and current strategic roadmap.
*   **Files to Provide:**
    1.  `docs/0_project_vision_and_strategy/1_architectural_deep_dive.md`
    2.  `docs/0_project_vision_and_strategy/2_the_phoenix_plan.md`

By the end of this protocol, the LLM will have a comprehensive, multi-layered understanding of the project, enabling it to provide high-quality, context-aware assistance.
