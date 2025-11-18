# 🎯 Project Chronos: Recovery & Hardening Action Plan
**Date:** 2025-11-17  
**Status:** ACTIVE  
**Critical Path:** Database Security → Data Ingestion → MVP Delivery

---

## 📊 Current Situation Analysis

### ✅ What's Working
- Named Docker volume is configured (`timescale-data`)
- Debian 12 base image resolves Atlassian CLI issue
- Jira/Confluence/GitHub integrations are operational
- Test infrastructure is in place (26% coverage)
- Core ingestion modules exist (FRED, Valet)

### ❌ Critical Gaps
1. **No automated backups** (RTO/RPO = ∞)
2. **No schema versioning** (Alembic not implemented)
3. **Manual data ingestion** (bash scripts, not data-driven)
4. **Environment variable confusion** (.env not properly structured)
5. **Atlassian CLI still failing** (exit code 255)
6. **Database is empty** (needs full re-ingestion)

### 🎯 Success Criteria
- [ ] Database can survive `docker volume rm` (host-level backups)
- [ ] Schema changes tracked with Alembic migrations
- [ ] Single command ingests all "Planned" series from CSV
- [ ] Automated daily backups to host filesystem
- [ ] Atlassian CLI functional for terminal-based Jira ops
- [ ] 100% confidence in environment reproducibility

---

## 🚀 Phase 1: Database Security & Resilience (TODAY)
**Goal:** Make data loss structurally impossible  
**Time:** 2 hours  
**Jira Tickets:** CHRONOS-69 through CHRONOS-72

### Task 1.1: Implement Host-Level Backup System
**Jira:** CHRONOS-69 `feat(devops): Implement production-grade backup system`

**Acceptance Criteria:**
- [ ] `/home/chronos-backups/` directory exists on HOST
- [ ] `backup_production.sh` creates `.dump` files outside Docker
- [ ] Daily/weekly/monthly retention policy enforced
- [ ] Test: Create backup, delete volume, restore successfully

**Actions:**
```bash
# 1. Create backup directories (on HOST)
mkdir -p ~/chronos-backups/{daily,weekly,monthly}

# 2. Copy scripts from outputs
cp /mnt/user-data/outputs/backup_production.sh /workspace/scripts/
cp /mnt/user-data/outputs/restore_production.sh /workspace/scripts/
chmod +x /workspace/scripts/{backup,restore}_production.sh

# 3. Test backup
./scripts/backup_production.sh

# 4. Verify backup exists on host
ls -lh ~/chronos-backups/daily/

# 5. Test restore (CRITICAL)
./scripts/restore_production.sh ~/chronos-backups/daily/chronos_TIMESTAMP.dump
```

**Definition of Done:**
- Backup exists on host filesystem (outside Docker)
- Restore script successfully recreates database
- Documentation updated in `/docs/guides/backup_restore.md`

---

### Task 1.2: Set Up Automated Daily Backups
**Jira:** CHRONOS-70 `feat(devops): Configure automated daily backups via cron`

**Acceptance Criteria:**
- [ ] Cron job runs daily at 2 AM
- [ ] Logs are written to `~/chronos-backups/cron.log`
- [ ] Receive email notification on failure (optional)

**Actions:**
```bash
# 1. Add to HOST crontab
crontab -e

# 2. Add this line:
0 2 * * * cd ~/project-chronos && ./scripts/backup_production.sh >> ~/chronos-backups/cron.log 2>&1

# 3. Verify cron is active
crontab -l

# 4. Test manual run
./scripts/backup_production.sh
```

**Definition of Done:**
- Cron job appears in `crontab -l`
- Manual execution succeeds
- Log file created at `~/chronos-backups/cron.log`

---

### Task 1.3: Update docker-compose.yml
**Jira:** CHRONOS-71 `fix(docker): Verify named volume configuration`

**Acceptance Criteria:**
- [ ] Volume name is `timescale-data` (not anonymous)
- [ ] Volume driver is `local`
- [ ] Healthcheck is configured

**Actions:**
```bash
# 1. Verify current configuration
docker volume ls | grep timescale

# 2. Check volume is named
docker inspect chronos-db | jq '.[0].Mounts'

# 3. If anonymous, recreate:
docker compose down
docker volume create project-chronos_timescale-data
docker compose up -d
```

**Definition of Done:**
- `docker volume ls` shows `project-chronos_timescale-data`
- Volume persists after `docker compose down`
- No warnings in `docker compose logs`

---

## 🔧 Phase 2: Fix Atlassian CLI & Environment (1 hour)
**Goal:** Terminal-based Jira workflow working  
**Jira Tickets:** CHRONOS-60, CHRONOS-73

### Task 2.1: Upgrade to Debian 12 (Bookworm)
**Jira:** CHRONOS-60 (EXISTING) `fix(tooling): Resolve Atlassian CLI launch error`

**Actions:**
```bash
# 1. Copy new Dockerfile
cp /mnt/user-data/outputs/Dockerfile /workspace/

# 2. Rebuild container
docker compose build app

# 3. Restart environment
docker compose down
docker compose up -d

# 4. Test Atlassian CLI
# Open Command Palette: "Atlassian: Create Issue"
# Or check terminal for errors
```

**Verification:**
```bash
# Check Debian version
cat /etc/debian_version
# Should show: 12.x (bookworm)

# Check glibc version
ldd --version
# Should show: 2.36+
```

**Definition of Done:**
- Atlassian CLI launches without exit code 255
- Can create Jira issues from VS Code terminal
- No more "respect-configured-permissions" errors

---

### Task 2.2: Centralize Environment Variables
**Jira:** CHRONOS-73 `refactor(config): Create comprehensive .env configuration`

**Actions:**
```bash
# 1. Copy template
cp /mnt/user-data/outputs/.env.example /workspace/

# 2. Create your .env (if doesn't exist)
cp .env.example .env

# 3. Fill in REQUIRED values
nano .env
# Set: DATABASE_PASSWORD, FRED_API_KEY

# 4. Update devcontainer.json
cp /mnt/user-data/outputs/devcontainer.json /workspace/.devcontainer/

# 5. Reload window
# Command Palette: "Dev Containers: Rebuild Container"
```

**Definition of Done:**
- `.env` has all required values set
- No environment variable errors in logs
- Can connect to database from VS Code

---

## 🗄️ Phase 3: Alembic Migration Setup (45 minutes)
**Goal:** Schema versioning and safe changes  
**Jira Ticket:** CHRONOS-20 (EXISTING)

### Task 3.1: Initialize Alembic
**Jira:** CHRONOS-20 `refactor(db): Establish Migration Workflow with Alembic`

Follow the complete guide in `/mnt/user-data/outputs/ALEMBIC_SETUP_GUIDE.md`

**Actions:**
```bash
# 1. Install Alembic
pip install alembic

# 2. Initialize
cd /workspace
alembic init alembic

# 3. Configure alembic.ini (see guide)
nano alembic.ini

# 4. Update env.py (see guide)
nano alembic/env.py

# 5. Create baseline migration
alembic revision -m "baseline schema v2.0"

# 6. Edit migration to load schema.sql
nano alembic/versions/xxxxx_baseline.py

# 7. Stamp database
alembic stamp head

# 8. Verify
alembic current
```

**Definition of Done:**
- `alembic current` shows baseline revision
- Can create new migration: `alembic revision -m "test"`
- Can upgrade: `alembic upgrade head`
- Documentation exists in `/docs/guides/alembic_workflow.md`

---

## 📥 Phase 4: Data Ingestion Automation (1 hour)
**Goal:** Single command ingests all series  
**Jira Tickets:** CHRONOS-8, CHRONOS-10

### Task 4.1: Deploy Master Ingestion Script
**Jira:** CHRONOS-8 (EXISTING) `refactor(ingestion): Create Unified, Data-Driven Ingestion Script`

**Actions:**
```bash
# 1. Copy master script
cp /mnt/user-data/outputs/master_ingest.py /workspace/src/scripts/

# 2. Make executable
chmod +x /workspace/src/scripts/master_ingest.py

# 3. Verify asset_catalog.csv exists
cat /workspace/database/seeds/asset_catalog.csv | head

# 4. Test on single series
python src/scripts/master_ingest.py --series GDP

# 5. Run full ingestion
python src/scripts/master_ingest.py --status Planned

# 6. Verify data
psql -h timescaledb -U prometheus -d chronos_db -c \
  "SELECT COUNT(*) FROM timeseries.economic_observations;"
```

**Definition of Done:**
- Script runs without errors
- Data appears in database
- Can add new series by editing CSV only
- Old bash scripts deprecated

---

### Task 4.2: Create Daily Update Job
**Jira:** CHRONOS-74 `feat(automation): Create daily data update cron job`

**Actions:**
```bash
# 1. Create daily update script
cat > /workspace/scripts/daily_update.sh << 'EOF'
#!/bin/bash
set -euo pipefail

LOG_FILE=~/chronos-backups/daily_update_$(date +%Y%m%d).log

echo "Starting daily update..." | tee -a $LOG_FILE
python /workspace/src/scripts/master_ingest.py --status Active 2>&1 | tee -a $LOG_FILE
echo "Daily update complete!" | tee -a $LOG_FILE
EOF

# 2. Make executable
chmod +x /workspace/scripts/daily_update.sh

# 3. Add to crontab
crontab -e
# Add: 0 6 * * * /workspace/scripts/daily_update.sh
```

**Definition of Done:**
- Script runs manually
- Cron job configured
- Logs written to host filesystem
- Data is updated daily

---

## 📋 Phase 5: Jira Workflow Optimization (30 minutes)
**Goal:** Streamlined issue management from terminal

### Task 5.1: Configure Atlassian Extension
**Jira:** CHRONOS-75 `feat(devex): Configure Atlassian CLI for terminal workflow`

**Actions:**
1. Open VS Code Settings (Cmd+,)
2. Search "Atlassian"
3. Configure:
   - Site URL: `https://automatonicai.atlassian.net`
   - Enable "Create issue from terminal"
   - Set default project: `CHRONOS`

**Test:**
```bash
# Command Palette: "Atlassian: Create Issue"
# Or use keyboard shortcut
```

**Definition of Done:**
- Can create issues without opening browser
- Can search issues from VS Code
- Can update issue status from terminal

---

### Task 5.2: Create Jira Issue Templates
**Jira:** CHRONOS-76 `docs(workflow): Create Jira issue templates for common tasks`

**Actions:**
Create templates in `/docs/workflows/jira_templates.md`:
- Bug Report Template
- Feature Request Template
- Spike Template
- Refactoring Template

**Definition of Done:**
- Templates exist in docs
- Can copy/paste into new issues
- All required fields documented

---

## 🎯 Phase 6: Final Verification & MVP Push (1 hour)
**Goal:** Confirm everything works, start MVP work

### Task 6.1: Full System Test
**Jira:** CHRONOS-77 `test(e2e): Execute full system verification test`

**Test Checklist:**
```bash
# 1. Backup test
./scripts/backup_production.sh
ls ~/chronos-backups/daily/

# 2. Database test
psql -h timescaledb -U prometheus -d chronos_db -c "\dt"

# 3. Ingestion test
python src/scripts/master_ingest.py --series GDP --no-update

# 4. Migration test
alembic current
alembic history

# 5. Atlassian CLI test
# Command Palette: "Atlassian: Create Issue"

# 6. Destructive test (CRITICAL)
docker volume rm project-chronos_timescale-data
./scripts/restore_production.sh ~/chronos-backups/daily/latest.dump
```

**Definition of Done:**
- All tests pass
- Database survives volume deletion
- Can recreate environment from scratch

---

### Task 6.2: Update Documentation
**Jira:** CHRONOS-78 `docs(operations): Create operational runbooks`

**Create these docs:**
1. `/docs/guides/backup_restore.md` - Backup/restore procedures
2. `/docs/guides/disaster_recovery.md` - Emergency procedures
3. `/docs/guides/daily_operations.md` - Daily checklist
4. `/docs/guides/alembic_workflow.md` - Schema change process

**Definition of Done:**
- All runbooks published
- Reviewed and tested by following them
- Linked from main README

---

## 🎯 Immediate Next Steps (Next 4 Hours)

### Priority 1: Database Security (NOW)
1. ✅ Run `backup_production.sh` immediately
2. ✅ Set up cron job for daily backups
3. ✅ Test restore procedure

### Priority 2: Environment Fix (After backup)
4. ✅ Copy new Dockerfile and rebuild
5. ✅ Update `.env` with proper variables
6. ✅ Test Atlassian CLI

### Priority 3: Data Ingestion (After environment)
7. ✅ Deploy `master_ingest.py`
8. ✅ Ingest all "Planned" series
9. ✅ Verify data in database

### Priority 4: Alembic Setup (After data)
10. ✅ Initialize Alembic
11. ✅ Create baseline migration
12. ✅ Stamp database

---

## 📊 Jira Ticket Summary

### New Tickets to Create:
- **CHRONOS-69**: Implement production-grade backup system
- **CHRONOS-70**: Configure automated daily backups
- **CHRONOS-71**: Verify named volume configuration
- **CHRONOS-73**: Create comprehensive .env configuration
- **CHRONOS-74**: Create daily data update cron job
- **CHRONOS-75**: Configure Atlassian CLI for terminal workflow
- **CHRONOS-76**: Create Jira issue templates
- **CHRONOS-77**: Execute full system verification test
- **CHRONOS-78**: Create operational runbooks

### Existing Tickets to Update:
- **CHRONOS-60**: Upgrade to Debian 12 (move to In Progress)
- **CHRONOS-20**: Alembic setup (move to In Progress)
- **CHRONOS-8**: Master ingestion script (move to In Progress)

---

## 🚨 Critical Reminders

1. **ALWAYS backup before major changes**
2. **Never edit applied Alembic migrations**
3. **Test restore procedure monthly**
4. **Keep 7 days daily, 4 weeks weekly, 12 months monthly**
5. **Commit migrations to Git, not .env**
6. **Named volumes only - no anonymous volumes**
7. **Host-level backups survive Docker cleanup**

---

## 📞 Emergency Procedures

### Data Loss Recovery:
```bash
# 1. Find latest backup
ls -lt ~/chronos-backups/daily/

# 2. Restore
./scripts/restore_production.sh ~/chronos-backups/daily/chronos_LATEST.dump

# 3. Verify
psql -h timescaledb -U prometheus -d chronos_db -c "\dt"
```

### Environment Corruption:
```bash
# 1. Backup current state
./scripts/backup_production.sh

# 2. Nuclear option
docker compose down -v
docker system prune -a

# 3. Rebuild
docker compose build
docker compose up -d

# 4. Restore data
./scripts/restore_production.sh ~/chronos-backups/daily/latest.dump
```

---

## ✅ Success Metrics

- [ ] RTO (Recovery Time Objective): < 15 minutes
- [ ] RPO (Recovery Point Objective): < 24 hours
- [ ] Zero manual steps for ingestion
- [ ] 100% test coverage for backup/restore
- [ ] Schema changes tracked in Git
- [ ] Can recreate entire environment in < 30 minutes

---

**Last Updated:** 2025-11-17  
**Next Review:** After Phase 1 completion  
**Owner:** Geoff Bevans