# PostgreSQL Backup and Restore Guide

## Overview

Project Chronos uses **pgBackRest** for enterprise-grade PostgreSQL backups with the following features:
- ✅ Encrypted backups (AES-256-CBC)
- ✅ Compressed storage in AWS S3
- ✅ Point-in-time recovery capability
- ✅ Full and differential backup strategy
- ✅ Automated daily backups at 2:00 AM

## Backup Strategy

### Schedule
- **Sunday**: Full backup (complete database snapshot)
- **Monday-Saturday**: Differential backup (changes since last full backup)

### Retention Policy
- Full backups: 7 days
- Differential backups: 7 days

### Storage
- **Location**: AWS S3 bucket `project-chronos-backups`
- **Region**: ca-central-1
- **Encryption**: AES-256-CBC with passphrase
- **Stanza**: chronos-v2

## Backup Automation

### Cron Setup

The backup script runs daily at 2:00 AM via cron. To install the cron job:

```bash
bash /tmp/install-backup-cron.sh
```

Or manually add to crontab:
```bash
crontab -e
# Add this line:
0 2 * * * /usr/bin/docker exec chronos-db /usr/local/bin/pgbackrest-backup.sh >> /var/log/chronos-backup-cron.log 2>&1
```

### Manual Backup

To run a backup manually:

```bash
# Differential backup
docker exec chronos-db pgbackrest --stanza=chronos-v2 --type=diff backup

# Full backup
docker exec chronos-db pgbackrest --stanza=chronos-v2 --type=full backup
```

## Checking Backup Status

### View Backup Information
```bash
docker exec chronos-db pgbackrest --stanza=chronos-v2 info
```

### Check Latest Backup
```bash
docker logs chronos-db 2>&1 | grep -i backup | tail -20
```

### View Backup Logs
```bash
# Cron logs (on host)
tail -f /var/log/chronos-backup-cron.log

# Container logs
docker exec chronos-db cat /var/log/pgbackrest/backup.log
```

## Restoring from Backup

### List Available Backups
```bash
docker exec chronos-db pgbackrest --stanza=chronos-v2 info
```

### Full Database Restore

**⚠️ WARNING**: This will completely replace the current database. Make sure you have a recent backup first!

1. Stop the database:
```bash
docker stop chronos-db
```

2. Restore from latest backup:
```bash
docker start chronos-db
docker exec chronos-db sh -c "
  # Stop PostgreSQL
  su-exec postgres pg_ctl stop -D /var/lib/postgresql/data -m fast

  # Clear data directory
  rm -rf /var/lib/postgresql/data/*

  # Restore from pgBackRest
  pgbackrest --stanza=chronos-v2 restore

  # Start PostgreSQL
  su-exec postgres postgres -D /var/lib/postgresql/data &
"
```

3. Restart the container:
```bash
docker restart chronos-db
```

### Point-in-Time Recovery

Restore to a specific time:

```bash
docker exec chronos-db pgbackrest --stanza=chronos-v2 \\
  --type=time \\
  --target="2025-12-28 14:30:00" \\
  restore
```

### Restore Specific Backup Set

```bash
# List backups to find the label (e.g., 20251228-195258F)
docker exec chronos-db pgbackrest --stanza=chronos-v2 info

# Restore specific backup
docker exec chronos-db pgbackrest --stanza=chronos-v2 \\
  --set=20251228-195258F \\
  restore
```

## Monitoring and Alerts

### Check if Backups are Running

Verify last backup time:
```bash
docker exec chronos-db pgbackrest --stanza=chronos-v2 info | grep "timestamp start/stop"
```

### Alert Setup

Consider setting up alerts if:
- No backup in last 25 hours
- Backup fails (non-zero exit code)
- S3 bucket becomes unavailable

## Troubleshooting

### Backup Fails with "archive_mode" Error

Enable WAL archiving in PostgreSQL:
```bash
docker exec chronos-db sh -c 'cat >> /var/lib/postgresql/data/postgresql.conf << EOF
archive_mode = on
archive_command = '\''pgbackrest --stanza=chronos-v2 archive-push %p'\''
EOF'
docker restart chronos-db
```

### Cannot Connect to S3

Check AWS credentials in `/home/prometheus/coding/finance/project-chronos/pgbackrest.conf`:
- `repo1-s3-key`
- `repo1-s3-key-secret`
- `repo1-s3-region`

### "Stanza Not Found" Error

Create the stanza:
```bash
docker exec chronos-db pgbackrest --stanza=chronos-v2 stanza-create
```

## Security Notes

- The pgBackRest configuration file contains AWS credentials and encryption keys
- **Do not commit** `pgbackrest.conf` to public repositories
- Encryption passphrase is stored in the config file
- S3 bucket access is restricted via IAM

## Configuration Files

- **Host Config**: `/home/prometheus/coding/finance/project-chronos/pgbackrest.conf`
- **Container Config**: `/etc/pgbackrest/pgbackrest.conf` (bind-mounted from host)
- **Backup Script**: `/usr/local/bin/pgbackrest-backup.sh` (in container)
- **PostgreSQL Config**: `/var/lib/postgresql/data/postgresql.conf`

## Testing Backups

**IMPORTANT**: Regularly test backup restoration to ensure recoverability!

```bash
# 1. Note current database size
docker exec chronos-db psql -h localhost -U prometheus -d chronos_db -c "\\l+"

# 2. Create test table
docker exec chronos-db psql -h localhost -U prometheus -d chronos_db -c "CREATE TABLE backup_test (id serial, created_at timestamp default now());"

# 3. Run backup
docker exec chronos-db /usr/local/bin/pgbackrest-backup.sh

# 4. Verify backup includes new table
docker exec chronos-db pgbackrest --stanza=chronos-v2 info
```

## Migration Notes

### From Old Stanza (chronos) to New Stanza (chronos-v2)

The database was migrated from stanza `chronos` to `chronos-v2` on 2025-12-28 due to a PostgreSQL system-id mismatch. Old backups are still available in S3 under the `chronos` stanza for reference but are not actively maintained.

---

**Last Updated**: 2025-12-28
**PostgreSQL Version**: 16.4
**pgBackRest Version**: 2.51
