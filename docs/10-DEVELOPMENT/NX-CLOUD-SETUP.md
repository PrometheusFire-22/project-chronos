# NX Cloud Setup & Usage Monitoring

## Overview

NX Cloud provides distributed caching and task execution for your monorepo, dramatically reducing build times (3 min → 30 sec with cache hits).

**Your NX Cloud ID:** `693a3a62afa88f57bc137da7`

## Current Status

- ✅ NX Cloud ID configured in `nx.json`
- ⏳ Need to add NX_CLOUD_ACCESS_TOKEN to enable

## Setup Instructions

### 1. Get Your Access Token

1. Visit: https://cloud.nx.app
2. Log in with GitHub
3. Navigate to your workspace: "project-chronos"
4. Go to Settings → Access Tokens
5. Copy the access token

### 2. Add Token to Local Environment

```bash
# Add to .env.local
echo "NX_CLOUD_ACCESS_TOKEN=your-token-here" >> .env.local
```

### 3. Add Token to GitHub Actions

```bash
# Go to: https://github.com/PrometheusFire-22/project-chronos/settings/secrets/actions
# Add new repository secret:
# Name: NX_CLOUD_ACCESS_TOKEN
# Value: your-token-here
```

### 4. Verify Connection

```bash
# Run any NX command
pnpm nx build web

# You should see: "Connected to NX Cloud"
```

## Usage Limits & Monitoring

### Free Tier Limits

- **Compute:** 500 hours/month
- **Storage:** 10GB
- **Team Size:** Unlimited

### How to Monitor Usage

**Dashboard:** https://cloud.nx.app

Monitor:
- Compute hours used (reset monthly)
- Storage usage
- Cache hit rate
- Build time savings

### Staying Within Free Tier

**Current Estimate:**
- ~30 builds/day × 2 min/build = 60 min/day
- 60 min × 30 days = 1,800 min/month = 30 hours/month

**You're using ~6% of free tier** ✅

**If You Hit Limits:**
1. NX Cloud will still work, just without remote caching
2. Builds fall back to local execution
3. No broken builds, just slower

**To Reduce Usage:**
1. Use `--skip-nx-cache` for development builds
2. Only use NX Cloud in CI/CD
3. Configure cache retention (auto-delete old caches)

## Benefits You'll See

### Before NX Cloud
```
Building web... 180s
Total: 3 min
```

### After NX Cloud (Cache Hit)
```
Building web... 15s (cached)
Total: 30s
```

## Next Steps

1. Get access token from https://cloud.nx.app
2. Add to `.env.local` (local development)
3. Add to GitHub Actions secrets (CI/CD)
4. Monitor usage dashboard

**No action required immediately** - Configuration is ready, just needs token when you want to enable it.
