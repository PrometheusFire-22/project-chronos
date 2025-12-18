# Cloudflare Migration - Sprint Planning & Execution Roadmap

**Project:** Hybrid Multi-Cloud Architecture Migration
**Timeline:** 4-6 weeks (4 sprints @ 1-2 weeks each)
**Status:** Planning
**Owner:** Engineering Team
**Related:** ADR-003

---

## 📋 Executive Summary

This document outlines the sprint-by-sprint execution plan for migrating from Vercel to a Cloudflare-based hybrid multi-cloud architecture. The migration is broken into **4 major sprints** with clear deliverables, acceptance criteria, and rollback procedures.

### Timeline Overview
```
Sprint 0: Validation (Proof of Concept)    ━━━━━━━━ 2-3 days
Sprint 1: Local Development Hardening      ━━━━━━━━━━━━━━ 1 week
Sprint 2: Cloudflare Migration (Parallel)  ━━━━━━━━━━━━━━━━━━━━ 1-2 weeks
Sprint 3: DevOps Hardening & Observability ━━━━━━━━━━━━━━ 1 week
Sprint 4: Feature Development (Ongoing)    ━━━━━━━━━━━━━━━━━━━━━━━━━━→
```

### Risk Level: 🟡 MEDIUM
- **High Impact, Medium Complexity**
- **Rollback Available:** Vercel deployment maintained in parallel for 30 days
- **Validation First:** Sprint 0 proves viability before commitment

---

## 🎯 Sprint 0: Proof of Concept Validation

**Duration:** 2-3 days
**Goal:** Prove the entire Cloudflare stack works before committing to migration
**Risk:** LOW (throwaway work if it fails)

### Objectives
1. Verify OpenNext can deploy Next.js to Cloudflare Pages
2. Confirm Workers can connect to Lightsail PostgreSQL via Hyperdrive
3. Test R2 for image delivery
4. Measure end-to-end latency (set baseline)

---

### Tasks

#### Task 0.1: Create Minimal Next.js Test App
**Owner:** Engineering
**Effort:** 2 hours

**Steps:**
1. Create new Next.js 16 project: `npx create-next-app@latest cloudflare-test`
2. Add one static page (`/`)
3. Add one server-side rendered page (`/ssr`)
4. Add one API route (`/api/hello`)

**Acceptance Criteria:**
- ✅ App runs locally with `pnpm run dev`
- ✅ Build succeeds with `pnpm run build`

---

#### Task 0.2: Deploy to Cloudflare Pages via OpenNext
**Owner:** Engineering
**Effort:** 3 hours

**Steps:**
1. Install OpenNext adapter: `pnpm add --save-dev @opennextjs/cloudflare`
2. Configure `next.config.js`:
   ```js
   import { setupDevPlatform } from '@cloudflare/next-on-pages/next-dev'

   if (process.env.NODE_ENV === 'development') {
     await setupDevPlatform()
   }
   ```
3. Build for Cloudflare: `npx @cloudflare/next-on-pages`
4. Deploy to Cloudflare Pages via dashboard or Wrangler
5. Test all routes (static, SSR, API)

**Acceptance Criteria:**
- ✅ Deployment succeeds
- ✅ Static page loads
- ✅ SSR page renders server-side
- ✅ API route responds with JSON
- ✅ Performance: First Contentful Paint < 2s

**Rollback:** Delete Cloudflare Pages project if it fails

**Blockers to Watch:**
- OpenNext doesn't support Next.js 16 features
- API routes don't work as expected
- SSR fails on Cloudflare runtime

---

#### Task 0.3: Create Minimal Cloudflare Worker
**Owner:** Engineering
**Effort:** 2 hours

**Steps:**
1. Initialize Worker project: `pnpm create cloudflare@latest -- worker-test`
2. Choose TypeScript template
3. Add Hono framework: `pnpm add hono`
4. Create basic routes:
   ```typescript
   import { Hono } from 'hono'

   const app = new Hono()

   app.get('/', (c) => c.json({ message: 'Hello from Worker' }))
   app.get('/health', (c) => c.json({ status: 'ok' }))

   export default app
   ```
5. Deploy: `npx wrangler deploy`
6. Test endpoints

**Acceptance Criteria:**
- ✅ Worker deploys successfully
- ✅ Routes respond with correct JSON
- ✅ Latency < 50ms globally (test from multiple regions)

**Tools:**
- Test latency: `curl -w "\nTime: %{time_total}s\n" https://worker.yourname.workers.dev/health`

---

#### Task 0.4: Configure Hyperdrive + Test DB Connection
**Owner:** Engineering
**Effort:** 3 hours

**Steps:**
1. Navigate to Cloudflare Dashboard → Hyperdrive
2. Create new Hyperdrive configuration:
   - **Name:** `chronos-db-pool`
   - **Database:** PostgreSQL
   - **Host:** Lightsail PostgreSQL public IP
   - **Port:** 5432
   - **Database:** `chronos`
   - **User:** `chronos`
   - **Password:** (from .env)
3. Bind Hyperdrive to Worker in `wrangler.toml`:
   ```toml
   [[hyperdrive]]
   binding = "DB"
   id = "<hyperdrive-id>"
   ```
4. Add Postgres client to Worker:
   ```bash
   pnpm add postgres
   ```
5. Test query in Worker:
   ```typescript
   import postgres from 'postgres'

   app.get('/db-test', async (c) => {
     const sql = postgres(c.env.DB.connectionString)
     const result = await sql`SELECT NOW() as time`
     return c.json(result)
   })
   ```
6. Deploy and test

**Acceptance Criteria:**
- ✅ Hyperdrive connects to Lightsail PostgreSQL
- ✅ Query executes successfully
- ✅ Latency < 30ms for cached queries
- ✅ Connection pooling visible in logs

**Blockers to Watch:**
- Lightsail security group doesn't allow Cloudflare IPs
- SSL certificate issues
- Connection string format incompatibility

**Security Note:** Ensure Lightsail PostgreSQL only accepts connections from Cloudflare IP ranges

---

#### Task 0.5: Test R2 Image Upload & Delivery
**Owner:** Engineering
**Effort:** 2 hours

**Steps:**
1. Create R2 bucket in Cloudflare dashboard: `chronos-media-test`
2. Bind to Worker in `wrangler.toml`:
   ```toml
   [[r2_buckets]]
   binding = "MEDIA"
   bucket_name = "chronos-media-test"
   ```
3. Upload test image via Worker:
   ```typescript
   app.post('/upload', async (c) => {
     const formData = await c.req.formData()
     const file = formData.get('file')

     await c.env.MEDIA.put('test-image.jpg', file.stream())
     return c.json({ success: true })
   })
   ```
4. Create public URL for testing
5. Measure load time

**Acceptance Criteria:**
- ✅ Image uploads successfully
- ✅ Image accessible via public URL
- ✅ No egress fees charged (verify in billing)
- ✅ Load time < 500ms globally

---

### Sprint 0 Exit Criteria

**GO Decision:**
- ✅ All 5 tasks completed successfully
- ✅ No critical blockers discovered
- ✅ Latency meets targets (API < 100ms, DB < 30ms)
- ✅ Cost projections still valid

**NO-GO Decision:**
- ❌ OpenNext doesn't support required Next.js features
- ❌ Hyperdrive latency worse than expected
- ❌ R2 has unexpected limitations
- ❌ Workers runtime incompatibility discovered

**If NO-GO:** Stay on Vercel, document findings, consider alternatives

---

## 🛠️ Sprint 1: Local Development Hardening

**Duration:** 1 week (5 business days)
**Goal:** Cloud-agnostic local development environment
**Dependencies:** Sprint 0 passed

### Why This First?
- **Zero waste:** Work is useful regardless of cloud provider
- **Developer productivity:** Fast, reliable local dev
- **CI foundation:** Local tests = CI tests

---

### Tasks

#### Task 1.1: Docker Compose PostgreSQL Environment
**Owner:** DevOps/Engineering
**Effort:** 1 day
**Priority:** P0 (blocks everything)

**Steps:**
1. Create `docker-compose.yml` in project root:
   ```yaml
   version: '3.9'
   services:
     postgres:
       image: postgis/postgis:15-3.4
       container_name: chronos-db-local
       environment:
         POSTGRES_DB: chronos
         POSTGRES_USER: chronos
         POSTGRES_PASSWORD: local_dev_password
       ports:
         - "5432:5432"
       volumes:
         - postgres_data:/var/lib/postgresql/data
         - ./database/init:/docker-entrypoint-initdb.d
       command:
         - "postgres"
         - "-c"
         - "shared_preload_libraries=pg_stat_statements"

   volumes:
     postgres_data:
   ```

2. Add PostgreSQL extensions initialization script `database/init/01_extensions.sql`:
   ```sql
   -- Enable required extensions
   CREATE EXTENSION IF NOT EXISTS postgis;
   CREATE EXTENSION IF NOT EXISTS postgis_topology;
   CREATE EXTENSION IF NOT EXISTS pg_stat_statements;
   CREATE EXTENSION IF NOT EXISTS pgcrypto;

   -- Future extensions (uncomment when needed)
   -- CREATE EXTENSION IF NOT EXISTS vector;  -- pgvector for embeddings
   -- CREATE EXTENSION IF NOT EXISTS timescaledb;  -- TimescaleDB for time-series
   ```

3. Create `.env.local` with local DB connection:
   ```bash
   DATABASE_URL=postgresql://chronos:local_dev_password@localhost:5432/chronos
   ```

4. Add npm scripts to `package.json`:
   ```json
   {
     "scripts": {
       "db:up": "docker-compose up -d postgres",
       "db:down": "docker-compose down",
       "db:reset": "docker-compose down -v && docker-compose up -d postgres",
       "db:logs": "docker-compose logs -f postgres"
     }
   }
   ```

5. Test:
   ```bash
   pnpm run db:up
   psql postgresql://chronos:local_dev_password@localhost:5432/chronos -c "SELECT PostGIS_Version();"
   ```

**Acceptance Criteria:**
- ✅ `pnpm run db:up` starts PostgreSQL with all extensions
- ✅ `pnpm run db:down` stops cleanly
- ✅ `pnpm run db:reset` wipes data and restarts
- ✅ PostGIS, pgcrypto extensions installed
- ✅ Local DB matches Lightsail PostgreSQL version and config

**Documentation:** Update `CONTRIBUTING.md` with local setup instructions

---

#### Task 1.2: Nx Monorepo Workspace Configuration
**Owner:** Engineering Lead
**Effort:** 1 day
**Priority:** P0

**Steps:**
1. Review existing `nx.json` configuration
2. Define project structure:
   ```
   apps/
     web/              # Next.js frontend (existing)
     worker/           # Cloudflare Worker (new)
   packages/
     database/         # Shared DB schemas, migrations
     types/            # Shared TypeScript types
     ui/               # UI components (existing)
   ```

3. Create new Worker project:
   ```bash
   npx nx g @nx/js:lib worker --directory=apps/worker --bundler=esbuild
   ```

4. Configure build targets in `apps/worker/project.json`:
   ```json
   {
     "targets": {
       "build": {
         "executor": "@nx/esbuild:esbuild",
         "options": {
           "outputPath": "dist/apps/worker",
           "main": "apps/worker/src/index.ts",
           "platform": "browser",
           "format": ["esm"]
         }
       },
       "deploy": {
         "executor": "nx:run-commands",
         "options": {
           "command": "wrangler deploy",
           "cwd": "apps/worker"
         }
       }
     }
   }
   ```

5. Create `packages/database` for shared schemas:
   ```bash
   npx nx g @nx/js:lib database --directory=packages/database
   ```

6. Enforce project boundaries in `nx.json`:
   ```json
   {
     "targetDefaults": {
       "lint": {
         "cache": true
       }
     },
     "namedInputs": {
       "default": ["{projectRoot}/**/*"]
     },
     "generators": {
       "@nx/next": {
         "application": {
           "style": "css",
           "linter": "eslint"
         }
       }
     }
   }
   ```

7. Add dependency graph visualization:
   ```bash
   npx nx graph
   ```

**Acceptance Criteria:**
- ✅ `npx nx run-many -t build` builds all projects
- ✅ `npx nx graph` shows clean dependency graph
- ✅ Worker project isolated from web project
- ✅ Shared types in `packages/types` imported by both
- ✅ No circular dependencies

**Deliverables:**
- Updated `nx.json`
- New `apps/worker/` directory
- New `packages/database/` directory
- Dependency graph diagram in docs

---

#### Task 1.3: Dependency Management & Security
**Owner:** Engineering
**Effort:** 0.5 days
**Priority:** P1

**Steps:**
1. Lock all dependency versions:
   ```bash
   # Review package.json - replace all ^x.x.x with x.x.x
   pnpm install --save-exact
   ```

2. Enable Dependabot:
   - Create `.github/dependabot.yml`:
     ```yaml
     version: 2
     updates:
       - package-ecosystem: "npm"
         directory: "/"
         schedule:
           interval: "weekly"
         open-pull-requests-limit: 10
         groups:
           production-dependencies:
             dependency-type: "production"
           development-dependencies:
             dependency-type: "development"
     ```

3. Run security audit:
   ```bash
   pnpm audit
   ppnpm audit fix
   ```

4. Add pre-commit hook for dependency validation:
   ```yaml
   # .pre-commit-config.yaml
   - repo: local
     hooks:
       - id: audit
         name: PNPM Security Audit
         entry: pnpm audit --audit-level=moderate
         language: system
         pass_filenames: false
   ```

5. Document update policy in `CONTRIBUTING.md`:
   - Security patches: Apply immediately
   - Minor updates: Review weekly via Dependabot
   - Major updates: Plan migration, test thoroughly

**Acceptance Criteria:**
- ✅ No dependency uses `^` or `~` (all locked)
- ✅ `pnpm audit` shows 0 high/critical vulnerabilities
- ✅ Dependabot PRs enabled and configured
- ✅ Pre-commit hook blocks unsafe dependencies

---

#### Task 1.4: Unified Development Scripts
**Owner:** Engineering
**Effort:** 0.5 days
**Priority:** P1

**Steps:**
1. Create `scripts/dev.sh` to start everything:
   ```bash
   #!/bin/bash
   set -e

   echo "🚀 Starting Chronos local development environment..."

   # Start PostgreSQL
   echo "📊 Starting PostgreSQL..."
   docker-compose up -d postgres

   # Wait for DB to be ready
   echo "⏳ Waiting for database..."
   until docker-compose exec -T postgres pg_isready -U chronos > /dev/null 2>&1; do
     sleep 1
   done

   # Run migrations (if any)
   echo "🔄 Running database migrations..."
   pnpm run db:migrate

   # Start Next.js dev server
   echo "🌐 Starting Next.js..."
   npx nx run web:dev &

   # Start Worker in dev mode (with Miniflare)
   echo "⚡ Starting Cloudflare Worker (local)..."
   npx nx run worker:dev &

   echo "✅ Development environment ready!"
   echo "   - Next.js:  http://localhost:3000"
   echo "   - Worker:   http://localhost:8787"
   echo "   - Database: postgresql://localhost:5432/chronos"
   ```

2. Add to `package.json`:
   ```json
   {
     "scripts": {
       "dev": "./scripts/dev.sh",
       "dev:web": "npx nx run web:dev",
       "dev:worker": "npx nx run worker:dev",
       "build": "npx nx run-many -t build",
       "test": "npx nx run-many -t test",
       "lint": "npx nx run-many -t lint"
     }
   }
   ```

3. Make executable:
   ```bash
   chmod +x scripts/dev.sh
   ```

**Acceptance Criteria:**
- ✅ `pnpm run dev` starts entire stack (DB, Next.js, Worker)
- ✅ All services healthy within 30 seconds
- ✅ Changes hot-reload in both web and worker
- ✅ Ctrl+C cleanly shuts down all processes

**Documentation:** Update `README.md` with:
- Quickstart: `pnpm run dev`
- Individual service commands
- Troubleshooting common issues

---

### Sprint 1 Exit Criteria

**Success:**
- ✅ `pnpm run dev` starts everything in < 30 seconds
- ✅ Zero cloud dependencies for local development
- ✅ All team members can run locally
- ✅ CI pipeline runs same tests as local

**Deliverables:**
- Docker Compose configuration
- Nx workspace with enforced boundaries
- Locked dependencies + Dependabot
- Unified dev scripts
- Updated CONTRIBUTING.md

---

## 🚀 Sprint 2: Cloudflare Production Migration

**Duration:** 1-2 weeks (7-10 business days)
**Goal:** Deploy to Cloudflare while maintaining Vercel as fallback
**Dependencies:** Sprint 0 + Sprint 1 complete
**Risk:** MEDIUM (production cutover)

### Strategy: Parallel Deployment
```
Week 1: Build and deploy to Cloudflare (traffic stays on Vercel)
Week 2: Gradual traffic cutover (DNS change)
Week 3-4: Monitor stability (Vercel still running)
Week 5: Decommission Vercel
```

---

### Tasks

#### Task 2.1: Production Next.js Deployment to Cloudflare Pages
**Owner:** Engineering
**Effort:** 2 days
**Priority:** P0

**Steps:**
1. Install OpenNext adapter in main project:
   ```bash
   cd apps/web
   pnpm add --save-dev @opennextjs/cloudflare
   ```

2. Update `next.config.js`:
   ```js
   import { setupDevPlatform } from '@cloudflare/next-on-pages/next-dev'

   if (process.env.NODE_ENV === 'development') {
     await setupDevPlatform()
   }

   const nextConfig = {
     // ... existing config
   }

   export default nextConfig
   ```

3. Add build script for Cloudflare:
   ```json
   {
     "scripts": {
       "build:cloudflare": "next build && npx @cloudflare/next-on-pages"
     }
   }
   ```

4. Create Cloudflare Pages project:
   - Connect GitHub repo
   - Build command: `pnpm run build:cloudflare`
   - Build output: `.vercel/output/static`
   - Environment variables:
     - `NODE_VERSION=20`
     - `NEXT_PUBLIC_SERVER_URL=https://automatonicai.com`

5. Deploy and test staging URL (e.g., `chronos.pages.dev`)

6. **DO NOT change DNS yet** - keep traffic on Vercel

**Acceptance Criteria:**
- ✅ Build succeeds on Cloudflare Pages
- ✅ All pages render correctly on staging URL
- ✅ SSR works (test dynamic routes)
- ✅ API routes functional (if any)
- ✅ Images optimize correctly
- ✅ Performance: LCP < 2.5s, FCP < 1.5s

**Blockers to Watch:**
- OpenNext incompatibility with current Next.js features
- Environment variables not passing through
- Image optimization issues

**Rollback:** Keep Vercel deployment untouched

---

#### Task 2.2: Production Worker Deployment
**Owner:** Engineering
**Effort:** 3 days
**Priority:** P0

**Steps:**
1. Create production Worker project structure:
   ```
   apps/worker/
     src/
       index.ts         # Entry point
       routes/
         health.ts      # Health check
         api/
           v1/          # API v1 routes
       middleware/
         auth.ts        # JWT validation
         cors.ts        # CORS handling
         logger.ts      # Request logging
       lib/
         db.ts          # Hyperdrive connection
         r2.ts          # R2 storage helpers
     wrangler.toml      # Cloudflare config
   ```

2. Implement Hono app with middleware:
   ```typescript
   import { Hono } from 'hono'
   import { logger } from 'hono/logger'
   import { cors } from 'hono/cors'
   import { healthRoutes } from './routes/health'
   import { apiV1Routes } from './routes/api/v1'

   const app = new Hono()

   app.use('*', logger())
   app.use('*', cors({
     origin: 'https://automatonicai.com',
     credentials: true,
   }))

   app.route('/health', healthRoutes)
   app.route('/api/v1', apiV1Routes)

   export default app
   ```

3. Configure `wrangler.toml`:
   ```toml
   name = "chronos-worker"
   main = "src/index.ts"
   compatibility_date = "2024-12-01"

   [env.production]
   name = "chronos-worker-prod"
   route = { pattern = "api.automatonicai.com/*", zone_name = "automatonicai.com" }

   [[env.production.hyperdrive]]
   binding = "DB"
   id = "<production-hyperdrive-id>"

   [[env.production.r2_buckets]]
   binding = "MEDIA"
   bucket_name = "chronos-media"

   [env.staging]
   name = "chronos-worker-staging"

   [[env.staging.hyperdrive]]
   binding = "DB"
   id = "<staging-hyperdrive-id>"
   ```

4. Deploy to production:
   ```bash
   npx wrangler deploy --env production
   ```

5. Test Worker endpoints:
   ```bash
   curl https://api.automatonicai.com/health
   ```

**Acceptance Criteria:**
- ✅ Worker deploys successfully
- ✅ All routes respond correctly
- ✅ Middleware (auth, CORS, logging) functional
- ✅ Connects to PostgreSQL via Hyperdrive
- ✅ Latency < 50ms (p95)
- ✅ No errors in Cloudflare dashboard

**Security Checklist:**
- ✅ All secrets in Cloudflare Secrets (not wrangler.toml)
- ✅ CORS restricted to automatonicai.com
- ✅ Rate limiting configured
- ✅ No sensitive data in logs

---

#### Task 2.3: Hyperdrive Production Configuration
**Owner:** DevOps
**Effort:** 1 day
**Priority:** P0

**Steps:**
1. Create production Hyperdrive connection:
   - Navigate to Cloudflare Dashboard → Hyperdrive
   - Create configuration:
     - Name: `chronos-db-production`
     - Host: `<lightsail-public-ip>`
     - Port: `5432`
     - Database: `chronos`
     - User: `chronos`
     - Password: (use secure password, not dev password)

2. Update Lightsail security group:
   - Allow Cloudflare IP ranges for PostgreSQL (port 5432)
   - Reference: https://www.cloudflare.com/ips/
   - Lock down to ONLY Cloudflare IPs

3. Test connection from Worker:
   ```typescript
   app.get('/db-test', async (c) => {
     const sql = postgres(c.env.DB.connectionString)
     const result = await sql`SELECT version()`
     return c.json({ version: result[0] })
   })
   ```

4. Benchmark query performance:
   ```bash
   # Run 100 requests
   ab -n 100 -c 10 https://api.automatonicai.com/db-test
   ```

**Acceptance Criteria:**
- ✅ Hyperdrive connects successfully
- ✅ Queries execute < 30ms (p95)
- ✅ Connection pooling working (check Hyperdrive metrics)
- ✅ No connection exhaustion under load
- ✅ SSL/TLS enabled for security

**Security:**
- ✅ PostgreSQL password rotated from dev password
- ✅ Lightsail firewall restricts to Cloudflare IPs only
- ✅ Connection string stored in Cloudflare Secrets

---

#### Task 2.4: R2 Production Bucket & CDN Setup
**Owner:** DevOps/Engineering
**Effort:** 1 day
**Priority:** P1

**Steps:**
1. Create production R2 bucket:
   - Name: `chronos-media`
   - Location: Automatic (Cloudflare optimizes)

2. Configure public access:
   - Enable R2.dev subdomain: `chronos-media.r2.dev`
   - OR: Set up custom domain: `media.automatonicai.com`

3. Migrate existing assets from Vercel/S3 (if any):
   ```bash
   # Use rclone or aws s3 sync
   rclone sync vercel-storage: r2:chronos-media
   ```

4. Update image URLs in application:
   - Old: `https://vercel-storage.com/...`
   - New: `https://media.automatonicai.com/...`

5. Test image upload via Worker:
   ```typescript
   app.post('/upload', async (c) => {
     const formData = await c.req.formData()
     const file = formData.get('file')
     const key = `uploads/${Date.now()}-${file.name}`

     await c.env.MEDIA.put(key, file.stream(), {
       httpMetadata: {
         contentType: file.type,
       },
     })

     return c.json({ url: `https://media.automatonicai.com/${key}` })
   })
   ```

**Acceptance Criteria:**
- ✅ R2 bucket created and accessible
- ✅ Custom domain configured (if using)
- ✅ Image uploads work from Worker
- ✅ Images load globally < 500ms
- ✅ Zero egress fees confirmed in billing

**Performance Test:**
- Upload 10MB image
- Measure load time from 5 global locations
- Verify Cloudflare CDN serving cached images

---

#### Task 2.5: DNS Cutover & Traffic Migration
**Owner:** DevOps Lead
**Effort:** 1 day (execution), 1 week (monitoring)
**Priority:** P0
**Risk:** HIGH (production traffic)

**Pre-Cutover Checklist:**
- ✅ Cloudflare Pages deployment tested and stable
- ✅ Worker responding to all API routes
- ✅ Hyperdrive connecting to PostgreSQL
- ✅ R2 serving images correctly
- ✅ All environment variables configured
- ✅ Monitoring and alerts configured (Sprint 3)
- ✅ Team on standby for rollback

**Cutover Steps:**
1. **Day 0 (Friday):** Final testing
   - Run full regression test suite on Cloudflare staging
   - Load test Worker endpoints
   - Verify all integrations working

2. **Day 1 (Saturday morning):** DNS change (low-traffic window)
   - Update DNS records:
     - `automatonicai.com` → Cloudflare Pages
     - `api.automatonicai.com` → Cloudflare Worker
     - `media.automatonicai.com` → R2 custom domain
   - Set TTL to 300 seconds (5 minutes) for quick rollback

3. **Day 1-2:** Monitor closely
   - Watch error rates (Sentry)
   - Monitor latency (Cloudflare Analytics)
   - Check database connections (Hyperdrive metrics)
   - Keep Vercel deployment running (don't delete)

4. **Week 1:** Gradual confidence building
   - If stable: Increase DNS TTL to 3600 (1 hour)
   - If issues: Roll back DNS to Vercel

5. **Week 2-4:** Parallel operation
   - Cloudflare serves production traffic
   - Vercel deployment kept alive as fallback
   - Monitor costs on both platforms

6. **Week 5+:** Decommission Vercel
   - If 30 days stable: Cancel Vercel subscription
   - Archive Vercel deployment config

**Rollback Procedure:**
```bash
# Emergency rollback (5-minute DNS propagation)
1. Change DNS back to Vercel
2. Notify team
3. Investigate Cloudflare issues
4. Fix and re-attempt cutover when ready
```

**Acceptance Criteria:**
- ✅ DNS propagated globally (check with `dig`)
- ✅ Traffic flowing through Cloudflare
- ✅ Error rate < 0.1%
- ✅ p95 latency < 100ms
- ✅ No database connection issues
- ✅ Zero downtime during cutover

**Communication Plan:**
- Post in team Slack before DNS change
- Status page update (if public)
- Post-mortem doc after 30 days

---

### Sprint 2 Exit Criteria

**Success:**
- ✅ Production traffic on Cloudflare for 7 days
- ✅ Error rate < 0.1%
- ✅ Performance meets targets
- ✅ Cost projections accurate
- ✅ Vercel still available as fallback

**Deliverables:**
- Production Cloudflare Pages deployment
- Production Worker with all routes
- Hyperdrive connected to PostgreSQL
- R2 bucket with media assets
- DNS cutover completed
- Post-deployment report

---

## 🔒 Sprint 3: DevOps Hardening & Observability

**Duration:** 1 week (5 business days)
**Goal:** Production-grade monitoring, CI/CD, and incident response
**Dependencies:** Sprint 2 stable for 1 week

### Why After Migration?
- Configure observability on final platform (no waste)
- Real production traffic for meaningful metrics
- Lessons learned from cutover inform monitoring

---

### Tasks

#### Task 3.1: CI/CD Pipeline with GitHub Actions
**Owner:** DevOps
**Effort:** 2 days
**Priority:** P0

**Steps:**
1. Create `.github/workflows/deploy-web.yml`:
   ```yaml
   name: Deploy Web to Cloudflare Pages

   on:
     push:
       branches: [main]
       paths:
         - 'apps/web/**'
         - 'packages/**'
     pull_request:
       branches: [main]

   jobs:
     test:
       runs-on: ubuntu-latest
       steps:
         - uses: actions/checkout@v4
         - uses: actions/setup-node@v4
           with:
             node-version: '20'
             cache: 'npm'

         - run: pnpm install --frozen-lockfile
         - run: pnpm run lint
         - run: pnpm run test
         - run: pnpm run build

     deploy:
       needs: test
       runs-on: ubuntu-latest
       if: github.ref == 'refs/heads/main'
       steps:
         - uses: actions/checkout@v4
         - uses: actions/setup-node@v4
           with:
             node-version: '20'

         - run: pnpm install --frozen-lockfile
         - run: pnpm run build:cloudflare

         - name: Deploy to Cloudflare Pages
           uses: cloudflare/pages-action@v1
           with:
             apiToken: ${{ secrets.CLOUDFLARE_API_TOKEN }}
             accountId: ${{ secrets.CLOUDFLARE_ACCOUNT_ID }}
             projectName: chronos-web
             directory: .vercel/output/static
   ```

2. Create `.github/workflows/deploy-worker.yml`:
   ```yaml
   name: Deploy Worker to Cloudflare

   on:
     push:
       branches: [main]
       paths:
         - 'apps/worker/**'
         - 'packages/types/**'

   jobs:
     deploy:
       runs-on: ubuntu-latest
       steps:
         - uses: actions/checkout@v4
         - uses: actions/setup-node@v4

         - run: pnpm install --frozen-lockfile
         - run: npx nx run worker:build

         - name: Deploy to Cloudflare Workers
           uses: cloudflare/wrangler-action@v3
           with:
             apiToken: ${{ secrets.CLOUDFLARE_API_TOKEN }}
             command: deploy --env production
             workingDirectory: apps/worker
   ```

3. Configure GitHub Secrets:
   - `CLOUDFLARE_API_TOKEN`
   - `CLOUDFLARE_ACCOUNT_ID`
   - (Add others as needed)

4. Add PR preview deployments:
   ```yaml
   # In deploy-web.yml, add PR preview job
   preview:
     runs-on: ubuntu-latest
     if: github.event_name == 'pull_request'
     steps:
       # ... build steps ...
       - name: Deploy Preview
         uses: cloudflare/pages-action@v1
         with:
           apiToken: ${{ secrets.CLOUDFLARE_API_TOKEN }}
           accountId: ${{ secrets.CLOUDFLARE_ACCOUNT_ID }}
           projectName: chronos-web
           directory: .vercel/output/static
           gitHubToken: ${{ secrets.GITHUB_TOKEN }}
   ```

**Acceptance Criteria:**
- ✅ Every push to `main` deploys automatically
- ✅ Tests run on every PR
- ✅ PR deployments create preview URLs
- ✅ Deploy fails if tests fail
- ✅ Deployment status visible in GitHub

**Documentation:** Update `CONTRIBUTING.md` with:
- How to trigger manual deployments
- How to rollback (re-run old workflow)

---

#### Task 3.2: Sentry Error Tracking Integration
**Owner:** Engineering
**Effort:** 1 day
**Priority:** P0

**Steps:**
1. Create Sentry project at sentry.io (free tier):
   - Project name: `chronos-web`
   - Platform: Next.js

2. Install Sentry SDK in Next.js:
   ```bash
   cd apps/web
   pnpm add @sentry/nextjs
   npx @sentry/wizard@latest -i nextjs
   ```

3. Configure `sentry.client.config.js`:
   ```js
   import * as Sentry from "@sentry/nextjs"

   Sentry.init({
     dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
     environment: process.env.NODE_ENV,
     tracesSampleRate: 0.1, // 10% of transactions
     replaysSessionSampleRate: 0.1,
     replaysOnErrorSampleRate: 1.0,
   })
   ```

4. Add Sentry to Cloudflare Worker:
   ```bash
   cd apps/worker
   pnpm add toucan-js
   ```

   ```typescript
   import { Toucan } from 'toucan-js'

   export default {
     async fetch(request, env, ctx) {
       const sentry = new Toucan({
         dsn: env.SENTRY_DSN,
         context: ctx,
         request,
         environment: 'production',
       })

       try {
         return await app.fetch(request, env, ctx)
       } catch (err) {
         sentry.captureException(err)
         throw err
       }
     }
   }
   ```

5. Test error capturing:
   - Trigger intentional error in dev
   - Verify appears in Sentry dashboard

6. Configure alerts:
   - Email on error spike (>10 errors in 5 minutes)
   - Slack integration (optional)

**Acceptance Criteria:**
- ✅ Errors from Next.js appear in Sentry
- ✅ Errors from Worker appear in Sentry
- ✅ Source maps uploaded (line numbers correct)
- ✅ Alerts configured and tested
- ✅ Performance monitoring enabled

**Cost:** Free tier (up to 5K events/month)

---

#### Task 3.3: Cloudflare Analytics & Monitoring Dashboard
**Owner:** DevOps
**Effort:** 1 day
**Priority:** P1

**Steps:**
1. Enable Cloudflare Web Analytics:
   - Add beacon to Next.js layout
   - Configure custom events

2. Create Grafana dashboard (optional) or use Cloudflare's:
   - Worker invocations per minute
   - p50, p95, p99 latency
   - Error rate
   - Hyperdrive query performance
   - R2 request count

3. Set up alerting rules in Cloudflare:
   - Worker error rate > 1%
   - API latency p95 > 200ms
   - Database connection failures

4. Configure uptime monitoring (UptimeRobot free tier):
   - Check `https://automatonicai.com` every 5 minutes
   - Check `https://api.automatonicai.com/health` every 5 minutes
   - Alert via email on downtime

**Acceptance Criteria:**
- ✅ Real-time traffic visible in dashboard
- ✅ Performance metrics tracked
- ✅ Alerts fire when thresholds exceeded
- ✅ Team has access to all dashboards

---

#### Task 3.4: Runbook & Incident Response Procedures
**Owner:** DevOps Lead
**Effort:** 1 day
**Priority:** P1

**Steps:**
1. Create `docs/runbooks/incident-response.md`:
   ```markdown
   # Incident Response Runbook

   ## Severity Levels
   - **P0 (Critical):** Site down, data loss, security breach
   - **P1 (High):** Degraded performance, feature broken
   - **P2 (Medium):** Minor bug, non-critical feature

   ## Response Procedures

   ### P0: Site Down
   1. Check Cloudflare status: https://www.cloudflarestatus.com/
   2. Check Sentry for errors
   3. Rollback DNS to Vercel (emergency):
      ```bash
      # Update DNS A record to Vercel IP
      ```
   4. Investigate root cause
   5. Post-mortem within 24 hours

   ### Database Connection Failures
   1. Check Hyperdrive metrics
   2. Check Lightsail PostgreSQL status
   3. Verify security group allows Cloudflare IPs
   4. Restart Lightsail if needed
   5. Monitor recovery
   ```

2. Create playbooks for common scenarios:
   - High error rate
   - Slow API responses
   - Database connection exhaustion
   - R2 upload failures

3. Document escalation path:
   - Who to call at what time
   - Communication channels (Slack, email)

4. Schedule incident response drill:
   - Simulate outage
   - Practice rollback procedure
   - Time recovery

**Acceptance Criteria:**
- ✅ Runbook covers all critical scenarios
- ✅ Team trained on procedures
- ✅ Rollback tested successfully
- ✅ Contact information up-to-date

---

### Sprint 3 Exit Criteria

**Success:**
- ✅ CI/CD deploys on every commit
- ✅ Errors tracked in Sentry
- ✅ Dashboards show real-time metrics
- ✅ Alerts configured and tested
- ✅ Runbooks documented
- ✅ Team trained on incident response

**Deliverables:**
- GitHub Actions workflows
- Sentry integration
- Monitoring dashboards
- Incident response runbooks
- Post-deployment stability report

---

## 🎨 Sprint 4: Feature Development (Ongoing)

**Duration:** Ongoing (2-week sprints)
**Goal:** Build product features on stable foundation
**Dependencies:** Sprint 3 complete

### Feature Priorities

#### Phase 4A: Content Management (Weeks 1-2)
**Goal:** Launch blog and marketing pages

**Tasks:**
1. **MDX Setup:**
   - Install `@next/mdx`
   - Create `content/blog/` directory
   - Configure dynamic routes for blog posts

2. **Blog Features:**
   - Markdown rendering with syntax highlighting
   - Table of contents generation
   - Reading time estimation
   - Social sharing

3. **Marketing Pages:**
   - `/about`
   - `/pricing`
   - `/features`
   - `/contact`

**Acceptance Criteria:**
- ✅ Blog posts render from MDX files
- ✅ SEO meta tags generated
- ✅ RSS feed available
- ✅ Marketing pages live

---

#### Phase 4B: Authentication (Weeks 3-4)
**Goal:** User registration and login

**Tasks:**
1. **Worker Auth Endpoints:**
   - `POST /api/v1/auth/register`
   - `POST /api/v1/auth/login`
   - `POST /api/v1/auth/refresh`
   - JWT generation and validation

2. **Database Schema:**
   - Users table (already exists from Payload cleanup)
   - Sessions table
   - Migrations

3. **Frontend:**
   - Login page
   - Registration page
   - Protected routes
   - Auth context

**Acceptance Criteria:**
- ✅ Users can register
- ✅ Users can login
- ✅ JWT tokens refresh automatically
- ✅ Protected pages redirect to login

---

#### Phase 4C: Core Product Features (Weeks 5+)
**Goal:** Financial analytics features

**To Be Defined:**
- Data ingestion pipelines
- Graph queries
- Vector search
- Admin dashboard
- Reports and exports

---

## 📊 Project Tracking & Metrics

### Jira/GitHub Projects Setup

**Epic:** Cloudflare Migration
**Sprints:**
- Sprint 0: Validation
- Sprint 1: Local Hardening
- Sprint 2: Migration
- Sprint 3: DevOps
- Sprint 4+: Features

**Issue Template:**
```markdown
## Description
[Clear description of task]

## Acceptance Criteria
- [ ] Criterion 1
- [ ] Criterion 2

## Dependencies
- Blocks: [Issue links]
- Blocked by: [Issue links]

## Testing Plan
[How to verify it works]

## Rollback Plan
[How to undo if it breaks]
```

---

### Key Performance Indicators (KPIs)

| Metric | Target | Current | Status |
|--------|--------|---------|--------|
| **Cost** |
| Monthly infrastructure cost | < $100 | TBD | 🟡 |
| Cost per user | < $0.01 | TBD | 🟡 |
| **Performance** |
| API latency (p95) | < 100ms | TBD | 🟡 |
| Page load (FCP) | < 1.5s | TBD | 🟡 |
| Database query time (p95) | < 30ms | TBD | 🟡 |
| **Reliability** |
| Uptime | > 99.9% | TBD | 🟡 |
| Error rate | < 0.1% | TBD | 🟡 |
| **Deployment** |
| CI/CD success rate | > 95% | TBD | 🟡 |
| Time to deploy | < 5 min | TBD | 🟡 |

---

### Weekly Status Report Template

```markdown
# Week of [Date] - Cloudflare Migration Status

## Sprint: [Sprint Name]

### Completed This Week
- ✅ Task 1
- ✅ Task 2

### In Progress
- 🔄 Task 3 (80% complete)
- 🔄 Task 4 (40% complete)

### Blocked
- 🚫 Task 5 (waiting on vendor response)

### Metrics
- Deployment success rate: X%
- Average API latency: Xms
- Error rate: X%
- Cost this week: $X

### Risks
- Risk 1: Description and mitigation plan

### Next Week
- Planned tasks
- Sprint goals
```

---

## 🎯 Success Criteria - Overall Project

### Technical Success
- ✅ All services deployed to Cloudflare
- ✅ Performance targets met or exceeded
- ✅ Zero data loss during migration
- ✅ Rollback capability proven

### Business Success
- ✅ Infrastructure cost < $100/month
- ✅ 75%+ cost reduction vs Vercel
- ✅ Zero revenue impact from migration

### Team Success
- ✅ Team confident in new stack
- ✅ Documentation comprehensive
- ✅ Incident response tested
- ✅ Developer experience improved

---

## 📚 References & Resources

### Documentation
- [Cloudflare Workers Docs](https://developers.cloudflare.com/workers/)
- [Hyperdrive Guide](https://developers.cloudflare.com/hyperdrive/)
- [OpenNext GitHub](https://github.com/sst/open-next)
- [Hono Documentation](https://hono.dev/)

### Tools
- [Wrangler CLI](https://developers.cloudflare.com/workers/wrangler/)
- [Miniflare (Local Worker Testing)](https://miniflare.dev/)
- [Sentry](https://sentry.io/)

### Community
- Cloudflare Discord
- Hono GitHub Discussions
- Next.js Discord

---

**Last Updated:** 2025-12-17
**Next Review:** After Sprint 0 completion
