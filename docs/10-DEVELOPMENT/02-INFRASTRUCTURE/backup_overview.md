# Backup Architecture Overview

This document provides a high-level overview of the Project Chronos backup strategy. For detailed configuration with credentials, see `pgbackrest_secrets.md` (gitignored).

## Backup Strategy

Project Chronos implements a **3-2-1 backup architecture**:
- **3** copies of data (production + 2 backups)
- **2** different storage types (local volume + cloud S3)
- **1** off-site copy (AWS S3 in ca-central-1)

## Components

### 1. pgBackRest

**Purpose**: PostgreSQL-native backup solution with enterprise features

**Features**:
- Full and differential backups
- Point-in-time recovery (PITR) via WAL archiving
- AES-256-CBC encryption at rest
- Compression for reduced storage costs
- S3 integration for off-site storage

**Schedule**:
- **Full backups**: Sundays at 2:00 AM EST
- **Differential backups**: Monday-Saturday at 2:00 AM EST
- **WAL archiving**: Continuous

**Retention**:
- Full backups: 7 days
- Differential backups: 7 days
- WAL archives: Retained with associated backups

### 2. Storage Locations

#### Primary Data
- **Location**: Docker volume `timescale-data`
- **Path**: `/var/lib/docker/volumes/timescale-data/_data`
- **Instance**: Montreal Lightsail (ca-central-1)

#### Backup Repository
- **Type**: AWS S3
- **Bucket**: `project-chronos-backups`
- **Region**: ca-central-1 (Montreal)
- **Encryption**: AES-256-CBC (application-level)
- **Compression**: gzip (automatic via pgBackRest)

## Backup Operations

### Automated Backups

Backups run automatically via cron:
```bash
# Daily at 2:00 AM EST (7:00 AM UTC)
0 7 * * * root docker exec chronos-db /usr/local/bin/pgbackrest-backup.sh
```

The script (`pgbackrest-backup.sh`) handles:
- Full backups on Sundays
- Differential backups on other days
- Logging to `/var/log/chronos-backup-cron.log`
- Error handling and notifications

### Manual Operations

**Check backup status**:
```bash
docker exec chronos-db pgbackrest --stanza=chronos-v2 info
```

**Run manual full backup**:
```bash
docker exec chronos-db pgbackrest --stanza=chronos-v2 --type=full backup
```

**Run manual differential backup**:
```bash
docker exec chronos-db pgbackrest --stanza=chronos-v2 --type=diff backup
```

**Verify configuration**:
```bash
docker exec chronos-db pgbackrest --stanza=chronos-v2 check
```

## Disaster Recovery

### Full Database Restore

1. Stop the database container
2. Remove the old data volume
3. Create a new container with fresh volume
4. Restore from backup:
```bash
docker exec chronos-db pgbackrest --stanza=chronos-v2 restore
```

### Point-in-Time Recovery (PITR)

Restore to a specific timestamp:
```bash
docker exec chronos-db pgbackrest --stanza=chronos-v2 \
  --type=time --target="2026-02-01 12:00:00" restore
```

## Monitoring

### Check Backup Health

```bash
# View backup information
docker exec chronos-db pgbackrest --stanza=chronos-v2 info

# Check cron logs
ssh ubuntu@<instance-ip> "sudo tail -f /var/log/chronos-backup-cron.log"

# Verify S3 bucket contents
aws s3 ls s3://project-chronos-backups/ --region ca-central-1
```

### Key Metrics

- **Backup frequency**: Daily
- **Backup window**: ~30 seconds for full backup (64MB database)
- **Compression ratio**: ~8:1 (64MB → 8MB)
- **Storage cost**: ~$0.02/month for 7 days of backups

## Security

- **Encryption**: AES-256-CBC for all backups
- **Access control**: IAM user with minimal S3 permissions
- **Secrets management**: Stored in gitignored `pgbackrest_secrets.md`
- **Network**: Private communication within Docker network

## Migration Notes

### From US Instance to Montreal Instance

**Date**: 2026-02-01

**Changes**:
- New database system-id: 7601921254259666965
- Stanza recreated as `chronos-v2`
- S3 bucket cleared of old backups from previous instance
- WAL archiving re-enabled after container recreation

**Verification**:
- ✅ Database: 306 tables intact
- ✅ Backup: First full backup completed successfully
- ✅ WAL archiving: Active and functional
- ✅ Cron: Scheduled for daily execution

## Related Documentation

- [database_backups.md](./database_backups.md) - Detailed runbook (may be outdated)
- [BACKUP_RESTORE.md](../../BACKUP_RESTORE.md) - Legacy backup guide
- [ADR-008: Backup Architecture](../01-ARCHITECTURE/adrs/adr_008_backup_architecture.md)
- `pgbackrest_secrets.md` - Configuration secrets (gitignored)

## Troubleshooting

### Common Issues

**Backup fails with "database does not exist"**:
- Verify `pg1-database` in `/etc/pgbackrest/pgbackrest.conf` matches actual database name

**WAL archiving not working**:
- Check `archive_mode` and `archive_command` in PostgreSQL:
  ```sql
  SHOW archive_mode;
  SHOW archive_command;
  ```
- Restart database after changing archive settings

**S3 connection errors**:
- Verify IAM credentials in `pgbackrest.conf`
- Check S3 bucket permissions
- Ensure network connectivity to S3 endpoint

**Stanza mismatch errors**:
- Occurs when database system-id changes (e.g., after migration)
- Solution: Delete old stanza and recreate:
  ```bash
  docker exec chronos-db pgbackrest --stanza=chronos-v2 stanza-delete --force
  docker exec chronos-db pgbackrest --stanza=chronos-v2 stanza-create
  ```
