# Credential Rotation Guide & Security Hardening Status (CHRONOS-348)

> [!IMPORTANT]
> The following credentials were found to be exposed in the codebase and have been remediated in the utility scripts. **YOU MUST ROTATE THESE CREDENTIALS IMMEDIATELY** to ensure the security of your production environment.

## 🛡️ Remediated Secrets Checklist

| Secret Type | Status in Codebase | Action Required |
| :--- | :--- | :--- |
| **PostgreSQL URI** | ✅ Removed (Refactored to `.env`) | **Rotate Database Password** |
| **Payload CMS Secret** | ✅ Removed (Refactored to `.env`) | **Generate New Random Secret** |
| **Admin Email/Pass** | ✅ Removed (Refactored to `.env`) | **Change Admin Password** |
| **Server URL** | ✅ Removed (Refactored to `.env`) | None (Public Information) |

## 🔄 Rotation Instructions

### 1. Database Password
The PostgreSQL password for user `chronos` was exposed.
1. Connect to your database (using `psql` or pgAdmin).
2. Execute: `ALTER USER chronos WITH PASSWORD 'new_secure_password';`
3. Update specific environment variable in your local `.env`.
4. Update usage in Cloudflare / Vercel / GitHub Secrets.

### 2. Payload Secret
The `PAYLOAD_SECRET` was hardcoded.
1. Generate a new high-entropy string (e.g., `openssl rand -hex 32`).
2. Update `PAYLOAD_SECRET` in your local `.env`.
3. Redeploy your application to pick up the change.

### 3. Admin User
The initial admin account `geoff@automatonicai.com` had a hardcoded password.
1. Log in to the admin panel at `https://automatonicai.com/admin`.
2. Go to the **Users** collection.
3. Select your user and change the password manually.

## 📂 Developer Workflow Changes
All utility scripts in `scripts/` now enforce the use of environment variables. 
**Do not hardcode secrets again.**

### How to use scripts now:
```bash
# Sourcing .env before running (Recommended)
export $(grep -v '^#' .env | xargs) && node scripts/check-db-state.mjs

# Or passing variables Inline
DATABASE_URL=postgres://... node scripts/check-db-state.mjs
```

### New `.env` Keys
Ensure your local `.env` includes:
```ini
POSTGRES_URL=...
PAYLOAD_SECRET=...
NEXT_PUBLIC_SERVER_URL=...
ADMIN_EMAIL=...
ADMIN_PASSWORD=...
```
