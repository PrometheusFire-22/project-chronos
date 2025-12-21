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

### Accessing Directus

- **Local (VM):** http://localhost:8055
- **Public:** https://admin.automatonicai.com (requires Nginx configuration - CHRONOS-351)

### Logs

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
- **CHRONOS-351:** Configure Nginx Reverse Proxy (next)
- **CHRONOS-352:** Configure PostgreSQL Connection ✅ (auto-configured)
- **CHRONOS-353:** Set Up User Roles and Permissions (pending)

## Deployment History

- **2025-12-21:** Initial Directus installation (CHRONOS-350)
  - Directus v11.x (latest) deployed
  - Connected to existing PostgreSQL database
  - Admin user created: geoff@automatonicai.com
  - Health check passing: http://localhost:8055/server/health
