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

1.  **CMS as App Admin:** To be decided in Sprint 11.
---

## 🧠 Strategic Architecture Deep Dive

### 1. The CMS Boundary Decision (Sprint 11)

**Context:** The application is a "Bloomberg/Pitchbook" style tool—high data density, complex graphs, vector search, and B2B financial workflows.

**Recommendation: The "Separation of Concerns" Model**

We should define the boundary strictly to maximize **modularity** and **extensibility**:

*   **Payload CMS (The "Marketing Voice"):**
    *   **Role:** Strictly for *unstructured* or *semi-structured* content that drives growth.
    *   **Owns:** Blog posts, Case Studies, Whitepapers, Team Bios, Testimonials, FAQ, Help Center, Marketing Landing Pages.
    *   **Why?** These change frequently, need SEO optimization, and are edited by non-technical staff. Payload is perfect here.

*   **FastAPI Backend (The "Product Brain"):**
    *   **Role:** Strictly for *structured, relational, and graph* data that drives the product.
    *   **Owns:** User Portfolios, Equity Data, Time-series financial metrics, Knowledge Graph nodes, Vector embeddings.
    *   **Why?** "Pitchbook-style" data is too complex for a standard CMS. You need custom business logic, strict validation, and high-performance queries (AGE/pgvector) that a CMS admin UI cannot easily handle.
    *   **Admin Strategy:** Do **not** try to shoehorn your complex financial data management into the Payload Admin UI. Instead, build a bespoke "Operations Dashboard" in Phase 5 using your own API components. This gives you the UX control needed for complex operations.

**Verdict:** **Hybrid Approach.** Use Payload for the "Public Face" and your custom stack for the "Private Brain." Don't mix them. This keeps your product highly modular.

### 2. Mobile Strategy (Phase 5+)

**Context:** "Bloomberg Terminals don't run on Android." The primary use case is desktop/office deep work. Mobile is for "checking in" or light updates.

**Recommendation: Responsive Web First (PWA)**

*   **Strategy:** Build the Phase 5 "Dynamic Web App" as a high-quality **Progressive Web App (PWA)** or simply a responsive site.
*   **Why?**
    *   **Utility:** It covers 95% of B2B mobile use cases (checking a dashboard, reading a report) without the overhead of app stores.
    *   **Extensibility:** By building Phase 4 (API Contracts) correctly, our backend becomes "Headless." It doesn't care if the request comes from the Web App, an iPad App, or a CLI.
    *   **Future-Proofing:** If you later decide to build a dedicated iPad app for analysts (common in finance), you simply build a new frontend consuming the *exact same* API you built in Phase 4.

**Verdict:** Don't worry about React Native / Capacitor yet. Focus Phase 5 on a **responsive desktop-first web app**. The modular API architecture (Phase 4) creates the "Extensibility" you desire for mobile later.
