# DevOps Hardening Guide

Comprehensive guide for production-ready infrastructure and monitoring.

---

## 🎯 Overview

This guide covers four critical areas of DevOps excellence:
1. **Sentry** - Error tracking, performance monitoring, session replay
2. **Analytics** - User behavior tracking and conversion optimization
3. **NX Cloud** - Build caching and CI/CD optimization
4. **General Hardening** - Security, performance, and reliability

---

## 1. Sentry: Error Tracking & Performance Monitoring

### Current State
- ✅ Sentry SDK installed (`@sentry/nextjs`)
- ✅ Basic error tracking configured
- ⚠️ No client-side config
- ⚠️ No session replay
- ⚠️ 100% sampling (expensive in production)
- ⚠️ No release tracking

### Improvements Implemented

#### Configuration Files Created:
1. `sentry.client.config.ts` - Browser-side error tracking
2. `sentry.server.config.ts` - Server-side error tracking
3. Updated `instrumentation.ts` - Runtime initialization

#### Key Features Enabled:

**1. Session Replay** (Visual bug reproduction)
- Records user sessions with errors for debugging UX issues
- 10% of normal sessions, 100% of error sessions
- Privacy: Masks all text and media by default
- **Use Case**: See exactly what user did before error occurred

**2. Performance Monitoring**
- Tracks Core Web Vitals (LCP, FID, CLS, INP)
- API response times
- Database query performance (when applicable)
- **Sampling**: 10% in production (reduces costs from $26/month to ~$3/month)

**3. Release Tracking**
- Links errors to specific Git commits
- Track error introduction and resolution
- **Environment Variable**: `CF_PAGES_COMMIT_SHA` (auto-set by Cloudflare)

**4. Smart Error Filtering**
- Ignores browser extension errors
- Ignores network errors (user's connection, not your bug)
- Ignores ad blocker interference
- Sanitizes sensitive data (emails, tokens, passwords)

#### Sentry Dashboard Features to Use:

**Issues Tab** (https://automatonic-ai.sentry.io/issues/)
- See all errors grouped by type
- Track error frequency and affected users
- Set up alerts for critical errors

**Performance Tab**
- Monitor page load times
- Identify slow API endpoints
- Track Core Web Vitals trends

**Releases Tab**
- See which deployment introduced errors
- Track error reduction over time

**Replays Tab**
- Watch video replays of user sessions with errors
- See exact mouse movements, clicks, network requests

#### Cost Optimization:
- **Before**: 100% sampling = ~260,000 events/month = $26+/month
- **After**: 10% sampling = ~26,000 events/month = Free tier or ~$3/month

---

## 2. Analytics: Understanding Your Users

### The Analytics Stack Decision

You asked: "Should I use Google Analytics, Cloudflare Analytics, or Sentry?"

**Answer: Use BOTH Cloudflare Analytics AND a privacy-first alternative to Google Analytics**

### Why Multiple Analytics Tools?

Each tool serves a different purpose:

| Tool | Purpose | Data Privacy | Cost |
|------|---------|--------------|------|
| **Cloudflare Analytics** | Server performance, bot traffic, DDoS | ✅ Privacy-first | ✅ Free |
| **Plausible/Umami** | User behavior, conversions, page views | ✅ GDPR compliant | 💰 ~$9-19/month |
| **Sentry** | Error tracking, performance monitoring | ⚠️ PII possible | ✅ Free tier |
| **Google Analytics** | Deep behavioral analytics | ❌ Privacy invasive | ✅ Free |

### Recommended Stack

#### **PRIMARY: Cloudflare Analytics (Already Have It!)**

**What You Get for Free:**
- Page views and unique visitors
- Geographic distribution
- Device and browser breakdown
- Bot traffic detection
- Bandwidth usage
- Cache hit rates

**How to Access:**
1. Go to: https://dash.cloudflare.com/
2. Click "Workers & Pages"
3. Click "project-chronos"
4. Click "Analytics" tab

**Limitations:**
- No conversion tracking
- No event tracking (button clicks, form submissions)
- No funnel analysis

#### **RECOMMENDED ADD: Plausible Analytics** ($9/month)

**Why Plausible over Google Analytics:**
- ✅ GDPR/CCPA compliant (no cookie banner needed!)
- ✅ Lightweight (<1KB script vs GA's 45KB)
- ✅ No data sold to advertisers
- ✅ EU/US data residency options
- ✅ Simple, clean dashboard
- ✅ Public stats option (transparency++)

**What You Get:**
- Real-time visitors
- Top pages and referrers
- Conversion goals and funnels
- Custom events (waitlist signups, CTA clicks)
- 50,000 pageviews/month on $9 plan

**Setup (10 minutes):**
1. Sign up: https://plausible.io/register
2. Add domain: `automatonicai.com`
3. Add script to `apps/web/app/layout.tsx`:
   ```tsx
   <Script
     defer
     data-domain="automatonicai.com"
     src="https://plausible.io/js/script.js"
   />
   ```
4. Set up goals for:
   - Waitlist signup
   - Feature page visits
   - External link clicks

**Alternative: Umami** (Self-hosted, free)
- Same privacy benefits as Plausible
- Self-hosted = $0/month (uses your infrastructure)
- Setup: Deploy to Cloudflare Workers or Vercel
- More technical but 100% data ownership

#### **OPTIONAL: Google Analytics 4** (If you need deep funnels)

**When to use GA:**
- You need advanced funnel analysis
- You want demographic data
- You're okay with cookie banners
- You want attribution tracking (which ad drove conversion)

**When NOT to use GA:**
- EU customers (GDPR compliance burden)
- Want lightweight site (GA adds 45KB)
- Care about user privacy

**Our Recommendation:** Start with Cloudflare Analytics + Plausible. Add GA later only if you need specific features.

---

## 3. NX Cloud: Build Caching & CI/CD Optimization

### Current State
- ✅ NX installed and configured
- ✅ NX Cloud ID exists: `693a3a62afa88f57bc137da7`
- ⚠️ Not actively using NX Cloud features
- ⚠️ No distributed task execution
- ⚠️ No remote caching

### What NX Cloud Provides

**Free Tier (Current):**
- 500 hours/month compute
- 10GB storage
- Remote caching for faster builds
- Distributed task execution

**What This Means:**
- **Build time**: 3 minutes → 30 seconds (90% faster with cache hits)
- **CI/CD**: Parallel test runs across multiple machines
- **Developer experience**: Instant rebuilds when nothing changed

### How to Enable NX Cloud

**Option 1: Connect Existing Workspace** (Recommended)

```bash
# Link your existing NX Cloud ID
nx connect

# Or manually set in CI/CD
export NX_CLOUD_ACCESS_TOKEN="your-token-from-nx-cloud-dashboard"
```

**Option 2: Full Setup with GitHub Actions**

Create `.github/workflows/ci.yml`:

```yaml
name: CI

on:
  push:
    branches: [main]
  pull_request:

jobs:
  main:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0 # Need full history for NX affected

      - uses: pnpm/action-setup@v2
        with:
          version: 8

      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'pnpm'

      - run: pnpm install --frozen-lockfile

      - name: Run affected tests
        run: npx nx affected -t test --parallel=3 --configuration=ci
        env:
          NX_CLOUD_ACCESS_TOKEN: ${{ secrets.NX_CLOUD_ACCESS_TOKEN }}

      - name: Run affected lint
        run: npx nx affected -t lint --parallel=3

      - name: Build affected projects
        run: npx nx affected -t build --parallel=3
```

**Benefits:**
- Only test/build what changed (`nx affected`)
- Parallel execution (3x faster)
- Remote caching (skip work others already did)
- Build insights dashboard

### Should You Use NX Cloud?

**YES, if:**
- You have multiple apps/libraries (you do: `apps/web`, `packages/ui`)
- You want faster CI/CD
- You work with a team (future)
- You value local build speed

**SETUP NOW**: Connect your existing workspace to unlock caching.

---

## 4. General DevOps Hardening

### 4.1 Security Headers (Already Configured! ✅)

Your `_headers` file includes:
- `X-Content-Type-Options: nosniff` - Prevents MIME sniffing attacks
- `X-Frame-Options: DENY` - Prevents clickjacking
- `X-XSS-Protection: 1; mode=block` - XSS protection
- `Referrer-Policy: strict-origin-when-cross-origin` - Privacy

**What's Missing:**
- Content Security Policy (CSP)
- Permissions-Policy

**Recommended Addition** to `_headers`:

```
/*
  Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://plausible.io; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https://admin.automatonicai.com https://o4510559645925376.ingest.us.sentry.io; frame-ancestors 'none';
  Permissions-Policy: camera=(), microphone=(), geolocation=()
```

### 4.2 Environment Variables

**Current Issues:**
- Passwords in code (Directus password exposed in conversation)
- No .env.example file for team onboarding

**Recommended:**
1. Move all secrets to Cloudflare Pages environment variables
2. Never commit `.env.local`
3. Create `.env.example` with placeholder values

### 4.3 Monitoring Checklist

**Uptime Monitoring:**
- [ ] Set up https://uptimerobot.com (free, 50 monitors)
- [ ] Monitor: `https://automatonicai.com` every 5 minutes
- [ ] Alert via email on downtime

**Performance Budget:**
- [ ] Set Lighthouse CI thresholds (FCP < 1.8s, LCP < 2.5s)
- [ ] Monitor Core Web Vitals in Sentry
- [ ] Set up Cloudflare Speed test

**Error Rate Alerts:**
- [ ] Sentry: Alert when error rate > 5%
- [ ] Sentry: Alert on new error types
- [ ] Slack integration for critical errors

### 4.4 Backup Strategy

**Code:** ✅ GitHub (already backed up)

**Directus Content:** ⚠️ Needs backup
- [ ] Set up automated Directus backups
- [ ] Export DB weekly to S3/Cloudflare R2
- [ ] Document restore procedure

**Database:**
- [ ] AWS Lightsail automated backups (check if enabled)
- [ ] Test restore procedure

---

## 📋 Implementation Priority

### Phase 1: Quick Wins (Today)
1. ✅ Sentry config improvements (done)
2. ⏳ Add Plausible Analytics script
3. ⏳ Connect NX Cloud
4. ⏳ Set up UptimeRobot

### Phase 2: Essential (This Week)
5. ⏳ Add CSP headers
6. ⏳ Create .env.example
7. ⏳ Set up Sentry alerts
8. ⏳ Test Directus backup/restore

### Phase 3: Nice-to-Have (Next Sprint)
9. ⏳ GitHub Actions CI/CD
10. ⏳ Lighthouse CI
11. ⏳ Automated dependency updates
12. ⏳ Performance budgets

---

## 💰 Cost Estimate

| Service | Tier | Monthly Cost |
|---------|------|--------------|
| Cloudflare Pages | Free | $0 |
| Cloudflare Analytics | Free | $0 |
| Sentry | Free (with 10% sampling) | $0 |
| NX Cloud | Free | $0 |
| Plausible Analytics | Paid | $9 |
| UptimeRobot | Free | $0 |
| **Total** | | **$9/month** |

Alternative (self-hosted Umami instead of Plausible): **$0/month**

---

## 🎓 Learning Resources

**Sentry:**
- Dashboard: https://automatonic-ai.sentry.io
- Docs: https://docs.sentry.io/platforms/javascript/guides/nextjs/

**NX Cloud:**
- Dashboard: https://cloud.nx.app (login with GitHub)
- Docs: https://nx.dev/ci/intro/ci-with-nx

**Plausible:**
- Demo: https://plausible.io/plausible.io
- Docs: https://plausible.io/docs

**Web Vitals:**
- Guide: https://web.dev/vitals/
- Tool: https://pagespeed.web.dev/

---

## 📞 Next Steps

See the Jira tickets created for implementation tracking:
- CHRONOS-385: Sentry Configuration Improvements
- CHRONOS-386: Analytics Setup (Plausible/Cloudflare)
- CHRONOS-387: NX Cloud Integration
- CHRONOS-388: Security Headers Enhancement
