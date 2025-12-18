# ADR-003: Hybrid Multi-Cloud Architecture with Cloudflare Edge

**Date:** 2025-12-17
**Status:** Proposed
**Deciders:** Product/Engineering Leadership
**Supersedes:** ADR-002 (Payload CMS / Vercel Architecture)

---

## Context and Problem Statement

Following the Payload CMS removal and project reset, we need to establish a **scalable, cost-effective, high-performance architecture** for the SaaS platform. The previous Vercel-centric approach presented several challenges:

1. **Cost Unpredictability:** Vercel's bandwidth and function invocation overages can scale non-linearly
2. **Media Delivery Costs:** Serving images/assets from Vercel or S3 incurs significant egress fees
3. **Edge Performance:** Need global low-latency API responses without complex CDN setup
4. **Data Residency:** Must maintain Canadian data sovereignty for regulated financial data
5. **Flexibility:** Want to avoid deep vendor lock-in while maintaining operational simplicity

---

## Decision Drivers

### Business Drivers
- **Cost Control:** Predictable, low-cost infrastructure for pre-revenue phase
- **Global Performance:** Sub-100ms API response times worldwide
- **Compliance:** Canadian data residency for PostgreSQL (financial regulations)
- **Scalability:** Support 0 → 10,000 users without infrastructure redesign

### Technical Drivers
- **Best-of-Breed:** Use optimal tool for each layer (not monolithic platform)
- **Developer Experience:** Fast local dev, simple deployments, good observability
- **Future-Proofing:** Architecture supports Python ML/AI workloads
- **Reduced Lock-in:** Avoid dependency on single vendor's pricing model

---

## Considered Options

### Option 1: Status Quo (Vercel + AWS)
**Components:** Vercel (frontend + API routes), AWS Lightsail (PostgreSQL), AWS S3 (media)

**Pros:**
- ✅ Already deployed and working
- ✅ Integrated platform (simple)
- ✅ Excellent DX

**Cons:**
- ❌ High bandwidth costs ($0.10/GB after 100GB on Pro plan)
- ❌ Function invocation limits (100K/month free → $2 per 1M)
- ❌ S3 egress fees ($0.09/GB)
- ❌ Serverless function cold starts (100-500ms)

**Estimated Cost at 10K users:** ~$200-400/month

---

### Option 2: Full AWS (ECS + CloudFront + RDS)
**Components:** ECS Fargate (containers), CloudFront (CDN), RDS (managed PostgreSQL), S3 (media)

**Pros:**
- ✅ Single vendor (simplified billing)
- ✅ Enterprise-grade reliability
- ✅ Full control over infrastructure

**Cons:**
- ❌ Complex setup (ECS, ALB, VPC, CloudFront config)
- ❌ Still paying S3 egress fees
- ❌ No edge compute (CloudFront Functions limited)
- ❌ RDS doesn't support all PostgreSQL extensions (e.g., PostGIS, pgvector)
- ❌ No Canadian data residency in RDS (only us-east-1, us-west-2 for extended regions)

**Estimated Cost at 10K users:** ~$300-500/month

---

### Option 3: Hybrid Multi-Cloud (Cloudflare + AWS) ✅ SELECTED
**Components:**
- **Cloudflare Pages:** Frontend (Next.js SSG/SSR via OpenNext)
- **Cloudflare Workers:** Edge API orchestration (TypeScript/Hono)
- **Cloudflare R2:** Object storage (images, media)
- **Cloudflare Hyperdrive:** PostgreSQL connection pooler/cache
- **AWS Lightsail:** Self-managed PostgreSQL (Montreal region)
- **AWS Lambda:** Heavy compute (Python/FastAPI) - future

**Pros:**
- ✅ **Massive cost savings:** R2 has $0 egress fees, Workers billed on CPU time
- ✅ **Global edge performance:** <1ms cold starts, worldwide deployment
- ✅ **Data residency:** Lightsail in Montreal maintains Canadian sovereignty
- ✅ **Extension support:** Self-managed PostgreSQL supports PostGIS, pgvector, TimescaleDB
- ✅ **Best-of-breed:** Right tool for each job (TS for edge, Python for compute)
- ✅ **Unlimited bandwidth:** Cloudflare Pages has no bandwidth limits

**Cons:**
- ❌ Multi-cloud complexity (2 vendors instead of 1)
- ❌ OpenNext adapter dependency (third-party Next.js bridge)
- ❌ Self-managed PostgreSQL (DBA responsibility)
- ❌ New platform learning curve

**Estimated Cost at 10K users:** ~$50-100/month

**Cost Comparison:**
- **85% cheaper** than Vercel option
- **75% cheaper** than Full AWS option

---

## Decision Outcome

**Chosen Option:** Option 3 - Hybrid Multi-Cloud (Cloudflare + AWS)

### Rationale

1. **Economics:** The cost difference is transformational for a bootstrapped SaaS
   - R2's $0 egress eliminates the largest variable cost
   - Workers' CPU-time billing is 10x cheaper than function invocations for I/O-bound tasks

2. **Performance:** Edge compute solves the global latency problem
   - Hyperdrive reduces DB query latency by 90% for edge-to-regional connections
   - Workers' sub-millisecond cold starts enable true real-time APIs

3. **Technical Requirements:**
   - Self-managed PostgreSQL is **required** for PostGIS (geospatial), pgvector (AI/semantic search)
   - Montreal Lightsail is **required** for Canadian data residency
   - These requirements make managed solutions (RDS, Supabase) non-viable

4. **Strategic Flexibility:**
   - Avoiding Vercel's pricing model reduces existential scaling risk
   - Cloudflare's pricing is more predictable and developer-friendly
   - Can add Python compute (Lambda) without rearchitecting edge layer

---

## Architectural Components

### Layer 1: Frontend & CDN
**Service:** Cloudflare Pages
**Technology:** Next.js 16 (SSG/SSR) via OpenNext adapter
**Responsibility:** Static site generation, server-side rendering, client delivery

**Key Decisions:**
- Use **OpenNext** adapter to deploy Next.js to Cloudflare Pages
- Alternative: Cloudflare's native Next.js support (verify limitations first)
- **Unlimited bandwidth** - no overage fees

---

### Layer 2: Edge API Orchestration
**Service:** Cloudflare Workers
**Technology:** TypeScript + Hono framework
**Responsibility:** Routing, authentication, request/response transformation, business logic

**Why Hono?**
- Lightweight Express-like framework optimized for Workers
- Excellent TypeScript support
- Middleware ecosystem (auth, CORS, logging)
- 10x faster than Express on edge runtime

**Use Cases:**
- User authentication (JWT validation)
- API routing and composition
- Request validation (Zod schemas)
- Response caching
- Rate limiting

**Constraints:**
- 50ms CPU time limit (default, can request increase)
- 128MB memory limit
- No filesystem access (stateless)

---

### Layer 3: Database Acceleration
**Service:** Cloudflare Hyperdrive
**Technology:** Connection pooler + query cache
**Responsibility:** Reduce latency for edge → regional DB queries

**Performance Impact:**
- **Without Hyperdrive:** 100-300ms per query (edge → Montreal)
- **With Hyperdrive:** 10-30ms for cached queries (90% reduction)

**How It Works:**
1. Worker connects to Hyperdrive (1-2ms)
2. Hyperdrive maintains persistent connections to PostgreSQL
3. Frequent queries cached at edge
4. Connection pooling prevents "thundering herd"

---

### Layer 4: Object Storage (DAM)
**Service:** Cloudflare R2
**Technology:** S3-compatible object storage
**Responsibility:** Images, videos, user uploads, static assets

**Cost Comparison:**
| Storage | AWS S3 | Cloudflare R2 |
|---------|--------|---------------|
| Storage | $0.023/GB | $0.015/GB |
| Egress | **$0.09/GB** | **$0.00** |
| Operations | $0.005/1K | $0.0036/1K |

**For 1TB/month delivery:** S3 = $90, R2 = $0
**Annual savings:** $1,080

**S3 Compatibility:**
- R2 implements S3 API (use aws-sdk)
- No egress fees even for S3 API calls
- Regional buckets not required (global)

---

### Layer 5: Data Persistence
**Service:** AWS Lightsail PostgreSQL
**Location:** Montreal, Canada
**Technology:** Self-managed PostgreSQL 15+ with extensions

**Why Self-Managed?**
- **PostGIS:** Geospatial queries (required for location-based features)
- **pgvector:** Semantic search, AI embeddings (future ML features)
- **TimescaleDB:** Time-series optimization (financial data)
- **pg_cron:** Scheduled database tasks

**Why Lightsail (not RDS)?**
- RDS restricts extension installation (no PostGIS on all plans)
- Lightsail provides full superuser access
- 75% cheaper than equivalent RDS instance
- **Montreal region = Canadian data residency**

**DBA Risk Mitigation:**
- ✅ **pgBackrest** already configured (automated backups)
- ✅ Daily snapshots to S3
- ✅ Point-in-time recovery enabled
- ⏳ Monitoring (to be added in Phase 3)

---

### Layer 6: Heavy Compute (Future)
**Service:** AWS Lambda
**Technology:** Python 3.11+ with FastAPI
**Responsibility:** CPU-intensive workloads (AI/ML, complex calculations)

**Why Lambda (not Workers)?**
- Python ecosystem (NumPy, Pandas, scikit-learn, TensorFlow)
- 15-minute max execution (vs Workers' 50ms CPU)
- 10GB memory available (vs Workers' 128MB)

**Use Cases (Future):**
- Financial modeling and backtesting
- ML model inference (embeddings, predictions)
- PDF generation, data exports
- ETL pipelines

**Architecture:**
```
Client → Cloudflare Worker → AWS Lambda (Python)
         ↓ (fast path)
         PostgreSQL via Hyperdrive
```

---

## Language & Framework Decisions

### Edge Layer (Cloudflare Workers)
**Choice:** TypeScript + Hono

**Rationale:**
- Workers runtime is V8-based (JavaScript native)
- TypeScript provides type safety for API contracts
- Hono is purpose-built for edge runtime performance
- Excellent DX with Wrangler CLI

**Alternative Considered:** Rust (compiled to WASM)
- **Rejected:** Unnecessary complexity for I/O-bound orchestration
- **Reserve for:** Future use if CPU-bound edge work needed

---

### Compute Layer (AWS Lambda)
**Choice:** Python 3.11+ with FastAPI

**Rationale:**
- Python dominates data science, ML, financial modeling
- FastAPI provides async performance + automatic OpenAPI docs
- Massive ecosystem for numerical computing
- Team expertise in Python

**Not a Polyglot Problem:**
- TS for edge = I/O-bound, low-latency orchestration
- Python for compute = CPU-bound, data-intensive processing
- **Clean separation of concerns**

---

## Migration Strategy

### Phase 0: Validation (1-2 days)
**Goal:** Prove the stack works before committing

**Tasks:**
1. Deploy "Hello World" Next.js app to Cloudflare Pages (via OpenNext)
2. Deploy minimal Worker with `/healthcheck` endpoint
3. Configure Hyperdrive to connect to Lightsail PostgreSQL
4. Test end-to-end: Client → Pages → Worker → Hyperdrive → PostgreSQL

**Success Criteria:**
- ✅ All components communicate
- ✅ Latency measurements acceptable (<100ms p95)
- ✅ No blockers discovered

**Rollback:** Abandon if critical limitations found

---

### Phase 1: Local Development Hardening (3-5 days)
**Goal:** Cloud-agnostic local development environment

**Tasks:**
1. **Docker Compose:** Local PostgreSQL with all extensions (PostGIS, pgvector, TimescaleDB)
2. **Nx Workspace:** Define projects (`web`, `worker`, `compute`), enforce boundaries
3. **Dependency Management:** Lock versions, integrate Dependabot
4. **Dev Scripts:** Single command to start entire stack locally

**Success Criteria:**
- ✅ `pnpm run dev` starts everything (Next.js, local DB, mock Worker)
- ✅ Zero cloud dependencies for development
- ✅ CI tests pass

**Deliverables:**
- `docker-compose.yml` with PostgreSQL + extensions
- Updated `nx.json` with project structure
- `CONTRIBUTING.md` with local setup instructions

---

### Phase 2: Cloudflare Migration (5-7 days)
**Goal:** Deploy to production Cloudflare stack

**Tasks:**
1. **Frontend Migration:**
   - Integrate OpenNext adapter into Next.js
   - Deploy to Cloudflare Pages
   - Configure custom domain (automatonicai.com)
   - **Keep Vercel deployment running** (parallel)

2. **Worker Deployment:**
   - Create TypeScript Worker project with Hono
   - Implement basic routes (`/api/health`, `/api/v1/*`)
   - Deploy via Wrangler CLI
   - Set up environment variables (Cloudflare Secrets)

3. **Infrastructure Glue:**
   - Configure Hyperdrive connection to Lightsail PostgreSQL
   - Set up R2 bucket for media storage
   - Test end-to-end data flow

**Success Criteria:**
- ✅ automatonicai.com loads from Cloudflare Pages
- ✅ API requests route through Worker → Hyperdrive → PostgreSQL
- ✅ Images serve from R2
- ✅ Performance meets targets (p95 < 100ms API latency)

**Rollback Plan:**
- Cloudflare DNS → Vercel (5-minute cutover)
- Keep Vercel deployment for 30 days

**Decommission Vercel:** Only after 30 days of stable Cloudflare operation

---

### Phase 3: DevOps Hardening (3-5 days)
**Goal:** Production-grade observability and automation

**Tasks:**
1. **CI/CD Pipeline:**
   - GitHub Actions workflows for:
     - Run tests on every PR
     - Deploy to Cloudflare on merge to `main`
     - Automated dependency updates (Dependabot)
   - Wrangler GitHub Action for Worker deployments

2. **Observability:**
   - **Sentry:** Error tracking for Next.js + Workers
   - **Cloudflare Analytics:** Traffic, performance, security metrics
   - **PostgreSQL Monitoring:** pg_stat_statements, query performance
   - **Uptime Monitoring:** UptimeRobot (free tier)

3. **Secrets Management:**
   - GitHub Secrets for CI/CD (DB connection strings, API keys)
   - Cloudflare Secrets for runtime (Worker environment)
   - Documented rotation procedures

**Success Criteria:**
- ✅ Every commit runs tests and deploys automatically
- ✅ Errors visible in Sentry within 1 minute
- ✅ Performance dashboards accessible
- ✅ No secrets in git history or code

**Deliverables:**
- `.github/workflows/deploy.yml`
- Sentry project configured
- Runbook for incident response

---

### Phase 4: Feature Development (Ongoing)
**Goal:** Build product features on stable foundation

**Priorities:**
1. **Content Management (MDX):**
   - Marketing pages
   - Blog system
   - Documentation

2. **Authentication:**
   - User registration/login
   - JWT-based auth in Worker
   - Session management

3. **Core Features:**
   - Financial data ingestion
   - Graph/vector queries
   - Admin dashboard

**Success Criteria:**
- ✅ Features ship on 2-week sprint cadence
- ✅ Zero infrastructure surprises
- ✅ Performance maintains <100ms p95

---

## Consequences

### Positive

1. **Cost Reduction:** 75-85% cheaper than Vercel or full AWS at scale
2. **Performance:** Global edge deployment, <1ms cold starts
3. **Flexibility:** Can add Python compute without rearchitecting
4. **Compliance:** Canadian data residency maintained
5. **Scalability:** Architecture supports 0 → 100K users without changes

### Negative

1. **Complexity:** Multi-cloud setup requires more expertise
2. **Learning Curve:** Team must learn Cloudflare Workers, Hyperdrive, R2
3. **Third-Party Risk:** OpenNext adapter is not official Cloudflare/Vercel tool
4. **DBA Responsibility:** Self-managed PostgreSQL requires backup/monitoring vigilance

### Neutral

1. **Vendor Lock-in Shift:** Trading Vercel for Cloudflare (different, not eliminated)
2. **Polyglot Codebase:** TS + Python (intentional, not accidental)

---

## Risks and Mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| OpenNext adapter breaks with Next.js update | Medium | High | Pin Next.js version, monitor OpenNext repo, have migration plan to official Cloudflare support |
| Hyperdrive increases latency unexpectedly | Low | Medium | Benchmark before/after, direct PostgreSQL connection as fallback |
| Workers CPU limit hit | Low | Medium | Profile code, request limit increase, move heavy work to Lambda |
| Self-managed DB failure | Low | Critical | pgBackrest daily backups, point-in-time recovery, documented restore procedure |
| Cloudflare outage | Low | High | Keep Vercel deployment for 30 days, DNS failover documented |

---

## Monitoring and Success Metrics

### Performance Targets
- **API Latency (p95):** < 100ms global
- **Page Load (First Contentful Paint):** < 1.5s
- **Database Query Time (p95):** < 30ms (via Hyperdrive)

### Cost Targets
- **Total Infrastructure:** < $100/month at 10K users
- **Cost per User:** < $0.01/month

### Reliability Targets
- **Uptime:** 99.9% (43 minutes downtime/month acceptable)
- **Error Rate:** < 0.1% of requests

---

## References

### Documentation
- [Cloudflare Workers Docs](https://developers.cloudflare.com/workers/)
- [Hyperdrive Documentation](https://developers.cloudflare.com/hyperdrive/)
- [OpenNext GitHub](https://github.com/sst/open-next)
- [Hono Framework](https://hono.dev/)

### Cost Calculators
- [Cloudflare Pricing](https://www.cloudflare.com/plans/developer-platform/)
- [AWS Lightsail Pricing](https://aws.amazon.com/lightsail/pricing/)

### Benchmarks
- Cloudflare Workers: <1ms cold start (measured)
- Hyperdrive: 90% latency reduction (Cloudflare case studies)
- R2: $0 egress (verified in pricing docs)

---

## Decision Log

| Date | Decision | Reason |
|------|----------|--------|
| 2025-12-17 | Adopt Cloudflare + AWS hybrid architecture | Cost, performance, compliance requirements |
| 2025-12-17 | Use OpenNext for Next.js deployment | Enables Cloudflare Pages with Next.js SSR |
| 2025-12-17 | Select Hono for Worker framework | Lightweight, TypeScript-first, edge-optimized |
| 2025-12-17 | Keep Lightsail PostgreSQL in Montreal | Extension support + Canadian data residency |
| 2025-12-17 | Defer Python/Lambda to Phase 4+ | Focus on core infrastructure first |

---

**Next Steps:** Proceed to Phase 0 (Validation) to prove architecture viability before full commitment.
