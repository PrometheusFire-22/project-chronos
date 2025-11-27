# ADR 011: PostgreSQL 3-2-1 Backup Architecture

**Status**: Proposed  
**Date**: 2025-11-25  
**Decision Makers**: Geoff Bevans, Claude Code  
**Tags**: `backup`, `postgresql`, `disaster-recovery`, `devops`

---

## Context

Project Chronos stores critical economic time-series data and geospatial information in PostgreSQL with TimescaleDB and PostGIS extensions. A recent accidental Docker volume deletion resulted in complete data loss, highlighting the need for a bulletproof backup strategy before migrating to AWS.

### Requirements

1. **Data Protection**: Prevent data loss from accidental deletion, hardware failure, or corruption
2. **Point-in-Time Recovery**: Ability to restore to any previous state
3. **Off-Site Storage**: Protection against local disasters
4. **Automation**: Minimal manual intervention
5. **Cost-Effective**: Leverage free/low-cost solutions
6. **AWS-Ready**: Easy migration path to AWS infrastructure

### Constraints

- Currently running in local Docker environment
- Limited budget for cloud storage
- Solo developer (no dedicated DevOps team)
- Need to maintain development velocity

---

## Decision

We will implement a **3-2-1 backup architecture** with the following components:

### Layer 1: Live Access (PostgreSQL)
- **Component**: PostgreSQL + TimescaleDB + PostGIS in Docker
- **Purpose**: Active database for application use
- **Backup**: Not a backup layer, but the source of truth

### Layer 2: Local Backup Storage (SSOT)
- **Component**: `/workspace/backups/` directory (bind-mounted from host)
- **Purpose**: Single Source of Truth for backups
- **Mechanism**: Automated `pg_dump` via `pg_cron`
- **Frequency**: Daily at 6 AM UTC
- **Retention**: 30 days local
- **Format**: Compressed SQL dumps (`.sql.gz`)

### Layer 3a: Versioned Off-Site Storage (Git LFS + GitHub)
- **Component**: Git LFS repository on GitHub
- **Purpose**: Version-controlled, immutable backup history
- **Mechanism**: Automated Git commits after each backup
- **Retention**: 90 days (configurable)
- **Benefits**: Point-in-time recovery, audit trail

### Layer 3b: Cloud Off-Site Storage (Google Drive)
- **Component**: Google Drive via rclone
- **Purpose**: Cloud redundancy and accessibility
- **Mechanism**: Automated rclone sync after versioning
- **Retention**: 1 year
- **Benefits**: Easy access, mobile availability

### Automation Flow

```
1. pg_cron triggers backup (6:00 AM UTC)
   ↓
2. pg_dump creates compressed backup → Layer 2
   ↓
3. Git LFS commits and pushes → Layer 3a (6:30 AM UTC)
   ↓
4. rclone syncs to Google Drive → Layer 3b (7:00 AM UTC)
   ↓
5. Cleanup old local backups (30+ days)
```

---

## Rationale

### Why 3-2-1?

The 3-2-1 rule is industry standard for data protection:
- **3 copies**: Live DB + Local backup + 2 off-site (Git LFS + Google Drive)
- **2 media types**: Local disk + Cloud storage
- **1 off-site**: GitHub and Google Drive

### Why pg_cron over OS cron?

1. **Database-Native**: Runs inside PostgreSQL, survives container restarts
2. **Transaction Safety**: Can use database transactions for consistency
3. **Logging**: Built-in logging to PostgreSQL tables
4. **Portability**: Works in RDS PostgreSQL (AWS migration ready)
5. **Simplicity**: No need to manage external cron jobs

### Why Git LFS?

1. **Versioning**: Full history of all backups with Git semantics
2. **Immutability**: Git commits are immutable (protection against tampering)
3. **Familiar**: Git workflow is well-understood
4. **Free Tier**: GitHub provides 1GB LFS storage free
5. **Audit Trail**: Complete history of when backups were created

### Why rclone + Google Drive?

1. **Accessibility**: Easy to access from mobile/web
2. **Reliability**: Google's infrastructure
3. **Cost**: 15GB free, $1.99/month for 100GB
4. **Flexibility**: rclone supports 40+ cloud providers (easy to add more)
5. **Encryption**: rclone supports client-side encryption

---

## Alternatives Considered

### Alternative 1: AWS S3 Only

**Pros**:
- Industry standard
- Versioning built-in
- Glacier for long-term storage

**Cons**:
- Requires AWS account setup (delaying current work)
- Costs money immediately
- Less accessible for quick recovery

**Decision**: Rejected for now, will migrate to S3 after AWS setup

### Alternative 2: Backblaze B2

**Pros**:
- Cheaper than S3
- S3-compatible API
- 10GB free

**Cons**:
- Another service to manage
- Less familiar than Google Drive
- No versioning without additional tools

**Decision**: Rejected, Google Drive is simpler

### Alternative 3: pg_basebackup + WAL Archiving

**Pros**:
- Point-in-time recovery to the second
- Official PostgreSQL backup method
- Incremental backups

**Cons**:
- More complex setup
- Requires continuous WAL archiving
- Higher storage requirements
- Overkill for current scale

**Decision**: Rejected, too complex for current needs

### Alternative 4: Restic

**Pros**:
- Deduplication
- Encryption
- Multiple backends

**Cons**:
- Another tool to learn
- Requires separate restore process
- Less transparent than SQL dumps

**Decision**: Rejected, prefer simplicity of SQL dumps

---

## Consequences

### Positive

1. **Data Safety**: Multiple redundant copies protect against all common failure modes
2. **Recovery Options**: Can recover from local, Git LFS, or Google Drive
3. **Audit Trail**: Git history shows exactly when each backup was created
4. **Automation**: Fully automated, no manual intervention needed
5. **Cost-Effective**: Leverages free tiers (GitHub LFS 1GB, Google Drive 15GB)
6. **AWS-Ready**: pg_cron works in RDS, easy to add S3 as Layer 3c

### Negative

1. **Storage Costs**: May exceed free tiers as data grows
   - *Mitigation*: Aggressive retention policies, compression
2. **Complexity**: Multiple systems to maintain
   - *Mitigation*: Comprehensive documentation and runbooks
3. **Recovery Time**: Restoring from Git LFS or Google Drive is slower than local
   - *Mitigation*: Keep 30 days local for fast recovery
4. **Git LFS Limitations**: 1GB free tier may be insufficient
   - *Mitigation*: Monitor usage, consider GitLab (10GB free) or self-hosted

### Risks

1. **Backup Failure**: pg_cron job could fail silently
   - *Mitigation*: Implement monitoring and alerting
2. **Corruption**: Backup could be corrupted
   - *Mitigation*: Monthly restoration tests
3. **Sync Conflicts**: rclone could have sync issues
   - *Mitigation*: One-way sync, conflict detection

---

## Implementation

### Phase 1: Core Backup (Week 1)
- Install pg_cron extension
- Create backup function and schedule
- Test backup creation and restoration

### Phase 2: Versioning (Week 1)
- Set up Git LFS repository
- Create versioning script
- Test recovery from Git LFS

### Phase 3: Cloud Sync (Week 2)
- Configure rclone for Google Drive
- Create sync script
- Test recovery from Google Drive

### Phase 4: Monitoring (Week 2)
- Implement backup monitoring
- Create restoration testing framework
- Document recovery procedures

---

## Verification

### Success Criteria

1. **Automated Backups**: Daily backups running without manual intervention
2. **3-2-1 Compliance**: 3 copies, 2 media types, 1 off-site verified
3. **Recovery Tested**: Successfully restored from all 3 layers
4. **Documentation**: Complete runbooks for backup and recovery

### Testing Plan

1. **Backup Creation Test**: Verify daily backups are created
2. **Local Recovery Test**: Restore from Layer 2 (local backup)
3. **Git LFS Recovery Test**: Restore from Layer 3a (GitHub)
4. **Google Drive Recovery Test**: Restore from Layer 3b (Google Drive)
5. **Failure Simulation**: Test recovery after simulated data loss

---

## Future Enhancements

1. **AWS S3 Integration**: Add S3 as Layer 3c after AWS migration
2. **Incremental Backups**: Implement WAL archiving for point-in-time recovery
3. **Encryption**: Add rclone crypt for Google Drive encryption
4. **Monitoring**: Implement Prometheus/Grafana for backup monitoring
5. **Multi-Region**: Add geographically distributed backups

---

## References

- [3-2-1 Backup Rule](https://www.backblaze.com/blog/the-3-2-1-backup-strategy/)
- [PostgreSQL Backup Documentation](https://www.postgresql.org/docs/current/backup.html)
- [pg_cron Extension](https://github.com/citusdata/pg_cron)
- [Git LFS](https://git-lfs.github.com/)
- [rclone Documentation](https://rclone.org/)

---

**Approved By**: [Pending]  
**Implementation Date**: [Pending]
