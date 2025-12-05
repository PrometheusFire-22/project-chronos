# KeePassXC Tagging Methodology

**Purpose:** Consistent tagging system for all KeePassXC entries to enable efficient searching, maintenance scheduling, and credential management.

**Last Updated:** 2025-12-04

---

## 🎯 Core Principle

**Every entry MUST have exactly 5 tag types:**
1. **Criticality** (1 tag)
2. **Service** (1+ tags)
3. **Rotation** (1 tag)
4. **Environment** (1+ tags)
5. **Type** (1+ tags)

**Format:** `criticality, service, rotation, environment, type`

**Example:** `critical, google, api-key, production, rotate-quarterly`

---

## 📊 Tag Categories

### 1. Criticality Tags (Choose ONE)

| Tag | When to Use | Impact if Lost/Compromised |
|-----|-------------|---------------------------|
| `critical` | Root accounts, production databases, service accounts with broad access | Catastrophic - complete system compromise or data loss |
| `important` | API keys with limited scope, non-root admin accounts | Significant - service disruption or security incident |
| `standard` | Development credentials, read-only access, non-sensitive | Minimal - inconvenience only |

**Decision Tree:**
- Can this credential access production data? → `critical`
- Can this credential modify system configuration? → `critical`
- Is this a root/super admin account? → `critical`
- Can this credential cause service disruption? → `important`
- Is this development/testing only? → `standard`

---

### 2. Service Tags (Choose ONE or MORE)

**Cloud Providers:**
- `aws` - Amazon Web Services
- `google` - Google Cloud / Google Workspace
- `azure` - Microsoft Azure
- `digitalocean` - DigitalOcean
- `heroku` - Heroku

**Development Tools:**
- `github` - GitHub
- `gitlab` - GitLab
- `bitbucket` - Bitbucket
- `docker` - Docker Hub

**Project Management:**
- `atlassian` - Jira / Confluence
- `notion` - Notion
- `asana` - Asana

**Databases:**
- `database` - Any database credential
- `postgresql` - PostgreSQL specific
- `mysql` - MySQL specific
- `mongodb` - MongoDB specific
- `redis` - Redis specific

**Infrastructure:**
- `dns` - DNS / Domain management
- `ssl` - SSL certificates
- `email` - Email services
- `cdn` - CDN services

**Other:**
- `analytics` - Analytics platforms
- `monitoring` - Monitoring tools
- `backup` - Backup services

**Multiple Tags Example:**
```
Entry: PostgreSQL Production Database
Tags: critical, database, postgresql, production, password, rotate-quarterly
```

---

### 3. Rotation Tags (Choose ONE)

| Tag | Frequency | Use Cases |
|-----|-----------|-----------|
| `rotate-monthly` | Every 30 days | Highly sensitive production API keys |
| `rotate-quarterly` | Every 90 days | Service accounts, API keys, production passwords |
| `rotate-biannually` | Every 6 months | Admin passwords, SSH keys |
| `rotate-annually` | Every 12 months | Root accounts, domain registrations, SSL certs |
| `no-rotation` | Never | Configuration values, non-secret data |

**Decision Tree:**
- Is this a service account or API key? → `rotate-quarterly`
- Is this a root/admin password? → `rotate-annually`
- Is this an SSH key? → `rotate-biannually`
- Is this a domain registration or SSL cert? → `rotate-annually`
- Is this configuration data (not a secret)? → `no-rotation`

**Rotation Calendar:**
- **Monthly:** 1st of each month
- **Quarterly:** Jan 1, Apr 1, Jul 1, Oct 1
- **Biannually:** Jan 1, Jul 1
- **Annually:** Jan 1

---

### 4. Environment Tags (Choose ONE or MORE)

| Tag | When to Use |
|-----|-------------|
| `production` | Live production systems |
| `staging` | Staging/pre-production environments |
| `development` | Development/testing environments |
| `dr` | Disaster recovery systems |
| `backup` | Backup systems |

**Multiple Environments Example:**
```
Entry: PostgreSQL DR Database
Tags: critical, database, postgresql, production, dr, password, rotate-quarterly
```

---

### 5. Type Tags (Choose ONE or MORE)

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

**Multiple Types Example:**
```
Entry: AWS Root Account
Tags: critical, aws, root-account, password, 2fa-enabled, production, rotate-annually
```

---

## 📝 Tagging Examples

### Google Workspace

**Super Admin Account:**
```
Title: Google Workspace - Super Admin (geoff@automatonicai.com)
Tags: critical, google, admin, password, 2fa-enabled, production, rotate-annually
```

**Service Account:**
```
Title: Google Workspace - Service Account (chronos-workspace-automation)
Tags: critical, google, api-key, service-account, production, rotate-quarterly
```

**2FA Backup Codes:**
```
Title: Google Workspace - 2FA Backup Codes
Tags: critical, google, 2fa-enabled, production, no-rotation
```

### AWS

**Root Account:**
```
Title: AWS - Root Account
Tags: critical, aws, root-account, password, 2fa-enabled, production, rotate-annually
```

**IAM User:**
```
Title: AWS - IAM User (prometheus)
Tags: critical, aws, api-key, admin, production, rotate-quarterly
```

**SSH Key:**
```
Title: Lightsail - SSH Key (chronos-prod-db)
Tags: critical, aws, ssh-key, production, rotate-biannually
```

### Databases

**Production Database:**
```
Title: PostgreSQL - Production Database
Tags: critical, database, postgresql, password, production, rotate-quarterly
```

**SSL Certificate:**
```
Title: PostgreSQL - SSL Configuration
Tags: important, database, postgresql, ssl, certificate, production, rotate-annually
```

**Backup Encryption:**
```
Title: pgBackRest - Encryption Key
Tags: critical, database, backup, encryption-key, production, rotate-annually
```

### GitHub

**Account:**
```
Title: GitHub - Account (PrometheusFire-22)
Tags: critical, github, admin, password, 2fa-enabled, production, rotate-annually
```

**Personal Access Token:**
```
Title: GitHub - Personal Access Token (repo-access)
Tags: important, github, api-key, production, rotate-quarterly
```

### Domain & DNS

**Domain Registration:**
```
Title: Bluehost - Domain Registration (automatonicai.com)
Tags: critical, dns, password, production, rotate-annually
```

**Let's Encrypt:**
```
Title: Let's Encrypt - SSL Certificate (automatonicai.com)
Tags: critical, ssl, certificate, production, no-rotation
```
*Note: Auto-renews, no manual rotation needed*

---

## 🔍 Using Tags for Searches

### Find Entries Needing Rotation

**This month (quarterly rotation):**
```
tag:rotate-quarterly
```

**This year (annual rotation):**
```
tag:rotate-annually
```

**All rotation needed:**
```
tag:rotate-quarterly OR tag:rotate-annually OR tag:rotate-biannually
```

### Find Critical Entries

**All critical credentials:**
```
tag:critical
```

**Critical production credentials:**
```
tag:critical tag:production
```

**Critical API keys:**
```
tag:critical tag:api-key
```

### Find by Service

**All Google credentials:**
```
tag:google
```

**All AWS production credentials:**
```
tag:aws tag:production
```

**All database credentials:**
```
tag:database
```

### Find by Type

**All entries with 2FA:**
```
tag:2fa-enabled
```

**All root accounts:**
```
tag:root-account
```

**All SSH keys:**
```
tag:ssh-key
```

### Complex Searches

**Critical production API keys needing quarterly rotation:**
```
tag:critical tag:production tag:api-key tag:rotate-quarterly
```

**All Google production credentials:**
```
tag:google tag:production
```

---

## 📅 Maintenance Workflows

### Monthly Review (1st of Month)

**Search:** `tag:rotate-monthly`

**Actions:**
1. Rotate all monthly credentials
2. Update KeePassXC entries with new values
3. Update rotation history in notes
4. Test new credentials

### Quarterly Review (Jan 1, Apr 1, Jul 1, Oct 1)

**Search:** `tag:rotate-quarterly`

**Actions:**
1. Rotate all quarterly credentials
2. Update KeePassXC entries
3. Update rotation history
4. Test new credentials
5. Review `tag:critical` entries for accuracy

### Annual Review (Jan 1)

**Search:** `tag:rotate-annually`

**Actions:**
1. Rotate all annual credentials
2. Update KeePassXC entries
3. Update rotation history
4. Test new credentials
5. Full audit of all entries
6. Review and update tags
7. Remove obsolete entries

---

## ✅ Tagging Checklist

**When creating a new entry:**

- [ ] Entry has a clear, descriptive title following naming convention
- [ ] Entry has exactly 1 criticality tag
- [ ] Entry has at least 1 service tag
- [ ] Entry has exactly 1 rotation tag
- [ ] Entry has at least 1 environment tag
- [ ] Entry has at least 1 type tag
- [ ] Total of 5+ tags
- [ ] Tags are comma-separated
- [ ] Tags are lowercase

**Example:**
```
Title: AWS - IAM User (chronos-certbot)
Tags: important, aws, api-key, production, rotate-quarterly
✅ 5 tags, all categories covered
```

---

## 🚨 Common Mistakes to Avoid

**❌ DON'T:**
- Use multiple criticality tags (`critical, important`)
- Forget rotation tags (`critical, aws, production` - missing rotation!)
- Use uppercase tags (`Critical, AWS, Production`)
- Use spaces in tags (`rotate quarterly` instead of `rotate-quarterly`)
- Skip environment tags for production credentials
- Use vague tags (`important-stuff`, `work`)

**✅ DO:**
- Use exactly 1 criticality tag
- Always include rotation tag
- Use lowercase, hyphenated tags
- Be specific with service tags
- Include all 5 tag types
- Review tags quarterly

---

## 📊 Tag Statistics

**Track your credential health:**

**Total entries by criticality:**
- `tag:critical` - Should be <30% of total
- `tag:important` - Should be ~50% of total
- `tag:standard` - Should be ~20% of total

**Rotation distribution:**
- `tag:rotate-quarterly` - Most API keys
- `tag:rotate-annually` - Most passwords
- `tag:no-rotation` - Configuration only

**If you have too many `critical` entries, review and downgrade some to `important`.**

---

## 🔄 Migration Guide

**For existing entries without tags:**

1. **Search:** `All Entries`
2. **Filter:** Entries without tags (manually review)
3. **For each entry:**
   - Determine criticality (critical/important/standard)
   - Identify service (aws/google/github/etc)
   - Set rotation schedule (quarterly/annually/etc)
   - Identify environment (production/development)
   - Identify type (password/api-key/ssh-key/etc)
4. **Add tags** following the 5-category system
5. **Save** and move to next entry

**Estimated time:** 2-3 minutes per entry

---

**Version:** 1.0.0  
**Last Updated:** 2025-12-04  
**Next Review:** 2026-01-01
