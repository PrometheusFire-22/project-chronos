# Marketing Site Technical Stack Recommendations

**Date**: 2025-12-09
**Project**: Automatonic AI Marketing Site
**Epic**: CHRONOS-280
**Status**: Architecture Decision Record (ADR)

---

## 🎯 CONFIRMED CORE STACK

### Framework & Language
- ✅ **Next.js 14+** with App Router
- ✅ **TypeScript** (strict mode)
- ✅ **Tailwind CSS** for styling
- ✅ **Vercel** for hosting (free tier initially)

**Rationale**: Modern, performant, excellent DX, industry standard for React SSR/SSG sites.

---

## 🎨 ANIMATION LIBRARY RECOMMENDATION

### **RECOMMENDED: Framer Motion**

**Why Framer Motion**:
- ✅ **Declarative API** - React-native, component-based
- ✅ **Performance** - Uses GPU acceleration, WAAPI under the hood
- ✅ **Bundle size** - ~35KB gzipped (reasonable)
- ✅ **TypeScript support** - First-class, excellent DX
- ✅ **Gestures** - Built-in drag, hover, tap interactions
- ✅ **Layout animations** - Automatic, no manual calculations
- ✅ **Variants** - Orchestrate complex animations easily
- ✅ **Ecosystem** - Integrates perfectly with React/Next.js
- ✅ **Adoption** - Used by Stripe, Vercel, Linear, Loom

**Comparison with GSAP**:
- **GSAP Pros**: More powerful for complex timeline animations, broader browser support, smaller core (12KB)
- **GSAP Cons**: Imperative API (less React-friendly), commercial license for some features, more boilerplate
- **Verdict**: Framer Motion is better fit for React/Next.js component-based architecture

**What Framer Motion Does**:
- Page transitions (smooth navigation between routes)
- Scroll-triggered animations (reveal on scroll)
- Hover effects and micro-interactions
- Loading state animations
- Orchestrated multi-element animations
- Layout shifts (when elements resize/reorder)

**Example**:
```tsx
import { motion } from 'framer-motion'

<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.6 }}
>
  Content reveals smoothly
</motion.div>
```

**Decision**: Use Framer Motion for all animations.

---

## 📝 FORM HANDLING RECOMMENDATION

### **RECOMMENDED: React Hook Form**

**Why React Hook Form**:
- ✅ **Performance** - Uncontrolled components, minimal re-renders
- ✅ **Bundle size** - ~8KB gzipped (tiny)
- ✅ **TypeScript** - Excellent type inference
- ✅ **Validation** - Built-in + integrates with Zod/Yup
- ✅ **DX** - Minimal boilerplate, intuitive API
- ✅ **Adoption** - 40K+ GitHub stars, industry standard
- ✅ **Free/Open Source** - MIT license

**Comparison**:
- **Formik**: Older, larger bundle, more re-renders
- **Custom Forms**: More work, harder to maintain
- **Third-party (Typeform)**: $$$, no control, vendor lock-in

**What It Handles**:
- Input state management
- Validation (email format, required fields)
- Error messaging
- Form submission
- Accessibility (ARIA attributes)

**Example**:
```tsx
import { useForm } from 'react-hook-form'

const { register, handleSubmit, formState: { errors } } = useForm()

<input
  {...register('email', {
    required: 'Email is required',
    pattern: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i
  })}
/>
{errors.email && <span>{errors.email.message}</span>}
```

**Decision**: Use React Hook Form for waitlist/contact forms.

---

## 📧 EMAIL SERVICE RECOMMENDATION

### **RECOMMENDED: Resend (with fallback plan)**

**Why Resend**:
- ✅ **Free tier** - 3,000 emails/month (sufficient for MVP)
- ✅ **Developer-first** - Modern API, excellent DX
- ✅ **React support** - Built-in React Email templates
- ✅ **Deliverability** - Built by ex-Postmark team
- ✅ **Simple** - No complex setup, API-only
- ✅ **Affordable** - $20/month for 50K emails (when you scale)

**Comparison**:

| Service | Free Tier | Pros | Cons |
|---------|-----------|------|------|
| **Resend** | 3K/month | Modern, React Email, simple | Newer (less proven) |
| **SendGrid** | 100/day (3K/month) | Established, powerful | Complex UI, overkill |
| **Mailchimp** | 500/month | Marketing features | Expensive, clunky for dev |
| **Mautic (self-hosted)** | Unlimited | FOSS, full control | Setup complexity, maintenance |
| **AWS SES** | 62K/month (via EC2) | Cheapest at scale | Complex setup, deliverability issues |

**Self-Hosting Consideration**:
- **Mautic**: Powerful FOSS marketing automation, but:
  - Requires server management (EC2 instance)
  - Database setup (PostgreSQL/MySQL)
  - Domain/DKIM/SPF configuration
  - Ongoing maintenance
  - **Verdict**: Overkill for MVP, consider later at scale

**Decision**: Start with Resend (free tier), migrate to self-hosted if/when you hit limits or want more control.

**Fallback**: If Resend doesn't work, use SendGrid free tier or AWS SES.

---

## 📚 CONTENT MANAGEMENT SYSTEM (CMS)

### **RECOMMENDED: Hybrid Approach**

**Strategy**:
1. **Marketing pages** (Homepage, Features, About) → Hardcoded in React components
2. **Blog posts** → Markdown files with frontmatter (git-based CMS)
3. **Future** (if needed) → Consider Payload CMS

**Why Hybrid**:
- ✅ **Speed** - No CMS setup delays launch
- ✅ **Control** - Full TypeScript type safety for content
- ✅ **Simplicity** - No external dependencies for core pages
- ✅ **Flexibility** - Easy to refactor to CMS later
- ✅ **Git-based blog** - Version control, Markdown preview, free

**Markdown Blog Approach**:
```
/content/blog/
├── 2025-01-15-introducing-automatonic.md
├── 2025-01-20-graph-databases-explained.md
└── 2025-01-25-geospatial-data-pipelines.md

# Each file has frontmatter:
---
title: "Introducing Automatonic AI"
date: "2025-01-15"
author: "Geoff"
excerpt: "Brief description..."
---

Content here...
```

Libraries for Markdown:
- `gray-matter` - Parse frontmatter
- `remark` - Markdown to HTML
- `rehype-pretty-code` - Syntax highlighting

**Payload CMS Evaluation**:

**Pros**:
- ✅ Modern, TypeScript-first
- ✅ Self-hosted (FOSS, no vendor lock-in)
- ✅ Admin UI included
- ✅ Flexible content modeling
- ✅ Good Next.js integration

**Cons**:
- ⚠️ Requires MongoDB or PostgreSQL setup
- ⚠️ Adds deployment complexity
- ⚠️ Learning curve
- ⚠️ May be overkill for 3-5 marketing pages

**When to Use Payload**:
- Non-technical team members need to edit content
- Frequent content updates required
- Complex content relationships
- Multi-language support needed

**Decision**:
- **Now**: Hardcoded marketing pages + Markdown blog
- **Later**: Consider Payload CMS when team grows or content complexity increases

---

## 📬 WAITLIST FORM SPECIFICATIONS

### Email Collection Strategy

**Fields**:
- ✅ **Email only** (maximize conversion, minimize friction)
- ❌ No name field (can collect later if needed)

**Validation Rules**:
```typescript
// Email validation with React Hook Form + Zod
import { z } from 'zod'

const emailSchema = z.string()
  .min(1, 'Email is required')
  .email('Invalid email format')
  .max(254, 'Email too long') // RFC 5321 max length

// Additional checks (optional):
- Block disposable email domains (mailinator, temp-mail, etc.)
- Normalize email (lowercase, trim whitespace)
- Check for typos (did you mean gmail.com instead of gmai.com?)
```

**Success/Error Messaging**:
- **Success**: "Thanks! Check your inbox for confirmation." (if double opt-in) or "You're on the list! We'll be in touch soon." (if single opt-in)
- **Error - Invalid email**: "Please enter a valid email address"
- **Error - Already subscribed**: "You're already on the waitlist!"
- **Error - Server**: "Oops! Something went wrong. Please try again."

**Email Confirmation Flow Options**:

**Option A: Single Opt-In** (Recommended for MVP)
```
User submits email → Saved to database → Confirmation message displayed
```
- ✅ **Pros**: Higher conversion, simpler UX, faster setup
- ⚠️ **Cons**: More spam signups, lower email deliverability score

**Option B: Double Opt-In** (Best Practice)
```
User submits email → Confirmation email sent → User clicks link → Confirmed
```
- ✅ **Pros**: Higher quality leads, better deliverability, GDPR-friendly
- ⚠️ **Cons**: ~50% confirmation rate, more complex flow

**Decision**: Start with **Single Opt-In** for speed, add double opt-in later if spam becomes an issue.

**Data Storage**:

**Recommended Approach**: Dual storage
1. **Primary**: PostgreSQL database (you already have Lightsail)
   - Table schema:
   ```sql
   CREATE TABLE waitlist_subscribers (
     id SERIAL PRIMARY KEY,
     email VARCHAR(254) UNIQUE NOT NULL,
     subscribed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
     ip_address INET,
     user_agent TEXT,
     source VARCHAR(50) -- 'homepage', 'features', etc.
   );
   ```
2. **Backup**: Email service (Resend) contact list
   - Acts as redundancy
   - Enables email campaigns later

**Why Both**:
- Database = source of truth, queryable, your data
- Email service = deliverability, campaign management

**Privacy/GDPR Compliance**:

**Minimum Requirements**:
1. ✅ **Privacy Policy page** - Boilerplate available, customize with:
   - What data you collect (email, IP, timestamp)
   - Why you collect it (waitlist updates)
   - How you store it (encrypted database)
   - User rights (request data, deletion)
   - Contact for privacy questions

2. ✅ **Consent checkbox** (if in EU/GDPR applies):
   ```tsx
   <input type="checkbox" required />
   "I agree to receive email updates from Automatonic AI"
   ```

3. ✅ **Unsubscribe link** in all emails

**Boilerplate Sources**:
- https://www.termsfeed.com/privacy-policy-generator/
- https://www.privacypolicies.com/
- Customize for your specific data practices

**GDPR Checklist**:
- [ ] Privacy policy published
- [ ] Consent obtained before sending emails
- [ ] Ability to export user data (on request)
- [ ] Ability to delete user data (on request)
- [ ] Secure data storage (encrypted database)

---

## 🏗️ BUILD ORDER RECOMMENDATION

### **RECOMMENDED: Option C → Component Library First**

**Why Component Library First**:
- ✅ **Reusability** - Build once, use everywhere
- ✅ **Consistency** - Enforces design system
- ✅ **Speed** - Faster page assembly after initial investment
- ✅ **Maintainability** - Single source of truth for components
- ✅ **Scalability** - Easy to add pages later
- ✅ **Best Practice** - How pros build production sites

**Build Sequence**:

### Phase 1: Foundation (Week 1)
1. **Project setup** (CHRONOS-284)
   - Next.js + TypeScript + Tailwind
   - ESLint + Prettier
   - Git hooks
   - Folder structure

2. **Design system/tokens** (Day 1-2)
   ```ts
   // tailwind.config.ts - Your brand colors
   colors: {
     brand: {
       purple: '#8B5CF6',
       teal: '#06B6D4',
       green: '#10B981'
     }
   }
   ```

3. **Core components** (Day 3-5)
   - Button (primary, secondary, ghost variants)
   - Input (with validation states)
   - Card
   - Typography system (H1-H6, body, caption)
   - Logo component
   - Navigation/Header
   - Footer
   - Layout wrapper

4. **Animation primitives** (Day 6-7)
   - Fade in on scroll
   - Slide in animations
   - Hover effects
   - Loading states

### Phase 2: Page Assembly (Week 2)
5. **Homepage** (CHRONOS-286) - Days 8-10
   - Hero section (with geometric graphic)
   - Value proposition
   - Key features preview
   - Waitlist CTA
   - Social proof placeholder

6. **Features page** (CHRONOS-287) - Days 11-12
   - Feature grid
   - Database paradigm illustrations
   - Technical details

7. **About page** (CHRONOS-288) - Day 13
   - Mission/vision
   - Team section (dummy headshot)
   - Contact CTA

### Phase 3: Functionality (Week 2-3)
8. **Waitlist form** (CHRONOS-289) - Day 14
   - React Hook Form integration
   - Resend API setup
   - Database schema
   - Success/error states

9. **Blog setup** - Days 15-16
   - Markdown processing
   - Blog list page
   - Blog post template
   - RSS feed

### Phase 4: Polish (Week 3)
10. **SEO optimization** (CHRONOS-290) - Days 17-18
    - Metadata
    - Open Graph tags
    - Sitemap
    - Analytics

11. **Performance optimization** - Day 19
    - Image optimization
    - Code splitting
    - Lighthouse audit

12. **Deployment** (CHRONOS-291) - Day 20
    - Vercel setup
    - Environment variables
    - Domain configuration

**Review Cadence**: After each major component (Phase 1, #3), after each page (Phase 2, #5-7), after functionality (Phase 3, #8-9).

---

## 📊 SEO & ANALYTICS EXPLAINER

### What Each Thing Means

**1. Google Analytics / Tag Manager**

**What It Is**:
- **Google Analytics (GA4)**: Tracks visitor behavior (page views, time on site, conversions)
- **Google Tag Manager (GTM)**: Container for managing tracking scripts

**Why You Need It**:
- Measure site traffic
- Understand user journey
- Track waitlist conversions
- Optimize marketing campaigns

**Setup Complexity**: Medium (30 minutes)
**Cost**: Free

**Decision**: Set up GA4 before launch. Skip GTM initially (only needed for multiple tracking tools).

---

**2. Open Graph Tags**

**What It Is**: Metadata that controls how your site appears when shared on social media (Twitter, LinkedIn, Facebook)

**Example**:
```html
<meta property="og:title" content="Automatonic AI - Relationship Intelligence Platform" />
<meta property="og:description" content="Build better relationships through data" />
<meta property="og:image" content="https://automatonic.ai/og-image.png" />
```

**Why You Need It**:
- Professional appearance in social shares
- Increases click-through rates
- Brand consistency

**Setup Complexity**: Easy (add to layout template)
**Cost**: Free

**Decision**: Include from day 1 (Next.js makes this easy).

---

**3. Structured Data (schema.org)**

**What It Is**: JSON-LD code that helps search engines understand your content

**Example**:
```json
{
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  "name": "Automatonic AI",
  "description": "Relationship intelligence platform",
  "applicationCategory": "BusinessApplication"
}
```

**Why You Need It**:
- Rich snippets in Google search results
- Better SEO rankings
- Appears in knowledge panels

**Setup Complexity**: Medium (requires understanding content types)
**Cost**: Free

**Decision**: Add for Organization and SoftwareApplication schemas after launch (not critical for MVP).

---

**4. Sitemap Generation**

**What It Is**: XML file listing all pages on your site, helps search engines crawl efficiently

**Example**:
```xml
<urlset>
  <url>
    <loc>https://automatonic.ai/</loc>
    <lastmod>2025-12-09</lastmod>
    <priority>1.0</priority>
  </url>
</urlset>
```

**Why You Need It**:
- Faster indexing by Google
- SEO best practice
- Required for Google Search Console

**Setup Complexity**: Easy (Next.js auto-generates with `next-sitemap` package)
**Cost**: Free

**Decision**: Include from day 1 (5 minutes to set up).

---

## 📐 ARCHITECTURE DECISION SUMMARY

| Decision | Choice | Rationale |
|----------|--------|-----------|
| **Animation** | Framer Motion | React-native, performant, modern |
| **Forms** | React Hook Form + Zod | Lightweight, type-safe, best DX |
| **Email** | Resend (free tier) | Modern, affordable, developer-friendly |
| **CMS** | Hybrid (hardcoded + Markdown) | Fast to launch, flexible, no vendor lock-in |
| **Waitlist** | Single opt-in, dual storage | Maximize conversions, data ownership |
| **Build Order** | Component library first | Scalable, maintainable, professional |
| **SEO** | GA4 + OG tags + Sitemap | Essential for discoverability |
| **Privacy** | Boilerplate policy + consent | GDPR compliance, user trust |

---

## 📚 DOCUMENTATION TO CREATE

As we build, we'll document:

1. **ADRs** (Architecture Decision Records)
   - Why we chose each technology
   - Trade-offs considered
   - When to revisit decisions

2. **Component Library Docs**
   - Storybook or similar
   - Usage examples
   - Props documentation

3. **UI/UX Guidelines**
   - Gestalt principles applied
   - Animation philosophy
   - Accessibility standards
   - Loading state patterns

4. **Deployment Runbook**
   - Vercel configuration
   - Environment variables
   - Monitoring setup

5. **Content Guidelines**
   - Tone of voice
   - Writing style
   - SEO best practices

---

## ✅ NEXT STEPS

1. Review and approve this tech stack
2. Move to visual assets creation (CHRONOS-283)
3. Set up Next.js project once hero graphic ready
4. Begin component library development

**Your Call**: Does this tech stack align with your vision? Any changes needed before we proceed?
