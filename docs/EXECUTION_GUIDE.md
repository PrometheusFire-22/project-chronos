# 🚀 Project Chronos: Recovery Execution Guide

**CRITICAL: This guide specifies WHERE to run each command**

**Your Project Location:** `/home/prometheus/coding/finance/project-chronos`

---

## 📋 Pre-Flight Checklist

✅ Your database volume is named: `project-chronos_timescale-data`  
✅ Your `.env` file has all required credentials  
✅ Your container is running: `chronos-db`  
⚠️ Your database is currently EMPTY  
⚠️ Rovo Dev CLI is failing (exit 255) - we'll fix this

---

## 🎯 Phase 1: Backup Infrastructure (30 minutes)

### Step 1.1: Create Backup Directories

**WHERE:** 🖥️ HOST Terminal

```bash
# Create backup directories
mkdir -p /home/prometheus/chronos-backups/daily
mkdir -p /home/prometheus/chronos-backups/weekly
mkdir -p /home/prometheus/chronos-backups/monthly

# Verify
ls -la /home/prometheus/chronos-backups/
```

**Expected Output:**

```
drwxr-xr-x  5 prometheus  prometheus   160 Nov 18 00:00 chronos-backups
drwxr-xr-x  2 prometheus  prometheus    64 Nov 18 00:00 daily
drwxr-xr-x  2 prometheus  prometheus    64 Nov 18 00:00 weekly
drwxr-xr-x  2 prometheus  prometheus    64 Nov 18 00:00 monthly
```

---

### Step 1.2: Create Backup Scripts

**WHERE:** 🖥️ HOST Terminal

```bash
# Navigate to your project
cd /home/prometheus/coding/finance/project-chronos

# Create scripts directory if it doesn't exist
mkdir -p scripts

# Create backup script
nano scripts/backup_host.sh
# Paste the backup_host_updated.sh content, save (Ctrl+X, Y, Enter)

# Create restore script
nano scripts/restore_host.sh
# Paste the restore_host_updated.sh content, save (Ctrl+X, Y, Enter)

# Make executable
chmod +x scripts/backup_host.sh
chmod +x scripts/restore_host.sh

# Verify
ls -la scripts/*.sh
```

**Expected Output:**

```
-rwxr-xr-x  1 prometheus  prometheus  3245 Nov 18 00:00 backup_host.sh
-rwxr-xr-x  1 prometheus  prometheus  2567 Nov 18 00:00 restore_host.sh
```

---

### Step 1.3: Test Backup System

**WHERE:** 🖥️ HOST Terminal

```bash
# Navigate to project directory
cd /home/prometheus/coding/finance/project-chronos

# Make sure containers are running
docker compose ps

# If not running:
docker compose up -d

# Wait 10 seconds for database to be ready
sleep 10

# Run your first backup
./scripts/backup_host.sh
```

**Expected Output:**

```
[2025-11-18 00:00:00] ==========================================
[2025-11-18 00:00:00] 🚀 Project Chronos Database Backup
[2025-11-18 00:00:00] ==========================================
[2025-11-18 00:00:00] Project dir: /home/prometheus/coding/finance/project-chronos
[2025-11-18 00:00:00] ✅ Backup directories created
[2025-11-18 00:00:00] ✅ Container is running
[2025-11-18 00:00:00] 🔄 Creating backup...
[2025-11-18 00:00:00] ✅ Backup created: chronos_20251118_000000.dump (2.3M)
[2025-11-18 00:00:00] ✅ Backup integrity verified
[2025-11-18 00:00:00] ✅ Cleanup complete
[2025-11-18 00:00:00] ==========================================
[2025-11-18 00:00:00] ✅ Backup completed successfully!
```

**Verify the backup:**

```bash
ls -lh /home/prometheus/chronos-backups/daily/
```

---

### Step 1.4: Test Restore (CRITICAL)

**WHERE:** 🖥️ HOST Terminal

```bash
# Navigate to project directory
cd /home/prometheus/coding/finance/project-chronos

# This tests that your backup actually works
# Note: This will drop and recreate the database (it's currently empty, so no loss)

./scripts/restore_host.sh /home/prometheus/chronos-backups/daily/chronos_*.dump
```

**When prompted, type:** `YES`

**Expected Output:**

```
⚠️  WARNING: DATABASE RESTORE
...
Type 'YES' to continue: YES
[2025-11-18 00:00:00] 🗑️  Dropping existing database...
[2025-11-18 00:00:00] 🏗️  Creating fresh database...
[2025-11-18 00:00:00] 📥 Restoring from backup...
[2025-11-18 00:00:00] ✅ Restore completed successfully!
```

**If this works, you've achieved bullet-proof backups! 🎉**

---

### Step 1.5: Set Up Automated Backups

**WHERE:** 🖥️ HOST Terminal

```bash
# Open crontab editor
crontab -e

# Add this line (backs up daily at 2 AM):
0 2 * * * cd /home/prometheus/coding/finance/project-chronos && ./scripts/backup_host.sh >> /home/prometheus/chronos-backups/cron.log 2>&1

# Save and exit (in vim: ESC, :wq, Enter)

# Verify it was added
crontab -l
```

**Test it manually:**

```bash
# Run the exact command that cron will run
cd /home/prometheus/coding/finance/project-chronos && ./scripts/backup_host.sh >> /home/prometheus/chronos-backups/cron.log 2>&1

# Check the log
cat /home/prometheus/chronos-backups/cron.log
```

---

## 🐳 Phase 2: Fix Docker Environment (20 minutes)

### Step 2.1: Update Dockerfile to Debian 12

**WHERE:** 💻 VS Code (or any text editor)

Open `/workspace/Dockerfile` (or in absolute path: `/home/prometheus/coding/finance/project-chronos/Dockerfile`)

Replace line 8:

```dockerfile
# OLD (Debian 11):
FROM mcr.microsoft.com/devcontainers/python:3.11-bullseye

# NEW (Debian 12):
FROM mcr.microsoft.com/devcontainers/python:3.11-bookworm
```

**Save the file.**

---

### Step 2.2: Rebuild Container

**WHERE:** 🖥️ HOST Terminal

```bash
cd /home/prometheus/coding/finance/project-chronos

# Rebuild the app container
docker compose build app

# Restart everything
docker compose down
docker compose up -d

# Wait for containers to start
sleep 10

# Verify
docker compose ps
```

**Expected Output:**

```
NAME         IMAGE                 STATUS         PORTS
chronos-app  project-chronos-app   Up 10 seconds
chronos-db   project-chronos-...   Up 10 seconds  0.0.0.0:5432->5432/tcp
```

---

### Step 2.3: Verify Debian Version

**WHERE:** 🐳 DEV CONTAINER Terminal (in VS Code)

```bash
# Check Debian version
cat /etc/debian_version
# Should show: 12.x

# Check glibc version
ldd --version
# Should show: ldd (Debian GLIBC 2.36-9+deb12u...) 2.36
```

**If you see version 12.x, the Atlassian CLI should now work!**

---

### Step 2.4: Test Atlassian CLI

**WHERE:** 💻 VS Code

1. Open Command Palette: `Cmd+Shift+P` (Mac) or `Ctrl+Shift+P` (Linux/Windows)
2. Type: "Atlassian: Create Issue"
3. Try to create a test issue

**If you still get "exit code 255":**

- The Rovo Dev feature may be broken in this version of the extension
- WORKAROUND: Use the Jira web interface for now
- You can still use the VS Code extension to VIEW issues, just not create them via CLI

---

## 📥 Phase 3: Data Ingestion (45 minutes)

### Step 3.1: Review Asset Catalog

**WHERE:** 💻 VS Code

Open `/workspace/database/seeds/asset_catalog.csv` and verify you have series marked as "Planned"

---

### Step 3.2: Create Master Ingestion Script

**WHERE:** 💻 VS Code

Create file: `/workspace/src/scripts/master_ingest.py`

Paste the content from the `master_ingest.py` file I created earlier.

**Make it executable:**

**WHERE:** 🐳 DEV CONTAINER Terminal

```bash
chmod +x /workspace/src/scripts/master_ingest.py
```

---

### Step 3.3: Test Single Series Ingestion

**WHERE:** 🐳 DEV CONTAINER Terminal

```bash
# Test with a single series first
python src/scripts/master_ingest.py --series GDP --no-update
```

**Expected Output:**

```
[2025-11-18 00:00:00] 📍 Ingesting specific series: GDP
[2025-11-18 00:00:00] 🔄 Ingesting FRED series: GDP
[2025-11-18 00:00:00] ✅ Successfully ingested GDP
```

**Verify data arrived:**

```bash
psql -h chronos-db -U prometheus -d chronos_db -c \
  "SELECT COUNT(*) FROM timeseries.economic_observations;"
```

**If you see rows, it worked!**

---

### Step 3.4: Full Ingestion from Catalog

**WHERE:** 🐳 DEV CONTAINER Terminal

```bash
# Ingest all "Planned" series
python src/scripts/master_ingest.py --status Planned

# This will take 10-30 minutes depending on how many series you have
```

**Monitor progress:**

- You'll see each series being processed
- Failed series will be logged

---

### Step 3.5: Verify Ingestion

**WHERE:** 🐳 DEV CONTAINER Terminal

```bash
# Check total observations
psql -h chronos-db -U prometheus -d chronos_db -c \
  "SELECT COUNT(*) FROM timeseries.economic_observations;"

# Check distinct series
psql -h chronos-db -U prometheus -d chronos_db -c \
  "SELECT COUNT(DISTINCT series_id) FROM timeseries.economic_observations;"

# Check data quality dashboard
psql -h chronos-db -U prometheus -d chronos_db -c \
  "SELECT freshness_status, COUNT(*) FROM analytics.data_quality_dashboard GROUP BY freshness_status;"
```

---

### Step 3.6: Create Post-Ingestion Backup

**WHERE:** 🖥️ HOST Terminal

```bash
# CRITICAL: Back up your freshly ingested data!
cd /home/prometheus/coding/finance/project-chronos
./scripts/backup_host.sh

# Verify
ls -lh /home/prometheus/chronos-backups/daily/ | tail -2
```

**You should see two backups:**

1. Empty database backup (from Phase 1)
2. Full database backup (just created)

---

## 🗄️ Phase 4: Alembic Setup (45 minutes)

### Step 4.1: Install Alembic

**WHERE:** 🐳 DEV CONTAINER Terminal

```bash
pip install alembic

# Verify
alembic --version
```

---

### Step 4.2: Initialize Alembic

**WHERE:** 🐳 DEV CONTAINER Terminal

```bash
cd /workspace
alembic init alembic
```

**Expected Output:**

```
Creating directory /workspace/alembic ... done
Creating directory /workspace/alembic/versions ... done
Generating /workspace/alembic.ini ... done
Generating /workspace/alembic/env.py ... done
```

---

### Step 4.3: Configure alembic.ini

**WHERE:** 💻 VS Code

Open `/workspace/config/alembic.ini`

Find this line (around line 63):

```ini
sqlalchemy.url = driver://user:pass@localhost/dbname
```

Replace with:

```ini
# Use actual connection string (matches your .env)
sqlalchemy.url = postgresql://prometheus:Zarathustra22!@chronos-db:5432/chronos_db
```

**Save the file.**

---

### Step 4.4: Update env.py

**WHERE:** 💻 VS Code

Open `/workspace/alembic/env.py`

Add at the top (after imports):

```python
import os
from dotenv import load_dotenv
load_dotenv()
```

**Save the file.**

---

### Step 4.5: Create Baseline Migration

**WHERE:** 🐳 DEV CONTAINER Terminal

```bash
alembic revision -m "baseline schema v2.0"
```

**This creates a new file in `/workspace/alembic/versions/`**

---

### Step 4.6: Edit Baseline Migration

**WHERE:** 💻 VS Code

Open the newly created file: `/workspace/alembic/versions/xxxxx_baseline_schema_v2_0.py`

Replace the `upgrade()` function:

```python
def upgrade() -> None:
    """Apply the baseline schema"""
    # For now, just mark that we're at this version
    # The schema is already in the database from schema.sql
    pass

def downgrade() -> None:
    """Rollback not supported for baseline"""
    pass
```

**Save the file.**

---

### Step 4.7: Stamp Database

**WHERE:** 🐳 DEV CONTAINER Terminal

```bash
# Mark database as being at the baseline version
alembic stamp head

# Verify
alembic current
```

**Expected Output:**

```
xxxxx (head)
```

---

## 🎯 Phase 5: Verification (15 minutes)

### Run Complete System Test

**On HOST:**

```bash
cd /home/prometheus/coding/finance/project-chronos

# Test 1: Backup
./scripts/backup_host.sh

# Test 2: Check backups exist
ls -lh /home/prometheus/chronos-backups/daily/

# Test 3: Verify database
docker exec chronos-db psql -U prometheus -d chronos_db -c "\dt"
```

**In DEV CONTAINER:**

```bash
# Test 4: Check Alembic
alembic current

# Test 5: Check data
psql -h chronos-db -U prometheus -d chronos_db -c \
  "SELECT COUNT(*) FROM timeseries.economic_observations;"
```

---

## ✅ Success Criteria Checklist

After completing all phases, verify:

- [ ] ✅ Backups exist on host: `/home/prometheus/chronos-backups/daily/`
- [ ] ✅ Cron job configured: `crontab -l`
- [ ] ✅ Dockerfile uses Debian 12 (bookworm)
- [ ] ✅ Container rebuilt and running
- [ ] ✅ Database has data (>0 rows)
- [ ] ✅ Alembic initialized and stamped
- [ ] ✅ Can restore from backup successfully

---

## 📞 Quick Reference

### Your Project Paths:

- **Project Root:** `/home/prometheus/coding/finance/project-chronos`
- **Backups:** `/home/prometheus/chronos-backups/`
- **Workspace (in container):** `/workspace`

### Backup Command (HOST):

```bash
cd /home/prometheus/coding/finance/project-chronos && ./scripts/backup_host.sh
```

### Restore Command (HOST):

```bash
cd /home/prometheus/coding/finance/project-chronos
./scripts/restore_host.sh /home/prometheus/chronos-backups/daily/FILE.dump
```

### Ingest Data (CONTAINER):

```bash
python src/scripts/master_ingest.py --status Planned
```

### Check Database (CONTAINER):

```bash
psql -h chronos-db -U prometheus -d chronos_db
```

---

**Ready to begin? Start with Phase 1, Step 1.1!**
