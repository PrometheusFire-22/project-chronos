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
2. **Content Management** - Blog posts and marketing content in Markdown
3. **Analytics** - Privacy-friendly user behavior tracking
4. **Email** - Transactional emails and lead nurturing

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

### Content Format: **MDX (Markdown + JSX)**

**Chosen**: MDX
**Alternatives Considered**: Pure Markdown, Rich Text Editor (Payload CMS), Notion API

| Criterion | MDX | Pure Markdown | Rich Text (Payload) | Notion API |
|-----------|-----|---------------|---------------------|------------|
| **React Components** | Yes (native) | No | Limited | No |
| **TypeScript Support** | Excellent | N/A | Fair | Poor |
| **Version Control** | Git-friendly | Git-friendly | Database-stored | API-dependent |
| **Developer Experience** | Excellent | Good | Fair (WYSIWYG) | Poor (rate limits) |
| **Flexibility** | Very high | Low | Medium | Low |
| **Performance** | Excellent (SSG) | Excellent | Good | Fair (API calls) |
| **SEO** | Excellent | Excellent | Good | Good |
| **Cost** | Free | Free | Free (self-hosted) | $10/user/month |

**Decision Rationale**:

MDX allows us to **embed React components directly in Markdown**, enabling rich,interactive blog content without leaving the Markdown format:

```mdx
---
title: "Why Graph Databases Matter for Relationship Intelligence"
date: 2025-12-15
author: "Geoff Bevans"
---

# Why Graph Databases Matter

Traditional relational databases store relationships as foreign keys...

<InteractiveGraphDemo
  nodes={["Person A", "Person B", "Company C"]}
  edges={[{from: "Person A", to: "Person B", label: "knows"}]}
/>

As you can see in the interactive demo above, graph databases...

<CallToAction
  text="Try our beta"
  href="/signup"
/>
```

**Key Advantages**:
1. **Component Embedding**: Use custom React components (charts, demos, CTAs) in blog posts
2. **Type Safety**: TypeScript validates component props in Markdown
3. **Git-Friendly**: Store content as `.mdx` files, track changes with Git
4. **Fast Compilation**: Next.js compiles MDX to static HTML at build time
5. **SEO-Optimized**: Static HTML with proper meta tags and structured data

**vs. Pure Markdown**:
- Markdown requires HTML strings for complex content (messy)
- No type checking for embedded content
- Limited interactivity

**vs. Rich Text Editor (Payload CMS)**:
- WYSIWYG editors generate bloated HTML
- Harder to version control (stored in database)
- Less flexibility for custom components

**vs. Notion API**:
- Rate limits (3 requests/second)
- API dependency (slower, potential downtime)
- Poor TypeScript support
- Monthly cost per user

**Use Cases in Project Chronos**:
- Blog posts with embedded demos
- Case studies with interactive visualizations
- Documentation with code snippets and examples
- Landing pages with custom components

**Implementation**:
```bash
npm install @next/mdx @mdx-js/loader
```

```typescript
// next.config.js
const withMDX = require('@next/mdx')({
  extension: /\.mdx?$/,
})

module.exports = withMDX({
  pageExtensions: ['ts', 'tsx', 'js', 'jsx', 'md', 'mdx'],
})
```

---

### Analytics Platform: **Plausible Analytics**

**Chosen**: Plausible Analytics
**Alternative Considered**: PostHog

| Criterion | Plausible | PostHog |
|-----------|-----------|---------|
| **Primary Focus** | Web analytics | Product analytics (all-in-one) |
| **Privacy** | No PII, cookieless | GDPR-compliant, cookieless option |
| **Ease of Use** | Extremely simple | Complex (many features) |
| **Setup Time** | <5 minutes | ~30 minutes |
| **Dashboard** | Single, clean page | Multiple dashboards |
| **Page Load Impact** | <1KB script | ~45KB script |
| **Features** | Pageviews, goals, referrers | Session replay, feature flags, experiments, surveys |
| **Self-Hosting** | Yes (optional) | Yes (recommended) |
| **Pricing (1M pageviews)** | €69/month (~$71) | Free (1M events), then $0.00005/event |
| **TypeScript SDK** | No (simple script tag) | Yes |
| **Learning Curve** | Minimal | Moderate |
| **Use Case Fit** | Marketing site analytics | Product analytics for SaaS app |

**Decision Rationale**:

**For Phase 1 (Marketing Site)**: **Plausible Analytics** ✅

Plausible is the clear choice for our marketing site because:

1. **Simplicity**: Single dashboard shows all essential metrics (visitors, pageviews, bounce rate, referrers, countries)
2. **Privacy-First**: Collects zero PII, no cookies, GDPR/CCPA compliant by default
3. **Performance**: <1KB script loads asynchronously, zero impact on Core Web Vitals
4. **Cost-Effective**: $9/month for ≤10K pageviews (perfect for early-stage marketing site)
5. **Fast Setup**: Add one script tag, immediately see data

**Why NOT PostHog for Marketing Site**:
- Overkill for simple pageview tracking
- 45KB bundle size hurts performance
- Complex dashboard intimidating for marketing metrics
- Features like session replay, feature flags irrelevant for static marketing pages

**For Phase 2 (Client Portal)**: **PostHog** ✅

Once we launch the authenticated client portal, we'll ADD PostHog for:

1. **Product Analytics**: Track user journeys, feature usage, conversion funnels
2. **Session Replay**: Watch user sessions to identify UX issues
3. **Feature Flags**: A/B test new features with gradual rollouts
4. **Heatmaps**: Understand click patterns on dashboards
5. **Self-Hosting**: Full data control on our Lightsail instance

**Hybrid Approach**:
```
Marketing Site (chronos.ai)          → Plausible Analytics
Client Portal (chronos.ai/portal/*)  → PostHog (self-hosted)
```

**Implementation (Phase 1 - Plausible)**:
```html
<!-- Add to <head> in Next.js layout -->
<script defer data-domain="chronos.ai" src="https://plausible.io/js/script.js"></script>
```

**Implementation (Phase 2 - PostHog)**:
```typescript
// app/portal/layout.tsx
import posthog from 'posthog-js'

if (typeof window !== 'undefined') {
  posthog.init('YOUR_PROJECT_API_KEY', {
    api_host: 'https://posthog.chronos.ai', // Self-hosted
    autocapture: true,
  })
}
```

**Sources**:
- [PostHog vs Plausible comparison](https://posthog.com/blog/posthog-vs-plausible)
- [Plausible Analytics pricing](https://plausible.io/pricing)
- [PostHog pricing calculator](https://posthog.com/pricing)

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
npm install resend @react-email/components
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
| **Content** | MDX | Embed React components in Markdown, Git-friendly, type-safe |
| **Analytics (Marketing)** | Plausible | Privacy-first, simple, lightweight, perfect for marketing site |
| **Analytics (Product)** | PostHog | Comprehensive product analytics, self-hostable, feature flags |
| **Email** | Resend | React Email support, modern DX, TypeScript-first |

---

## Implementation Timeline

### Sprint 10 (Marketing Site Development)

**Week 1**:
- Install Framer Motion, create animation component library
- Set up MDX with Next.js, create first blog post template
- Add Plausible Analytics script tag
- Set up Resend account, create welcome email template

**Week 2**:
- Implement hero section animations with Framer Motion
- Write 2-3 blog posts in MDX with interactive components
- Verify Plausible tracking (test pageviews, goals)
- Test contact form → Resend email flow

**Week 3**:
- Polish animations (hover effects, page transitions)
- Publish 5+ blog posts via MDX
- Set up Plausible goals (newsletter signup, contact form)
- Implement lead nurture email sequence with Resend

### Sprint 12+ (Client Portal - PostHog Only)

**Add PostHog** when client portal goes live:
- Self-host PostHog on Lightsail (Docker container)
- Configure session replay, feature flags
- Track user journeys and conversion funnels
- Keep Plausible for marketing site analytics

---

## Cost Projections

### Phase 1 (Marketing Site)

| Service | Tier | Monthly Cost |
|---------|------|--------------|
| **Plausible Analytics** | 10K pageviews | $9 |
| **Resend** | 50K emails | $20 |
| **Framer Motion** | Free | $0 |
| **MDX** | Free | $0 |
| **Total** | | **$29/month** |

### Phase 2 (Client Portal Added)

| Service | Tier | Monthly Cost |
|---------|------|--------------|
| **Plausible Analytics** | 10K pageviews | $9 |
| **PostHog** | Self-hosted | $0 (on Lightsail) |
| **Resend** | 50K emails | $20 |
| **Framer Motion** | Free | $0 |
| **MDX** | Free | $0 |
| **Total** | | **$29/month** |

**Note**: PostHog self-hosted on existing Lightsail instance adds zero marginal cost.

---

## Risks and Mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| **Resend deliverability issues** | Low | Medium | Monitor bounce rates; can switch to SendGrid if needed |
| **Framer Motion bundle size** | Low | Low | Lazy-load animations; use CSS for simple transitions |
| **MDX complexity** | Low | Low | Fallback to pure Markdown; keep components simple |
| **Plausible data loss** | Very Low | Low | Export data monthly; analytics not mission-critical |
| **PostHog resource usage** | Medium | Medium | Monitor Lightsail CPU/RAM; can upgrade instance if needed |

---

## Decision Log

| Date | Decision | Rationale |
|------|----------|-----------|
| 2025-12-07 | Choose Framer Motion over React Spring | Better declarative API, excellent docs |
| 2025-12-07 | Choose MDX over Pure Markdown | React component embedding, type safety |
| 2025-12-07 | Choose Plausible for marketing analytics | Privacy-first, simple, lightweight |
| 2025-12-07 | Choose PostHog for product analytics | Comprehensive features, self-hostable |
| 2025-12-07 | Choose Resend over SendGrid | React Email support, modern DX |
| 2025-12-07 | Hybrid analytics (Plausible + PostHog) | Right tool for each use case |

---

## References

- [Framer Motion Documentation](https://www.framer.com/motion/)
- [MDX Documentation](https://mdxjs.com/)
- [Plausible Analytics](https://plausible.io/)
- [PostHog Documentation](https://posthog.com/docs)
- [Resend Documentation](https://resend.com/docs)
- [React Email Documentation](https://react.email/)
- PostHog vs Plausible comparison: https://posthog.com/blog/posthog-vs-plausible
- Resend vs SendGrid comparison: https://forwardemail.net/en/blog/resend-vs-sendgrid-email-service-comparison

---

## Conclusion

These supporting tools complement our core frontend stack (Next.js, TypeScript, Tailwind, shadcn/ui) by providing:

1. **Polished UX** - Framer Motion animations
2. **Flexible Content** - MDX for interactive blog posts
3. **Privacy-Friendly Analytics** - Plausible (marketing) + PostHog (product)
4. **Modern Email Experience** - Resend with React Email

All tools prioritize **developer experience**, **type safety**, and **cost-effectiveness**, aligning with our solo founder constraints and technical philosophy.

Total added cost: **$29/month** for comprehensive marketing site capabilities.

**Approved by:** Geoff Bevans
**Implementation Start:** Sprint 10
