# ⚠️ CRITICAL: KeePassXC Setup Checklist

**DO THIS WITHIN 24 HOURS OR RISK LOSING CREDENTIALS!**

---

## Why This Is Critical

You now have **14+ production credentials** that are required to:
- Access your production database
- Restore backups from S3
- SSH into your Lightsail instance (16.52.210.100)
- Manage AWS infrastructure

**If you lose these credentials = project crisis.**

---

## Quick Start (30 minutes)

### Step 1: Install KeePassXC

```bash
sudo apt update
sudo apt install keepassxc
```

### Step 2: Launch and Create Database

```bash
# Create secrets directory
mkdir -p ~/.secrets

# Launch KeePassXC
keepassxc
```

In KeePassXC:
1. Click "Create new database"
2. **Database Name:** `project-chronos`
3. **Save Location:** `~/.secrets/project-chronos.kdbx`
4. **Master Password:** Create a STRONG passphrase
   - Use 4+ random words (e.g., "correct horse battery staple")
   - **WRITE IT DOWN** on paper and store in safe place
   - This is the ONE password you must remember
5. Click through encryption settings (defaults are fine)
6. Save database

### Step 3: Create Folder Structure

Right-click in left sidebar → "Add new group" for each:
- AWS
- Database
- SSH Keys
- Third-Party
- Domain & DNS

### Step 4: Add ALL Credentials

Open this Confluence page for actual values:
**https://automatonicai.atlassian.net/wiki/spaces/PC/pages/6619202**

For each credential in the Confluence page:
1. Right-click folder → "Add new entry"
2. Copy title, username, password, URL from Confluence
3. Add custom fields as shown in Confluence
4. Save entry

**You MUST add all 14+ credentials from the Confluence page!**

### Step 5: Attach SSH Private Key

For the SSH key entry:
1. Open "SSH - Lightsail chronos-prod-db" entry
2. Go to "Attachments" tab
3. Click "Add"
4. Select `~/.ssh/aws-lightsail/chronos-prod-db` (private key file)
5. Save entry

### Step 6: Create Backup

```bash
# Create backup directory
mkdir -p ~/.secrets/backups

# Create first backup
cp ~/.secrets/project-chronos.kdbx ~/.secrets/backups/project-chronos-$(date +%Y%m%d).kdbx

# Verify backup exists
ls -lh ~/.secrets/backups/
```

### Step 7: Test Access

1. Close KeePassXC
2. Reopen it: `keepassxc`
3. Open `~/.secrets/project-chronos.kdbx`
4. Enter master password
5. Verify all entries are there
6. Copy a password to test

---

## Complete Credentials List (Check Off As You Add)

**From Confluence:** https://automatonicai.atlassian.net/wiki/spaces/PC/pages/6619202

### AWS Folder
- [ ] AWS Root Account
- [ ] AWS SSO - Prometheus Admin
- [ ] AWS Service Account: pgbackrest-chronos (with Access Key ID and Secret)

### Database Folder
- [ ] PostgreSQL Production - chronos-db (get password from Lightsail: `cat ~/chronos-db/.env`)
- [ ] pgBackRest Encryption Key (ChronosBackup2025SecureKey)

### SSH Keys Folder
- [ ] SSH - Lightsail chronos-prod-db (attach private key file!)

### Third-Party Folder
- [ ] Jira API (get from local `.env`: `cat .env | grep JIRA`)
- [ ] Confluence API (get from local `.env`: `cat .env | grep CONFLUENCE`)

### Domain & DNS Folder
- [ ] BlueHost - automatonicai.com
- [ ] Google Workspace - AutomatonicAI

---

## Where to Get Missing Values

### PostgreSQL Password
```bash
ssh -i ~/.ssh/aws-lightsail/chronos-prod-db ubuntu@16.52.210.100
cat ~/chronos-db/.env | grep POSTGRES_PASSWORD
```

### Jira/Confluence API Tokens
```bash
cat .env | grep -E "JIRA|CONFLUENCE"
```

### AWS Credentials
All in Confluence page: https://automatonicai.atlassian.net/wiki/spaces/PC/pages/6619202

---

## Backup Strategy

### Weekly Backups (Automated)

Create `~/.local/bin/backup-keepass.sh`:

```bash
#!/bin/bash
SOURCE="$HOME/.secrets/project-chronos.kdbx"
BACKUP_DIR="$HOME/.secrets/backups"
DATE=$(date +%Y%m%d-%H%M%S)

mkdir -p "$BACKUP_DIR"
cp "$SOURCE" "$BACKUP_DIR/project-chronos-$DATE.kdbx"

# Keep only last 10 backups
cd "$BACKUP_DIR"
ls -t project-chronos-*.kdbx | tail -n +11 | xargs -r rm

echo "Backup created: $BACKUP_DIR/project-chronos-$DATE.kdbx"
```

Make it executable:
```bash
chmod +x ~/.local/bin/backup-keepass.sh
```

Add to cron (runs every Sunday at 2 AM):
```bash
crontab -e
# Add this line:
0 2 * * 0 /home/prometheus/.local/bin/backup-keepass.sh
```

### Cloud Backup (Monthly)

```bash
# Encrypt database
gpg --symmetric --cipher-algo AES256 ~/.secrets/project-chronos.kdbx

# Upload project-chronos.kdbx.gpg to:
# - Google Drive (personal account)
# - Dropbox
# - External USB drive

# DO NOT use project/business cloud storage
```

---

## Testing Checklist

After setup, verify:

- [ ] Can open database with master password
- [ ] All 14+ entries are present
- [ ] SSH private key is attached
- [ ] Can copy passwords successfully
- [ ] Backup exists in `~/.secrets/backups/`
- [ ] Master password written down on paper
- [ ] Paper stored in safe location (not on computer!)

---

## Emergency Access

### If You Lose Master Password

**You're locked out.** The database is encrypted with your password.

**Recovery options:**
1. Check your paper backup of master password
2. Try common passwords you use
3. If truly lost, use Confluence to rebuild database:
   - https://automatonicai.atlassian.net/wiki/spaces/PC/pages/6619202
   - Create new KeePassXC database
   - Re-add all credentials from Confluence

### If You Lose .kdbx File

**Use your backup:**
```bash
# From local backup
cp ~/.secrets/backups/project-chronos-LATEST.kdbx ~/.secrets/project-chronos.kdbx

# From cloud backup
# Download and decrypt
gpg --decrypt project-chronos.kdbx.gpg > ~/.secrets/project-chronos.kdbx

# From Confluence
# Rebuild database using complete credentials page
```

---

## Daily Usage

### Copy Password
1. Open KeePassXC
2. Navigate to credential
3. Right-click password field → "Copy password"
4. Paste where needed (auto-clears after 10 seconds)

### Browser Integration (Optional)
1. Install KeePassXC Browser extension
2. Connect to database
3. Auto-fill passwords in browser

---

## Next Steps After Setup

1. **Test SSH Connection**
   ```bash
   ssh -i ~/.ssh/aws-lightsail/chronos-prod-db ubuntu@16.52.210.100
   ```

2. **Test Database Connection**
   ```bash
   psql postgresql://chronos:[PASSWORD_FROM_KEEPASSXC]@16.52.210.100:5432/chronos
   ```

3. **Verify AWS Credentials**
   ```bash
   aws sso login
   ```

4. **Schedule Weekly Backup**
   - Set calendar reminder every Sunday
   - Or set up cron job (see above)

---

## Documentation References

### Full Guides
- **Complete Step-by-Step:** `docs/4_guides/secrets_management_guide.md`
- **Confluence (with actual passwords):** https://automatonicai.atlassian.net/wiki/spaces/PC/pages/6619202

### Quick Reference
- **Phase 1 Summary:** `docs/session_notes/2025-11-27_Sprint7_Phase1_COMPLETE.md`
- **Backup Runbook:** `docs/3_runbooks/pgbackrest_backup_restore.md`

---

## Troubleshooting

### KeePassXC won't open database
- **Issue:** "Wrong password" error
- **Fix:** Check master password written on paper
- **Last resort:** Rebuild from Confluence

### Can't find private key
- **Issue:** SSH private key missing
- **Fix:** Download from KeePassXC attachment or Lightsail console

### Forgot a password
- **Fix:** Check KeePassXC entry or Confluence page

---

## Support

**KeePassXC Help:**
- Official docs: https://keepassxc.org/docs/
- User guide: https://keepassxc.org/docs/KeePassXC_UserGuide.html

**Project Chronos Help:**
- All docs in `docs/` directory
- Confluence: https://automatonicai.atlassian.net/wiki/spaces/PC

---

**⏰ DO THIS TODAY!**

**Time Required:** 30-60 minutes
**Criticality:** MAXIMUM - Prevents credential loss crisis

**Start now:** `sudo apt install keepassxc && keepassxc`

---

**🤖 Generated with Claude Code**
**Created:** 2025-11-27
**Priority:** CRITICAL - Complete within 24 hours
