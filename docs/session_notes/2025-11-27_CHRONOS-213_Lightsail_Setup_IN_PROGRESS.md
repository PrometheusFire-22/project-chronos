# CHRONOS-213: AWS Lightsail Setup - IN PROGRESS

**Date:** 2025-11-27
**Status:** 🚧 IN PROGRESS - 40% Complete
**Ticket:** https://automatonicai.atlassian.net/browse/CHRONOS-213
**Branch:** feat/CHRONOS-213-lightsail-setup

---

## ✅ COMPLETED (Steps 1-3)

### 1. SSH Key Pair Created ✅
**Location:** `~/.ssh/aws-lightsail/chronos-prod-db`

```bash
# Private key (KEEP SECURE!)
~/.ssh/aws-lightsail/chronos-prod-db

# Public key
~/.ssh/aws-lightsail/chronos-prod-db.pub

# Key fingerprint
SHA256:iSNj2Om218h4Sri/je6zDFAuDAyMFv3IcgtFZL+wUko
```

**Uploaded to Lightsail:** ✅ (key-pair-name: chronos-prod-db)

---

### 2. Lightsail Instance Provisioned ✅

**Instance Details:**
- **Name:** `chronos-production-database`
- **Region:** ca-central-1a (Montreal, Canada) 🇨🇦
- **Bundle:** small_3_0
  - RAM: 2GB
  - vCPU: 2
  - Storage: 60GB SSD
  - Transfer: 3TB/month
- **Cost:** $12/month (saved $8 from $20 budget!)
- **OS:** Ubuntu 22.04 LTS
- **Status:** RUNNING ✅

**Network:**
- **Static IP:** `16.52.210.100` ✅
- **Private IP:** `172.26.14.200`
- **SSH Port:** 22 (default)

---

### 3. Jira & Git ✅
- **Jira CHRONOS-213:** Updated to "In Progress"
- **Feature Branch:** `feat/CHRONOS-213-lightsail-setup`
- **Region Updated:** Changed from us-east-1 to ca-central-1

---

## 🚧 PENDING (Steps 4-10)

### 4. Configure Firewall Rules ⏳
**Need to open:**
- SSH (22) - Already open
- PostgreSQL (5432) - **NEED TO ADD**
- HTTPS (443) - **NEED TO ADD** (future)

**Command to run:**
```bash
# Open PostgreSQL port
aws lightsail open-instance-public-ports \
  --region ca-central-1 \
  --instance-name chronos-production-database \
  --port-info fromPort=5432,toPort=5432,protocol=TCP

# Open HTTPS (optional, for future web interface)
aws lightsail open-instance-public-ports \
  --region ca-central-1 \
  --instance-name chronos-production-database \
  --port-info fromPort=443,toPort=443,protocol=TCP
```

---

### 5. SSH into Instance and Install Docker ⏳

**SSH Command:**
```bash
ssh -i ~/.ssh/aws-lightsail/chronos-prod-db ubuntu@16.52.210.100
```

**Installation Script (run on instance):**
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Add ubuntu user to docker group
sudo usermod -aG docker ubuntu

# Install Docker Compose
sudo apt install docker-compose -y

# Verify installation
docker --version
docker-compose --version

# Enable Docker to start on boot
sudo systemctl enable docker
```

---

### 6. Deploy PostgreSQL Container ⏳

**Steps:**
1. Create project directory on instance:
```bash
mkdir -p ~/chronos-db
cd ~/chronos-db
```

2. Copy docker-compose.yml and Dockerfile.timescaledb from local:
```bash
# From local machine:
scp -i ~/.ssh/aws-lightsail/chronos-prod-db \
  docker-compose.yml \
  ubuntu@16.52.210.100:~/chronos-db/

scp -i ~/.ssh/aws-lightsail/chronos-prod-db \
  Dockerfile.timescaledb \
  ubuntu@16.52.210.100:~/chronos-db/

scp -r -i ~/.ssh/aws-lightsail/chronos-prod-db \
  database/ \
  ubuntu@16.52.210.100:~/chronos-db/
```

3. Create .env file on instance:
```bash
# On instance:
cat > ~/chronos-db/.env << 'EOF'
POSTGRES_USER=chronos
POSTGRES_PASSWORD=[GENERATE_SECURE_PASSWORD]
POSTGRES_DB=chronos
POSTGRES_HOST=timescaledb
POSTGRES_PORT=5432
EOF
```

4. Build and start container:
```bash
cd ~/chronos-db
docker-compose up --build -d
```

---

### 7. Verify Extensions ⏳

**Connect and verify:**
```bash
docker exec -it chronos-db psql -U chronos -d chronos

# Run verification queries:
SHOW shared_preload_libraries;
-- Expected: timescaledb,pg_stat_statements

SELECT extname, extversion FROM pg_extension WHERE extname IN ('timescaledb', 'postgis', 'vector', 'age');
-- Expected: All 4 extensions listed

\q
```

---

### 8. Test Connectivity from Local Machine ⏳

**From your local machine:**
```bash
psql postgresql://chronos:[PASSWORD]@16.52.210.100:5432/chronos
```

---

### 9. Configure Backups (Optional - can defer to CHRONOS-214) ⏳

```bash
# Create backup script on instance
cat > ~/backup.sh << 'EOF'
#!/bin/bash
docker exec chronos-db pg_dump -U chronos chronos | gzip > /home/ubuntu/backups/chronos_$(date +%Y%m%d_%H%M%S).sql.gz
EOF

chmod +x ~/backup.sh

# Test backup
mkdir -p ~/backups
./backup.sh
```

---

### 10. Documentation & Completion ⏳

- [ ] Create comprehensive Lightsail setup guide
- [ ] Document SSH access, firewall rules, Docker setup
- [ ] Create Confluence page with all configuration
- [ ] Update CHRONOS-213 with final details
- [ ] Commit changes (if any local config files created)
- [ ] Create PR
- [ ] Update CHRONOS-213 to "Done"

---

## 📋 Quick Reference Commands

### SSH Access
```bash
ssh -i ~/.ssh/aws-lightsail/chronos-prod-db ubuntu@16.52.210.100
```

### Check Instance Status
```bash
aws lightsail get-instance --region ca-central-1 --instance-name chronos-production-database
```

### Check Static IP
```bash
aws lightsail get-static-ip --region ca-central-1 --static-ip-name chronos-prod-db-static-ip
```

### View Instance Firewall
```bash
aws lightsail get-instance-port-states --region ca-central-1 --instance-name chronos-production-database
```

### Stop Instance (to save costs during testing)
```bash
aws lightsail stop-instance --region ca-central-1 --instance-name chronos-production-database
```

### Start Instance
```bash
aws lightsail start-instance --region ca-central-1 --instance-name chronos-production-database
```

### Delete Instance (if needed to start over)
```bash
# WARNING: This deletes the instance permanently!
aws lightsail delete-instance --region ca-central-1 --instance-name chronos-production-database
```

---

## 🔐 Security Notes

### SSH Key Security
- **Private key location:** `~/.ssh/aws-lightsail/chronos-prod-db`
- **Permissions:** Should be 600 (read/write owner only)
- **NEVER commit to git!** Already in `.gitignore`

### Database Credentials
- **Username:** chronos
- **Password:** [TO BE GENERATED - use strong password generator]
- **Store in:** Local `.env` file (gitignored) + Password manager

### Firewall Best Practices
- Only open PostgreSQL (5432) to **your local IP** if possible
- Use SSH tunneling for database access instead of opening 5432 publicly
- Enable AWS CloudWatch monitoring

---

## 💰 Cost Tracking

| Resource | Monthly Cost | Status |
|----------|--------------|--------|
| Lightsail instance (small_3_0) | $12.00 | ✅ Active |
| Static IP | $0.00 | ✅ Attached (free when attached) |
| **Total** | **$12.00** | Under budget! |

**Budget:** $25/month allocated
**Saved:** $13/month

---

## 🔗 Related Resources

- **Jira Ticket:** https://automatonicai.atlassian.net/browse/CHRONOS-213
- **Sprint 7 Planning:** https://automatonicai.atlassian.net/wiki/spaces/PC/pages/6586374
- **AWS CLI Setup (CHRONOS-219):** https://automatonicai.atlassian.net/wiki/spaces/PC/pages/7045123

---

## 🚀 Next Session: Resume Here

**Steps to complete CHRONOS-213:**

1. **Configure firewall** (2 minutes)
2. **SSH into instance** (1 minute)
3. **Install Docker** (5 minutes)
4. **Deploy PostgreSQL container** (10 minutes)
5. **Verify extensions** (2 minutes)
6. **Test connectivity** (5 minutes)
7. **Document & close ticket** (10 minutes)

**Total estimated time:** ~35 minutes

**Current Status:** Instance running, static IP assigned, SSH keys ready
**Blockers:** None
**Risk:** Low - straightforward Docker deployment

---

## ⚠️ Important Reminders

1. **Static IP:** `16.52.210.100` - This is your permanent address, save it!
2. **SSH Key:** Located at `~/.ssh/aws-lightsail/chronos-prod-db`
3. **Region:** ca-central-1 (all data stays in Canada 🇨🇦)
4. **Instance Name:** `chronos-production-database`
5. **Bundle:** small_3_0 (2GB RAM, 2 vCPU, 60GB disk)

---

**🤖 Generated with Claude Code (Anthropic)**
**Session:** 2025-11-27
**Progress:** 40% complete
**Ready for:** Next session to complete Docker setup and deployment
