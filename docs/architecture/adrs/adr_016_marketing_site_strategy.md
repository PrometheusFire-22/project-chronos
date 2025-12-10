# ADR-016: Marketing Site Strategy & Implementation

**Status:** Accepted
**Date:** 2025-12-08
**Decision Makers:** Geoff Bevans
**Related Epic:** CHRONOS-280
**Related ADRs:** ADR-012 (Frontend Stack), ADR-015 (Supporting Tools)

---

## Context

Project Chronos requires a marketing web presence **before** the product MVP is complete. The goal is to:

1. **Build Credibility**: Establish brand and thought leadership while product is under development
2. **Capture Leads**: Collect early access signups (email waitlist)
3. **Validate Messaging**: Test value proposition with target market (PE/VC/IB professionals)
4. **SEO Foundation**: Begin ranking for key terms (6-12 month lead time for organic search)
5. **Investor Readiness**: Professional web presence for fundraising conversations

**Key Constraint**: Solo founder with limited design resources, prioritizing speed-to-market over pixel-perfection.

**Timeline**: Full-time dedication (40 hours/week) for 2-week sprint to MVP launch.

---

## Decision

We will build a **static marketing site (SSG)** using Next.js 14+ with these characteristics:

### Site Architecture

**Pages** (MVP - Sprint 10):
1. **Homepage**: Hero + value prop + features preview + CTA
2. **Features**: Deep dive on multi-modal database capabilities
3. **About**: Founder story + technical credibility
4. **Contact/Waitlist**: Early access signup form

**Pages** (Post-MVP - Sprint 11+):
5. **Blog**: Technical content marketing (Payload CMS-powered)
6. **Pricing**: Full pricing page (deferred until product exists)
7. **Resources**: Case studies, whitepapers, documentation

### Visual Identity

**Brand Colors** (per Brand Guidelines):
- Primary: Purple (#8B5CF6) - sophistication, innovation
- Accent: Teal (#06B6D4) - CTAs, interactivity
- Success: Green (#10B981) - geospatial references
- Ocean: Blue (#0EA5E9) - geospatial water (optional)

**Typography**:
- Primary: Poppins (all weights)
- Monospace: JetBrains Mono (code blocks)

**Logo**:
- Graph-based lettermark forming "A"
- 5 nodes, 5 edges, gradient colors
- Static SVG for MVP (animated version post-launch)

### Content Strategy

**Target Persona**: Partners/Principals at PE/VC/IB firms (40-55 years old, relationship-focused, efficiency-driven)

**Core Value Proposition**:
> "Unlike Salesforce/HubSpot which only show surface-level contact relationships, Project Chronos reveals **multi-hop connection strength** and **weak tie networks** using graph database technology, enabling PE/VC/IB professionals to identify hidden co-investment opportunities, board network effects, and warm introduction paths."

**Key Differentiators** (to communicate):
1. **Graph-Native Intelligence**: Apache AGE for relationship traversal
2. **Vector Semantic Search**: pgvector for deal/company matching
3. **Geospatial Context**: PostGIS for regional market analysis
4. **Time-Series Analytics**: TimescaleDB for relationship evolution tracking

**Tone**:
- Intelligent but clear (explain complexity simply)
- Confident without hyperbole
- Technical credibility first (not salesy)

### Technical Implementation

**Framework**: Next.js 14+ (App Router)
- Static Site Generation (SSG) for all pages
- Deploy to Vercel (free tier initially)
- Edge CDN for global performance

**Component Library**: shadcn/ui
- Accessible, customizable components
- Built on Radix UI primitives
- Tailwind CSS styling

**Animations**: Framer Motion
- Hero fade-ins
- Scroll-triggered reveals
- Hover effects on CTAs
- Subtle, purposeful (not distracting)

**Forms**: React Hook Form + Resend
- Waitlist signup captures email
- Sends welcome email via Resend
- Stores leads in database (future: HubSpot integration)

**Analytics**: Decision deferred to post-MVP
- No analytics implemented for MVP launch
- Will evaluate options (GA4, Plausible, PostHog, etc.) after initial launch
- Focus on shipping first, measuring later

### Visualization Strategy

**MVP Approach** (Ship Fast):
- Clean gradient backgrounds (purple → teal → green)
- SVG geometric shapes and abstract visualizations
- Static graph network diagrams (SVG)
- Placeholder visualizations where needed

**Post-MVP Enhancements** (Iterative):
- Code-generated graph visualizations (D3.js, force-directed layouts)
- Interactive vector space diagrams (canvas/WebGL)
- Geospatial map overlays (Leaflet/Mapbox)
- Animated time-series charts (Recharts with Framer Motion)

**Rationale**: Launch with "good enough" visuals, upgrade iteratively. Avoid perfectionism paralysis.

---

## Implementation Plan (Sprint Breakdown)

### Sprint 10: Foundation & MVP (2 weeks, 80 hours)

**Epic**: CHRONOS-280 - Marketing Site Development

#### Week 1: Planning & Content (40 hours)

**Story 1**: Brand & Content Foundation (CHRONOS-281)
- **Tasks**:
  - Create brand guidelines document ✅
  - Write sitemap and information architecture
  - Draft homepage copy (hero, features, CTA)
  - Draft features page copy (graph, vector, geospatial, time-series)
  - Draft about page copy
- **Estimate**: 16 hours
- **Deliverable**: Complete content ready for implementation (initially hardcoded, migrate to Payload CMS post-MVP)

**Story 2**: Logo & Visual Assets (CHRONOS-282)
- **Tasks**:
  - Design logo concept (5-node graph forming "A")
  - Create SVG logo (primary gradient)
  - Create monochrome variants (dark/light)
  - Generate favicon (32x32, 64x64, SVG)
  - Create OpenGraph image (social sharing)
- **Estimate**: 12 hours
- **Deliverable**: Logo files in `/public/brand/`

**Story 3**: Initial Visualizations (CHRONOS-283)
- **Tasks**:
  - Create hero background (gradient + geometric shapes)
  - Design 4 feature graphics (SVG placeholders)
  - Create simple graph network diagram (static SVG)
- **Estimate**: 12 hours
- **Deliverable**: SVG/PNG files in `/public/images/`

#### Week 2: Development & Launch (40 hours)

**Story 4**: Next.js Project Setup (CHRONOS-284)
- **Tasks**:
  - Initialize Next.js 14 project with TypeScript
  - Configure Tailwind CSS
  - Install shadcn/ui components
  - Install Framer Motion
  - Set up project structure (`/app`, `/components`, `/lib`)
  - Configure environment variables
- **Estimate**: 4 hours
- **Deliverable**: Working Next.js dev server

**Story 5**: Layout & Navigation (CHRONOS-285)
- **Tasks**:
  - Build Header component (logo, nav, CTA button)
  - Build Footer component (links, social, copyright)
  - Implement mobile navigation (hamburger menu)
  - Add route transitions (Framer Motion)
- **Estimate**: 8 hours
- **Deliverable**: Reusable layout components

**Story 6**: Homepage Development (CHRONOS-286)
- **Tasks**:
  - Build Hero section (headline, subheadline, CTA, background)
  - Build Features preview (3-4 cards with icons)
  - Build Social proof section (founder credibility, tech stack)
  - Build Final CTA section
  - Implement scroll animations (Framer Motion)
- **Estimate**: 12 hours
- **Deliverable**: Complete homepage

**Story 7**: Features Page (CHRONOS-287)
- **Tasks**:
  - Build section for Graph Database capabilities
  - Build section for Vector Search capabilities
  - Build section for Geospatial capabilities
  - Build section for Time-Series capabilities
  - Add comparison table (vs. traditional CRM)
- **Estimate**: 8 hours
- **Deliverable**: Complete features page

**Story 8**: About Page (CHRONOS-288)
- **Tasks**:
  - Build founder section (photo, bio, credibility)
  - Build mission/vision section
  - Build "Why I Built This" section
- **Estimate**: 4 hours
- **Deliverable**: Complete about page

**Story 9**: Waitlist Form (CHRONOS-289)
- **Tasks**:
  - Build contact form component (React Hook Form)
  - Integrate Resend email service
  - Create welcome email template (React Email)
  - Add success/error states
  - Test email delivery
- **Estimate**: 6 hours
- **Deliverable**: Working waitlist signup

**Story 10**: SEO & Performance (CHRONOS-290)
- **Tasks**:
  - Add meta tags (title, description, OG tags) to all pages
  - Generate sitemap.xml
  - Create robots.txt
  - Optimize images (next/image)
  - Run Lighthouse audit (target >90)
  - Fix accessibility issues
- **Estimate**: 4 hours
- **Deliverable**: SEO-optimized site

**Story 11**: Deployment (CHRONOS-291)
- **Tasks**:
  - Connect GitHub repo to Vercel
  - Configure custom domain (automatonicai.com)
  - Set up environment variables in Vercel
  - Deploy to production
  - Test all forms and links
- **Estimate**: 2 hours
- **Deliverable**: Live marketing site at automatonicai.com

---

### Sprint 11: Enhancements & Blog (1 week, 40 hours) - POST-MVP

**Story 12**: Blog System Setup with Payload CMS (CHRONOS-292)
- **Tasks**:
  - Install and configure Payload CMS
  - Create blog post collection schema
  - Build blog index and detail pages
  - Add syntax highlighting for code blocks
  - Configure rich text editor
  - Create RSS feed
- **Estimate**: 12 hours

**Story 13**: Initial Blog Content (CHRONOS-293)
- **Tasks**:
  - Write post: "Why Graph Databases Transform Relationship Intelligence"
  - Write post: "The Multi-Hop Connection Problem in PE/VC"
  - Write post: "How We Use Apache AGE for Warm Introductions"
  - Add author bio and social links
- **Estimate**: 12 hours

**Story 14**: Enhanced Visualizations (CHRONOS-294)
- **Tasks**:
  - Create interactive graph network (D3.js force layout)
  - Add hover interactions
  - Optimize for mobile
  - Add loading states
- **Estimate**: 16 hours

**Story 15**: Analytics & Tracking (CHRONOS-295) - DEFERRED
- **Status**: Not implementing for MVP - decision deferred to post-launch
- **Rationale**: Focus on shipping and collecting emails first, measure later
- **Future Tasks** (when needed):
  - Evaluate analytics options (GA4, Plausible, PostHog, etc.)
  - Set up conversion goals (waitlist signup)
  - Add pageview tracking
  - Create dashboard for monitoring

---

### Sprint 12+: Future Enhancements - DEFERRED

**Story 16**: Pricing Page (CHRONOS-296)
- Defer until product exists
- Show pricing tiers, feature comparison, FAQ

**Story 17**: Integrations Page (CHRONOS-297)
- Show real and aspirational integrations
- Badge system ("Available Now" vs "Coming Soon")

**Story 18**: Case Studies (CHRONOS-298)
- Requires real customers
- Defer to post-launch

**Story 19**: Interactive Logo (CHRONOS-299)
- Mouse-responsive animation
- Canvas/WebGL implementation
- Performance optimization

**Story 20**: Dark Mode (CHRONOS-300)
- Full dark mode support
- Toggle component
- Persist user preference

---

## Success Metrics

### MVP Launch Criteria (Sprint 10 Complete)

- [ ] Homepage live at automatonicai.com
- [ ] Lighthouse score >90 (Performance, SEO, Accessibility)
- [ ] Waitlist form functional (email delivery confirmed)
- [ ] Mobile-responsive (tested on iOS and Android)
- [ ] All links working (no 404s)
- [ ] Meta tags and OG image set
- [~] Analytics tracking (deferred to post-MVP)

### Post-MVP Goals (Sprint 11+)

- [ ] 3+ blog posts published
- [ ] 50+ waitlist signups
- [ ] Organic search traffic (track keywords)
- [ ] 0 critical accessibility issues (WCAG AA)
- [ ] <2s page load time (p95)

---

## Key Decisions

### What We're NOT Doing (Scope Control)

**Not in MVP**:
- ❌ Pricing page (product doesn't exist yet)
- ❌ Customer testimonials (no customers yet)
- ❌ Video demos (defer to post-product launch)
- ❌ Live chat widget (no one to respond yet)
- ❌ Multi-language support (English only for now)
- ❌ Complex animations (static SVG logos, not WebGL)
- ✅ CMS integration (Payload CMS for blog and future content)

**Why**: Focus on shipping, not perfecting. Iterate based on user feedback.

### Design Philosophy

**Principle**: **Code-First, Skip Figma**

**Rationale**:
- Faster iteration for solo developer
- Component libraries (shadcn/ui) provide design system
- Can export to Figma later if needed (Figma has HTML import plugins)
- Tailwind CSS makes styling fast and consistent

**Process**:
1. Write copy first (hardcoded for MVP, Payload CMS post-launch for blog)
2. Build in browser with Tailwind
3. Refine visually using dev tools
4. Extract reusable components
5. Polish animations last

### Content Versioning

**All marketing copy stored in Git**:
- `docs/marketing/copy/homepage.md`
- `docs/marketing/copy/features.md`
- `docs/marketing/copy/about.md`

**Rationale**:
- Version control for content (see changes over time)
- LLM context injection (provide copy for future AI assistance)
- Sync to Confluence for stakeholder review
- Single source of truth

---

## Risk Mitigation

| Risk | Impact | Likelihood | Mitigation |
|------|--------|------------|------------|
| **Logo design takes too long** | High | Medium | Use placeholder text logo initially, iterate post-launch |
| **Visualizations too complex** | Medium | High | Ship with gradients/SVG placeholders, upgrade iteratively |
| **Copy not compelling** | High | Medium | Get feedback from 3-5 target personas before launch |
| **Vercel free tier limits** | Low | Low | Monitor bandwidth; upgrade to Pro ($20/mo) if needed |
| **SEO takes 6+ months** | Medium | High | Focus on content marketing, LinkedIn sharing for initial traffic |
| **No early signups** | High | Medium | Outreach to personal network, share on LinkedIn/Twitter |

---

## Integration with Existing Workflows

### Git Workflow

**Branch Structure**:
- `main` - Production (deployed to Vercel)
- `develop` - Staging (auto-deploy to Vercel preview)
- `feature/marketing-homepage` - Feature branches

**Commit Convention**:
```
feat(marketing): add hero section to homepage
docs(marketing): update brand guidelines with logo specs
fix(marketing): resolve mobile nav overflow issue
```

### Jira Workflow

**Epic**: CHRONOS-280 (Marketing Site Development)
**Stories**: CHRONOS-281 through CHRONOS-291 (Sprint 10)
**Status Flow**: To Do → In Progress → In Review → Done

**Definition of Done**:
- Code merged to `develop`
- Lighthouse score >90
- Responsive on mobile/tablet/desktop
- Peer reviewed (or AI-reviewed if solo)
- Documentation updated (if applicable)

### Confluence Sync

**Documents to Sync**:
- `docs/marketing/brand_guidelines.md` → Confluence
- `docs/architecture/adrs/adr_016_marketing_site_strategy.md` → Confluence
- `docs/marketing/copy/*.md` → Confluence (for review)

**Sync Frequency**: After each story completion

---

## Technical Architecture

### File Structure

```
/project-chronos-marketing/
├── app/
│   ├── page.tsx                 # Homepage
│   ├── features/page.tsx        # Features page
│   ├── about/page.tsx           # About page
│   ├── contact/page.tsx         # Waitlist form
│   ├── blog/
│   │   ├── page.tsx             # Blog index
│   │   └── [slug]/page.tsx      # Blog post
│   ├── layout.tsx               # Root layout
│   └── globals.css              # Global styles
├── components/
│   ├── ui/                      # shadcn components
│   ├── layout/
│   │   ├── Header.tsx
│   │   ├── Footer.tsx
│   │   └── MobileNav.tsx
│   ├── sections/
│   │   ├── HeroSection.tsx
│   │   ├── FeaturesPreview.tsx
│   │   ├── SocialProof.tsx
│   │   └── CTASection.tsx
│   └── forms/
│       └── WaitlistForm.tsx
├── lib/
│   ├── email.ts                 # Resend integration
│   └── payload.ts               # Payload CMS client
├── public/
│   ├── brand/
│   │   ├── logo-primary.svg
│   │   ├── logo-monochrome-dark.svg
│   │   └── favicon.ico
│   └── images/
│       ├── hero-background.svg
│       └── feature-*.svg
└── content/
    └── blog/
        └── *.mdx                # Blog posts
```

### Environment Variables

```bash
# .env.local
RESEND_API_KEY=re_xxx
NEXT_PUBLIC_PLAUSIBLE_DOMAIN=automatonicai.com
```

---

## Documentation Requirements

**Create These Documents**:

1. ✅ `docs/marketing/brand_guidelines.md` (DONE)
2. ⏳ `docs/marketing/sitemap.md` (In Progress)
3. ⏳ `docs/marketing/copy/homepage.md` (Next)
4. ⏳ `docs/marketing/copy/features.md` (Next)
5. ⏳ `docs/marketing/copy/about.md` (Next)
6. ⏳ `docs/marketing/seo_strategy.md` (Sprint 10)
7. ⏳ `docs/marketing/analytics_plan.md` (Sprint 11)

**Sync All to Confluence**: Yes (after each completion)

---

## References

- [Next.js App Router Documentation](https://nextjs.org/docs/app)
- [shadcn/ui Component Library](https://ui.shadcn.com)
- [Framer Motion Animation Guide](https://www.framer.com/motion/)
- [Plausible Analytics Setup](https://plausible.io/docs)
- [Resend Email API](https://resend.com/docs)

---

## Approval & Sign-Off

**Decision Maker**: Geoff Bevans
**Date**: 2025-12-08
**Status**: Approved ✅

**Next Actions**:
1. Create Jira stories CHRONOS-281 through CHRONOS-291
2. Begin Story 1 (Brand & Content Foundation)
3. Upload website inspiration samples (Google Doc PDF)
4. Upload resume for credibility section

---

**Maintained in Git**: `docs/architecture/adrs/adr_016_marketing_site_strategy.md`
**Synced to Confluence**: Pending (will sync after completion)
**Epic**: CHRONOS-280
