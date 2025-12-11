# Dev Container Guide for Project Chronos

> **⚠️ CRITICAL: Read this entire document before working with this project!**

## 🎯 The Golden Rule

**NEVER manually run `docker compose up` or `docker compose down` when using Dev Containers!**

The Dev Container system manages all containers automatically. Manual Docker commands will create conflicts and waste your time.

---

## ✅ Correct Workflow

### Starting Your Development Environment

1. **Open the project in VS Code or Antigravity**
   ```
   File → Open Folder → Select /workspace
   ```

2. **Reopen in Container**
   - VS Code/Antigravity will prompt: "Reopen in Container"
   - Click "Reopen in Container"
   - OR use Command Palette (Cmd/Ctrl+Shift+P) → "Dev Containers: Reopen in Container"

3. **Wait for automatic setup**
   - The Dev Container extension automatically:
     - Builds the Docker images (first time only)
     - Starts ALL containers defined in `docker-compose.yml` and `docker-compose.override.yml`
     - Installs Python dependencies (first time only, via `postCreateCommand`)
     - Attaches your editor to the `chronos-app` container

4. **Verify everything is running**
   ```bash
   # Run this INSIDE the Dev Container terminal
   docker compose ps
   ```
   
   You should see:
   - ✅ `chronos-app` (your dev environment - you're inside this one!)
   - ✅ `chronos-db` (TimescaleDB on port 5432)
   - ✅ `chronos-metabase` (BI tool on port 3001)
   - ✅ `chronos-pgadmin` (DB admin on port 5050)
   - ✅ `chronos-mailhog` (email testing on ports 1025/8025)

### Stopping Your Development Environment

**Option 1: Close the Dev Container (Recommended)**
- Close VS Code/Antigravity
- OR use Command Palette → "Dev Containers: Reopen Folder Locally"
- The `shutdownAction: stopCompose` setting automatically stops all containers

**Option 2: Manual Stop (if needed)**
```bash
# Run this INSIDE the Dev Container terminal
docker compose stop
```

### Restarting After Stopping

Just repeat the "Starting Your Development Environment" steps above. The Dev Container will:
- Restart all stopped containers
- Reconnect to your existing environment
- Preserve all your data (databases, volumes, etc.)

---

## 🚫 Common Mistakes to Avoid

### ❌ DON'T: Run Docker Compose from Host Terminal

```bash
# ❌ NEVER DO THIS when using Dev Containers!
docker compose up -d
docker compose down
```

**Why?** This creates a separate set of containers that conflict with the Dev Container's automatic management.

### ❌ DON'T: Manually Attach to Containers

The Dev Container extension handles attachment automatically. Don't manually attach via Docker Desktop or `docker exec`.

### ❌ DON'T: Mix Dev Container and Manual Workflows

Pick one approach:
- **Dev Containers** (recommended) - fully automatic
- **Manual Docker Compose** - for non-IDE workflows

Don't switch between them for the same project.

---

## 🔧 Troubleshooting

### Problem: "Containers are already running"

**Cause:** You previously ran `docker compose up` manually from the host.

**Fix:**
```bash
# Run from HOST terminal (outside Dev Container)
cd /workspace
docker compose down

# Then reopen in Dev Container - it will start fresh
```

### Problem: "Port already in use"

**Cause:** Containers from a previous session are still running.

**Fix:**
```bash
# Check what's running
docker compose ps

# Stop everything
docker compose down

# Reopen in Dev Container
```

### Problem: "Database connection failed"

**Cause:** The database container might not be healthy yet.

**Fix:**
```bash
# Check container health
docker compose ps

# Wait for chronos-db to show "healthy" status
# The healthcheck runs every 10 seconds
```

### Problem: "Changes to devcontainer.json not taking effect"

**Fix:**
1. Close the Dev Container (reopen locally)
2. Command Palette → "Dev Containers: Rebuild Container"
3. This rebuilds the Docker image with your new settings

---

## 📊 Accessing Services

All services are automatically started and ports are forwarded:

| Service | URL | Purpose |
|---------|-----|---------|
| PostgreSQL | `localhost:5432` | Database (connect from host or container) |
| Next.js | `http://localhost:3000` | Web application (dev server) |
| Metabase | `http://localhost:3001` | Business intelligence dashboard |
| pgAdmin | `http://localhost:5050` | Database administration |
| MailHog SMTP | `localhost:1025` | Fake SMTP server for testing |
| MailHog UI | `http://localhost:8025` | View test emails |

**Note:** These URLs work from both your host machine and inside the Dev Container.

---

## 🔍 Understanding Your Setup

### What is `devcontainer.json`?

This file tells VS Code/Antigravity:
- Which Docker Compose files to use (`dockerComposeFile`)
- Which container to attach to (`service: app`)
- What to install (`postCreateCommand`)
- Which ports to forward (`forwardPorts`)
- What to do on shutdown (`shutdownAction: stopCompose`)

### What Happens When You "Reopen in Container"?

1. **Build Phase** (first time only)
   - Builds `chronos-app` from `Dockerfile`
   - Builds `chronos-db` from `Dockerfile.timescaledb`
   - Pulls images for Metabase, pgAdmin, MailHog

2. **Start Phase** (every time)
   - Starts all containers via Docker Compose
   - Waits for dependencies (e.g., DB must be healthy)
   - Runs `postCreateCommand` (first time only)
   - Runs `postStartCommand` (every time)

3. **Attach Phase** (every time)
   - Connects your editor to the `chronos-app` container
   - Forwards ports to your host machine
   - Mounts your workspace at `/workspace`

4. **Shutdown Phase** (when you close)
   - Stops all containers (because `shutdownAction: stopCompose`)
   - Preserves all data in Docker volumes

---

## 🎓 Best Practices

### ✅ DO: Use the Dev Container Terminal

All your development commands should run inside the Dev Container terminal:
```bash
# These run INSIDE the container
python src/main.py
pytest
ruff check .
```

### ✅ DO: Check Container Status Regularly

```bash
# See all running containers
docker compose ps

# See container logs
docker compose logs -f app
docker compose logs -f timescaledb
```

### ✅ DO: Use Docker Compose Commands Inside the Container

If you need to restart a specific service:
```bash
# Run INSIDE the Dev Container terminal
docker compose restart timescaledb
docker compose logs -f timescaledb
```

### ✅ DO: Commit Your .env File Changes

The `.env` file contains important configuration. If you change database credentials or other settings, make sure they're consistent.

---

## 🆘 Emergency Reset

If everything is broken and you want to start completely fresh:

```bash
# 1. Exit the Dev Container (reopen locally)

# 2. Run from HOST terminal:
cd /workspace
docker compose down -v  # ⚠️ This deletes all data!
docker system prune -f

# 3. Reopen in Dev Container
# Everything will rebuild from scratch
```

**⚠️ WARNING:** The `-v` flag deletes all volumes, including your database data!

---

## 📚 Additional Resources

- [VS Code Dev Containers Documentation](https://code.visualstudio.com/docs/devcontainers/containers)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [Project Chronos Documentation](../README.md)

---

## ✨ Summary

**The entire point of Dev Containers is to eliminate manual Docker management.**

Your `devcontainer.json` is correctly configured. Just:
1. Open the folder
2. Click "Reopen in Container"
3. Start coding

Everything else is automatic. Trust the system! 🚀
