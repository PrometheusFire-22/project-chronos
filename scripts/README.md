# Database Verification Scripts

**Task:** CHRONOS-326 - Docker Compose PostgreSQL Environment
**Created:** 2025-12-17

---

## Scripts

### `verify-local-db.sh`
**Purpose:** Verify local Docker PostgreSQL setup

**Prerequisites:**
- Dev container running (or `docker compose up -d timescaledb`)
- Container name: `chronos-db`

**Usage:**
```bash
./scripts/verify-local-db.sh
```

**Output:**
- PostgreSQL version
- Installed extensions (timescaledb, postgis, pgvector, age, etc.)
- Preloaded libraries
- Database size
- Connection health

---

### `verify-cloud-db.sh`
**Purpose:** Verify AWS Lightsail PostgreSQL setup (Sprint 0)

**Prerequisites:**
- Lightsail PostgreSQL provisioned
- `psql` client installed locally
- Network access to Lightsail
- DATABASE_URL set

**Usage:**
```bash
# Option 1: Inline
DATABASE_URL="postgresql://user:pass@lightsail-host:5432/chronos_db" ./scripts/verify-cloud-db.sh

# Option 2: Environment variable
export DATABASE_URL="postgresql://user:pass@lightsail-host:5432/chronos_db"
./scripts/verify-cloud-db.sh

# Option 3: From .env (if Lightsail configured)
source .env
./scripts/verify-cloud-db.sh
```

**Output:**
- PostgreSQL version
- Installed extensions
- Preloaded libraries
- SSL status
- Configuration parameters
- Database size

---

## Verification Workflow

### Local Verification (Now)

1. Open workspace in VS Code (dev container auto-starts)
2. Run verification:
   ```bash
   ./scripts/verify-local-db.sh
   ```
3. Verify all extensions installed

### Cloud Verification (Sprint 0)

1. Provision AWS Lightsail PostgreSQL (Montreal)
2. Install required extensions
3. Configure DATABASE_URL
4. Run verification:
   ```bash
   DATABASE_URL="<lightsail-url>" ./scripts/verify-cloud-db.sh
   ```
5. Compare output with local setup

---

## Expected Extensions

| Extension | Purpose | Status |
|-----------|---------|--------|
| **timescaledb** | Time-series optimization | Required |
| **postgis** | Geospatial queries | Required |
| **pgvector** (vector) | AI embeddings, semantic search | Required |
| **age** | Graph database queries | Required |
| **pg_stat_statements** | Query performance monitoring | Required |
| **pgcrypto** | Cryptographic functions | Required |

---

## Troubleshooting

### Local: Container not running
```bash
# Start dev container via VS Code, or manually:
docker compose up -d timescaledb

# Check logs
docker compose logs timescaledb
```

### Cloud: Connection failed
```bash
# Test connectivity
pg_isready -h <lightsail-host> -U <user> -d chronos_db

# Check:
# - Security group allows your IP
# - Lightsail firewall configured
# - SSL certificate valid
```

### Extension not available
```bash
# Check available extensions
psql -c "SELECT * FROM pg_available_extensions WHERE name = '<extension>';"

# May need to install on server (Lightsail)
# Contact AWS support or check Lightsail documentation
```

---

## Next Steps

### After Local Verification
- [ ] Confirm all extensions installed
- [ ] Document any missing extensions
- [ ] Update schema if needed

### After Cloud Verification (Sprint 0)
- [ ] Compare versions between local and cloud
- [ ] Document any discrepancies
- [ ] Install missing extensions on Lightsail
- [ ] Update ADR-003 with findings

---

*Created: 2025-12-17*
*Task: CHRONOS-326*
