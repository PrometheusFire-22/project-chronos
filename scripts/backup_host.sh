#!/bin/bash
# ==============================================================================
# Project Chronos: Host-Side Backup Script
# ==============================================================================
# WHERE TO RUN: On your HOST machine (NOT in dev container)
# USAGE: ./backup_host.sh
# ==============================================================================

set -euo pipefail

# Configuration
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
DATE=$(date +%Y%m%d)
PROJECT_DIR="/home/prometheus/coding/finance/project-chronos"
HOST_BACKUP_DIR="/home/prometheus/chronos-backups/daily"
WEEKLY_DIR="/home/prometheus/chronos-backups/weekly"
MONTHLY_DIR="/home/prometheus/chronos-backups/monthly"

# Database configuration
CONTAINER_NAME="chronos-db"
DB_NAME="chronos_db"
DB_USER="prometheus"

# Retention policies
DAILY_RETENTION=7
WEEKLY_RETENTION=28
MONTHLY_RETENTION=365

# ==============================================================================
# Functions
# ==============================================================================

log() {
    echo "[$(date +'%Y-%m-%d %H:%M:%S')] $1"
}

create_directories() {
    mkdir -p "$HOST_BACKUP_DIR"
    mkdir -p "$WEEKLY_DIR"
    mkdir -p "$MONTHLY_DIR"
    log "✅ Backup directories created"
}

check_container() {
    if ! docker ps --format '{{.Names}}' | grep -q "^${CONTAINER_NAME}$"; then
        log "❌ ERROR: Container $CONTAINER_NAME is not running"
        log "Start it with: cd $PROJECT_DIR && docker compose up -d"
        exit 1
    fi
    log "✅ Container is running"
}

create_backup() {
    local backup_file="${HOST_BACKUP_DIR}/chronos_${TIMESTAMP}.dump"
    
    log "🔄 Creating backup..."
    
    # Use pg_dump with custom format (best for restoration)
    docker exec "$CONTAINER_NAME" pg_dump \
        -U "$DB_USER" \
        -d "$DB_NAME" \
        --format=custom \
        --compress=9 \
        --no-owner \
        --no-acl \
        --verbose \
        2>&1 | grep -v "^pg_dump:" > "${backup_file}"
    
    if [ -s "$backup_file" ]; then
        local size=$(du -h "$backup_file" | cut -f1)
        log "✅ Backup created: $(basename $backup_file) ($size)"
        echo "$backup_file"
    else
        log "❌ ERROR: Backup file is empty or was not created"
        exit 1
    fi
}

copy_to_archives() {
    local source_file="$1"
    
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
    
    # Daily backups
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
    
    # Test that pg_restore can read the file
    if docker exec "$CONTAINER_NAME" pg_restore --list - < "$backup_file" > /dev/null 2>&1; then
        log "✅ Backup integrity verified"
    else
        log "⚠️  WARNING: Could not verify backup integrity"
    fi
}

# ==============================================================================
# Main Execution
# ==============================================================================

main() {
    log "=========================================="
    log "🚀 Project Chronos Database Backup"
    log "=========================================="
    log "Running from: HOST machine"
    log "Project dir: $PROJECT_DIR"
    log "Target: $CONTAINER_NAME"
    
    create_directories
    check_container
    
    backup_file=$(create_backup)
    copy_to_archives "$backup_file"
    verify_backup "$backup_file"
    cleanup_old_backups
    
    log "=========================================="
    log "✅ Backup completed successfully!" 
    log "Location: $backup_file"
    log "Size: $(du -h $backup_file | cut -f1)"
    log "=========================================="
}

main "$@"