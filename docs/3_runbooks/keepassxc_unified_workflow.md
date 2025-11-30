# KeePassXC Unified Workflow: Personal + Project Secrets

**Last Updated:** 2025-11-30
**Status:** ✅ Production
**Applies To:** Both `Master_Passwords.kdbx` (personal) and `chronos_secrets.kdbx` (project)

---

## Overview

This workflow ensures both your personal passwords and Project Chronos credentials follow the same secure 3-2-1 backup strategy.

### 3-2-1 Backup Strategy

- **3 copies** of each database
- **2 different storage types** (local SSD + cloud)
- **1 offsite backup** (Google Drive)

---

## Database Locations

### Master_Passwords.kdbx (Personal)

| Copy | Location | Type | Updated |
|------|----------|------|---------|
| **Copy 1** (Primary) | `/home/prometheus/security/Master_Passwords.kdbx` | Local SSD | Manual (KeePassXC saves) |
| **Copy 2** (Git) | `/home/prometheus/security/keepass_versions/Master_Passwords.kdbx` | Local SSD + GitHub | Manual copy + Git commit |
| **Copy 3** (Cloud) | `gdrive:security/Master_Passwords.kdbx` | Google Drive | rclone sync |

**Git Repository:** `github.com:PrometheusFire-22/keepass-version-control.git`

---

### chronos_secrets.kdbx (Project Chronos)

| Copy | Location | Type | Updated |
|------|----------|------|---------|
| **Copy 1** (Primary) | `/home/prometheus/security/chronos_secrets.kdbx` | Local SSD | Manual (KeePassXC saves) |
| **Copy 2** (Git) | `/home/prometheus/security/keepass_versions/chronos_secrets.kdbx` | Local SSD + GitHub | Manual copy + Git commit |
| **Copy 3** (Cloud) | `gdrive:security/chronos_secrets.kdbx` | Google Drive | rclone sync |

**Git Repository:** `github.com:PrometheusFire-22/keepass-version-control.git` (same as personal)

---

## Daily Workflow

### When You Add/Update Credentials

**In KeePassXC:**
1. Open database (`Master_Passwords.kdbx` or `chronos_secrets.kdbx`)
2. Add or update entry
3. **Save** (`Ctrl+S` or File → Save)
4. Close KeePassXC (or leave open)

**Then run sync commands:**

```bash
# ═══════════════════════════════════════════════════════
# KEEPASSXC SYNC WORKFLOW - Run after any changes
# ═══════════════════════════════════════════════════════

# 1. Sync to Google Drive (both databases)
rclone copy /home/prometheus/security/Master_Passwords.kdbx gdrive:security --verbose
rclone copy /home/prometheus/security/chronos_secrets.kdbx gdrive:security --verbose

# 2. Verify cloud backup
rclone ls gdrive:security

# Expected output:
#   245653 Master_Passwords.kdbx
#    13781 chronos_secrets.kdbx

# 3. Copy to Git-tracked folder
cd /home/prometheus/security/keepass_versions
cp ../Master_Passwords.kdbx .
cp ../chronos_secrets.kdbx .

# 4. Commit to Git
git add Master_Passwords.kdbx chronos_secrets.kdbx
git commit -m "Update KeePass databases - $(date +%Y-%m-%d)"
git push

# ═══════════════════════════════════════════════════════
# Total time: ~30 seconds
# ═══════════════════════════════════════════════════════
```

---

## Weekly Verification (Fridays)

**Every Friday, verify all backups exist:**

```bash
# ═══════════════════════════════════════════════════════
# KEEPASSXC WEEKLY VERIFICATION - Run every Friday
# ═══════════════════════════════════════════════════════

# 1. Check primary databases
ls -lh /home/prometheus/security/*.kdbx

# Expected:
# chronos_secrets.kdbx
# Master_Passwords.kdbx

# 2. Check Git versions
ls -lh /home/prometheus/security/keepass_versions/*.kdbx

# Expected:
# chronos_secrets.kdbx
# Master_Passwords.kdbx

# 3. Check Google Drive
rclone ls gdrive:security

# Expected:
# Both .kdbx files listed

# 4. Check Git remote
cd /home/prometheus/security/keepass_versions
git log --oneline -5

# Expected: Recent commits visible

# ═══════════════════════════════════════════════════════
# If any check fails, investigate immediately!
# ═══════════════════════════════════════════════════════
```

---

## Restore Procedures

### Scenario 1: Lost Primary Database Locally

**If you delete `/home/prometheus/security/Master_Passwords.kdbx` by accident:**

```bash
# Option A: Restore from Git (fastest)
cp /home/prometheus/security/keepass_versions/Master_Passwords.kdbx \
   /home/prometheus/security/

# Option B: Restore from Google Drive
rclone copy gdrive:security/Master_Passwords.kdbx \
   /home/prometheus/security/

# Verify restored
ls -lh /home/prometheus/security/Master_Passwords.kdbx
keepassxc /home/prometheus/security/Master_Passwords.kdbx
```

Same procedure for `chronos_secrets.kdbx`.

---

### Scenario 2: Need Older Version (Regression)

**If you need to rollback to a previous version:**

```bash
# Check Git history
cd /home/prometheus/security/keepass_versions
git log --oneline --all

# Example output:
# 38aaed2 Add Chronos secrets database for version tracking
# 3d120e2 Update KeePass databases - 2025-11-29
# ab12cd3 Update KeePass databases - 2025-11-28

# Checkout specific version
git checkout 3d120e2 -- Master_Passwords.kdbx

# Copy to primary location
cp Master_Passwords.kdbx ../

# Return to latest
git checkout main
```

---

### Scenario 3: Complete Catastrophe (Lost Everything Locally)

**If your laptop dies and you need to restore on a new machine:**

```bash
# 1. Install rclone and configure Google Drive
rclone config

# 2. Download databases from Google Drive
mkdir -p /home/prometheus/security
rclone copy gdrive:security/Master_Passwords.kdbx /home/prometheus/security/
rclone copy gdrive:security/chronos_secrets.kdbx /home/prometheus/security/

# 3. Clone Git repo
mkdir -p /home/prometheus/security/keepass_versions
cd /home/prometheus/security/keepass_versions
git clone git@github.com:PrometheusFire-22/keepass-version-control.git .

# 4. Install KeePassXC
sudo apt install keepassxc

# 5. Open databases
keepassxc /home/prometheus/security/Master_Passwords.kdbx
keepassxc /home/prometheus/security/chronos_secrets.kdbx
```

---

## Automation (Future - CHRONOS-223)

**Planned automation:**
- Hourly rclone sync (cron job)
- Daily Git commit (cron job)
- Weekly verification report (email)

**Status:** Not yet implemented (see CHRONOS-223)

---

## Security Notes

### Access Control

| Database | Contains | Access Level |
|----------|----------|--------------|
| `Master_Passwords.kdbx` | Personal accounts, banking, email, social media | Personal only |
| `chronos_secrets.kdbx` | Project Chronos AWS, database, API credentials | Project only |

**Master Passwords:**
- Stored in your brain (memorized)
- Written on paper in physical safe (emergency backup)
- **NEVER** stored digitally

### Encryption

- **At Rest:** AES-256 (KeePassXC default)
- **In Transit:** TLS 1.2+ (rclone → Google Drive)
- **Git Storage:** Encrypted .kdbx files (Git LFS enabled)

### File Permissions

```bash
# Primary databases (600 = owner read/write only)
chmod 600 /home/prometheus/security/*.kdbx

# Git versions (644 = owner read/write, others read)
# Safe because .kdbx files are encrypted
chmod 644 /home/prometheus/security/keepass_versions/*.kdbx
```

---

## Troubleshooting

### Issue: rclone Sync Fails

**Error:** `Failed to copy: access token expired`

**Solution:**
```bash
# Re-authenticate with Google
rclone config reconnect gdrive:

# Retry sync
rclone copy /home/prometheus/security/chronos_secrets.kdbx gdrive:security --verbose
```

---

### Issue: Git Push Fails

**Error:** `fatal: The current branch main has no upstream branch`

**Solution:**
```bash
cd /home/prometheus/security/keepass_versions
git push --set-upstream origin main
```

---

### Issue: KeePassXC Says "Database Modified"

**Problem:** KeePassXC warns that database was modified externally.

**Cause:** You copied a newer version from Git or Google Drive.

**Solution:**
1. Close KeePassXC
2. Reopen database
3. KeePassXC will load the updated version

**Or:**
- Click "Reload" in the warning dialog

---

## File Structure Reference

```
/home/prometheus/security/
├── Master_Passwords.kdbx          ← Personal (PRIMARY)
├── chronos_secrets.kdbx           ← Project (PRIMARY)
├── keepass_versions/              ← Git-tracked versions
│   ├── Master_Passwords.kdbx      ← Copy for Git
│   ├── chronos_secrets.kdbx       ← Copy for Git
│   ├── .git/                      ← Git repo
│   └── autover.log
├── archive_20251130/              ← Old plain-text files (archived)
│   ├── sprint_7_credentials.txt
│   ├── Sprint 7 Phase 1 Complete.txt
│   └── aws_credentials.txt
└── legacy_archive_20251121021710/ ← Very old backups

Google Drive: gdrive:security/
├── Master_Passwords.kdbx          ← Cloud backup
└── chronos_secrets.kdbx           ← Cloud backup

GitHub: github.com:PrometheusFire-22/keepass-version-control
├── Master_Passwords.kdbx          ← Git history
└── chronos_secrets.kdbx           ← Git history
```

---

## Credentials Inventory

### Master_Passwords.kdbx Contains

- Personal email accounts
- Banking & financial services
- Social media
- Shopping accounts
- Utilities & subscriptions
- **~50-100 entries (estimated)**

### chronos_secrets.kdbx Contains

**Exactly 11 entries:**

1. AWS/Root Account
2. AWS/SSO (Prometheus)
3. AWS/Service Accounts/pgbackrest-chronos
4. Database/PostgreSQL Production
5. Database/Backup Encryption
6. SSH Keys/Lightsail chronos-prod-db (+ attachment)
7. Third-Party/Jira API
8. Third-Party/Confluence API
9. Third-Party/Google Workspace
10. Domain & DNS/BlueHost
11. (Future expansion as needed)

---

## Quick Command Reference

```bash
# Sync both databases to Google Drive
rclone copy /home/prometheus/security/Master_Passwords.kdbx gdrive:security --verbose
rclone copy /home/prometheus/security/chronos_secrets.kdbx gdrive:security --verbose

# Verify cloud backup
rclone ls gdrive:security

# Copy to Git folder
cd /home/prometheus/security/keepass_versions
cp ../Master_Passwords.kdbx ../chronos_secrets.kdbx .

# Commit and push
git add *.kdbx
git commit -m "Update KeePass databases - $(date +%Y-%m-%d)"
git push

# Weekly verification (all in one)
ls -lh /home/prometheus/security/*.kdbx && \
ls -lh /home/prometheus/security/keepass_versions/*.kdbx && \
rclone ls gdrive:security && \
cd /home/prometheus/security/keepass_versions && git log --oneline -3
```

---

## Change Log

| Date | Change | Ticket |
|------|--------|--------|
| 2025-11-30 | Created unified workflow document | N/A |
| 2025-11-30 | Added chronos_secrets.kdbx to Git version control | N/A |
| 2025-11-30 | Added chronos_secrets.kdbx to Google Drive backup | N/A |
| 2025-11-30 | Verified SSH key attachment in chronos_secrets.kdbx | N/A |

---

**Next Steps:**
- Implement automation (CHRONOS-223)
- Set up weekly verification email/notification
- Consider key rotation schedule (annual for SSH, semi-annual for DB passwords)

**Related Documentation:**
- `docs/4_guides/secrets_management_guide.md` - Detailed credential inventory
- `docs/session_notes/2025-11-30_KeePassXC_and_Sync_Workflow.md` - Setup session notes
