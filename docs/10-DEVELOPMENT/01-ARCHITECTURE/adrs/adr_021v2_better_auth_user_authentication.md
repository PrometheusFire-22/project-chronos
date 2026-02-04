# ADR 021-v2: Better Auth for User Authentication

**Status:** Accepted
**Date:** 2026-02-03
**Deciders:** Product, Engineering
**Supersedes:** ADR 021 (NextAuth.js decision from 2026-02-02)

## Context

On 2026-02-02, we decided to use NextAuth.js (Auth.js v5) for user authentication (see ADR 021). However, critical new information emerged on 2026-02-03:

**Breaking News (September 2025):**
- The Better Auth team officially took over maintenance of Auth.js/NextAuth.js
- Auth.js is now in **maintenance mode** (security patches only)
- Main contributor Balázs Orbán quit in January 2025
- Auth.js v5 remains in beta after extended timeline
- **Better Auth is now the recommended path for new projects**

This development fundamentally changes the decision matrix and requires an immediate revision before implementation begins.

### Updated Requirements

We need production-ready authentication for our SaaS RAG platform to:
- Gate document upload/processing (prevent bot abuse)
- Filter qualified leads via email verification
- Manage user tiers (free vs paid)
- Control token costs (only authenticated users)
- Support future multi-tenancy (user database connections) - **CRITICAL**
- Enable AI-assisted development and debugging
- Integrate seamlessly with Next.js 16 App Router

### Comparison: Auth.js vs Better Auth (2026)

| Feature | **Auth.js (ADR 021 Choice)** | **Better Auth (New Choice)** |
|---------|---------------------------|---------------------------|
| **Maintenance Status** | ⚠️ Maintenance mode only | ✅ Active development |
| **Official Recommendation** | ⚠️ Legacy-focused | ✅ Recommended for new projects |
| **TypeScript Support** | ❌ Manual type augmentation | ✅ Native TypeScript-first with autocomplete |
| **Next.js 16 App Router** | ⚠️ Works but clunky | ✅ Designed specifically for App Router |
| **Multi-tenancy/Organizations** | ❌ Custom implementation (weeks) | ✅ Built-in plugin (minutes) |
| **MFA/2FA** | ❌ Manual implementation | ✅ Built-in plugin |
| **Passkeys** | ❌ Manual implementation | ✅ Built-in plugin |
| **Schema Management** | ⚠️ Manual Prisma schemas | ✅ Automatic migrations via CLI |
| **PostgreSQL** | ✅ Prisma adapter | ✅ Native Prisma/Drizzle support |
| **Resend Email** | ✅ Custom integration | ✅ Custom integration |
| **AI Assistant Support** | ❌ No MCP server | ✅ Native MCP server + LLMs.txt |
| **Setup Complexity** | 2-3 days (per ADR 021) | 1-2 days (higher-level API) |
| **Cost** | $0/month | $0/month |
| **Community** | 24k stars (legacy) | Growing, official successor |

## Decision

**Use Better Auth** for user authentication instead of Auth.js/NextAuth.js.

### Rationale

**Strategic Alignment:**
- ✅ **Official successor** to Auth.js - not a competing alternative, but the future of the ecosystem
- ✅ **Maintenance commitment** - Active development vs maintenance-only mode
- ✅ **Zero migration risk** - Auth.js team is Better Auth team now
- ✅ **Future-proof** - Actively developed for modern Next.js patterns

**Cost Analysis (Unchanged):**
- Better Auth: **$0/month** (FOSS, self-hosted)
- Email service: **$0/month** (already using Resend free tier)
- Clerk alternative: $25/month base + usage
- **Total incremental cost: $0/month**
- **Annual savings vs Clerk: $300+**

**Technical Superiority:**
- ✅ **Multi-tenancy built-in** - Solves CHRONOS-517 (multi-tenant DB connections) immediately
- ✅ **TypeScript-first** - Full autocomplete, type safety (matches our Modal, Nx stack)
- ✅ **Automatic schema management** - CLI generates perfect Postgres tables
- ✅ **App Router native** - Designed for Server Actions and Server Components
- ✅ **MCP server** - AI-assisted auth debugging (Claude Code can help troubleshoot)

**Development Efficiency:**
- **Time savings:** Features that would take weeks in Auth.js are plugins in Better Auth:
  - Organizations/Multi-tenancy: Built-in plugin
  - Two-Factor Auth: Built-in plugin
  - Passkeys: Built-in plugin
- **Faster setup:** 1-2 days vs 2-3 days (better DX)
- **Less maintenance:** Higher-level API with sensible defaults

**Acceptable Trade-offs:**
- Smaller community (but growing as official Auth.js successor)
- Newer project (but backed by Auth.js team)
- SQL-focused (not a problem - we use PostgreSQL)

### Why This Supersedes ADR 021

ADR 021 was written on **Feb 2, 2026** without knowledge of the Auth.js takeover (announced Sept 2025). The decision was sound at the time, but critical ecosystem changes make Better Auth the superior choice:

1. **Auth.js is no longer actively developed** (maintenance only)
2. **Better Auth is the official path forward** (same team)
3. **Multi-tenancy is a core requirement** (CHRONOS-517) - Better Auth has this built-in
4. **AI-assisted development** (MCP server) aligns with our Claude Code workflow

This is not a rejection of ADR 021's analysis - it's an update based on new information that emerged within 24 hours.

## Implementation

### Architecture

```typescript
// Stack Overview
- Framework: Next.js 16 (App Router)
- Auth Library: Better Auth
- Database: PostgreSQL (Prisma adapter)
- Email: Resend API (magic links + verification)
- UI: Shadcn UI (custom components)
- Providers: Email (magic links), Google OAuth
```

### Core Setup

**1. Install Dependencies**

```bash
pnpm add better-auth
pnpm add @better-auth/cli -D
```

**2. Authentication Instance** (`lib/auth.ts`)

```typescript
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { organization } from "better-auth/plugins";
import { nextCookies } from "better-auth/next-js";
import { prisma } from "@/lib/prisma";

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql"
  }),

  // Email authentication with magic links
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
    sendResetPassword: async ({ user, url }) => {
      // Use existing Resend setup
      await resend.emails.send({
        from: "auth@automatonicai.com",
        to: user.email,
        subject: "Reset your password",
        html: `<a href="${url}">Reset password</a>`
      });
    },
    sendVerificationEmail: async ({ user, url }) => {
      await resend.emails.send({
        from: "auth@automatonicai.com",
        to: user.email,
        subject: "Verify your email",
        html: `<a href="${url}">Verify email</a>`
      });
    }
  },

  // Social providers
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      redirectURL: process.env.GOOGLE_REDIRECT_URL!
    }
  },

  // Multi-tenancy support (CHRONOS-517)
  plugins: [
    organization({
      allowUserToCreateOrganization: true,
      organizationLimit: 5 // Free tier limit
    }),
    nextCookies() // Next.js cookie handling
  ],

  // Session configuration
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24 // Update every 24 hours
  }
});
```

**3. API Route Handler** (`app/api/auth/[...all]/route.ts`)

```typescript
import { auth } from "@/lib/auth";

export const { GET, POST } = auth.handler;
```

**4. Auth Client** (`lib/auth-client.ts`)

```typescript
import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_APP_URL
});

// Fully typed hooks
export const {
  useSession,
  signIn,
  signOut,
  signUp,
  useActiveOrganization
} = authClient;
```

**5. Schema Generation**

```bash
# Better Auth CLI generates perfect Prisma schemas
npx @better-auth/cli generate

# Output: prisma/schema.prisma updated with:
# - User model
# - Session model
# - Account model (OAuth)
# - Verification model
# - Organization model (for multi-tenancy)
```

### User Tier Management

```typescript
// Extend Better Auth's User model in Prisma
model User {
  id        String   @id @default(cuid())
  email     String   @unique
  // Better Auth fields (auto-generated)
  ...

  // Custom fields for tier management
  tier                String   @default("free") // "free" | "pro"
  documentsProcessed  Int      @default(0)
  queriesThisMonth    Int      @default(0)
  monthlyQueryLimit   Int      @default(100)
}
```

### Multi-Tenancy Flow (Solves CHRONOS-517)

```typescript
// User creates organization (e.g., "ACME Corp")
await authClient.organization.create({
  name: "ACME Corp"
});

// User connects their database credentials
await prisma.organizationMetadata.create({
  data: {
    organizationId: org.id,
    dbHost: "encrypted-host",
    dbUser: "encrypted-user",
    dbPassword: "encrypted-password" // Encrypted at rest
  }
});

// RAG queries scoped to organization's database
const userOrg = await authClient.organization.getActive();
const dbConnection = getOrgDatabase(userOrg.id);
```

## Consequences

### Positive

- ✅ **$300+/year savings** (Clerk avoided, $0 incremental cost) - **unchanged from ADR 021**
- ✅ **Resend already configured** (no additional email setup needed) - **unchanged**
- ✅ **Multi-tenancy solved** (CHRONOS-517) - organizations built-in
- ✅ **Future-proof** - Official Auth.js successor with active development
- ✅ **TypeScript excellence** - Full autocomplete and type safety
- ✅ **Faster development** - Built-in MFA, passkeys, organizations
- ✅ **AI-assisted debugging** - MCP server for Claude Code integration
- ✅ **Automatic schema management** - Less manual Prisma work
- ✅ **Better DX** - Higher-level API than Auth.js
- ✅ **Faster setup** - 1-2 days vs 2-3 days

### Negative

- ⚠️ **Newer project** - Smaller community than Auth.js (mitigated: same team)
- ⚠️ **Less Stack Overflow content** - Fewer tutorials (mitigated: excellent docs)
- ❌ **SQL-only focus** - No NoSQL adapters yet (not relevant - we use PostgreSQL)

### Neutral

- Resend dependency - unchanged from ADR 021
- Custom UI required - unchanged from ADR 021
- Learning curve - similar to Auth.js, better TypeScript experience

## Migration Path (If Needed)

If we had already implemented Auth.js:

1. Better Auth provides migration utilities
2. Session/user data structure is compatible
3. Estimated migration time: 1-2 days

Since we're implementing fresh, no migration needed.

## Monitoring

Track these metrics to validate decision:
- Setup time (target: <2 days)
- Email delivery rate (target: >95% via Resend)
- Auth error rate (target: <1%)
- Monthly cost (actual: $0, Resend free tier: 3k emails/month)
- Organization creation rate (for multi-tenancy adoption)
- Developer satisfaction (TypeScript experience, debugging ease)

**Resend free tier monitoring:** (unchanged from ADR 021)
- Current tier: Free (3k emails/month)
- If volume exceeds 3k/month:
  - Option 1: Resend paid ($20/month for 100k emails)
  - Option 2: AWS SES (~$1/month for 10k emails)

**Cost threshold to reconsider:** If total monthly cost exceeds $25/month (unlikely).

## References

- Better Auth: https://www.better-auth.com/
- Auth.js Takeover Announcement: https://www.better-auth.com/blog/authjs-joins-better-auth
- GitHub Discussion: https://github.com/nextauthjs/next-auth/discussions/13252
- Better Auth Docs: https://www.better-auth.com/docs
- Implementation Tutorial: https://www.youtube.com/watch?v=LMUsWY5alY0
- Resend: https://resend.com/
- Shadcn UI: https://ui.shadcn.com/

## Related Decisions

- **ADR 021**: NextAuth.js decision (2026-02-02) - **SUPERSEDED**
- ADR 020: Modal GPU document processing (cost optimization)
- CHRONOS-514: User authentication implementation (Better Auth)
- CHRONOS-517: Multi-tenant database connections (solved by Better Auth organizations)
- CHRONOS-519: Security vulnerabilities (tech debt)

## Decision Log

- **2026-02-02**: ADR 021 - Chose NextAuth.js over Clerk/Supabase/Lucia
- **2026-02-03**: ADR 021-v2 - Switched to Better Auth based on:
  - Auth.js maintenance mode announcement
  - Better Auth official takeover
  - Built-in multi-tenancy (CHRONOS-517)
  - Superior TypeScript DX
  - MCP server for AI-assisted development
