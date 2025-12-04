# Technical Disaster Recovery Runbook

**Status:** 🚧 Draft
**Date Created:** 2025-12-03
**Jira Ticket:** CHRONOS-218
**Scope:** Server & Database Recovery

---

## 🚨 Scenario: Total Server Loss
**Simulation:** The `chronos-production-database` Lightsail instance has been irretrievably corrupted or deleted.
**Goal:** Restore full service on a *new* instance using only external artifacts (Git repo + S3 backups + Secrets).

## 📋 Prerequisites
- [ ] **Git Repository:** Access to `project-chronos` on local machine.
- [ ] **Secrets:** Access to KeePassXC (or environment variables).
- [ ] **AWS Access:** Administrator access to AWS account.
- [ ] **Backups:** Valid `pgbackrest` backups existing in S3 bucket `chronos-db-backups`.

---

## 1. 💥 Simulation (Destruction)
*Warning: This will cause downtime.*

1.  **Stop the Instance:**
    ```bash
    aws lightsail stop-instance --instance-name chronos-production-database
    ```
2.  **Rename Old Instance** (to keep as safety net, or delete if brave):
    ```bash
    aws lightsail update-instance-metadata --instance-name chronos-production-database --parameter-name name --parameter-value chronos-production-database-BROKEN
    ```
    *(Note: Lightsail renaming might not be supported directly via CLI in this way; alternative is to delete or just spin up a new one with a different name temporarily, then swap DNS. For this test, we will provision `chronos-production-database-dr`)*

---

## 2. 🏗️ Provisioning (Recovery)

1.  **Provision Instance:**

    ```bash
    # From local machine
    aws lightsail create-instances \
      --instance-names chronos-production-database-dr \
      --availability-zone ca-central-1a \
      --blueprint-id ubuntu_22_04 \
      --bundle-id small_3_0 \
      --key-pair-name chronos-prod-db \
      --region ca-central-1
    ```

2.  **Wait for Instance:**

    Wait until status is `running` and it has a Public IP.

3.  **Open Ports:**

    ```bash
    aws lightsail open-instance-public-ports --instance-name chronos-production-database-dr --port-info fromPort=5432,toPort=5432,protocol=TCP --region ca-central-1
    aws lightsail open-instance-public-ports --instance-name chronos-production-database-dr --port-info fromPort=80,toPort=80,protocol=TCP --region ca-central-1
    aws lightsail open-instance-public-ports --instance-name chronos-production-database-dr --port-info fromPort=443,toPort=443,protocol=TCP --region ca-central-1
    ```

4.  **Run Setup Script:**

    Transfer and run the setup script to install Docker.

    ```bash
    # Transfer script
    scp -i ~/.ssh/aws-lightsail/chronos-prod-db scripts/ops/setup_dr_node.sh ubuntu@[DR_IP]:~/

    # Run script
    ssh -i ~/.ssh/aws-lightsail/chronos-prod-db ubuntu@[DR_IP] "bash ~/setup_dr_node.sh"
    ```

---

## 3. 🔄 Database Restore
### Prerequisites
- AWS CLI configured with appropriate permissions.
- SSH access to the Lightsail instance.
- `pgbackrest.conf` from the production environment.
- **Critical:** The Docker image used for the database MUST have `pgbackrest` installed to support WAL replay during restore.
1.  **Prepare Configuration:**

    - Retrieve `pgbackrest.conf` from production (or KeePassXC).
    - Save locally as `pgbackrest.conf`.

2.  **Transfer Files:**

    Transfer configuration and project files to the DR instance.

    ```bash
    # Transfer config
    scp -i ~/.ssh/aws-lightsail/chronos-prod-db pgbackrest.conf ubuntu@[DR_IP]:~/

    # Transfer project files
    scp -i ~/.ssh/aws-lightsail/chronos-prod-db docker-compose.yml ubuntu@[DR_IP]:~/chronos-db/
    scp -i ~/.ssh/aws-lightsail/chronos-prod-db Dockerfile.timescaledb ubuntu@[DR_IP]:~/chronos-db/
    scp -r -i ~/.ssh/aws-lightsail/chronos-prod-db database/ ubuntu@[DR_IP]:~/chronos-db/
    ```

3.  **Run Restore Script:**

    Transfer and run the automated restore script.

    ```bash
    # Transfer script
    scp -i ~/.ssh/aws-lightsail/chronos-prod-db scripts/ops/restore_dr_node.sh ubuntu@[DR_IP]:~/

    # Execute restore
    ssh -i ~/.ssh/aws-lightsail/chronos-prod-db ubuntu@[DR_IP] "bash ~/restore_dr_node.sh"
    ```

    *Note: The script will:*
    - Create `.env` with temporary credentials.
    - Build and start the container (to initialize volume).
    - Stop the container.
    - Wipe the data volume.
    - Restore from S3 using pgBackRest.
    - Restart the container.

---

## 4. ✅ Verification

1.  **Check Logs:**

    ```bash
    docker logs chronos-db
    ```

    Look for "database system is ready to accept connections".

2.  **Verify Data:**

    Connect and count rows in a key table.

    ```bash
    docker exec chronos-db psql -U chronos -d chronos -c "SELECT count(*) FROM market_data;"
    ```

3.  **DNS Switchover (If successful):**

    Update the static IP or DNS A-record to point to the new instance.

---

## ↩️ Rollback (If Test Fails)

1.  Start the original `chronos-production-database` instance.
2.  Update DNS/IP back to original.

1.  **Check Logs:**
    ```bash
    docker logs chronos-db
    ```
    Look for "database system is ready to accept connections".

2.  **Verify Data:**
    Connect and count rows in a key table (e.g., `market_data`).
    ```sql
    SELECT count(*) FROM market_data;
    ```

3.  **DNS Switchover (If successful):**
    Update the static IP or DNS A-record to point to the new instance.

---

## ↩️ Rollback (If Test Fails)
1.  Start the original `chronos-production-database` instance.
2.  Update DNS/IP back to original.
