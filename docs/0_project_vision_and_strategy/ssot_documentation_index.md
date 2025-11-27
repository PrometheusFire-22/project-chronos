# SSOT Documentation Structure

**Purpose**: Quick reference for understanding the SSOT documentation hierarchy and purpose of each document.

---

## Canonical Source (ADR)

### [ADR 014: Documentation Single Source of Truth (SSOT) Strategy](https://automatonicai.atlassian.net/wiki/spaces/PC/pages/6160386)
**File**: `docs/2_architecture/adrs/adr_011_documentation_ssot.md`  
**Purpose**: Authoritative architectural decision record defining the SSOT strategy  
**Use When**: Understanding the strategy, rationale, and architecture

---

## Supporting Guides

### [End-to-End SSOT Workflow Test Guide](https://automatonicai.atlassian.net/wiki/spaces/PC/pages/6160414)
**File**: `docs/4_guides/ssot_workflow_test.md`  
**Purpose**: Practical step-by-step workflow for daily SSOT operations  
**Use When**: Creating, syncing, or managing documentation day-to-day

### [SSOT Automation Features Expansion Walkthrough](https://automatonicai.atlassian.net/wiki/spaces/PC/pages/6225935)
**File**: `docs/4_guides/ssot_automation_walkthrough.md`  
**Purpose**: Technical implementation details and feature documentation  
**Use When**: Understanding automation, GitHub Actions, CLI features, or troubleshooting

### [Confluence Daily Sync Cron Setup](file:///workspace/docs/3_runbooks/confluence_daily_sync_cron.md)
**File**: `docs/3_runbooks/confluence_daily_sync_cron.md`  
**Purpose**: Instructions for setting up automated daily sync  
**Use When**: Configuring cron job for 11am EST sync

---

## Superseded Documents

### ~~ADR 014: Documentation SSOT Strategy~~ (Page 5767172)
**Status**: SUPERSEDED 2025-11-26  
**Replaced By**: ADR 014 (Page 6160386)  
**Reason**: Consolidated into comprehensive ADR

---

## Document Hierarchy

```
SSOT Documentation
├── ADR 014 (Canonical) ← Strategy & Architecture
├── Workflow Test Guide ← Daily Operations
├── Automation Walkthrough ← Implementation Details
└── Cron Setup Runbook ← Infrastructure Setup
```

---

## Quick Decision Tree

**Need to understand WHY?** → Read ADR 014  
**Need to DO something?** → Use Workflow Test Guide  
**Need to understand HOW it works?** → Read Automation Walkthrough  
**Need to set up automation?** → Follow Cron Setup Runbook
