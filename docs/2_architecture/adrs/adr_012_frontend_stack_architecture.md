# ADR-012: Frontend Stack Architecture

**Status:** Accepted
**Date:** 2025-11-30
**Decision Makers:** Geoff Bevans
**Related Tickets:** CHRONOS-227 (Epic), CHRONOS-228 through CHRONOS-237 (Implementation Stories)

---

## Context

Project Chronos requires a modern, scalable frontend architecture to support two distinct use cases:

1. **Phase 1: Static Marketing Site** - Brand establishment, lead generation, SEO optimization
2. **Phase 2: Dynamic Client Portal** - Authenticated dashboards, real-time AI insights, data visualization

The frontend must integrate seamlessly with our existing AWS Lightsail infrastructure, which includes:
- PostgreSQL 16.4 with specialized extensions (pgvector, TimescaleDB, PostGIS, Apache AGE)
- Docker containerization
- Automated backup systems (pgBackRest → S3)
- Lightsail instance (small_3_0, 2 vCPUs, 4 GB RAM, 120 GB SSD)

Key requirements:
- **Scalability:** Start simple (SSG), expand to complex (SSR/CSR) without framework rewrites
- **Type Safety:** Prevent runtime errors, improve developer experience
- **SEO Performance:** Critical for marketing site discoverability
- **ML/AI Integration:** Native support for Python-based AI models
- **Cost Efficiency:** Minimize hosting costs during early stages
- **Developer Experience:** Modern tooling, excellent documentation, large ecosystem

---

## Decision

We will implement a **hybrid rendering architecture** using:

### Frontend Stack

| Component | Technology | Version | Rationale |
|-----------|------------|---------|-----------|
| **Framework** | Next.js | 14+ (App Router) | Hybrid rendering (SSG/SSR/CSR), excellent DX, Vercel deployment |
| **Language** | TypeScript | 5.0+ | Type safety across full stack, better refactoring, fewer bugs |
| **Styling** | Tailwind CSS | 3.0+ | Rapid development, consistent design system, minimal CSS |
| **UI Components** | shadcn/ui | Latest | Accessible, customizable, built on Radix UI primitives |
| **CMS** | Payload CMS | 2.0+ | Next.js-native, TypeScript, flexible content modeling |
| **Authentication** | NextAuth.js | 4.0+ | Industry standard, OAuth support, session management |
| **Charts/Viz** | Recharts or Chart.js | Latest | React-native, responsive, data visualization for dashboards |

### Backend Stack

| Component | Technology | Version | Rationale |
|-----------|------------|---------|-----------|
| **API Framework** | FastAPI | 0.104+ | Async native, auto OpenAPI docs, type-safe (Pydantic) |
| **Language** | Python | 3.11+ | AI/ML ecosystem compatibility, team expertise |
| **ORM** | SQLAlchemy | 2.0+ (async) | Mature, supports PostgreSQL extensions, type hints |
| **Database** | PostgreSQL | 16.4 | Already deployed on Lightsail with all needed extensions |
| **Authentication** | JWT tokens | - | Stateless, works with NextAuth.js, scalable |

### Infrastructure & Deployment

| Component | Technology | Rationale |
|-----------|------------|-----------|
| **Frontend Hosting** | Vercel | Zero-config Next.js deployment, global CDN, free tier |
| **Backend Hosting** | AWS Lightsail | Existing instance, cost-effective, full Docker control |
| **CDN** | Vercel Edge Network | Automatic with Vercel, reduces latency globally |
| **Storage** | AWS S3 | Static assets, user uploads, already integrated for backups |
| **Monitoring** | Vercel Analytics + Sentry | Performance tracking, error monitoring |

---

## Architectural Diagrams

### Phase 1: Static Marketing Site (SSG)

```
┌─────────────────────────────────────────────────┐
│          Global Users (Web Traffic)             │
└─────────────────┬───────────────────────────────┘
                  │ HTTPS
┌─────────────────▼───────────────────────────────┐
│          Vercel Edge Network (CDN)              │
│  - Caches static HTML/CSS/JS globally           │
│  - <10ms response time                          │
└─────────────────┬───────────────────────────────┘
                  │
┌─────────────────▼───────────────────────────────┐
│           Next.js App (SSG Mode)                │
│                                                  │
│  Build-time data fetching:                      │
│  ┌────────────────────────────────────┐         │
│  │ getStaticProps()                   │         │
│  │   ↓                                │         │
│  │ Payload CMS API                    │         │
│  │   ↓                                │         │
│  │ Generate Static HTML               │         │
│  └────────────────────────────────────┘         │
│                                                  │
│  Routes:                                         │
│  - / (homepage)                                  │
│  - /about                                        │
│  - /services                                     │
│  - /case-studies                                 │
│  - /blog/*                                       │
│  - /contact                                      │
└──────────────────────────────────────────────────┘

Backend: NOT DEPLOYED YET (Phase 2)
Database: NOT ACCESSED YET (Phase 2)
```

### Phase 2: Dynamic Client Portal (SSR/CSR)

```
┌──────────────────────────────────────────────────┐
│     Authenticated Clients (Portal Users)         │
└─────────────────┬────────────────────────────────┘
                  │ HTTPS
┌─────────────────▼────────────────────────────────┐
│          Vercel Edge Network (CDN)               │
│  - Static assets cached                          │
│  - Dynamic pages bypass cache                    │
└─────────────────┬────────────────────────────────┘
                  │
┌─────────────────▼────────────────────────────────┐
│        Next.js App (Hybrid Mode)                 │
│                                                   │
│  Static Routes (SSG):                            │
│  - Marketing pages (from Phase 1)                │
│                                                   │
│  Server-Side Rendered (SSR):                     │
│  ┌─────────────────────────────────────┐         │
│  │ getServerSideProps()                │         │
│  │   ↓                                 │         │
│  │ Verify NextAuth.js session          │         │
│  │   ↓                                 │         │
│  │ Fetch user data from FastAPI        │         │
│  │   ↓                                 │         │
│  │ Render personalized HTML            │         │
│  └─────────────────────────────────────┘         │
│                                                   │
│  Client-Side Rendered (CSR):                     │
│  - Real-time charts (Recharts)                   │
│  - Live data updates (SWR/React Query)           │
│                                                   │
│  New Routes:                                      │
│  - /client-portal/login                          │
│  - /client-portal/dashboard                      │
│  - /client-portal/insights                       │
│  - /client-portal/reports                        │
└─────────────────┬────────────────────────────────┘
                  │ REST API (HTTPS)
┌─────────────────▼────────────────────────────────┐
│   FastAPI Backend (Docker on Lightsail)          │
│                                                   │
│  Authentication:                                  │
│  - Validate JWT tokens                           │
│  - Role-based access control (RBAC)              │
│                                                   │
│  Business Logic:                                  │
│  - Data aggregation                              │
│  - ML model inference                            │
│  - Query orchestration                           │
│                                                   │
│  API Endpoints:                                   │
│  - POST /api/v1/auth/login                       │
│  - GET /api/v1/clients/{id}/metrics              │
│  - GET /api/v1/insights/{client_id}              │
│  - POST /api/v1/ml/predict                       │
└─────────────────┬────────────────────────────────┘
                  │ PostgreSQL protocol (5432)
┌─────────────────▼────────────────────────────────┐
│  PostgreSQL 16.4 (Docker on Lightsail)           │
│                                                   │
│  Extensions:                                      │
│  - pgvector: AI embeddings, semantic search      │
│  - TimescaleDB: Time-series financial data       │
│  - PostGIS: Geographic analysis                  │
│  - Apache AGE: Graph queries (relationships)     │
│                                                   │
│  Tables:                                          │
│  - users (authentication)                        │
│  - clients (business data)                       │
│  - metrics (time-series)                         │
│  - embeddings (vector search)                    │
│  - relationships (graph data via AGE)            │
└──────────────────────────────────────────────────┘
```

---

## Implementation Plan

### Phase 1: Static Marketing Site (Sprint 8-9)

**Estimated Story Points:** 24
**Timeline:** 2-3 sprints

| Story | Description | Points | Sprint |
|-------|-------------|--------|--------|
| CHRONOS-228 | Set up Next.js + TypeScript + Tailwind | 3 | 8 |
| CHRONOS-229 | Install and configure Payload CMS | 5 | 8 |
| CHRONOS-230 | Design and build marketing pages (SSG) | 8 | 9 |
| CHRONOS-231 | Deploy to Vercel with custom domain | 3 | 9 |
| CHRONOS-232 | Implement contact form with lead capture | 5 | 9 |

**Success Criteria:**
- ✅ Marketing site live at custom domain
- ✅ Lighthouse score >90 (Performance, SEO, Accessibility)
- ✅ Payload CMS operational for content management
- ✅ Contact form stores leads in PostgreSQL
- ✅ Blog posts render from CMS with proper SEO

### Phase 2: Dynamic Client Portal (Sprint 10-11)

**Estimated Story Points:** 32
**Timeline:** 2-3 sprints

| Story | Description | Points | Sprint |
|-------|-------------|--------|--------|
| CHRONOS-233 | Set up FastAPI backend on Lightsail | 5 | 10 |
| CHRONOS-234 | Design API contract (OpenAPI spec) | 3 | 10 |
| CHRONOS-235 | Implement authentication (NextAuth + JWT) | 8 | 10 |
| CHRONOS-236 | Build client portal dashboard (SSR) | 8 | 11 |
| CHRONOS-237 | Integrate ML models with API endpoints | 8 | 11 |

**Success Criteria:**
- ✅ FastAPI deployed with automatic OpenAPI docs
- ✅ Secure authentication with JWT tokens
- ✅ Client dashboard renders personalized data
- ✅ Real-time charts display ML predictions
- ✅ All API endpoints documented and tested

---

## Technology Justifications

### Why Next.js over alternatives?

**Considered Alternatives:**
- **Gatsby:** Strong SSG, but weaker SSR (requires Gatsby Cloud)
- **Nuxt.js (Vue):** Excellent, but smaller ecosystem than React
- **SvelteKit:** Modern, performant, but less mature ecosystem
- **Pure React (CRA/Vite):** No SSR/SSG without custom setup

**Decision:** Next.js provides the best **hybrid rendering** capabilities out-of-the-box. We can deploy Phase 1 as pure SSG (Vercel), then incrementally add SSR/CSR routes in Phase 2 without changing frameworks.

### Why FastAPI over Flask/Django?

**Comparison:**

| Feature | Flask | Django | FastAPI |
|---------|-------|--------|---------|
| **Async/Await** | Via extensions | Limited | Native (ASGI) |
| **Type Safety** | No | No | Yes (Pydantic) |
| **Auto API Docs** | Manual | Manual (DRF) | Automatic (OpenAPI) |
| **Performance** | Good | Good | Excellent |
| **ML Integration** | ✓ | ✓ | ✓ (async-friendly) |
| **Learning Curve** | Easy | Steep | Moderate |

**Decision:** FastAPI's **automatic OpenAPI documentation** is critical for frontend/backend contract alignment. TypeScript can auto-generate types from the OpenAPI spec, ensuring frontend and backend stay in sync. Async support is also important for handling multiple concurrent client requests efficiently.

### Why Payload CMS over Strapi/Contentful?

**Comparison:**

| Feature | Strapi | Contentful | Payload CMS |
|---------|--------|------------|-------------|
| **Framework** | Node.js (generic) | SaaS (proprietary) | Next.js (same stack) |
| **TypeScript** | Partial | N/A | Full |
| **Flexibility** | High | Low (SaaS limits) | Very High |
| **Cost** | Free (self-hosted) | Expensive ($300+/mo) | Free (self-hosted) |
| **Auth Integration** | Separate | Separate | Can share with main app |

**Decision:** Payload CMS is built on the **same Next.js/TypeScript stack** we're using for the frontend. This reduces context-switching and allows potential code sharing. It's also free to self-host (can run on Lightsail alongside FastAPI).

### Why PostgreSQL + Apache AGE over Neptune?

**Decision:** Apache AGE is **already installed** on our PostgreSQL instance. For our use case (hundreds/thousands of clients, not millions), AGE provides sufficient graph query capabilities:

```cypher
-- Example: Find similar clients for recommendations
MATCH (c1:Client {id: 123})-[:SIMILAR_TO]-(c2:Client)
WHERE c2.churn_risk > 0.7
RETURN c2.name, c2.churn_risk
ORDER BY c2.churn_risk DESC
LIMIT 10;
```

**When to Reconsider Neptune:**
- Graph has >10M nodes
- Queries regularly traverse 6+ levels deep
- Graph workload is >50% of database operations

Currently, our primary workload is time-series data (TimescaleDB) and vector search (pgvector), not graph traversals.

### Why Lightsail over EC2?

**Decision:** AWS Lightsail provides:
- ✅ Fixed pricing ($12/month vs. variable EC2 costs)
- ✅ Simplified management (no VPC complexity)
- ✅ Full Docker support (can run any container)
- ✅ Static IP included (16.52.210.100)
- ✅ Root access (can install PostgreSQL extensions)

**When to Migrate to EC2:**
- Need auto-scaling (>100 concurrent users)
- Need complex VPC networking (multi-region)
- Need reserved instance discounts (requires volume)

For Phase 1-2, Lightsail is the optimal choice.

---

## Data Flow Examples

### Phase 1: Blog Post Rendering (SSG)

```typescript
// pages/blog/[slug].tsx

export async function getStaticPaths() {
  const posts = await payloadCMS.find({ collection: 'posts' })
  return {
    paths: posts.docs.map(post => ({ params: { slug: post.slug } })),
    fallback: 'blocking'
  }
}

export async function getStaticProps({ params }) {
  const post = await payloadCMS.findOne({
    collection: 'posts',
    where: { slug: { equals: params.slug } }
  })

  return {
    props: { post },
    revalidate: 3600 // Regenerate every hour
  }
}

export default function BlogPost({ post }) {
  return (
    <article>
      <h1>{post.title}</h1>
      <div dangerouslySetInnerHTML={{ __html: post.content }} />
    </article>
  )
}
```

**Flow:**
1. Next.js build queries Payload CMS API
2. Generates static HTML for each blog post
3. Deploys to Vercel CDN
4. Users get instant (<10ms) page loads

### Phase 2: Client Dashboard (SSR + CSR)

```typescript
// app/client-portal/dashboard/page.tsx

import { getServerSession } from 'next-auth'
import { ClientMetrics } from '@/components/ClientMetrics'

export default async function Dashboard() {
  // SSR: Verify authentication
  const session = await getServerSession()

  if (!session) {
    redirect('/client-portal/login')
  }

  // SSR: Fetch initial data from FastAPI
  const response = await fetch(
    `https://api.chronos.com/v1/clients/${session.user.id}/metrics`,
    {
      headers: {
        Authorization: `Bearer ${session.accessToken}`
      }
    }
  )
  const initialData = await response.json()

  // Render with CSR component for real-time updates
  return (
    <div>
      <h1>Welcome, {session.user.name}</h1>
      <ClientMetrics initialData={initialData} clientId={session.user.id} />
    </div>
  )
}
```

```typescript
// components/ClientMetrics.tsx (Client Component)

'use client'

import { useEffect, useState } from 'react'
import { LineChart } from 'recharts'
import useSWR from 'swr'

export function ClientMetrics({ initialData, clientId }) {
  const { data, error } = useSWR(
    `/api/v1/clients/${clientId}/metrics`,
    fetcher,
    {
      fallbackData: initialData,
      refreshInterval: 30000 // Refresh every 30s
    }
  )

  return (
    <div>
      <LineChart data={data.timeSeries}>
        {/* Chart configuration */}
      </LineChart>
      <div>Churn Risk: {data.churnRisk}%</div>
    </div>
  )
}
```

**Flow:**
1. Next.js SSR verifies user session (NextAuth.js)
2. Server fetches initial data from FastAPI (authenticated)
3. HTML rendered with initial data (fast first paint)
4. Client component takes over, polls for updates every 30s
5. Charts update in real-time without page refresh

### FastAPI Endpoint (Backend)

```python
# app/routers/clients.py

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from app.auth import verify_jwt_token
from app.db import get_db_connection
import asyncpg

router = APIRouter()

class ClientMetrics(BaseModel):
    client_id: int
    revenue: float
    churn_risk: float
    time_series: list[dict]

@router.get("/clients/{client_id}/metrics", response_model=ClientMetrics)
async def get_client_metrics(
    client_id: int,
    current_user = Depends(verify_jwt_token),
    db: asyncpg.Connection = Depends(get_db_connection)
):
    # Verify user has access to this client
    if current_user.client_id != client_id:
        raise HTTPException(status_code=403, detail="Access denied")

    # Query PostgreSQL with TimescaleDB
    time_series = await db.fetch("""
        SELECT time_bucket('1 day', timestamp) AS day,
               AVG(revenue) as avg_revenue
        FROM client_metrics
        WHERE client_id = $1
        AND timestamp > NOW() - INTERVAL '30 days'
        GROUP BY day
        ORDER BY day
    """, client_id)

    # Run ML model for churn prediction
    churn_risk = await predict_churn(client_id, db)

    return ClientMetrics(
        client_id=client_id,
        revenue=sum(row['avg_revenue'] for row in time_series),
        churn_risk=churn_risk,
        time_series=[dict(row) for row in time_series]
    )
```

**Flow:**
1. FastAPI validates JWT token
2. Checks user authorization (RBAC)
3. Queries TimescaleDB for time-series data
4. Runs ML model using pgvector for churn prediction
5. Returns JSON response with Pydantic validation

---

## Performance Targets

### Phase 1 (Marketing Site)

| Metric | Target | Measurement |
|--------|--------|-------------|
| **Lighthouse Performance** | >90 | Google PageSpeed Insights |
| **Lighthouse SEO** | >95 | Google PageSpeed Insights |
| **Time to First Byte (TTFB)** | <100ms | Vercel Analytics |
| **First Contentful Paint (FCP)** | <1.0s | Vercel Analytics |
| **Largest Contentful Paint (LCP)** | <2.5s | Core Web Vitals |
| **Cumulative Layout Shift (CLS)** | <0.1 | Core Web Vitals |

### Phase 2 (Client Portal)

| Metric | Target | Measurement |
|--------|--------|-------------|
| **API Response Time (p95)** | <500ms | FastAPI middleware logging |
| **Dashboard Load Time** | <2.0s | Vercel Analytics |
| **Database Query Time (p95)** | <100ms | PostgreSQL slow query log |
| **ML Inference Time** | <1.0s | Custom metrics in FastAPI |
| **WebSocket Latency** | <50ms | (if implemented for real-time) |

---

## Security Considerations

### Authentication Flow

```
┌─────────────┐                ┌─────────────┐               ┌─────────────┐
│   Next.js   │                │   FastAPI   │               │ PostgreSQL  │
│  (Client)   │                │  (Backend)  │               │    (DB)     │
└──────┬──────┘                └──────┬──────┘               └──────┬──────┘
       │                              │                              │
       │ 1. POST /api/auth/login      │                              │
       ├─────────────────────────────>│                              │
       │    { email, password }       │                              │
       │                              │ 2. Verify credentials        │
       │                              ├─────────────────────────────>│
       │                              │ SELECT * FROM users WHERE... │
       │                              │<─────────────────────────────│
       │                              │ 3. User record               │
       │                              │                              │
       │                              │ 4. Generate JWT token        │
       │                              │    (HS256 signed)            │
       │ 5. Return JWT + refresh token│                              │
       │<─────────────────────────────│                              │
       │                              │                              │
       │ 6. Store in httpOnly cookie  │                              │
       │    (secure, sameSite)        │                              │
       │                              │                              │
       │ 7. GET /client-portal/dash   │                              │
       ├─────────────────────────────>│                              │
       │    Cookie: jwt=eyJ...        │                              │
       │                              │ 8. Verify JWT signature      │
       │                              │    Check expiration          │
       │                              │                              │
       │                              │ 9. Query client data         │
       │                              ├─────────────────────────────>│
       │                              │<─────────────────────────────│
       │                              │                              │
       │ 10. Return dashboard HTML    │                              │
       │<─────────────────────────────│                              │
       │                              │                              │
```

**Security Measures:**
- ✅ Passwords hashed with bcrypt (cost factor 12)
- ✅ JWT tokens signed with HS256 (secret stored in env vars)
- ✅ httpOnly cookies (prevent XSS attacks)
- ✅ CSRF protection (NextAuth.js built-in)
- ✅ CORS configured (only allow Vercel domain → FastAPI)
- ✅ Rate limiting on login endpoint (prevent brute force)
- ✅ HTTPS enforced (TLS 1.2+)

---

## Cost Analysis

### Phase 1 (Marketing Site Only)

| Service | Tier | Monthly Cost |
|---------|------|--------------|
| **Vercel (Frontend)** | Hobby | $0 |
| **Payload CMS** | Self-hosted | $0 (runs on Lightsail) |
| **AWS Lightsail** | Existing instance | $12 (already paid) |
| **Domain (chronos.ai)** | Annual | ~$2/month |
| **Total** | | **$14/month** |

### Phase 2 (Full Stack)

| Service | Tier | Monthly Cost |
|---------|------|--------------|
| **Vercel (Frontend)** | Pro (if needed) | $20 (or stay free) |
| **FastAPI Backend** | On Lightsail | $0 (same instance) |
| **PostgreSQL** | On Lightsail | $0 (same instance) |
| **AWS S3** | Standard | ~$5 (100 GB storage) |
| **Sentry (Monitoring)** | Developer | $0 (free tier) |
| **Domain** | Annual | ~$2/month |
| **Total** | | **$27-47/month** |

**Note:** Costs remain extremely low because we're leveraging the existing Lightsail instance for both FastAPI and PostgreSQL. Only incremental costs are S3 storage and optional Vercel Pro upgrade.

---

## Migration Strategy

### From Phase 1 to Phase 2

**Key Principle:** Zero downtime, incremental deployment

**Steps:**

1. **Deploy FastAPI to Lightsail** (CHRONOS-233)
   - Run FastAPI in Docker container on port 8000
   - Configure Nginx reverse proxy (HTTPS termination)
   - Test API endpoints independently
   - **Marketing site remains live on Vercel**

2. **Add Authentication Routes** (CHRONOS-235)
   - Create `/client-portal/login` page in Next.js
   - Configure NextAuth.js with JWT provider
   - Test authentication flow in staging
   - **Marketing site still unaffected**

3. **Deploy Client Portal** (CHRONOS-236)
   - Add new routes under `/client-portal/*`
   - Configure SSR for authenticated routes
   - Deploy to Vercel (automatic preview deployments)
   - **Marketing routes remain SSG, no changes**

4. **Activate ML Endpoints** (CHRONOS-237)
   - Connect FastAPI to PostgreSQL extensions
   - Implement inference pipelines
   - Test with sample client data
   - **Gradually roll out to beta users**

**Rollback Plan:**
- If Phase 2 has issues, simply remove `/client-portal/*` routes
- Marketing site (Phase 1) continues operating normally
- FastAPI can be stopped without affecting static site

---

## Monitoring and Observability

### Frontend Monitoring (Vercel Analytics)

```typescript
// app/layout.tsx
import { Analytics } from '@vercel/analytics/react'

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  )
}
```

**Metrics Tracked:**
- Page load times (per route)
- Core Web Vitals (LCP, FID, CLS)
- Bounce rate and engagement
- Geographic distribution of users

### Backend Monitoring (FastAPI + Sentry)

```python
# app/main.py
import sentry_sdk
from fastapi import FastAPI, Request
import time

sentry_sdk.init(dsn=os.getenv("SENTRY_DSN"))

app = FastAPI()

@app.middleware("http")
async def add_process_time_header(request: Request, call_next):
    start_time = time.time()
    response = await call_next(request)
    process_time = time.time() - start_time
    response.headers["X-Process-Time"] = str(process_time)

    # Log slow queries
    if process_time > 0.5:
        logger.warning(f"Slow request: {request.url} took {process_time}s")

    return response
```

**Metrics Tracked:**
- API response times (per endpoint)
- Error rates (4xx, 5xx)
- Database query performance
- ML model inference times

---

## Risks and Mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| **Vercel vendor lock-in** | Medium | Medium | Next.js can be self-hosted on Lightsail if needed; keep infrastructure-agnostic |
| **FastAPI learning curve** | Low | Low | Excellent documentation; similar to Flask; team has Python experience |
| **TypeScript complexity** | Low | Low | Gradual adoption; can use `any` type initially and refine later |
| **Lightsail resource limits** | Medium | High | Monitor resource usage; can upgrade to larger Lightsail plan ($24/mo for 4 vCPUs, 8 GB RAM) |
| **PostgreSQL extension compatibility** | Low | Medium | All extensions tested and working; maintain version documentation |
| **API contract drift** | Medium | High | Use OpenAPI spec as single source of truth; auto-generate TypeScript types |

---

## Success Metrics

### Phase 1 Success

- ✅ Marketing site live with custom domain
- ✅ 10+ blog posts published via Payload CMS
- ✅ 50+ qualified leads captured via contact form
- ✅ Lighthouse score >90 on all pages
- ✅ <2 second average page load time

### Phase 2 Success

- ✅ 5+ beta clients onboarded to portal
- ✅ <500ms API response time (p95)
- ✅ Zero security incidents
- ✅ 95%+ uptime (portal availability)
- ✅ Positive client feedback on dashboard UX

---

## Future Enhancements (Post-Phase 2)

### Potential Additions

1. **Real-Time Features**
   - WebSocket support for live data updates
   - Server-Sent Events (SSE) for notifications
   - Collaborative features (multiple users viewing same data)

2. **Advanced AI Features**
   - Natural language query interface (LLM integration)
   - Automated report generation
   - Predictive analytics dashboards

3. **Mobile App**
   - React Native app (shares code with Next.js)
   - Offline-first architecture
   - Push notifications

4. **GraphQL API**
   - Add GraphQL layer alongside REST
   - More flexible client queries
   - Reduced over-fetching

5. **Multi-Tenancy**
   - Row-level security in PostgreSQL
   - Tenant isolation
   - White-label portal options

---

## References

- [Next.js Documentation](https://nextjs.org/docs)
- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [PostgreSQL Extensions Guide](https://www.postgresql.org/docs/16/contrib.html)
- [Vercel Deployment Guide](https://vercel.com/docs)
- [TypeScript Best Practices](https://www.typescriptlang.org/docs/handbook/intro.html)
- [Apache AGE Documentation](https://age.apache.org/docs/)

---

## Appendix A: API Contract Example

### Sample OpenAPI Specification

```yaml
openapi: 3.0.0
info:
  title: Project Chronos API
  version: 1.0.0
  description: FastAPI backend for client portal

paths:
  /api/v1/clients/{client_id}/metrics:
    get:
      summary: Get client metrics
      security:
        - bearerAuth: []
      parameters:
        - name: client_id
          in: path
          required: true
          schema:
            type: integer
      responses:
        '200':
          description: Client metrics retrieved successfully
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ClientMetrics'
        '401':
          description: Unauthorized
        '403':
          description: Forbidden

components:
  schemas:
    ClientMetrics:
      type: object
      properties:
        client_id:
          type: integer
        revenue:
          type: number
          format: float
        churn_risk:
          type: number
          format: float
          minimum: 0
          maximum: 1
        time_series:
          type: array
          items:
            type: object
            properties:
              day:
                type: string
                format: date
              avg_revenue:
                type: number
                format: float

  securitySchemes:
    bearerAuth:
      type: http
      scheme: bearer
      bearerFormat: JWT
```

---

## Appendix B: Environment Variables

### Next.js (.env.local)

```bash
# NextAuth.js
NEXTAUTH_URL=https://chronos.ai
NEXTAUTH_SECRET=<generated-secret>

# FastAPI Backend
NEXT_PUBLIC_API_URL=https://api.chronos.ai

# Payload CMS
PAYLOAD_SECRET=<generated-secret>
MONGODB_URI=mongodb://localhost:27017/payload  # Or PostgreSQL connection

# Analytics
NEXT_PUBLIC_VERCEL_ANALYTICS_ID=<vercel-analytics-id>
```

### FastAPI (.env)

```bash
# Database
DATABASE_URL=postgresql://chronos:PASSWORD@localhost:5432/chronos

# JWT Authentication
JWT_SECRET_KEY=<generated-secret>
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# CORS
ALLOWED_ORIGINS=https://chronos.ai,https://www.chronos.ai

# Monitoring
SENTRY_DSN=<sentry-dsn>

# AWS (for S3 uploads)
AWS_ACCESS_KEY_ID=<aws-access-key>
AWS_SECRET_ACCESS_KEY=<aws-secret-key>
AWS_REGION=ca-central-1
S3_BUCKET_NAME=chronos-uploads
```

---

## Decision Log

| Date | Decision | Rationale |
|------|----------|-----------|
| 2025-11-30 | Choose Next.js over Gatsby/Nuxt | Hybrid rendering, best React ecosystem |
| 2025-11-30 | Choose FastAPI over Flask/Django | Async-native, auto OpenAPI docs, type safety |
| 2025-11-30 | Choose Payload CMS over Strapi | Next.js-native, TypeScript, flexible |
| 2025-11-30 | Use Apache AGE, defer Neptune | Already installed, sufficient for use case |
| 2025-11-30 | Stay on Lightsail vs. EC2 | Cost-effective, simpler, meets needs |
| 2025-11-30 | TypeScript required (not optional) | Type safety critical for scale |
| 2025-11-30 | Two-phase rollout (SSG → Dynamic) | Reduces risk, validates tech choices early |

---

## Conclusion

This architecture provides a **scalable, type-safe, cost-effective** foundation for Project Chronos. By starting with SSG (Phase 1) and expanding to SSR/CSR (Phase 2), we validate our technology choices incrementally while delivering business value at each stage.

The stack leverages our existing AWS Lightsail infrastructure (PostgreSQL with specialized extensions) while adding modern frontend capabilities (Next.js, TypeScript) and a high-performance API layer (FastAPI).

Total estimated development time: **4-6 sprints** (Phase 1: 2-3 sprints, Phase 2: 2-3 sprints)
Total estimated cost: **$27-47/month** (including all hosting, storage, and monitoring)

**Approved by:** Geoff Bevans
**Implementation Start:** Sprint 8 (CHRONOS-228)
