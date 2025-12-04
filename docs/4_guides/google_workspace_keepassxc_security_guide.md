# Google Workspace Security & KeePassXC Tracking Guide

**Purpose:** Comprehensive guide for tracking all Google Workspace credentials, API keys, and security configurations in KeePassXC to maintain zero technical debt.

**Last Updated:** 2025-12-04  
**Owner:** PrometheusFire-22

---

## 📋 Overview

This guide ensures every Google Workspace credential, API key, and security configuration is properly tracked in KeePassXC. Following this prevents credential sprawl, security gaps, and technical debt.

**Key Principle:** If it's not in KeePassXC, it doesn't exist. Every credential must be documented.

---

## 🔐 KeePassXC Database Structure

### Recommended Folder Hierarchy

```
Chronos.kdbx
├── Google Workspace/
│   ├── Main Account
│   ├── Service Accounts/
│   │   └── chronos-workspace-automation
│   ├── API Keys/
│   │   ├── Gmail API
│   │   ├── Drive API
│   │   ├── Calendar API
│   │   └── Sheets API
│   ├── OAuth Credentials/
│   │   └── Desktop App Credentials
│   ├── Domain Configuration/
│   │   ├── DNS Records
│   │   └── Email Authentication
│   └── SSO Configurations/
│       ├── GitHub SSO
│       ├── Jira SSO
│       └── HubSpot SSO
```

---

## 📝 Entry Templates

### 1. Main Google Workspace Account

**Entry Name:** `Google Workspace - geoff@automatonicai.com`

**Basic Fields:**
- **Username:** `geoff@automatonicai.com`
- **Password:** [Your Google account password]
- **URL:** `https://admin.google.com`

**Custom Fields:**
- **Account Type:** `Google Workspace Admin`
- **Organization:** `Automatonic AI`
- **Domain:** `automatonicai.com`
- **Customer ID:** [From Admin Console → Account → Account Settings]
- **Recovery Email:** `axiologycapital@gmail.com`
- **Recovery Phone:** [Your phone number]
- **2FA Method:** `Google Authenticator`
- **2FA Backup Codes:** [10 backup codes from Google]

**Notes:**
```
Google Workspace Admin Account
- Super Admin privileges
- Used for: Admin console, billing, user management
- MFA: Google Authenticator (backed up via QR export)
- Break Glass Kit: Backup codes stored in home safe

Important URLs:
- Admin Console: https://admin.google.com
- Billing: https://admin.google.com/ac/billing
- API Console: https://console.cloud.google.com

Last Password Change: [Date]
Last Security Audit: [Date]
```

**Attachments:**
- `google-authenticator-qr-backup.png` (QR code export)
- `google-backup-codes.txt` (10 backup codes)

---

### 2. Google Cloud Project

**Entry Name:** `Google Cloud - project-chronos-workspace`

**Basic Fields:**
- **Username:** `geoff@automatonicai.com`
- **Password:** [Same as main account]
- **URL:** `https://console.cloud.google.com/home/dashboard?project=project-chronos-workspace`

**Custom Fields:**
- **Project ID:** `project-chronos-workspace`
- **Project Number:** [From Cloud Console]
- **Project Name:** `Project Chronos Workspace`
- **Billing Account:** [Billing account ID]
- **Organization ID:** [If applicable]

**Notes:**
```
Google Cloud Project for Workspace API Access

Enabled APIs:
- Admin SDK API
- Gmail API
- Google Drive API
- Google Calendar API
- Google Sheets API
- Google People API

Service Accounts:
- chronos-workspace-automation@project-chronos-workspace.iam.gserviceaccount.com

IAM Roles:
- geoff@automatonicai.com: Owner
- chronos-workspace-automation: Editor

Quotas:
- Gmail API: 1,000,000,000 quota units/day
- Drive API: 20,000 queries/100 seconds/user
- Calendar API: 1,000,000 queries/day

Created: [Date]
Last Modified: [Date]
```

---

### 3. Service Account

**Entry Name:** `Google Service Account - chronos-workspace-automation`

**Basic Fields:**
- **Username:** `chronos-workspace-automation@project-chronos-workspace.iam.gserviceaccount.com`
- **Password:** N/A (uses JSON key)
- **URL:** `https://console.cloud.google.com/iam-admin/serviceaccounts?project=project-chronos-workspace`

**Custom Fields:**
- **Service Account Email:** `chronos-workspace-automation@project-chronos-workspace.iam.gserviceaccount.com`
- **Service Account ID:** [Unique ID from IAM]
- **Project ID:** `project-chronos-workspace`
- **Key ID:** [From JSON key file]
- **Key Created:** [Date]
- **Key Expires:** Never (monitor for rotation)
- **Domain-Wide Delegation:** Enabled
- **Client ID:** [OAuth 2.0 Client ID for domain-wide delegation]

**Notes:**
```
Service Account for Automated Workspace Operations

Purpose:
- Automated email sending via Gmail API
- Drive file management
- Calendar event creation
- Sheets data manipulation

Domain-Wide Delegation Scopes:
- https://www.googleapis.com/auth/admin.directory.user
- https://www.googleapis.com/auth/admin.directory.group
- https://www.googleapis.com/auth/gmail.modify
- https://www.googleapis.com/auth/drive
- https://www.googleapis.com/auth/calendar
- https://www.googleapis.com/auth/spreadsheets
- https://www.googleapis.com/auth/contacts

Delegated User: geoff@automatonicai.com

Security:
- JSON key file stored in: ~/.config/chronos/google-service-account.json
- File permissions: 600 (read/write owner only)
- Backed up in: KeePassXC (attached), USB stick, Break Glass kit

Key Rotation Schedule: Every 90 days
Next Rotation: [Date]

Created: [Date]
Last Used: [Date]
```

**Attachments:**
- `chronos-workspace-automation-key.json` (Service account JSON key file)

---

### 4. OAuth 2.0 Credentials (Desktop App)

**Entry Name:** `Google OAuth - Chronos Desktop App`

**Basic Fields:**
- **Username:** N/A
- **Password:** N/A
- **URL:** `https://console.cloud.google.com/apis/credentials?project=project-chronos-workspace`

**Custom Fields:**
- **Client ID:** [OAuth 2.0 Client ID]
- **Client Secret:** [OAuth 2.0 Client Secret]
- **Application Type:** Desktop
- **Project:** project-chronos-workspace
- **Redirect URIs:** `http://localhost:8080/`
- **JavaScript Origins:** N/A

**Notes:**
```
OAuth 2.0 Credentials for Desktop Applications

Used for:
- Local development and testing
- Interactive OAuth flows
- User consent screens

Authorized Scopes:
- Same as service account scopes

Security:
- Client secret is sensitive - treat like password
- Used in local .env file only
- Never commit to Git

Created: [Date]
Last Modified: [Date]
```

---

### 5. Domain DNS Records

**Entry Name:** `Google Workspace - DNS Configuration`

**Basic Fields:**
- **Username:** N/A
- **Password:** N/A
- **URL:** `https://console.aws.amazon.com/route53/v2/hostedzones#ListRecordSets/Z0123456789ABC`

**Custom Fields:**
- **Domain:** `automatonicai.com`
- **DNS Provider:** AWS Route53
- **Hosted Zone ID:** [Route53 Hosted Zone ID]

**Notes:**
```
Google Workspace DNS Configuration

MX Records (Email):
Priority 1:  aspmx.l.google.com
Priority 5:  alt1.aspmx.l.google.com
Priority 5:  alt2.aspmx.l.google.com
Priority 10: alt3.aspmx.l.google.com
Priority 10: alt4.aspmx.l.google.com

SPF Record (TXT):
v=spf1 include:_spf.google.com ~all

DKIM Record (TXT):
Selector: google._domainkey
Value: [Generated by Google - see Admin Console]

DMARC Record (TXT):
_dmarc.automatonicai.com
v=DMARC1; p=quarantine; rua=mailto:geoff@automatonicai.com; pct=100; adkim=s; aspf=s

Verification Record (TXT):
google-site-verification=[verification code]

Last Updated: [Date]
Verified: [Date]
```

**Attachments:**
- `mx-record.json` (Route53 change batch)
- `dkim-key.txt` (DKIM public key)

---

### 6. Email Authentication Keys

**Entry Name:** `Google Workspace - Email Authentication`

**Basic Fields:**
- **Username:** N/A
- **Password:** N/A
- **URL:** `https://admin.google.com/ac/apps/gmail/authenticateemail`

**Custom Fields:**
- **DKIM Selector:** `google`
- **DKIM Key Length:** 2048-bit
- **SPF Status:** Active
- **DMARC Policy:** Quarantine
- **DMARC Reporting Email:** `geoff@automatonicai.com`

**Notes:**
```
Email Authentication Configuration

DKIM (DomainKeys Identified Mail):
- Status: Active
- Selector: google._domainkey.automatonicai.com
- Algorithm: RSA-SHA256
- Key Length: 2048-bit
- Generated: [Date]
- DNS Record Added: [Date]

SPF (Sender Policy Framework):
- Status: Active
- Policy: ~all (soft fail)
- Includes: _spf.google.com
- Last Verified: [Date]

DMARC (Domain-based Message Authentication):
- Policy: Quarantine
- Alignment: Strict (s)
- Reporting: Aggregate reports to geoff@automatonicai.com
- Percentage: 100%
- Last Report: [Date]

Email Deliverability Tests:
- mail-tester.com Score: [Score/10]
- Last Tested: [Date]

Troubleshooting:
- Check DKIM: dig google._domainkey.automatonicai.com TXT
- Check SPF: dig automatonicai.com TXT
- Check DMARC: dig _dmarc.automatonicai.com TXT
```

---

### 7. GitHub SSO Configuration

**Entry Name:** `GitHub - Google SSO`

**Basic Fields:**
- **Username:** `PrometheusFire-22`
- **Password:** [GitHub password - to be deprecated]
- **URL:** `https://github.com/settings/security`

**Custom Fields:**
- **GitHub Username:** `PrometheusFire-22`
- **Primary Email:** `axiologycapital@gmail.com`
- **Google Account:** `geoff@automatonicai.com`
- **2FA Method:** `Google Authenticator`
- **2FA Backup Codes:** [16 recovery codes]
- **SSH Key:** `prometheus-project` (SHA256:NjUfTNYKqcCW5g1C6NjmkSv1M6xcD8Lfm5K7c4yR7JE)
- **Personal Access Token:** [Stored separately - rotate regularly]

**Notes:**
```
GitHub Account with Google Authentication

Current Setup:
- 2FA: Google Authenticator (enabled 2025-12-03)
- Backup Codes: 16 codes stored in Break Glass kit
- SSH Key: prometheus-project (ed25519)

Migration to Google SSO:
- GitHub Free tier doesn't support SAML SSO
- Using Google Authenticator for 2FA
- Future: Consider GitHub Enterprise for full SSO

Security:
- Password: Strong, unique (KeePassXC generated)
- 2FA: Mandatory
- SSH Key: Passphrase-protected
- PAT: Fine-grained, minimal scopes, 90-day expiration

Last Password Change: [Date]
Last 2FA Backup: [Date]
Next PAT Rotation: [Date]
```

**Attachments:**
- `github-backup-codes.txt` (16 recovery codes)
- `github-ssh-key.pub` (Public SSH key)

---

### 8. Jira/Atlassian SSO

**Entry Name:** `Atlassian - Google SSO`

**Basic Fields:**
- **Username:** `geoff@automatonicai.com`
- **Password:** N/A (Google SSO)
- **URL:** `https://automatonicai.atlassian.net`

**Custom Fields:**
- **Atlassian Account Email:** `geoff@automatonicai.com`
- **Organization:** `automatonicai`
- **SSO Method:** `Google`
- **2FA Method:** `Google Authenticator` (inherited from Google)
- **API Token:** [Atlassian API token for CLI]
- **API Token Created:** [Date]
- **API Token Expires:** Never (monitor for rotation)

**Notes:**
```
Atlassian Account (Jira + Confluence) with Google SSO

Products:
- Jira Software (Free tier)
- Confluence (Free tier)

Authentication:
- Primary: Google SSO (geoff@automatonicai.com)
- 2FA: Inherited from Google account
- API Access: Personal API token (stored in .env)

Sites:
- Jira: https://automatonicai.atlassian.net
- Confluence: https://automatonicai.atlassian.net/wiki

API Token Usage:
- Jira CLI (src/chronos/cli/jira_cli.py)
- Confluence CLI (src/chronos/cli/confluence_cli.py)
- Automated workflows

Security:
- API token treated as password
- Stored in .env (not committed to Git)
- Rotate every 90 days

Last Login: [Date]
Last API Token Rotation: [Date]
Next Rotation: [Date]
```

---

### 9. HubSpot SSO (Future)

**Entry Name:** `HubSpot - Google SSO`

**Basic Fields:**
- **Username:** `geoff@automatonicai.com`
- **Password:** N/A (Google SSO)
- **URL:** `https://app.hubspot.com`

**Custom Fields:**
- **HubSpot Account ID:** [Account ID]
- **Portal ID:** [Portal ID]
- **SSO Method:** `Google`
- **API Key:** [HubSpot API key]
- **Private App Token:** [For API access]

**Notes:**
```
HubSpot CRM with Google SSO

Setup:
- Signed up with Google account
- SSO configured for seamless authentication
- 2FA inherited from Google

API Access:
- Private app created for API access
- Token stored in .env
- Used for CRM automation

Integration Points:
- Email sync with Gmail
- Calendar sync with Google Calendar
- Contact sync with Google Contacts

To Be Configured: [Sprint dedicated to HubSpot onboarding]

Created: [Date]
Last Modified: [Date]
```

---

## 🔄 Credential Rotation Schedule

### Critical Credentials (Rotate Every 90 Days)

| Credential | Last Rotated | Next Rotation | Status |
|------------|--------------|---------------|--------|
| Google Service Account Key | [Date] | [Date + 90d] | ⏳ |
| GitHub Personal Access Token | [Date] | [Date + 90d] | ⏳ |
| Atlassian API Token | [Date] | [Date + 90d] | ⏳ |
| HubSpot API Key | [Date] | [Date + 90d] | ⏳ |

### Passwords (Rotate Every 180 Days)

| Account | Last Changed | Next Change | Status |
|---------|--------------|-------------|--------|
| Google Workspace | [Date] | [Date + 180d] | ⏳ |
| GitHub | [Date] | [Date + 180d] | ⏳ |

### 2FA Backup Codes (Regenerate Annually)

| Service | Last Generated | Next Generation | Status |
|---------|----------------|-----------------|--------|
| Google Workspace | [Date] | [Date + 365d] | ⏳ |
| GitHub | [Date] | [Date + 365d] | ⏳ |

---

## ✅ Security Checklist

### Initial Setup
- [ ] Google Workspace account created in KeePassXC
- [ ] 2FA enabled and backup codes stored
- [ ] Google Authenticator QR code exported and attached
- [ ] Service account created and JSON key attached
- [ ] Domain-wide delegation configured and scopes documented
- [ ] DNS records documented (MX, SPF, DKIM, DMARC)
- [ ] GitHub 2FA enabled and backup codes stored
- [ ] Atlassian API token created and stored
- [ ] All credentials backed up in Break Glass kit

### Monthly Maintenance
- [ ] Verify all credentials still work
- [ ] Check for unused API keys/tokens
- [ ] Review service account usage logs
- [ ] Verify DNS records are still correct
- [ ] Test email deliverability (mail-tester.com)

### Quarterly Maintenance
- [ ] Rotate service account keys
- [ ] Rotate API tokens
- [ ] Review and update scopes
- [ ] Audit API usage and quotas
- [ ] Test disaster recovery procedures

### Annual Maintenance
- [ ] Regenerate all 2FA backup codes
- [ ] Rotate all passwords
- [ ] Review and update security policies
- [ ] Audit all integrations
- [ ] Update Break Glass kit

---

## 🚨 Emergency Access

### If You Lose Access to Google Account

1. **Use Backup Codes** (from Break Glass kit)
2. **Use Recovery Email** (`axiologycapital@gmail.com`)
3. **Use Recovery Phone** (if configured)
4. **Contact Google Support** (1-877-355-5787)

### If You Lose Service Account Key

1. **Create New Service Account Key** (old one still works)
2. **Update .env file** with new key path
3. **Test API access** with new key
4. **Delete old key** from Cloud Console
5. **Update KeePassXC** with new key

### If You Lose 2FA Device

1. **Use Backup Codes** (from KeePassXC or Break Glass kit)
2. **Sign in to Google Account**
3. **Remove old 2FA device**
4. **Add new 2FA device**
5. **Generate new backup codes**
6. **Update KeePassXC and Break Glass kit**

---

## 📂 File Locations

### Local Files
```
~/.config/chronos/
├── google-service-account.json          # Service account key (600 permissions)
├── google-oauth-credentials.json        # OAuth credentials (600 permissions)
└── .env                                  # Environment variables (600 permissions)
```

### Environment Variables (.env)
```bash
# Google Workspace
GOOGLE_SERVICE_ACCOUNT_FILE=/home/prometheus/.config/chronos/google-service-account.json
GOOGLE_DELEGATED_USER=geoff@automatonicai.com
GOOGLE_PROJECT_ID=project-chronos-workspace
GOOGLE_CUSTOMER_ID=[Customer ID from Admin Console]

# OAuth (for interactive flows)
GOOGLE_OAUTH_CLIENT_ID=[Client ID]
GOOGLE_OAUTH_CLIENT_SECRET=[Client Secret]
```

### Git Ignore
```
# .gitignore
google-service-account.json
google-oauth-credentials.json
*-credentials.json
*-service-account.json
```

---

## 🔍 Verification Commands

### Test Service Account Access
```bash
# Test Gmail API
python3 scripts/google/test_gmail_access.py

# Test Drive API
python3 scripts/google/test_drive_access.py

# Test Calendar API
python3 scripts/google/test_calendar_access.py
```

### Verify DNS Records
```bash
# MX Records
dig automatonicai.com MX

# SPF Record
dig automatonicai.com TXT | grep spf

# DKIM Record
dig google._domainkey.automatonicai.com TXT

# DMARC Record
dig _dmarc.automatonicai.com TXT
```

### Test Email Deliverability
```bash
# Send test email
python3 scripts/google/send_test_email.py

# Check spam score
# Visit: https://www.mail-tester.com
# Send email to provided address
# Check score (aim for 10/10)
```

---

## 📚 Related Documentation

- [Google Workspace Setup Runbook](../3_runbooks/google_workspace_setup.md)
- [Google Workspace CLI Guide](../3_runbooks/google_workspace_cli.md)
- [Email Configuration Guide](../4_guides/google_workspace_email_config.md)
- [API Integration Guide](../4_guides/google_workspace_api_guide.md)
- [Disaster Recovery - Operational](../3_runbooks/disaster_recovery_operational.md)
- [Break Glass Kit Checklist](./break_glass_kit_checklist.md)

---

## 🎯 Summary

**Zero Technical Debt Principles:**

1. **Every credential in KeePassXC** - No exceptions
2. **Document everything** - Scopes, permissions, purposes
3. **Regular rotation** - Follow the schedule
4. **Test regularly** - Monthly verification
5. **Backup everywhere** - KeePassXC, Break Glass kit, USB stick
6. **Audit frequently** - Quarterly reviews
7. **Never commit secrets** - Use .env and .gitignore

**If you follow this guide religiously, you will have zero credential sprawl and zero security technical debt.**
