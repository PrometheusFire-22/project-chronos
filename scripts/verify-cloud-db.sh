#!/bin/bash
# Verify AWS Lightsail PostgreSQL extensions and configuration
# Task: CHRONOS-326 - Database Setup Verification
# Usage: DATABASE_URL="postgresql://user:pass@host:5432/dbname" ./verify-cloud-db.sh

set -e

echo "🔍 Verifying Cloud PostgreSQL Setup (AWS Lightsail)"
echo "===================================================="
echo ""

# Check if DATABASE_URL is set
if [ -z "$DATABASE_URL" ]; then
  echo "❌ Error: DATABASE_URL environment variable not set"
  echo ""
  echo "Usage:"
  echo "  DATABASE_URL=\"postgresql://user:pass@host:5432/dbname\" ./verify-cloud-db.sh"
  echo ""
  echo "Or export it first:"
  echo "  export DATABASE_URL=\"postgresql://user:pass@host:5432/dbname\""
  echo "  ./verify-cloud-db.sh"
  exit 1
fi

# Mask password in output
MASKED_URL=$(echo "$DATABASE_URL" | sed -E 's/:([^@]+)@/:****@/')
echo "🔗 Connecting to: $MASKED_URL"
echo ""

# Test connection
echo "🧪 Testing Connection:"
if pg_isready -d "$DATABASE_URL" > /dev/null 2>&1; then
  echo "   ✅ Connection: HEALTHY"
else
  echo "   ❌ Connection: FAILED"
  echo "   Check:"
  echo "     - DATABASE_URL is correct"
  echo "     - Security group allows your IP"
  echo "     - SSL is configured correctly"
  exit 1
fi
echo ""

# Check PostgreSQL version
echo "📦 PostgreSQL Version:"
psql "$DATABASE_URL" -t -c "SELECT version();" | head -n 1
echo ""

# Check installed extensions
echo "🔌 Installed Extensions:"
psql "$DATABASE_URL" -c "
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
psql "$DATABASE_URL" -c "SHOW shared_preload_libraries;"
echo ""

# Check available extensions (not yet installed)
echo "📦 Available Extensions (not yet installed):"
psql "$DATABASE_URL" -c "
SELECT name, default_version, comment
FROM pg_available_extensions
WHERE name IN ('timescaledb', 'postgis', 'vector', 'age', 'pg_stat_statements', 'pgcrypto')
  AND name NOT IN (SELECT extname FROM pg_extension)
ORDER BY name;
"
echo ""

# Check database size
echo "💾 Database Size:"
psql "$DATABASE_URL" -c "
SELECT
  current_database() AS \"Database\",
  pg_size_pretty(pg_database_size(current_database())) AS \"Size\"
;
"
echo ""

# Check SSL status
echo "🔒 SSL Status:"
psql "$DATABASE_URL" -c "SHOW ssl;"
echo ""

# Check max connections
echo "⚙️  Configuration:"
psql "$DATABASE_URL" -c "
SELECT name, setting, unit
FROM pg_settings
WHERE name IN ('max_connections', 'shared_buffers', 'work_mem', 'maintenance_work_mem')
ORDER BY name;
"
echo ""

echo "✅ Cloud Database Verification Complete"
echo ""
echo "Comparison Checklist:"
echo "  - [ ] PostgreSQL version matches local (16)"
echo "  - [ ] TimescaleDB installed and same version"
echo "  - [ ] PostGIS installed and same version"
echo "  - [ ] pgvector installed and same version"
echo "  - [ ] Apache AGE installed and same version"
echo "  - [ ] pg_stat_statements preloaded"
echo "  - [ ] SSL enabled"
echo ""
echo "If extensions are missing, install them:"
echo "  psql \"\$DATABASE_URL\" -c 'CREATE EXTENSION IF NOT EXISTS timescaledb;'"
echo "  psql \"\$DATABASE_URL\" -c 'CREATE EXTENSION IF NOT EXISTS postgis;'"
echo "  psql \"\$DATABASE_URL\" -c 'CREATE EXTENSION IF NOT EXISTS vector;'"
echo "  psql \"\$DATABASE_URL\" -c 'CREATE EXTENSION IF NOT EXISTS age;'"
echo "  psql \"\$DATABASE_URL\" -c 'CREATE EXTENSION IF NOT EXISTS pg_stat_statements;'"
echo "  psql \"\$DATABASE_URL\" -c 'CREATE EXTENSION IF NOT EXISTS pgcrypto;'"
