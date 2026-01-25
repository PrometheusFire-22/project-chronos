# Environment Variables Harmonization Guide

## Overview

Project Chronos has **3 deployment environments** that must be kept in sync:

1. **Local Development** - Docker Compose on your machine
2. **AWS Lightsail Production** - PostgreSQL + Directus CMS
3. **Cloudflare Pages** - Next.js web application

This guide ensures all environments use consistent variable names and values.

---

## File Structure

```
project-chronos/
├── .env.example              # Template (committed to git)
├── .env.local                # Local development secrets (git-ignored)
├── .env.production           # Production secrets reference (git-ignored)
└── deployment/
    └── lightsail/
        └── .env              # Lightsail-specific config (git-ignored)
```

---

## Environment-Specific Configuration

### 1. Local Development (`.env.local`)

**Used by:**
- Docker Compose (`docker-compose.yml`, `docker-compose.override.yml`)
- Python CLIs (`timeseries_cli.py`, `geospatial_cli.py`)
- Local Next.js development (`pnpm dev`)

**Key Variables:**
```bash
# Database (Docker container)
DATABASE_HOST=timescaledb
DATABASE_PORT=5432
DATABASE_NAME=chronos_db
DATABASE_USER=chronos_user
DATABASE_PASSWORD=your_local_password

# Directus (Docker container)
DIRECTUS_ADMIN_EMAIL=admin@example.com
DIRECTUS_ADMIN_PASSWORD=your_local_password

# Development URLs
NEXT_PUBLIC_SERVER_URL=http://localhost:3000
NEXT_PUBLIC_API_URL=http://localhost:3002

# API Keys (use test keys locally)
FRED_API_KEY=your_fred_api_key
NEXT_PUBLIC_TURNSTILE_SITE_KEY=1x00000000000000000000AA  # Test key
TURNSTILE_SECRET_KEY=1x0000000000000000000000000000000AA  # Test key
```

**Create from template:**
```bash
cp .env.example .env.local
# Edit .env.local with your local values
```

---

### 2. AWS Lightsail Production (`deployment/lightsail/.env`)

**Used by:**
- Docker Compose on Lightsail VM (`~/chronos-db/docker-compose.yml`)
- TimescaleDB container
- Directus CMS container

**Key Variables:**
```bash
# Database (production)
POSTGRES_USER=chronos
POSTGRES_PASSWORD=<from-keepassxc>
POSTGRES_DB=chronos

# Directus CMS
DIRECTUS_DB_USER=chronos
DIRECTUS_DB_PASSWORD=<from-keepassxc>
DIRECTUS_KEY=<from-keepassxc>
DIRECTUS_SECRET=<from-keepassxc>
DIRECTUS_ADMIN_EMAIL=geoff@automatonicai.com
DIRECTUS_ADMIN_PASSWORD=<from-keepassxc>

# Cloudflare R2 Storage (for Directus media)
STORAGE_LOCATIONS=r2
STORAGE_R2_DRIVER=s3
STORAGE_R2_KEY=<from-keepassxc>
STORAGE_R2_SECRET=<from-keepassxc>
STORAGE_R2_BUCKET=chronos-media
STORAGE_R2_ENDPOINT=https://060e43df09e3ec3a256a6624ab7649f8.r2.cloudflarestorage.com
STORAGE_R2_REGION=auto
STORAGE_R2_PUBLIC_URL=https://media.automatonicai.com
```

**Deployment location:** `/home/ubuntu/chronos-db/.env` on Lightsail VM

---

### 3. Cloudflare Pages (`apps/web`)

**Used by:**
- Next.js application deployed to Cloudflare Pages
- Cloudflare Workers/Functions

**Configure via Cloudflare Dashboard:**
1. Go to [Cloudflare Pages Dashboard](https://dash.cloudflare.com/060e43df09e3ec3a256a6624ab7649f8/pages)
2. Select **project-chronos-web**
3. Go to **Settings** → **Environment variables**

**Required Variables:**

```bash
# Database (Lightsail PostgreSQL)
DATABASE_URL=postgresql://chronos:<password>@16.52.210.100:5432/chronos

# Directus CMS
NEXT_PUBLIC_DIRECTUS_URL=https://admin.automatonicai.com

# Application URLs
NEXT_PUBLIC_SERVER_URL=https://automatonicai.com
NEXT_PUBLIC_API_URL=https://api.automatonicai.com

# Cloudflare Turnstile (CAPTCHA)
NEXT_PUBLIC_TURNSTILE_SITE_KEY=0x4AAAAAACQisT-KqYDph-VN
TURNSTILE_SECRET_KEY=<from-keepassxc>

# Resend Email API
RESEND_API_KEY=<from-keepassxc>

# Sentry (Error Tracking)
SENTRY_AUTH_TOKEN=<from-keepassxc>

# Build Configuration
NODE_ENV=production
```

**Set for both Production AND Preview environments**

---

## Production Scripts (`.env.production`)

**Used by:**
- `scripts/add-permissions-sql.ts` - Database permission management
- `scripts/fix-data-collections.ts` - Directus collection configuration
- `scripts/create-first-user-production.mjs` - Admin user creation

**Key Variables:**
```bash
# Production Database (Lightsail)
DATABASE_HOST=16.52.210.100
DATABASE_PORT=5432
DATABASE_NAME=chronos
DATABASE_USER=chronos
DATABASE_PASSWORD=<from-keepassxc>

# Directus Production
DIRECTUS_URL=https://admin.automatonicai.com
DIRECTUS_ADMIN_EMAIL=geoff@automatonicai.com
DIRECTUS_ADMIN_PASSWORD=<from-keepassxc>

# External APIs
FRED_API_KEY=<from-keepassxc>
```

---

## Variable Mapping Across Environments

| Purpose | Local | Lightsail | Cloudflare Pages |
|---------|-------|-----------|------------------|
| **Database Host** | `timescaledb` | `timescaledb` (container) | `16.52.210.100` (via Hyperdrive) |
| **Database Name** | `chronos_db` | `chronos` | `chronos` |
| **Database User** | `chronos_user` | `chronos` | `chronos` |
| **Directus URL** | `http://localhost:8055` | `https://admin.automatonicai.com` | `https://admin.automatonicai.com` |
| **App URL** | `http://localhost:3000` | N/A | `https://automatonicai.com` |
| **Turnstile** | Test keys | N/A | Production keys |
| **Storage** | Local volumes | Cloudflare R2 | Cloudflare R2 (via Directus) |

---

## Harmonization Checklist

### ✅ Step 1: Update Local Development

```bash
# Create .env.local from template
cp .env.example .env.local

# Edit with your local values
nano .env.local

# Test Docker Compose
docker-compose up -d
docker-compose ps
```

### ✅ Step 2: Verify Lightsail Production

**SSH to Lightsail:**
```bash
ssh -i ~/.ssh/aws-lightsail/chronos-prod-db ubuntu@16.52.210.100
```

**Check environment file:**
```bash
cd ~/chronos-db
cat .env | grep -v PASSWORD  # View (hide passwords)
```

**Verify services:**
```bash
docker-compose ps
docker logs chronos-directus --tail 50
curl http://localhost:8055/server/health
```

**Required variables in `/home/ubuntu/chronos-db/.env`:**
- ✅ `POSTGRES_USER=chronos`
- ✅ `POSTGRES_PASSWORD=<secret>`
- ✅ `POSTGRES_DB=chronos`
- ✅ `DIRECTUS_KEY=<secret>`
- ✅ `DIRECTUS_SECRET=<secret>`
- ✅ `STORAGE_R2_KEY=<secret>`
- ✅ `STORAGE_R2_SECRET=<secret>`

### ✅ Step 3: Update Cloudflare Pages

**Via Cloudflare Dashboard:**

1. Navigate to: https://dash.cloudflare.com/060e43df09e3ec3a256a6624ab7649f8/pages/view/project-chronos-web/settings/environment-variables

2. Verify these variables exist for **Production** environment:
   - ✅ `DATABASE_URL`
   - ✅ `NEXT_PUBLIC_DIRECTUS_URL`
   - ✅ `NEXT_PUBLIC_SERVER_URL`
   - ✅ `NEXT_PUBLIC_TURNSTILE_SITE_KEY`
   - ✅ `TURNSTILE_SECRET_KEY`
   - ✅ `RESEND_API_KEY`

3. Add any missing variables

4. Trigger redeployment:
   ```bash
   git push origin main
   # Or use Cloudflare Pages UI: "Retry deployment"
   ```

### ✅ Step 4: Update Production Scripts Reference

```bash
# Edit .env.production with production values
nano .env.production

# Test production scripts (dry-run)
tsx scripts/add-permissions-sql.ts
```

---

## Common Issues & Solutions

### Issue: Docker Compose can't find `.env.local`

**Solution:**
```bash
# Ensure .env.local exists in project root
ls -la .env.local

# If missing, create from template
cp .env.example .env.local
```

### Issue: Cloudflare Pages can't connect to database

**Solution:**
1. Check Cloudflare Hyperdrive configuration
2. Verify Lightsail security group allows Cloudflare IPs
3. Test database connectivity from Cloudflare Worker

### Issue: Directus can't access R2 storage

**Solution:**
1. Verify R2 credentials in Lightsail `.env`
2. Check R2 bucket CORS configuration
3. Verify public URL is accessible

### Issue: Production scripts fail with "env not found"

**Solution:**
```bash
# Ensure .env.production exists
ls -la .env.production

# Scripts now use .env.production (not .env.aws)
# Update from KeePassXC if needed
```

---

## Security Best Practices

1. **Never commit secrets to git**
   - `.env.local` ✅ git-ignored
   - `.env.production` ✅ git-ignored
   - `deployment/lightsail/.env` ✅ git-ignored

2. **Store production secrets in KeePassXC**
   - Database passwords
   - API keys
   - Directus admin credentials
   - R2 storage keys

3. **Use different secrets per environment**
   - Local: Simple passwords for development
   - Production: Strong, unique passwords from KeePassXC

4. **Rotate secrets regularly**
   - Database passwords: Every 90 days
   - API keys: When compromised
   - Directus keys: After team member changes

---

## Deployment Workflow

### Local Development
```bash
# 1. Update .env.local
nano .env.local

# 2. Restart services
docker-compose restart

# 3. Test
pnpm dev
```

### AWS Lightsail
```bash
# 1. SSH to VM
ssh -i ~/.ssh/aws-lightsail/chronos-prod-db ubuntu@16.52.210.100

# 2. Update .env
cd ~/chronos-db
nano .env

# 3. Restart services
docker-compose restart

# 4. Verify
docker-compose ps
curl http://localhost:8055/server/health
```

### Cloudflare Pages
```bash
# 1. Update via Dashboard
# https://dash.cloudflare.com/.../environment-variables

# 2. Trigger deployment
git push origin main

# 3. Monitor deployment
# https://dash.cloudflare.com/.../deployments
```

---

## Quick Reference

### Environment Files Location

| Environment | File Path | Access |
|-------------|-----------|--------|
| Local | `./env.local` | Local filesystem |
| Lightsail | `/home/ubuntu/chronos-db/.env` | SSH to VM |
| Cloudflare | Dashboard UI | Web browser |
| Scripts | `./.env.production` | Local filesystem |

### Service URLs

| Service | Local | Production |
|---------|-------|------------|
| Web App | http://localhost:3000 | https://automatonicai.com |
| Directus | http://localhost:8055 | https://admin.automatonicai.com |
| Database | localhost:5432 | 16.52.210.100:5432 |
| pgAdmin | http://localhost:5050 | N/A |

---

## Related Documentation

- [ENV-FILES-MIGRATION.md](./ENV-FILES-MIGRATION.md) - Migration from old env files
- [cloudflare-env-vars.md](../deployment/cloudflare-env-vars.md) - Cloudflare-specific config
- [deployment/lightsail/README.md](../../deployment/lightsail/README.md) - Lightsail deployment guide
