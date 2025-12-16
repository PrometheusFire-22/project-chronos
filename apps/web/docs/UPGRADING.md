# Payload CMS Web App Upgrade Guide
## Next.js 15.4.10 → 16.x Migration Strategy & Payload Version Updates

**Last Updated**: 2025-12-16
**Scope**: apps/web Payload CMS stack upgrades
**Current Stack**: Next.js 15.4.10, Payload 3.68.5, React 19.2.1
**Target Stack**: Next.js 16+ (when Payload supports it), Latest Payload 3.x/4.x

---

## Table of Contents

1. [Overview](#overview)
2. [When to Upgrade](#when-to-upgrade)
3. [Pre-Upgrade Checklist](#pre-upgrade-checklist)
4. [Next.js 16 Migration](#nextjs-16-migration)
5. [Payload Updates](#payload-updates)
6. [Database Migrations](#database-migrations)
7. [Breaking Changes](#breaking-changes)
8. [Testing](#testing)
9. [Rollback Plan](#rollback-plan)

---

## Overview

This guide covers upgrading Project Chronos from the current stable configuration to future versions. The most significant future upgrade will be **Next.js 15.4.10 → Next.js 16.x** once Payload officially supports it.

---

## When to Upgrade

### ✅ Safe to Upgrade When:

1. **Payload announces Next.js 16 support**
   - Check [Payload changelog](https://github.com/payloadcms/payload/releases)
   - Look for "Next.js 16 compatible" announcement
   - Verify in official template

2. **Security patches released**
   - Critical CVEs in dependencies
   - Payload security updates

3. **Feature requirements**
   - New Payload features needed
   - React 19+ features required

### ❌ Do NOT Upgrade If:

- Payload has not announced support for target Next.js version
- Major refactor is in progress
- Production issues are unresolved
- No testing capacity available

---

## Pre-Upgrade Checklist

Before starting any upgrade:

- [ ] **Backup database**
  ```bash
  pg_dump -h 16.52.210.100 -U chronos chronos > backup-$(date +%F).sql
  ```

- [ ] **Create feature branch**
  ```bash
  git checkout -b upgrade/nextjs-16
  ```

- [ ] **Review changelogs**
  - [Next.js Releases](https://github.com/vercel/next.js/releases)
  - [Payload Releases](https://github.com/payloadcms/payload/releases)
  - [React Releases](https://github.com/facebook/react/releases)

- [ ] **Check breaking changes**
  - Read upgrade guides for each package
  - Identify deprecated APIs in codebase

- [ ] **Allocate time**
  - Minor upgrades: 1-2 hours
  - Major upgrades: 4-8 hours
  - Breaking changes: 1-2 days

---

## Next.js 16 Migration

### When Payload Supports Next.js 16

**Current Blocker**: Payload CMS officially supports Next.js 15.4.x only. Next.js 16 causes client-side errors (`Q() is undefined`) in Payload admin UI.

**When to Proceed**: After Payload releases a version with Next.js 16 support.

### Step 1: Verify Compatibility

```bash
# Check Payload's supported Next.js version
npm view @payloadcms/next peerDependencies

# Expected output (when ready):
# { next: '^16.0.0' }
```

If it still shows `^15.4.10`, **do not upgrade**.

### Step 2: Update Dependencies

```json
// package.json (root and apps/web/)
{
  "dependencies": {
    "next": "16.0.0",  // Update from 15.4.10
    "react": "19.2.x",  // Check Payload requirements
    "react-dom": "19.2.x"
  }
}
```

```bash
# Clean install
rm -rf node_modules apps/web/node_modules pnpm-lock.yaml
pnpm install
```

### Step 3: Update Next.js Config

Check for Next.js 16 breaking changes:

```javascript
// apps/web/next.config.js
export default async (phase, context) => {
  const config = composePlugins(...plugins)(nextConfig);
  const resolvedConfig = typeof config === 'function' ? await config(phase, context) : config;

  // Add any Next.js 16-specific config here

  return withPayload(resolvedConfig);
};
```

### Step 4: Test Turbopack Production Builds

Next.js 16 may support Turbopack for production:

```bash
# Test build with Turbopack
TURBOPACK=1 pnpm --filter @chronos/web build
```

If successful, consider enabling Turbopack permanently.

### Step 5: Update App Router Patterns

Check for deprecated patterns:

```typescript
// Before (Next.js 15)
export default async function Page({ params }: PageProps) {
  const resolvedParams = await params;
  // ...
}

// After (Next.js 16) - may change
// Check official upgrade guide
```

---

## Payload Updates

### Minor Version Updates (3.68.5 → 3.69.x)

**Safe** - Usually bug fixes and minor features.

```bash
# Update all Payload packages
pnpm update @payloadcms/next @payloadcms/db-postgres @payloadcms/storage-s3 @payloadcms/richtext-lexical
```

### Major Version Updates (3.x → 4.x)

**Risky** - Requires careful migration.

1. **Read migration guide**: https://payloadcms.com/docs/upgrade
2. **Check breaking changes**: API changes, field type changes
3. **Test in staging**: Never upgrade directly in production
4. **Update data models**: Adjust collections/globals if needed

---

## Database Migrations

### Automatic Migrations

Payload auto-generates migrations on schema changes:

```typescript
// After updating collections/globals
pnpm payload migrate:create
pnpm payload migrate
```

**Generated files**: `migrations/[timestamp]_[description].ts`

### Manual Migrations

If custom database changes are needed:

```sql
-- migrations/manual_add_index.sql
CREATE INDEX idx_pages_slug ON pages(slug);
CREATE INDEX idx_pages_is_home ON pages("isHome");
```

Run manually:
```bash
psql -h 16.52.210.100 -U chronos -d chronos -f migrations/manual_add_index.sql
```

### Migration Safety

✅ **DO**:
- Test migrations locally first
- Back up production database before migrating
- Run migrations during low-traffic periods
- Review generated migration SQL

❌ **DON'T**:
- Run migrations without backups
- Edit Payload-generated migrations (regenerate instead)
- Drop tables manually (use Payload migrations)

---

## Breaking Changes

### Potential Next.js 16 Breaking Changes

Based on Next.js canary releases, watch for:

1. **App Router Changes**
   - Server Component async behavior
   - Metadata API changes
   - Caching strategies

2. **Turbopack Changes**
   - Module resolution differences
   - CSS/asset handling changes

3. **Build Output Changes**
   - Different `.next` structure
   - ISR behavior changes

### Payload 4.x Breaking Changes

(When released - speculative):

1. **Config API Changes**
   - Different import paths
   - Changed config structure

2. **Field Type Changes**
   - Renamed field types
   - Different validation API

3. **Database Adapter Changes**
   - Updated `@payloadcms/db-postgres` API
   - Migration format changes

---

## Testing

### Pre-Deployment Testing

```bash
# 1. Local build test
pnpm --filter @chronos/web build
pnpm --filter @chronos/web start

# 2. Admin UI test
open http://localhost:3000/admin
# ✓ Can log in
# ✓ Collections visible
# ✓ Can create/edit content
# ✓ No console errors

# 3. Frontend test
open http://localhost:3000
# ✓ Pages render correctly
# ✓ Blocks display properly
# ✓ Media loads from S3
# ✓ No console errors

# 4. API test
curl http://localhost:3000/api/pages
# ✓ Returns JSON
# ✓ No 500 errors
```

### Staging Deployment

```bash
# Deploy to preview environment
vercel --prod=false

# Get preview URL
# Test all critical paths:
# - Admin login
# - Page CRUD operations
# - Media uploads
# - Frontend rendering
```

### Load Testing

```bash
# Install k6 or similar
npm install -g k6

# Run load test
k6 run load-test.js
```

---

## Rollback Plan

### If Upgrade Fails

**Option 1: Git Revert**
```bash
git revert HEAD
git push origin upgrade/nextjs-16
```

**Option 2: Vercel Rollback**
```bash
vercel rollback
```

**Option 3: Database Restore**
```bash
# If migrations broke something
psql -h 16.52.210.100 -U chronos -d chronos < backup-2025-12-16.sql
```

### Rollback Checklist

- [ ] Revert code changes (Git)
- [ ] Rollback database migrations (if needed)
- [ ] Redeploy previous version
- [ ] Verify admin UI works
- [ ] Verify frontend works
- [ ] Test API endpoints

---

## Upgrade Schedule

### Recommended Timeline

1. **Monday**: Read changelogs, create upgrade branch
2. **Tuesday**: Update dependencies, fix TypeScript errors
3. **Wednesday**: Test locally, fix issues
4. **Thursday**: Deploy to staging, QA testing
5. **Friday**: Deploy to production (morning, low traffic)
6. **Weekend**: Monitor for issues

### Maintenance Window

**Best Time**: Friday 9 AM - 12 PM EST
- Low traffic period
- Team available for quick fixes
- Weekend as buffer for critical issues

---

## Version History

| Date | Upgrade | Notes |
|------|---------|-------|
| 2025-12-16 | Downgrade Next.js 16 → 15.4.10 | Payload compatibility fix |
| 2025-12-16 | Payload 3.68.3 → 3.68.5 | Fixed formatAdminURL bug |

---

## References

- [Next.js Upgrade Guide](https://nextjs.org/docs/upgrading)
- [Payload Migration Guide](https://payloadcms.com/docs/upgrade)
- [React Upgrade Guide](https://react.dev/blog)
- [PAYLOAD_STABILIZATION_PLAN.md](../../PAYLOAD_STABILIZATION_PLAN.md)

---

**Last Updated**: 2025-12-16
**Maintained By**: Development Team
**Questions?**: Open an issue on GitHub
