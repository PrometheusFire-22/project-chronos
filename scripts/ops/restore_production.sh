#!/bin/bash
# ==============================================================================
# Project Chronos: Database Restore Script
# ==============================================================================
# Usage: ./restore_production.sh <backup_file>
# Example: ./restore_production.sh ~/chronos-backups/daily/chronos_20251117_143022.dump
# ==============================================================================

set -euo pipefail

CONTAINER_NAME="chronos-db"
DB_NAME="chronos_db"
DB_USER="prometheus"

# ==============================================================================
# Functions
# ==============================================================================

log() {
    echo "[$(date +'%Y-%m-%d %H:%M:%S')] $1"
}

usage() {
    echo "Usage: $0 <backup_file>"
    echo ""
    echo "Available backups:"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

    if [ -d "$HOME/chronos-backups/daily" ]; then
        echo "📅 Daily backups:"
        ls -lht "$HOME/chronos-backups/daily"/*.dump 2>/dev/null | head -5 | awk '{print "   "$9" ("$5")"}'
    fi

    if [ -d "$HOME/chronos-backups/weekly" ]; then
        echo ""
        echo "📆 Weekly backups:"
        ls -lht "$HOME/chronos-backups/weekly"/*.dump 2>/dev/null | head -3 | awk '{print "   "$9" ("$5")"}'
    fi

    echo ""
    exit 1
}

confirm_restore() {
    local backup_file="$1"

    echo ""
    echo "⚠️  WARNING: DATABASE RESTORE"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "This will:"
    echo "  1. DROP the existing database '$DB_NAME'"
    echo "  2. CREATE a fresh database"
    echo "  3. RESTORE from: $(basename $backup_file)"
    echo ""
    echo "All current data will be LOST."
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
    read -p "Type 'YES' to continue: " -r

    if [ "$REPLY" != "YES" ]; then
        echo "Restore cancelled."
        exit 0
    fi
}

check_container() {
    if ! docker ps --format '{{.Names}}' | grep -q "^${CONTAINER_NAME}$"; then
        log "❌ ERROR: Container $CONTAINER_NAME is not running"
        log "Start it with: docker compose up -d"
        exit 1
    fi
}

restore_database() {
    local backup_file="$1"
    local container_backup="/tmp/restore.dump"

    log "📤 Copying backup to container..."
    docker cp "$backup_file" "${CONTAINER_NAME}:${container_backup}"

    log "🗑️  Dropping existing database..."
    docker exec "$CONTAINER_NAME" psql -U "$DB_USER" -d postgres \
        -c "DROP DATABASE IF EXISTS $DB_NAME;" 2>/dev/null

    log "🏗️  Creating fresh database..."
    docker exec "$CONTAINER_NAME" psql -U "$DB_USER" -d postgres \
        -c "CREATE DATABASE $DB_NAME;"

    log "📥 Restoring from backup..."
    docker exec "$CONTAINER_NAME" pg_restore \
        -U "$DB_USER" \
        -d "$DB_NAME" \
        --verbose \
        --no-owner \
        --no-acl \
        "$container_backup" 2>&1 | grep -E "^(processing|finished)"

    log "🧹 Cleaning up..."
    docker exec "$CONTAINER_NAME" rm "$container_backup"
}

verify_restore() {
    log "🔍 Verifying restore..."

    local table_count=$(docker exec "$CONTAINER_NAME" psql -U "$DB_USER" -d "$DB_NAME" -t \
        -c "SELECT count(*) FROM information_schema.tables WHERE table_schema NOT IN ('pg_catalog', 'information_schema');" | xargs)

    log "✅ Found $table_count tables in database"

    echo ""
    log "📊 Table summary:"
    docker exec "$CONTAINER_NAME" psql -U "$DB_USER" -d "$DB_NAME" \
        -c "\dt+" | grep -E "public|metadata|timeseries|analytics"
}

# ==============================================================================
# Main Execution
# ==============================================================================

main() {
    # Validate arguments
    if [ $# -eq 0 ]; then
        usage
    fi

    BACKUP_FILE="$1"

    # Validate backup file
    if [ ! -f "$BACKUP_FILE" ]; then
        log "❌ ERROR: Backup file not found: $BACKUP_FILE"
        usage
    fi

    log "=========================================="
    log "Project Chronos Database Restore"
    log "=========================================="
    log "Backup file: $(basename $BACKUP_FILE)"
    log "Size: $(du -h $BACKUP_FILE | cut -f1)"

    confirm_restore "$BACKUP_FILE"
    check_container
    restore_database "$BACKUP_FILE"
    verify_restore

    log "=========================================="
    log "✅ Restore completed successfully!"
    log "=========================================="
}

main "$@"
