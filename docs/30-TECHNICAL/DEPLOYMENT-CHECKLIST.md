# Deployment Checklist - Chronos Marketing Website

**Epic**: CHRONOS-366
**Story**: CHRONOS-374
**Created**: 2024-12-25

## Overview

This checklist covers all requirements and steps needed to deploy the Chronos marketing website to production.

---

## 📋 Pre-Deployment Assessment

### ✅ Completed Items

#### Pages Built
- [x] Homepage (`/`) - 6 sections + waitlist form
- [x] Features page (`/features`) - 4 sections + comparison table
- [x] About page (`/about`) - 5 sections + team showcase
- [x] API Routes (`/api/waitlist`) - Form submission handler

#### Components Built (15 total)
- [x] HeroSection (CMS-driven)
- [x] ProblemStatement (CMS-driven)
- [x] SolutionPillars (CMS-driven)
- [x] FeaturesPreview (CMS-driven)
- [x] UseCases (CMS-driven)
- [x] WaitlistSection (static)
- [x] WaitlistForm (Client Component with React Hook Form)
- [x] FeaturesHero (static)
- [x] FeatureDetails (CMS-driven)
- [x] FeatureComparison (static)
- [x] AboutHero (static)
- [x] AboutStory (static)
- [x] AboutValues (CMS-driven)
- [x] AboutTeam (static)

#### CMS Integration
- [x] Directus client library built
- [x] Type-safe API helpers created
- [x] Zod schemas for validation
- [x] Error handling implemented
- [x] ISR caching configured (1-hour default)

---

## 🚨 Critical Items Needed Before Deployment

### 1. **Directus Content Population**
**Status**: ⚠️ NEEDS REVIEW

Content that needs to be populated in Directus:

#### Homepage Hero (`cms_homepage_hero`)
- [ ] headline
- [ ] subheadline
- [ ] cta_primary_text
- [ ] cta_primary_link
- [ ] cta_secondary_text (optional)
- [ ] cta_secondary_link (optional)
- [ ] active = true

#### Problem Points (`cms_features` - category: `problem-point`)
- [ ] 3 problem point features
- [ ] Each with: title, description, icon, sort_order, enabled=true

#### Solution Pillars (`cms_features` - category: `solution-pillar`)
- [ ] 4 database modality pillars
- [ ] Each with: title, description, icon, sort_order, enabled=true
- [ ] Suggested: Graph, Vector, Time-Series, Geospatial

#### Key Features (`cms_features` - category: `key-feature`)
- [ ] 6-9 key platform features
- [ ] Each with: title, description, icon, sort_order, enabled=true

#### Use Cases (`cms_features` - category: `use-case`)
- [ ] 4-6 investor use cases
- [ ] Each with: title, description, icon, sort_order, enabled=true

#### Feature Details (`cms_features` - category: `features-detail`)
- [ ] 3-5 detailed feature showcases for /features page
- [ ] Each with: title, description, icon, sort_order, enabled=true

#### About Values (`cms_features` - category: `about-section`)
- [ ] 3-6 company values
- [ ] Each with: title, description, icon, sort_order, enabled=true

**Action Required**:
```bash
# Check if content exists
cd scripts
node check-directus-content.js

# Populate if needed (you have scripts for this)
node populate-homepage-content.js
node populate-features-content.js
node populate-about-content.js
```

### 2. **Environment Variables**
**Status**: ⚠️ NEEDS VERIFICATION

Required environment variables for production:

#### Next.js App (`apps/web/.env.production`)
```bash
# Public
NEXT_PUBLIC_SERVER_URL=https://chronos.ai
NEXT_PUBLIC_DIRECTUS_URL=https://admin.automatonicai.com

# Optional: Analytics
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX

# Optional: Sentry
NEXT_PUBLIC_SENTRY_DSN=https://...
SENTRY_AUTH_TOKEN=...
```

**Action Required**: Create `.env.production` file with production values

### 3. **Build Verification**
**Status**: ⚠️ NOT TESTED

```bash
# Navigate to web app
cd apps/web

# Install dependencies
pnpm install

# Build for production
pnpm build

# Test production build locally
pnpm start

# Expected output:
# - Build should complete without errors
# - All pages should generate successfully
# - No TypeScript errors
# - No missing dependencies
```

**Action Required**: Run build and verify no errors

### 4. **Directus Public Access**
**Status**: ⚠️ NEEDS VERIFICATION

Directus collections must be publicly readable:

```
cms_homepage_hero - Public READ access
cms_features - Public READ access (all categories)
cms_blog_posts - Public READ access (status=published)
cms_docs_pages - Public READ access (status=published)
cms_announcements - Public READ access (active=true)
cms_legal_pages - Public READ access (status=published)
cms_waitlist_submissions - Public CREATE access (POST only)
```

**Action Required**:
1. Log into Directus admin
2. Go to Settings → Roles & Permissions → Public
3. Enable read access for all `cms_*` collections (except sensitive ones)
4. Enable create access for `cms_waitlist_submissions`

### 5. **Assets and Media**
**Status**: ⚠️ NEEDS IMAGES

Current status:
- [x] Cloudflare R2 bucket configured
- [x] Directus configured to use R2
- [ ] Hero graph illustration (`/illustrations/hero-graph.svg`)
- [ ] Company logo files
- [ ] Feature screenshots/diagrams (for FeatureDetails visual placeholders)
- [ ] Team member photos (currently using placeholders)

**Action Required**:
1. Create or source hero graph SVG illustration
2. Add feature screenshots to Directus Files
3. Add team photos (or keep placeholders for MVP)

---

## 🔧 Technical Requirements

### Dependencies
- [x] Node.js ≥20.0.0
- [x] pnpm (workspace package manager)
- [x] Next.js 15.4.10
- [x] React 19.2.1
- [x] TypeScript ~5.9.3

### External Services
- [x] Directus CMS (https://admin.automatonicai.com)
- [x] PostgreSQL database (for Directus)
- [x] Cloudflare R2 (for media storage)
- [ ] Deployment platform (Vercel/Cloudflare/AWS/etc)

---

## 🚀 Deployment Platform Options

### Option 1: Vercel (Recommended for MVP)
**Pros**:
- Zero config for Next.js
- Automatic ISR support
- Global CDN
- Free tier generous
- GitHub integration
- Automatic previews
- Built-in analytics

**Cons**:
- Vendor lock-in
- Potential costs at scale

**Setup**:
```bash
# Install Vercel CLI
pnpm add -g vercel

# Deploy from apps/web
cd apps/web
vercel

# Set environment variables
vercel env add NEXT_PUBLIC_DIRECTUS_URL production
vercel env add NEXT_PUBLIC_SERVER_URL production
```

### Option 2: Cloudflare Pages
**Pros**:
- Free unlimited bandwidth
- Already using R2
- Fast global CDN
- Good DX

**Cons**:
- More complex ISR setup
- Requires @opennextjs/cloudflare adapter

**Setup**:
Already has `@opennextjs/cloudflare` in package.json

### Option 3: Self-Hosted (AWS/DO/etc)
**Pros**:
- Full control
- No vendor lock-in

**Cons**:
- More DevOps work
- Need to manage infrastructure

---

## ✨ Pre-Deployment Tasks (CHRONOS-374)

### Code Quality
- [ ] Remove all `console.log` statements
- [ ] Remove debug code and commented code
- [ ] Ensure consistent error handling
- [ ] Validate all TypeScript types are correct
- [ ] Run ESLint and fix warnings

### Performance
- [ ] Verify ISR cache times are appropriate
- [ ] Ensure images use Next.js Image component
- [ ] Check bundle size (should be reasonable)
- [ ] Test page load times
- [ ] Verify API routes are optimized

### SEO
- [x] Metadata on all pages
- [ ] Verify Open Graph tags
- [ ] Add favicon
- [ ] Add robots.txt
- [ ] Add sitemap.xml
- [ ] Verify canonical URLs

### Accessibility
- [ ] Test keyboard navigation
- [ ] Verify ARIA labels
- [ ] Check color contrast ratios
- [ ] Test with screen reader

### Content
- [ ] Review all copy for typos
- [ ] Verify all links work
- [ ] Test all CTAs
- [ ] Ensure consistent tone/voice

### Forms
- [ ] Test waitlist form submission
- [ ] Verify validation works
- [ ] Check error messages
- [ ] Test success states
- [ ] Verify Directus receives submissions

### Cross-Browser Testing
- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)
- [ ] Mobile Safari
- [ ] Mobile Chrome

### Responsive Testing
- [ ] Mobile (320px+)
- [ ] Tablet (768px+)
- [ ] Desktop (1024px+)
- [ ] Large Desktop (1440px+)

---

## 📝 Deployment Steps

### 1. Final Code Review
```bash
# Ensure on develop branch
git checkout develop
git pull origin develop

# Verify build works
cd apps/web
pnpm install
pnpm build
```

### 2. Create Production Environment File
```bash
# apps/web/.env.production
cat > .env.production << EOF
NEXT_PUBLIC_SERVER_URL=https://chronos.ai
NEXT_PUBLIC_DIRECTUS_URL=https://admin.automatonicai.com
EOF
```

### 3. Deploy to Platform
**Vercel**:
```bash
cd apps/web
vercel --prod
```

**Cloudflare Pages**:
```bash
# Configure wrangler.toml if needed
pnpm dlx wrangler pages deploy
```

### 4. Post-Deployment Verification
- [ ] Visit production URL
- [ ] Test all page loads
- [ ] Submit test waitlist entry
- [ ] Verify Directus content displays
- [ ] Check browser console for errors
- [ ] Test all navigation links
- [ ] Verify mobile responsiveness

### 5. DNS Configuration (if needed)
```
# Point custom domain to deployment platform
Type: CNAME
Name: www
Value: <deployment-platform-url>

Type: A (or ALIAS)
Name: @
Value: <deployment-platform-ip>
```

---

## 🔍 Monitoring & Analytics

### Post-Launch Monitoring
- [ ] Set up Sentry for error tracking
- [ ] Configure Google Analytics (optional)
- [ ] Monitor Directus API response times
- [ ] Track waitlist submissions
- [ ] Monitor page load performance

### Success Metrics
- [ ] Homepage loads < 2s
- [ ] All pages achieve Lighthouse score > 90
- [ ] Zero critical errors in Sentry
- [ ] Waitlist form conversion > 5%

---

## 🎯 MVP vs Future Enhancements

### MVP (Now)
- [x] Three core pages (Home, Features, About)
- [x] Waitlist form
- [x] CMS integration
- [x] Responsive design
- [ ] Production deployment

### Future (Post-MVP)
- [ ] Blog functionality (already have CMS tables)
- [ ] Documentation pages
- [ ] Customer testimonials
- [ ] Video content
- [ ] Analytics dashboard
- [ ] A/B testing
- [ ] Email marketing integration

---

## 📊 Deployment Checklist Summary

### Critical (Must Have)
- [ ] Directus content populated
- [ ] Environment variables set
- [ ] Build verified successful
- [ ] Directus permissions configured
- [ ] Waitlist form tested

### Important (Should Have)
- [ ] Hero illustration added
- [ ] SEO files created (robots.txt, sitemap)
- [ ] Favicon added
- [ ] Cross-browser tested
- [ ] Performance verified

### Nice to Have
- [ ] Team photos added
- [ ] Feature screenshots added
- [ ] Analytics configured
- [ ] Error monitoring set up

---

## 🚀 Ready to Deploy?

**Before proceeding with CHRONOS-374 polish work, verify**:
1. ✅ Do you have content ready for Directus?
2. ✅ Which deployment platform do you want to use?
3. ✅ Do you have a custom domain ready?
4. ✅ Are there any must-have items missing from above?

**Next Steps**: Once you confirm the above, we'll proceed with CHRONOS-374 polish tasks to make everything production-ready!

---

*Generated for CHRONOS-374 - Polish, optimize, and deploy*
