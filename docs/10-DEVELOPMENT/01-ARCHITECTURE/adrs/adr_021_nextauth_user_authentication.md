# ADR 021: NextAuth.js for User Authentication

**Status:** Accepted
**Date:** 2026-02-02
**Deciders:** Product, Engineering

## Context

We need production-ready authentication for our SaaS RAG platform to:
- Gate document upload/processing (prevent bot abuse)
- Filter qualified leads via email verification
- Manage user tiers (free vs paid)
- Control token costs (only authenticated users)
- Support future multi-tenancy (user database connections)

### Options Evaluated

| Solution | Cost/Month | Pros | Cons |
|----------|-----------|------|------|
| **Clerk** | $25 (>10k MAU) | Pre-built UI, email verification, zero setup | Paid, vendor lock-in |
| **NextAuth.js** | ~$15 (email only) | Free, Next.js native, full control | Build UI, more setup |
| **Supabase Auth** | $0-25 | Email verification, free tier 50k MAU | Another service dependency |
| **Lucia** | ~$15 | Modern, lightweight, TypeScript-first | Newer, smaller community |

## Decision

**Use NextAuth.js (Auth.js v5)** for user authentication.

### Rationale

**Cost savings:**
- NextAuth.js: ~$15/month (Resend for email)
- Clerk: $25/month base + usage
- **Annual savings: $120+**
- ROI: 2-3 days extra setup pays for itself in 1 month

**Strategic benefits:**
- No vendor lock-in (own auth logic)
- Full control over user flow
- Next.js native (our stack)
- Massive community (24k GitHub stars)
- PostgreSQL adapter (already using PostgreSQL)

**Acceptable trade-offs:**
- 2-3 days setup vs Clerk's 1 day
- Build UI components (use Shadcn UI)
- Configure email verification (Resend API)

## Implementation

### Core Components

```typescript
// NextAuth.js with PostgreSQL + Email verification
- Providers: Email (magic links), Google OAuth
- Database: Prisma adapter → PostgreSQL
- Email: Resend API (~$10-15/month)
- UI: Custom (Shadcn UI components)
```

### User Tier Management

```typescript
// Store in PostgreSQL users table
interface User {
  id: string
  email: string
  tier: 'free' | 'pro'  // Custom metadata
  documentsProcessed: number
  queriesThisMonth: number
}
```

### Email Verification Flow

1. User signs up → Send magic link (Resend)
2. User clicks link → Email verified
3. Create session → Allow uploads
4. Unverified users → Block document upload

## Consequences

### Positive

- ✅ **$120+/year savings** (Clerk avoided)
- ✅ Full control over auth logic
- ✅ No vendor lock-in
- ✅ Next.js native integration
- ✅ Can self-host if needed (future flexibility)
- ✅ Learn auth internals (team skill building)

### Negative

- ❌ 2-3 days extra setup time
- ❌ Build UI components ourselves
- ❌ Maintain email verification logic
- ❌ No pre-built user management dashboard

### Neutral

- Resend dependency (email service) - acceptable, standard practice
- More code to maintain - offset by owning the logic

## Alternatives Considered

### Clerk (Rejected - Cost)
- **Pros:** Fastest setup, beautiful UI, production-ready
- **Cons:** $300+/year cost, vendor lock-in
- **Decision:** Not worth $300/year premium for 1 day saved setup

### Supabase Auth (Rejected - Complexity)
- **Pros:** Free tier 50k MAU, email verification built-in
- **Cons:** Another service dependency, not Next.js native
- **Decision:** Prefer NextAuth.js for tighter Next.js integration

### Lucia (Rejected - Maturity)
- **Pros:** Modern, lightweight, TypeScript-first
- **Cons:** Newer (smaller community), fewer resources
- **Decision:** NextAuth.js is more battle-tested

## Monitoring

Track these metrics to validate decision:
- Setup time (target: <3 days)
- Email delivery rate (target: >95%)
- Auth error rate (target: <1%)
- Monthly cost (target: <$20)

If any of these fail, reconsider Clerk or Supabase.

## References

- NextAuth.js: https://authjs.dev/
- Prisma Adapter: https://authjs.dev/reference/adapter/prisma
- Resend: https://resend.com/
- Shadcn UI: https://ui.shadcn.com/

## Related Decisions

- ADR 020: Modal GPU document processing (cost optimization)
- CHRONOS-514: User authentication implementation
- Future: Multi-tenant database connections (requires secure auth)
