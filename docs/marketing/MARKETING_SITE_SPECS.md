# Marketing Site Components - Design Specifications

**Status:** APPROVED (Sprint 10)
**Date:** 2025-12-12
**Reference:** User Conversation [Sprint 10 Planning]

---

## 🎨 Core Aesthetic: "Mathematical Sophistication"

The site must convey high technological depth and mathematical precision.

*   **Primary Metaphor:** Abstract Data / Nodes / Network Graphs.
*   **Visual Style:** "Dark Mode Glow" (Cyber/Fintech).
    *   Think: Neon accents on dark backgrounds, connecting lines, deep blues/purples/teals.
*   **Usage:**
    *   **Hero:** Prominent interactive/animated network graph.
    *   **Backgrounds:** Subtle geometric grids (secondary).
    *   **Colors:** High contrast neon tokens on `slate-950` or `zinc-950` backgrounds.

---

## 🧩 Component Specs

### 1. Navigation Bar (Header)

*   **Behavior:** Sticky (Fixed position) with **Glassmorphism** (backdrop-blur) effect on scroll.
*   **Layout:**
    *   **Logo:** Aligned Left.
    *   **Links:** Aligned Right.
    *   **Spacing:** Wide container (`max-w-7xl`).
*   **Content:**
    *   Links: Features, Solutions, About, Blog.
*   **Call to Action (CTA):**
    *   **Visible:** Yes, prominent.
    *   **Text:** "Get Started" or "Book Demo".
    *   **Style:** Primary gradient button (Neon/Glow effect).

### 2. Footer

*   **Visual:** **Inverted Dark Mode** (even if page is light, footer is dark). High-tech vibe.
*   **Density:** Functional / Enterprise Standard.
*   **Columns (4-Grid):**
    1.  **Product:** Features, Integrations, Changelog, Docs.
    2.  **Company:** About, Careers, Contact.
    3.  **Resources:** Blog, Community, Help Center.
    4.  **Legal:** Privacy, Terms, Security.
*   **Socials:** Subtle icons in bottom row.

### 3. Hero Section

*   **Layout:** 2-Column (Desktop), Stacked (Mobile).
*   **Left (Copy):**
    *   H1: High-impact value prop (Animations/Typewriter effect).
    *   Subhead: Technical value statement.
    *   CTAs: Primary + Secondary (Outline).
*   **Right (Visual):**
    *   **The "Star":** Abstract Network Graph.
    *   **Style:** Neon nodes, connecting lines, floating elements.
    *   **Tech:** SVG or Framer Motion animation.
*   **Background:** Subtle geometric noise/grid to support the foreground graph.

---

## 🛠️ Implementation Notes

*   **Tech Stack:** Next.js, Tailwind CSS, Framer Motion, shadcn/ui.
*   **Assets:** Use `marketing/assets` if relevant, or generate new SVG graphs matching the "Neon/Glow" spec.
*   **Responsiveness:** Mobile-first. Hero stacks vertically. Nav collapses to Hamburger menu.
