# Environment Files Migration Guide

## Overview

We've consolidated 11+ scattered environment files into 3 standardized files:

1. **`.env.example`** - Template with all variables (committed to git)
2. **`.env.local`** - Local development secrets (git-ignored)
3. **`.env.production`** - Production secrets (git-ignored)

## Migration Steps

### 1. Backup Existing Secrets

Before deleting old files, extract any unique secrets:

```bash
# Backup all existing env files
mkdir -p ~/chronos-env-backup
cp .env* ~/chronos-env-backup/
cp apps/web/.env.local ~/chronos-env-backup/apps-web-env.local
cp apps/api/.env ~/chronos-env-backup/apps-api-env
cp deployment/lightsail/.env ~/chronos-env-backup/lightsail-env
```

### 2. Create .env.local for Local Development

```bash
# Copy template
cp .env.example .env.local

# Fill in local development values
# - DATABASE_HOST=timescaledb (for Docker)
# - DATABASE_USER=chronos_user
# - DATABASE_PASSWORD=your_local_password
# - FRED_API_KEY=your_fred_api_key
# - PGADMIN_EMAIL=admin@example.com
# - PGADMIN_PASSWORD=your_pgadmin_password
```

### 3. Update .env.production with Production Secrets

The `.env.production` file already exists. Update it with actual secrets from KeePassXC:

```bash
# Edit .env.production and replace all <retrieve-from-keepassxc> placeholders
# Key secrets to update:
# - DATABASE_PASSWORD
# - DIRECTUS_KEY
# - DIRECTUS_SECRET
# - DIRECTUS_ADMIN_PASSWORD
# - STORAGE_R2_KEY
# - STORAGE_R2_SECRET
# - S3_ACCESS_KEY_ID
# - S3_SECRET_ACCESS_KEY
# - PAYLOAD_SECRET
# - FRED_API_KEY
# - CLOUDFLARE_API_TOKEN
# - TURNSTILE_SECRET_KEY
# - NX_CLOUD_ACCESS_TOKEN
# - SENTRY_AUTH_TOKEN
# - All MCP server tokens
```

### 4. Test Local Development

```bash
# Start Docker Compose with new .env.local
docker-compose up -d

# Verify services can connect
docker-compose logs timescaledb
docker-compose logs pgadmin
docker-compose logs directus

# Test Python CLIs
python src/chronos/ingestion/timeseries_cli.py --help
```

### 5. Test Production Scripts

```bash
# Test production scripts (they now use .env.production)
tsx scripts/add-permissions-sql.ts
tsx scripts/fix-data-collections.ts
```

### 6. Clean Up Old Environment Files

**ONLY after verifying everything works:**

```bash
# Remove deprecated env files
rm .env.api.local
rm .env.api.production
rm .env.aws
rm .env.mcp
rm .env.production.vercel
rm .env.vercel
rm apps/api/.env
rm apps/web/.env.local

# Keep these files:
# - .env.example (template)
# - .env.local (your local secrets)
# - .env.production (production secrets)
# - deployment/lightsail/.env (Lightsail-specific)
```

## File Mapping

### Old Files → New Files

| Old File | New File | Purpose |
|----------|----------|---------|
| `.env` | `.env.local` | Local development |
| `.env.aws` | `.env.production` | Production operations |
| `.env.mcp` | `.env.local` | MCP server tokens (local) |
| `apps/web/.env.local` | `.env.local` | Web app local config |
| `apps/api/.env` | `.env.local` | API local config |
| `.env.vercel` | `.env.production` | Vercel deployment |
| `.env.production.vercel` | `.env.production` | Vercel production |
| `.env.api.local` | `.env.local` | API local (duplicate) |
| `.env.api.production` | `.env.production` | API production (empty) |
| `deployment/lightsail/.env` | Keep as-is | Lightsail-specific |

## Updated Code References

### Scripts

- `scripts/add-permissions-sql.ts` → Uses `.env.production`
- `scripts/fix-data-collections.ts` → Uses `.env.production`
- `scripts/create-first-user-production.mjs` → Uses environment variables (no file specified)

### Docker Compose

- `docker-compose.yml` → Uses `.env.local`
- `docker-compose.override.yml` → Uses `.env.local`
- Directus service → Uses `deployment/lightsail/.env`

### Python CLIs

- `src/chronos/ingestion/timeseries_cli.py` → Loads from project root `.env` (now `.env.local`)
- `src/chronos/ingestion/geospatial_cli.py` → Loads from project root `.env` (now `.env.local`)

## Verification Checklist

- [ ] `.env.local` created with local development secrets
- [ ] `.env.production` updated with production secrets from KeePassXC
- [ ] Docker Compose services start successfully
- [ ] Python CLIs can connect to database
- [ ] Production scripts can connect to Lightsail
- [ ] Old environment files backed up
- [ ] Old environment files deleted
- [ ] `.gitignore` updated to protect new files

## Rollback Plan

If something breaks:

```bash
# Restore from backup
cp ~/chronos-env-backup/.env.aws .env.aws
cp ~/chronos-env-backup/apps-web-env.local apps/web/.env.local
# ... restore other files as needed

# Revert code changes
git checkout scripts/add-permissions-sql.ts
git checkout scripts/fix-data-collections.ts
git checkout docker-compose.yml
git checkout docker-compose.override.yml
```

## Notes

- **Never commit** `.env.local` or `.env.production` to git
- Store production secrets in KeePassXC
- Use `.env.example` as the source of truth for required variables
- MCP server variables are only needed if using Claude Desktop integration
- Vercel deployment uses Vercel's environment variable UI, not `.env` files
