#!/bin/bash
# Verify local PostgreSQL extensions and configuration
# Task: CHRONOS-326 - Database Setup Verification
# Works from both host OS and inside dev container

set -e

echo "🔍 Verifying Local PostgreSQL Setup"
echo "===================================="
echo ""

# Detect if running inside dev container or from host
if [ -f /.dockerenv ] || grep -q docker /proc/1/cgroup 2>/dev/null; then
  # Inside dev container - use psql directly
  PSQL_CMD="psql -h timescaledb -U prometheus -d chronos_db"
  PG_ISREADY_CMD="pg_isready -h timescaledb -U prometheus -d chronos_db"
  LOCATION="dev container"
  echo "📍 Running from: $LOCATION"
else
  # On host OS - use docker exec
  if ! docker ps | grep -q chronos-db; then
    echo "❌ Error: chronos-db container is not running"
    echo "   Run: docker compose up -d"
    exit 1
  fi
  PSQL_CMD="docker exec chronos-db psql -U prometheus -d chronos_db"
  PG_ISREADY_CMD="docker exec chronos-db pg_isready -U prometheus -d chronos_db"
  LOCATION="host OS"
  echo "📍 Running from: $LOCATION"
  echo "✅ Container: chronos-db is running"
fi

echo ""

# Check PostgreSQL version
echo "📦 PostgreSQL Version:"
$PSQL_CMD -t -c "SELECT version();" | head -n 1
echo ""

# Check installed extensions
echo "🔌 Installed Extensions:"
$PSQL_CMD -c "
SELECT
  e.extname AS \"Extension\",
  e.extversion AS \"Version\",
  n.nspname AS \"Schema\"
FROM pg_extension e
JOIN pg_namespace n ON e.extnamespace = n.oid
WHERE e.extname IN ('timescaledb', 'postgis', 'vector', 'age', 'pg_stat_statements', 'pgcrypto', 'plpgsql')
ORDER BY e.extname;
"
echo ""

# Check preloaded libraries
echo "📚 Preloaded Libraries:"
$PSQL_CMD -c "SHOW shared_preload_libraries;"
echo ""

# Check available extensions (not yet installed)
echo "📦 Available Extensions (not yet installed):"
$PSQL_CMD -c "
SELECT name, default_version, comment
FROM pg_available_extensions
WHERE name IN ('timescaledb', 'postgis', 'vector', 'age', 'pg_stat_statements', 'pgcrypto')
  AND name NOT IN (SELECT extname FROM pg_extension)
ORDER BY name;
"
echo ""

# Check database size
echo "💾 Database Size:"
$PSQL_CMD -c "
SELECT
  pg_database.datname AS \"Database\",
  pg_size_pretty(pg_database_size(pg_database.datname)) AS \"Size\"
FROM pg_database
WHERE datname = 'chronos_db';
"
echo ""

# Check connection parameters
echo "🔗 Connection Parameters:"
if [ "$LOCATION" = "dev container" ]; then
  echo "   Host: timescaledb (Docker network)"
else
  echo "   Host: localhost (via Docker)"
fi
echo "   Port: 5432"
echo "   Database: chronos_db"
echo "   User: prometheus"
echo ""

# Test connection
echo "🧪 Testing Connection:"
if $PG_ISREADY_CMD > /dev/null 2>&1; then
  echo "   ✅ Connection: HEALTHY"
else
  echo "   ❌ Connection: FAILED"
  exit 1
fi

echo ""
echo "✅ Local Database Verification Complete"
echo ""
echo "Next Steps:"
echo "  1. If extensions are missing, create them with:"
if [ "$LOCATION" = "dev container" ]; then
  echo "     psql -h timescaledb -U prometheus -d chronos_db -c 'CREATE EXTENSION IF NOT EXISTS <extension_name>;'"
else
  echo "     docker exec chronos-db psql -U prometheus -d chronos_db -c 'CREATE EXTENSION IF NOT EXISTS <extension_name>;'"
fi
echo "  2. Compare with cloud setup during Sprint 0"
