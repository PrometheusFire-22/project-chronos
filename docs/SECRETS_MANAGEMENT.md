# Secrets Management Guide

All API tokens, passwords, and access keys for project-chronos infrastructure.

**IMPORTANT**: Store this information in KeePassXC. Never commit actual secrets to git.

---

## 🔑 Required Secrets

### 1. NX Cloud Access Token

**Where to get it:**
1. Go to: https://cloud.nx.app/orgs/[YOUR-ORG]/workspaces/[YOUR-WORKSPACE]/settings
2. Click "General" tab
3. Scroll to "CI access tokens"
4. Click "Generate a CI access token"
5. Name it: `cloudflare-pages-ci`
6. Copy the token immediately (only shown once!)

**Where to use it:**

**Local Development:**
```bash
# Add to .env.local (never commit this file!)
echo "NX_CLOUD_ACCESS_TOKEN=your-token-here" >> apps/web/.env.local
```

**Cloudflare Pages (CI/CD):**
1. Go to: https://dash.cloudflare.com/
2. Workers & Pages → project-chronos → Settings
3. Environment variables → Add variable
   - Variable name: `NX_CLOUD_ACCESS_TOKEN`
   - Value: [paste your token]
   - Environment: Production AND Preview

**GitHub Actions (future):**
```yaml
# Add to GitHub Secrets: Settings → Secrets and variables → Actions
# Name: NX_CLOUD_ACCESS_TOKEN
# Value: [paste your token]
```

**KeePassXC Entry:**
- **Title**: NX Cloud CI Access Token
- **Username**: project-chronos
- **Password**: [your token]
- **URL**: https://cloud.nx.app
- **Notes**: Read-write token for CI/CD pipelines. Do not share with developers.

---

### 2. Directus Admin Credentials

**Current Credentials:**
- **URL**: https://admin.automatonicai.com
- **Email**: geoff@automatonicai.com
- **Password**: `\;XEnIw36}?;R$.49U3N`

**Where used:**
- Manual CMS content editing
- API scripts for bulk updates
- MCP integration for AI agents

**KeePassXC Entry:**
- **Title**: Directus CMS Admin
- **Username**: geoff@automatonicai.com
- **Password**: `\;XEnIw36}?;R$.49U3N`
- **URL**: https://admin.automatonicai.com
- **Notes**: Full admin access to CMS. Used by MCP for content management.

**Security Note:** This password contains special characters. When using in scripts, properly escape or use environment variables.

---

### 3. Sentry DSN & Auth Token

**Data Source Name (DSN):**
```
https://06df85f7ae02776b47547a4bb60ba846@o4510559645925376.ingest.us.sentry.io/4510559662309376
```

**Where used:**
- `apps/web/sentry.client.config.ts`
- `apps/web/sentry.server.config.ts`
- `apps/web/instrumentation.ts`

**Auth Token (for source maps upload):**
- **Where to get**: https://automatonic-ai.sentry.io/settings/account/api/auth-tokens/
- **Scopes needed**: `project:releases`, `org:read`
- **Where to use**: GitHub Secrets or Cloudflare env vars (for automated source map uploads)

**KeePassXC Entry:**
- **Title**: Sentry Error Tracking
- **Username**: geoff@automatonicai.com
- **Password**: [Sentry auth token]
- **URL**: https://automatonic-ai.sentry.io
- **Notes**:
  - DSN (public, safe to commit): [paste DSN]
  - Auth token (private): Keep secret
  - Organization: automatonic-ai
  - Project: project-chronos-web

---

### 4. Atlassian (Jira/Confluence) API Token

**Current Token:**
```
ATATT3xFfGF0***************[REDACTED - Store in KeePassXC]***************
```

**Where used:**
- `~/.zshrc` (ATLASSIAN_API_TOKEN)
- MCP integration for AI-assisted Jira management
- CLI tool `acli` for ticket creation

**KeePassXC Entry:**
- **Title**: Atlassian Cloud API Token
- **Username**: geoff@automatonicai.com
- **Password**: [paste token above]
- **URL**: https://automatonicai.atlassian.net
- **Notes**:
  - Used by acli CLI tool
  - MCP integration for AI agents
  - Full access to Jira and Confluence

---

### 5. TwentyCRM API Key

**Current Key:**
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIwZmVmNjI1My1hODA1LTQzYzMtODU0YS03MjU4NDcyOTE3MjIiLCJ0eXBlIjoiQVBJX0tFWSIsIndvcmtzcGFjZUlkIjoiMGZlZjYyNTMtYTgwNS00M2MzLTg1NGEtNzI1ODQ3MjkxNzIyIiwiaWF0IjoxNzY3MjAxOTI1LCJleHAiOjQ5MjA4MDE5MjQsImp0aSI6ImExODY3YmVhLTYwY2ItNGI0Zi05NTFmLTkyNjM3YmY4MzcwMiJ9.l4-YrCYMAJLz7fr4y9WyhUL4qpY0YPNNxqKP7cqa8t0
```

**Where used:**
- `~/.zshrc` (TWENTY_API_KEY)
- MCP integration for CRM management

**KeePassXC Entry:**
- **Title**: TwentyCRM API Key
- **Username**: API
- **Password**: [paste JWT token above]
- **URL**: https://crm.automatonicai.com
- **Notes**:
  - Workspace ID: 0fef6253-a805-43c3-854a-725847291722
  - Expiration: 2118 (long-lived token)
  - MCP integration

---

### 6. Brave Search API Key

**Current Key:**
```
BSAFGO***************[REDACTED - Store in KeePassXC]***************
```

**Where used:**
- `~/.zshrc` (BRAVE_API_KEY)
- MCP integration for web search capabilities

**KeePassXC Entry:**
- **Title**: Brave Search API
- **Username**: API
- **Password**: [Store actual key in KeePassXC]
- **URL**: https://brave.com/search/api/
- **Notes**: Free tier, used for MCP web search

---

### 7. GitHub Personal Access Token

**Where to get:**
1. Go to: https://github.com/settings/tokens
2. Generate new token (classic)
3. Scopes needed:
   - `repo` (full control)
   - `workflow` (if using GitHub Actions)
4. Copy token immediately

**Where used:**
- `~/.zshrc` (GITHUB_TOKEN)
- Git operations with MCP
- CI/CD authentication

**KeePassXC Entry:**
- **Title**: GitHub Personal Access Token
- **Username**: PrometheusFire-22
- **Password**: ghp_... (your token)
- **URL**: https://github.com
- **Notes**:
  - Scopes: repo, workflow
  - Used for MCP Git integration
  - Regenerate annually for security

---

### 8. AWS Lightsail Database Password

**Where to find:**
1. AWS Console: https://lightsail.aws.amazon.com/
2. Databases → [your-db-name] → Connect tab

**Where used:**
- `~/.zshrc` (POSTGRES_PASSWORD)
- Database connections
- MCP Postgres integration

**KeePassXC Entry:**
- **Title**: AWS Lightsail PostgreSQL
- **Username**: postgres
- **Password**: [your DB password]
- **URL**: 16.52.210.100:5432
- **Notes**:
  - Database name: [your db name]
  - Used by MCP Postgres integration
  - Production database - handle with care!

---

### 9. Cloudflare API Token

**Where to get:**
1. Cloudflare Dashboard: https://dash.cloudflare.com/profile/api-tokens
2. Create Token → Custom token
3. Permissions needed:
   - Account → Cloudflare Pages → Edit
   - Zone → DNS → Edit (if needed)

**Where used:**
- Automated deployments
- DNS management scripts
- Cache purging automation

**KeePassXC Entry:**
- **Title**: Cloudflare API Token
- **Username**: geoff@automatonicai.com
- **Password**: [your API token]
- **URL**: https://dash.cloudflare.com
- **Notes**:
  - Permissions: Pages Edit, DNS Edit
  - Used for deployment automation

---

### 10. Resend API Key (Future)

**Status**: Not yet configured (see CHRONOS-384)

**Where to get:**
1. Sign up: https://resend.com
2. Generate API key from dashboard

**KeePassXC Entry:**
- **Title**: Resend Email API
- **Username**: API
- **Password**: [your API key]
- **URL**: https://resend.com
- **Notes**: Email sending for waitlist confirmations

---

## 🔒 Security Best Practices

### Environment Variable Management

**Local Development (.env.local):**
```bash
# Never commit this file! It's in .gitignore
NEXT_PUBLIC_DIRECTUS_URL=https://admin.automatonicai.com
NX_CLOUD_ACCESS_TOKEN=your-nx-token
DIRECTUS_EMAIL=geoff@automatonicai.com
DIRECTUS_PASSWORD=your-password
```

**Cloudflare Pages (Production):**
- Store all secrets as Environment Variables in Cloudflare dashboard
- Use different values for Preview vs Production if needed

**Shell Profile (~/.zshrc):**
```bash
# MCP Configuration - loaded for AI agent access
export GITHUB_TOKEN="your-token"
export ATLASSIAN_API_TOKEN="your-token"
export DIRECTUS_EMAIL="your-email"
export DIRECTUS_PASSWORD="your-password"
export TWENTY_API_KEY="your-key"
export BRAVE_API_KEY="your-key"
export POSTGRES_PASSWORD="your-password"
```

### Rotation Schedule

**Immediate (if compromised):**
- All API tokens
- Database passwords

**Quarterly:**
- Atlassian API token
- GitHub PAT
- Cloudflare API token

**Annually:**
- Directus admin password
- AWS Lightsail database password

### Detection of Leaks

**Pre-commit hook** (already configured):
- GitGuardian scans every commit for secrets
- Blocks commits with exposed tokens

**What to do if leaked:**
1. Revoke the token immediately
2. Generate new token
3. Update all locations (KeePassXC, env vars, CI/CD)
4. Review git history for exposure
5. Consider rotating dependent secrets

---

## 📋 Quick Reference

| Service | URL | Username | Env Var |
|---------|-----|----------|---------|
| Directus | admin.automatonicai.com | geoff@ | DIRECTUS_PASSWORD |
| Sentry | automatonic-ai.sentry.io | geoff@ | SENTRY_AUTH_TOKEN |
| NX Cloud | cloud.nx.app | GitHub | NX_CLOUD_ACCESS_TOKEN |
| Jira | automatonicai.atlassian.net | geoff@ | ATLASSIAN_API_TOKEN |
| TwentyCRM | crm.automatonicai.com | API | TWENTY_API_KEY |
| GitHub | github.com | PrometheusFire-22 | GITHUB_TOKEN |
| Cloudflare | dash.cloudflare.com | geoff@ | CF_API_TOKEN |
| AWS Lightsail | lightsail.aws.amazon.com | - | POSTGRES_PASSWORD |
| Brave Search | brave.com/search/api | - | BRAVE_API_KEY |

---

## 🆘 Emergency Contacts

**If locked out of critical services:**

1. **Directus CMS**:
   - Access server directly via SSH
   - Reset password via SQL: `UPDATE directus_users SET password = crypt('new-password', gen_salt('bf')) WHERE email = 'geoff@automatonicai.com';`

2. **AWS Lightsail**:
   - Use AWS root account recovery
   - Contact: AWS Support

3. **GitHub**:
   - Account recovery: https://github.com/login/recovery
   - 2FA recovery codes (store in KeePassXC!)

4. **Cloudflare**:
   - Account recovery via email
   - 2FA recovery (store codes in KeePassXC!)

---

**Last Updated**: 2025-12-31
**Maintained By**: Geoff (geoff@automatonicai.com)
**Stored In**: KeePassXC Database (project-chronos-secrets.kdbx)
