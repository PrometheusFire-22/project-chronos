# Better Auth Database Setup

This guide explains how to set up Better Auth with **schema isolation** to keep auth tables separate from your application data.

## Architecture

```
PostgreSQL Database: chronos
├── public schema       (your application data)
│   ├── documents_raw
│   ├── document_chunks
│   └── ... other app tables
│
└── auth schema         (Better Auth tables - ISOLATED)
    ├── user
    ├── session
    ├── account
    ├── verification
    ├── organization
    └── member
```

## Step 1: Create Auth Schema

Run this SQL to create the isolated `auth` schema:

```sql
-- Connect to your database
psql $DATABASE_URL

-- Create the auth schema
CREATE SCHEMA IF NOT EXISTS auth;

-- Grant permissions to your application user
GRANT ALL ON SCHEMA auth TO your_user;
GRANT ALL ON ALL TABLES IN SCHEMA auth TO your_user;
GRANT ALL ON ALL SEQUENCES IN SCHEMA auth TO your_user;

-- Set default privileges for future tables
ALTER DEFAULT PRIVILEGES IN SCHEMA auth
GRANT ALL ON TABLES TO your_user;

ALTER DEFAULT PRIVILEGES IN SCHEMA auth
GRANT ALL ON SEQUENCES TO your_user;
```

## Step 2: Configure Environment Variables

Update your `.env.local` file with the auth schema:

```bash
# Notice the ?schema=auth parameter - this tells Better Auth to use the auth schema
DATABASE_URL="postgresql://user:password@localhost:5432/chronos?schema=auth"

# Or for AWS RDS:
DATABASE_URL="postgresql://user:password@chronos.xxxxx.us-east-1.rds.amazonaws.com:5432/chronos?schema=auth"
```

## Step 3: Generate Better Auth Tables

Better Auth CLI will automatically create tables in the `auth` schema:

```bash
# Install Better Auth CLI (already done via package.json)
pnpm add -D @better-auth/cli

# Generate the database schema
# This creates: user, session, account, verification, organization, member
npx @better-auth/cli generate

# Output:
# ✓ Generated schema in 'auth' schema
# ✓ Tables created: user, session, account, verification, organization, member
```

## Step 4: Verify Schema Isolation

Confirm that auth tables are in the correct schema:

```sql
-- List all tables in auth schema
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'auth';

-- Should show:
-- user
-- session
-- account
-- verification
-- organization
-- member

-- List tables in public schema (your app data)
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public';

-- Should show:
-- documents_raw
-- document_chunks
-- ... (no auth tables)
```

## Benefits of Schema Isolation

1. **No Naming Conflicts**: Your app can have its own `user` table in `public` schema
2. **Clear Separation**: Auth logic is physically separated from business logic
3. **Easier Migrations**: Can migrate auth schema independently
4. **Security**: Can apply different permissions to auth vs app schemas
5. **Backup/Restore**: Can backup auth schema separately if needed

## Connecting to App Data

When you need to join auth data with app data, use schema-qualified table names:

```sql
-- Get user's documents (join across schemas)
SELECT
  d.*,
  u.email as uploader_email
FROM public.documents_raw d
JOIN auth.user u ON d.user_id = u.id
WHERE u.id = $1;
```

## Multi-Tenant Isolation (Future)

For CHRONOS-517 (multi-tenant database connections), you can extend this pattern:

```
PostgreSQL Database: chronos
├── auth schema           (user/org management - SHARED)
├── public schema         (platform data - SHARED)
├── tenant_acme schema    (ACME Corp's documents)
├── tenant_widget schema  (Widget Co's documents)
└── tenant_xyz schema     (XYZ Inc's documents)
```

## Troubleshooting

### Tables not in auth schema?

Check your DATABASE_URL includes `?schema=auth`:

```bash
# Correct ✓
DATABASE_URL="postgresql://...?schema=auth"

# Wrong ✗
DATABASE_URL="postgresql://..."  # defaults to 'public'
```

### Permission denied errors?

Grant permissions on the schema:

```sql
GRANT ALL ON SCHEMA auth TO your_user;
GRANT ALL ON ALL TABLES IN SCHEMA auth TO your_user;
```

### Can't connect to database?

Verify your connection string:

```bash
# Test connection
psql $DATABASE_URL -c "SELECT current_schema();"
# Should output: auth
```

## References

- [Better Auth Database Docs](https://www.better-auth.com/docs/concepts/database)
- [PostgreSQL Schema Docs](https://www.postgresql.org/docs/current/ddl-schemas.html)
- ADR 021-v2: `docs/10-DEVELOPMENT/01-ARCHITECTURE/adrs/adr_021v2_better_auth_user_authentication.md`
