# ADR 019: Data Ingestion Deployment Strategy

**Date:** 2026-01-07  
**Status:** 🟡 Proposed  
**Deciders:** Geoff Bevans  
**Related:** ADR-013 (Geospatial Ingestion), CHRONOS-395, CHRONOS-396

## Context

We need to ingest Canadian economic data from FRED and Bank of Canada Valet APIs into our production PostgreSQL database on AWS Lightsail. The current devcontainer has a broken Python SSL module, preventing HTTPS API calls.

### Current State
- ✅ Database: AWS Lightsail PostgreSQL (16.52.210.100)
- ✅ Directus CMS: Running on Lightsail via Docker
- ✅ Ingestion code: Exists in `/workspace/src/chronos/ingestion/`
- ❌ **Problem:** Devcontainer Python SSL module broken
- ❌ **Problem:** No project code deployed to Lightsail server

### Constraints
- **Solo developer** with limited time/energy/tokens
- **Cost-conscious** - minimize AWS egress/compute costs
- **Production quality** - must be reliable and maintainable
- **Git flow** - all work must use feature branches
- **Jira tracking** - all work must be tracked via acli

## Decision

**We will adopt a LEAN, pragmatic approach: Run ingestion from the devcontainer using a Docker container.**

This avoids:
- ❌ Deploying entire codebase to Lightsail (complexity, egress costs)
- ❌ Maintaining separate Python environments
- ❌ System Python usage
- ❌ Devcontainer SSL fixes (time-consuming)

## Proposed Solution: Docker-Based Ingestion

### Architecture

```
┌─────────────────────────────────────────────────────────────┐
│ Local Machine / Devcontainer                                │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ Docker Container (python:3.11-slim)                  │  │
│  │                                                       │  │
│  │  - Fresh Python with working SSL                     │  │
│  │  - Ingestion code mounted from /workspace            │  │
│  │  - .env.aws for DB credentials                       │  │
│  │                                                       │  │
│  │  Runs: timeseries_cli.py --geography Canada          │  │
│  └──────────────────────────────────────────────────────┘  │
│                           │                                  │
│                           │ HTTPS API calls                  │
│                           ▼                                  │
│                  ┌─────────────────┐                         │
│                  │ FRED API        │                         │
│                  │ Valet API       │                         │
│                  └─────────────────┘                         │
│                           │                                  │
│                           │ PostgreSQL connection            │
│                           ▼                                  │
└───────────────────────────┼──────────────────────────────────┘
                            │
                            ▼
                ┌───────────────────────────┐
                │ AWS Lightsail             │
                │                           │
                │  PostgreSQL (16.52...)    │
                │  Directus (Docker)        │
                └───────────────────────────┘
```

### Implementation

1. **Dockerfile.ingestion** (already created)
   - Base: `python:3.11-slim`
   - Dependencies: psycopg2-binary, requests, pandas
   - Mounts: `/workspace/src`, `/workspace/database/seeds`

2. **Run script** (already created)
   - `scripts/run-ingestion-docker.sh`
   - Builds image, runs container with `.env.aws`

3. **Execution**
   ```bash
   # From devcontainer or local machine with Docker
   bash scripts/run-ingestion-docker.sh
   ```

### Cost Analysis

**Current Costs (Lightsail only):**
- Lightsail instance: $10/month (512MB RAM, 1 vCPU)
- Static IP: Free (included)
- **Total: ~$10/month**

**Option A: Deploy Full Project to Lightsail**
- Same Lightsail instance: $10/month
- Egress for code deployment: ~$0.01/GB (negligible, one-time)
- **Total: ~$10/month**
- **Complexity:** HIGH (maintain separate environment)

**Option B: Docker from Devcontainer (RECOMMENDED)**
- Same Lightsail instance: $10/month
- No additional egress (only DB queries, ~KB)
- **Total: ~$10/month**
- **Complexity:** LOW (use existing devcontainer)

**Verdict:** Docker approach has **zero additional cost** and **minimal complexity**.

### Egress Implications

**Data Transfer Costs:**
- API calls (FRED/Valet): FREE (outbound from your network)
- PostgreSQL queries: ~1-5 KB per observation
- 10,000 observations: ~50 MB total
- AWS egress: First 1 GB free, then $0.09/GB
- **Cost for ingestion: $0** (well under 1 GB)

**Ongoing:**
- Monthly ingestion updates: ~10-50 MB/month
- **Annual cost: $0** (always under free tier)

## Consequences

### Positive
- ✅ **Zero additional AWS costs**
- ✅ **No code deployment complexity**
- ✅ **Works from devcontainer immediately**
- ✅ **Isolated environment (Docker)**
- ✅ **No system Python usage**
- ✅ **Reproducible across machines**

### Negative
- ⚠️ Requires Docker daemon (not available in current devcontainer)
- ⚠️ Slightly slower than native Python (container overhead)

### Neutral
- 🔵 Local development unaffected (continue using devcontainer)
- 🔵 Can switch to Lightsail deployment later if needed

## Alternatives Considered

### Alternative 1: Fix Devcontainer Python SSL
**Pros:** Native performance, no Docker needed  
**Cons:** Time-consuming, may break other things, not guaranteed to work  
**Verdict:** ❌ Not worth the effort for one-time ingestion

### Alternative 2: Deploy Full Project to Lightsail
**Pros:** Production-like setup, faster DB access  
**Cons:** Complexity, maintaining two environments, deployment overhead  
**Verdict:** ❌ Overkill for solo developer with infrequent ingestion

### Alternative 3: Use Bash/SQL Script
**Pros:** No Python needed, simple  
**Cons:** Harder to maintain, less robust error handling  
**Verdict:** ⚠️ Fallback option if Docker unavailable

## Implementation Plan

### Phase 1: Enable Docker in Devcontainer (CHRONOS-399)
**Effort:** 1-2 hours  
**Branch:** `feature/CHRONOS-399-docker-in-devcontainer`

1. Update `.devcontainer/devcontainer.json`:
   ```json
   {
     "features": {
       "ghcr.io/devcontainers/features/docker-in-docker:2": {}
     }
   }
   ```
2. Rebuild devcontainer
3. Test: `docker ps`

### Phase 2: Run Canadian Data Ingestion (CHRONOS-400)
**Effort:** 30 minutes  
**Branch:** `feature/CHRONOS-400-canadian-data-ingestion`

1. Run: `bash scripts/run-ingestion-docker.sh`
2. Verify: Query database for Canadian observations
3. Restart Directus: SSH to Lightsail, `docker compose restart directus`

### Phase 3: Document and Automate (CHRONOS-401)
**Effort:** 1 hour  
**Branch:** `feature/CHRONOS-401-ingestion-automation`

1. Create workflow documentation
2. Add to CI/CD (optional, for future)
3. Schedule monthly updates (cron or GitHub Actions)

## Jira Tracking

**Epic:** CHRONOS-395 (Fix Directus Data Collection Accessibility)

**Stories:**
- **CHRONOS-399:** Enable Docker-in-Docker in Devcontainer
  - Acceptance: `docker ps` works in devcontainer
  - Estimate: 2 story points
  
- **CHRONOS-400:** Ingest Canadian Economic Data
  - Acceptance: 14 series, ~10,000 observations in database
  - Estimate: 3 story points
  
- **CHRONOS-401:** Document Ingestion Process
  - Acceptance: README with runbook
  - Estimate: 1 story point

**Total Effort:** 6 story points (~1 day)

## Git Flow

All work follows ADR-004:

```bash
# Create feature branch
git checkout -b feature/CHRONOS-399-docker-in-devcontainer

# Make changes, commit with conventional commits
git commit -m "feat(devcontainer): CHRONOS-399 Add Docker-in-Docker support"

# Push and create PR
git push origin feature/CHRONOS-399-docker-in-devcontainer
# Open PR: "feat(devcontainer): CHRONOS-399 Add Docker-in-Docker support"

# Merge to develop after review
# Repeat for CHRONOS-400, CHRONOS-401
```

## Success Criteria

- [ ] Docker works in devcontainer
- [ ] Canadian data ingestion completes successfully
- [ ] ~10,000 observations in database
- [ ] Directus UI shows Canadian data
- [ ] Zero additional AWS costs
- [ ] All work tracked in Jira
- [ ] All changes in feature branches with PRs

## Future Considerations

### When to Deploy to Lightsail

Consider deploying full project when:
- Ingestion frequency increases (daily/hourly)
- Multiple data sources added
- Need for scheduled automation
- Team grows beyond solo developer

### Migration Path

If needed later:
1. Create deployment script
2. Set up CI/CD pipeline
3. Use Docker Compose on Lightsail
4. Minimal code changes (already containerized)

## References

- [Dockerfile.ingestion](file:///workspace/Dockerfile.ingestion)
- [run-ingestion-docker.sh](file:///workspace/scripts/run-ingestion-docker.sh)
- [ADR-004: Git Workflow](file:///workspace/docs/10-DEVELOPMENT/01-ARCHITECTURE/adrs/adr_004_git_workflow_and_branching_model.md)
- [ADR-013: Geospatial Ingestion](file:///workspace/docs/10-DEVELOPMENT/01-ARCHITECTURE/adrs/adr_013_geospatial_ingestion.md)

## Decision

**Status:** 🟡 Proposed  
**Recommendation:** APPROVE - Lean, cost-effective, production-quality solution for solo developer

---

**Next Steps:**
1. Review this ADR
2. Create Jira tickets (CHRONOS-399, 400, 401)
3. Implement Phase 1 (Docker-in-Docker)
4. Execute ingestion
5. Update ADR status to ✅ Approved
