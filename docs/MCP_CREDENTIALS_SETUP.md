# MCP Credentials Setup Guide

This guide helps you gather all required credentials for MCP servers.

## 1. Atlassian (Jira/Confluence)

**Instance URL**: `https://automatonicai.atlassian.net`

### Get Your Atlassian API Token:

1. **Go to**: https://id.atlassian.com/manage-profile/security/api-tokens
2. **Click**: "Create API token"
3. **Name**: "Claude Code MCP" or "Project Chronos MCP"
4. **Copy the token** (you won't see it again!)

### Required Environment Variables:
```bash
export ATLASSIAN_INSTANCE_URL="https://automatonicai.atlassian.net"
export ATLASSIAN_EMAIL="your-atlassian-email@domain.com"
export ATLASSIAN_API_TOKEN="your-generated-token"
```

**What email do you use for Atlassian?** Likely `geoff@automatonicai.com` or `axiologycapital@gmail.com`

---

## 2. Sentry

### Find Your Organization Slug:

1. **Go to**: https://sentry.io/
2. **Look at the URL** when viewing your organization: `https://sentry.io/organizations/YOUR-ORG-SLUG/`
3. **Or check**: Settings → General Settings → Organization Slug

### Required Environment Variable:
```bash
export SENTRY_ORG_SLUG="your-org-slug"
```

**Do you have a Sentry account set up?** If not, we can skip this for now.

---

## 3. Directus (Your CMS)

**URL**: `https://admin.automatonicai.com`

### Required Environment Variables:
```bash
export DIRECTUS_URL="https://admin.automatonicai.com"
export DIRECTUS_EMAIL="your-directus-admin-email"
export DIRECTUS_PASSWORD="your-directus-admin-password"
```

**What credentials do you use to log into Directus?**

---

## 4. TwentyCRM (Self-Hosted)

**URL**: `https://crm.automatonicai.com`
**Running on**: Your Lightsail instance (16.52.210.100)

### Get API Key:

1. **Log into TwentyCRM**: https://crm.automatonicai.com
2. **Go to**: Settings → API Keys
3. **Create new API key**: Name it "Claude Code MCP"
4. **Copy the key**

### Required Environment Variables:
```bash
export TWENTY_API_URL="https://crm.automatonicai.com"
export TWENTY_API_KEY="your-api-key"
```

**Note**: Your TwentyCRM database credentials are already in KeePassXC:
- User: `twenty_user`
- Password: `TwentySecure2025!ChangeMe` (or check KeePassXC)

---

## 5. Google Workspace

This requires OAuth2 setup with Google Cloud Console.

### Steps:

1. **Go to**: https://console.cloud.google.com/
2. **Create a project** (or use existing)
3. **Enable APIs**: Gmail API, Drive API, Calendar API, Docs API
4. **Create OAuth 2.0 Credentials**:
   - Application type: Desktop app or Web application
   - Name: "Claude Code MCP"
5. **Download credentials JSON** or copy Client ID and Secret

### Required Environment Variables:
```bash
export GOOGLE_CLIENT_ID="your-client-id.apps.googleusercontent.com"
export GOOGLE_CLIENT_SECRET="your-client-secret"
```

**Do you have a Google Cloud project set up?** What Google Workspace email do you use?

---

## Quick Setup Script

Once you have all credentials, run this to add them to `~/.zshrc`:

```bash
cat >> ~/.zshrc << 'EOF'

# ============================================================================
# MCP Credentials - Additional Services
# ============================================================================

# Atlassian (Jira/Confluence)
export ATLASSIAN_INSTANCE_URL="https://automatonicai.atlassian.net"
export ATLASSIAN_EMAIL="YOUR_EMAIL"
export ATLASSIAN_API_TOKEN="YOUR_TOKEN"

# Sentry (Optional - skip if not using)
export SENTRY_ORG_SLUG="YOUR_ORG_SLUG"

# Directus CMS
export DIRECTUS_URL="https://admin.automatonicai.com"
export DIRECTUS_EMAIL="YOUR_EMAIL"
export DIRECTUS_PASSWORD="YOUR_PASSWORD"

# TwentyCRM
export TWENTY_API_URL="https://crm.automatonicai.com"
export TWENTY_API_KEY="YOUR_API_KEY"

# Google Workspace
export GOOGLE_CLIENT_ID="YOUR_CLIENT_ID"
export GOOGLE_CLIENT_SECRET="YOUR_CLIENT_SECRET"
EOF

source ~/.zshrc
```

---

## Verification

After setting up, verify your MCPs:

```bash
./scripts/setup-mcps.sh
```

This will check which environment variables are set and which are missing.
