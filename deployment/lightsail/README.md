# Lightsail Deployment Configuration

This directory contains the Docker Compose configuration for deploying Chronos services on AWS Lightsail.

## Services

### TimescaleDB
- **Container:** chronos-db
- **Port:** 5432
- **Purpose:** PostgreSQL 16.4 with TimescaleDB, PostGIS, pgvector, Apache AGE extensions

### Directus CMS
- **Container:** chronos-directus
- **Port:** 8055
- **Purpose:** Headless CMS for managing blog posts, documentation, and marketing content
- **Access:** https://admin.automatonicai.com (via Nginx reverse proxy)

## Deployment

### Initial Setup (Completed)

1. SSH into Lightsail VM:
   ```bash
   ssh -i <path-to-key> ubuntu@16.52.210.100
   ```

2. Navigate to deployment directory:
   ```bash
   cd ~/chronos-db
   ```

3. Copy `.env.example` to `.env` and configure:
   ```bash
   cp .env.example .env
   nano .env
   ```

4. Start services:
   ```bash
   docker compose up -d
   ```

5. Verify health:
   ```bash
   docker ps
   curl http://localhost:8055/server/health
   ```

### Environment Variables

Required environment variables are documented in `.env.example`.

**Security Note:** Never commit the actual `.env` file to version control.

### Nginx Reverse Proxy Setup (CHRONOS-351)

The Directus admin UI is exposed publicly via Nginx reverse proxy with SSL/TLS.

#### Prerequisites

- Nginx installed: `sudo apt install nginx`
- Certbot installed: `sudo apt install certbot python3-certbot-nginx`
- DNS A record configured (see DNS Setup below)

#### Nginx Configuration

1. Copy configuration to Nginx sites-available:
   ```bash
   sudo cp ~/chronos-db/nginx/directus.conf /etc/nginx/sites-available/directus
   ```

2. Enable the site:
   ```bash
   sudo ln -s /etc/nginx/sites-available/directus /etc/nginx/sites-enabled/directus
   ```

3. Test configuration:
   ```bash
   sudo nginx -t
   ```

4. Reload Nginx:
   ```bash
   sudo systemctl reload nginx
   ```

#### DNS Setup

Configure DNS A record in Cloudflare Dashboard:

1. Navigate to: https://dash.cloudflare.com
2. Select domain: `automatonicai.com`
3. Go to: DNS → Records
4. Add A record:
   - **Type:** A
   - **Name:** admin
   - **IPv4 address:** 16.52.210.100
   - **Proxy status:** DNS only (gray cloud, not proxied)
   - **TTL:** Auto
5. Save record

**Verify DNS propagation:**
```bash
dig admin.automatonicai.com +short
# Should return: 16.52.210.100
```

#### SSL Certificate Setup

Once DNS is configured and propagated, obtain SSL certificate:

```bash
sudo certbot --nginx -d admin.automatonicai.com
```

Certbot will:
- Automatically verify domain ownership via ACME challenge
- Obtain certificate from Let's Encrypt
- Update Nginx configuration to enable HTTPS
- Configure HTTP → HTTPS redirect

**Test SSL configuration:**
```bash
curl -I https://admin.automatonicai.com
# Should return: HTTP/2 200 (Directus health check)
```

#### SSL Certificate Renewal

Certbot automatically sets up a systemd timer for renewal. Verify:

```bash
sudo systemctl status certbot.timer
```

Manual renewal (if needed):
```bash
sudo certbot renew --dry-run  # Test renewal
sudo certbot renew            # Actual renewal
```

### Accessing Directus

- **Local (VM):** http://localhost:8055
- **Public:** https://admin.automatonicai.com (requires DNS + SSL setup above)
- **Admin Email:** geoff@automatonicai.com
- **Admin Password:** Stored in `.env` file (DIRECTUS_ADMIN_PASSWORD)

### Logs

View Nginx logs:
```bash
sudo tail -f /var/log/nginx/directus_access.log
sudo tail -f /var/log/nginx/directus_error.log
```

View Directus logs:
```bash
docker logs chronos-directus -f
```

View PostgreSQL logs:
```bash
docker logs chronos-db -f
```

## Related Jira Tickets

- **CHRONOS-349:** Directus CMS Integration (Epic)
- **CHRONOS-350:** Install Directus on Lightsail VM ✅
- **CHRONOS-351:** Configure Nginx Reverse Proxy ✅
- **CHRONOS-352:** Configure PostgreSQL Connection ✅ (auto-configured)
- **CHRONOS-353:** Set Up User Roles and Permissions (next)

## Deployment History

- **2025-12-21:** Initial Directus installation (CHRONOS-350)
  - Directus v11.x (latest) deployed
  - Connected to existing PostgreSQL database
  - Admin user created: geoff@automatonicai.com
  - Health check passing: http://localhost:8055/server/health

- **2025-12-21:** Nginx reverse proxy configuration (CHRONOS-351)
  - Nginx configuration created at `/etc/nginx/sites-available/directus`
  - Site enabled and Nginx reloaded successfully
  - Proxy configured: admin.automatonicai.com → localhost:8055
  - WebSocket support enabled for real-time features
  - 100MB max upload size configured
  - DNS A record created: admin.automatonicai.com → 16.52.210.100
  - SSL certificate obtained from Let's Encrypt (expires 2026-03-21)
  - HTTPS enabled with automatic HTTP → HTTPS redirect
  - Auto-renewal configured via certbot.timer (runs twice daily)
  - **Status:** ✅ Directus admin UI accessible at https://admin.automatonicai.com
