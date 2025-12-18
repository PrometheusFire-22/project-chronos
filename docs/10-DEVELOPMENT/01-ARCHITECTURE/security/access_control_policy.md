# Access Control Policy - Project Chronos

**Effective Date:** 2025-12-02
**Scope:** AWS Lightsail Production Environment (`chronos-production-database`)
**Owner:** DevOps Team

---

## 1. Purpose
This policy defines the authorized access methods, user roles, and network restrictions for the Project Chronos production infrastructure. It serves as the authoritative reference for access control implementation.

---

## 2. Network Access Control (Firewall)

**Policy:** All incoming network traffic is denied by default. Only explicitly required services are allowed.

| Service | Port | Source | Justification |
|---------|------|--------|---------------|
| SSH | 22/tcp | Anywhere (Key-only) | Remote administration |
| HTTP | 80/tcp | Anywhere | Let's Encrypt certificate validation |
| HTTPS | 443/tcp | Anywhere | Encrypted web traffic |
| PostgreSQL | 5432/tcp | Anywhere (SSL Required) | Database access for application/clients |

**Implementation:** `UFW` (Uncomplicated Firewall) on Ubuntu.

---

## 3. System Access Control (SSH)

**Policy:** Direct system access is restricted to authorized administrators using strong authentication.

### 3.1 Authentication Methods
- **Allowed:** SSH Public Key Authentication (`Ed25519` preferred).
- **Prohibited:** Password-based authentication.
- **Prohibited:** Root login via SSH.

### 3.2 User Accounts
- **`ubuntu`:** Default administrative user. Requires `sudo` for privileged operations.
- **`root`:** Direct login disabled. Accessible only via `sudo` from authorized accounts.

### 3.3 Intrusion Prevention
- **Policy:** Repeated failed authentication attempts must result in a temporary ban.
- **Implementation:** `Fail2ban` monitoring `/var/log/auth.log`.
- **Threshold:** 3 failed attempts within 10 minutes triggers a 1-hour ban.
- **Whitelist:** Operator IP (`65.93.136.182`) is exempt from bans.

---

## 4. Database Access Control (PostgreSQL)

**Policy:** Database access is restricted to authenticated users over encrypted channels.

### 4.1 Connection Security
- **Requirement:** All connections from outside the localhost must use SSL/TLS (`sslmode=require`).
- **Implementation:** PostgreSQL configured with Let's Encrypt certificates.

### 4.2 User Roles
- **`postgres`:** Superuser. Only accessible via local socket (peer authentication) or `docker exec`.
- **`chronos`:** Application user. Password authenticated.
- **`chronos_read`:** Read-only user (future).

---

## 5. Secret Management

**Policy:** Secrets (passwords, keys, tokens) must never be stored in plain text in code or version control.

- **Storage:** KeePassXC (`Chronos-Project.kdbx`) is the authorized secure storage.
- **Distribution:** Environment variables (`.env`) for application runtime.
- **Recovery:** Critical keys (e.g., Let's Encrypt account key) must be backed up to KeePassXC.

---

## 6. Policy Enforcement & Audit

- **Enforcement:** Automated configuration management (scripts/runbooks).
- **Audit:** Security configuration is audited at the end of each infrastructure sprint.
- **Review:** This policy is reviewed quarterly or upon significant infrastructure changes.
