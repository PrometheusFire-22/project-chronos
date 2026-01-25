# Environment Migration - Next Steps for User

## ✅ Completed Automatically

1. **Created `.env.local` for local development**
   ```bash
   ✅ Copied .env.example → .env.local (7.5K)
   ```

2. **Verified AWS Lightsail Environment**
   ```bash
   ✅ SSH connection successful
   ✅ Environment file exists at ~/chronos-db/.env
   ✅ Configuration verified:
      - POSTGRES_USER=chronos
      - POSTGRES_DB=chronos
      - DIRECTUS_DB_USER=chronos
      - DIRECTUS_ADMIN_EMAIL=geoff@automatonicai.com
      - Cloudflare R2 Storage configured
      - R2 Bucket: chronos-media
      - R2 Public URL: https://media.automatonicai.com
   ```

---

## 🔧 Action Required: Complete These Steps

### Step 1: Edit `.env.local` with Your Local Values

The file has been created but needs your local configuration:

```bash
# Open in your editor
nano .env.local
# or
code .env.local
```

**Key variables to update:**

```bash
# Database (for local Docker)
DATABASE_USER=chronos_user
DATABASE_PASSWORD=your_local_password_here

# pgAdmin
PGADMIN_EMAIL=admin@example.com
PGADMIN_PASSWORD=your_pgadmin_password_here

# API Keys
FRED_API_KEY=your_fred_api_key_here

# Optional: MCP Server tokens (only if using Claude Desktop)
GITHUB_TOKEN=your_github_token_here
BRAVE_API_KEY=your_brave_api_key_here
RESEND_API_KEY=your_resend_api_key_here
```

**Leave these as-is for local development:**
- `DATABASE_HOST=timescaledb` (Docker container name)
- `NEXT_PUBLIC_TURNSTILE_SITE_KEY=1x00000000000000000000AA` (test key)

---

### Step 2: Update `.env.production` with Production Secrets

The file exists but has placeholder values. Retrieve actual secrets from KeePassXC:

```bash
# Open in your editor
nano .env.production
```

**Critical secrets to update from KeePassXC:**

```bash
# Database
DATABASE_PASSWORD=<retrieve-from-keepassxc>

# Directus
DIRECTUS_KEY=<retrieve-from-keepassxc>
DIRECTUS_SECRET=<retrieve-from-keepassxc>
DIRECTUS_ADMIN_PASSWORD=<retrieve-from-keepassxc>

# Cloudflare R2
STORAGE_R2_KEY=<retrieve-from-keepassxc>
STORAGE_R2_SECRET=<retrieve-from-keepassxc>

# AWS S3 (if using)
S3_ACCESS_KEY_ID=<retrieve-from-keepassxc>
S3_SECRET_ACCESS_KEY=<retrieve-from-keepassxc>

# External APIs
FRED_API_KEY=<retrieve-from-keepassxc>
CLOUDFLARE_API_TOKEN=<retrieve-from-keepassxc>
TURNSTILE_SECRET_KEY=<retrieve-from-keepassxc>

# Monitoring
SENTRY_AUTH_TOKEN=<retrieve-from-keepassxc>
NX_CLOUD_ACCESS_TOKEN=<retrieve-from-keepassxc>

# MCP Servers (if using)
GITHUB_TOKEN=<retrieve-from-keepassxc>
BRAVE_API_KEY=<retrieve-from-keepassxc>
RESEND_API_KEY=<retrieve-from-keepassxc>
ATLASSIAN_API_TOKEN=<retrieve-from-keepassxc>
TWENTY_API_KEY=<retrieve-from-keepassxc>
```

---

### Step 3: Verify Cloudflare Pages Environment Variables (GUI)

**Navigate to:**
https://dash.cloudflare.com/060e43df09e3ec3a256a6624ab7649f8/pages

**Steps:**
1. Select your project (likely `project-chronos-web` or similar)
2. Go to **Settings** → **Environment variables**
3. Verify these variables exist for **Production** environment:

**Required Variables:**
```bash
✅ DATABASE_URL=postgresql://chronos:***@16.52.210.100:5432/chronos
✅ NEXT_PUBLIC_DIRECTUS_URL=https://admin.automatonicai.com
✅ NEXT_PUBLIC_SERVER_URL=https://automatonicai.com
✅ NEXT_PUBLIC_TURNSTILE_SITE_KEY=0x4AAAAAACQisT-KqYDph-VN
✅ TURNSTILE_SECRET_KEY=<secret>
✅ RESEND_API_KEY=<secret>
✅ NODE_ENV=production
```

**Optional but recommended:**
```bash
SENTRY_AUTH_TOKEN=<secret>
CLOUDFLARE_API_TOKEN=<secret>
```

4. **Important:** Set the same variables for **Preview** environment
5. If any are missing, add them using the "Add variable" button

---

### Step 4: Verify Lightsail Services (SSH)

Check that Docker services are running properly:

```bash
# SSH to Lightsail
ssh -i ~/.ssh/aws-lightsail/chronos-prod-db ubuntu@16.52.210.100

# Navigate to deployment directory
cd ~/chronos-db

# Check service status (use 'docker compose' not 'docker-compose')
docker compose ps

# Should show:
# NAME                STATUS              PORTS
# chronos-db          Up (healthy)        0.0.0.0:5432->5432/tcp
# chronos-directus    Up                  0.0.0.0:8055->8055/tcp

# Check Directus health
curl http://localhost:8055/server/health
# Should return: {"status":"ok"}

# Check Directus logs (if needed)
docker compose logs directus --tail 50

# Exit SSH
exit
```

---

### Step 5: Test Local Development

After editing `.env.local`:

```bash
# Start Docker Compose
docker-compose up -d

# Check services
docker-compose ps

# Should show:
# chronos-app         Up
# chronos-db          Up (healthy)
# chronos-directus    Up
# chronos-pgadmin     Up
# chronos-metabase    Up

# Test Next.js dev server
pnpm dev

# Open browser to:
# - http://localhost:3000 (web app)
# - http://localhost:8055 (Directus)
# - http://localhost:5050 (pgAdmin)
```

---

### Step 6: Test Production Scripts

After editing `.env.production`:

```bash
# Test database permissions script
tsx scripts/add-permissions-sql.ts

# Test Directus collections script
tsx scripts/fix-data-collections.ts

# Both should connect to Lightsail production database
```

---

## 📋 Verification Checklist

Use this to track your progress:

- [ ] `.env.local` edited with local values
- [ ] `.env.production` updated with secrets from KeePassXC
- [ ] Cloudflare Pages environment variables verified
- [ ] Lightsail Docker services running (via SSH)
- [ ] Local Docker Compose starts successfully
- [ ] Local Next.js dev server runs (`pnpm dev`)
- [ ] Production scripts connect to Lightsail
- [ ] Can access Directus at https://admin.automatonicai.com
- [ ] Can access web app at https://automatonicai.com

---

## 🚨 Common Issues

### Issue: Docker Compose fails locally

**Check:**
```bash
# Ensure .env.local exists
ls -la .env.local

# Check for syntax errors
cat .env.local | grep -E "^[A-Z]" | head -20
```

### Issue: Production scripts can't connect

**Check:**
```bash
# Verify .env.production has correct host
grep DATABASE_HOST .env.production
# Should show: DATABASE_HOST=16.52.210.100

# Test SSH connection
ssh -i ~/.ssh/aws-lightsail/chronos-prod-db ubuntu@16.52.210.100 "echo 'SSH OK'"
```

### Issue: Cloudflare Pages deployment fails

**Check:**
- All required environment variables are set
- Variables are set for BOTH Production AND Preview
- DATABASE_URL has correct password
- Trigger a new deployment after adding variables

---

## 📚 Reference Documentation

- **Full Migration Guide:** [docs/10-DEVELOPMENT/ENV-FILES-MIGRATION.md](file:///home/prometheus/coding/finance/project-chronos/docs/10-DEVELOPMENT/ENV-FILES-MIGRATION.md)
- **Environment Harmonization:** [docs/10-DEVELOPMENT/ENVIRONMENT-HARMONIZATION.md](file:///home/prometheus/coding/finance/project-chronos/docs/10-DEVELOPMENT/ENVIRONMENT-HARMONIZATION.md)
- **Walkthrough:** [walkthrough.md](file:///home/prometheus/.gemini/antigravity/brain/5ad775fb-bd81-4929-9b75-574c1b8a8240/walkthrough.md)

---

## 🎯 Quick Start Commands

```bash
# 1. Edit local environment
code .env.local

# 2. Edit production environment
code .env.production

# 3. Start local development
docker-compose up -d && pnpm dev

# 4. SSH to Lightsail
ssh -i ~/.ssh/aws-lightsail/chronos-prod-db ubuntu@16.52.210.100

# 5. Check Lightsail services
cd ~/chronos-db && docker compose ps
```

---

**Once you complete these steps, your environment will be fully consolidated and harmonized across all three deployment targets! 🎉**
