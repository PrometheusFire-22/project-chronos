# KeePassXC Complete Credential Tracking Guide - Google Workspace

**Purpose:** Disaster-proof credential tracking for Google Workspace integration

**Last Updated:** 2025-12-04

---

## 🎯 Zero Tech Debt Principle

**Every credential, key, and access point must be tracked in KeePassXC with:**
1. Complete metadata (who, what, when, where, why)
2. Recovery procedures
3. Rotation schedules
4. Backup locations
5. Emergency contacts

---

## 📦 Required KeePassXC Entries

### Entry 1: Google Service Account Key ⭐ CRITICAL

**Title:** `Google Workspace - Service Account Key`

**Category/Group:** `Project Chronos / Google Cloud / Service Accounts`

**Basic Fields:**
- **Username:** `chronos-workspace-automation@project-chronos-workspace.iam.gserviceaccount.com`
- **Password:** `[Leave empty - key is in JSON file]`
- **URL:** `https://console.cloud.google.com/iam-admin/serviceaccounts/details/102882412667139863075?project=project-chronos-workspace`

**Custom String Fields:**
| Field Name | Value | Protected? |
|------------|-------|------------|
| `Project ID` | `project-chronos-workspace` | No |
| `Project Number` | `610719867864` | No |
| `Client ID` | `102882412667139863075` | No |
| `Key ID` | `c6cb66e250b58e4527fc85c4937ca98afd3c8d51` | No |
| `Service Account Email` | `chronos-workspace-automation@project-chronos-workspace.iam.gserviceaccount.com` | No |
| `Key File Path (Host)` | `/home/prometheus/.config/chronos/google-service-account.json` | No |
| `Key File Path (Container)` | `/home/vscode/.config/chronos/google-service-account.json` | No |
| `Role` | `roles/owner` | No |
| `Organization ID` | `818057845120` | No |
| `Created By` | `geoff@automatonicai.com` | No |
| `Created Date` | `2025-12-04` | No |
| `Created Via` | `gcloud CLI` | No |
| `Last Rotated` | `2025-12-04` | No |
| `Next Rotation Due` | `2026-03-04` | No |
| `Rotation Frequency` | `90 days` | No |
| `Backup Location 1` | `KeePassXC attachment` | No |
| `Backup Location 2` | `Encrypted USB drive` | No |
| `Environment Variable` | `GOOGLE_SERVICE_ACCOUNT_FILE` | No |

**Notes Section:**
```
=== SERVICE ACCOUNT DETAILS ===
Purpose: Automation for Google Workspace APIs (Gmail, Drive, Calendar, Sheets, Admin SDK)
Scope: Domain-wide delegation enabled for geoff@automatonicai.com
Permissions: Owner role on project-chronos-workspace

=== AUTHORIZED SCOPES ===
- https://www.googleapis.com/auth/admin.directory.user
- https://www.googleapis.com/auth/admin.directory.group
- https://www.googleapis.com/auth/gmail.modify
- https://www.googleapis.com/auth/gmail.send
- https://www.googleapis.com/auth/drive
- https://www.googleapis.com/auth/calendar
- https://www.googleapis.com/auth/spreadsheets
- https://www.googleapis.com/auth/contacts

=== SECURITY ===
File Permissions: 600 (owner read/write only)
Storage: ~/.config/chronos/ (NOT in project directory)
Git: Added to .gitignore
Encryption: File system encryption enabled

=== ROTATION HISTORY ===
2025-12-04: Initial creation (Key ID: c6cb66e250b58e4527fc85c4937ca98afd3c8d51)

=== RECOVERY PROCEDURE ===
If key is lost/compromised:
1. Delete compromised key: gcloud iam service-accounts keys delete KEY_ID --iam-account=chronos-workspace-automation@project-chronos-workspace.iam.gserviceaccount.com
2. Create new key: gcloud iam service-accounts keys create ~/.config/chronos/google-service-account.json --iam-account=chronos-workspace-automation@project-chronos-workspace.iam.gserviceaccount.com
3. Update .env file
4. Test: python -c "from chronos.integrations.google import GoogleWorkspaceAuth; GoogleWorkspaceAuth().test_connection()"
5. Update this KeePassXC entry

=== DOCUMENTATION ===
Setup Guide: docs/3_runbooks/google_workspace_api_setup.md
CLI Guide: docs/3_runbooks/google_workspace_cli.md
API Guide: docs/4_guides/google_workspace_api_guide.md
Security Guide: docs/4_guides/google_workspace_keepassxc_security_guide.md

=== DEPENDENCIES ===
- Google Cloud Project: project-chronos-workspace
- Domain-wide delegation configured in Google Workspace Admin Console
- Environment variables in .env file
- Python packages: google-api-python-client, google-auth-httplib2, google-auth-oauthlib
```

**Attachments:**
1. **`google-service-account.json`** - The actual service account key file (2.4K)
2. **`service-account-creation-log.txt`** - gcloud command output showing creation
3. **`domain-delegation-screenshot.png`** - Screenshot of domain-wide delegation config

**Tags:** `google`, `service-account`, `api-key`, `critical`, `rotate-quarterly`

**Expiry Date:** `2026-03-04` (90 days from creation)

---

### Entry 2: Google Workspace Admin Account ⭐ CRITICAL

**Title:** `Google Workspace - Super Admin (geoff@automatonicai.com)`

**Category/Group:** `Project Chronos / Google Workspace / Admin Accounts`

**Basic Fields:**
- **Username:** `geoff@automatonicai.com`
- **Password:** `[Your actual password]`
- **URL:** `https://admin.google.com`

**Custom String Fields:**
| Field Name | Value | Protected? |
|------------|-------|------------|
| `Organization ID` | `818057845120` | No |
| `Organization Name` | `automatonicai.com` | No |
| `Customer ID` | `C026tjz0w` | No |
| `Domain` | `automatonicai.com` | No |
| `Recovery Email` | `[Your recovery email]` | Yes |
| `Recovery Phone` | `[Your recovery phone]` | Yes |
| `2FA Method` | `[Authenticator app/SMS/etc]` | No |
| `2FA Backup Codes` | `[Store in separate entry]` | Yes |
| `Account Created` | `[Date]` | No |
| `Last Password Change` | `[Date]` | No |
| `Password Change Frequency` | `90 days` | No |

**Notes Section:**
```
=== ADMIN ROLES ===
- Super Admin (full access)
- Organization Policy Administrator (roles/orgpolicy.policyAdmin)

=== CRITICAL ACCESS ===
- Google Workspace Admin Console (admin.google.com)
- Google Cloud Console (console.cloud.google.com)
- Domain-wide delegation management
- User/group management
- Security settings
- Billing management

=== SECURITY SETTINGS ===
- 2FA: Enabled
- Advanced Protection: [Enabled/Disabled]
- Login Challenge: Enabled
- Less Secure Apps: Disabled
- API Access: Enabled

=== RECOVERY PROCEDURE ===
If account is locked/compromised:
1. Use recovery email/phone to reset password
2. Review Security > Investigation tool for suspicious activity
3. Revoke all active sessions
4. Change password immediately
5. Review and revoke any unauthorized API access
6. Check domain-wide delegation for unauthorized service accounts

=== BACKUP ADMIN ===
Secondary Admin: [Name/Email if exists]
Break Glass Account: [Emergency admin account if exists]
```

**Attachments:**
1. **`2fa-backup-codes.txt`** - Encrypted backup codes
2. **`account-recovery-info.pdf`** - Account recovery documentation

**Tags:** `google`, `admin`, `super-admin`, `critical`, `2fa-enabled`

**Expiry Date:** `2026-03-04` (password rotation)

---

### Entry 3: Google Cloud Project

**Title:** `Google Cloud - project-chronos-workspace`

**Category/Group:** `Project Chronos / Google Cloud / Projects`

**Basic Fields:**
- **Username:** `geoff@automatonicai.com`
- **Password:** `[Same as Workspace account]`
- **URL:** `https://console.cloud.google.com/home/dashboard?project=project-chronos-workspace`

**Custom String Fields:**
| Field Name | Value |
|------------|-------|
| `Project ID` | `project-chronos-workspace` |
| `Project Number` | `610719867864` |
| `Project Name` | `project-chronos-workspace` |
| `Organization ID` | `818057845120` |
| `Billing Account ID` | `[Your billing account ID]` |
| `Region` | `us-east1` (or your default) |
| `Created Date` | `2025-12-04` |
| `Budget Alert Threshold` | `$[amount]` |

**Notes Section:**
```
=== ENABLED APIS ===
- Admin SDK API (admin.googleapis.com)
- Gmail API (gmail.googleapis.com)
- Drive API (drive.googleapis.com)
- Calendar API (calendar-json.googleapis.com)
- Sheets API (sheets.googleapis.com)
- People API (people.googleapis.com)

=== IAM BINDINGS ===
- geoff@automatonicai.com: roles/owner
- chronos-workspace-automation@...: roles/owner

=== BILLING ===
Billing Account: [ID]
Monthly Budget: $[amount]
Alert Threshold: [%]
Alert Email: geoff@automatonicai.com

=== ORGANIZATION POLICIES ===
- iam.disableServiceAccountKeyCreation: DELETED (was blocking)
- Other policies: Inherited from organization

=== MONITORING ===
Budget alerts: Enabled
Billing notifications: geoff@automatonicai.com
```

**Tags:** `google-cloud`, `project`, `billing`

---

### Entry 4: Domain-Wide Delegation Configuration

**Title:** `Google Workspace - Domain-Wide Delegation Config`

**Category/Group:** `Project Chronos / Google Workspace / API Configuration`

**Basic Fields:**
- **Username:** `N/A`
- **Password:** `N/A`
- **URL:** `https://admin.google.com/ac/owl/domainwidedelegation`

**Custom String Fields:**
| Field Name | Value |
|------------|-------|
| `Client ID` | `102882412667139863075` |
| `Service Account Email` | `chronos-workspace-automation@project-chronos-workspace.iam.gserviceaccount.com` |
| `Configured Date` | `[Date when you configure it]` |
| `Configured By` | `geoff@automatonicai.com` |
| `Delegated User` | `geoff@automatonicai.com` |

**Notes Section:**
```
=== AUTHORIZED SCOPES ===
https://www.googleapis.com/auth/admin.directory.user,https://www.googleapis.com/auth/admin.directory.group,https://www.googleapis.com/auth/gmail.modify,https://www.googleapis.com/auth/gmail.send,https://www.googleapis.com/auth/drive,https://www.googleapis.com/auth/calendar,https://www.googleapis.com/auth/spreadsheets,https://www.googleapis.com/auth/contacts

=== CONFIGURATION STEPS ===
1. Go to: https://admin.google.com
2. Security → Access and data control → API controls
3. Manage Domain-Wide Delegation
4. Add new with Client ID: 102882412667139863075
5. Paste scopes (above)
6. Authorize

=== VERIFICATION ===
Test command:
cd /home/prometheus/coding/finance/project-chronos
source .venv/bin/activate
python src/chronos/cli/google_cli.py admin list-users --max-results 5
```

**Attachments:**
1. **`delegation-config-screenshot.png`** - Screenshot of configuration

**Tags:** `google`, `delegation`, `api-config`

---

### Entry 5: Environment Variables

**Title:** `Project Chronos - Google Workspace Environment Variables`

**Category/Group:** `Project Chronos / Configuration / Environment`

**Basic Fields:**
- **Username:** `N/A`
- **Password:** `N/A`
- **URL:** `file:///home/prometheus/coding/finance/project-chronos/.env`

**Custom String Fields:**
| Field Name | Value |
|------------|-------|
| `GOOGLE_SERVICE_ACCOUNT_FILE` | `/home/prometheus/.config/chronos/google-service-account.json` |
| `GOOGLE_DELEGATED_USER` | `geoff@automatonicai.com` |
| `GOOGLE_PROJECT_ID` | `project-chronos-workspace` |
| `File Location (Host)` | `/home/prometheus/coding/finance/project-chronos/.env` |
| `File Location (Container)` | `/workspace/.env` |

**Notes Section:**
```
=== .ENV FILE CONTENTS ===
GOOGLE_SERVICE_ACCOUNT_FILE=/home/prometheus/.config/chronos/google-service-account.json
GOOGLE_DELEGATED_USER=geoff@automatonicai.com
GOOGLE_PROJECT_ID=project-chronos-workspace

=== SECURITY ===
- File is in .gitignore
- Not committed to repository
- Backed up in KeePassXC
- Synced to Dev Container via mount
```

**Tags:** `environment`, `config`, `dotenv`

---

## 🔄 Maintenance Schedule

### Weekly
- [ ] Verify KeePassXC database is backed up to Google Drive
- [ ] Verify KeePassXC database is backed up to external drive

### Monthly
- [ ] Review all Google Workspace entries for accuracy
- [ ] Test service account key still works
- [ ] Review Google Cloud billing for unexpected charges
- [ ] Check for any new API keys or credentials that need tracking

### Quarterly (Every 90 Days)
- [ ] Rotate service account key
- [ ] Change Google Workspace admin password
- [ ] Review and update all custom fields
- [ ] Update rotation history in notes
- [ ] Verify all backup locations are accessible
- [ ] Test disaster recovery procedure

### Annually
- [ ] Full audit of all Google Workspace credentials
- [ ] Review and update security procedures
- [ ] Test full disaster recovery from backups
- [ ] Update documentation

---

## 🚨 Disaster Recovery Checklist

### If KeePassXC Database is Lost

**Prerequisites:**
- [ ] External backup drive accessible
- [ ] Google Drive backup accessible
- [ ] Master password remembered

**Recovery Steps:**
1. Restore from Google Drive: Download latest `.kdbx` file
2. Or restore from external drive: Copy `.kdbx` file
3. Open with master password
4. Verify all entries are present
5. Export to new backup immediately

### If Service Account Key is Lost

**Prerequisites:**
- [ ] Access to Google Cloud Console
- [ ] gcloud CLI installed and authenticated

**Recovery Steps:**
1. Create new key:
   ```bash
   gcloud iam service-accounts keys create ~/.config/chronos/google-service-account.json \
     --iam-account=chronos-workspace-automation@project-chronos-workspace.iam.gserviceaccount.com
   ```
2. Update `.env` file (if path changed)
3. Test new key
4. Update KeePassXC entry
5. Delete old key from Google Cloud

### If Admin Account is Compromised

**Prerequisites:**
- [ ] Recovery email access
- [ ] Recovery phone access
- [ ] 2FA backup codes

**Recovery Steps:**
1. Use recovery email/phone to reset password
2. Review Security > Investigation tool
3. Revoke all sessions
4. Change password
5. Review API access
6. Update KeePassXC
7. Notify team (if applicable)

---

## 📋 KeePassXC Database Structure

```
KeePassXC Database
└── Project Chronos
    ├── Google Cloud
    │   ├── Projects
    │   │   └── project-chronos-workspace
    │   └── Service Accounts
    │       └── chronos-workspace-automation
    ├── Google Workspace
    │   ├── Admin Accounts
    │   │   ├── geoff@automatonicai.com (Super Admin)
    │   │   └── 2FA Backup Codes
    │   └── API Configuration
    │       └── Domain-Wide Delegation Config
    ├── Configuration
    │   └── Environment
    │       └── Google Workspace Environment Variables
    └── AWS
        └── [Other AWS credentials]
```

---

## ✅ Verification Checklist

Before considering setup complete, verify:

- [ ] All 5 entries created in KeePassXC
- [ ] Service account key file attached to Entry 1
- [ ] All custom fields populated
- [ ] Notes sections complete with recovery procedures
- [ ] Tags added to all entries
- [ ] Expiry dates set for rotating credentials
- [ ] KeePassXC database backed up to 2+ locations
- [ ] Master password stored securely (NOT in KeePassXC)
- [ ] Recovery procedures tested
- [ ] Calendar reminders set for rotation dates

---

**Version:** 1.0.0  
**Last Updated:** 2025-12-04
