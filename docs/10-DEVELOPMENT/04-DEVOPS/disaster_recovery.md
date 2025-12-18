# Disaster Recovery Plan

**Purpose:** Comprehensive recovery procedures for both operational assets (devices, access) and technical infrastructure (servers, databases).

**Last Updated:** 2025-12-05

---

## 📋 Overview

**Recovery Time Objectives (RTO):**
- **Device Loss:** 2-4 hours
- **Infrastructure Loss:** 1-2 hours
- **Total Catastrophe:** 4-6 hours

**Recovery Point Objective (RPO):**
- **Code:** 0 (Git)
- **Database:** <24 hours (Daily S3 snapshots + WAL archiving)

---

## 🚨 Operational Recovery (Lost Devices)

**Scenario:** Loss of phone (MFA), computer (SSH keys), or both.

### Phase 1: Regain Access (The "Break Glass" Protocol)

**Prerequisites:** Physical "Break Glass Kit" containing:
- Backup codes (Google, AWS, GitHub)
- KeePassXC Master Password (written down)
- USB Drive with `.kdbx` database

#### Step 1: Recover Credential Database
1.  **From USB:** Plug in USB drive.
2.  **From Cloud:** Download `chronos_secrets.kdbx` from Google Drive (using backup codes to login).
3.  **Open Database:** Install KeePassXC and unlock with written master password.

#### Step 2: Restore SSH Keys
1.  **Extract:** In KeePassXC, go to `SSH Keys` entry → Attachments → Save private key.
2.  **Permissions:** `chmod 600 ~/.ssh/id_rsa`
3.  **Test:** `ssh ubuntu@16.52.210.100`

---

## 🛠️ Technical Recovery (Infrastructure Loss)

**Scenario:** Production Lightsail instance is deleted or corrupted.

### Phase 1: Provisioning
1.  **Launch New Instance:** Ubuntu 22.04 LTS (Lightsail).
2.  **Restore Elastic IP:** Remap the static IP to the new instance.
3.  **Open Ports:** 80, 443, 5432 (security group).

### Phase 2: Database Restoration
*See also: `docs/runbooks/pgbackrest_backup_restore.md`*

1.  **Install Docker:** Run `scripts/ops/setup_dr_node.sh`.
2.  **Pull Config:** SCP `pgbackrest.conf` and `docker-compose.yml` to server.
3.  **Run Restore:**
    ```bash
    # Wipe data volume and restore from S3
    docker-compose down -v
    docker-compose run --rm db-restore
    docker-compose up -d
    ```

### Phase 3: Verification
```bash
# Check rows
docker exec chronos-db psql -U chronos -c "SELECT count(*) FROM market_data;"
```

---

## 📦 Break Glass Kit Checklist

**Physical Package (Safe / Off-site):**
- [ ] **Printed Runbook:** This document.
- [ ] **Printed Backup Codes:**
    - Google Workspace (admin@automatonicai.com)
    - AWS Root (axiologycapital@gmail.com)
    - GitHub (PrometheusFire-22)
- [ ] **Master Password:** Written on acid-free paper.
- [ ] **USB Drive:**
    - KeePassXC Database (`.kdbx`)
    - SSH Public/Private Keys (Encrypted)

---

## 🔄 Maintenance Schedule

| Frequency | Task |
|-----------|------|
| **Magnetic** | Update USB Drive with latest `.kdbx` |
| **Quarterly** | Test restore procedure on fresh VM |
| **Yearly** | Rotate Master Password & SSH Keys |

---

## 📚 Related Documentation

- [pgBackRest Backup & Restore](../runbooks/pgbackrest_backup_restore.md)
- [KeePassXC Workflow](../security/keepassxc_workflow.md)
- [Secrets Management](../../guides/organization/keepassxc_organization.md)

**Version:** 2.0.0
**Consolidated from:** disaster_recovery_lost_computer.md, disaster_recovery_technical.md, disaster_recovery_operational.md
