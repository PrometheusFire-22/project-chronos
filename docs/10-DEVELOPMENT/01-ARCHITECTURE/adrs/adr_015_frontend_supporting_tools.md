# ADR-015: Frontend Supporting Tools and Libraries

**Status:** Accepted
**Date:** 2025-12-07
**Decision Makers:** Geoff Bevans
**Related ADRs:** ADR-012 (Frontend Stack Architecture)
**Context:** Marketing Site Development (Sprint 10)

---

## Context

With Next.js, TypeScript, Tailwind CSS, and shadcn/ui selected as our core frontend stack (ADR-012), we need to choose supporting tools for:

1. **Animations** - Smooth,professional interactions and micro-animations
2. **Content Management** - Blog posts and marketing content with CMS
3. **Email** - Transactional emails and lead nurturing

These decisions must align with our principles:
- **Developer Experience**: Modern,well-documented tools
- **Privacy-First**: GDPR-compliant, respectful of user data
- **Cost-Effective**: Free tiers that scale affordably
- **Type Safety**: TypeScript support where applicable
- **Performance**: Minimal bundle size impact

---

## Decisions

### Animation Library: **Framer Motion**

**Chosen**: Framer Motion
**Alternatives Considered**: React Spring, GSAP, Pure CSS

| Criterion | Framer Motion | React Spring | GSAP | Pure CSS |
|-----------|---------------|--------------|------|----------|
| **React Integration** | Excellent (declarative) | Good (hook-based) | Requires wrapper | N/A |
| **Bundle Size** | 29KB gzipped | 26KB gzipped | 42KB gzipped | 0KB |
| **Learning Curve** | Low (JSX-like) | Moderate | Steep | Low |
| **TypeScript Support** | Excellent | Good | Fair | N/A |
| **Animation Features** | Gestures, variants, SVG | Physics-based | Professional-grade | Limited |
| **Performance** | Excellent (GPU-accelerated) | Excellent | Excellent | Good |
| **Documentation** | Excellent | Good | Excellent | N/A |
| **Cost** | Free | Free | Free (most features) | Free |

**Decision Rationale**:

Framer Motion provides the best **declarative API** for React developers, making animations feel natural in JSX:

```tsx
// Framer Motion Example - Intuitive and readable
<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.5 }}
>
  Content
</motion.div>

// vs. React Spring - More imperative
const springs = useSpring({
  from: { opacity: 0, y: 20 },
  to: { opacity: 1, y: 0 },
})
return <animated.div style={springs}>Content</animated.div>
```

**Key Advantages**:
1. **Variants System**: Define animation states as named variants, reusable across components
2. **Gesture Support**: Built-in drag, tap, hover interactions
3. **SVG Animations**: Easy path animations for icons and illustrations
4. **Exit Animations**: Handles component unmounting smoothly
5. **TypeScript**: Full type safety out of the box

**Use Cases in Project Chronos**:
- Hero section fade-in on landing page
- Smooth transitions between marketing pages
- Hover effects on CTA buttons
- Loading skeletons and progress indicators
- Mobile menu slide-in animations

**Bundle Size Justification**: 29KB is acceptable for the marketing site given the polish it provides. For the client portal (Phase 2), we'll lazy-load Framer Motion only where needed.

---

### Content Management: **Payload CMS**

**Chosen**: Payload CMS
**Alternatives Considered**: MDX, Pure Markdown, Notion API

| Criterion | Payload CMS | MDX | Pure Markdown | Notion API |
|-----------|-------------|-----|---------------|------------|
| **Content Editing** | WYSIWYG + Rich Text | Code editor | Code editor | WYSIWYG |
| **TypeScript Support** | Excellent | Excellent | N/A | Poor |
| **Version Control** | Database + API | Git-friendly | Git-friendly | API-dependent |
| **Developer Experience** | Excellent | Excellent | Good | Poor (rate limits) |
| **Non-Technical Editing** | Yes (WYSIWYG) | No (code) | No (code) | Yes |
| **Rapid Iteration** | Excellent | Good | Good | Fair |
| **Performance** | Excellent (SSG via API) | Excellent (SSG) | Excellent | Fair (API calls) |
| **SEO** | Excellent | Excellent | Excellent | Good |
| **Cost** | Free (self-hosted) | Free | Free | $10/user/month |
| **PostgreSQL Integration** | Native | N/A | N/A | N/A |

**Decision Rationale**:

Payload CMS allows us to **rapidly iterate on blog content and marketing pages** while maintaining type safety and excellent developer experience. Since we already have PostgreSQL infrastructure, integration is seamless.

**Key Advantages**:
1. **Rapid Content Iteration**: WYSIWYG editor enables quick blog post creation for thought leadership and SEO
2. **PostgreSQL Native**: Points directly to existing database - just adds a new table
3. **Type Safety**: Auto-generates TypeScript types from collections
4. **Admin UI**: Built-in `/admin` interface for content management
5. **API-First**: RESTful and GraphQL APIs for fetching content in Next.js
6. **Vercel Compatible**: Next.js API routes work seamlessly on Vercel
7. **Flexible**: Can still embed React components via custom fields

**Why Payload CMS vs. MDX**:
- **Need**: Building FastAPI views and dynamic rendering alongside marketing site
- **Goal**: Quickly iterate on blog content for thought leadership, reputation building, and SEO
- **Context**: Already have PostgreSQL setup in AWS - simple integration
- **Timeline**: Only 2-4 days more than hardcoded approach
- **Best Practice**: Establish best-in-class CMS early rather than migrate later

**Why NOT MDX**:
- Requires code editor for every content change
- Slower iteration cycle (edit file → commit → deploy)
- Non-technical stakeholders can't contribute
- No built-in media management

**Why NOT Notion API**:
- Rate limits (3 requests/second)
- API dependency (slower, potential downtime)
- Poor TypeScript support
- Monthly cost per user

**Use Cases in Project Chronos**:
- Blog posts for thought leadership and SEO
- Case studies and customer stories
- Product updates and announcements
- Future: landing page variants, A/B testing content

**Implementation**:
```bash
pnpm add payload @payloadcms/db-postgres
```

```typescript
// payload.config.ts
import { buildConfig } from 'payload/config'
import { postgresAdapter } from '@payloadcms/db-postgres'

export default buildConfig({
  collections: [
    {
      slug: 'posts',
      fields: [
        { name: 'title', type: 'text', required: true },
        { name: 'slug', type: 'text', required: true },
        { name: 'content', type: 'richText', required: true },
        { name: 'publishedAt', type: 'date' },
      ],
    },
  ],
  db: postgresAdapter({
    pool: {
      connectionString: process.env.DATABASE_URL,
    },
  }),
})
```

---

### Analytics Platform: **Decision Deferred to Post-MVP**

**Status**: NOT IMPLEMENTED FOR MVP
**Decision Date**: 2025-12-10

**Rationale**:

No analytics will be implemented for the MVP launch. This decision reflects:

1. **Focus on Shipping**: Priority is launching and collecting emails, not measuring traffic
2. **Cost Control**: Avoid adding to cost structure before product-market fit
3. **Premature Optimization**: Don't need analytics before we have meaningful traffic
4. **Post-Launch Evaluation**: Will assess options after initial launch based on actual needs

**Future Options to Evaluate** (post-MVP):

| Option | Use Case | Pros | Cons |
|--------|----------|------|------|
| **Google Analytics 4** | Marketing site | Free, comprehensive, industry standard | Privacy concerns, complex setup |
| **Plausible Analytics** | Marketing site | Privacy-first, simple, lightweight (<1KB) | Paid ($9+/month), limited features |
| **PostHog** | Product analytics | Comprehensive, self-hostable, feature flags | Complex, 45KB bundle, overkill for marketing |
| **Simple Analytics** | Marketing site | Privacy-first, cookieless | Paid, limited features |

**When to Revisit**:
- Post-MVP launch (after collecting initial signups)
- When we need to understand traffic sources
- When we want to track conversion goals (waitlist signups)
- When we have budget for analytics tooling

**Implementation**: None for MVP

---

### Email Service: **Resend**

**Chosen**: Resend
**Alternative Considered**: SendGrid

| Criterion | Resend | SendGrid |
|-----------|--------|----------|
| **Primary Focus** | Developer experience | Enterprise email delivery |
| **Developer Experience** | Excellent (modern, clean API) | Good (comprehensive but older) |
| **React Email Support** | Native (built React Email framework) | No (HTML templates) |
| **Documentation** | Excellent (clear, concise) | Good (comprehensive but verbose) |
| **API Design** | Modern (RESTful, intuitive) | Older (more complex) |
| **TypeScript Support** | Excellent (first-class) | Fair (community types) |
| **Onboarding** | Fastest, most beginner-friendly | Straightforward but more complex |
| **Free Tier** | 100 emails/day initially (3,000/month) | 100 emails/day for 60 days |
| **Paid Tier** | Starts at $20/month (50,000 emails) | Essentials: $19.95/month (50,000 emails) |
| **Deliverability** | Excellent (newer, less mature) | Excellent (battle-tested) |
| **Analytics** | Basic (opens, clicks, bounces) | Comprehensive (advanced reporting) |
| **Templates** | React Email (JSX/TSX) | HTML/CSS (Handlebars) |
| **Use Case Fit** | Startups, modern dev teams | Large enterprises, high volume |

**Decision Rationale**:

**Resend** is the clear choice for Project Chronos because:

1. **React Email Integration**: Resend created and maintains React Email, allowing us to build email templates using React components:

```tsx
// emails/WelcomeEmail.tsx
import { Html, Head, Body, Container, Heading, Text, Button } from '@react-email/components'

export default function WelcomeEmail({ name }: { name: string }) {
  return (
    <Html>
      <Head />
      <Body>
        <Container>
          <Heading>Welcome to Project Chronos, {name}!</Heading>
          <Text>We're excited to help you track your relationships.</Text>
          <Button href="https://chronos.ai/portal/login">
            Get Started
          </Button>
        </Container>
      </Body>
    </Html>
  )
}
```

```typescript
// Send email with Resend
import { Resend } from 'resend'
import WelcomeEmail from './emails/WelcomeEmail'

const resend = new Resend(process.env.RESEND_API_KEY)

await resend.emails.send({
  from: 'geoff@automatonicai.com',
  to: 'user@example.com',
  subject: 'Welcome to Chronos',
  react: <WelcomeEmail name="John" />,
})
```

2. **Developer Experience**: API is clean, modern, and intuitive:
   - SendGrid: More verbose, older API design
   - Resend: "Most beginner-friendly onboarding flow" and "most seamless campaign creation"

3. **TypeScript-First**: Full type safety for email templates and API calls
   - No need for HTML strings or Handlebars templates
   - Type-check email content at build time

4. **Next.js Alignment**: Resend is built by the same community that values modern DX (Vercel ecosystem)
   - Seamless integration with our Next.js stack
   - Same philosophy: developer experience + performance

5. **Cost-Effective**: $20/month for 50,000 emails vs. SendGrid's $19.95 (nearly identical)
   - Resend provides better DX for the same price

**Why NOT SendGrid**:
- HTML/CSS templates are painful to maintain
- Handlebars syntax is error-prone and not type-safe
- Older API design feels dated compared to Resend
- No native React support (have to render HTML strings manually)

**When to Reconsider SendGrid**:
- Sending >500,000 emails/month (SendGrid's scale is proven)
- Need advanced deliverability features (dedicated IPs, domain warm-up)
- Require extensive analytics and reporting
- Enterprise compliance requirements

**Use Cases in Project Chronos**:
- **Phase 1 (Marketing Site)**:
  - Contact form submissions → Thank you email
  - Blog subscription → Welcome email + new post notifications
  - Lead nurturing sequence

- **Phase 2 (Client Portal)**:
  - Account creation → Welcome email
  - Password reset emails
  - Weekly/monthly report summaries
  - Alert emails (e.g., "New insight available")

**Implementation**:
```bash
pnpm add resend @react-email/components
```

```typescript
// lib/email.ts
import { Resend } from 'resend'

export const resend = new Resend(process.env.RESEND_API_KEY)

export async function sendWelcomeEmail(email: string, name: string) {
  await resend.emails.send({
    from: 'Geoff at Chronos <geoff@automatonicai.com>',
    to: email,
    subject: 'Welcome to Project Chronos',
    react: <WelcomeEmail name={name} />,
  })
}
```

**Sources**:
- [Resend vs SendGrid comparison](https://forwardemail.net/en/blog/resend-vs-sendgrid-email-service-comparison)
- [Email APIs in 2025](https://medium.com/@nermeennasim/email-apis-in-2025-sendgrid-vs-resend-vs-aws-ses-a-developers-journey-8db7b5545233)
- [Resend documentation](https://resend.com/docs)

---

## Summary Table

| Category | Tool | Key Reason |
|----------|------|------------|
| **Animations** | Framer Motion | Declarative API, excellent React integration, TypeScript support |
| **Content Management** | Payload CMS | Rapid iteration, PostgreSQL native, WYSIWYG + type safety |
| **Analytics** | TBD (deferred) | Decision deferred to post-MVP - focus on shipping first |
| **Email** | Resend | React Email support, modern DX, TypeScript-first |

---

## Implementation Timeline

### Sprint 10 (Marketing Site Development)

**Week 1**:
- Install Framer Motion, create animation component library
- Install and configure Payload CMS with PostgreSQL
- Set up Resend account, create welcome email template

**Week 2**:
- Implement hero section animations with Framer Motion
- Create blog post collection schema in Payload CMS
- Build blog index and detail pages
- Test contact form → Resend email flow

**Week 3**:
- Polish animations (hover effects, page transitions)
- Write initial blog posts via Payload CMS admin
- Configure rich text editor and syntax highlighting
- Implement lead nurture email sequence with Resend

### Future (Post-MVP)

**Analytics Decision** (when ready):
- Evaluate options: GA4, Plausible, PostHog, Simple Analytics
- Consider privacy requirements, cost, and feature needs
- Implement chosen solution based on actual traffic patterns

---

## Cost Projections

### MVP (Marketing Site)

| Service | Tier | Monthly Cost |
|---------|------|--------------|
| **Resend** | Free tier initially (100/day) | $0 |
| **Payload CMS** | Self-hosted on PostgreSQL | $0 |
| **Framer Motion** | Free | $0 |
| **Analytics** | None (deferred) | $0 |
| **Total** | | **$0/month** |

**Note**: Once email volume exceeds free tier (3,000/month), Resend costs $20/month.

### Future (Post-MVP)

| Service | Tier | Monthly Cost |
|---------|------|--------------|
| **Resend** | 50K emails | $20 |
| **Payload CMS** | Self-hosted on PostgreSQL | $0 |
| **Framer Motion** | Free | $0 |
| **Analytics** | TBD (GA4 free, or Plausible $9+) | $0-$9+ |
| **Total** | | **$20-$29+/month** |

---

## Risks and Mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| **Resend deliverability issues** | Low | Medium | Monitor bounce rates; can switch to SendGrid if needed |
| **Framer Motion bundle size** | Low | Low | Lazy-load animations; use CSS for simple transitions |
| **Payload CMS learning curve** | Low | Low | Excellent documentation; simple PostgreSQL integration |
| **No analytics visibility** | Medium | Low | Acceptable for MVP; add post-launch when needed |

---

## Decision Log

| Date | Decision | Rationale |
|------|----------|-----------|
| 2025-12-07 | Choose Framer Motion over React Spring | Better declarative API, excellent docs |
| 2025-12-07 | Choose Resend over SendGrid | React Email support, modern DX |
| 2025-12-10 | Choose Payload CMS over MDX | Rapid iteration, PostgreSQL native, best-in-class CMS early |
| 2025-12-10 | Defer analytics decision to post-MVP | Focus on shipping first, measure later |

---

## References

- [Framer Motion Documentation](https://www.framer.com/motion/)
- [Payload CMS Documentation](https://payloadcms.com/docs)
- [Resend Documentation](https://resend.com/docs)
- [React Email Documentation](https://react.email/)
- Resend vs SendGrid comparison: https://forwardemail.net/en/blog/resend-vs-sendgrid-email-service-comparison

---

## Implementation Status

> **Last Updated:** 2025-12-12 (Sprint 10)

### ✅ Implemented

**Framer Motion** (Sprint 10)
- Installed: `framer-motion@^11.15.0`
- Configured in `apps/web/package.json`
- Ready for use in components
- See [FRONTEND_DEVELOPMENT.md](../../guides/development/FRONTEND_DEVELOPMENT.md#animations-with-framer-motion) for usage patterns

### 🔜 Deferred to Sprint 11

**Payload CMS**
- Deferred to Sprint 11 (Payload CMS Integration)
- Will be self-hosted alongside FastAPI backend
- Database: PostgreSQL (shared with backend)

**Resend + React Email**
- Deferred to Sprint 11
- Will implement transactional emails (early access, password reset)
- React Email templates will be created in `apps/web/emails/`

### 📊 Analytics (Post-MVP)

Analytics deferred to post-MVP as per decision. Focus on shipping core functionality first.

---

## Conclusion

These supporting tools complement our core frontend stack (Next.js, TypeScript, Tailwind, shadcn/ui) by providing:

1. **Polished UX** - Framer Motion animations
2. **Rapid Content Management** - Payload CMS for blog and marketing pages
3. **Modern Email Experience** - Resend with React Email
4. **Analytics** - Deferred to post-MVP (focus on shipping first)

All tools prioritize **developer experience**, **type safety**, and **cost-effectiveness**, aligning with our solo founder constraints and technical philosophy.

Total MVP cost: **$0/month** (Resend free tier + self-hosted Payload CMS).

**Approved by:** Geoff Bevans
**Implementation Start:** Sprint 10
