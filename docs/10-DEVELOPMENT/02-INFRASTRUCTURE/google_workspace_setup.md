# Google Workspace Setup & Operations

**Purpose:** Complete operational runbook for Google Workspace integration setup, configuration, and daily operations.

**Last Updated:** 2025-12-12  
**Owner:** PrometheusFire-22  
**Related Tickets:** CHRONOS-175, CHRONOS-179, CHRONOS-248

> **📍 Navigation:** This is the **operational setup runbook**. For API usage examples, see [Google Workspace Integration Guide](../../guides/integration/google_workspace_guide.md). For OAuth setup (legacy), see [Google Cloud Setup](../../guides/integration/google_cloud_setup.md).

---

## 📋 Overview

This runbook covers the complete setup and operation of Google Workspace integration for Project Chronos, including:
- API setup and service account configuration
- Email configuration (MX, SPF, DKIM, DMARC)
- CLI tool usage
- Daily operations and troubleshooting

---

## Part 1: API Setup & Service Account Configuration

### Prerequisites

- ✅ Google Workspace account (`geoff@automatonicai.com`)
- ✅ Google Cloud billing approved
- ✅ gcloud CLI installed
- ✅ Organization Policy Administrator role

### Step 1: Enable Required APIs

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

### Step 2: Resolve Organization Policy Blocker

**Problem:** `constraints/iam.disableServiceAccountKeyCreation` blocks key creation

**Solution:**
```bash
# Grant Organization Policy Administrator role
gcloud organizations add-iam-policy-binding 818057845120 \
  --member="user:geoff@automatonicai.com" \
  --role="roles/orgpolicy.policyAdmin"

# Delete the blocking policy
gcloud resource-manager org-policies delete \
  constraints/iam.disableServiceAccountKeyCreation \
  --organization=818057845120
```

### Step 3: Create Service Account

```bash
# Create service account
gcloud iam service-accounts create chronos-workspace-automation \
  --display-name="Chronos Workspace Automation" \
  --description="Service account for Project Chronos workspace automation" \
  --project=project-chronos-workspace

# Grant Owner role
gcloud projects add-iam-policy-binding project-chronos-workspace \
  --member="serviceAccount:chronos-workspace-automation@project-chronos-workspace.iam.gserviceaccount.com" \
  --role="roles/owner"
```

**Service Account Details:**
- **Email:** `chronos-workspace-automation@project-chronos-workspace.iam.gserviceaccount.com`
- **Client ID:** `102882412667139863075`
- **Role:** Owner

### Step 4: Create Service Account Key

```bash
# Create and secure key
gcloud iam service-accounts keys create ~/.config/chronos/google-service-account.json \
  --iam-account=chronos-workspace-automation@project-chronos-workspace.iam.gserviceaccount.com \
  --project=project-chronos-workspace

chmod 600 ~/.config/chronos/google-service-account.json
```

**Key Location:** `/home/prometheus/.config/chronos/google-service-account.json`  
**Permissions:** `600` (read/write for owner only)

### Step 5: Configure Domain-Wide Delegation

**This must be done via Google Workspace Admin Console (no CLI option)**

1. Go to: https://admin.google.com
2. Navigate to: **Security → Access and data control → API controls**
3. Click: **"Manage Domain-Wide Delegation"**
4. Click: **"Add new"**
5. **Client ID:** `102882412667139863075`
6. **OAuth Scopes:** (paste all at once, comma-separated)
   ```
   https://www.googleapis.com/auth/admin.directory.user,https://www.googleapis.com/auth/admin.directory.group,https://www.googleapis.com/auth/gmail.modify,https://www.googleapis.com/auth/gmail.send,https://www.googleapis.com/auth/drive,https://www.googleapis.com/auth/calendar,https://www.googleapis.com/auth/spreadsheets,https://www.googleapis.com/auth/contacts
   ```
7. Click: **"Authorize"**

### Step 6: Update Environment Configuration

Add to `.env`:
```bash
GOOGLE_SERVICE_ACCOUNT_FILE=/home/prometheus/.config/chronos/google-service-account.json
GOOGLE_DELEGATED_USER=geoff@automatonicai.com
GOOGLE_PROJECT_ID=project-chronos-workspace
```

### Step 7: Verify Configuration

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

---

## Part 2: Email Configuration

### Current Status

❌ Email NOT fully configured
- MX record points to wrong server
- No SPF record
- No DKIM configured
- No DMARC policy

### Target Status

✅ Email fully functional
- Correct MX records
- SPF configured
- DKIM enabled and verified
- DMARC policy active
- 10/10 deliverability score

### Step 1: Update MX Records

**Get Hosted Zone ID:**
```bash
aws route53 list-hosted-zones --query "HostedZones[?Name=='automatonicai.com.'].Id" --output text
```

**Create MX record change batch** (`scripts/google/mx-records-update.json`):
```json
{
  "Comment": "Update MX records for Google Workspace",
  "Changes": [{
    "Action": "UPSERT",
    "ResourceRecordSet": {
      "Name": "automatonicai.com",
      "Type": "MX",
      "TTL": 3600,
      "ResourceRecords": [
        {"Value": "1 aspmx.l.google.com"},
        {"Value": "5 alt1.aspmx.l.google.com"},
        {"Value": "5 alt2.aspmx.l.google.com"},
        {"Value": "10 alt3.aspmx.l.google.com"},
        {"Value": "10 alt4.aspmx.l.google.com"}
      ]
    }
  }]
}
```

**Apply changes:**
```bash
HOSTED_ZONE_ID=$(aws route53 list-hosted-zones --query "HostedZones[?Name=='automatonicai.com.'].Id" --output text | cut -d'/' -f3)

aws route53 change-resource-record-sets \
  --hosted-zone-id $HOSTED_ZONE_ID \
  --change-batch file://scripts/google/mx-records-update.json
```

**Verify:**
```bash
sleep 60
dig automatonicai.com MX +short
```

### Step 2: Configure SPF Record

**SPF Record:** `v=spf1 include:_spf.google.com ~all`

**Create SPF record** (`scripts/google/spf-record-update.json`):
```json
{
  "Comment": "Add SPF record for Google Workspace",
  "Changes": [{
    "Action": "UPSERT",
    "ResourceRecordSet": {
      "Name": "automatonicai.com",
      "Type": "TXT",
      "TTL": 3600,
      "ResourceRecords": [
        {"Value": "\"v=spf1 include:_spf.google.com ~all\""}
      ]
    }
  }]
}
```

**Apply:**
```bash
aws route53 change-resource-record-sets \
  --hosted-zone-id $HOSTED_ZONE_ID \
  --change-batch file://scripts/google/spf-record-update.json
```

### Step 3: Configure DKIM

**Generate DKIM key in Google Admin Console:**

1. Go to: https://admin.google.com
2. Navigate to: **Apps → Google Workspace → Gmail → Authenticate email**
3. Click: **"Generate new record"**
4. Select: **2048-bit key**
5. Click: **"Generate"**
6. Copy the DKIM TXT record value

**Create DKIM record** (`scripts/google/dkim-record-update.json`):
```json
{
  "Comment": "Add DKIM record for Google Workspace",
  "Changes": [{
    "Action": "UPSERT",
    "ResourceRecordSet": {
      "Name": "google._domainkey.automatonicai.com",
      "Type": "TXT",
      "TTL": 3600,
      "ResourceRecords": [
        {"Value": "\"v=DKIM1; k=rsa; p=YOUR_DKIM_PUBLIC_KEY_HERE\""}
      ]
    }
  }]
}
```

**Apply and activate:**
```bash
aws route53 change-resource-record-sets \
  --hosted-zone-id $HOSTED_ZONE_ID \
  --change-batch file://scripts/google/dkim-record-update.json

# Return to Admin Console and click "Start authentication"
```

### Step 4: Configure DMARC

**DMARC Record:** `v=DMARC1; p=quarantine; rua=mailto:geoff@automatonicai.com; pct=100; adkim=s; aspf=s`

**Create DMARC record** (`scripts/google/dmarc-record-update.json`):
```json
{
  "Comment": "Add DMARC record for Google Workspace",
  "Changes": [{
    "Action": "UPSERT",
    "ResourceRecordSet": {
      "Name": "_dmarc.automatonicai.com",
      "Type": "TXT",
      "TTL": 3600,
      "ResourceRecords": [
        {"Value": "\"v=DMARC1; p=quarantine; rua=mailto:geoff@automatonicai.com; pct=100; adkim=s; aspf=s\""}
      ]
    }
  }]
}
```

**Apply:**
```bash
aws route53 change-resource-record-sets \
  --hosted-zone-id $HOSTED_ZONE_ID \
  --change-batch file://scripts/google/dmarc-record-update.json
```

### Step 5: Test Email Deliverability

**Send test email:**
1. Go to: https://mail.google.com
2. Sign in as: `geoff@automatonicai.com`
3. Send test email to personal email
4. Verify it arrives and is not spam

**Use mail-tester.com:**
1. Go to: https://www.mail-tester.com
2. Send email to provided address
3. Check score (target: 10/10)

---

## Part 3: CLI Operations

### Environment Setup

```bash
# Load environment variables
export GOOGLE_SERVICE_ACCOUNT_FILE=/home/prometheus/.config/chronos/google-service-account.json
export GOOGLE_DELEGATED_USER=geoff@automatonicai.com

# Or add to .env and source it
source .env
```

### Gmail Operations

```bash
# Send email
google gmail send \
  --to user@example.com \
  --subject "Test" \
  --body "Hello World"

# List unread emails
google gmail list --query "is:unread" --max-results 5

# Create label
google gmail create-label "Important"
```

### Drive Operations

```bash
# Upload file
google drive upload document.pdf --folder-id abc123

# List files
google drive list --query "mimeType='application/pdf'"

# Share file
google drive share file_id user@example.com --role writer
```

### Calendar Operations

```bash
# Create event
google calendar create \
  --summary "Team Meeting" \
  --start "2025-12-05T10:00:00-05:00" \
  --end "2025-12-05T11:00:00-05:00" \
  --attendee user@example.com

# List events
google calendar list --max-results 10
```

### Sheets Operations

```bash
# Read data
google sheets read spreadsheet_id "Sheet1!A1:C10"

# Write data
google sheets write spreadsheet_id "Sheet1!A1:C2" \
  '[["Name","Email"],["John","john@example.com"]]'

# Create spreadsheet
google sheets create "My Report" --sheet "Data" --sheet "Analysis"
```

### Admin Operations

```bash
# List users
google admin list-users --max-results 10

# Get user details
google admin get-user user@example.com

# List groups
google admin list-groups
```

---

## 🔐 Security Checklist

- [x] Service account key stored in `~/.config/chronos/` (not in project)
- [x] Key permissions set to `600`
- [x] Key path added to `.gitignore`
- [x] Environment variables configured
- [ ] **TODO:** Add service account key to KeePassXC
- [ ] **TODO:** Set calendar reminder to rotate key every 90 days

---

## 🚨 Troubleshooting

### "Service account file not found"
- Check `GOOGLE_SERVICE_ACCOUNT_FILE` path
- Verify file exists and has correct permissions (600)

### "Insufficient permissions"
- Verify domain-wide delegation is configured
- Check scopes in Admin Console match required scopes
- Ensure `GOOGLE_DELEGATED_USER` is correct

### "API not enabled"
- Enable required APIs in Google Cloud Console
- Wait a few minutes for propagation

### "Invalid grant"
- Check service account key is not expired
- Verify delegated user exists and is active
- Verify scopes match what was authorized

### Email going to spam
- Check mail-tester.com score (should be 10/10)
- Verify SPF, DKIM, DMARC all pass
- Build IP reputation by sending legitimate emails

### DKIM not verifying
- Wait for DNS propagation (up to 48 hours, usually <1 hour)
- Verify DNS record: `dig google._domainkey.automatonicai.com TXT +short`
- Check Admin Console status

---

## 📊 Monitoring

### Daily Checks
- Check inbox for delivery issues
- Monitor spam folder for false positives

### Weekly Checks
- Review DMARC reports (sent to `geoff@automatonicai.com`)
- Check for failed deliveries

### Monthly Checks
- Run mail-tester.com test
- Verify DNS records still correct
- Review email usage and quotas

---

## 📚 Related Documentation

- [Google Workspace Integration Guide](../../guides/integration/google_workspace_guide.md)
- [Google CLI Man Page](../../reference/cli/google_cli.md)
- [KeePassXC Workflow](../security/keepassxc_workflow.md)
- [Disaster Recovery](../disaster_recovery/disaster_recovery.md)

---

## 🔗 External Resources

- [Service Accounts Overview](https://cloud.google.com/iam/docs/service-accounts)
- [Domain-Wide Delegation](https://developers.google.com/identity/protocols/oauth2/service-account#delegatingauthority)
- [Google Workspace Admin SDK](https://developers.google.com/admin-sdk)
- [Email Authentication Best Practices](https://support.google.com/a/answer/33786)

---

**Version:** 2.0.0  
**Last Updated:** 2025-12-05  
**Consolidated from:** 3 runbooks (api_setup, email_config, cli)
