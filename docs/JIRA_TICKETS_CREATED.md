# Cloudflare Migration - Jira Tickets Created

**Date:** 2025-12-17
**Epic:** CHRONOS-325

---

## Summary

Created **16 Jira tickets** for Cloudflare migration:
- **1 Epic:** Overall migration tracking
- **5 Sprint 1 tickets:** Local Development Hardening (EXECUTE NOW)
- **5 Sprint 0 tickets:** PoC Validation (EXECUTE AFTER SPRINT 1)
- **5 High-level tickets:** Sprints 2-3 (refine later)

---

## Epic

**CHRONOS-325: Cloudflare Migration**
- https://automatonicai.atlassian.net/browse/CHRONOS-325
- Type: Epic
- Status: To Do
- Parent for all migration tickets

---

## Sprint 1: Local Development Hardening (CURRENT)

### Execute These NOW (No Cloud Costs)

**CHRONOS-326: Setup Docker Compose PostgreSQL Environment** ✅
- https://automatonicai.atlassian.net/browse/CHRONOS-326
- Type: Task
- Priority: Highest
- Story Points: 5
- **Status:** ✅ **COMPLETE** (2025-12-17)
- **Action:** Verify and harden local PostgreSQL with PostGIS, pgcrypto, pg_stat_statements
- **Deliverables:**
  - ✅ docker-compose.yml verified (already excellent)
  - ✅ Dockerfile.timescaledb verified (TimescaleDB + PostGIS + pgvector + Apache AGE)
  - ✅ docs/DATABASE_SETUP_VERIFICATION.md (cloud alignment checklist)
  - ✅ scripts/verify-local-db.sh (local verification)
  - ✅ scripts/verify-cloud-db.sh (cloud verification - Sprint 0)
  - ✅ scripts/README.md (documentation)

**CHRONOS-327: Configure Nx Monorepo Workspace** ✅
- https://automatonicai.atlassian.net/browse/CHRONOS-327
- Type: Task
- Priority: Highest
- Story Points: 5
- **Status:** ✅ **COMPLETE** (2025-12-17)
- **Action:** Structure apps/worker, packages/database, packages/types
- **Deliverables:** Updated nx.json, dependency graph

**CHRONOS-328: Lock Dependencies and Enable Dependabot** ✅
- https://automatonicai.atlassian.net/browse/CHRONOS-328
- Type: Task
- Priority: High
- Story Points: 3
- **Status:** ✅ **COMPLETE** (2025-12-17)
- **Action:** Remove ^ and ~ from package.json, enable Dependabot
- **Deliverables:** Exact versions, .github/dependabot.yml

**CHRONOS-329: Create Unified Development Scripts** ✅
- https://automatonicai.atlassian.net/browse/CHRONOS-329
- Type: Task
- Priority: High
- Story Points: 3
- **Status:** ✅ **COMPLETE** (2025-12-17)
- **Action:** Single pnpm run dev command for entire stack
- **Deliverables:** scripts/dev.sh, updated docs

**CHRONOS-330: Document Local Development Setup**
- https://automatonicai.atlassian.net/browse/CHRONOS-330
- Type: Task
- Priority: Medium
- Story Points: 2
- **Action:** Comprehensive local dev documentation
- **Deliverables:** Updated CONTRIBUTING.md, docs/LOCAL_DEVELOPMENT.md

**Sprint 1 Total:** 18 story points (~1 week)

---

## Sprint 0: Proof of Concept Validation (NEXT)

### Execute After Sprint 1 (All on Cloudflare Free Tier)

**CHRONOS-331: Deploy Test Next.js App to Cloudflare Pages**
- https://automatonicai.atlassian.net/browse/CHRONOS-331
- Type: Spike
- Priority: Highest
- Story Points: 3
- **Action:** Validate @cloudflare/next-on-pages adapter works
- **Critical:** This is the GO/NO-GO gate for entire migration
- **Deliverables:** Test app on *.pages.dev, feature compatibility report

**CHRONOS-332: Create and Deploy Test Cloudflare Worker**
- https://automatonicai.atlassian.net/browse/CHRONOS-332
- Type: Spike
- Priority: Highest
- Story Points: 2
- **Action:** Deploy Worker with Hono to *.workers.dev
- **Deliverables:** Working Worker, latency benchmarks

**CHRONOS-333: Configure Hyperdrive and Test DB Connection**
- https://automatonicai.atlassian.net/browse/CHRONOS-333
- Type: Spike
- Priority: Highest
- Story Points: 5
- **Action:** Connect Worker → Hyperdrive → Lightsail PostgreSQL
- **Security:** Update Lightsail security group for Cloudflare IPs
- **Deliverables:** Working connection, latency < 30ms verified

**CHRONOS-334: Test R2 Image Upload and Delivery**
- https://automatonicai.atlassian.net/browse/CHRONOS-334
- Type: Spike
- Priority: High
- Story Points: 2
- **Action:** Validate R2 for media storage (free tier)
- **Deliverables:** Working upload API, zero egress fees confirmed

**CHRONOS-335: Sprint 0 Summary and GO/NO-GO Decision**
- https://automatonicai.atlassian.net/browse/CHRONOS-335
- Type: Task
- Priority: Highest
- Story Points: 2
- **Action:** Compile results, make migration decision
- **Critical Decision Gate:**
  - ✅ GO = Proceed to Sprint 2
  - ❌ NO-GO = Stay on Vercel, document why
- **Deliverables:** docs/SPRINT_0_RESULTS.md, GO/NO-GO documented

**Sprint 0 Total:** 14 story points (~3-5 days)

---

## Sprint 2: Migration (HIGH-LEVEL - Refine if Sprint 0 = GO)

**CHRONOS-336: Deploy Production Next.js to Cloudflare Pages**
- https://automatonicai.atlassian.net/browse/CHRONOS-336
- Type: Story
- Priority: High
- Story Points: 13
- **Action:** Full production deployment (parallel with Vercel)
- **Blocked By:** CHRONOS-335 (GO decision)

**CHRONOS-337: Deploy Production Worker and Configure Infrastructure**
- https://automatonicai.atlassian.net/browse/CHRONOS-337
- Type: Story
- Priority: High
- Story Points: 13
- **Action:** Worker, Hyperdrive, R2 production setup

**CHRONOS-338: DNS Cutover and Traffic Migration**
- https://automatonicai.atlassian.net/browse/CHRONOS-338
- Type: Story
- Priority: Highest
- Story Points: 8
- **Action:** Switch DNS, monitor, keep Vercel for 30 days

**Sprint 2 Total:** 34 story points (~2 weeks)

---

## Sprint 3: DevOps Hardening (HIGH-LEVEL - Refine after Sprint 2)

**CHRONOS-339: CI/CD Pipeline with GitHub Actions**
- https://automatonicai.atlassian.net/browse/CHRONOS-339
- Type: Story
- Priority: High
- Story Points: 8
- **Action:** Automated deployments, PR previews, testing

**CHRONOS-340: Observability and Monitoring**
- https://automatonicai.atlassian.net/browse/CHRONOS-340
- Type: Story
- Priority: High
- Story Points: 8
- **Action:** Sentry, analytics, uptime monitoring, runbooks

**Sprint 3 Total:** 16 story points (~1 week)

---

## Execution Order (UPDATED)

```
✅ NOW:    Sprint 1 (CHRONOS-326 → CHRONOS-330)
           Local Dev Hardening - 18 points - 1 week

⏭️  NEXT:   Sprint 0 (CHRONOS-331 → CHRONOS-335)
           PoC Validation - 14 points - 3-5 days

🔮 FUTURE: Sprint 2 (if Sprint 0 = GO)
           Migration - 34 points - 2 weeks

🔮 FUTURE: Sprint 3 (after Sprint 2)
           DevOps - 16 points - 1 week
```

---

## Budget-Friendly Execution

### Sprint 1: $0
- All local development
- Zero cloud costs
- Docker, Nx, pnpm scripts

### Sprint 0: $0
- **Cloudflare free tier covers everything:**
  - Pages: Unlimited static, 500 builds/month
  - Workers: 100K requests/day
  - R2: 10GB storage, 10M reads, 1M writes
  - Hyperdrive: FREE (beta)
- No credit card required for basic usage

### Sprint 2+: $0-20/month
- Stay on free tier initially
- Only pay if you exceed free limits
- Estimated: <$20/month until significant traffic

**You can start TODAY with zero costs.**

---

## Critical Decision Points

### Decision Gate 1: After Sprint 1
**Question:** Is local dev environment working?
- ✅ YES → Proceed to Sprint 0
- ❌ NO → Fix before continuing

### Decision Gate 2: After Sprint 0 (CRITICAL)
**Question:** Does Cloudflare stack work for our needs?
- ✅ GO → Proceed to Sprint 2 (full migration)
- ❌ NO-GO → Stay on Vercel, document learnings

### Decision Gate 3: After Sprint 2
**Question:** Is Cloudflare deployment stable?
- ✅ YES → Decommission Vercel, proceed to Sprint 3
- ❌ NO → Rollback to Vercel, investigate

---

## Next Steps

1. **Today:** Start CHRONOS-326 (Docker Compose PostgreSQL)
2. **This Week:** Complete Sprint 1 tickets (CHRONOS-326 → CHRONOS-330)
3. **Next Week:** Execute Sprint 0 PoC (CHRONOS-331 → CHRONOS-335)
4. **Then:** Make GO/NO-GO decision based on Sprint 0 results

---

## Related Documentation

- **ADR-003:** docs/decisions/ADR-003_hybrid_multicloud_cloudflare_migration.md
- **Migration Plan:** docs/CLOUDFLARE_MIGRATION_PLAN.md
- **Epic in Jira:** https://automatonicai.atlassian.net/browse/CHRONOS-325

---

**Total Tickets:** 16
**Immediate Focus:** Sprint 1 (5 tickets, 18 points, 1 week)
**All work can start immediately on free tiers - zero costs.**
