# 🐳 Docker Reference Guide - Project Chronos

**Last Updated:** 2025-11-26
**Your Setup:** Antigravity Dev Container with Docker-outside-of-Docker

---

## 🚀 Quick Start

Every time you open a new terminal, the helpers load automatically!

```bash
# Check containers
dcps

# View logs
dclogs timescaledb

# Connect to database
db-connect
# Password: Zarathustra22!

# Restart a service
dcrestart metabase
```

---

## 📋 Available Helper Commands

These are **automatically loaded** when you open a terminal:

| Command | What It Does | Example |
|---------|--------------|---------|
| `dcp` | Docker compose with correct project name | `dcp ps` |
| `dcps` | Show all running containers | `dcps` |
| `dclogs` | Follow logs for a service | `dclogs timescaledb` |
| `dcrestart` | Restart a service | `dcrestart metabase` |
| `db-connect` | Connect to PostgreSQL database | `db-connect` |
| `db-info` | Show database connection details | `db-info` |

---

## 🗄️ Database Connection

### From Inside Container:

```bash
# Using the helper (easiest)
db-connect

# Or manually
psql -h timescaledb -p 5432 -U prometheus -d chronos_db
# Password: Zarathustra22!
```

### From Your Host Machine:

```bash
psql -h localhost -p 5432 -U prometheus -d chronos_db
# Password: Zarathustra22!
```

### Connection Details:

| Parameter | Value |
|-----------|-------|
| **Host (from container)** | `timescaledb` |
| **Host (from host)** | `localhost` |
| **Port** | `5432` |
| **Database** | `chronos_db` |
| **Username** | `prometheus` |
| **Password** | `Zarathustra22!` |

---

## 🐳 Container Management

### View Running Containers

```bash
# Using helper
dcps

# Full command
docker compose -p project-chronos ps

# From host (shows more details)
docker ps
```

### View Logs

```bash
# All services
dclogs

# Specific service
dclogs timescaledb
dclogs metabase
dclogs pgadmin

# Last 100 lines
docker compose -p project-chronos logs --tail=100 timescaledb
```

### Restart Services

```bash
# Restart one service
dcrestart timescaledb

# Restart all services
docker compose -p project-chronos restart

# Restart from host
docker restart chronos-db
```

### Stop/Start Services

```bash
# Stop a service (keeps data)
docker compose -p project-chronos stop metabase

# Start it again
docker compose -p project-chronos start metabase

# Stop all services
docker compose -p project-chronos stop
```

---

## 🔧 Advanced Operations

### Execute Commands in Containers

```bash
# Get a shell in database container
docker exec -it chronos-db bash

# Run SQL query directly
docker exec chronos-db psql -U prometheus -d chronos_db -c "SELECT version();"

# Get a shell in app container (from host)
docker exec -it chronos-app zsh
```

### Check Container Health

```bash
# Check health status
docker inspect chronos-db --format='{{.State.Health.Status}}'

# View health check logs
docker inspect chronos-db --format='{{json .State.Health}}' | jq
```

### Clean Up (⚠️ CAUTION)

```bash
# Remove stopped containers only
docker compose -p project-chronos rm

# Stop and remove containers (keeps data)
docker compose -p project-chronos down

# ⚠️ DANGER: Remove containers AND data volumes
docker compose -p project-chronos down -v
```

---

## 📊 Service Access

All services are accessible from both container and host:

| Service | Container URL | Host URL | Credentials |
|---------|--------------|----------|-------------|
| **PostgreSQL** | `timescaledb:5432` | `localhost:5432` | User: `prometheus`<br>Pass: `Zarathustra22!`<br>DB: `chronos_db` |
| **Next.js** | `http://localhost:3000` | `http://localhost:3000` | Web application (dev) |
| **Metabase** | `http://metabase:3000` | `http://localhost:3001` | Set up on first visit |
| **pgAdmin** | `http://pgadmin:80` | `http://localhost:5050` | Check `.env` file |
| **MailHog Web** | `http://mailhog:8025` | `http://localhost:8025` | No auth |
| **MailHog SMTP** | `mailhog:1025` | `localhost:1025` | For app email testing |

---

## 🔍 Troubleshooting

### "permission denied" on docker commands

**Solution:** Restart your terminal. The `.zshrc` now automatically runs `newgrp dockerhost`.

If still having issues:
```bash
newgrp dockerhost
```

### docker compose ps shows nothing

**Problem:** You're using the wrong project name.

**Solution:** Use the helper commands (`dcps`) or specify project:
```bash
docker compose -p project-chronos ps
```

### Can't connect to database

**Check these:**

1. **Is the database running?**
   ```bash
   dcps
   # Look for chronos-db with status "healthy"
   ```

2. **Using correct credentials?**
   ```bash
   db-info
   # Shows the correct connection details
   ```

3. **Database name is `chronos_db` (underscore, not hyphen!)**

4. **From container use host `timescaledb`, from host use `localhost`**

### Services won't start

```bash
# Check logs for errors
dclogs timescaledb

# Check from host
docker logs chronos-db

# Restart the service
dcrestart timescaledb
```

---

## 🏗️ Your Container Architecture

```
┌─────────────────────────────────────────┐
│         Your Host Machine               │
│                                         │
│  ┌───────────────────────────────────┐ │
│  │    Antigravity (Editor)           │ │
│  │    Attached to chronos-app        │ │
│  └───────────────────────────────────┘ │
│                                         │
│  ┌───────────────────────────────────┐ │
│  │    Docker Containers              │ │
│  │                                   │ │
│  │  ┌─────────────────────────────┐ │ │
│  │  │ chronos-app                 │ │ │
│  │  │ (Your dev environment)      │ │ │
│  │  │ - You're here! ←            │ │ │
│  │  │ - Can access all containers │ │ │
│  │  └─────────────────────────────┘ │ │
│  │                                   │ │
│  │  ┌─────────────────────────────┐ │ │
│  │  │ chronos-db (TimescaleDB)    │ │ │
│  │  │ - PostgreSQL + TimescaleDB  │ │ │
│  │  │ - Port 5432                 │ │ │
│  │  └─────────────────────────────┘ │ │
│  │                                   │ │
│  │  ┌─────────────────────────────┐ │ │
│  │  │ chronos-metabase            │ │ │
│  │  │ - BI Dashboard              │ │ │
│  │  │ - Port 3001                 │ │ │
│  │  └─────────────────────────────┘ │ │
│  │                                   │ │
│  │  ┌─────────────────────────────┐ │ │
│  │  │ chronos-pgadmin             │ │ │
│  │  │ - DB Admin Tool             │ │ │
│  │  │ - Port 5050                 │ │ │
│  │  └─────────────────────────────┘ │ │
│  │                                   │ │
│  │  ┌─────────────────────────────┐ │ │
│  │  │ chronos-mailhog             │ │ │
│  │  │ - Email Testing             │ │ │
│  │  │ - Ports 1025, 8025          │ │ │
│  │  └─────────────────────────────┘ │ │
│  └───────────────────────────────────┘ │
└─────────────────────────────────────────┘
```

**Key Points:**
- All containers share a network (`chronos-network`)
- Containers can talk to each other by name (e.g., `timescaledb`)
- Ports are forwarded to host (e.g., 5432 → localhost:5432)
- You're inside `chronos-app` but can manage all containers

---

## 💡 Pro Tips

### 1. Permanent Database Client

Add to your `~/.zshrc` on **host** machine:
```bash
alias chronos-db='psql -h localhost -p 5432 -U prometheus -d chronos_db'
```

Then from host: `chronos-db` connects instantly!

### 2. Quick Log Monitoring

```bash
# Watch database logs in real-time
dclogs timescaledb

# In another terminal, run your queries
db-connect
```

### 3. Database Backups

```bash
# From inside container
docker exec chronos-db pg_dump -U prometheus chronos_db > backup.sql

# Restore
docker exec -i chronos-db psql -U prometheus chronos_db < backup.sql
```

### 4. Check What's Using Resources

```bash
# From host
docker stats

# Check specific container
docker stats chronos-db
```

---

## 📚 Additional Resources

- **Docker Compose Docs:** https://docs.docker.com/compose/
- **PostgreSQL Docs:** https://www.postgresql.org/docs/
- **TimescaleDB Docs:** https://docs.timescale.com/

---

## ✅ Summary

**Every new terminal automatically:**
1. ✅ Loads helper commands (`dcps`, `db-connect`, etc.)
2. ✅ Sets up docker permissions (`newgrp dockerhost`)
3. ✅ Ready to use immediately

**Most common commands you'll use:**
```bash
dcps              # Check status
dclogs SERVICE    # View logs
dcrestart SERVICE # Restart service
db-connect        # Connect to database
```

**You're all set! Docker is fully configured and documented.** 🚀
