# Security Hardening Phase 2A - Runbook

**Status:** ✅ Complete
**Date Completed:** 2025-12-01
**Jira Ticket:** CHRONOS-238
**Instance:** chronos-production-database (16.52.210.100)
**OS:** Ubuntu 22.04.5 LTS

---

## Overview

This runbook documents the security hardening measures implemented on the AWS Lightsail production database instance. All work was completed via SSH without requiring AWS Console or MFA access.

**Security Objectives Achieved:**
- ✅ Network firewall protection (UFW)
- ✅ Intrusion prevention (Fail2ban)
- ✅ SSH hardening (key-only, no root)
- ✅ Automatic security updates
- ✅ Whitelisted operator IP

---

## 1. UFW Firewall Configuration

### What Was Implemented

**Status:** ✅ Active and enabled on system startup

**Allowed Ports:**
- `22/tcp` - SSH access (critical for management)
- `5432/tcp` - PostgreSQL database
- `80/tcp` - HTTP (for Let's Encrypt certificate renewal)
- `443/tcp` - HTTPS (encrypted web traffic)

**Default Policies:**
- **Incoming:** Deny (whitelist-only approach)
- **Outgoing:** Allow (permits updates, backups to S3)
- **Routed:** Deny

### Verification Commands

```bash
# Check firewall status
sudo ufw status verbose

# List rules in numbered format
sudo ufw status numbered

# Check specific service
sudo ufw status | grep 5432
```

### Expected Output

```
Status: active
Logging: on (low)
Default: deny (incoming), allow (outgoing), deny (routed)

To                         Action      From
--                         ------      ----
22/tcp                     ALLOW IN    Anywhere  # SSH access
5432/tcp                   ALLOW IN    Anywhere  # PostgreSQL database
443/tcp                    ALLOW IN    Anywhere  # HTTPS
80/tcp                     ALLOW IN    Anywhere  # HTTP for cert renewal
```

### How to Modify Rules

```bash
# Add new rule (example: allow port 8080)
sudo ufw allow 8080/tcp comment 'New service'

# Delete rule by number
sudo ufw delete [number]

# Reload firewall
sudo ufw reload
```

### Emergency Disable (if locked out)

**⚠️ Only use via AWS Lightsail console (requires MFA):**
1. Connect via Lightsail browser-based SSH
2. Run: `sudo ufw disable`
3. Troubleshoot issue
4. Re-enable: `sudo ufw enable`

---

## 2. Fail2ban Intrusion Prevention

### What Was Implemented

**Status:** ✅ Active and protecting SSH

**Protected Services:**
- SSH (port 22) - 3 failed attempts in 10 minutes = 1 hour ban

**Configuration File:** `/etc/fail2ban/jail.d/chronos-custom.conf`

**Settings:**
```ini
[DEFAULT]
bantime = 3600        # Ban for 1 hour
maxretry = 5          # 5 failures trigger ban
findtime = 600        # Within 10 minute window
banaction = iptables-multiport

[sshd]
enabled = true
port = 22
logpath = /var/log/auth.log
maxretry = 3          # Stricter for SSH (3 attempts)
findtime = 600
bantime = 3600
```

**Whitelisted IPs:**
- `127.0.0.1/8` (localhost)
- `65.93.136.182` (operator's home IP)
- `::1` (IPv6 localhost)

### Verification Commands

```bash
# Check Fail2ban service status
sudo systemctl status fail2ban

# Check all active jails
sudo fail2ban-client status

# Check SSH jail specifically
sudo fail2ban-client status sshd

# View whitelisted IPs
sudo fail2ban-client get sshd ignoreip

# View currently banned IPs
sudo fail2ban-client status sshd | grep "Banned IP"

# View recent bans in logs
sudo tail -50 /var/log/fail2ban.log
```

### How to Unban an IP

```bash
# Unban specific IP
sudo fail2ban-client set sshd unbanip 1.2.3.4

# Unban all IPs
sudo fail2ban-client unban --all
```

### How to Add IP to Whitelist

```bash
# Edit configuration
sudo nano /etc/fail2ban/jail.d/chronos-custom.conf

# Add IP to ignoreip line (space-separated)
ignoreip = 127.0.0.1/8 ::1 65.93.136.182 [NEW_IP]

# Restart service
sudo systemctl restart fail2ban

# Verify
sudo fail2ban-client get sshd ignoreip
```

---

## 3. SSH Hardening

### What Was Implemented

**Configuration File:** `/etc/ssh/sshd_config`
**Backup Created:** `/etc/ssh/sshd_config.backup`

**Security Changes:**
```
PermitRootLogin no                    # Root cannot SSH in
PasswordAuthentication no             # Key-only authentication
PubkeyAuthentication yes              # SSH keys required
ChallengeResponseAuthentication no    # No interactive auth
```

### Verification Commands

```bash
# Check current SSH settings
grep -E "^(PermitRootLogin|PasswordAuthentication|PubkeyAuthentication)" /etc/ssh/sshd_config

# Test SSH configuration without restarting
sudo sshd -t

# View SSH service status
sudo systemctl status sshd
```

### How to Add New SSH Keys

**On local machine:**
```bash
# Generate new key (if needed)
ssh-keygen -t ed25519 -C "your_email@example.com"

# Copy public key to server
ssh-copy-id -i ~/.ssh/id_ed25519.pub ubuntu@16.52.210.100
```

**On server:**
```bash
# View authorized keys
cat ~/.ssh/authorized_keys

# Manually add key (if ssh-copy-id doesn't work)
echo "ssh-ed25519 AAAAC3... your_email@example.com" >> ~/.ssh/authorized_keys
chmod 600 ~/.ssh/authorized_keys
```

### Emergency Password Access (if locked out)

**⚠️ Requires AWS Lightsail console (MFA needed):**
1. Use Lightsail browser-based SSH (doesn't require key)
2. Temporarily re-enable password auth:
   ```bash
   sudo sed -i 's/PasswordAuthentication no/PasswordAuthentication yes/' /etc/ssh/sshd_config
   sudo systemctl restart sshd
   ```
3. Fix key issue
4. Re-disable password auth:
   ```bash
   sudo sed -i 's/PasswordAuthentication yes/PasswordAuthentication no/' /etc/ssh/sshd_config
   sudo systemctl restart sshd
   ```

---

## 4. Automatic Security Updates

### What Was Implemented

**Package:** `unattended-upgrades`
**Status:** ✅ Enabled and running
**Configuration:** `/etc/apt/apt.conf.d/50unattended-upgrades`

**Update Policy:**
- **Automatic:** Security updates from Ubuntu security repositories
- **Automatic Reboot:** Disabled (manual reboot after kernel updates)
- **Cleanup:** Unused dependencies automatically removed
- **Time:** Updates applied during daily cron (02:00 UTC)

### Verification Commands

```bash
# Check service status
sudo systemctl status unattended-upgrades

# View recent update activity
sudo cat /var/log/unattended-upgrades/unattended-upgrades.log | tail -50

# Check what would be upgraded (dry run)
sudo unattended-upgrade --dry-run --debug

# Check for pending updates
sudo apt list --upgradable
```

### Manual Security Updates

```bash
# Update package lists
sudo apt update

# Apply only security updates
sudo unattended-upgrade

# Apply all updates (if needed)
sudo apt upgrade -y

# Reboot if kernel updated
sudo reboot
```

### Disable Automatic Updates (if needed)

```bash
# Stop service
sudo systemctl stop unattended-upgrades

# Disable on boot
sudo systemctl disable unattended-upgrades

# Re-enable later
sudo systemctl enable unattended-upgrades
sudo systemctl start unattended-upgrades
```

---

### Security Audit Checklist

> [!IMPORTANT]
> A formal audit was conducted on 2025-12-02. See the full report: [Security Audit Report](file:///home/prometheus/coding/finance/project-chronos/docs/3_runbooks/security_audit_report.md)

Use this checklist to verify security hardening is fully functional:

### Network Security
- [x] UFW firewall is active: `sudo ufw status`
- [x] Only ports 22, 80, 443, 5432 are open
- [x] Default incoming policy is deny
- [x] Can SSH from whitelisted IP
- [x] Cannot telnet to closed ports from external IP
- [x] **Policy Documented:** [Access Control Policy](file:///home/prometheus/coding/finance/project-chronos/docs/2_architecture/security/access_control_policy.md)

### Intrusion Prevention
- [x] Fail2ban service is running: `sudo systemctl status fail2ban`
- [x] SSH jail is enabled: `sudo fail2ban-client status sshd`
- [x] Operator IP is whitelisted: `sudo fail2ban-client get sshd ignoreip`
- [x] Test ban: 3 failed SSH attempts from non-whitelisted IP triggers 1-hour ban

### SSH Hardening
- [x] Root login disabled: `grep PermitRootLogin /etc/ssh/sshd_config`
- [x] Password auth disabled: `grep PasswordAuthentication /etc/ssh/sshd_config`
- [x] Can SSH with key: `ssh -i ~/.ssh/aws-lightsail/chronos-prod-db ubuntu@16.52.210.100`
- [x] Cannot SSH with password (should fail)
- [x] Cannot SSH as root (should fail)

### Automatic Updates
- [x] Unattended-upgrades service running: `sudo systemctl status unattended-upgrades`
- [x] Security updates configured: `cat /etc/apt/apt.conf.d/50unattended-upgrades`
- [x] No pending security updates: `sudo apt list --upgradable`

---

## Troubleshooting

### Issue: Locked out of SSH

**Symptoms:** Cannot SSH into instance with key

**Solutions:**
1. **Use Lightsail browser-based SSH** (AWS Console - requires MFA)
2. Check if your IP changed (update Fail2ban whitelist)
3. Check if you're banned: `sudo fail2ban-client status sshd`
4. Unban yourself: `sudo fail2ban-client set sshd unbanip YOUR_IP`

### Issue: UFW blocking legitimate traffic

**Symptoms:** Service cannot be reached externally

**Solutions:**
```bash
# Check current rules
sudo ufw status numbered

# Add rule for new service
sudo ufw allow PORT/tcp comment 'Service name'

# Reload
sudo ufw reload
```

### Issue: Fail2ban not starting

**Symptoms:** `sudo systemctl status fail2ban` shows failed

**Solutions:**
```bash
# Check configuration syntax
sudo fail2ban-client -t

# View detailed logs
sudo journalctl -u fail2ban -n 50

# Common fix: remove invalid jail
sudo nano /etc/fail2ban/jail.d/chronos-custom.conf
sudo systemctl restart fail2ban
```

---

## Phase 2B: Let's Encrypt SSL Configuration

**Status:** ✅ Complete
**Date Completed:** 2025-12-02
**Jira Ticket:** CHRONOS-239

### Let's Encrypt Certificates

**Domains:** automatonicai.com, www.automatonicai.com
**Expiry:** 2026-03-02 (90 days)
**Renewal Method:** Automatic via certbot.timer + Route53 DNS-01 challenge

**Certificate Locations:**
- Full chain: `/etc/letsencrypt/live/automatonicai.com/fullchain.pem`
- Private key: `/etc/letsencrypt/live/automatonicai.com/privkey.pem`
- Certificate: `/etc/letsencrypt/live/automatonicai.com/cert.pem`
- Chain: `/etc/letsencrypt/live/automatonicai.com/chain.pem`

**IAM Credentials for Auto-Renewal:**
- AWS IAM User: `chronos-certbot`
- Policy: `chronos-certbot-route53` (Route53 DNS modification only)
- Stored in: KeePassXC → Production/AWS/chronos-certbot

**Verification Commands:**
```bash
# Check certificate validity
sudo certbot certificates

# View certificate details
openssl x509 -in /etc/letsencrypt/live/automatonicai.com/fullchain.pem -noout -dates -subject

# Test auto-renewal (dry run)
sudo certbot renew --dry-run

# Manual renewal (if needed)
sudo certbot renew --dns-route53
```

### PostgreSQL SSL Configuration

**Status:** ✅ Enabled

**Configuration:**
```ini
ssl = on
ssl_cert_file = 'server.crt'  # Links to fullchain.pem
ssl_key_file = 'server.key'   # Links to privkey.pem
```

**Certificate Files in Container:**
- `/var/lib/postgresql/data/server.crt` → Copy of fullchain.pem
- `/var/lib/postgresql/data/server.key` → Copy of privkey.pem
- Ownership: `postgres:postgres` (UID 70)
- Permissions: `644` (cert), `600` (key)

**Verification Commands:**
```bash
# Check SSL is enabled
docker exec chronos-db psql -U chronos -c "SHOW ssl;"

# Check certificate files
docker exec chronos-db psql -U chronos -c "SHOW ssl_cert_file;"
docker exec chronos-db psql -U chronos -c "SHOW ssl_key_file;"

# Test SSL connection (local)
docker exec chronos-db psql "postgresql://chronos@localhost:5432/chronos?sslmode=require" -c "SELECT version();"
```

**Client Connection String:**
All client applications should use SSL connections:
```
postgresql://chronos:PASSWORD@16.52.210.100:5432/chronos?sslmode=require
```

### Certificate Renewal Process

**Automatic Renewal:**
- Certbot timer runs twice daily
- Uses Route53 DNS-01 challenge (no port 80/443 needed)
- Automatically updates Let's Encrypt certificates
- **Manual step required:** Copy renewed certificates to PostgreSQL container

**Manual Certificate Update (after renewal):**
```bash
# SSH into Lightsail instance
ssh -i ~/.ssh/aws-lightsail/chronos-prod-db ubuntu@16.52.210.100

# Copy renewed certificates
sudo cp /etc/letsencrypt/live/automatonicai.com/fullchain.pem /tmp/server.crt
sudo cp /etc/letsencrypt/live/automatonicai.com/privkey.pem /tmp/server.key
sudo chmod 644 /tmp/server.crt
sudo chmod 600 /tmp/server.key

# Update PostgreSQL container
docker run --rm -v chronos-db_timescale-data:/data -v /tmp:/tmp alpine sh -c "
  cp /tmp/server.crt /data/server.crt
  cp /tmp/server.key /data/server.key
  chmod 600 /data/server.key
  chmod 644 /data/server.crt
  chown 70:70 /data/server.key /data/server.crt
"

# Restart PostgreSQL
docker restart chronos-db

# Verify SSL still works
docker exec chronos-db psql -U chronos -c "SHOW ssl;"

# Clean up
sudo rm /tmp/server.crt /tmp/server.key
```

### Troubleshooting

**Issue: PostgreSQL won't start after enabling SSL**

**Symptoms:** Container in restart loop, logs show "could not load server certificate file"

**Solution:**
```bash
# Disable SSL temporarily
docker run --rm -v chronos-db_timescale-data:/data alpine sh -c "sed -i \"s/ssl = 'on'/ssl = 'off'/g\" /data/postgresql.auto.conf"

# Start container
docker start chronos-db

# Copy certificates (see manual update steps above)

# Re-enable SSL
docker run --rm -v chronos-db_timescale-data:/data alpine sh -c "sed -i \"s/ssl = 'off'/ssl = 'on'/g\" /data/postgresql.auto.conf"

# Restart
docker restart chronos-db
```

**Issue: Certificate renewal fails**

**Symptoms:** Certbot renewal dry-run fails

**Solutions:**
```bash
# Check AWS credentials are valid
aws sts get-caller-identity

# Check Route53 permissions
aws route53 list-hosted-zones

# Manually renew with debug output
sudo certbot renew --dns-route53 --dry-run --debug

# Check certbot logs
sudo tail -100 /var/log/letsencrypt/letsencrypt.log
```

---

## References

- **UFW Documentation:** https://help.ubuntu.com/community/UFW
- **Fail2ban Manual:** https://www.fail2ban.org/wiki/index.php/Main_Page
- **SSH Hardening:** https://www.ssh.com/academy/ssh/sshd_config
- **Ubuntu Security:** https://ubuntu.com/security/certifications

---

## Change Log

| Date | Change | Ticket |
|------|--------|--------|
| 2025-12-01 | Initial security hardening (Phase 2A) completed | CHRONOS-238 |
| 2025-12-01 | UFW firewall configured and enabled | CHRONOS-238 |
| 2025-12-01 | Fail2ban installed and protecting SSH | CHRONOS-238 |
| 2025-12-01 | SSH hardened (key-only, no root) | CHRONOS-238 |
| 2025-12-01 | Automatic security updates enabled | CHRONOS-238 |
| 2025-12-01 | Operator IP (65.93.136.182) whitelisted | CHRONOS-238 |
| 2025-12-02 | Let's Encrypt SSL certificates obtained (Phase 2B) | CHRONOS-239 |
| 2025-12-02 | PostgreSQL SSL/TLS encryption enabled | CHRONOS-239 |
| 2025-12-02 | Certbot auto-renewal configured via Route53 DNS-01 | CHRONOS-239 |

---

**🤖 Generated with Claude Code (Anthropic) & Antigravity (Google Deepmind)**
**Last Updated:** 2025-12-02
**Status:** ✅ Production
