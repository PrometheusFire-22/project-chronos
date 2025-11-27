# ADR 006: Selecting the Initial CRM Stack

**Date:** 2025-11-17
**Status:** ✅ Accepted

## 1. Context

As we pivot to customer development and outreach, we require a professional Customer Relationship Management (CRM) tool to manage leads, track conversations, and build a sales pipeline. The selection must be optimized for a solo founder with a zero-dollar budget, prioritizing immediate value and ease of setup while acknowledging long-term risks like vendor lock-in.

## 2. Decision

We will adopt the **HubSpot Free CRM** as our initial CRM and lead management platform.

## 3. Rationale & Stress Testing

The decision was made via a `spike` story, analyzed with a scorecard comparing HubSpot, Mautic (FOSS), and Brevo. HubSpot was the clear winner for our current stage.

### 💎 **Primary Justification: Highest Value, Lowest Cost**
HubSpot provides a best-in-class, enterprise-grade CRM with zero financial cost and near-zero setup overhead. It directly solves our immediate business need to manage leads systematically, allowing us to focus on the MVP, not on system administration.

### 🧱 **Objection Handling: Vendor Lock-in**
*   **Risk:** HubSpot, like any SaaS platform, introduces vendor lock-in. Migrating complex deal pipelines and contact history to another platform in the future will be a painful, manual process.
*   **Mitigation:** We accept this risk by strictly adhering to our **"SSOT in Git"** policy. All critical *product, architectural, and strategic* documentation lives in our version-controlled repository. We are using HubSpot for *operational business data*, not our core intellectual property. This compartmentalizes the risk.

### 🚀 **Scalability & Integration Path**
*   **Ecosystem:** HubSpot has a massive integration marketplace, including a deep, official integration with Jira. This aligns with our "best-in-class, integrated toolchain" philosophy.
*   **Future Automation (n8n):** Our research confirmed that HubSpot has a robust API and a well-supported "node" in the n8n ecosystem. This provides a clear, powerful path for future self-hosted, custom automations (e.g., "When a new `Tier 1` deal is created in HubSpot, automatically create a linked Epic in Jira"). This validates that we are not sacrificing future customizability for current speed.

This decision prioritizes immediate execution velocity while acknowledging and planning for future scalability and risk mitigation.

---
