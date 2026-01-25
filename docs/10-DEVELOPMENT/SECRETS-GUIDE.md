# Required Secrets from KeePassXC

## Overview

Both `.env.local` and `.env.production` have placeholders `<retrieve-from-keepassxc>` that need to be replaced with actual secrets.

**Total Secrets Needed**: 11

---

## Critical Secrets (Required for Testing)

### 1. DATABASE_PASSWORD
**Location in KeePassXC**: `Chronos / Production Database / PostgreSQL`  
**Used in**: `.env.local`, `.env.production`  
**Purpose**: Connect to production PostgreSQL database (16.52.210.100)

```bash
# In both .env.local and .env.production
DATABASE_PASSWORD=<your-actual-password-here>
```

**Why needed**: Required for database connectivity tests and production scripts

---

### 2. DIRECTUS_KEY
**Location in KeePassXC**: `Chronos / Directus CMS / Key`  
**Used in**: `.env.local`, `.env.production`  
**Purpose**: Directus encryption key (64 characters)

```bash
DIRECTUS_KEY=<your-64-char-key-here>
```

**Why needed**: Required for Directus CMS to function

---

### 3. DIRECTUS_SECRET
**Location in KeePassXC**: `Chronos / Directus CMS / Secret`  
**Used in**: `.env.local`, `.env.production`  
**Purpose**: Directus secret key (64 characters)

```bash
DIRECTUS_SECRET=<your-64-char-secret-here>
```

**Why needed**: Required for Directus CMS authentication

---

### 4. DIRECTUS_ADMIN_PASSWORD
**Location in KeePassXC**: `Chronos / Directus CMS / Admin Password`  
**Used in**: `.env.local`, `.env.production`  
**Purpose**: Directus admin user password

```bash
DIRECTUS_ADMIN_PASSWORD=<your-admin-password-here>
```

**Why needed**: Required for Directus admin access

---

## Storage Secrets (Required for Media)

### 5. STORAGE_R2_KEY
**Location in KeePassXC**: `Chronos / Cloudflare R2 / Access Key`  
**Used in**: `.env.local`, `.env.production`  
**Purpose**: Cloudflare R2 storage access key

```bash
STORAGE_R2_KEY=<your-r2-access-key-here>
```

**Why needed**: Required for Directus to store media in R2

---

### 6. STORAGE_R2_SECRET
**Location in KeePassXC**: `Chronos / Cloudflare R2 / Secret Key`  
**Used in**: `.env.local`, `.env.production`  
**Purpose**: Cloudflare R2 storage secret key

```bash
STORAGE_R2_SECRET=<your-r2-secret-key-here>
```

**Why needed**: Required for Directus to store media in R2

---

## Application Secrets

### 7. ADMIN_PASSWORD
**Location in KeePassXC**: `Chronos / Application / Admin Password`  
**Used in**: `.env.local`, `.env.production`  
**Purpose**: Application admin password

```bash
ADMIN_PASSWORD=<your-admin-password-here>
```

**Why needed**: Required for admin access to application

---

### 8. PAYLOAD_SECRET
**Location in KeePassXC**: `Chronos / Application / Payload Secret`  
**Used in**: `.env.local`, `.env.production`  
**Purpose**: Payload CMS secret (32 characters)

```bash
PAYLOAD_SECRET=<your-32-char-secret-here>
```

**Why needed**: Required if using Payload CMS

---

## External API Secrets

### 9. FRED_API_KEY
**Location in KeePassXC**: `Chronos / External APIs / FRED`  
**Used in**: `.env.local`, `.env.production`  
**Purpose**: Federal Reserve Economic Data API key

```bash
FRED_API_KEY=<your-fred-api-key-here>
```

**Why needed**: Required for economic data ingestion scripts

---

### 10. CLOUDFLARE_API_TOKEN
**Location in KeePassXC**: `Chronos / Cloudflare / API Token`  
**Used in**: `.env.local`, `.env.production`  
**Purpose**: Cloudflare API access token

```bash
CLOUDFLARE_API_TOKEN=<your-cloudflare-token-here>
```

**Why needed**: Required for Cloudflare services management

---

### 11. TURNSTILE_SECRET_KEY
**Location in KeePassXC**: `Chronos / Cloudflare / Turnstile Secret`  
**Used in**: `.env.local`, `.env.production`  
**Purpose**: Cloudflare Turnstile (CAPTCHA) secret key

```bash
TURNSTILE_SECRET_KEY=<your-turnstile-secret-here>
```

**Why needed**: Required for CAPTCHA verification

---

## Optional Secrets (MCP Servers)

These are only needed if you're using Claude Desktop with MCP servers:

- `GITHUB_TOKEN` - GitHub personal access token
- `BRAVE_API_KEY` - Brave Search API key
- `RESEND_API_KEY` - Resend email API key
- `ATLASSIAN_API_TOKEN` - Jira/Confluence API token
- `TWENTY_API_KEY` - TwentyCRM API key

**Note**: These are already in `.env.local` and `.env.production` but can be left as placeholders if not using MCP servers.

---

## How to Update Environment Files

### Step 1: Open KeePassXC

```bash
# Open your KeePassXC database
# Navigate to Chronos folder
```

### Step 2: Update .env.local

```bash
# Open .env.local in your editor
nano .env.local
# or
code .env.local

# Replace each <retrieve-from-keepassxc> with actual value
# Use Ctrl+F to find all instances
```

### Step 3: Update .env.production

```bash
# Open .env.production in your editor
nano .env.production
# or
code .env.production

# Replace each <retrieve-from-keepassxc> with actual value
```

### Step 4: Verify No Placeholders Remain

```bash
# Check .env.local
grep -n "<retrieve-from-keepassxc>" .env.local

# Check .env.production
grep -n "<retrieve-from-keepassxc>" .env.production

# Expected: No output (all placeholders replaced)
```

---

## Quick Reference: What Goes Where

| Secret | .env.local | .env.production | Priority |
|--------|------------|-----------------|----------|
| DATABASE_PASSWORD | ✅ | ✅ | **Critical** |
| DIRECTUS_KEY | ✅ | ✅ | **Critical** |
| DIRECTUS_SECRET | ✅ | ✅ | **Critical** |
| DIRECTUS_ADMIN_PASSWORD | ✅ | ✅ | **Critical** |
| STORAGE_R2_KEY | ✅ | ✅ | High |
| STORAGE_R2_SECRET | ✅ | ✅ | High |
| ADMIN_PASSWORD | ✅ | ✅ | High |
| PAYLOAD_SECRET | ✅ | ✅ | Medium |
| FRED_API_KEY | ✅ | ✅ | Medium |
| CLOUDFLARE_API_TOKEN | ✅ | ✅ | Medium |
| TURNSTILE_SECRET_KEY | ✅ | ✅ | Medium |

---

## Testing After Adding Secrets

### Test 1: Database Connectivity

```bash
# Test connection to production database
psql postgresql://chronos:${DATABASE_PASSWORD}@16.52.210.100:5432/chronos -c "SELECT version();"

# Expected: PostgreSQL version output
```

### Test 2: Production Scripts

```bash
# Test database permissions script
tsx scripts/add-permissions-sql.ts

# Test Directus collections script
tsx scripts/fix-data-collections.ts

# Expected: Both scripts connect successfully
```

### Test 3: Environment Variable Resolution

```bash
# Source .env.local
source .env.local

# Check DATABASE_URL is constructed correctly
echo $DATABASE_URL
# Expected: postgresql://chronos:***@16.52.210.100:5432/chronos

# Check DIRECTUS_KEY is set
echo ${DIRECTUS_KEY:0:10}...
# Expected: First 10 characters of your key
```

---

## Security Notes

⚠️ **NEVER commit .env.local or .env.production to git!**

These files are already in `.gitignore`:
```bash
# Check they're ignored
git check-ignore .env.local .env.production

# Expected output:
# .env.local
# .env.production
```

✅ **Safe to commit**:
- `.env.example` (template with no secrets)
- Documentation files
- Docker Compose files

❌ **Never commit**:
- `.env.local` (has secrets)
- `.env.production` (has secrets)

---

## Troubleshooting

### Issue: "Can't find secret in KeePassXC"

**Solution**: Secrets might be organized differently. Common locations:
- `Chronos/Production/Database`
- `Chronos/Cloudflare/R2`
- `Chronos/Directus`
- `Chronos/APIs`

### Issue: "Database connection fails after adding password"

**Check**:
```bash
# Verify password has no extra spaces
echo "${DATABASE_PASSWORD}" | wc -c

# Test connection manually
psql "postgresql://chronos:${DATABASE_PASSWORD}@16.52.210.100:5432/chronos" -c "SELECT 1;"
```

### Issue: "Directus won't start"

**Check**:
```bash
# Verify DIRECTUS_KEY and DIRECTUS_SECRET are 64 characters
echo ${DIRECTUS_KEY} | wc -c  # Should be 65 (64 + newline)
echo ${DIRECTUS_SECRET} | wc -c  # Should be 65 (64 + newline)
```

---

## Summary

**Minimum Required for Testing** (4 secrets):
1. DATABASE_PASSWORD
2. DIRECTUS_KEY
3. DIRECTUS_SECRET
4. DIRECTUS_ADMIN_PASSWORD

**Full Production Setup** (11 secrets):
All of the above plus:
5. STORAGE_R2_KEY
6. STORAGE_R2_SECRET
7. ADMIN_PASSWORD
8. PAYLOAD_SECRET
9. FRED_API_KEY
10. CLOUDFLARE_API_TOKEN
11. TURNSTILE_SECRET_KEY

Once these are added to both `.env.local` and `.env.production`, you can run the blocked tests and verify everything works before committing.
