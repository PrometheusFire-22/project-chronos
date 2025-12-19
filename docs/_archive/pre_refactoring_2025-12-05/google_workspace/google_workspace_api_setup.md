# Google Workspace API Setup - Complete Guide

**Purpose:** Step-by-step guide to set up Google Workspace API integration for Project Chronos

**Last Updated:** 2025-12-04

**Prerequisites:**
- Google Workspace account (`geoff@automatonicai.com`)
- Google Cloud billing approved
- gcloud CLI installed
- Organization Policy Administrator role

---

## ✅ What We've Completed

### 1. Enabled Required APIs
```bash
gcloud services enable \
  admin.googleapis.com \
  gmail.googleapis.com \
  drive.googleapis.com \
  calendar-json.googleapis.com \
  sheets.googleapis.com \
  people.googleapis.com \
  --project=project-chronos-workspace
```

**APIs Enabled:**
- ✅ Admin SDK API
- ✅ Gmail API  
- ✅ Drive API
- ✅ Calendar API
- ✅ Sheets API
- ✅ People API

### 2. Resolved Organization Policy Blocker

**Problem:** `constraints/iam.disableServiceAccountKeyCreation` was blocking key creation

**Solution:**
```bash
# Granted Organization Policy Administrator role
gcloud organizations add-iam-policy-binding 818057845120 \
  --member="user:geoff@automatonicai.com" \
  --role="roles/orgpolicy.policyAdmin"

# Deleted the blocking policy
gcloud resource-manager org-policies delete \
  constraints/iam.disableServiceAccountKeyCreation \
  --organization=818057845120
```

### 3. Created Service Account

```bash
# Created service account
gcloud iam service-accounts create chronos-workspace-automation \
  --display-name="Chronos Workspace Automation" \
  --description="Service account for Project Chronos workspace automation" \
  --project=project-chronos-workspace

# Granted Owner role
gcloud projects add-iam-policy-binding project-chronos-workspace \
  --member="serviceAccount:chronos-workspace-automation@project-chronos-workspace.iam.gserviceaccount.com" \
  --role="roles/owner"
```

**Service Account Details:**
- **Email:** `chronos-workspace-automation@project-chronos-workspace.iam.gserviceaccount.com`
- **Client ID:** `102882412667139863075`
- **Role:** Owner

### 4. Created Service Account Key

```bash
# Created and secured key
gcloud iam service-accounts keys create ~/.config/chronos/google-service-account.json \
  --iam-account=chronos-workspace-automation@project-chronos-workspace.iam.gserviceaccount.com \
  --project=project-chronos-workspace

chmod 600 ~/.config/chronos/google-service-account.json
```

**Key Location:** `/home/prometheus/.config/chronos/google-service-account.json`  
**Permissions:** `600` (read/write for owner only)  
**Size:** 2.4K

### 5. Updated Environment Configuration

Added to `.env`:
```bash
GOOGLE_SERVICE_ACCOUNT_FILE=/home/prometheus/.config/chronos/google-service-account.json
GOOGLE_DELEGATED_USER=geoff@automatonicai.com
GOOGLE_PROJECT_ID=project-chronos-workspace
```

---

## 🔄 Next Steps: Domain-Wide Delegation

**This must be done via Google Workspace Admin Console (no CLI option)**

### Step 1: Navigate to Domain-Wide Delegation

1. Go to: https://admin.google.com
2. Navigate to: **Security → Access and data control → API controls**
3. Click: **"Manage Domain-Wide Delegation"**

### Step 2: Add Service Account

1. Click: **"Add new"**
2. **Client ID:** `102882412667139863075`
3. **OAuth Scopes:** (paste all at once, comma-separated)
   ```
   https://www.googleapis.com/auth/admin.directory.user,https://www.googleapis.com/auth/admin.directory.group,https://www.googleapis.com/auth/gmail.modify,https://www.googleapis.com/auth/gmail.send,https://www.googleapis.com/auth/drive,https://www.googleapis.com/auth/calendar,https://www.googleapis.com/auth/spreadsheets,https://www.googleapis.com/auth/contacts
   ```
4. Click: **"Authorize"**

### Step 3: Verify Configuration

```bash
# Test authentication
cd /home/prometheus/coding/finance/project-chronos
source ..venv/bin/activate
python -c "
from chronos.integrations.google import GoogleWorkspaceAuth
auth = GoogleWorkspaceAuth()
if auth.test_connection():
    print('✅ Authentication successful!')
else:
    print('❌ Authentication failed!')
"
```

### Step 4: Test CLI Tool

```bash
# List users
python src/chronos/cli/google_cli.py admin list-users --max-results 5

# Or use the installed command
google admin list-users --max-results 5
```

---

## 📚 Required OAuth Scopes

| Scope | Purpose |
|-------|---------|
| `https://www.googleapis.com/auth/admin.directory.user` | User management |
| `https://www.googleapis.com/auth/admin.directory.group` | Group management |
| `https://www.googleapis.com/auth/gmail.modify` | Read/modify emails |
| `https://www.googleapis.com/auth/gmail.send` | Send emails |
| `https://www.googleapis.com/auth/drive` | Drive file management |
| `https://www.googleapis.com/auth/calendar` | Calendar management |
| `https://www.googleapis.com/auth/spreadsheets` | Sheets operations |
| `https://www.googleapis.com/auth/contacts` | Contacts access |

---

## 🔐 Security Checklist

- [x] Service account key stored in `~/.config/chronos/` (not in project directory)
- [x] Key permissions set to `600` (owner read/write only)
- [x] Key path added to `.gitignore`
- [x] Environment variables configured in `.env`
- [ ] **TODO:** Add service account key to KeePassXC
- [ ] **TODO:** Set calendar reminder to rotate key every 90 days

---

## 🚨 Troubleshooting

### "Service account key creation is disabled"

**Cause:** Organization policy `constraints/iam.disableServiceAccountKeyCreation` is enforced

**Solution:**
```bash
# Grant yourself org policy admin role
gcloud organizations add-iam-policy-binding YOUR_ORG_ID \
  --member="user:YOUR_EMAIL" \
  --role="roles/orgpolicy.policyAdmin"

# Delete the blocking policy
gcloud resource-manager org-policies delete \
  constraints/iam.disableServiceAccountKeyCreation \
  --organization=YOUR_ORG_ID
```

### "Insufficient permissions" when testing

**Cause:** Domain-wide delegation not configured

**Solution:** Follow Step 2 above to configure delegation in Google Workspace Admin Console

### "Invalid grant" error

**Possible causes:**
1. Service account key expired or deleted
2. Delegated user doesn't exist
3. Domain-wide delegation not configured
4. Scopes don't match what was authorized

**Solution:** Verify all configuration steps above

---

## 📖 Related Documentation

- [Google Workspace CLI Man Page](./google_workspace_cli.md)
- [Python API Integration Guide](../4_guides/google_workspace_api_guide.md)
- [Email Configuration](./google_workspace_email_config.md)
- [KeePassXC Security Guide](../4_guides/google_workspace_keepassxc_security_guide.md)

---

## 🔗 External Resources

- [Service Accounts Overview](https://cloud.google.com/iam/docs/service-accounts)
- [Domain-Wide Delegation](https://developers.google.com/identity/protocols/oauth2/service-account#delegatingauthority)
- [Google Workspace Admin SDK](https://developers.google.com/admin-sdk)

---

**Version:** 1.0.0  
**Last Updated:** 2025-12-04
