# Strategic Technical Roadmap: Late 2025 - Early 2026

**Status:** ACCEPTED
**Last Updated:** 2025-12-12
**Focus:** Transitions from Marketing Site to Full Dynamic Application

> **Strategic Rationale:**
> We are prioritizing the **Marketing Infrastructure (SSG + CMS)** first.
> **Why?** To establish a "turnkey" system for SEO, content marketing, and lead generation that runs passively on "autopilot."
> **Benefit:** This allows the founder to shift focus entirely to deep backend/product development in Phase 3 without neglecting business growth and brand building.

---

## 🗺️ High-Level Progression

1.  **Phase 1: Marketing SSG (Sprint 10)** - *Current Focus*
    *   **Goal:** A sophisticated, high-performance static site that conveys technical/mathematical depth. "Simple but great."
    *   **Tech:** Next.js, Tailwind, Framer Motion, shadcn/ui.
    *   **Outcome:** Essential pages (Home, Features, About, Blog Shell) live.

2.  **Phase 2: Content Management (Sprint 11)**
    *   **Goal:** Turnkey content operations. "Everything on autopilot."
    *   **Tech:** Payload CMS (Self-hosted), PostgreSQL.
    *   **Outcome:** Blog and marketing content powered by CMS. Seamless handoff from technical setup to content marketing.

3.  **Phase 3: Backend & Business Logic Core**
    *   **Goal:** Robust business logic and strict data integrity.
    *   **Context:** Refactoring and extending *existing* Python code (skeletons exist).
    *   **Tech:** Python, FastAPI, PostgreSQL (Age/PostGIS/pgvector).
    *   **Focus:** Expand Graph functionality (AGE) and Vector search.
    *   **Outcome:** A standalone, strictly typed, testable backend core.

4.  **Phase 4: API Connection & Contracts**
    *   **Goal:** Connect Frontend to Backend via strict contracts.
    *   **Tech:** OpenAPI (Swagger), TypeScript Code Gen.
    *   **Outcome:** Frontend consumes real data; "Interface First" development.

5.  **Phase 5: Dynamic Web Application**
    *   **Goal:** Full-featured interactive web app.
    *   **Tech:** Next.js (App), Auth, State Management.
    *   **Decision Point:** Mobile strategy (React Native vs Capacitor) to be decided here.
    *   **Outcome:** The actual "Product" is live.

---

## 📅 Detailed Phase Breakdown

### Phase 1: Marketing SSG (Sprint 10 - Current)
*   **Objective:** "Sophisticated Simplicity." Convey high technological sophistication to prospects.
*   **Target Pages (MVP):**
    1.  **Home:** High-impact hero, value prop, social proof.
    2.  **Features:** Technical deep-dive into capabilities.
    3.  **About:** Company vision and mathematical philosophy.
    4.  **Blog (Shell):** Index and Post templates (ready for CMS data).
*   **Key Deliverables:**
    *   [ ] Navigation & Footer.
    *   [ ] Hero Section (Animated).
    *   [ ] Page Templates (Features, About).
    *   [ ] SEO Infrastructure (Sitemap, Metadata).
    *   [ ] Vercel Deployment.

### Phase 2: Payload CMS (Sprint 11)
*   **Objective:** Plug in the engine.
*   **Key Deliverables:**
    *   [ ] Payload CMS Setup.
    *   [ ] Content Collections (Blog, Features).
    *   [ ] **Decision:** Extensibility for Admin UI (keep flexible).
    *   [ ] Integration: Connect CMS data to Next.js SSG.

### Phase 3: Backend Business Logic (Deep Dive)
*   **Objective:** Product Core.
*   **Activities:**
    *   Refactor existing Python skeletons.
    *   **Graph:** Deepen AGE implementation.
    *   **Vector:** Enhance vector search capabilities.
    *   **Relational:** Core schema refinement.
    *   Testing & Stability.

### Phase 4: API Integration
*   **Objective:** The Bridge.
*   **Activities:**
    *   FastAPI Endpoints Definition.
    *   OpenAPI Spec Generation.
    *   TypeScript Client Generation.

---

## 🔮 Future Decisions (Deferred)

1.  **Mobile Tech Stack:** React Native vs Capacitor. To be decided pre-Phase 5.
---

## 🧠 Strategic Architecture Deep Dive

### 1. The CMS Boundary Decision (Sprint 11) -> **DECIDED**

**Decision:** **Strict Separation.**
*   **Payload CMS:** Strictly for Marketing Content (Blogs, Case Studies).
*   **Custom Admin:** Complex App Data will be managed via a custom "Ops Dashboard" built on the FastAPI backend in Phase 5.
*   **Rationale:** Payload lacks the technical capability to manage complex graph/vector data effectively.

### 2. Mobile Strategy (Phase 5+)

### 2. Mobile Strategy (Phase 5+)

**Context:** The Core Product (Deep Analysis/Graph/Vector) is a "Workstation" experience (Bloomberg Terminal) designed for deep work on Desktop. It will **never** be fully replicated on mobile.

**However:** Specific features *must* exist on mobile to support the workflow (e.g., Alerts, Portfolio Summaries, News Feeds).

**Recommendation: The "Companion" Architecture**

*   **Philosophy:** Mobile is a **Companion**, not a clone.
    *   **Desktop:** Full-featured, data-dense, complex visualization.
    *   **Mobile:** Curated, light-weight, high-signal UI.
*   **Execution (API-First):**
    *   Phase 4 (API Contracts) is critical here. It allows us to build a "Headless" backend.
    *   **Desktop UI** consumes the full "Heavy" API (Graph traversal, complex analytics).
    *   **Mobile UI** (initially Responsive Web/PWA) consumes only the "Light" API (Notifications, Read-only Dashboards).
*   **Tech:** Start with **Responsive Web (PWA)** for the specific Mobile views. Because the logic is decoupled via API, spinning up a dedicated Native App (React Native) later for just the "Companion Features" is low-risk and high-velocity.

**Verdict:** **API-First is the enabler.** Build the backend to support *clients*, not just *a website*. This allows the Desktop and Mobile experiences to diverge appropriately based on their distinct use cases.
