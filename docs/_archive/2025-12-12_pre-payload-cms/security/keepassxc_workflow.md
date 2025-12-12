# KeePassXC Workflow

**Purpose:** Operational procedures for daily KeePassXC usage, syncing, and backup.

**Last Updated:** 2025-12-05

---

## 📋 Quick Reference

**Daily Operations:**
- Open database: `keepassxc ~/Sync/Passwords.kdbx`
- Sync to Google Drive: Auto-synced via Insync
- Backup: Automatic via Google Drive versioning

**Key Locations:**
- **Primary:** `~/Sync/Passwords.kdbx` (Insync-synced)
- **Backup:** Google Drive automatic versioning
- **Emergency:** Break-glass kit in safe

---

## 🔐 Daily Workflow

### Opening KeePassXC

```bash
# Launch KeePassXC
keepassxc ~/Sync/Passwords.kdbx

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
   - **Tags:** Apply appropriate tags (see tagging guide)
3. **Save** (Ctrl+S)

### Organizing Entries

**Group Structure:**
```
Passwords.kdbx
├── Personal/
├── Project Chronos/
│   ├── AWS/
│   ├── Google Workspace/
│   ├── Atlassian/
│   └── Development/
└── Clients/
```

**Tagging:** Use consistent tags for filtering
- `aws`, `google`, `atlassian`
- `production`, `staging`, `development`
- `api-key`, `service-account`, `oauth`

---

## 🔄 Sync & Backup

### Automatic Sync (Insync)

**Status Check:**
```bash
# Check Insync status
insync get_status

# Check sync folder
ls -la ~/Sync/
```

**Expected Output:**
- `Passwords.kdbx` - Main database
- `.Passwords.kdbx.lock` - Lock file (when open)

### Manual Sync (if needed)

```bash
# Force sync
insync force_sync ~/Sync/Passwords.kdbx

# Verify sync
insync get_sync_progress
```

### Backup Verification

**Google Drive Versioning:**
1. Go to: https://drive.google.com
2. Navigate to: `Sync/Passwords.kdbx`
3. Right-click → **"Manage versions"**
4. Verify recent versions exist

**Local Backup:**
```bash
# Create manual backup
cp ~/Sync/Passwords.kdbx ~/Backups/Passwords-$(date +%Y%m%d).kdbx

# List backups
ls -lh ~/Backups/Passwords-*.kdbx
```

---

## 🔒 Security Procedures

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

### Master Password Management

**Best Practices:**
- ✅ Use passphrase (4+ words, 20+ characters)
- ✅ Memorize, never write down
- ✅ Change every 180 days
- ❌ Never share
- ❌ Never store digitally

**Rotation Schedule:**
- Set calendar reminder for 180 days
- Update in safe, controlled environment
- Test new password before closing database

### Service Account Keys

**Storage:**
- Store full JSON/key files as attachments
- Add metadata in notes field
- Tag with `service-account`, `api-key`

**Rotation Tracking:**
- Add custom field: `rotation_date`
- Set expiry reminder (90 days)
- Document rotation procedure in notes

---

## 🚨 Emergency Procedures

### Lost Master Password

**If you forget the master password:**
1. **DO NOT PANIC** - Take a deep breath
2. Try common variations you might use
3. Check break-glass kit in safe (last resort)
4. If all fails, database is unrecoverable (by design)

**Prevention:**
- Keep break-glass kit updated
- Test master password regularly
- Use memorable passphrase

### Database Corruption

**Symptoms:**
- KeePassXC won't open database
- "Invalid credentials" despite correct password
- File size is 0 bytes

**Recovery:**
```bash
# 1. Check file integrity
ls -lh ~/Sync/Passwords.kdbx

# 2. Restore from Google Drive version
# Go to Google Drive → Manage versions → Download previous version

# 3. Restore from local backup
cp ~/Backups/Passwords-YYYYMMDD.kdbx ~/Sync/Passwords.kdbx

# 4. Test restored database
keepassxc ~/Sync/Passwords.kdbx
```

### Sync Conflicts

**If Insync shows conflict:**
```bash
# 1. Check for conflict files
ls -la ~/Sync/ | grep conflict

# 2. Compare databases
# Open both in KeePassXC (read-only)
# Manually merge differences

# 3. Keep correct version
mv ~/Sync/Passwords.kdbx.conflict ~/Backups/
# Or delete if confirmed identical
```

---

## 📊 Maintenance

### Weekly Tasks

- [ ] Verify Insync is running and syncing
- [ ] Check for pending updates
- [ ] Review recently added entries for proper tagging

### Monthly Tasks

- [ ] Create manual backup
- [ ] Review and update expiring credentials
- [ ] Check Google Drive version history
- [ ] Verify break-glass kit is accessible

### Quarterly Tasks

- [ ] Audit all entries for accuracy
- [ ] Remove obsolete credentials
- [ ] Update tagging for consistency
- [ ] Test disaster recovery procedure

### Semi-Annual Tasks

- [ ] Rotate master password
- [ ] Update break-glass kit
- [ ] Review and update organization structure
- [ ] Audit service account key rotations

---

## 🔗 Related Documentation

- [KeePassXC Organization Guide](../../guides/organization/keepassxc_organization.md)
- [Secrets Management Guide](../../guides/onboarding/secrets_management_guide.md)
- [Disaster Recovery](../disaster_recovery/disaster_recovery.md)

---

**Version:** 2.0.0  
**Last Updated:** 2025-12-05  
**Consolidated from:** keepassxc_unified_workflow.md
