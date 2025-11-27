# pgBackRest Backup & Restore Runbook

**Created:** 2025-11-27
**System:** Project Chronos PostgreSQL Database
**Backup Solution:** pgBackRest with AWS S3
**Ticket:** CHRONOS-214

---

## Overview

This runbook provides step-by-step procedures for managing PostgreSQL backups using pgBackRest with AWS S3 storage.

### System Architecture

```
PostgreSQL Container (chronos-db)
    ↓
pgBackRest (inside container)
    ↓
AWS S3 (project-chronos-backups)
    ↓
Lifecycle: Standard → Glacier IR (30d) → Deep Archive (180d) → Delete (365d)
```

### Backup Strategy

| Backup Type | Schedule | Retention | Storage |
|-------------|----------|-----------|---------|
| Full | Daily 6:00 AM EST (11:00 UTC) | 4 backups | S3 Standard |
| Differential | Every 6 hours | 4 per full backup | S3 Standard |
| WAL Archives | Continuous | Automatic | S3 Standard |

### Recovery Objectives

- **RPO (Recovery Point Objective):** < 15 minutes
- **RTO (Recovery Time Objective):** < 1 hour

---

## Configuration

### S3 Bucket

**Name:** `project-chronos-backups`
**Region:** ca-central-1 (Montreal, Canada)
**Encryption:** AES-256 (server-side)
**Versioning:** Enabled

### Lifecycle Policy

```yaml
0-30 days: S3 Standard
31-180 days: Glacier Instant Retrieval
181-365 days: Glacier Deep Archive
> 365 days: Deleted
```

### IAM User

**Username:** `pgbackrest-chronos`
**Policy:** `pgbackrest-s3-access` (least privilege - S3 bucket access only)
**Access Key ID:** `[REDACTED - See KeePassXC: AWS/pgbackrest-chronos]`
**Secret Key:** `[REDACTED - See KeePassXC: AWS/pgbackrest-chronos]`

### pgBackRest Configuration

**Location:** `/etc/pgbackrest/pgbackrest.conf` (inside chronos-db container)

```ini
[global]
repo1-type=s3
repo1-s3-bucket=project-chronos-backups
repo1-s3-region=ca-central-1
repo1-s3-endpoint=s3.ca-central-1.amazonaws.com
repo1-s3-key=[REDACTED - See KeePassXC: AWS/pgbackrest-chronos]
repo1-s3-key-secret=[REDACTED - See KeePassXC: AWS/pgbackrest-chronos]
repo1-cipher-type=aes-256-cbc
repo1-cipher-pass=[REDACTED - See KeePassXC: Database/pgBackRest Encryption Key]
repo1-retention-full=4
repo1-retention-diff=4
log-level-file=info
start-fast=y
process-max=2

[chronos]
pg1-path=/var/lib/postgresql/data
pg1-port=5432
pg1-user=chronos
pg1-database=chronos
```

### Automated Backup Schedule

**Cron file:** `/etc/cron.d/pgbackrest` (on Lightsail host)

```bash
# Full backup daily at 11:00 UTC (6:00 AM EST)
0 11 * * * root docker exec -u postgres chronos-db pgbackrest --stanza=chronos --type=full backup

# Differential backup every 6 hours
0 5,11,17,23 * * * root docker exec -u postgres chronos-db pgbackrest --stanza=chronos --type=diff backup
```

---

## Common Operations

### Manual Full Backup

```bash
# SSH into Lightsail instance
ssh -i ~/.ssh/aws-lightsail/chronos-prod-db ubuntu@16.52.210.100

# Run full backup
docker exec -u postgres chronos-db pgbackrest --stanza=chronos --type=full backup
```

### Manual Differential Backup

```bash
docker exec -u postgres chronos-db pgbackrest --stanza=chronos --type=diff backup
```

### Check Backup Status

```bash
# View backup information
docker exec -u postgres chronos-db pgbackrest --stanza=chronos info

# Check configuration
docker exec -u postgres chronos-db pgbackrest --stanza=chronos check
```

### List Available Backups

```bash
docker exec -u postgres chronos-db pgbackrest --stanza=chronos info
```

**Example output:**
```
stanza: chronos
    status: ok
    cipher: aes-256-cbc

    db (current)
        wal archive min/max (16): 000000010000000000000004/000000010000000000000005

        full backup: 20251127-221742F
            timestamp start/stop: 2025-11-27 22:17:42+00 / 2025-11-27 22:18:12+00
            wal start/stop: 000000010000000000000005 / 000000010000000000000005
            database size: 64.2MB, database backup size: 64.2MB
            repo1: backup set size: 8MB, backup size: 8MB
```

### View Backup Logs

```bash
# Full backup logs
ssh -i ~/.ssh/aws-lightsail/chronos-prod-db ubuntu@16.52.210.100
sudo tail -f /var/log/pgbackrest-full.log

# Differential backup logs
sudo tail -f /var/log/pgbackrest-diff.log
```

### Verify S3 Backups

```bash
# From local machine (with AWS CLI configured)
aws s3 ls s3://project-chronos-backups/ --recursive

# Check bucket size
aws s3 ls s3://project-chronos-backups/ --recursive --summarize --human-readable
```

---

## Disaster Recovery Procedures

### Scenario 1: Full Database Restore

**Use Case:** Complete database loss or corruption

**Prerequisites:**
- PostgreSQL container must be stopped
- Backup available in S3
- Sufficient disk space

**Steps:**

1. **Stop PostgreSQL**
   ```bash
   ssh -i ~/.ssh/aws-lightsail/chronos-prod-db ubuntu@16.52.210.100
   cd ~/chronos-db
   docker compose stop timescaledb
   ```

2. **Remove corrupted data directory (DANGEROUS!)**
   ```bash
   # BACKUP CURRENT STATE FIRST IF POSSIBLE
   docker run --rm -v chronos-db_timescale-data:/data busybox tar czf /backup.tar.gz -C /data .

   # Remove data
   docker run --rm -v chronos-db_timescale-data:/data busybox rm -rf /data/*
   ```

3. **Restore from backup**
   ```bash
   docker exec -u postgres chronos-db pgbackrest --stanza=chronos --type=immediate --target-action=promote restore
   ```

4. **Start PostgreSQL**
   ```bash
   docker compose start timescaledb
   ```

5. **Verify restoration**
   ```bash
   docker exec chronos-db psql -U chronos -d chronos -c "SELECT version(); SELECT COUNT(*) FROM pg_tables;"
   ```

**Estimated Time:** 15-30 minutes depending on database size

### Scenario 2: Point-in-Time Recovery (PITR)

**Use Case:** Recover to a specific point in time (e.g., before accidental data deletion)

**Prerequisites:**
- Know the exact timestamp to recover to
- WAL archives available for that time period

**Steps:**

1. **Stop PostgreSQL**
   ```bash
   cd ~/chronos-db
   docker compose stop timescaledb
   ```

2. **Restore to specific time**
   ```bash
   # Example: Restore to 2025-11-27 14:30:00 EST
   docker exec -u postgres chronos-db pgbackrest \
     --stanza=chronos \
     --type=time \
     --target="2025-11-27 19:30:00" \
     --target-action=promote \
     restore
   ```

3. **Start PostgreSQL**
   ```bash
   docker compose start timescaledb
   ```

4. **Verify data**
   ```bash
   # Check that data is at the expected state
   docker exec chronos-db psql -U chronos -d chronos -c "SELECT NOW(), pg_last_wal_replay_lsn();"
   ```

**Estimated Time:** 20-45 minutes depending on WAL replay

### Scenario 3: Restore to New Server

**Use Case:** Migration or disaster recovery to different infrastructure

**Steps:**

1. **Provision new server**
   - Create new Lightsail instance
   - Install Docker and Docker Compose
   - Copy docker-compose.yml and Dockerfile

2. **Install pgBackRest in new container**
   ```bash
   docker exec -u root chronos-db apk add --no-cache pgbackrest
   ```

3. **Copy pgBackRest configuration**
   - Transfer `/etc/pgbackrest/pgbackrest.conf` to new container
   - Update `pg1-path` if needed

4. **Restore database**
   ```bash
   docker exec -u postgres chronos-db pgbackrest --stanza=chronos --type=immediate --target-action=promote restore
   ```

5. **Start PostgreSQL and verify**

**Estimated Time:** 1-2 hours including server provisioning

---

## Monitoring & Alerts

### Check Backup Success

```bash
# Check last backup timestamp
docker exec -u postgres chronos-db pgbackrest --stanza=chronos info | grep "timestamp stop"

# Verify backup completed in last 24 hours
docker exec -u postgres chronos-db pgbackrest --stanza=chronos info
```

### Automated Monitoring (Future Enhancement)

Consider adding:
- CloudWatch custom metrics for backup success/failure
- SNS notifications for backup failures
- Dashboard showing backup history

### Backup Health Checklist

Run weekly:

```bash
# 1. Verify stanza integrity
docker exec -u postgres chronos-db pgbackrest --stanza=chronos check

# 2. Verify S3 connectivity
docker exec -u postgres chronos-db pgbackrest --stanza=chronos info

# 3. Check disk space
docker exec chronos-db df -h /var/lib/postgresql/data

# 4. Review recent backup logs
sudo tail -50 /var/log/pgbackrest-full.log
```

---

## Troubleshooting

### Issue: Backup fails with "unable to check pg-1"

**Cause:** pgBackRest cannot connect to PostgreSQL

**Solution:**
```bash
# 1. Verify PostgreSQL is running
docker ps | grep chronos-db

# 2. Test database connection
docker exec chronos-db psql -U chronos -d chronos -c "SELECT 1;"

# 3. Check pgBackRest config
docker exec chronos-db cat /etc/pgbackrest/pgbackrest.conf
```

### Issue: "Permission denied" errors

**Cause:** File permissions incorrect

**Solution:**
```bash
# Fix config file permissions
docker exec -u root chronos-db chown postgres:postgres /etc/pgbackrest/pgbackrest.conf
docker exec -u root chronos-db chmod 640 /etc/pgbackrest/pgbackrest.conf
```

### Issue: S3 access denied

**Cause:** IAM credentials invalid or insufficient permissions

**Solution:**
```bash
# 1. Verify IAM user exists
aws iam get-user --user-name pgbackrest-chronos

# 2. Verify policy attached
aws iam list-attached-user-policies --user-name pgbackrest-chronos

# 3. Test S3 access manually
aws s3 ls s3://project-chronos-backups/ --profile pgbackrest
```

### Issue: WAL archiving not working

**Cause:** `archive_command` misconfigured or failing

**Solution:**
```bash
# 1. Check PostgreSQL archive settings
docker exec chronos-db psql -U chronos -d chronos -c "SHOW archive_mode; SHOW archive_command;"

# 2. Check PostgreSQL logs for archive errors
docker logs chronos-db | grep archive

# 3. Manually test archive command
docker exec -u postgres chronos-db pgbackrest --stanza=chronos archive-push /var/lib/postgresql/data/pg_wal/000000010000000000000001
```

### Issue: Restore fails with "unable to find backup"

**Cause:** Backup set missing from S3 or corrupted

**Solution:**
```bash
# 1. List available backups
docker exec -u postgres chronos-db pgbackrest --stanza=chronos info

# 2. Verify S3 bucket contents
aws s3 ls s3://project-chronos-backups/ --recursive

# 3. Check backup integrity
docker exec -u postgres chronos-db pgbackrest --stanza=chronos check
```

---

## Cost Management

### Current Costs

| Component | Monthly Cost | Notes |
|-----------|-------------|-------|
| S3 Standard Storage | $0.023/GB | First 30 days |
| S3 Glacier IR | $0.004/GB | Days 31-180 |
| S3 Deep Archive | $0.00099/GB | Days 181-365 |
| S3 Requests (PUT) | $0.005/1000 | Backup operations |
| S3 Requests (GET) | $0.0004/1000 | Restore operations |
| **Total Estimated** | **~$2.00/month** | Based on 64MB database |

### Cost Optimization Tips

1. **Review retention policy quarterly** - Adjust if backups accumulate
2. **Monitor database growth** - Larger databases = higher costs
3. **Use differential backups** - Reduces storage by only backing up changes
4. **Archive old backups** - Move to Deep Archive sooner if recovery time allows

---

## Security Considerations

### Encryption

- **At Rest:** AES-256-CBC encryption (pgBackRest)
- **In Transit:** TLS 1.2+ (S3 HTTPS)
- **Keys:** Stored in config file (permissions 640)

### Access Control

- **IAM User:** `pgbackrest-chronos` (least privilege)
- **S3 Bucket Policy:** Restricts access to specific IAM user
- **Encryption Password:** Stored in config, consider AWS Secrets Manager for production

### Audit Trail

- All S3 operations logged via CloudTrail
- pgBackRest logs stored in `/var/log/pgbackrest-*.log`
- PostgreSQL logs available via `docker logs chronos-db`

---

## Maintenance

### Monthly Tasks

1. **Verify backup integrity**
   ```bash
   docker exec -u postgres chronos-db pgbackrest --stanza=chronos check
   ```

2. **Review storage costs**
   ```bash
   aws s3 ls s3://project-chronos-backups/ --recursive --summarize --human-readable
   ```

3. **Test restore procedure** (on test instance)

### Quarterly Tasks

1. **Full disaster recovery drill**
2. **Review and adjust retention policies**
3. **Update documentation with any config changes**

### Annual Tasks

1. **Rotate IAM access keys**
2. **Review and update encryption keys**
3. **Audit backup logs for anomalies**

---

## Quick Reference

### Essential Commands

```bash
# Manual full backup
docker exec -u postgres chronos-db pgbackrest --stanza=chronos --type=full backup

# View backup info
docker exec -u postgres chronos-db pgbackrest --stanza=chronos info

# Check backup health
docker exec -u postgres chronos-db pgbackrest --stanza=chronos check

# Restore latest backup
docker exec -u postgres chronos-db pgbackrest --stanza=chronos --type=immediate restore

# View logs
sudo tail -f /var/log/pgbackrest-full.log
```

### Important File Locations

| File/Directory | Location | Description |
|----------------|----------|-------------|
| pgBackRest config | `/etc/pgbackrest/pgbackrest.conf` | Inside container |
| Full backup logs | `/var/log/pgbackrest-full.log` | On Lightsail host |
| Diff backup logs | `/var/log/pgbackrest-diff.log` | On Lightsail host |
| PostgreSQL data | `/var/lib/postgresql/data` | Inside container |
| Cron schedule | `/etc/cron.d/pgbackrest` | On Lightsail host |

### Contact & Escalation

- **Primary:** Self-managed (single developer)
- **AWS Support:** Basic plan (general guidance)
- **pgBackRest Docs:** https://pgbackrest.org/user-guide.html
- **Emergency:** Restore from last known good backup

---

## Related Documentation

- [Sprint 7 Execution Plan](../session_notes/2025-11-27_Sprint7_Execution_Plan.md)
- [AWS Lightsail Setup Guide](../session_notes/2025-11-27_CHRONOS-213_Lightsail_Setup_COMPLETE.md)
- [ADR-012: Database Backup Strategy](../2_architecture/adrs/adr_012_database_backup_strategy.md)

---

**🤖 Generated with Claude Code**
**Last Updated:** 2025-11-27
**Version:** 1.0
**Status:** Production Ready ✅
