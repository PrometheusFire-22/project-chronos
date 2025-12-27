# TwentyCRM Post-Installation Guide

**Status**: ✅ Deployed
**Environment**: Production (Lightsail VM)
**URL**: https://crm.automatonicai.com
**Installation Date**: 2025-12-27

---

## Table of Contents

1. [System Overview](#system-overview)
2. [Database Architecture](#database-architecture)
3. [Configuration](#configuration)
4. [Admin Access](#admin-access)
5. [Maintenance Procedures](#maintenance-procedures)
6. [Monitoring](#monitoring)
7. [Backup & Recovery](#backup--recovery)
8. [Troubleshooting](#troubleshooting)

---

## System Overview

### Deployed Components

```
Lightsail VM (16.52.210.100)
├── Instance: chronos-prod-medium
├── Plan: Medium ($20/month)
├── Resources: 4GB RAM, 2 CPU cores, 80GB storage
├── Nginx (Port 443)
│   ├── admin.automatonicai.com → Directus (Port 8055)
│   ├── crm.automatonicai.com → TwentyCRM (Port 3020)
│   └── automatonicai.com → Cloudflare Pages
├── Docker Services
│   ├── chronos-db (PostgreSQL 16.4 + TimescaleDB)
│   ├── chronos-directus (Directus CMS)
│   ├── twenty (TwentyCRM)
│   └── twenty-redis (Redis 7)
└── SSL Certificates (Let's Encrypt)
    ├── admin.automatonicai.com
    └── crm.automatonicai.com
```

**Note**: Originally deployed on Small plan (2GB RAM) but upgraded to Medium (4GB RAM) on 2025-12-27 after resource exhaustion incident. See [ADR-008](../01-ADRS/adr-008-twentycrm-schema-architecture.md) for details.

### Service Details

| Service | Container | Port | Status |
|---------|-----------|------|--------|
| PostgreSQL | chronos-db | 5432 | Running |
| Directus | chronos-directus | 8055 | Running |
| TwentyCRM | twenty | 3020 | Running |
| Redis | twenty-redis | 6379 | Running |

---

## Database Architecture

### Schema Isolation

TwentyCRM uses a **multi-schema approach** within the existing `chronos` database:

```
chronos (database)
├── public (schema)              # Directus + App tables
├── analytics (schema)           # Analytics data
├── economic_graph (schema)      # Economic data
├── timeseries (schema)          # Time-series data
├── core (schema)                # TwentyCRM main tables ← NEW
├── metadata (schema)            # TwentyCRM metadata ← NEW
└── twenty (schema)              # Reserved for future use
```

### Database User

- **Username**: `twenty_user`
- **Password**: Stored in KeePassXC (search for "TwentyCRM")
- **Privileges**: SUPERUSER (required for extensions)
- **Connection**: Via `timescaledb` Docker network

### Connection String

```bash
postgresql://twenty_user:PASSWORD@timescaledb:5432/chronos
```

**Note**: No `?schema=twenty` parameter - TwentyCRM manages schemas internally.

---

## Configuration

### Environment Variables

All sensitive configuration is stored in `/home/ubuntu/chronos-db/docker-compose.yml`:

```yaml
environment:
  PG_DATABASE_URL: postgresql://twenty_user:***@timescaledb:5432/chronos
  SERVER_URL: https://crm.automatonicai.com
  FRONT_BASE_URL: https://crm.automatonicai.com
  ACCESS_TOKEN_SECRET: ***
  REFRESH_TOKEN_SECRET: ***
  LOGIN_TOKEN_SECRET: ***
  FILE_TOKEN_SECRET: ***
  APP_SECRET: ***
  REDIS_URL: redis://redis:6379
  STORAGE_TYPE: local
  STORAGE_LOCAL_PATH: /app/storage
  EMAIL_FROM_ADDRESS: crm@automatonicai.com
  EMAIL_FROM_NAME: Chronos CRM
```

### Secrets Management

**All secrets are stored in KeePassXC**:

1. `ACCESS_TOKEN_SECRET`
2. `REFRESH_TOKEN_SECRET`
3. `LOGIN_TOKEN_SECRET`
4. `FILE_TOKEN_SECRET`
5. `APP_SECRET`
6. Database password

**Backup location**: `/home/ubuntu/chronos-db/docker-compose.yml.backup`

---

## Admin Access

### First-Time Setup

1. **Visit**: https://crm.automatonicai.com
2. **Create admin account**:
   - Email: `geoff@automatonicai.com`
   - Password: Set strong password (store in KeePassXC)
   - Workspace: "Automatonic AI"

### User Management

- **Add users**: Settings → Team → Invite
- **Roles**: Admin, Member, Viewer
- **SSO**: Not configured (future enhancement)

---

## Maintenance Procedures

### Update TwentyCRM

```bash
# SSH into Lightsail VM
ssh -i ~/.ssh/aws-lightsail/chronos-prod-db ubuntu@16.52.210.100

# Navigate to project directory
cd /home/ubuntu/chronos-db

# Pull latest image
docker compose pull twenty

# Recreate container with new image
docker compose up -d twenty

# Verify update
docker logs twenty --tail 50
```

### Restart Services

```bash
# Restart TwentyCRM only
docker compose restart twenty

# Restart all services
docker compose restart

# Restart specific service
docker compose restart redis
```

### Check Service Status

```bash
# View all containers
docker ps

# Check TwentyCRM logs
docker logs twenty --tail 100 --follow

# Check Redis logs
docker logs twenty-redis --tail 50

# Check container resource usage
docker stats twenty
```

---

## Monitoring

### Health Checks

```bash
# Check if TwentyCRM is responding
curl -s -o /dev/null -w "%{http_code}" http://localhost:3020
# Expected: 200

# Check public HTTPS access
curl -s -o /dev/null -w "%{http_code}" https://crm.automatonicai.com
# Expected: 200

# Check Redis connection
docker exec twenty-redis redis-cli ping
# Expected: PONG
```

### Log Locations

```bash
# TwentyCRM application logs
docker logs twenty

# Nginx access logs
tail -f /var/log/nginx/twenty_access.log

# Nginx error logs
tail -f /var/log/nginx/twenty_error.log

# PostgreSQL logs (if needed)
docker logs chronos-db
```

### Resource Usage

```bash
# Disk usage
df -h /var/lib/docker/volumes/chronos-db_twenty_*

# Memory usage
docker stats twenty --no-stream

# Database size
docker exec chronos-db psql -U chronos -d chronos -c \
  "SELECT pg_size_pretty(pg_database_size('chronos'));"
```

---

## Backup & Recovery

### Database Backup

**Automated backups** (recommended to add to cron):

```bash
#!/bin/bash
# Backup TwentyCRM schemas only
docker exec chronos-db pg_dump -U chronos -d chronos \
  -n core -n metadata \
  > /backup/twentycrm_$(date +%Y%m%d_%H%M%S).sql
```

**Full database backup** (includes all data):

```bash
# Backup entire chronos database
docker exec chronos-db pg_dump -U chronos -d chronos \
  > /backup/chronos_full_$(date +%Y%m%d_%H%M%S).sql
```

### Volume Backup

```bash
# Backup TwentyCRM storage volumes
docker run --rm \
  -v chronos-db_twenty_storage:/source \
  -v /backup:/backup \
  alpine tar czf /backup/twenty_storage_$(date +%Y%m%d).tar.gz -C /source .
```

### Restore from Backup

```bash
# Restore database
docker exec -i chronos-db psql -U chronos -d chronos \
  < /backup/twentycrm_20251227_120000.sql

# Restart TwentyCRM
docker compose restart twenty
```

### Disaster Recovery

1. **VM failure**: Restore from Lightsail snapshot
2. **Database corruption**: Restore from pg_dump backup
3. **Docker volume loss**: Restore from volume backup
4. **Configuration loss**: Restore docker-compose.yml.backup

---

## Troubleshooting

### Container Won't Start

**Symptom**: `docker ps` doesn't show `twenty` container

**Diagnosis**:
```bash
# Check logs for errors
docker logs twenty --tail 100

# Common errors:
# - "APP_SECRET is not set" → Add APP_SECRET to docker-compose.yml
# - "REDIS_URL is not set" → Verify Redis container is running
# - "Permission denied for database" → Check PostgreSQL privileges
```

**Solution**:
```bash
# Verify all required services are running
docker ps | grep -E "chronos-db|twenty-redis"

# Recreate container
docker compose up -d twenty
```

### Can't Access via HTTPS

**Symptom**: Browser shows "Connection refused" or SSL error

**Diagnosis**:
```bash
# Check if nginx is running
sudo systemctl status nginx

# Test nginx configuration
sudo nginx -t

# Check SSL certificate
sudo certbot certificates | grep crm.automatonicai.com

# Check if port 3020 is listening
sudo netstat -tlnp | grep 3020
```

**Solution**:
```bash
# Reload nginx configuration
sudo systemctl reload nginx

# Renew SSL certificate if expired
sudo certbot renew

# Restart TwentyCRM
docker compose restart twenty
```

### Database Connection Errors

**Symptom**: Logs show "relation does not exist" or "permission denied"

**Diagnosis**:
```bash
# Check database schemas
docker exec chronos-db psql -U chronos -d chronos -c '\dn'

# Check user permissions
docker exec chronos-db psql -U chronos -d chronos -c '\du twenty_user'

# Test connection from container
docker exec twenty env | grep PG_DATABASE_URL
```

**Solution**:
```bash
# Re-grant permissions to twenty_user
docker exec chronos-db psql -U chronos -d chronos <<EOF
GRANT CREATE ON DATABASE chronos TO twenty_user;
GRANT ALL ON SCHEMA public TO twenty_user;
ALTER USER twenty_user WITH SUPERUSER;
EOF

# Restart TwentyCRM
docker compose restart twenty
```

### Redis Connection Issues

**Symptom**: Logs show "redis cache storage requires REDIS_URL"

**Diagnosis**:
```bash
# Check if Redis is running
docker ps | grep redis

# Test Redis connection
docker exec twenty-redis redis-cli ping
```

**Solution**:
```bash
# Start Redis if not running
docker compose up -d redis

# Verify REDIS_URL in docker-compose.yml
docker exec twenty env | grep REDIS_URL

# Restart TwentyCRM
docker compose restart twenty
```

### Slow Performance

**Symptom**: UI is slow or unresponsive

**Diagnosis**:
```bash
# Check container resource usage
docker stats twenty --no-stream

# Check database connections
docker exec chronos-db psql -U chronos -d chronos -c \
  "SELECT count(*) FROM pg_stat_activity WHERE datname='chronos';"

# Check Redis memory usage
docker exec twenty-redis redis-cli INFO memory
```

**Solution**:
```bash
# Clear Redis cache
docker exec twenty-redis redis-cli FLUSHALL

# Restart TwentyCRM
docker compose restart twenty

# If still slow, consider increasing VM resources
```

### Data Not Saving

**Symptom**: Changes don't persist after refresh

**Diagnosis**:
```bash
# Check volume mounts
docker inspect twenty | grep -A 10 Mounts

# Check disk space
df -h

# Check database logs
docker logs chronos-db --tail 100
```

**Solution**:
```bash
# Verify volumes exist
docker volume ls | grep twenty

# Recreate volumes if needed (DESTRUCTIVE)
docker compose down
docker volume rm chronos-db_twenty_storage
docker compose up -d
```

### VM Completely Unresponsive / 522 Errors

**Symptom**: Server not responding, 100% packet loss, 522 Cloudflare errors

**Cause**: Resource exhaustion (OOM - Out of Memory)

**Diagnosis**:
```bash
# Check VM status via AWS CLI
aws lightsail get-instance-state \
  --instance-name chronos-prod-medium \
  --region ca-central-1 \
  --profile AdministratorAccess-314758835721

# If running, try to SSH and check memory
ssh -i ~/.ssh/aws-lightsail/chronos-prod-db ubuntu@16.52.210.100 "free -h"
```

**Immediate Recovery**:
```bash
# Reboot the instance
aws lightsail reboot-instance \
  --instance-name chronos-prod-medium \
  --region ca-central-1 \
  --profile AdministratorAccess-314758835721

# Wait 1-2 minutes for boot
# Verify services are running
ssh -i ~/.ssh/aws-lightsail/chronos-prod-db ubuntu@16.52.210.100 "docker ps"
```

**Long-term Solution**: If this happens repeatedly, upgrade to larger instance:
- Current: Medium (4GB RAM) - $20/month
- Next: Large (8GB RAM) - $44/month (only if needed)

**Data Safety**: PostgreSQL writes to disk continuously. Reboots do not cause data loss.

---

## Common Operations

### View Active Users

```bash
# Connect to database
docker exec -it chronos-db psql -U chronos -d chronos

# Query workspace users (adjust schema if needed)
SELECT * FROM core.user;
```

### Clear Cache

```bash
# Clear Redis cache
docker exec twenty-redis redis-cli FLUSHALL

# Restart to clear application cache
docker compose restart twenty
```

### Reset Admin Password

Access the database and update the user record directly, or use TwentyCRM's password reset flow via email.

### Export Data

```bash
# Export all data from core schema
docker exec chronos-db pg_dump -U chronos -d chronos \
  -n core --data-only -t 'core.*' \
  > twentycrm_data_export.sql
```

---

## Security Considerations

1. **Secrets**: Never commit secrets to git - always use KeePassXC
2. **Database user**: Has SUPERUSER privileges (required for extensions)
3. **Network**: TwentyCRM only accessible via nginx proxy (not directly exposed)
4. **SSL**: Auto-renewing Let's Encrypt certificates
5. **Backups**: Implement automated daily backups
6. **Updates**: Monitor TwentyCRM releases for security patches

---

## Future Enhancements

- [ ] Configure email integration (SMTP)
- [ ] Set up automated backups via cron
- [ ] Implement monitoring alerts
- [ ] Configure S3 storage instead of local
- [ ] Add SSO/OAuth integration
- [ ] Set up staging environment

---

## Related Documentation

- [Installation Guide](./twentycrm-installation-guide.md)
- [Deployment Scripts](../../deployment/twentycrm/)
- [CREDENTIALS.md](../../deployment/twentycrm/CREDENTIALS.md)

---

## Support

- **TwentyCRM Docs**: https://twenty.com/developers
- **GitHub Issues**: https://github.com/twentyhq/twenty/issues
- **Discord**: https://twenty.com/discord
