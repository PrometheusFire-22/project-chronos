# Sprint 7: AWS Infrastructure - Execution Plan

**Created:** 2025-11-27
**Sprint Goal:** Production-grade AWS database infrastructure
**Budget:** $25/month allocated | **Actual:** $13-15/month (46% under budget)

---

## 📊 Sprint Overview

### Completed (6 pts - 27%)
- ✅ **CHRONOS-219:** AWS CLI v2 + SSO Configuration (1 pt)
- ✅ **CHRONOS-213:** AWS Lightsail PostgreSQL Instance (5 pts)

### In Progress (13 pts - 59%)
- 🔄 **CHRONOS-214:** pgBackRest + S3 Backups (5 pts) - **Phase 1**
- 🔄 **CHRONOS-216:** Security Hardening (3 pts) - **Phase 2**
- 🔄 **CHRONOS-217:** CloudWatch Monitoring (3 pts) - **Phase 3**
- 🔄 **CHRONOS-218:** Disaster Recovery Test (2 pts) - **Phase 4**

### Deferred (3 pts - 14%)
- ⏸️ **CHRONOS-215:** Deploy App + Nginx (3 pts) - **Waiting for application**

**Total:** 22 story points | **Completing:** 19 pts (86%)

---

## 💰 Cost Analysis

### Current Infrastructure
| Service | Specification | Monthly Cost | Status |
|---------|--------------|--------------|--------|
| Lightsail Instance | small_3_0 (2GB RAM, 2 vCPU, 60GB SSD) | $12.00 | ✅ Active |
| Static IP | Attached to instance | $0.00 | ✅ Free |
| **Subtotal** | | **$12.00** | |

### Planned Additions
| Service | Purpose | Monthly Cost | Phase |
|---------|---------|--------------|-------|
| S3 Storage | pgBackRest backups (Option B) | $2.00 | Phase 1 |
| CloudWatch Alarms | Monitoring (first 10 free) | $0.00 | Phase 3 |
| Let's Encrypt SSL | TLS certificates | $0.00 | Phase 2 |
| **Total** | | **$14.00** | |

### Budget Summary
- **Allocated:** $25/month
- **Projected:** $14/month
- **Savings:** $11/month (44% under budget)
- **Status:** ✅ Well within budget

---

## 🗺️ Execution Phases

### Phase 1: CHRONOS-214 - pgBackRest + S3 Backups ⭐ CRITICAL
**Priority:** Must-have for production
**Time Estimate:** 2-3 hours
**Cost Impact:** +$2/month
**Risk Level:** Low

**Objectives:**
- Production-grade backup solution
- Point-in-time recovery capability
- Automated daily/hourly backups
- S3 lifecycle policies for cost optimization

**Tasks:**
1. Create S3 bucket: `project-chronos-backups` (ca-central-1)
2. Configure S3 lifecycle policies (Standard → Glacier → Deep Archive)
3. Install pgBackRest on Lightsail instance
4. Configure PostgreSQL for WAL archiving
5. Configure pgBackRest with S3 backend
6. Execute first full backup
7. Test point-in-time recovery
8. Set up automated backup schedule (daily full, hourly differential)
9. Create backup/restore runbook

**Acceptance Criteria:**
- ✅ S3 bucket created with proper IAM policies
- ✅ pgBackRest installed and configured
- ✅ WAL archiving enabled and working
- ✅ First full backup completed successfully
- ✅ Point-in-time recovery tested and verified
- ✅ Automated backup schedule operational
- ✅ Backup retention: 4 full, 4 differential
- ✅ Encryption: AES-256-CBC enabled
- ✅ RPO: < 15 minutes
- ✅ RTO: < 1 hour

**Deliverables:**
- S3 bucket with lifecycle policies
- pgBackRest configuration files
- Backup/restore runbook
- PR to develop with documentation

---

### Phase 2: CHRONOS-216 - Security Hardening ⭐ HIGH PRIORITY
**Priority:** Essential before production
**Time Estimate:** 1-2 hours
**Cost Impact:** $0
**Risk Level:** Low

**Objectives:**
- Production security best practices
- SSL/TLS encryption
- Hardened SSH access
- Firewall configuration
- Intrusion prevention

**Tasks:**
1. Configure UFW firewall (SSH, PostgreSQL, HTTPS only)
2. Install and configure Fail2ban
3. Disable root SSH login
4. Set up Let's Encrypt SSL certificates (automatonicai.com)
5. Enable PostgreSQL SSL connections
6. Configure automatic security updates
7. Security audit checklist
8. Document access control policies

**Acceptance Criteria:**
- ✅ UFW firewall configured (ports: 22, 5432, 443)
- ✅ SSL/TLS certificates installed and auto-renewing
- ✅ PostgreSQL SSL enabled with certificates
- ✅ SSH: key-only authentication (passwords disabled)
- ✅ Root SSH login disabled
- ✅ Fail2ban active and configured
- ✅ Security audit passed
- ✅ Access control lists documented

**Deliverables:**
- UFW firewall rules
- Let's Encrypt certificates
- PostgreSQL SSL configuration
- Security hardening runbook
- PR to develop with documentation

---

### Phase 3: CHRONOS-217 - CloudWatch Monitoring
**Priority:** Recommended for production
**Time Estimate:** 1 hour
**Cost Impact:** $0 (free tier)
**Risk Level:** Very Low

**Objectives:**
- Proactive monitoring
- Automated alerting
- Performance metrics
- Cost tracking

**Tasks:**
1. Set up CloudWatch alarms for disk space (>80% alert)
2. Set up alarms for CPU utilization (>80% alert)
3. Set up alarms for memory usage (>80% alert)
4. Configure SNS topic for email notifications
5. Subscribe email to SNS topic
6. Test alert delivery
7. Create monitoring dashboard (optional)
8. Document alarm thresholds

**Acceptance Criteria:**
- ✅ Disk space alarm configured and tested
- ✅ CPU utilization alarm configured and tested
- ✅ Memory usage alarm configured and tested
- ✅ SNS email notifications working
- ✅ All alarms tested and verified
- ✅ Monitoring documentation created

**Deliverables:**
- CloudWatch alarms configured
- SNS email notifications active
- Monitoring runbook
- PR to develop with documentation

---

### Phase 4: CHRONOS-218 - Disaster Recovery Test
**Priority:** Validation of backup strategy
**Time Estimate:** 30-45 minutes
**Cost Impact:** $0
**Risk Level:** Low (testing only)
**Dependencies:** Phase 1 (CHRONOS-214) must be complete

**Objectives:**
- Verify backup integrity
- Validate restore procedures
- Measure recovery time (RTO)
- Document recovery process

**Tasks:**
1. Create test database with sample data
2. Take baseline backup with pgBackRest
3. Simulate database corruption/deletion
4. Restore from pgBackRest backup
5. Verify data integrity post-restore
6. Measure and document recovery time
7. Test point-in-time recovery (PITR)
8. Update disaster recovery runbook

**Acceptance Criteria:**
- ✅ Full backup/restore cycle successful
- ✅ Point-in-time recovery tested and verified
- ✅ Data integrity confirmed post-restore
- ✅ RTO measured and documented (< 1 hour)
- ✅ RPO verified (< 15 minutes)
- ✅ Disaster recovery runbook created
- ✅ Recovery procedures documented step-by-step

**Deliverables:**
- Disaster recovery test results
- RTO/RPO measurements
- Disaster recovery runbook
- PR to develop with documentation

---

### Phase 5: CHRONOS-215 - Deploy App + Nginx ⏸️ DEFERRED
**Priority:** Deferred until application ready
**Time Estimate:** TBD
**Cost Impact:** $0
**Status:** Waiting for application development

**Why Deferred:**
- No application container ready for deployment
- Infrastructure must be complete first
- Nginx configuration depends on application architecture

**Prerequisites for Starting:**
- Application Docker image built
- Environment variables defined
- Database schema finalized
- API endpoints documented

**Will Include:**
- Nginx reverse proxy configuration
- Docker Compose stack (app + nginx + database)
- Application deployment
- Health check endpoints
- Logging configuration

---

## 🔧 Technical Specifications

### Backup Strategy (Phase 1 - Option B)
```yaml
Schedule:
  Full Backup: Daily at 02:00 UTC
  Differential Backup: Hourly (every hour)

Retention:
  Full Backups: 4 (last 4 days)
  Differential Backups: 4 (last 4 hours per full backup)

Storage Classes:
  0-30 days: S3 Standard
  31-90 days: S3 Glacier Instant Retrieval
  91-365 days: S3 Glacier Deep Archive
  >365 days: Deleted

Encryption:
  Type: AES-256-CBC
  Key Management: AWS S3 server-side encryption

Recovery Objectives:
  RPO (Recovery Point Objective): < 15 minutes
  RTO (Recovery Time Objective): < 1 hour
```

### Domain Configuration (Phase 2)
```yaml
Domain: automatonicai.com
DNS Provider: BlueHost (currently)
Email: Google Workspace (configured)

DNS Records (Already in AWS):
  - MX records → Google Workspace
  - (Future) A record → Lightsail IP (16.52.210.100)
  - (Future) CNAME www → automatonicai.com

SSL Certificates:
  Provider: Let's Encrypt (free)
  Auto-renewal: Yes (Certbot)
  Wildcard: Optional (*.automatonicai.com)
```

**Note on Route 53:**
- **Current Setup:** Domain registered with BlueHost, DNS managed there
- **Route 53 Alternative:** You don't need Route 53 if BlueHost DNS works
- **Cost Savings:** $0.50/month by staying with BlueHost DNS
- **Recommendation:** Keep BlueHost DNS until you need advanced features

### Monitoring Thresholds (Phase 3)
```yaml
CloudWatch Alarms:
  Disk Space:
    Metric: Disk usage percentage
    Threshold: > 80%
    Evaluation: 2 consecutive periods (10 minutes)
    Action: SNS email notification

  CPU Utilization:
    Metric: CPU percentage
    Threshold: > 80%
    Evaluation: 3 consecutive periods (15 minutes)
    Action: SNS email notification

  Memory Usage:
    Metric: Memory percentage
    Threshold: > 80%
    Evaluation: 3 consecutive periods (15 minutes)
    Action: SNS email notification

Email Notifications:
  Service: AWS SNS
  Endpoint: [User email - to be configured]
  Format: JSON with alarm details
```

---

## 📋 Workflow Integration

### Per-Phase Workflow
Each phase follows this pattern:

1. **Start Phase**
   - Create Jira ticket (if not exists)
   - Update ticket to "In Progress"
   - Create feature branch: `feat/CHRONOS-XXX-description`

2. **Execute Work**
   - Follow phase task list
   - Track progress with TodoWrite tool
   - Document all configuration
   - Test thoroughly

3. **Documentation**
   - Create permanent guidance document in `docs/`
   - Add to `.confluence-mapping.json`
   - Include runbooks for operational tasks

4. **Complete Phase**
   - Commit all changes
   - Create PR to develop
   - Merge PR
   - Update Jira ticket to "Done"
   - Sync docs to Confluence

5. **Between Phases**
   - Return to develop branch
   - Verify all changes merged
   - Review sprint progress
   - Plan next phase

### Documentation Standards
All phase documentation must include:
- **Overview:** What was built and why
- **Prerequisites:** What's needed before starting
- **Step-by-Step Guide:** Detailed instructions
- **Configuration Files:** All configs documented
- **Testing Procedures:** How to verify it works
- **Troubleshooting:** Common issues and solutions
- **References:** Links to official docs, ADRs, etc.

---

## 🎯 Success Criteria

### Sprint 7 Complete When:
- ✅ All Phase 1-4 tickets closed
- ✅ Production database infrastructure operational
- ✅ Automated backups running successfully
- ✅ Security hardening complete
- ✅ Monitoring and alerting active
- ✅ Disaster recovery tested and verified
- ✅ All documentation synced to Confluence
- ✅ Total cost under budget ($14 vs $25)

### Production Readiness Checklist:
- [ ] Database running with all extensions
- [ ] Automated backups (daily full, hourly differential)
- [ ] Point-in-time recovery tested
- [ ] SSL/TLS encryption enabled
- [ ] Firewall configured and hardened
- [ ] SSH access secured (key-only)
- [ ] Monitoring alarms configured
- [ ] Email alerts working
- [ ] Disaster recovery runbook created
- [ ] All operations documented

---

## 📚 Related Documentation

### Architecture Decision Records (ADRs)
- ADR-012: Database Backup Strategy
- ADR-011: Documentation SSOT Strategy
- ADR-004: Git Workflow and Branching Model

### Runbooks (To Be Created)
- `docs/3_runbooks/pgbackrest_backup_restore.md` (Phase 1)
- `docs/3_runbooks/security_hardening.md` (Phase 2)
- `docs/3_runbooks/cloudwatch_monitoring.md` (Phase 3)
- `docs/3_runbooks/disaster_recovery.md` (Phase 4)

### Session Notes
- `docs/session_notes/2025-11-27_AWS_CLI_SSO_Setup.md`
- `docs/session_notes/2025-11-27_CHRONOS-213_Lightsail_Setup_COMPLETE.md`
- `docs/session_notes/2025-11-27_SESSION_SUMMARY.md`

### Confluence Pages
- Sprint 7 Planning: https://automatonicai.atlassian.net/wiki/spaces/PC/pages/6586374
- AWS CLI Setup: https://automatonicai.atlassian.net/wiki/spaces/PC/pages/7045123
- Lightsail Setup: https://automatonicai.atlassian.net/wiki/spaces/PC/pages/7045146

---

## 🚀 Next Steps

**Immediate:** Start Phase 1 (CHRONOS-214 - pgBackRest + S3 Backups)

**Command to begin:**
```bash
git checkout develop
git pull origin develop
git checkout -b feat/CHRONOS-214-pgbackrest-s3
```

---

**🤖 Generated with Claude Code**
**Sprint:** Sprint 7 - AWS Infrastructure
**Status:** In Progress (27% complete)
**Target Completion:** 86% (19/22 story points)
