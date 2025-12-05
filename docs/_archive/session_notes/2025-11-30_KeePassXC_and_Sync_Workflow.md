# KeePassXC Verification & SSOT Sync Workflow

**Date:** 2025-11-30
**Purpose:** Verify Chronos credentials in KeePassXC and sync documentation to Confluence
**Status:** 🔄 In Progress

---

## 📋 Session Goals

1. ✅ Verify `chronos_secrets.kdbx` contains all 11 required credentials
2. ✅ Ensure rclone sync includes `chronos_secrets.kdbx`
3. ✅ Sync local docs to Confluence (SSOT workflow)
4. ✅ Harmonize personal and Chronos password workflows
5. ✅ Test complete 3-2-1 backup strategy

---

## Part 1: Verify KeePassXC Chronos Database

### Step 1: Open Verification Checklist

```bash
cd /home/prometheus/coding/finance/project-chronos
cat scripts/ops/verify_keepass_chronos.md
```

### Step 2: Open KeePassXC Database

```bash
# Launch KeePassXC
keepassxc /home/prometheus/security/chronos_secrets.kdbx
```

**Enter master password** when prompted.

### Step 3: Verify All 11 Entries

Go through each section in the checklist:

**AWS (3 entries):**
- [ ] AWS/Root Account
- [ ] AWS/SSO (Prometheus)
- [ ] AWS/Service Accounts/pgbackrest-chronos

**Database (2 entries):**
- [ ] Database/PostgreSQL Production
- [ ] Database/Backup Encryption

**SSH Keys (1 entry + attachment):**
- [ ] SSH Keys/Lightsail chronos-prod-db
  - [ ] Verify attachment exists (Attachments tab)

**Third-Party (3 entries):**
- [ ] Third-Party/Jira API
- [ ] Third-Party/Confluence API
- [ ] Third-Party/Google Workspace

**Domain & DNS (1 entry):**
- [ ] Domain & DNS/BlueHost

### Step 4: Test Database Credential

**From KeePassXC:**
1. Open entry: `Database/PostgreSQL Production`
2. Copy password (right-click → Copy Password)

**In terminal:**
```bash
# Paste password where it says PASSWORD
docker run --rm -it postgres:16-alpine psql \
  "postgresql://chronos:PASSWORD@16.52.210.100:5432/chronos" \
  -c "SELECT 'KeePassXC verification successful!' as status;"
```

**Expected:** Connection succeeds, shows "KeePassXC verification successful!"

### Step 5: Verify SSH Key Attachment

**In KeePassXC:**
1. Open entry: `SSH Keys/Lightsail chronos-prod-db`
2. Go to "Attachments" tab
3. Should see file: `chronos-prod-db`

**If missing:**
```
1. Click "Add" in Attachments tab
2. Navigate to: /home/prometheus/.ssh/aws-lightsail/
3. Select: chronos-prod-db (private key file)
4. Click Open
5. Save entry (Ctrl+S)
```

---

## Part 2: Verify rclone Sync Configuration

### Current Setup Understanding

**Your `/home/prometheus/security/` structure:**
```
security/
├── Master_Passwords.kdbx          ← Personal passwords
├── chronos_secrets.kdbx           ← Project Chronos passwords (NEW)
├── keepass_versions/              ← Git-tracked (auto-versioning)
│   ├── Master_Passwords.kdbx      ← Symlink or copy?
│   └── autover.log
├── aws_credentials.txt            ← TO BE ARCHIVED
├── sprint_7_credentials.txt       ← TO BE ARCHIVED
└── Sprint 7 Phase 1 Complete.txt  ← TO BE ARCHIVED
```

### Step 1: Check rclone Configuration

```bash
# View rclone config
rclone config show

# List your Google Drive remote (should show "gdrive" or similar)
rclone listremotes
```

**Expected:** Should see a Google Drive remote configured.

### Step 2: Check What's Currently Synced

```bash
# List files in Google Drive backup location
rclone ls gdrive:KeePass_Backup

# Or whatever your remote path is
```

**Question for you:** What files do you see? Is `chronos_secrets.kdbx` there?

### Step 3: Verify Your Sync Script/Cron

**Check if you have a sync script:**
```bash
find /home/prometheus -name "*sync*" -name "*.sh" 2>/dev/null
find /home/prometheus -name "*rclone*" -name "*.sh" 2>/dev/null
```

**Check cron jobs:**
```bash
crontab -l
```

**Question for you:** Do you see a cron job syncing security folder?

---

## Part 3: Harmonize Password Workflows

### Goal: Both Databases Follow Same 3-2-1 Strategy

**3-2-1 Backup Strategy:**
- **3 copies** of data
- **2 different storage types**
- **1 offsite backup**

### Current State (Your Personal Passwords)

**Master_Passwords.kdbx:**
1. ✅ **Copy 1:** `/home/prometheus/security/Master_Passwords.kdbx` (primary)
2. ✅ **Copy 2:** `/home/prometheus/security/keepass_versions/Master_Passwords.kdbx` (Git-tracked)
3. ✅ **Copy 3:** Google Drive via rclone (offsite)

**Storage Types:**
- Local SSD (primary + Git)
- Google Drive (cloud)

### Desired State (Chronos Passwords)

**chronos_secrets.kdbx should match:**
1. ✅ **Copy 1:** `/home/prometheus/security/chronos_secrets.kdbx` (primary)
2. ⚠️ **Copy 2:** `/home/prometheus/security/keepass_versions/chronos_secrets.kdbx` (Git-tracked) - **NEEDS SETUP**
3. ⚠️ **Copy 3:** Google Drive via rclone (offsite) - **NEEDS SETUP**

### Step 1: Add chronos_secrets.kdbx to Git Versioning

**Option A: Copy to keepass_versions/ (Simpler)**
```bash
cd /home/prometheus/security

# Copy chronos_secrets.kdbx to Git-tracked folder
cp chronos_secrets.kdbx keepass_versions/

# Check Git status
cd keepass_versions
git status

# If keepass_versions is a Git repo:
git add chronos_secrets.kdbx
git commit -m "Add Chronos secrets database to version control"
git push
```

**Option B: Symlink (More Advanced)**
```bash
cd /home/prometheus/security/keepass_versions

# Create symlink
ln -s ../chronos_secrets.kdbx chronos_secrets.kdbx

# Git might not track symlinks well, so Option A is better
```

**Recommendation:** Use Option A (copy).

### Step 2: Update rclone Sync to Include chronos_secrets.kdbx

**Check your current sync command:**
```bash
# If you have a sync script, view it
cat /path/to/your/sync-script.sh
```

**Typical sync command should be:**
```bash
# Sync entire security/ folder to Google Drive
rclone sync /home/prometheus/security/ gdrive:KeePass_Backup \
  --exclude "legacy_archive_*/" \
  --exclude "*.txt" \
  --verbose

# This will sync:
# - Master_Passwords.kdbx
# - chronos_secrets.kdbx
# - keepass_versions/ directory
```

**Test the sync:**
```bash
# Dry run first (doesn't actually sync)
rclone sync /home/prometheus/security/ gdrive:KeePass_Backup \
  --exclude "legacy_archive_*/" \
  --exclude "*.txt" \
  --dry-run \
  --verbose

# If dry run looks good, run actual sync
rclone sync /home/prometheus/security/ gdrive:KeePass_Backup \
  --exclude "legacy_archive_*/" \
  --exclude "*.txt" \
  --verbose
```

### Step 3: Verify 3-2-1 for Both Databases

**Master_Passwords.kdbx:**
```bash
# Copy 1: Primary
ls -lh /home/prometheus/security/Master_Passwords.kdbx

# Copy 2: Git
ls -lh /home/prometheus/security/keepass_versions/Master_Passwords.kdbx

# Copy 3: Google Drive
rclone ls gdrive:KeePass_Backup | grep Master_Passwords.kdbx
```

**chronos_secrets.kdbx:**
```bash
# Copy 1: Primary
ls -lh /home/prometheus/security/chronos_secrets.kdbx

# Copy 2: Git (after Step 1)
ls -lh /home/prometheus/security/keepass_versions/chronos_secrets.kdbx

# Copy 3: Google Drive (after Step 2)
rclone ls gdrive:KeePass_Backup | grep chronos_secrets.kdbx
```

---

## Part 4: Sync Local Docs to Confluence

### Understanding Your SSOT Workflow

**Workflow:**
1. **Local docs** (`/home/prometheus/coding/finance/project-chronos/docs/`) = SSOT
2. **Confluence mapping** (`.confluence-mapping.json`) = Tracks which docs sync to which pages
3. **Sync script** (`scripts/ops/sync_docs.py`) = Automates the sync

### Step 1: Activate Virtual Environment

```bash
cd /home/prometheus/coding/finance/project-chronos
source .venv/bin/activate
```

### Step 2: Install Missing Dependencies

```bash
# The confluence_cli.py requires markdown2
pip install markdown2
```

### Step 3: Test Confluence CLI

```bash
# Test reading a page
python3 src/chronos/cli/confluence_cli.py list --space PC --limit 5
```

**Expected:** Should list recent Confluence pages in PC space.

### Step 4: Run SSOT Sync

```bash
# Dry run to see what would sync
python3 scripts/ops/sync_docs.py

# This will sync:
# - 2025-11-30_AWS_Training_Belt_Progression.md (NEW)
# - secrets_management_guide.md (NEW)
# - Sprint7_Execution_Plan.md (if not synced yet)
```

**What happens:**
1. Script reads `.confluence-mapping.json`
2. For each file without `page_id`, creates new Confluence page
3. For each file with `page_id`, updates existing page
4. Updates mapping file with new `page_id` and `last_synced` timestamp

### Step 5: Verify Sync in Confluence

**Open Confluence:**
```bash
# Or just visit in browser:
# https://automatonicai.atlassian.net/wiki/spaces/PC/pages
```

**Check for new pages:**
- "AWS Training: Belt Progression to Infrastructure Mastery"
- "Project Chronos - Secrets Management Guide"

### Step 6: Update Mapping File

After sync completes, the mapping file should have new `page_id` values:

```bash
cat docs/.confluence-mapping.json | grep "2025-11-30"
```

**Expected:** Should show `page_id` populated (not empty string).

---

## Part 5: Archive Plain-Text Credentials

### ⚠️ ONLY DO THIS AFTER VERIFICATION IS 100% COMPLETE!

**Safety first:**
- [ ] All 11 credentials verified in KeePassXC
- [ ] Database connection test passed
- [ ] SSH key attachment verified
- [ ] rclone sync includes chronos_secrets.kdbx
- [ ] Google Drive backup confirmed

**Then archive:**
```bash
cd /home/prometheus/security

# Create dated archive folder
mkdir -p archive_$(date +%Y%m%d)

# Move plain-text files to archive
mv sprint_7_credentials.txt archive_$(date +%Y%m%d)/
mv "Sprint 7 Phase 1 Complete.txt" archive_$(date +%Y%m%d)/
mv aws_credentials.txt archive_$(date +%Y%m%d)/

# Verify moved
ls -la archive_$(date +%Y%m%d)/

# Update .gitignore to exclude archives
echo "archive_*/" >> /home/prometheus/security/.gitignore
```

---

## Part 6: Commit and Push Changes

```bash
cd /home/prometheus/coding/finance/project-chronos

# Check status
git status

# Should show:
# - docs/.confluence-mapping.json (modified)
# - docs/session_notes/2025-11-30_AWS_Training_Belt_Progression.md (new)
# - docs/session_notes/2025-11-30_KeePassXC_and_Sync_Workflow.md (new)
# - scripts/ops/verify_keepass_chronos.md (new)

# Stage changes
git add docs/.confluence-mapping.json
git add docs/session_notes/2025-11-30_AWS_Training_Belt_Progression.md
git add docs/session_notes/2025-11-30_KeePassXC_and_Sync_Workflow.md
git add scripts/ops/verify_keepass_chronos.md

# Commit
git commit -m "docs: Add AWS training session and KeePassXC verification workflow

- Add AWS Training Belt Progression session notes
- Add KeePassXC verification checklist
- Add sync workflow documentation
- Update Confluence mapping for new docs"

# Push
git push origin develop
```

---

## Verification Checklist

### KeePassXC
- [ ] `chronos_secrets.kdbx` opened successfully
- [ ] All 11 entries verified
- [ ] SSH key attachment exists
- [ ] Database connection test passed

### 3-2-1 Backup
- [ ] `chronos_secrets.kdbx` copied to `keepass_versions/`
- [ ] `keepass_versions/chronos_secrets.kdbx` committed to Git
- [ ] rclone sync includes `chronos_secrets.kdbx`
- [ ] Google Drive backup confirmed

### SSOT Workflow
- [ ] Virtual environment activated
- [ ] `markdown2` installed
- [ ] Confluence CLI tested
- [ ] Docs synced to Confluence
- [ ] New pages visible in Confluence
- [ ] Mapping file updated with page IDs

### Cleanup
- [ ] Plain-text credential files archived
- [ ] Archive folder created with date
- [ ] `.gitignore` updated
- [ ] Git changes committed and pushed

---

## Troubleshooting

### Issue: Can't Open chronos_secrets.kdbx

**Solution:**
```bash
# Check file exists and permissions
ls -la /home/prometheus/security/chronos_secrets.kdbx

# Fix permissions if needed
chmod 600 /home/prometheus/security/chronos_secrets.kdbx
```

### Issue: rclone Command Not Found

**Solution:**
```bash
# Install rclone
sudo apt install rclone

# Or if already installed, check path
which rclone
```

### Issue: Confluence Sync Fails with "ModuleNotFoundError: markdown2"

**Solution:**
```bash
source .venv/bin/activate
pip install markdown2
pip install atlassian-python-api
```

### Issue: Git Push Fails (keepass_versions)

**Solution:**
```bash
# Check if keepass_versions is a Git repo
cd /home/prometheus/security/keepass_versions
git status

# If not a repo, initialize
git init
git remote add origin YOUR_REMOTE_URL
```

---

## Next Steps After This Session

1. ✅ KeePassXC verification complete
2. ✅ 3-2-1 backup harmonized
3. ✅ Docs synced to Confluence
4. ⏭️ System maintenance (apt update/upgrade)
5. ⏭️ Phase 2 security hardening (CHRONOS-216)

---

## Questions to Answer

**For your clarity, please answer these after completing the steps:**

1. **rclone remote name:** What is your Google Drive remote called? (run: `rclone listremotes`)

2. **Sync frequency:** How often does rclone sync run? (run: `crontab -l`)

3. **keepass_versions Git:** Is it a separate Git repo or part of another repo?

4. **Confluence page IDs:** After sync, what are the page IDs for:
   - AWS Training Belt Progression: ___________
   - Secrets Management Guide: ___________

---

**Session Start:** 2025-11-30
**Status:** 🔄 In Progress
**Completed Sections:** _________
