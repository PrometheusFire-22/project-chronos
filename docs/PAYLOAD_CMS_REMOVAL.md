# Payload CMS Removal - Project Cleanup Documentation

**Date:** December 16, 2025
**Branch:** cleanup/remove-payload-add-mdx
**Commit:** 8f3d5009

## Executive Summary

After extensive troubleshooting attempts (31+ commits over multiple days), Payload CMS 3.68.5 was completely removed from the project due to persistent, unresolvable compatibility issues with Next.js 15.4.10 and React 19.2.1.

The project has been reset to a clean Next.js baseline for bullet-proof DevOps and future content strategy.

---

## Timeline of Payload CMS Integration Attempt

### Initial Setup (Dec 1-14, 2025)
- 31+ commits attempting to integrate Payload CMS
- Multiple approaches tried:
  - Layout isolation
  - Route group separation
  - Database schema management
  - Fresh installations from scratch

### Critical Issues Encountered

#### 1. Admin UI Failure
**Error:** `Uncaught TypeError: H() is undefined` (or `ue() is undefined`)
- Occurred at `/admin/login` and all admin routes
- Persisted across all troubleshooting attempts
- Occurred even with fresh Payload installation
- Likely a minified React hook failure in Payload's code

#### 2. Drizzle ORM Schema Push Conflicts
**Error:** Schema push warnings trying to delete existing database tables
- Drizzle auto-push attempted to modify `spatial_ref_sys` and other existing tables
- Server would freeze when declining schema push
- Workaround: `push: false` in config, but migrations still needed

#### 3. Migration Conflicts
**Error:** `relation 'users' already exists`
- Old Payload tables from previous attempts conflicted with new migrations
- Required manual database cleanup

#### 4. Deployment Issues
- 404 errors on all content pages in production
- Admin UI never successfully loaded
- Multiple failed deployments to Vercel

---

## What Was Removed

### NPM Dependencies (358 packages removed)
```json
"@payloadcms/db-postgres": "^3.68.5",
"@payloadcms/next": "^3.68.5",
"@payloadcms/richtext-lexical": "^3.68.5",
"@payloadcms/storage-s3": "^3.68.5",
"payload": "^3.68.5",
"graphql": "^16.12.0",
"sharp": "^0.34.5"
```

### Files and Directories Deleted (34 files, 6522 lines)

#### Configuration Files
- `apps/web/payload.config.ts`
- `apps/web/payload-types.ts`
- `apps/web/tsconfig.json` (cleaned @payload-config alias)
- `apps/web/next.config.js` (removed withPayload wrapper)
- `apps/web/.env.local` (removed PAYLOAD_SECRET, S3, POSTGRES_URL)

#### Collection Definitions
- `apps/web/collections/Users.ts`
- `apps/web/collections/Media.ts`
- `apps/web/collections/Pages.ts`

#### Global Definitions
- `apps/web/globals/Header.ts`
- `apps/web/globals/Footer.ts`
- `apps/web/globals/index.ts`

#### Block Definitions
- `apps/web/blocks/Hero.ts`
- `apps/web/blocks/Content.ts`
- `apps/web/blocks/MediaBlock.ts`
- `apps/web/blocks/CallToAction.ts`
- `apps/web/blocks/index.ts`

#### React Components
- `apps/web/app/(frontend)/[[...slug]]/page.tsx`
- `apps/web/app/(frontend)/[[...slug]]/RenderBlocks.tsx`
- `apps/web/app/(frontend)/[[...slug]]/blocks/HeroBlock.tsx`
- `apps/web/app/(frontend)/[[...slug]]/blocks/ContentBlock.tsx`
- `apps/web/app/(frontend)/[[...slug]]/blocks/MediaBlockComponent.tsx`
- `apps/web/app/(frontend)/[[...slug]]/blocks/CTABlock.tsx`

#### Admin Routes
- `apps/web/app/(payload)/admin/[[...segments]]/page.tsx`
- `apps/web/app/(payload)/admin/importMap.js`
- `apps/web/app/(payload)/layout.tsx`
- `apps/web/app/api/(payload)/[...slug]/route.ts`

#### Database Migrations
- `apps/web/migrations/20251215_232750_initial.ts`
- `apps/web/migrations/20251215_232750_initial.json`
- `apps/web/migrations/20251216_214900.ts`
- `apps/web/migrations/20251216_214900.json`
- `apps/web/migrations/index.ts`

#### Scripts
- `apps/web/scripts/create-admin-user.mjs`
- `apps/web/scripts/create-user-properly.mjs`

---

## What Was Archived

Moved to `docs/archive/payload-cms-attempt/`:
- `PAYLOAD_STABILIZATION_PLAN.md`
- `PAYLOAD_CMS_FIX_QUICK_START.md`
- `PAYLOAD_CMS_AUDIT_REPORT.md`
- `docs/decisions/ADR-002_hybrid_infrastructure_payload.md`
- `docs/guides/cms/payload_integration.md`

Deleted entirely:
- `/home/prometheus/coding/finance/payload-fresh/` (failed fresh install attempt)

---

## What Was Preserved

### Working Components (No Payload Dependencies)
- `apps/web/components/layout/Header.tsx` - Static navigation header
- `apps/web/components/layout/Footer.tsx` - Static footer
- `apps/web/components/ThemeToggle.tsx` - Dark mode toggle
- All UI components in `packages/ui/`

### App Structure
- `apps/web/app/layout.tsx` - Root layout (cleaned)
- `apps/web/app/(frontend)/layout.tsx` - Frontend layout with Header/Footer
- `apps/web/app/(frontend)/page.tsx` - **NEW** simple homepage

### Configuration
- Tailwind CSS configuration
- TypeScript configuration (cleaned)
- Next.js configuration (simplified)
- Nx workspace configuration

---

## Current State

### Clean Next.js 16 + React 19.2.3 Baseline
- No CMS dependencies
- Upgraded to Next.js 16.0.10 with Turbopack support
- Upgraded to React 19.2.3 (latest)
- Static homepage implemented
- Header/Footer components preserved
- Dark mode support intact
- Ready for future content strategy

### Environment Variables
```bash
# apps/web/.env.local (cleaned)
NEXT_PUBLIC_SERVER_URL=http://localhost:3000
```

All Payload-specific variables removed:
- ❌ `PAYLOAD_SECRET`
- ❌ `POSTGRES_URL`
- ❌ `S3_ACCESS_KEY_ID`
- ❌ `S3_SECRET_ACCESS_KEY`
- ❌ `S3_BUCKET`
- ❌ `S3_REGION`

---

## Future Content Strategy Options

### Option 1: MDX-based Static Site Generation (Recommended)
- Use `@next/mdx` for content
- File-based routing with MDX files
- No external dependencies
- Full type safety
- Git-based workflow

### Option 2: Headless CMS (External Service)
- Sanity.io
- Contentful
- Strapi (self-hosted)
- DatoCMS

### Option 3: Wait for Payload v4 or Next.js Compatibility
- Monitor Payload CMS GitHub for fixes
- Consider when stable with Next.js 15+

---

## DevOps Hardening Checklist

- ✅ Remove all Payload CMS code and dependencies
- ✅ Clean node_modules (358 packages removed)
- ✅ Archive obsolete documentation
- ✅ Remove failed installation artifacts
- ✅ Simplify Next.js configuration
- ✅ Clean environment variables
- ⏳ Verify build passes locally
- ⏳ Deploy clean baseline to Vercel
- ⏳ Document in Jira
- ⏳ Update team on status

---

## Lessons Learned

1. **Verify Compatibility First**: Check framework compatibility before deep integration
2. **Keep It Simple**: Start with simple, proven solutions before complex CMS
3. **Fail Fast**: Don't spend days troubleshooting incompatible dependencies
4. **Clean Rollback**: Document rollback procedures before major changes
5. **Baseline First**: Establish working baseline before adding features

---

## Related Documentation

- Git commit: `8f3d5009` - feat: remove Payload CMS and create clean Next.js baseline
- Branch: `cleanup/remove-payload-add-mdx`
- Archive: `docs/archive/payload-cms-attempt/`
- Jira: [To be created]

---

## Contact

For questions about this cleanup, contact the DevOps team or review the git history:
```bash
git log --oneline --grep="payload" --grep="Payload" -i
```
