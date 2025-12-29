#!/bin/bash
# PostgreSQL Backup Script using pgBackRest
# Runs inside chronos-db Docker container
# Scheduled via cron at 2:00 AM daily

TIMESTAMP=$(date +"%Y-%m-%d %H:%M:%S")
LOG_FILE="/var/log/pgbackrest/backup.log"

# Ensure log directory exists
mkdir -p /var/log/pgbackrest

echo "[$TIMESTAMP] Starting pgBackRest backup..." | tee -a "$LOG_FILE"

# Run full backup once a week (Sundays), differential backups other days
DAY_OF_WEEK=$(date +%u)

if [ "$DAY_OF_WEEK" -eq 7 ]; then
    # Sunday - Full backup
    pgbackrest --stanza=chronos-v2 --type=full backup 2>&1 | tee -a "$LOG_FILE"
    BACKUP_TYPE="FULL"
else
    # Monday-Saturday - Differential backup
    pgbackrest --stanza=chronos-v2 --type=diff backup 2>&1 | tee -a "$LOG_FILE"
    BACKUP_TYPE="DIFFERENTIAL"
fi

BACKUP_EXIT_CODE=$?

if [ $BACKUP_EXIT_CODE -eq 0 ]; then
    echo "[$TIMESTAMP] $BACKUP_TYPE backup completed successfully" | tee -a "$LOG_FILE"

    # Log backup info
    pgbackrest --stanza=chronos-v2 info 2>&1 | tail -20 | tee -a "$LOG_FILE"

    exit 0
else
    echo "[$TIMESTAMP] ERROR: $BACKUP_TYPE backup failed with exit code $BACKUP_EXIT_CODE" | tee -a "$LOG_FILE"
    exit 1
fi
