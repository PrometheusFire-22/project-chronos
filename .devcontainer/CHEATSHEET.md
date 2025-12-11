# ⚡ Quick Reference Cheat Sheet

## 🐳 Docker Commands (Auto-loaded in every terminal)

```bash
dcps                    # Show all containers
dclogs timescaledb      # View database logs
dcrestart metabase      # Restart a service
db-connect              # Connect to PostgreSQL
db-info                 # Show database connection details
```

## 🗄️ Database

```bash
# Connection Details
Host: timescaledb (from container) or localhost (from host)
Port: 5432
Database: chronos_db
User: prometheus
Password: Zarathustra22!

# Quick connect
db-connect
```

## 🌐 Web Interfaces

```bash
Next.js:   http://localhost:3000
Metabase:  http://localhost:3001
pgAdmin:   http://localhost:5050
MailHog:   http://localhost:8025
```

## 🔧 Common Tasks

```bash
# View all services
dcps

# Restart database
dcrestart timescaledb

# View logs
dclogs timescaledb

# Connect to DB
db-connect
```

## 📚 Full Documentation

```bash
# Complete Docker reference
cat .devcontainer/DOCKER_REFERENCE.md

# Antigravity setup guide
cat .devcontainer/ANTIGRAVITY_SETUP.md
```

---

**Helpers auto-load on every new terminal!** Just open and go. 🚀
