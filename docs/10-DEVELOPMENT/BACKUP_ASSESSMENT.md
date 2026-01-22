# Backup Assessment Report

**Date:** 2026-01-21
**Jira:** CHRONOS-445
**Status:** Investigation Complete

---

## Executive Summary

| Finding | Severity | Status |
|---------|----------|--------|
| Scheduled backups not running | **HIGH** | Cron job missing on Lightsail host |
| Only 1 full backup exists | **HIGH** | Dec 28, 2025 (manual) |
| WAL archiving sporadic | **MEDIUM** | Working but gaps exist |
| pgbackrest installed | OK | In Docker image |
| S3 bucket healthy | OK | 9 GiB, 34k objects |

---

## 1. Root Cause Analysis

### Why Backups Stopped

The scheduled backup cron job was **never configured on the Lightsail host**, or was lost during an OOM crash. The existing documentation (`docs/10-DEVELOPMENT/02-INFRASTRUCTURE/database_backups.md`) specifies:

```
Cron file: /etc/cron.d/pgbackrest (on Lightsail host)
```

**Evidence:**
- Only 1 full backup exists (Dec 28, 2025 - likely manual)
- No differential backups exist
- WAL archives are sporadic (PostgreSQL pushes when segments fill)

### Architecture Gap

| Component | Location | Status |
|-----------|----------|--------|
| pgbackrest binary | Docker container | Installed |
| pgbackrest.conf | Docker container | Mounted (dev only) |
| Cron daemon | Lightsail host | **NOT CONFIGURED** |
| archive_command | PostgreSQL | Working (sporadic) |

### Timeline of Backup Gaps

| Period | Days Gap | Notes |
|--------|----------|-------|
| Dec 28 → Jan 2 | 5 days | After full backup, no WAL |
| Jan 2 → Jan 6 | 4 days | Minimal activity |
| Jan 6 → Jan 9 | 3 days | Gap |
| Jan 9 → Jan 16 | 7 days | Gap before recent activity |

---

## 2. Current State

### What IS Working

1. **pgbackrest is installed** - Dockerfile.timescaledb:13 installs it
2. **S3 bucket is configured** - `project-chronos-backups` has 9 GiB
3. **IAM credentials exist** - In `pgbackrest.conf`
4. **WAL archiving partially works** - PostgreSQL pushes when segments fill
5. **Manual backups work** - Dec 28 backup proves this

### What is NOT Working

1. **No scheduled cron job** on Lightsail host
2. **No backup monitoring/alerting** configured
3. **Production docker-compose** doesn't mount pgbackrest.conf
4. **No differential backups** happening

### Docker Configuration Analysis

**Root docker-compose.yml (local dev):**
```yaml
volumes:
  - ./pgbackrest.conf:/etc/pgbackrest/pgbackrest.conf:ro  # Mounted!
```

**deployment/lightsail/docker-compose.yml (PRODUCTION):**
```yaml
volumes:
  - timescale-data:/var/lib/postgresql/data  # NO pgbackrest config!
```

---

## 3. Remediation Plan

### Immediate (This Week)

#### 3.1 Fix Cron Job on Lightsail

SSH into Lightsail and create the cron file:

```bash
ssh -i ~/.ssh/aws-lightsail/chronos-prod-db ubuntu@16.52.210.100

# Create cron file
sudo tee /etc/cron.d/pgbackrest << 'EOF'
# pgBackRest backup schedule for Project Chronos
# Full backup daily at 11:00 UTC (6:00 AM EST)
0 11 * * * root docker exec -u postgres chronos-db pgbackrest --stanza=chronos-v2 --type=full backup >> /var/log/pgbackrest-full.log 2>&1

# Differential backup every 6 hours (except 11:00 UTC)
0 5,17,23 * * * root docker exec -u postgres chronos-db pgbackrest --stanza=chronos-v2 --type=diff backup >> /var/log/pgbackrest-diff.log 2>&1
EOF

# Set permissions
sudo chmod 644 /etc/cron.d/pgbackrest

# Verify cron is running
sudo systemctl status cron
```

#### 3.2 Mount pgbackrest.conf in Production

Update `deployment/lightsail/docker-compose.yml`:

```yaml
volumes:
  - timescale-data:/var/lib/postgresql/data
  - ./pgbackrest.conf:/etc/pgbackrest/pgbackrest.conf:ro  # ADD THIS
```

#### 3.3 Run Immediate Full Backup

```bash
docker exec -u postgres chronos-db pgbackrest --stanza=chronos-v2 --type=full backup
```

### Medium-Term (This Month)

#### 3.4 Set Up Backup Monitoring

**Option A: Simple Script (Free)**

Create `/home/ubuntu/check-backups.sh`:

```bash
#!/bin/bash
LAST_BACKUP=$(docker exec -u postgres chronos-db pgbackrest --stanza=chronos-v2 info --output=json | jq -r '.[0].backup[-1].timestamp.stop')
HOURS_AGO=$(( ($(date +%s) - $(date -d "$LAST_BACKUP" +%s)) / 3600 ))

if [ $HOURS_AGO -gt 24 ]; then
    # Send alert (email, Slack, etc.)
    echo "ALERT: Last backup was $HOURS_AGO hours ago" | mail -s "Chronos Backup Alert" admin@automatonicai.com
fi
```

Add to cron:
```bash
0 * * * * /home/ubuntu/check-backups.sh >> /var/log/backup-monitor.log 2>&1
```

**Option B: CloudWatch (Recommended)**

- Use Lightsail's built-in metrics
- Create alarm for container health
- SNS notification to email/Slack

### Long-Term (Q1 2026)

- Move pgbackrest.conf to AWS Secrets Manager
- Implement backup verification (restore testing)
- Add backup metrics to monitoring dashboard

---

## 4. OOM Crash Hypothesis

**Q: Did OOM crashes cause backup failures?**

**A: Partially yes, but not the root cause.**

1. OOM crashes likely killed Docker containers
2. After restart, containers came back (via `restart: unless-stopped`)
3. BUT: Cron job on host wasn't running regardless
4. The cron was likely never properly configured after initial setup

**Evidence:**
- Lightsail has CPU and NetworkOut alarms (set up)
- No memory alarm exists (should add one)
- Container restarts don't trigger backup re-initialization

---

## 5. Monitoring Recommendations

### Lightsail Alarms (Already Exist)

| Alarm | Threshold | Status |
|-------|-----------|--------|
| CPU Utilization | > 80% | Active |
| NetworkOut | > 5 GB | Active |

### Recommended Additional Alarms

| Alarm | Threshold | Action |
|-------|-----------|--------|
| StatusCheckFailed | > 0 | **ADD** - Instance health |
| BurstCapacityPercentage | < 20% | **ADD** - Disk IOPS |
| FreeStorageSpace | < 10 GB | **ADD** - Disk space |

### Backup-Specific Monitoring

| Check | Frequency | Alert If |
|-------|-----------|----------|
| Full backup age | Hourly | > 25 hours |
| Diff backup age | Hourly | > 7 hours |
| WAL archive age | Hourly | > 30 minutes |
| S3 bucket size growth | Daily | < 1 MB/day |

### Setting Up Lightsail Notifications

Lightsail has built-in alarm notifications (email + SMS). **No CloudWatch setup required.**

1. **Add Notification Contact:**
   - AWS Console → Lightsail → Account → Notification contacts
   - Add email address (will receive verification email)
   - Optionally add SMS number

2. **Create Instance Alarms:**
   - Lightsail → Instances → chronos-prod-medium → Metrics tab
   - Click "Add alarm" for each metric:
     - **StatusCheckFailed** > 0 for 1 minute (instance health)
     - **CPUUtilization** > 80% for 5 minutes (already exists)
     - **NetworkOut** > 5 GB for 1 hour (already exists)

3. **Recommended New Alarms:**
   - BurstCapacityPercentage < 20% (disk throttling)
   - StatusCheckFailed > 0 (critical - instance down)

---

## 6. Cost Impact

| Item | Current | After Fix |
|------|---------|-----------|
| S3 Storage | ~$0.21/month | ~$0.50/month (more backups) |
| CloudWatch Alarms | $0 | ~$0.30/month (3 alarms) |
| SNS Notifications | $0 | ~$0.01/month |
| **Total** | **$0.21** | **~$0.81/month** |

---

## 7. Action Items

| Priority | Task | Owner | Status |
|----------|------|-------|--------|
| P0 | SSH to Lightsail and configure cron | User | TODO |
| P0 | Run immediate full backup | User | TODO |
| P1 | Update production docker-compose | Dev | TODO |
| P1 | Add StatusCheckFailed alarm | Dev | TODO |
| P2 | Implement backup monitoring script | Dev | Backlog |
| P2 | Move credentials to Secrets Manager | Dev | Backlog |

---

## Appendix: Useful Commands

```bash
# SSH to Lightsail
ssh -i ~/.ssh/aws-lightsail/chronos-prod-db ubuntu@16.52.210.100

# Check pgbackrest status
docker exec -u postgres chronos-db pgbackrest --stanza=chronos-v2 info

# Manual full backup
docker exec -u postgres chronos-db pgbackrest --stanza=chronos-v2 --type=full backup

# Check PostgreSQL archive settings
docker exec -u postgres chronos-db psql -c "SHOW archive_mode; SHOW archive_command;"

# View cron logs
sudo tail -f /var/log/syslog | grep CRON

# Check S3 bucket
aws s3 ls s3://project-chronos-backups/ --recursive --summarize --human-readable
```

---

*Generated: 2026-01-21*
