# Better Auth Implementation Guide

**Status**: Active
**Jira**: [CHRONOS-514](https://automatonicai.atlassian.net/browse/CHRONOS-514)
**ADR**: ADR 021-v2

## Current Architecture (Feb 5, 2026)

### Drizzle Adapter with `pgSchema("auth")`

Auth tables live in the `auth` PostgreSQL schema, isolated from application data in `public`. The Drizzle adapter maps column names automatically — no manual field mappings needed.

**Key file:** `lib/auth-schema.ts` defines all four Better Auth tables (`user`, `session`, `account`, `verification`) using `pgSchema("auth")` from `drizzle-orm/pg-core`. This ensures all queries target `auth.*` tables.

**Key file:** `lib/auth.ts` creates the Better Auth instance with:
- `drizzleAdapter(db, { provider: "pg", schema: {...} })` pointing at the schema tables
- `Pool` from `@neondatabase/serverless` for Cloudflare compatibility
- Email/password auth with Resend email handlers
- `DATABASE_URL` used as-is (includes `?search_path=auth`)

### Middleware Cookie-Based Auth

**File:** `middleware.ts` protects `/dashboard/*` routes by checking for the `better-auth.session_token` cookie. Unauthenticated users are redirected to `/sign-in?callbackUrl=<path>`.

This eliminates flash-of-unauthenticated-content — the redirect happens at the edge before any page rendering.

### Auth Client

**File:** `lib/auth-client.ts` exports `authClient`, `useSession`, `signIn`, `signUp`, `signOut` from Better Auth's React integration.

## Core Files

| File | Purpose |
|------|---------|
| `lib/auth.ts` | Server-side auth instance (email handlers, adapter config) |
| `lib/auth-schema.ts` | Drizzle table definitions for `auth.*` schema |
| `lib/auth-client.ts` | Client-side React hooks and auth methods |
| `middleware.ts` | Edge middleware for route protection |
| `app/api/auth/[...all]/route.ts` | API route handler |

## Settings Pages

| Page | Status | Notes |
|------|--------|-------|
| Profile (`/dashboard/settings/profile`) | Done | Name editing via `authClient.updateUser()`, avatar upload deferred |
| Security (`/dashboard/settings/security`) | Done | Password change via `authClient.changePassword()`, 2FA placeholder |
| Billing (`/dashboard/settings/billing`) | Done | Usage metrics from shared `useUsage` hook, Stripe placeholder |

## Troubleshooting

### `search_path` and Schema Isolation

The `DATABASE_URL` must include `?search_path=auth` so that the Neon serverless driver sets the correct schema context. **Do not strip query parameters from `DATABASE_URL`** — earlier versions of `auth.ts` removed the `?search_path=auth` suffix, which caused queries to target `public.*` tables (which don't exist).

The Drizzle schema definitions also use `pgSchema("auth")` as a belt-and-suspenders approach — even if `search_path` were missing, queries would use the fully qualified `auth.user` table names.

### Session Cookie Not Set?

Better Auth requires a `token` column on the `session` table. If your Drizzle schema omits this column, sign-in will fail silently (the session row can't be created). Ensure `auth-schema.ts` includes `token: text("token").notNull()` on the session table.

### Column Mismatch Errors

The account table uses `expires_at` as an **integer** (Unix timestamp), not a timestamp. The verification table's `expires_at` is also an integer. If you see type errors, verify your Drizzle schema column types match the actual database.

### Email Not Sending?

Verify `RESEND_API_KEY` is set:
```bash
echo $RESEND_API_KEY
```

### Type Errors?

Restart your TypeScript server:
```
VS Code: Cmd+Shift+P > "TypeScript: Restart TS Server"
```

## Architecture Decisions

**Why Better Auth over NextAuth.js?**
- See ADR 021-v2 for full rationale
- Better Auth team took over Auth.js maintenance (Sept 2025)
- Better Auth is the official successor with superior DX

**Why Schema Isolation?**
- Prevents naming conflicts (app can have its own `user` table)
- Clear separation between auth and business logic
- Easier to backup/restore/migrate auth data independently

**Why Database Sessions over JWT?**
- Enables "logout from all devices"
- Better for high-security financial platform
- Minimal performance impact with proper indexing

## Resources

- [Better Auth Docs](https://www.better-auth.com/docs)
- [ADR 021-v2](../../../docs/10-DEVELOPMENT/01-ARCHITECTURE/adrs/adr_021v2_better_auth_user_authentication.md)
- [CHRONOS-514](https://automatonicai.atlassian.net/browse/CHRONOS-514)
