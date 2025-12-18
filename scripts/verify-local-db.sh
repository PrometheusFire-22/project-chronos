#!/bin/bash
# Verify local PostgreSQL extensions and configuration
# Task: CHRONOS-326 - Database Setup Verification

set -e

echo "🔍 Verifying Local PostgreSQL Setup"
echo "===================================="
echo ""

# Check if container is running
if ! docker ps | grep -q chronos-db; then
  echo "❌ Error: chronos-db container is not running"
  echo "   Run: docker compose up -d timescaledb"
  exit 1
fi

echo "✅ Container: chronos-db is running"
echo ""

# Check PostgreSQL version
echo "📦 PostgreSQL Version:"
docker exec chronos-db psql -U prometheus -d chronos_db -t -c "SELECT version();" | head -n 1
echo ""

# Check installed extensions
echo "🔌 Installed Extensions:"
docker exec chronos-db psql -U prometheus -d chronos_db -c "
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
docker exec chronos-db psql -U prometheus -d chronos_db -c "SHOW shared_preload_libraries;"
echo ""

# Check available extensions (not yet installed)
echo "📦 Available Extensions (not yet installed):"
docker exec chronos-db psql -U prometheus -d chronos_db -c "
SELECT name, default_version, comment
FROM pg_available_extensions
WHERE name IN ('timescaledb', 'postgis', 'vector', 'age', 'pg_stat_statements', 'pgcrypto')
  AND name NOT IN (SELECT extname FROM pg_extension)
ORDER BY name;
"
echo ""

# Check database size
echo "💾 Database Size:"
docker exec chronos-db psql -U prometheus -d chronos_db -c "
SELECT
  pg_database.datname AS \"Database\",
  pg_size_pretty(pg_database_size(pg_database.datname)) AS \"Size\"
FROM pg_database
WHERE datname = 'chronos_db';
"
echo ""

# Check connection parameters
echo "🔗 Connection Parameters:"
echo "   Host: timescaledb (Docker network)"
echo "   Port: 5432"
echo "   Database: chronos_db"
echo "   User: prometheus"
echo ""

# Test connection
echo "🧪 Testing Connection:"
if docker exec chronos-db pg_isready -U prometheus -d chronos_db > /dev/null 2>&1; then
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
echo "     docker exec chronos-db psql -U prometheus -d chronos_db -c 'CREATE EXTENSION IF NOT EXISTS <extension_name>;'"
echo "  2. Compare with cloud setup during Sprint 0"
