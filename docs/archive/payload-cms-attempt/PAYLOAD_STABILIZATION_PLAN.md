# Payload CMS Stabilization Plan
**Date**: 2025-12-16  
**Priority**: CRITICAL  
**Type**: Foundation Architecture  

---

## Executive Summary

Stabilize Project Chronos by downgrading from bleeding-edge stack to Payload's officially supported configuration. Current setup uses Next.js 16 canary + Turbopack production builds, which are ahead of Payload's support and causing critical admin UI failures.

**Goal**: Production-ready Payload CMS with functional admin UI, PostgreSQL, S3, and proper CMS/code separation.

---

## Current State Assessment

### ✅ What's Working
- Backend/API (database connections, user creation via API)
- Server-side rendering
- PostgreSQL database on AWS (16.52.210.100)
- S3 bucket (project-chronos-media)
- Vercel deployment pipeline
- Build process completes

### ❌ What's Broken
- **Admin UI completely non-functional** (client-side JavaScript error: `Q() is undefined`)
- Login page crashes
- Create-first-user page crashes  
- All admin routes fail on client-side hydration

### Root Cause
**Version mismatch**:
- Current: Next.js 16.1.0-canary.28 + Turbopack production
- Payload supports: Next.js 15.4.x stable only
- Payload's official template: Next.js 15.4.10 + webpack

---

## Current Stack vs. Target Stack

| Component | Current | Target (Official Template) | Action |
|-----------|---------|---------------------------|---------|
| **Next.js** | 16.1.0-canary.28 | 15.4.10 (stable) | Downgrade |
| **React** | 19.2.2 | 19.2.1 | Pin version |
| **Payload** | 3.68.5 | 3.68.5 | Keep |
| **Build Tool** | Turbopack (prod) | webpack | Remove Turbopack from production |
| **Database** | PostgreSQL (AWS) | PostgreSQL | Keep |
| **Storage** | S3 | S3 | Keep |
| **Monorepo** | NX | Single app | Keep NX (document differences) |

---

## Architecture Changes Required

### 1. Version Downgrade
**Files to modify**:
- `apps/web/package.json`: Change `"next": "canary"` → `"next": "15.4.10"`
- `apps/web/package.json`: Change `"react": "^19.0.0"` → `"19.2.1"`
- `apps/web/package.json`: Change `"react-dom": "^19.0.0"` → `"19.2.1"`

### 2. Remove Turbopack from Production
**Files to modify**:
- `apps/web/next.config.js`: Ensure no Turbopack production flags
- Turbopack can remain for `next dev` only

### 3. Align Project Structure with Official Template

#### Official Template Structure (from GitHub):
```
src/
├── app/                    # Next.js App Router
│   ├── (frontend)/        # Public-facing pages
│   └── (payload)/         # Admin routes
├── collections/           # Payload collections
│   ├── Users.ts
│   ├── Posts.ts
│   ├── Pages.ts
│   ├── Media.ts
│   └── Categories.ts
├── globals/              # Payload globals
│   ├── Header.ts
│   └── Footer.ts
├── blocks/               # Reusable content blocks
├── payload.config.ts     # Payload configuration
└── access/               # Access control functions
```

#### Our Current Structure:
```
apps/web/
├── app/
│   ├── (payload)/        # Admin routes ✅
│   └── api/              # API routes ✅
├── collections/
│   ├── Users.ts          # ✅
│   ├── Media.ts          # ✅
│   └── Pages.ts          # ✅
└── payload.config.ts     # ✅
```

**Missing Components**:
- ❌ `globals/` (Header, Footer)
- ❌ `blocks/` (Hero, Content, Media blocks)
- ❌ `access/` (Centralized access control)
- ❌ Frontend routes in `app/(frontend)/`

### 4. Implement CMS/Code Separation

#### Code Responsibilities (Next.js):
- Global layout (header, footer, nav)
- Page routing (`/`, `/about`, etc.)
- Component structure
- Auth boundaries
- Data-fetching logic

#### CMS Responsibilities (Payload):
- Page content (headlines, copy, CTAs)
- Media/images
- Section ordering
- Feature flags (show/hide sections)
- Marketing copy

#### Implementation:
1. **Create Pages Collection** (already exists, enhance it)
   - Add `slug` field
   - Add `title`, `description` (SEO)
   - Add `blocks` field (layout builder)
   - Add `isHome` boolean

2. **Create Blocks**:
   - `Hero` block
   - `Content` block
   - `Media` block
   - `CTA` block

3. **Create Frontend Route**:
   - `app/(frontend)/[[...slug]]/page.tsx`
   - Fetch page data from Payload
   - Render blocks dynamically

---

## Execution Plan

### Phase 1: Version Stabilization (30 min)
**Tasks**:
1. Update `package.json` to Next.js 15.4.10, React 19.2.1
2. Remove Turbopack production configuration
3. Clean install dependencies
4. Test local build
5. Commit: `fix: downgrade to Payload-supported stack`

**Success Criteria**:
- Local build succeeds
- No Turbopack errors
- Dependencies resolve without peer warnings (or documented warnings only)

### Phase 2: Deploy & Verify Admin UI (15 min)
**Tasks**:
1. Deploy to Vercel
2. Navigate to `/admin`
3. Verify no client-side errors
4. Create first user via web UI (not API)
5. Login successfully

**Success Criteria**:
- Admin UI loads without JavaScript errors
- Login form works
- Can create and authenticate users

### Phase 3: Structure Alignment (1 hour)
**Tasks**:
1. Create `apps/web/src/` directory
2. Move existing code into `src/`
3. Create `globals/Header.ts` and `globals/Footer.ts`
4. Create `blocks/` directory with starter blocks
5. Update `payload.config.ts` to include globals and blocks
6. Update imports and paths

**Success Criteria**:
- Project structure matches official template
- All builds pass
- Payload admin shows Globals section

### Phase 4: Implement Pages + Blocks (1.5 hours)
**Tasks**:
1. Enhance `Pages` collection with `blocks` field
2. Create block types:
   - `Hero` (headline, subheadline, CTA)
   - `Content` (rich text)
   - `MediaBlock` (image/video)
   - `CallToAction` (button + link)
3. Create frontend route: `app/(frontend)/[[...slug]]/page.tsx`
4. Implement block rendering logic
5. Create homepage entry in CMS with `slug: 'home'`

**Success Criteria**:
- Can create/edit pages in Payload admin
- Homepage renders content from CMS
- Blocks are reusable and configurable

### Phase 5: Testing & Validation (30 min)
**Tasks**:
1. Create test page in CMS
2. Verify S3 media uploads
3. Test database migrations
4. Verify all admin routes functional
5. Test frontend rendering

**Success Criteria**:
- All CRUD operations work in admin
- Media uploads to S3 successfully
- Pages render on frontend
- No console errors

### Phase 6: Documentation (30 min)
**Tasks**:
1. Update `README.md` with setup instructions
2. Document environment variables
3. Create `docs/ARCHITECTURE.md` explaining CMS/code separation
4. Create `docs/DEPLOYMENT.md` with deployment steps
5. Create `docs/UPGRADING.md` with future Next.js 16 migration notes

**Success Criteria**:
- New developer can set up project from docs
- Architecture decisions are explained
- Upgrade path is documented

---

## Jira Epic & Tasks

### Epic
**CHRONOS-314**: Payload CMS Stack Stabilization

**Tasks**:
1. **CHRONOS-315**: Downgrade Next.js to 15.4.10 and remove Turbopack
2. **CHRONOS-316**: Verify admin UI functionality after downgrade
3. **CHRONOS-317**: Align project structure with Payload template
4. **CHRONOS-318**: Create Globals (Header, Footer)
5. **CHRONOS-319**: Implement Blocks system (Hero, Content, Media, CTA)
6. **CHRONOS-320**: Create frontend rendering route
7. **CHRONOS-321**: Test and validate full stack
8. **CHRONOS-322**: Document architecture and decisions

---

## Risk Mitigation

### Risk: Breaking Changes from Downgrade
**Mitigation**: Create feature branch, test thoroughly before merging

### Risk: Lost Turbopack Performance
**Mitigation**: Turbopack remains available for `next dev`, only removed from production builds

### Risk: NX Monorepo Incompatibility
**Mitigation**: NX is compatible with Next.js 15.4.10, no issues expected

### Risk: Data Loss During Structure Migration
**Mitigation**: Database is external (AWS), no data at risk. Code-only changes.

---

## Success Metrics

1. **Admin UI**: Fully functional, zero JavaScript errors
2. **Performance**: Build time < 3 minutes
3. **Stability**: Zero production errors for 7 days post-deployment
4. **DX**: New developer can set up in < 30 minutes using docs
5. **CMS Adoption**: Can create/edit homepage content without touching code

---

## Future Considerations

### Next.js 16 Migration (Future)
When Payload officially supports Next.js 16:
1. Check Payload changelog for Next.js 16 support announcement
2. Review breaking changes
3. Test in staging environment
4. Gradually re-enable Turbopack for production if stable

### Additional CMS Features (Future)
- Localization (i18n)
- Workflow/drafts
- Scheduled publishing
- Custom fields

### Performance Optimization (Future)
- ISR (Incremental Static Regeneration)
- Edge caching
- Image optimization

---

## Timeline

**Total Estimated Time**: 4-5 hours

- Phase 1: 30 min
- Phase 2: 15 min  
- Phase 3: 1 hour
- Phase 4: 1.5 hours
- Phase 5: 30 min
- Phase 6: 30 min
- Buffer: 30 min

**Target Completion**: Today (2025-12-16)

---

## Approval & Sign-Off

- [ ] Plan reviewed and approved
- [ ] Jira epic and tasks created
- [ ] Ready to execute
