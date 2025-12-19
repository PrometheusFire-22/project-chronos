# Disaster Recovery: Lost Computer / Local Credentials

**Status:** ✅ Active
**Last Updated:** 2025-12-01
**Risk Level:** HIGH (loss of access to production infrastructure)
**Related Tickets:** CHRONOS-238, CHRONOS-239

---

## Scenario: Computer Lost / Destroyed / Stolen

**Impact:**
- Cannot SSH into Lightsail instance (private key lost)
- Cannot access local development environment
- Cannot access local password database (if not backed up)
- Production database still running but inaccessible

**Recovery Time Objective (RTO):** 2-4 hours
**Recovery Point Objective (RPO):** 0 (no data loss - database is intact)

---

## Prerequisites for Recovery

### ✅ **Required Backups (Must Be Accessible)**

| Asset | Location | How to Access |
|-------|----------|---------------|
| **KeePassXC Database** | 1. Google Drive (`gdrive:security/chronos_secrets.kdbx`)<br>2. Git LFS (`keepass-version-control` repo)<br>3. Local backup (if computer intact) | Download from Google Drive OR clone Git repo from new computer |
| **Master Password** | **⚠️ MUST BE WRITTEN DOWN ON PAPER** | Retrieve from secure physical location (safe, lockbox, etc.) |
| **Phone (for MFA)** | In your possession | Google Authenticator app for AWS SSO |
| **GitHub Access** | GitHub credentials | Email + password + 2FA (phone) |

### ⚠️ **Critical: Master Password Storage**

**YOU MUST HAVE YOUR KEEPASSXC MASTER PASSWORD WRITTEN DOWN PHYSICALLY.**

If you lose both your computer AND forget the master password, **ALL credentials are permanently lost**.

**Recommended Storage Methods:**
1. **Primary:** Written on paper, stored in home safe
2. **Secondary:** Written on paper, stored at trusted family member's location
3. **Tertiary:** Password manager backup (if you use one)

**DO NOT:**
- Store master password digitally on the same computer
- Store master password in cloud without encryption
- Rely solely on memory

---

## Recovery Procedure

### Phase 1: Regain Access to Credentials (30 minutes)

**From New/Borrowed Computer:**

#### Step 1: Recover KeePassXC Database

**Option A: Google Drive (Fastest)**
```bash
# Install rclone on new computer
curl https://rclone.org/install.sh | sudo bash

# Configure Google Drive remote (will open browser for OAuth)
rclone config
# Name: gdrive
# Type: drive
# Follow prompts...

# Download chronos_secrets.kdbx
rclone copy gdrive:security/chronos_secrets.kdbx ~/recovery/
```

**Option B: Git LFS Repository**
```bash
# Clone keepass repository
git clone https://github.com/PrometheusFire-22/keepass-version-control.git
cd keepass-version-control

# Pull LFS files (contains .kdbx)
git lfs pull

# chronos_secrets.kdbx is now available
```

#### Step 2: Install KeePassXC and Open Database

```bash
# Ubuntu/Debian
sudo apt install keepassxc

# macOS
brew install --cask keepassxc

# Windows
# Download from https://keepassxc.org/download/
```

**Open Database:**
1. Launch KeePassXC
2. Open `chronos_secrets.kdbx`
3. Enter **master password** (from written note)
4. ✅ You now have access to ALL credentials

---

### Phase 2: Restore SSH Access to Lightsail (30 minutes)

#### Step 3: Extract SSH Private Key from KeePassXC

**In KeePassXC:**
1. Navigate to `SSH Keys/Lightsail chronos-prod-db` entry
2. Click **Attachments** tab
3. Find `chronos-prod-db` (private key file)
4. Right-click → **Save As** → `~/.ssh/chronos-prod-db-recovered`

**Set Correct Permissions:**
```bash
chmod 600 ~/.ssh/chronos-prod-db-recovered
```

#### Step 4: Test SSH Connection

```bash
# Test connection
ssh -i ~/.ssh/chronos-prod-db-recovered ubuntu@16.52.210.100

# If successful:
echo "✅ SSH access restored!"
```

**If SSH Fails (IP Banned by Fail2ban):**
- Use AWS Lightsail browser-based SSH (see Phase 3)
- Unban your new IP: `sudo fail2ban-client set sshd unbanip YOUR_NEW_IP`
- Add new IP to whitelist (see Phase 4)

---

### Phase 3: Alternative Access via AWS Console (15 minutes)

**If SSH key recovery fails or is not in KeePassXC:**

#### Step 5: AWS SSO Login

**From KeePassXC, retrieve:**
- AWS SSO Start URL
- AWS SSO Username
- AWS SSO Password

**Login:**
1. Open https://[your-sso-start-url].awsapps.com/start
2. Enter username/password
3. Approve MFA prompt on phone (Google Authenticator)
4. Select **Lightsail** from services list

#### Step 6: Use Lightsail Browser-Based SSH

1. Navigate to Lightsail console
2. Click instance: `chronos-production-database`
3. Click **Connect using SSH** button (top right)
4. Browser-based terminal opens
5. ✅ You now have root access to instance

**From browser terminal, you can:**
- Add new SSH key (see Step 7)
- Unban IP from Fail2ban
- Troubleshoot issues
- Create new credentials

#### Step 7: Add New SSH Key (if original lost permanently)

**On new local computer:**
```bash
# Generate new key pair
ssh-keygen -t ed25519 -C "recovery-key-2025-12-01" -f ~/.ssh/chronos-prod-db-new
```

**In Lightsail browser SSH:**
```bash
# Add new public key to authorized_keys
echo "ssh-ed25519 AAAAC3Nza... recovery-key-2025-12-01" >> ~/.ssh/authorized_keys
chmod 600 ~/.ssh/authorized_keys
```

**Test from local computer:**
```bash
ssh -i ~/.ssh/chronos-prod-db-new ubuntu@16.52.210.100
```

**⚠️ IMPORTANT: Backup new key immediately**
1. Save private key as attachment in KeePassXC (`SSH Keys/Lightsail chronos-prod-db NEW`)
2. Run KeePassXC backup: `kpush` (syncs to Google Drive + Git)

---

### Phase 4: Update Fail2ban Whitelist (5 minutes)

**Your IP address likely changed on new computer/network.**

#### Step 8: Get New IP and Whitelist It

```bash
# Get your new public IP
curl https://api.ipify.org

# SSH into instance (using recovered key)
ssh -i ~/.ssh/chronos-prod-db-recovered ubuntu@16.52.210.100

# Edit Fail2ban config
sudo nano /etc/fail2ban/jail.d/chronos-custom.conf

# Update ignoreip line (add new IP)
ignoreip = 127.0.0.1/8 ::1 65.93.136.182 [NEW_IP]

# Restart Fail2ban
sudo systemctl restart fail2ban

# Verify
sudo fail2ban-client get sshd ignoreip
```

---

### Phase 5: Restore Development Environment (1-2 hours)

#### Step 9: Clone Project Repository

```bash
# Clone project-chronos
git clone https://github.com/PrometheusFire-22/project-chronos.git
cd project-chronos

# Checkout develop branch
git checkout develop
```

#### Step 10: Setup Python Virtual Environment

```bash
# Install Python 3.11+
sudo apt install python3 python3-venv python3-pip

# Create virtual environment
python3 -m venv .venv

# Activate
source ..venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

#### Step 11: Configure Environment Variables

**From KeePassXC, retrieve:**
- Jira API Token
- Confluence API Token
- PostgreSQL password
- AWS credentials

**Create `.env` file:**
```bash
# In project root
nano .env

# Add credentials (copy from KeePassXC)
JIRA_URL=https://automatonicai.atlassian.net
JIRA_EMAIL=your_email@example.com
JIRA_API_TOKEN=[from KeePassXC]
# ... etc
```

#### Step 12: Verify Tools Work

```bash
# Test Jira CLI
source ..venv/bin/activate
python3 src/chronos/cli/jira_cli.py list --limit 5

# Test SSH to database
ssh -i ~/.ssh/chronos-prod-db-recovered ubuntu@16.52.210.100 "docker exec chronos-db psql -U chronos -d chronos -c 'SELECT NOW();'"
```

---

## Recovery Checklist

Use this checklist during recovery to ensure nothing is missed:

### Credentials Recovery
- [ ] Located KeePassXC master password (physical note)
- [ ] Installed rclone or git on new computer
- [ ] Downloaded `chronos_secrets.kdbx` from Google Drive OR Git LFS
- [ ] Installed KeePassXC
- [ ] Opened database with master password
- [ ] All 11 credentials visible in KeePassXC

### SSH Access Recovery
- [ ] Extracted SSH private key from KeePassXC attachments
- [ ] Set permissions: `chmod 600 ~/.ssh/chronos-prod-db-recovered`
- [ ] Successfully SSH'd into Lightsail instance
- [ ] OR used AWS Console browser-based SSH
- [ ] Added new SSH key (if original lost)
- [ ] Backed up new key to KeePassXC immediately

### Fail2ban Adjustment
- [ ] Obtained new public IP: `curl https://api.ipify.org`
- [ ] Added new IP to Fail2ban whitelist
- [ ] Restarted Fail2ban: `sudo systemctl restart fail2ban`
- [ ] Verified whitelist: `sudo fail2ban-client get sshd ignoreip`

### Development Environment
- [ ] Cloned project-chronos from GitHub
- [ ] Created Python virtual environment
- [ ] Installed dependencies: `pip install -r requirements.txt`
- [ ] Created `.env` with credentials from KeePassXC
- [ ] Tested Jira CLI tool
- [ ] Tested Confluence CLI tool
- [ ] Tested database connection

### Documentation
- [ ] Updated this DR plan if any steps were unclear
- [ ] Documented what caused the computer loss (if applicable)
- [ ] Created Jira ticket for any improvements needed
- [ ] Updated KeePassXC changelog entry

---

## Prevention: Backup Verification Schedule

**Monthly (1st of month):**
- [ ] Verify Google Drive has latest `chronos_secrets.kdbx`
- [ ] Verify Git LFS has latest version
- [ ] Verify local backup exists: `~/security/keepass_versions/`
- [ ] Verify master password is still written down and accessible

**Quarterly (every 3 months):**
- [ ] Test complete recovery procedure from scratch (use spare computer)
- [ ] Update DR plan with any learnings
- [ ] Verify AWS SSO access still works
- [ ] Verify MFA codes still generate correctly

**After Major Changes:**
- [ ] New SSH key created → Backup to KeePassXC immediately
- [ ] New credential added → Run `kpush` to sync backups
- [ ] IP address changed → Update Fail2ban whitelist

---

## Escalation

**If Recovery Fails:**

| Scenario | Action |
|----------|--------|
| **Lost KeePassXC master password** | ❌ **CRITICAL FAILURE** - All credentials permanently lost. Must recreate all infrastructure from scratch. |
| **Cannot access Google Drive** | Use Git LFS backup instead: `git clone https://github.com/PrometheusFire-22/keepass-version-control.git` |
| **Cannot access Git LFS** | Use Google Drive backup instead (see Step 1, Option A) |
| **Lost phone (MFA)** | Use AWS account recovery process (requires root account email access) |
| **SSH key not in KeePassXC** | Use AWS Lightsail browser-based SSH to add new key (see Phase 3) |
| **Fail2ban permanently blocking you** | Use AWS Lightsail browser-based SSH to unban or disable Fail2ban temporarily |
| **Complete infrastructure inaccessible** | Database backups are in S3 - can restore to new instance (see pgBackRest runbook) |

---

## Related Documentation

- `docs/3_runbooks/keepassxc_unified_workflow.md` - KeePassXC backup procedures
- `docs/3_runbooks/security_hardening_phase2a.md` - SSH and Fail2ban configuration
- `docs/3_runbooks/pgbackrest_backup_restore.md` - Database disaster recovery
- `docs/4_guides/secrets_management_guide.md` - Complete credential inventory

---

## Test Plan

**Purpose:** Verify this DR plan actually works

**Frequency:** Quarterly (every 3 months)

**Procedure:**
1. Use spare/borrowed computer (or VM)
2. Follow recovery procedure from Phase 1
3. Time each phase
4. Document any issues encountered
5. Update this runbook with improvements
6. Create Jira ticket for any automation opportunities

**Success Criteria:**
- [ ] Recovered KeePassXC database within 30 minutes
- [ ] Regained SSH access within 1 hour
- [ ] Restored full development environment within 2 hours
- [ ] Total RTO <4 hours
- [ ] No data loss (RPO = 0)

---

## Change Log

| Date | Change | Notes |
|------|--------|-------|
| 2025-12-01 | Initial DR plan created | Response to user concern about computer loss |

---

**🤖 Generated with Claude Code (Anthropic)**
**Last Updated:** 2025-12-01
**Status:** ✅ Active - Test Quarterly
