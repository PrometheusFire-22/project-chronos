# Better Auth Implementation Guide

**Status**: In Progress
**Jira**: [CHRONOS-514](https://automatonicai.atlassian.net/browse/CHRONOS-514)
**ADR**: ADR 021-v2

## What's Been Set Up (Feb 3, 2026)

✅ **Dependencies Installed**
- `better-auth@1.4.18` - Core authentication library
- `@better-auth/cli@1.4.18` - Schema generation tool

✅ **Core Files Created**
- `lib/auth.ts` - Server-side auth instance with email/password, OAuth, organizations
- `lib/auth-client.ts` - Client-side React hooks
- `app/api/auth/[...all]/route.ts` - API route handler
- `scripts/setup-auth-schema.sql` - Database schema isolation script
- `.env.example` - Environment variable template
- `DATABASE_SETUP.md` - Comprehensive setup guide

✅ **Schema Isolation**
- Auth tables will be in `auth` schema (isolated from app data)
- Application tables remain in `public` schema
- No naming conflicts, clear separation of concerns

## Next Steps

### 1. Environment Configuration

Copy `.env.example` to `.env.local` and fill in your values:

```bash
cp .env.example .env.local
```

Edit `.env.local`:

```bash
# Database - IMPORTANT: Include ?schema=auth
DATABASE_URL="postgresql://user:password@localhost:5432/chronos?schema=auth"

# App URL
NEXT_PUBLIC_APP_URL="http://localhost:3000"

# Resend (already configured in your project)
RESEND_API_KEY="your-resend-api-key"
EMAIL_FROM="auth@automatonicai.com"

# Google OAuth (optional)
GOOGLE_CLIENT_ID="your-client-id"
GOOGLE_CLIENT_SECRET="your-client-secret"
```

### 2. Database Setup

Create the isolated auth schema:

```bash
# Option A: Using psql
psql $DATABASE_URL -f scripts/setup-auth-schema.sql

# Option B: Using your existing DB connection
psql -h your-host -U your-user -d chronos -f scripts/setup-auth-schema.sql
```

### 3. Generate Auth Tables

Let Better Auth CLI create the tables in the `auth` schema:

```bash
npx @better-auth/cli generate

# This creates:
# - auth.user
# - auth.session
# - auth.account (OAuth)
# - auth.verification (email verification tokens)
# - auth.organization (multi-tenancy)
# - auth.member (organization memberships)
```

### 4. Test the Setup

Start your dev server and test the auth endpoints:

```bash
pnpm dev

# Test endpoints:
# GET  http://localhost:3000/api/auth/session
# POST http://localhost:3000/api/auth/sign-up
# POST http://localhost:3000/api/auth/sign-in
```

### 5. Build Auth UI

Create the authentication pages (see CHRONOS-514 for detailed tasks):

**Sign Up Page** (`app/auth/signup/page.tsx`):
```tsx
"use client";

import { useState } from "react";
import { signUp } from "@/lib/auth-client";
import { useRouter } from "next/navigation";

export default function SignUpPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      await signUp.email({
        email,
        password,
        name: email.split("@")[0], // Simple name extraction
      });

      // Redirect to email verification page
      router.push("/auth/verify-email");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Sign up failed");
    }
  };

  return (
    <div>
      <h1>Sign Up</h1>
      <form onSubmit={handleSignUp}>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          required
        />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          required
        />
        {error && <p style={{ color: "red" }}>{error}</p>}
        <button type="submit">Sign Up</button>
      </form>
    </div>
  );
}
```

**Sign In Page** (`app/auth/signin/page.tsx`):
```tsx
"use client";

import { useState } from "react";
import { signIn } from "@/lib/auth-client";
import { useRouter } from "next/navigation";

export default function SignInPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      await signIn.email({
        email,
        password,
      });

      // Redirect to dashboard or home
      router.push("/");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Sign in failed");
    }
  };

  return (
    <div>
      <h1>Sign In</h1>
      <form onSubmit={handleSignIn}>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          required
        />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          required
        />
        {error && <p style={{ color: "red" }}>{error}</p>}
        <button type="submit">Sign In</button>
      </form>

      {/* Google OAuth */}
      <button onClick={() => signIn.social({ provider: "google" })}>
        Sign in with Google
      </button>
    </div>
  );
}
```

**Protected Route Example** (`app/upload/page.tsx`):
```tsx
"use client";

import { useSession } from "@/lib/auth-client";
import { redirect } from "next/navigation";

export default function UploadPage() {
  const { data: session, isPending } = useSession();

  if (isPending) {
    return <div>Loading...</div>;
  }

  if (!session) {
    redirect("/auth/signin");
  }

  if (!session.user.emailVerified) {
    return (
      <div>
        <h1>Email Verification Required</h1>
        <p>Please verify your email before uploading documents.</p>
      </div>
    );
  }

  return (
    <div>
      <h1>Upload Document</h1>
      <p>Welcome, {session.user.email}!</p>
      {/* Your upload UI here */}
    </div>
  );
}
```

### 6. Add User Tier Fields

Extend the user table with tier management (see CHRONOS-514 for full schema):

```sql
-- Connect to the auth schema
\c chronos
SET search_path TO auth;

-- Add custom fields to user table
ALTER TABLE "user" ADD COLUMN IF NOT EXISTS tier TEXT DEFAULT 'free';
ALTER TABLE "user" ADD COLUMN IF NOT EXISTS documents_processed INTEGER DEFAULT 0;
ALTER TABLE "user" ADD COLUMN IF NOT EXISTS queries_this_month INTEGER DEFAULT 0;
ALTER TABLE "user" ADD COLUMN IF NOT EXISTS monthly_query_limit INTEGER DEFAULT 100;

-- Create index for tier lookups
CREATE INDEX IF NOT EXISTS idx_user_tier ON "user"(tier);

-- Add check constraint
ALTER TABLE "user" ADD CONSTRAINT check_tier
  CHECK (tier IN ('free', 'pro'));
```

## Resources

- [Better Auth Docs](https://www.better-auth.com/docs)
- [Tutorial Video](https://www.youtube.com/watch?v=LMUsWY5alY0)
- [ADR 021-v2](../../../docs/10-DEVELOPMENT/01-ARCHITECTURE/adrs/adr_021v2_better_auth_user_authentication.md)
- [CHRONOS-514](https://automatonicai.atlassian.net/browse/CHRONOS-514)

## Troubleshooting

### Tables created in wrong schema?
Check your DATABASE_URL includes `?schema=auth`:
```bash
echo $DATABASE_URL
# Should output: postgresql://...?schema=auth
```

### Email not sending?
Verify RESEND_API_KEY is set and valid:
```bash
echo $RESEND_API_KEY
```

### Type errors?
Restart your TypeScript server:
```bash
# VS Code: Cmd+Shift+P > "TypeScript: Restart TS Server"
```

## Architecture Decisions

**Why Better Auth over NextAuth.js?**
- See ADR 021-v2 for full rationale
- TL;DR: Better Auth team took over Auth.js maintenance (Sept 2025)
- Better Auth is the official successor with superior DX

**Why Schema Isolation?**
- Prevents naming conflicts (your app can have its own `user` table)
- Clear separation between auth and business logic
- Easier to backup/restore/migrate auth data independently
- Better security (can apply different permissions)

**Why Database Sessions over JWT?**
- Enables "logout from all devices"
- Better for high-security financial platform
- Minimal performance impact with proper indexing

## Next Major Milestones

1. ✅ Core auth setup (this document)
2. ⏳ Build UI components with Shadcn (CHRONOS-514)
3. ⏳ Implement tier management (free vs pro)
4. ⏳ Set up middleware for route protection
5. ⏳ Add organization/multi-tenancy flows (CHRONOS-517)
6. ⏳ Deploy to production
7. ⏳ Monitor auth metrics (email delivery, error rates)
