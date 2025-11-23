#!/bin/bash
# ==============================================================================
# Project Chronos: Production-Grade Backup Script
# ==============================================================================
# Purpose: Create PostgreSQL backups that survive Docker volume deletion
# Strategy: Dual-location backups (inside container + host filesystem)
# ==============================================================================

set -euo pipefail

# Configuration
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
DATE=$(date +%Y%m%d)
CONTAINER_BACKUP_DIR="/workspace/backups/pgdump"
HOST_BACKUP_DIR="$HOME/chronos-backups/daily"
WEEKLY_DIR="$HOME/chronos-backups/weekly"
MONTHLY_DIR="$HOME/chronos-backups/monthly"

# Database credentials (will be read from container environment)
CONTAINER_NAME="chronos-db"
DB_NAME="chronos_db"
DB_USER="prometheus"

# Retention policies
DAILY_RETENTION=7    # Keep 7 days of daily backups
WEEKLY_RETENTION=28  # Keep 4 weeks of weekly backups
MONTHLY_RETENTION=365 # Keep 12 months of monthly backups

# ==============================================================================
# Functions
# ==============================================================================

log() {
    echo "[$(date +'%Y-%m-%d %H:%M:%S')] $1"
}

create_directories() {
    mkdir -p "$CONTAINER_BACKUP_DIR"
    mkdir -p "$HOST_BACKUP_DIR"
    mkdir -p "$WEEKLY_DIR"
    mkdir -p "$MONTHLY_DIR"
}

check_container() {
    if ! docker ps --format '{{.Names}}' | grep -q "^${CONTAINER_NAME}$"; then
        log "❌ ERROR: Container $CONTAINER_NAME is not running"
        exit 1
    fi
    log "✅ Container is running"
}

create_backup() {
    local backup_file="${CONTAINER_BACKUP_DIR}/chronos_${TIMESTAMP}.dump"

    log "🔄 Creating backup..."

    # Use custom format (best for large databases, supports parallel restore)
    docker exec "$CONTAINER_NAME" pg_dump \
        -U "$DB_USER" \
        -d "$DB_NAME" \
        --format=custom \
        --compress=9 \
        --verbose \
        --file="/var/lib/postgresql/backup.dump" 2>&1 | grep -v "^pg_dump:"

    # Copy from container to host workspace
    docker cp "${CONTAINER_NAME}:/var/lib/postgresql/backup.dump" "$backup_file"

    # Clean up temp file in container
    docker exec "$CONTAINER_NAME" rm /var/lib/postgresql/backup.dump

    if [ -f "$backup_file" ]; then
        local size=$(du -h "$backup_file" | cut -f1)
        log "✅ Backup created: $(basename $backup_file) ($size)"
        echo "$backup_file"
    else
        log "❌ ERROR: Backup file was not created"
        exit 1
    fi
}

copy_to_host() {
    local source_file="$1"
    local dest_file="${HOST_BACKUP_DIR}/$(basename $source_file)"

    cp "$source_file" "$dest_file"
    log "✅ Copied to host: $dest_file"

    # Weekly backup (every Sunday)
    if [ "$(date +%u)" -eq 7 ]; then
        cp "$source_file" "${WEEKLY_DIR}/chronos_weekly_${DATE}.dump"
        log "✅ Weekly backup created"
    fi

    # Monthly backup (1st of month)
    if [ "$(date +%d)" -eq 01 ]; then
        cp "$source_file" "${MONTHLY_DIR}/chronos_monthly_${DATE}.dump"
        log "✅ Monthly backup created"
    fi
}

cleanup_old_backups() {
    log "🧹 Cleaning up old backups..."

    # Container backups (keep 3 days - they're temporary)
    find "$CONTAINER_BACKUP_DIR" -name "*.dump" -mtime +3 -delete 2>/dev/null || true

    # Host daily backups
    find "$HOST_BACKUP_DIR" -name "*.dump" -mtime +${DAILY_RETENTION} -delete 2>/dev/null || true

    # Weekly backups
    find "$WEEKLY_DIR" -name "*.dump" -mtime +${WEEKLY_RETENTION} -delete 2>/dev/null || true

    # Monthly backups
    find "$MONTHLY_DIR" -name "*.dump" -mtime +${MONTHLY_RETENTION} -delete 2>/dev/null || true

    log "✅ Cleanup complete"
}

verify_backup() {
    local backup_file="$1"

    log "🔍 Verifying backup integrity..."

    # Test that the file is a valid PostgreSQL dump
    if docker exec "$CONTAINER_NAME" pg_restore --list "/var/lib/postgresql/$(basename $backup_file)" > /dev/null 2>&1; then
        log "✅ Backup integrity verified"
    else
        log "⚠️  WARNING: Backup verification failed"
    fi
}

# ==============================================================================
# Main Execution
# ==============================================================================

main() {
    log "=========================================="
    log "Starting Project Chronos Database Backup"
    log "=========================================="

    create_directories
    check_container

    backup_file=$(create_backup)
    copy_to_host "$backup_file"
    cleanup_old_backups

    log "=========================================="
    log "✅ Backup completed successfully!"
    log "Latest backup: $(ls -lh $HOST_BACKUP_DIR | tail -1 | awk '{print $9, $5}')"
    log "=========================================="
}

main "$@"
