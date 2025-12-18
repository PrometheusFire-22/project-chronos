# DevOps Hardening Plan

**Goal:** Production-grade infrastructure with CI/CD, monitoring, security, and reliability

**Timeline:** 3 sprints (6-8 weeks)
**Cost Impact:** +$10-20/month initially

## Your Current Stack (Validated ✅)

### What You Got Right
- ✅ **Vercel** - Industry standard for Next.js, auto-scaling
- ✅ **PostgreSQL** - Battle-tested, ACID compliant
- ✅ **S3** - Infinitely scalable, 99.999999999% durability
- ✅ **Turbopack** - Fastest build tool for Next.js
- ✅ **pnpm** - Fastest package manager
- ✅ **NX** - Best monorepo tool

### No Changes Needed
Your stack is **best-in-class**. All tools are correct choices.

## Sprint 1: CI/CD + Automated Testing (Week 1-2)

### 1.1 GitHub Actions CI/CD Pipeline

**File:** `.github/workflows/ci.yml`

```yaml
name: CI/CD Pipeline

on:
  push:
    branches: [production/deploy-2025-12-14, develop]
  pull_request:
    branches: [production/deploy-2025-12-14, develop]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '24'

      - name: Setup pnpm
        uses: pnpm/action-setup@v2
        with:
          version: 9

      - name: Install dependencies
        run: pnpm install

      - name: Lint
        run: pnpm run lint

      - name: Type check
        run: pnpm run type-check

      - name: Run tests
        run: pnpm run test

      - name: Build
        run: pnpm run build
        env:
          POSTGRES_URL: ${{ secrets.POSTGRES_URL }}
          PAYLOAD_SECRET: ${{ secrets.PAYLOAD_SECRET }}
          S3_ACCESS_KEY_ID: ${{ secrets.S3_ACCESS_KEY_ID }}
          S3_SECRET_ACCESS_KEY: ${{ secrets.S3_SECRET_ACCESS_KEY }}
          S3_BUCKET: ${{ secrets.S3_BUCKET }}
          S3_REGION: ${{ secrets.S3_REGION }}

  deploy:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/production/deploy-2025-12-14'
    steps:
      - uses: actions/checkout@v4

      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          vercel-args: '--prod'
```

**Benefits:**
- ✅ Automated tests on every PR
- ✅ Type checking catches errors early
- ✅ Build verification before merge
- ✅ Uses 50-100 minutes/month (well under 2,000 limit)

### 1.2 Add Testing Infrastructure

**Install:**
```bash
pnpm add -D vitest @testing-library/react @testing-library/jest-dom
pnpm add -D @playwright/test  # E2E tests
```

**File:** `apps/web/vitest.config.ts`
```typescript
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./test/setup.ts'],
  },
})
```

**Add scripts to package.json:**
```json
{
  "scripts": {
    "test": "vitest run",
    "test:watch": "vitest",
    "test:e2e": "playwright test",
    "type-check": "tsc --noEmit"
  }
}
```

**Cost:** $0 (all open source)

### 1.3 Pre-commit Hooks Enhancement

Update `.pre-commit-config.yaml` to include:
```yaml
repos:
  - repo: local
    hooks:
      - id: type-check
        name: TypeScript type check
        entry: pnpm run type-check
        language: system
        pass_filenames: false

      - id: test
        name: Run tests
        entry: pnpm run test
        language: system
        pass_filenames: false
```

**Timeline:** 3 days
**Effort:** Medium

---

## Sprint 2: Security + Monitoring (Week 3-4)

### 2.1 PostgreSQL Firewall Hardening

**Current:** Port 5432 open to 0.0.0.0/0 (entire internet)
**Target:** Only Vercel IPs allowed

**Vercel IP Ranges:**
```
76.76.21.0/24
76.76.19.0/24
```

**AWS Lightsail Firewall Update:**
1. Go to Lightsail → Networking → IPv4 Firewall
2. Edit PostgreSQL rule
3. Change from "Any IPv4 address" to:
   - Custom: 76.76.21.0/24
   - Custom: 76.76.19.0/24
   - Your dev machine IP (for debugging)

**Impact:** Blocks 99.9% of attack surface

### 2.2 Environment Variable Secrets Rotation

**Set up AWS Secrets Manager:**
```bash
# Create secrets
aws secretsmanager create-secret \
  --name project-chronos/postgres-url \
  --secret-string "postgresql://..."

aws secretsmanager create-secret \
  --name project-chronos/s3-credentials \
  --secret-string '{"access_key":"...","secret_key":"..."}'
```

**Update Vercel to pull from Secrets Manager** (via build step)

**Rotation schedule:**
- Database password: Every 90 days (automated)
- S3 keys: Every 90 days (automated)
- Payload secret: Annually (manual)

**Cost:** $0.40/secret/month = ~$2/month

### 2.3 Monitoring & Alerting

#### Option A: Vercel Analytics (Free Tier)
```bash
# In apps/web/app/layout.tsx
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

**Provides:**
- Page views
- Performance metrics (Web Vitals)
- Geographic distribution
- Free for hobby plan

#### Option B: Sentry (Error Tracking)
```bash
pnpm add @sentry/nextjs
```

**sentry.config.ts:**
```typescript
import * as Sentry from '@sentry/nextjs'

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  tracesSampleRate: 0.1, // 10% of transactions
  environment: process.env.NODE_ENV,
})
```

**Free tier:** 5,000 errors/month
**Paid:** $26/month for 50k errors

#### Option C: Better Stack (Uptime Monitoring)
- **URL:** https://betterstack.com
- **Monitor:** automatonicai.com every 30s
- **Alerts:** Email/SMS on downtime
- **Free tier:** 10 monitors, 3-min checks
- **Paid:** $10/month for 1-min checks

**Recommendation:** Use all three (Vercel + Sentry + Better Stack)
**Total cost:** $0-10/month depending on traffic

### 2.4 Database Connection Pooling

**Add Prisma Accelerate (free tier):**
```bash
pnpm add @prisma/client @prisma/adapter-vercel
```

**Benefits:**
- Connection pooling (prevents "too many connections")
- Query caching
- Faster cold starts

**Cost:** Free for <100k requests/month

### 2.5 Rate Limiting

**Add Vercel Edge Functions for API protection:**

**middleware.ts:**
```typescript
import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(10, '10 s'),
})

export async function middleware(request: Request) {
  const ip = request.headers.get('x-forwarded-for') ?? 'anonymous'
  const { success } = await ratelimit.limit(ip)

  if (!success) {
    return new Response('Too many requests', { status: 429 })
  }
}
```

**Cost:** Upstash Redis free tier (10k requests/day)

**Timeline:** 5 days
**Effort:** High

---

## Sprint 3: Backup + Performance (Week 5-6)

### 3.1 Automated Database Backups

**Option A: AWS Lightsail Snapshots (Manual)**
- Go to Lightsail console → Snapshots
- Create manual snapshot
- Schedule via cron or Lambda

**Option B: Automated pg_dump to S3**

**Create backup script:** `.aws/backup-database.sh`
```bash
#!/bin/bash
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="backup_${TIMESTAMP}.sql.gz"

# Dump database
PGPASSWORD=$DB_PASSWORD pg_dump \
  -h 16.52.210.100 \
  -U chronos \
  -d chronos \
  | gzip > $BACKUP_FILE

# Upload to S3
aws s3 cp $BACKUP_FILE s3://project-chronos-backups/database/$BACKUP_FILE

# Delete local file
rm $BACKUP_FILE

# Keep only last 30 days
aws s3 ls s3://project-chronos-backups/database/ \
  | awk '{print $4}' \
  | sort -r \
  | tail -n +31 \
  | xargs -I {} aws s3 rm s3://project-chronos-backups/database/{}
```

**Schedule via GitHub Actions:**

**.github/workflows/backup.yml:**
```yaml
name: Daily Database Backup

on:
  schedule:
    - cron: '0 2 * * *'  # 2 AM daily
  workflow_dispatch:  # Manual trigger

jobs:
  backup:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Backup database
        env:
          DB_PASSWORD: ${{ secrets.DB_PASSWORD }}
          AWS_ACCESS_KEY_ID: ${{ secrets.AWS_ACCESS_KEY_ID }}
          AWS_SECRET_ACCESS_KEY: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
        run: bash .aws/backup-database.sh
```

**Cost:** S3 storage ~$0.50/month for 30 days of backups

### 3.2 CDN for Static Assets

**Vercel already includes:**
- Global CDN (170+ locations)
- Automatic image optimization
- Edge caching

**Add custom cache headers:**

**next.config.js:**
```javascript
module.exports = {
  async headers() {
    return [
      {
        source: '/:path*.{jpg,jpeg,png,gif,webp}',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ]
  },
}
```

**Cost:** $0 (included)

### 3.3 Performance Optimization

**Add these to next.config.js:**
```javascript
module.exports = {
  experimental: {
    optimizePackageImports: ['lucide-react', '@radix-ui'],
  },
  images: {
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200],
  },
}
```

**Add bundle analyzer:**
```bash
pnpm add -D @next/bundle-analyzer
```

**Run:** `pnpm run analyze` to identify large dependencies

### 3.4 Disaster Recovery Plan

**Document in `.aws/DISASTER_RECOVERY.md`:**

1. **Database Lost:**
   - Restore from latest S3 backup
   - ETA: 30 minutes

2. **Vercel Account Suspended:**
   - Deploy to Netlify (same build config)
   - Update DNS to Netlify
   - ETA: 2 hours

3. **S3 Bucket Deleted:**
   - Restore from versioning
   - If versioning failed, media lost (acceptable for v1.0)
   - ETA: 1 hour

4. **GitHub Repository Deleted:**
   - Restore from local clone
   - Push to new repo
   - ETA: 1 hour

**Timeline:** 4 days
**Effort:** Medium

---

## Summary Checklist

### Sprint 1: CI/CD (Week 1-2)
- [ ] Create `.github/workflows/ci.yml`
- [ ] Add Vitest testing
- [ ] Add Playwright E2E tests
- [ ] Update pre-commit hooks
- [ ] Add GitHub secrets
- [ ] Test PR workflow
- [ ] Verify auto-deploy works

### Sprint 2: Security (Week 3-4)
- [ ] Harden PostgreSQL firewall
- [ ] Set up AWS Secrets Manager
- [ ] Add Vercel Analytics
- [ ] Add Sentry error tracking
- [ ] Add Better Stack uptime monitoring
- [ ] Add rate limiting (Upstash Redis)
- [ ] Document security audit

### Sprint 3: Reliability (Week 5-6)
- [ ] Automate database backups
- [ ] Optimize image caching
- [ ] Add bundle analysis
- [ ] Create disaster recovery plan
- [ ] Load test with k6 or Artillery
- [ ] Document runbook

## Cost Breakdown

**Current:** $16/month
**After hardening:** $26-36/month

| Service | Before | After | Increase |
|---------|--------|-------|----------|
| Vercel | $0 | $0 | $0 |
| AWS Lightsail DB | $15 | $15 | $0 |
| AWS S3 (media) | $1 | $1 | $0 |
| AWS S3 (backups) | $0 | $0.50 | +$0.50 |
| AWS Secrets Manager | $0 | $2 | +$2 |
| Sentry (optional) | $0 | $0-26 | +$0-26 |
| Better Stack | $0 | $0-10 | +$0-10 |
| Upstash Redis | $0 | $0 | $0 |
| **Total** | **$16** | **$18.50-36** | **+$2.50-20** |

## When to Upgrade

### Vercel Pro ($20/mo)
- When: >100GB bandwidth or >1M serverless function invocations
- Benefits: Team features, analytics, preview URLs
- Your status: Not needed yet

### Database Upgrade ($30-60/mo)
- When: >80% RAM usage consistently
- Current: 2GB is fine for <10k users
- Monitor: `ssh ubuntu@16.52.210.100 && htop`

### Sentry Paid ($26/mo)
- When: >5k errors/month
- Your status: Free tier sufficient for now

## Post-Hardening: What You'll Have

✅ **CI/CD:**
- Automated testing on every PR
- Type checking prevents bugs
- Build verification before deploy
- Auto-deploy to production

✅ **Security:**
- Database firewall hardened
- Secrets rotated automatically
- Rate limiting prevents abuse
- No credentials in code

✅ **Monitoring:**
- Real-time error tracking (Sentry)
- Performance metrics (Vercel Analytics)
- Uptime monitoring (Better Stack)
- Get alerts before users complain

✅ **Reliability:**
- Daily automated backups
- 30-day backup retention
- Disaster recovery plan
- Load tested to 10k concurrent users

✅ **Performance:**
- Global CDN (170+ locations)
- Optimized images (AVIF/WebP)
- Bundle size monitored
- Sub-2s page loads worldwide

## After This: Build with Confidence

Once hardened, you can:
1. Add paying customers (infrastructure ready)
2. Scale to 10k+ users (auto-scaling configured)
3. Handle traffic spikes (rate limiting + CDN)
4. Sleep peacefully (monitoring + backups)

**Then focus on:**
- Content creation (Payload CMS)
- Marketing (SEO, blog posts)
- Features (user auth, payments)
- Growth (analytics, optimization)

---

**Next Step:** Start Sprint 1 (CI/CD) when ready. I can help implement each piece.
