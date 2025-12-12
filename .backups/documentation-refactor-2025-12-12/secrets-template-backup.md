# Project Chronos - Secrets Reference Template

**⚠️ THIS FILE IS GITIGNORED - Add actual secrets to KeePassXC**

This template shows what secrets need to be stored. Store actual values in KeePassXC.

---

## KeePassXC Organization

### Recommended Folder Structure

```
KeePassXC Database: project-chronos.kdbx
├── AWS/
│   ├── IAM Root User
│   ├── IAM SSO (Prometheus)
│   └── pgbackrest-chronos (Service Account)
├── Database/
│   ├── PostgreSQL Production (chronos-db)
│   └── PostgreSQL Backup Encryption
├── SSH Keys/
│   ├── Lightsail chronos-prod-db
│   └── GitHub Deploy Keys (future)
└── Third-Party/
    ├── Jira API
    ├── Confluence API
    └── Google Workspace (email)
```

---

## AWS Credentials

### 1. AWS Root Account
**Entry Name:** `AWS Root Account - AutomatonicAI`
- **Username:** [Your root email]
- **Password:** [Root password]
- **Account ID:** 314758835721
- **MFA Device:** [TOTP seed or recovery codes]
- **Notes:** Only use for account-level changes. Use SSO for daily work.

### 2. AWS IAM Identity Center (SSO)
**Entry Name:** `AWS SSO - Prometheus Admin`
- **Username:** Prometheus
- **SSO Start URL:** https://d-9a670b0130.awsapps.com/start
- **Role:** AdministratorAccess
- **Account ID:** 314758835721
- **Region:** us-east-2 (IAM Identity Center)
- **Default Region:** ca-central-1 (Resources)
- **Notes:** Browser-based SSO. Credentials expire every 8-12 hours.

### 3. pgBackRest Service Account
**Entry Name:** `AWS IAM - pgbackrest-chronos`
- **Username:** pgbackrest-chronos
- **Access Key ID:** [COPY FROM ABOVE]
- **Secret Access Key:** [COPY FROM ABOVE]
- **Policy:** pgbackrest-s3-access (S3 bucket only)
- **Created:** 2025-11-27
- **Rotation Schedule:** Annual
- **Notes:** Used by pgBackRest for S3 backups. Least privilege.

---

## Database Credentials

### PostgreSQL Production Database
**Entry Name:** `PostgreSQL Production - chronos-db`
- **Host:** 16.52.210.100
- **Port:** 5432
- **Database:** chronos
- **Username:** chronos
- **Password:** [COPY FROM ABOVE]
- **Connection String:** `postgresql://chronos:[PASSWORD]@16.52.210.100:5432/chronos`
- **SSL Mode:** prefer (SSL enabled but not required yet)
- **Notes:** Primary production database on Lightsail.

### pgBackRest Backup Encryption
**Entry Name:** `pgBackRest Encryption Key`
- **Cipher Type:** aes-256-cbc
- **Cipher Password:** [COPY FROM ABOVE]
- **S3 Bucket:** project-chronos-backups
- **S3 Region:** ca-central-1
- **Notes:** Used to encrypt backups at rest in S3.

---

## SSH Keys

### Lightsail Instance Access
**Entry Name:** `SSH - Lightsail chronos-prod-db`
- **Host:** 16.52.210.100
- **Username:** ubuntu
- **Private Key Location:** `~/.ssh/aws-lightsail/chronos-prod-db`
- **Public Key Fingerprint:** SHA256:iSNj2Om218h4Sri/je6zDFAuDAyMFv3IcgtFZL+wUko
- **Key Type:** ED25519
- **Connection Command:** `ssh -i ~/.ssh/aws-lightsail/chronos-prod-db ubuntu@16.52.210.100`
- **Notes:** Key-only auth. Root login disabled.

**Attachment:** Store private key file as attachment in KeePassXC

---

## API Credentials

### Jira API
**Entry Name:** `Jira API - AutomatonicAI`
- **Email:** [Your Atlassian email]
- **API Token:** [From .env file]
- **Base URL:** https://automatonicai.atlassian.net
- **Created:** [Date]
- **Notes:** Used by jira_cli.py. Token in local .env only.

### Confluence API
**Entry Name:** `Confluence API - AutomatonicAI`
- **Email:** [Your Atlassian email]
- **API Token:** [From .env file]
- **Base URL:** https://automatonicai.atlassian.net/wiki
- **Created:** [Date]
- **Notes:** Used by confluence_cli.py. Token in local .env only.

---

## Domain & DNS

### Domain Registration
**Entry Name:** `BlueHost - automatonicai.com`
- **Domain:** automatonicai.com
- **Registrar:** BlueHost
- **Username:** [BlueHost login]
- **Password:** [BlueHost password]
- **Renewal Date:** [Date]
- **Nameservers:** BlueHost DNS (not Route 53)
- **Notes:** DNS records managed in BlueHost. MX points to Google Workspace.

### Google Workspace (Email)
**Entry Name:** `Google Workspace - AutomatonicAI`
- **Admin Email:** [Your admin email]
- **Domain:** automatonicai.com
- **MX Records:** Configured in BlueHost DNS
- **Notes:** Email hosting for automatonicai.com domain.

---

## Quick Reference Map

| System | Entry Name | Location | Rotation |
|--------|-----------|----------|----------|
| AWS Root | `AWS Root Account - AutomatonicAI` | KeePassXC: AWS/ | Never (use SSO) |
| AWS SSO | `AWS SSO - Prometheus Admin` | KeePassXC: AWS/ | 8-12 hours (auto) |
| AWS Service | `AWS IAM - pgbackrest-chronos` | KeePassXC: AWS/ | Annual |
| PostgreSQL | `PostgreSQL Production - chronos-db` | KeePassXC: Database/ | Semi-annual |
| Backup Encryption | `pgBackRest Encryption Key` | KeePassXC: Database/ | Never |
| SSH Key | `SSH - Lightsail chronos-prod-db` | KeePassXC: SSH Keys/ | Annual |
| Jira API | `Jira API - AutomatonicAI` | KeePassXC: Third-Party/ | Annual |
| Confluence API | `Confluence API - AutomatonicAI` | KeePassXC: Third-Party/ | Annual |

---

## Security Best Practices

### KeePassXC Setup
1. **Database Location:** Store `project-chronos.kdbx` in secure location (NOT in git repo)
2. **Master Password:** Strong passphrase (4+ random words)
3. **Key File:** Consider additional key file for 2-factor protection
4. **Backups:**
   - Local: Encrypted backup to external drive
   - Cloud: Encrypted backup to personal cloud storage
   - Test restore quarterly

### Credential Rotation Schedule
- **AWS Service Account Keys:** Annually (set calendar reminder)
- **Database Passwords:** Semi-annually
- **SSH Keys:** Annually or when compromised
- **API Tokens:** Annually or when compromised
- **Backup Encryption Key:** Never (would invalidate all backups)

### Access Patterns
- **Daily Work:** AWS SSO only (temporary credentials)
- **Automation:** Service account keys (pgbackrest-chronos)
- **Emergency:** Root account (MFA required)

### What Goes Where

**KeePassXC (Offline, encrypted):**
- All passwords and secrets
- SSH private keys (as attachments)
- API tokens
- Backup/recovery codes

**Local `.env` file (Gitignored):**
- API tokens for development
- Database connection strings
- AWS credentials for CLI

**Confluence (For reference only):**
- System architecture
- Non-sensitive configuration
- Links to where secrets are stored ("See KeePassXC: AWS/pgbackrest")

**NEVER in Git:**
- Passwords
- API tokens
- Private keys
- Access keys

---

## Emergency Access

### If KeePassXC Database Lost

1. **AWS:** Use root account with email reset
2. **Database:** Restore from backup, reset chronos password
3. **SSH:** Generate new key pair, upload to Lightsail console
4. **API Tokens:** Regenerate in Atlassian settings

### If Lightsail Instance Lost

1. All credentials remain valid
2. Provision new instance from backup
3. No credential rotation needed (unless compromised)

---

## Audit Log

| Date | Action | Credential | Reason |
|------|--------|------------|--------|
| 2025-11-27 | Created | pgbackrest-chronos | Initial backup setup |
| 2025-11-27 | Created | PostgreSQL chronos user | Database provisioning |
| 2025-11-27 | Created | SSH key chronos-prod-db | Instance access |
| [Future] | Rotated | [Credential] | [Annual rotation] |

---

**🤖 This is a template only - Store actual secrets in KeePassXC**
**Last Updated:** 2025-11-27
