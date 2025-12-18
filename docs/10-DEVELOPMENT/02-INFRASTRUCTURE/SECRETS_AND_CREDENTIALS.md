# Secrets and Credentials Management - SSOT

**CRITICAL: This is your Single Source of Truth for credential management**

**Created:** 2025-11-27  
**Consolidated:** 2025-12-12  
**Last Updated:** 2025-12-12  
**Status:** Production - Active Use Required

---

## ⚠️ CRITICAL WARNING

**Without these credentials, you CANNOT:**
- Access your production database
- Restore backups from S3
- SSH into your Lightsail instance
- Manage AWS infrastructure
- Access Jira/Confluence APIs
- Access Google Workspace

**This is not optional. Follow this guide completely.**

---

## Table of Contents

1. [Overview](#overview)
2. [KeePassXC Setup (Step-by-Step)](#keepassxc-setup-step-by-step)
3. [Organization \u0026 Tagging Methodology](#organization--tagging-methodology)
4. [Daily Workflow](#daily-workflow)
5. [All Credentials Inventory](#all-credentials-inventory)
6. [Rotation Schedule \u0026 Procedures](#rotation-schedule--procedures)
7. [Backup Strategy](#backup-strategy)
8. [Emergency Access Procedures](#emergency-access-procedures)
9. [What Goes Where (SSOT Rules)](#what-goes-where-ssot-rules)
10. [Maintenance Checklists](#maintenance-checklists)

---

## Overview

### The Problem
You now have **14+ critical credentials** spread across:
- AWS (root, SSO, service accounts)
- Database (PostgreSQL, backup encryption)
- SSH keys
- API tokens (Jira, Confluence, Google)
- Domain registration

**Losing any of these = project crisis.**

### The Solution
**Single Source of Truth (SSOT):** KeePassXC database stored locally with cloud backup.

### Why KeePassXC?
- ✅ Offline, encrypted (AES-256)
- ✅ Cross-platform (Linux, Mac, Windows)
- ✅ No cloud dependencies (you control the file)
- ✅ Browser integration for auto-fill
- ✅ Supports file attachments (SSH keys)
- ✅ Tagging for organization and rotation tracking

---

## KeePassXC Setup (Step-by-Step)

### Step 1: Install KeePassXC

```bash
# Ubuntu/Debian
sudo apt update
sudo apt install keepassxc

# Check installation
keepassxc --version
```

### Step 2: Create Your Database

1. **Launch KeePassXC**
   ```bash
   keepassxc
   ```

2. **Create New Database**
   - Click "Create new database"
   - **Database Name:** `project-chronos`
   - **Save Location:** `~/.secrets/project-chronos.kdbx`
     - Create `.secrets` directory: `mkdir -p ~/.secrets`
     - This keeps it separate from project files

3. **Set Master Password**
   - **CRITICAL:** This is the ONE password you must remember
   - **Recommendation:** Use a strong passphrase (4+ random words)
   - **Example:** `correct horse battery staple` (but create your own!)
   - **Write this down** on paper and store in a safe place
   - **DO NOT** store master password in digital form anywhere

4. **Optional: Add Key File (2FA)**
   - For extra security, generate a key file
   - Store key file separately (USB drive, encrypted cloud)
   - You'll need BOTH password + key file to open database

### Step 3: Create Folder Structure

Create these folders in KeePassXC:

```
project-chronos.kdbx
├── AWS/
│   ├── Root Account
│   ├── SSO (Prometheus)
│   └── Service Accounts/
│       └── pgbackrest-chronos
├── Database/
│   ├── PostgreSQL Production
│   └── Backup Encryption
├── SSH Keys/
│   └── Lightsail chronos-prod-db
├── Third-Party/
│   ├── Jira API
│   ├── Confluence API
│   └── Google Workspace
└── Domain \u0026 DNS/
    └── BlueHost
```

**How to create folders in KeePassXC:**
1. Right-click in the left sidebar → "Add new group"
2. Name the group (e.g., "AWS")
3. Repeat for all folders above

---

## Organization \u0026 Tagging Methodology

### Core Principle

**Every entry MUST have exactly 5 tag types:**
1. **Criticality** (1 tag)
2. **Service** (1+ tags)
3. **Rotation** (1 tag)
4. **Environment** (1+ tags)
5. **Type** (1+ tags)

**Format:** `criticality, service, rotation, environment, type`

**Example:** `critical, google, api-key, production, rotate-quarterly`

### Tag Categories

#### 1. Criticality Tags (Choose ONE)

| Tag | When to Use | Impact if Lost/Compromised |
|-----|-------------|----------------------------|
| `critical` | Root accounts, production databases, service accounts with broad access | Catastrophic - complete system compromise or data loss |
| `important` | API keys with limited scope, non-root admin accounts | Significant - service disruption or security incident |
| `standard` | Development credentials, read-only access, non-sensitive | Minimal - inconvenience only |

**Decision Tree:**
- Can this credential access production data? → `critical`
- Can this credential modify system configuration? → `critical`
- Is this a root/super admin account? → `critical`
- Can this credential cause service disruption? → `important`
- Is this development/testing only? → `standard`

#### 2. Service Tags (Choose ONE or MORE)

**Cloud Providers:**
- `aws` - Amazon Web Services
- `google` - Google Cloud / Google Workspace
- `azure` - Microsoft Azure

**Development Tools:**
- `github` - GitHub
- `gitlab` - GitLab
- `docker` - Docker Hub

**Project Management:**
- `atlassian` - Jira / Confluence

**Databases:**
- `database` - Any database credential
- `postgresql` - PostgreSQL specific

**Infrastructure:**
- `dns` - DNS / Domain management
- `ssl` - SSL certificates
- `email` - Email services
- `backup` - Backup services

#### 3. Rotation Tags (Choose ONE)

| Tag | Frequency | Use Cases |
|-----|-----------|-----------|
| `rotate-monthly` | Every 30 days | Highly sensitive production API keys |
| `rotate-quarterly` | Every 90 days | Service accounts, API keys, production passwords |
| `rotate-biannually` | Every 6 months | Admin passwords, SSH keys |
| `rotate-annually` | Every 12 months | Root accounts, domain registrations, SSL certs |
| `no-rotation` | Never | Backup encryption keys (would break backups) |

#### 4. Environment Tags (Choose ONE or MORE)

| Tag | When to Use |
|-----|-------------|
| `production` | Live production systems |
| `staging` | Staging/pre-production environments |
| `development` | Development/testing environments |
| `dr` | Disaster recovery systems |
| `backup` | Backup systems |

#### 5. Type Tags (Choose ONE or MORE)

| Tag | What It Represents |
|-----|-------------------|
| `password` | User passwords |
| `api-key` | API keys, access tokens |
| `ssh-key` | SSH private keys |
| `certificate` | SSL/TLS certificates |
| `connection-string` | Database connection strings |
| `encryption-key` | Encryption keys |
| `2fa-enabled` | Account has 2FA enabled |
| `root-account` | Root/super admin account |
| `service-account` | Service account (non-human) |
| `admin` | Admin account (human) |

### Tagging Examples

**AWS Root Account:**
```
Title: AWS - Root Account
Tags: critical, aws, root-account, password, 2fa-enabled, production, rotate-annually
```

**PostgreSQL Production:**
```
Title: PostgreSQL - Production Database
Tags: critical, database, postgresql, password, production, rotate-quarterly
```

**Jira API:**
```
Title: Jira API - AutomatonicAI
Tags: important, atlassian, api-key, service-account, production, rotate-quarterly
```

---

## Daily Workflow

### Opening KeePassXC

```bash
# Launch KeePassXC
keepassxc ~/.secrets/project-chronos.kdbx

# Or use GUI
# Applications → KeePassXC
```

**Master Password:** Stored in memory only, never written down

### Adding New Credentials

1. Click **"Add Entry"** (Ctrl+N)
2. Fill in details:
   - **Title:** Service name (e.g., "AWS Console - Production")
   - **Username:** Email or username
   - **Password:** Generate strong password (32+ chars)
   - **URL:** Service URL
   - **Tags:** Apply all 5 tag types (see tagging guide above)
3. **Save** (Ctrl+S)

### Password Generation

**Settings:**
- **Length:** 32 characters minimum
- **Include:** Uppercase, lowercase, numbers, symbols
- **Exclude:** Ambiguous characters (0, O, l, 1)

**Generate in KeePassXC:**
1. Click **password generator** icon
2. Adjust settings if needed
3. Click **"Generate"**
4. Copy to clipboard (auto-clears after 10 seconds)

### Searching for Credentials

**Find entries needing rotation this quarter:**
```
tag:rotate-quarterly
```

**Find all critical production credentials:**
```
tag:critical tag:production
```

**Find all AWS credentials:**
```
tag:aws
```

---

## All Credentials Inventory

### AWS Root Account

**Location in KeePassXC:** `AWS/Root Account`

| Field | Value |
|-------|-------|
| Title | AWS Root Account - AutomatonicAI |
| Username | [Your AWS root email] |
| Password | [Your root password] |
| URL | https://console.aws.amazon.com |
| Account ID | 314758835721 |
| Tags | critical, aws, root-account, password, 2fa-enabled, production, rotate-annually |
| Notes | ⚠️ ONLY use for account-level changes. Use SSO for daily work. MFA enabled. |

**Custom Fields to Add:**
- `Account ID`: 314758835721
- `MFA Device`: [TOTP seed or recovery codes]
- `Recovery Email`: [Backup email]

---

### AWS IAM Identity Center (SSO)

**Location in KeePassXC:** `AWS/SSO (Prometheus)`

| Field | Value |
|-------|-------|
| Title | AWS SSO - Prometheus Admin |
| Username | Prometheus |
| URL | https://d-9a670b0130.awsapps.com/start |
| Tags | critical, aws, admin, production, rotate-annually |
| Notes | Browser-based SSO. Credentials expire every 8-12 hours. Use for daily AWS work. |

**Custom Fields:**
- `SSO Start URL`: https://d-9a670b0130.awsapps.com/start
- `Role`: AdministratorAccess
- `Account ID`: 314758835721
- `Region`: ca-central-1 (Resources) / us-east-2 (IAM Identity Center)

---

### AWS Service Account: pgbackrest-chronos

**Location in KeePassXC:** `AWS/Service Accounts/pgbackrest-chronos`

| Field | Value |
|-------|-------|
| Title | AWS IAM - pgbackrest-chronos |
| Username | pgbackrest-chronos |
| Tags | critical, aws, api-key, service-account, backup, production, rotate-annually |
| Notes | Service account for pgBackRest S3 backups. Least privilege (S3 bucket only). |

**Custom Fields:**
- `Access Key ID`: [FROM KEEPASSXC]
- `Secret Access Key`: [FROM KEEPASSXC]
- `S3 Bucket`: project-chronos-backups
- `S3 Region`: ca-central-1
- `Policy`: pgbackrest-s3-access
- `Created`: 2025-11-27
- `Next Rotation`: 2026-11-27

**Where Used:**
- PostgreSQL container: `/etc/pgbackrest/pgbackrest.conf`

---

### PostgreSQL Production Database

**Location in KeePassXC:** `Database/PostgreSQL Production`

| Field | Value |
|-------|-------|
| Title | PostgreSQL Production - chronos-db |
| Username | chronos |
| Password | [Your PostgreSQL chronos user password] |
| URL | postgresql://16.52.210.100:5432/chronos |
| Tags | critical, database, postgresql, password, production, rotate-quarterly |
| Notes | Primary production database on Lightsail. SSL enabled but not required yet. |

**Custom Fields:**
- `Host`: 16.52.210.100
- `Port`: 5432
- `Database`: chronos
- `SSL Mode`: prefer
- `Connection String`: postgresql://chronos:[PASSWORD]@16.52.210.100:5432/chronos
- `Created`: 2025-11-27
- `Next Rotation`: 2026-05-27

**How to Use:**
```bash
# Direct connection
psql postgresql://chronos:[PASSWORD]@16.52.210.100:5432/chronos

# From Docker container
docker exec -it chronos-db psql -U chronos -d chronos
```

---

### pgBackRest Backup Encryption

**Location in KeePassXC:** `Database/Backup Encryption`

| Field | Value |
|-------|-------|
| Title | pgBackRest Encryption Key |
| Password | [STORED IN KEEPASSXC] |
| Tags | critical, database, encryption-key, backup, production, no-rotation |
| Notes | ⚠️ NEVER rotate this key - would invalidate all existing backups in S3! |

**Custom Fields:**
- `Cipher Type`: aes-256-cbc
- `S3 Bucket`: project-chronos-backups
- `S3 Region`: ca-central-1
- `Created`: 2025-11-27
- `Rotation Policy`: NEVER (would break backup history)

**Where Used:**
- PostgreSQL container: `/etc/pgbackrest/pgbackrest.conf` (repo1-cipher-pass)

**Critical Warning:**
If you lose this key, you **cannot restore any backups**. If you rotate this key, all existing backups become unusable.

---

### SSH Key: Lightsail chronos-prod-db

**Location in KeePassXC:** `SSH Keys/Lightsail chronos-prod-db`

| Field | Value |
|-------|-------|
| Title | SSH - Lightsail chronos-prod-db |
| Username | ubuntu |
| URL | ssh://16.52.210.100 |
| Tags | critical, ssh-key, production, rotate-annually |
| Notes | ED25519 key pair. Root login disabled. Key-only authentication. |

**Custom Fields:**
- `Host`: 16.52.210.100
- `Port`: 22
- `Key Type`: ED25519
- `Private Key Path`: ~/.ssh/aws-lightsail/chronos-prod-db
- `Public Key Fingerprint`: SHA256:iSNj2Om218h4Sri/je6zDFAuDAyMFv3IcgtFZL+wUko
- `Connection Command`: ssh -i ~/.ssh/aws-lightsail/chronos-prod-db ubuntu@16.52.210.100
- `Created`: 2025-11-27
- `Next Rotation`: 2026-11-27

**Attachment:**
1. In KeePassXC entry, click "Attachments" tab
2. Click "Add" → Select `~/.ssh/aws-lightsail/chronos-prod-db` (private key file)
3. Save entry

---

### Jira API Token

**Location in KeePassXC:** `Third-Party/Jira API`

| Field | Value |
|-------|-------|
| Title | Jira API - AutomatonicAI |
| Username | [Your Atlassian email] |
| Password | [Your Jira API token] |
| URL | https://automatonicai.atlassian.net |
| Tags | important, atlassian, api-key, service-account, production, rotate-quarterly |
| Notes | Used by Atlassian CLI. Token stored in local .env only. |

**Custom Fields:**
- `Base URL`: https://automatonicai.atlassian.net
- `API Token`: [From Atlassian account settings]
- `Email`: [Your Atlassian email]
- `Created`: [Date you created token]
- `Next Rotation`: [Quarterly]

**How to Regenerate:**
1. Go to https://id.atlassian.com/manage-profile/security/api-tokens
2. Click "Create API token"
3. Copy token immediately (shown only once)
4. Update KeePassXC entry
5. Update local `.env` file

---

### Confluence API Token

**Location in KeePassXC:** `Third-Party/Confluence API`

| Field | Value |
|-------|-------|
| Title | Confluence API - AutomatonicAI |
| Username | [Your Atlassian email] |
| Password | [Your Confluence API token] |
| URL | https://automatonicai.atlassian.net/wiki |
| Tags | important, atlassian, api-key, service-account, production, rotate-quarterly |
| Notes | Used by Atlassian CLI. Token stored in local .env only. |

**Note:** Same process as Jira API token regeneration.

---

### BlueHost Domain Registration

**Location in KeePassXC:** `Domain \u0026 DNS/BlueHost`

| Field | Value |
|-------|-------|
| Title | BlueHost - automatonicai.com |
| Username | [Your BlueHost username] |
| Password | [Your BlueHost password] |
| URL | https://my.bluehost.com |
| Tags | important, dns, password, production, rotate-annually |
| Notes | Domain registrar. DNS records managed here (not Route 53). MX points to Google Workspace. |

**Custom Fields:**
- `Domain`: automatonicai.com
- `Registrar`: BlueHost
- `Renewal Date`: [Check BlueHost account]
- `Nameservers`: BlueHost DNS (not AWS Route 53)

---

### Google Workspace (Email)

**Location in KeePassXC:** `Third-Party/Google Workspace`

| Field | Value |
|-------|-------|
| Title | Google Workspace - AutomatonicAI |
| Username | [Your admin email @automatonicai.com] |
| Password | [Your Google Workspace password] |
| URL | https://admin.google.com |
| Tags | critical, google, email, admin, password, 2fa-enabled, production, rotate-annually |
| Notes | Email hosting for automatonicai.com. MX records configured in BlueHost DNS. |

**Custom Fields:**
- `Domain`: automatonicai.com
- `Admin Console`: https://admin.google.com
- `MX Records`: Configured in BlueHost DNS

---

## Rotation Schedule \u0026 Procedures

### Rotation Schedule

| Credential | Frequency | Next Due | Risk if Compromised |
|------------|-----------|----------|---------------------|
| AWS Root Password | Never (use SSO) | N/A | CRITICAL - Full account access |
| AWS SSO | Auto (8-12hr) | Automatic | HIGH - Full admin access |
| pgbackrest-chronos Keys | Annual | 2026-11-27 | MEDIUM - S3 bucket only |
| PostgreSQL chronos Password | Quarterly | 2026-05-27 | CRITICAL - Database access |
| Backup Encryption Key | NEVER | N/A | CRITICAL - Cannot restore backups |
| SSH Key | Annual | 2026-11-27 | HIGH - Server access |
| Jira API Token | Quarterly | 2026-11-27 | LOW - Jira access only |
| Confluence API Token | Quarterly | 2026-11-27 | LOW - Confluence access only |

### Rotation Procedures

#### AWS IAM Access Keys (pgbackrest-chronos)
```bash
# 1. Create new access key
aws iam create-access-key --user-name pgbackrest-chronos

# 2. Update pgbackrest.conf in container
docker exec -it chronos-db vi /etc/pgbackrest/pgbackrest.conf
# Update repo1-s3-key and repo1-s3-key-secret

# 3. Test backup
docker exec -u postgres chronos-db pgbackrest --stanza=chronos check

# 4. Delete old access key
aws iam delete-access-key --user-name pgbackrest-chronos --access-key-id OLD_KEY_ID

# 5. Update KeePassXC entry
```

#### PostgreSQL Password
```bash
# 1. SSH into Lightsail
ssh -i ~/.ssh/aws-lightsail/chronos-prod-db ubuntu@16.52.210.100

# 2. Connect to PostgreSQL
docker exec -it chronos-db psql -U postgres

# 3. Change password
ALTER USER chronos WITH PASSWORD 'new-secure-password';

# 4. Update connection strings in:
# - Local .env file
# - Any application configs
# - KeePassXC entry

# 5. Test connection
psql postgresql://chronos:new-secure-password@16.52.210.100:5432/chronos
```

#### SSH Key
```bash
# 1. Generate new key pair
ssh-keygen -t ed25519 -f ~/.ssh/aws-lightsail/chronos-prod-db-new -C "chronos-prod-db-2026"

# 2. Add new public key to Lightsail
ssh -i ~/.ssh/aws-lightsail/chronos-prod-db ubuntu@16.52.210.100
cat >> ~/.ssh/authorized_keys
# Paste new public key, Ctrl+D

# 3. Test new key
ssh -i ~/.ssh/aws-lightsail/chronos-prod-db-new ubuntu@16.52.210.100

# 4. Remove old key from authorized_keys
# 5. Rename new key to replace old
mv ~/.ssh/aws-lightsail/chronos-prod-db-new ~/.ssh/aws-lightsail/chronos-prod-db

# 6. Update KeePassXC entry attachment
```

---

## Backup Strategy

### KeePassXC Database Backups

**Critical: Your KeePassXC database must have backups!**

#### Backup Plan

**Local Backups:**
```bash
# Weekly backup to external drive
cp ~/.secrets/project-chronos.kdbx /media/usb-drive/backups/project-chronos-$(date +%Y%m%d).kdbx

# Keep 4 weekly backups
```

**Cloud Backups (Encrypted):**
```bash
# Encrypt database before cloud upload
gpg --symmetric --cipher-algo AES256 ~/.secrets/project-chronos.kdbx

# Upload to personal cloud storage
# - Google Drive (personal account)
# - Dropbox
# - OneDrive
# DO NOT use project/business cloud storage
```

**Backup Schedule:**
- **After every credential change:** Immediate backup
- **Weekly:** Automated backup (set cron job)
- **Before major changes:** Manual backup

**Test Restores:**
- **Monthly:** Download backup and verify you can open it
- **Quarterly:** Full restore test to new machine

#### Automated Backup Script

Create `~/.local/bin/backup-keepass.sh`:

```bash
#!/bin/bash
# KeePassXC Database Backup Script

SOURCE="$HOME/.secrets/project-chronos.kdbx"
BACKUP_DIR="$HOME/.secrets/backups"
DATE=$(date +%Y%m%d-%H%M%S)

# Create backup directory
mkdir -p "$BACKUP_DIR"

# Copy database
cp "$SOURCE" "$BACKUP_DIR/project-chronos-$DATE.kdbx"

# Keep only last 10 backups
cd "$BACKUP_DIR"
ls -t project-chronos-*.kdbx | tail -n +11 | xargs -r rm

echo "Backup created: $BACKUP_DIR/project-chronos-$DATE.kdbx"
```

Make executable and add to cron:
```bash
chmod +x ~/.local/bin/backup-keepass.sh

# Run every Sunday at 2 AM
crontab -e
# Add: 0 2 * * 0 /home/prometheus/.local/bin/backup-keepass.sh
```

---

## Emergency Access Procedures

### If You Lose KeePassXC Database

**Priority 1: Assess What You Have**
- [ ] Do you have the master password written down?
- [ ] Do you have a backup of the .kdbx file?
- [ ] Do you have access to any systems still logged in?

**Priority 2: AWS Access**
1. **If you have root email access:**
   - Go to https://console.aws.amazon.com
   - Click "Forgot password"
   - Reset root password via email
   - Log in with root account
   - Create new IAM users/keys

2. **If you lost root email access:**
   - Contact AWS Support (requires account verification)
   - Provide account ID: 314758835721

**Priority 3: Database Access**
1. **SSH into Lightsail:**
   - If you have the private key elsewhere, use it
   - If not, download from Lightsail console using AWS root/SSO

2. **Reset PostgreSQL password:**
   ```bash
   docker exec -it chronos-db psql -U postgres
   ALTER USER chronos WITH PASSWORD 'new-password';
   ```

**Priority 4: Regenerate API Tokens**
- Jira/Confluence: Regenerate at https://id.atlassian.com/manage-profile/security/api-tokens

**Priority 5: Rebuild KeePassXC Database**
- Create new database with all recovered credentials
- Update rotation schedule for all regenerated credentials

### Database Corruption

**Symptoms:**
- KeePassXC won't open database
- "Invalid credentials" despite correct password
- File size is 0 bytes

**Recovery:**
```bash
# 1. Check file integrity
ls -lh ~/.secrets/project-chronos.kdbx

# 2. Restore from backup
cp ~/.secrets/backups/project-chronos-YYYYMMDD.kdbx ~/.secrets/project-chronos.kdbx

# 3. Test restored database
keepassxc ~/.secrets/project-chronos.kdbx
```

---

## What Goes Where (SSOT Rules)

### KeePassXC (Offline, Encrypted) ← **PRIMARY SSOT**

**Store Here:**
- ✅ All passwords and secrets
- ✅ SSH private keys (as attachments)
- ✅ AWS access keys and secrets
- ✅ API tokens (master copy)
- ✅ Backup encryption keys
- ✅ Recovery codes
- ✅ Security questions/answers

**This is your single source of truth. Everything else is a derivative.**

---

### Local `.env` File (Gitignored)

**Store Here:**
- ✅ API tokens for development (copy from KeePassXC)
- ✅ Database connection strings (copy from KeePassXC)
- ✅ AWS credentials for CLI (copy from KeePassXC)

**Update When:**
- Credentials rotated in KeePassXC
- Starting new development session

**Example `.env`:**
```bash
# Database
DATABASE_URL=postgresql://chronos:[FROM_KEEPASSXC]@16.52.210.100:5432/chronos

# Jira/Confluence
JIRA_EMAIL=[FROM_KEEPASSXC]
JIRA_API_TOKEN=[FROM_KEEPASSXC]
CONFLUENCE_EMAIL=[FROM_KEEPASSXC]
CONFLUENCE_API_TOKEN=[FROM_KEEPASSXC]

# AWS (if using CLI locally)
AWS_ACCESS_KEY_ID=[FROM_KEEPASSXC]
AWS_SECRET_ACCESS_KEY=[FROM_KEEPASSXC]
AWS_DEFAULT_REGION=ca-central-1
```

---

### Confluence (For Reference Only)

**Store Here:**
- ✅ System architecture diagrams
- ✅ Non-sensitive configuration examples
- ✅ Links to where secrets are stored (e.g., "See KeePassXC: AWS/pgbackrest")
- ✅ Runbooks and procedures

**DO NOT Store:**
- ❌ Actual passwords
- ❌ Actual API tokens
- ❌ Actual SSH private keys
- ❌ AWS access keys

**Acceptable Examples in Confluence:**
```markdown
# PostgreSQL Connection
Host: 16.52.210.100
Port: 5432
Database: chronos
Username: chronos
Password: [See KeePassXC: Database/PostgreSQL Production]
```

---

### GitHub (NEVER Store Secrets)

**NEVER Commit:**
- ❌ Passwords
- ❌ API tokens
- ❌ Private keys
- ❌ AWS access keys
- ❌ Database passwords
- ❌ Encryption keys

**Safe to Commit:**
- ✅ Example/template files (`.env.example`)
- ✅ Public configuration
- ✅ Documentation referencing where to find secrets
- ✅ .gitignore patterns

---

## Maintenance Checklists

### Weekly Tasks

- [ ] Verify KeePassXC database backup exists
- [ ] Check for pending credential updates
- [ ] Review recently added entries for proper tagging

### Monthly Tasks (1st of Month)

**Search:** `tag:rotate-monthly`

**Actions:**
- [ ] Rotate all monthly credentials
- [ ] Update KeePassXC entries with new values
- [ ] Test new credentials
- [ ] Create manual backup
- [ ] Test backup restore

### Quarterly Tasks (Jan 1, Apr 1, Jul 1, Oct 1)

**Search:** `tag:rotate-quarterly`

**Actions:**
- [ ] Rotate all quarterly credentials (PostgreSQL, Jira, Confluence)
- [ ] Update KeePassXC entries
- [ ] Test new credentials
- [ ] Review `tag:critical` entries for accuracy
- [ ] Test disaster recovery procedure

### Annual Tasks (Jan 1)

**Search:** `tag:rotate-annually`

**Actions:**
- [ ] Rotate all annual credentials (AWS root, SSH keys, domain)
- [ ] Full audit of all entries
- [ ] Review and update tags
- [ ] Remove obsolete entries
- [ ] Update break-glass kit
- [ ] Review and update organization structure

---

## Quick Reference Card

Print this and keep near your workspace:

```
╔════════════════════════════════════════════════════════════╗
║           PROJECT CHRONOS - CRITICAL CREDENTIALS           ║
╠════════════════════════════════════════════════════════════╣
║                                                            ║
║  KeePassXC Database: ~/.secrets/project-chronos.kdbx       ║
║  Master Password: [WRITTEN ON PAPER - SAFE LOCATION]      ║
║                                                            ║
║  In Emergency:                                             ║
║  1. Open KeePassXC database                                ║
║  2. Navigate to needed credential folder                   ║
║  3. Copy password/key                                      ║
║  4. Never email/message credentials                        ║
║                                                            ║
║  Backup Locations:                                         ║
║  - Weekly: ~/.secrets/backups/                             ║
║  - Monthly: Encrypted cloud backup                         ║
║                                                            ║
║  If Database Lost:                                         ║
║  1. Check backup locations above                           ║
║  2. Reset AWS root password (via email)                    ║
║  3. See Emergency Access section in guide                  ║
║                                                            ║
╚════════════════════════════════════════════════════════════╝
```

---

## Support Resources

**KeePassXC Documentation:**
- Official Site: https://keepassxc.org
- User Guide: https://keepassxc.org/docs/KeePassXC_UserGuide.html
- FAQ: https://keepassxc.org/docs/KeePassXC_GettingStarted.html#_faq

**Credential Recovery:**
- AWS Support: https://console.aws.amazon.com/support/home
- Atlassian Support: https://support.atlassian.com

---

## Document History

**Consolidated from:**
- `docs/guides/security/secrets_management.md` (Primary source - credentials inventory)
- `docs/operations/security/keepassxc_workflow.md` (Daily workflow procedures)
- `docs/guides/organization/keepassxc_organization.md` (Tagging methodology)

**Consolidation Date:** 2025-12-12  
**Part of:** Documentation refactor to create SSOT documentation  
**Related:** `docs/DOCUMENTATION_REFACTOR_DECISION.md`

---

**🤖 Consolidated with AI Assistance**  
**Last Updated:** 2025-12-12  
**Version:** 2.0 (Consolidated SSOT)  
**Status:** Production - CRITICAL REFERENCE ⚠️
