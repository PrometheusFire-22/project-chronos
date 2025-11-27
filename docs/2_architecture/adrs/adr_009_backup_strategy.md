# ADR 012: Database Backup Strategy (REVISED)

**Status**: Proposed (Supersedes previous Git LFS decision)  
**Date**: 2025-11-25 (Revised)  
**Decision Makers**: Geoff Bevans, Claude Code  
**Tags**: `backup`, `postgresql`, `pgbackrest`, `s3`, `production`

---

## Context

**REVISION NOTE**: The original ADR 012 proposed Git LFS for database backup versioning. Upon further analysis, this is **NOT a best practice** for PostgreSQL backups. This revised ADR corrects that recommendation.

### Why Git LFS is Wrong for Database Backups

1. **Not Designed for Databases**: Git LFS is for large binary assets (images, videos), not databases
2. **No Point-in-Time Recovery**: Git commits are discrete, can't recover to arbitrary timestamp
3. **No Incremental Backups**: Every backup is full size (expensive)
4. **Storage Costs**: GitHub LFS is expensive for database-sized files
5. **Restoration Complexity**: Requires Git knowledge, not standard database tools
6. **Industry Practice**: No production systems use Git LFS for database backups

**Correct Use of Git LFS**: Source code assets, design files, ML models - NOT databases

---

## Decision

We will use **pgBackRest** with **AWS S3** for PostgreSQL backups.

### Architecture

```
PostgreSQL (Local or AWS)
    ↓
pgBackRest
    ↓
    ├─→ S3 (Primary - us-east-1)
    │   ├─→ S3 Standard (7 days)
    │   ├─→ S3 Glacier Instant (30 days)
    │   └─→ S3 Glacier Deep Archive (1 year)
    │
    ├─→ Local Storage (Cache - recent backups)
    │
    └─→ Google Drive (Tertiary - rclone sync monthly)
```

### Key Features

1. **Continuous WAL Archiving**: Point-in-time recovery (PITR)
2. **Incremental Backups**: Only changed data (cost-efficient)
3. **Parallel Backup/Restore**: Fast operations
4. **Compression**: Reduces storage costs
5. **Encryption**: At rest and in transit
6. **Retention Policies**: Automatic cleanup
7. **S3 Integration**: Direct to S3, no intermediary

---

## Implementation

### 1. Install pgBackRest

```bash
# Ubuntu/Debian
sudo apt-get install pgbackrest

# Or build from source for latest version
wget https://github.com/pgbackrest/pgbackrest/archive/release/2.49.tar.gz
tar xzf 2.49.tar.gz
cd pgbackrest-release-2.49/src
./configure
make
sudo make install
```

### 2. Configure pgBackRest

`/etc/pgbackrest/pgbackrest.conf`:
```ini
[global]
repo1-type=s3
repo1-s3-bucket=project-chronos-backups
repo1-s3-region=us-east-1
repo1-s3-key=<AWS_ACCESS_KEY>
repo1-s3-key-secret=<AWS_SECRET_KEY>
repo1-retention-full=4
repo1-retention-diff=4
repo1-cipher-type=aes-256-cbc
repo1-cipher-pass=<ENCRYPTION_PASSWORD>

# Local cache
repo2-type=posix
repo2-path=/var/lib/pgbackrest
repo2-retention-full=2

[chronos]
pg1-path=/var/lib/postgresql/16/main
pg1-port=5432
pg1-user=postgres
```

### 3. Configure PostgreSQL

`postgresql.conf`:
```
archive_mode = on
archive_command = 'pgbackrest --stanza=chronos archive-push %p'
wal_level = replica
max_wal_senders = 3
```

### 4. Initialize Stanza

```bash
# Create stanza
sudo -u postgres pgbackrest --stanza=chronos stanza-create

# Verify
sudo -u postgres pgbackrest --stanza=chronos check
```

### 5. Create Backup Schedule

```bash
# Daily full backup (cron)
0 2 * * * postgres pgbackrest --stanza=chronos --type=full backup

# Hourly differential backup
0 * * * * postgres pgbackrest --stanza=chronos --type=diff backup
```

### 6. Restore Example

```bash
# Point-in-time recovery
sudo -u postgres pgbackrest --stanza=chronos \
  --type=time \
  --target="2025-11-25 14:30:00" \
  restore
```

---

## Comparison: pgBackRest vs Alternatives

| Feature | pgBackRest | WAL-G | pg_dump | Git LFS |
|---------|-----------|-------|---------|---------|
| **PITR** | ✅ | ✅ | ❌ | ❌ |
| **Incremental** | ✅ | ✅ | ❌ | ❌ |
| **Compression** | ✅ | ✅ | ✅ | Manual |
| **Encryption** | ✅ | ✅ | Manual | ❌ |
| **S3 Direct** | ✅ | ✅ | Manual | ❌ |
| **Parallel** | ✅ | ✅ | ❌ | ❌ |
| **Maturity** | ✅ | ⚠️ | ✅ | N/A |
| **Complexity** | Medium | Medium | Low | High |
| **Cost** | Low | Low | Medium | High |

---

## Cost Analysis

### Scenario: 50GB Database, 30-Day Retention

**pgBackRest with S3**:
- Initial full backup: 50GB → 5GB compressed
- Daily incremental: ~500MB compressed
- 30 days: 5GB + (30 × 0.5GB) = 20GB total

**S3 Costs**:
- S3 Standard (7 days): 7 × 0.5GB × $0.023 = $0.08
- S3 Glacier Instant (23 days): 5GB + (23 × 0.5GB) × $0.004 = $0.07
- **Total: ~$0.15/month** (vs $34.50 with pg_dump)

**Savings**: 99.6% reduction in storage costs

---

## Rationale

### Why pgBackRest?

1. **Industry Standard**: Used by Crunchy Data, EnterpriseDB, major PostgreSQL deployments
2. **Production-Grade**: Battle-tested in enterprise environments
3. **Cost-Efficient**: Incremental backups reduce storage by 90%+
4. **PITR**: Can restore to any point in time (critical for production)
5. **Fast Recovery**: Parallel restore, delta restore
6. **S3 Native**: No intermediary tools needed
7. **Active Development**: Regular updates, strong community

### Why Not Git LFS?

1. **Wrong Tool**: Git LFS designed for source code assets, not databases
2. **No PITR**: Can only restore to commit points, not arbitrary times
3. **Expensive**: Full backups every time, no incremental
4. **Complex**: Requires Git knowledge for database operations
5. **Not Standard**: No production PostgreSQL deployments use Git LFS

---

## Consequences

### Positive

1. **Production-Grade**: Industry-standard backup solution
2. **Cost-Effective**: 99%+ storage savings vs full backups
3. **PITR**: Can recover to any point in time
4. **Fast**: Parallel backup and restore
5. **Reliable**: Proven in enterprise environments
6. **AWS-Ready**: Direct S3 integration

### Negative

1. **Learning Curve**: More complex than pg_dump
2. **Configuration**: Requires proper setup
3. **Monitoring**: Need to monitor backup jobs

### Risks

1. **Misconfiguration**: Incorrect setup could fail backups
   - *Mitigation*: Test restore procedures monthly
2. **S3 Costs**: Could increase with data growth
   - *Mitigation*: Lifecycle policies, monitoring
3. **AWS Dependency**: Tied to AWS S3
   - *Mitigation*: Can use local repo as fallback

---

## Migration from Current Setup

### Phase 1: Test Locally (Week 1)
1. Install pgBackRest on local Docker
2. Configure S3 bucket
3. Test backup and restore
4. Document procedures

### Phase 2: Production Setup (Week 2)
1. Configure pgBackRest on AWS Lightsail/EC2
2. Set up automated backups
3. Implement monitoring
4. Test disaster recovery

### Phase 3: Tertiary Backup (Week 3)
1. Set up rclone sync to Google Drive
2. Monthly full backup sync
3. Test recovery from Google Drive

---

## Verification

### Success Criteria

1. **Automated Backups**: Daily full, hourly differential running
2. **S3 Storage**: Backups stored in S3 with lifecycle policies
3. **PITR Tested**: Successfully restored to specific timestamp
4. **Cost Optimized**: Storage costs < $5/month for 50GB database
5. **Documentation**: Complete runbooks for backup and restore

### Testing Plan

```bash
# 1. Create test data
psql chronos -c "CREATE TABLE backup_test (id SERIAL, data TEXT, created_at TIMESTAMP DEFAULT NOW());"
psql chronos -c "INSERT INTO backup_test (data) SELECT 'test' FROM generate_series(1,1000);"

# 2. Note timestamp
TIMESTAMP=$(date '+%Y-%m-%d %H:%M:%S')

# 3. Create more data
psql chronos -c "INSERT INTO backup_test (data) SELECT 'after' FROM generate_series(1,1000);"

# 4. Restore to timestamp
sudo -u postgres pgbackrest --stanza=chronos --type=time --target="$TIMESTAMP" restore

# 5. Verify data
psql chronos -c "SELECT COUNT(*) FROM backup_test WHERE data='test';"  # Should be 1000
psql chronos -c "SELECT COUNT(*) FROM backup_test WHERE data='after';" # Should be 0
```

---

## References

- [pgBackRest Documentation](https://pgbackrest.org/user-guide.html)
- [PostgreSQL Backup Best Practices](https://www.postgresql.org/docs/current/backup.html)
- [AWS S3 Lifecycle Policies](https://docs.aws.amazon.com/AmazonS3/latest/userguide/object-lifecycle-mgmt.html)
- [Crunchy Data: pgBackRest Tutorial](https://www.crunchydata.com/blog/pgbackrest-tutorial)

---

**Approved By**: [Pending]  
**Implementation Date**: [Pending]
