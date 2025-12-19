# Google Workspace KeePassXC Security Guide

**Purpose:** Guide for securely storing Google Workspace credentials in KeePassXC

**Last Updated:** 2025-12-04

---

## 📦 What to Store in KeePassXC

### Entry 1: Google Service Account

**Title:** `Google Workspace - Service Account (chronos-workspace-automation)`

**Basic Fields:**
- **Username:** `chronos-workspace-automation@project-chronos-workspace.iam.gserviceaccount.com`
- **Password:** `[Leave empty - key is in attachment]`
- **URL:** `https://console.cloud.google.com/iam-admin/serviceaccounts?project=project-chronos-workspace`

**Custom Fields:**
| Field Name | Value |
|------------|-------|
| `Project ID` | `project-chronos-workspace` |
| `Client ID` | `102882412667139863075` |
| `Service Account Email` | `chronos-workspace-automation@project-chronos-workspace.iam.gserviceaccount.com` |
| `Key ID` | `c6cb66e250b58e4527fc85c4937ca98afd3c8d51` |
| `Key Location` | `/home/prometheus/.config/chronos/google-service-account.json` |
| `Role` | `Owner` |
| `Created Date` | `2025-12-04` |
| `Rotation Due` | `2026-03-04` (90 days) |

**Notes:**
```
Google Workspace service account for Project Chronos automation.

Permissions:
- Owner role on project-chronos-workspace
- Domain-wide delegation enabled
- Access to: Gmail, Drive, Calendar, Sheets, Admin SDK

Security:
- Key stored at: ~/.config/chronos/google-service-account.json
- Permissions: 600 (owner read/write only)
- Rotate every 90 days

Scopes Authorized:
- admin.directory.user
- admin.directory.group
- gmail.modify
- gmail.send
- drive
- calendar
- spreadsheets
- contacts

Last Rotated: 2025-12-04
Next Rotation: 2026-03-04
```

**Attachments:**
1. `google-service-account.json` - Service account key file
2. `service-account-creation-receipt.txt` - gcloud command output

---

## 🔄 Key Rotation Procedure

**Frequency:** Every 90 days

### Step 1: Create New Key

```bash
# Create new key with timestamp
gcloud iam service-accounts keys create \
  ~/.config/chronos/google-service-account-$(date +%Y%m%d).json \
  --iam-account=chronos-workspace-automation@project-chronos-workspace.iam.gserviceaccount.com \
  --project=project-chronos-workspace

chmod 600 ~/.config/chronos/google-service-account-$(date +%Y%m%d).json
```

### Step 2: Update Configuration

```bash
# Backup old key
cp ~/.config/chronos/google-service-account.json \
   ~/.config/chronos/google-service-account-backup.json

# Replace with new key
cp ~/.config/chronos/google-service-account-$(date +%Y%m%d).json \
   ~/.config/chronos/google-service-account.json
```

### Step 3: Test New Key

```bash
cd /home/prometheus/coding/finance/project-chronos
source ..venv/bin/activate
python -c "
from chronos.integrations.google import GoogleWorkspaceAuth
auth = GoogleWorkspaceAuth()
if auth.test_connection():
    print('✅ New key works!')
else:
    print('❌ New key failed!')
"
```

### Step 4: Delete Old Key & Update KeePassXC

```bash
# List keys to find old key ID
gcloud iam service-accounts keys list \
  --iam-account=chronos-workspace-automation@project-chronos-workspace.iam.gserviceaccount.com

# Delete old key
gcloud iam service-accounts keys delete OLD_KEY_ID \
  --iam-account=chronos-workspace-automation@project-chronos-workspace.iam.gserviceaccount.com \
  --quiet
```

Then update KeePassXC entry with new key ID and rotation dates.

---

**Version:** 1.0.0  
**Last Updated:** 2025-12-04
