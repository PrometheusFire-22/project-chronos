# TwentyCRM Deployment

Automated installation scripts for deploying TwentyCRM to Lightsail VM.

## Quick Start

**On your local machine:**
```bash
# Transfer deployment files to Lightsail VM
scp -r deployment/twentycrm/* ubuntu@admin.automatonicai.com:/tmp/twenty/
```

**On Lightsail VM:**
```bash
ssh ubuntu@admin.automatonicai.com

cd /tmp/twenty
sudo bash install.sh
```

That's it! The script will:
1. Create PostgreSQL schema
2. Setup Docker Compose
3. Configure nginx
4. Prompt you to add DNS record
5. Obtain SSL certificate
6. Start TwentyCRM

## Manual Installation

If you prefer step-by-step:

### 1. Database Setup
```bash
sudo -u postgres psql -d chronos -f setup-database.sql
```

### 2. Docker Setup
```bash
sudo mkdir -p /opt/twenty
sudo cp docker-compose.yml /opt/twenty/
```

### 3. Nginx Setup
```bash
sudo cp nginx-twenty.conf /etc/nginx/sites-available/twenty
sudo ln -s /etc/nginx/sites-available/twenty /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### 4. DNS Setup
Add in Cloudflare:
- Type: A
- Name: crm
- Content: [Lightsail VM IP]
- Proxy: Enabled

### 5. SSL Certificate
```bash
sudo certbot --nginx -d crm.automatonicai.com
```

### 6. Start Service
```bash
cd /opt/twenty
sudo docker-compose up -d
sudo docker logs -f twenty
```

## Files

- `install.sh` - Automated installation script
- `setup-database.sql` - PostgreSQL schema creation
- `docker-compose.yml` - Docker configuration
- `nginx-twenty.conf` - Nginx reverse proxy config

## Post-Installation

1. Visit: https://crm.automatonicai.com
2. Create admin account: geoff@automatonicai.com
3. Set workspace name: Automatonic AI
4. Start using!

## Maintenance

**View logs:**
```bash
sudo docker logs -f twenty
```

**Restart service:**
```bash
cd /opt/twenty
sudo docker-compose restart
```

**Update TwentyCRM:**
```bash
cd /opt/twenty
sudo docker-compose pull
sudo docker-compose up -d
```

**Backup database:**
```bash
sudo -u postgres pg_dump -d chronos -n twenty > /backup/twenty_$(date +%Y%m%d).sql
```

## Troubleshooting

**Container won't start:**
```bash
sudo docker logs twenty
# Check database connection string
# Verify PostgreSQL is running
```

**Can't access via browser:**
```bash
sudo nginx -t
sudo systemctl status nginx
sudo docker ps | grep twenty
```

**Database connection error:**
```bash
# Verify schema exists
sudo -u postgres psql -d chronos -c "\dn"

# Verify user has permissions
sudo -u postgres psql -d chronos -c "\du twenty_user"
```

## Architecture

```
Internet → Cloudflare → crm.automatonicai.com
                             ↓
                         nginx:443 (SSL)
                             ↓
                    Docker:3020 (TwentyCRM)
                             ↓
                    PostgreSQL chronos.twenty (schema)
```

## Related

- Jira: CHRONOS-377
- Docs: docs/10-DEVELOPMENT/02-INFRASTRUCTURE/twentycrm-installation-guide.md
- Branch: feature/CHRONOS-377-twentycrm-installation
