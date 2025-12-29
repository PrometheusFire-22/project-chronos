# TwentyCRM Self-Hosted Installation Guide

**Status**: ✅ Completed - 2025-12-27
**Actual Time**: ~2 hours (including troubleshooting)
**Jira Ticket**: [CHRONOS-377](https://automatonicai.atlassian.net/browse/CHRONOS-377)
**Complexity**: ⭐⭐⭐⭐ Medium-High

> **Note**: This guide documents the actual implementation. For post-installation configuration and maintenance, see [twentycrm-post-installation.md](./twentycrm-post-installation.md)

---

## Overview

Install TwentyCRM on the existing Lightsail VM (`admin.automatonicai.com`) to replace HubSpot as internal CRM.

### Why Self-Host vs Cloud?
- ✅ **No recurring costs** (vs $7-15/user/month)
- ✅ **Full control** over data and customization
- ✅ **Leverage existing infrastructure** (PostgreSQL, nginx, SSL)
- ✅ **Run alongside Directus** on same server
- ⚠️ **Trade-off**: Need to maintain and update it yourself

---

## Architecture

```
Deployed Architecture (Lightsail VM: 16.52.210.100):

Internet (Cloudflare CDN)
    ↓
Nginx (Port 443 - SSL)
    ├── admin.automatonicai.com → Directus:8055
    └── crm.automatonicai.com → TwentyCRM:3020
                                    ↓
                            Redis:6379 (Cache)
                                    ↓
                    PostgreSQL:5432 (chronos database)
                    ├── public schema (Directus + App)
                    ├── core schema (TwentyCRM tables)
                    └── metadata schema (TwentyCRM metadata)
```

**Key Implementation Details**:
- **Single Database**: TwentyCRM uses schemas, not a separate database
- **Redis Required**: TwentyCRM needs Redis for caching (not optional)
- **Docker Network**: Services communicate via `chronos-network` bridge
- **Image**: `twentycrm/twenty:latest` (not `twentyhq/twenty`)

---

## Prerequisites Check

Before starting, verify you have:

- [ ] SSH access to Lightsail VM
- [ ] Docker and docker-compose installed
- [ ] PostgreSQL running (for Directus)
- [ ] Nginx configured
- [ ] Cloudflare DNS access
- [ ] Certbot for SSL (or existing wildcard cert)

---

## Step 1: Create PostgreSQL Schema (5 min)

**Why schema instead of separate database?**
- ✅ Same database as Directus and your app (simpler)
- ✅ Single backup (`pg_dump chronos`)
- ✅ Can share data across schemas if needed
- ✅ Less overhead, easier management

SSH into your Lightsail VM:

```bash
ssh ubuntu@admin.automatonicai.com
```

Create a new schema for TwentyCRM in the existing `chronos` database:

```bash
# Connect to PostgreSQL
sudo -u postgres psql -d chronos

# In PostgreSQL shell:
-- Create schema for TwentyCRM
CREATE SCHEMA IF NOT EXISTS twenty;

-- Create user for TwentyCRM (or use existing chronos user)
-- Option A: New dedicated user
CREATE USER twenty_user WITH ENCRYPTED PASSWORD 'GENERATE_STRONG_PASSWORD_HERE';
GRANT USAGE ON SCHEMA twenty TO twenty_user;
GRANT CREATE ON SCHEMA twenty TO twenty_user;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA twenty TO twenty_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA twenty TO twenty_user;

-- Set default privileges for future tables
ALTER DEFAULT PRIVILEGES IN SCHEMA twenty GRANT ALL ON TABLES TO twenty_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA twenty GRANT ALL ON SEQUENCES TO twenty_user;

-- Option B: Use existing chronos user (simpler)
-- GRANT USAGE, CREATE ON SCHEMA twenty TO chronos;

# Verify schema created
\dn

# Exit
\q
```

**Database structure after this step:**
```
chronos (database)
├── public (schema) - Your app + Directus tables
└── twenty (schema) - TwentyCRM tables
```

**Save the password** - you'll need it for environment variables.

---

## Step 2: Create Docker Compose Configuration (15 min)

Create a new directory for TwentyCRM:

```bash
sudo mkdir -p /opt/twenty
cd /opt/twenty
```

Create `docker-compose.yml`:

```yaml
version: '3.8'

services:
  twenty:
    image: twentyhq/twenty:latest
    container_name: twenty
    restart: unless-stopped
    ports:
      - "127.0.0.1:3020:3000"  # Internal only, nginx will proxy
    environment:
      # Database - Using 'twenty' schema in 'chronos' database
      PG_DATABASE_URL: postgresql://twenty_user:YOUR_PASSWORD_HERE@host.docker.internal:5432/chronos?schema=twenty

      # Server
      SERVER_URL: https://crm.automatonicai.com
      FRONT_BASE_URL: https://crm.automatonicai.com

      # Security
      ACCESS_TOKEN_SECRET: GENERATE_RANDOM_STRING_32_CHARS
      REFRESH_TOKEN_SECRET: GENERATE_RANDOM_STRING_32_CHARS
      LOGIN_TOKEN_SECRET: GENERATE_RANDOM_STRING_32_CHARS
      FILE_TOKEN_SECRET: GENERATE_RANDOM_STRING_32_CHARS

      # Storage (local for now, can switch to S3 later)
      STORAGE_TYPE: local
      STORAGE_LOCAL_PATH: /app/storage

      # Email (optional - configure later if needed)
      EMAIL_FROM_ADDRESS: crm@automatonicai.com
      EMAIL_FROM_NAME: Chronos CRM

    volumes:
      - twenty_storage:/app/storage
      - twenty_server_local_maps:/app/server/.local-maps
    networks:
      - twenty_network
    extra_hosts:
      - "host.docker.internal:host-gateway"

volumes:
  twenty_storage:
  twenty_server_local_maps:

networks:
  twenty_network:
    driver: bridge
```

**Generate secrets**:
```bash
# Generate 32-character random strings for secrets
openssl rand -base64 32
openssl rand -base64 32
openssl rand -base64 32
openssl rand -base64 32
```

Replace the placeholders in the docker-compose.yml file.

---

## Step 3: Configure Cloudflare DNS (5 min)

Add a new DNS record in Cloudflare:

**DNS Record**:
- **Type**: A
- **Name**: crm
- **IPv4 address**: [Your Lightsail VM IP]
- **Proxy status**: Proxied (orange cloud)
- **TTL**: Auto

**Verify**:
```bash
dig crm.automatonicai.com +short
# Should return your Lightsail IP
```

---

## Step 4: Configure Nginx Reverse Proxy (10 min)

Create nginx configuration:

```bash
sudo nano /etc/nginx/sites-available/twenty
```

Add this configuration:

```nginx
# TwentyCRM
server {
    listen 80;
    listen [::]:80;
    server_name crm.automatonicai.com;

    # Redirect HTTP to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name crm.automatonicai.com;

    # SSL Configuration (will be added by certbot)
    # ssl_certificate /etc/letsencrypt/live/crm.automatonicai.com/fullchain.pem;
    # ssl_certificate_key /etc/letsencrypt/live/crm.automatonicai.com/privkey.pem;

    # Security headers
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;

    # Proxy to TwentyCRM Docker container
    location / {
        proxy_pass http://127.0.0.1:3020;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        # WebSocket support
        proxy_read_timeout 86400;
    }

    # File uploads
    client_max_body_size 100M;

    # Logging
    access_log /var/log/nginx/twenty_access.log;
    error_log /var/log/nginx/twenty_error.log;
}
```

Enable the site:

```bash
sudo ln -s /etc/nginx/sites-available/twenty /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

---

## Step 5: Get SSL Certificate (5 min)

Use certbot to get SSL certificate:

```bash
sudo certbot --nginx -d crm.automatonicai.com
```

Follow prompts:
1. Enter email if first time
2. Agree to terms
3. Choose redirect option (should already be configured)

**Verify**:
```bash
sudo certbot certificates | grep crm.automatonicai.com
```

---

## Step 6: Start TwentyCRM (10 min)

Start the Docker container:

```bash
cd /opt/twenty
sudo docker-compose up -d
```

**Wait for initialization** (first start takes 2-3 minutes):
```bash
# Watch logs
sudo docker logs -f twenty

# Look for:
# "Server is listening on port 3000"
# "Database migrations completed"
```

**Verify container is running**:
```bash
sudo docker ps | grep twenty
```

---

## Step 7: Initial Setup (10 min)

1. **Visit**: https://crm.automatonicai.com

2. **Create admin account**:
   - First workspace will be created automatically
   - Set admin email: `geoff@automatonicai.com`
   - Set strong password
   - Choose workspace name: "Automatonic AI"

3. **Configure settings**:
   - Upload logo (if desired)
   - Set timezone
   - Configure workspace settings

4. **Test basic functionality**:
   - Create a test contact
   - Create a test company
   - Verify data saves correctly

---

## Maintenance & Updates

### Update TwentyCRM

```bash
cd /opt/twenty
sudo docker-compose pull
sudo docker-compose up -d
```

### Backup Database

```bash
# Automated backup (add to cron)
sudo -u postgres pg_dump twenty > /backup/twenty_$(date +%Y%m%d).sql

# Or use your existing backup system
```

### Monitor Resources

```bash
# Check container stats
docker stats twenty

# Check logs
docker logs twenty --tail 100 --follow
```

---

## Alternative: Try Cloud First

If you want to **evaluate TwentyCRM before self-hosting**:

1. Visit https://twenty.com
2. Sign up for free workspace
3. Test features for a week
4. If you like it, migrate to self-hosted using this guide

**Migration**: Twenty provides export/import tools for moving from cloud to self-hosted.

---

## Troubleshooting

### Container Won't Start

```bash
# Check logs
docker logs twenty

# Common issues:
# - Database connection failed → Check PG_DATABASE_URL
# - Port already in use → Check port 3020 is free
# - Permission denied → Check docker user permissions
```

### Can't Access via Browser

```bash
# Check nginx config
sudo nginx -t

# Check if port 3020 is listening
sudo netstat -tlnp | grep 3020

# Check SSL certificate
sudo certbot certificates
```

### Database Migration Errors

```bash
# Reset database (DESTRUCTIVE - only for fresh installs)
sudo -u postgres psql
DROP DATABASE twenty;
CREATE DATABASE twenty;
GRANT ALL PRIVILEGES ON DATABASE twenty TO twenty_user;
\q

# Restart container
docker-compose restart
```

---

## Cost Analysis

### Self-Hosted (This Guide)
- **Infrastructure**: $0 (using existing Lightsail VM)
- **Storage**: ~1-2GB disk space
- **Memory**: ~512MB RAM
- **Total**: **$0/month** (marginal)

### Twenty Cloud
- **Free tier**: 1 workspace, limited features
- **Paid**: $7-15/user/month
- **Total**: **$7-15/month** minimum

**Savings**: Self-hosting saves $84-180/year even for single user.

---

## Next Steps After Installation

1. **Import contacts** from HubSpot (if any)
2. **Configure integrations** (email, calendar if needed)
3. **Set up custom fields** for your workflow
4. **Train team** on using TwentyCRM
5. **Cancel HubSpot** subscription

---

## Questions Before Installing?

- Do you have access to the Lightsail VM?
- Want me to walk you through it step-by-step?
- Prefer to try cloud version first?

**Ready to start?** We can do this in the next 30-60 minutes!
