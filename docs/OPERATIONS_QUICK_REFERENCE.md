# ⚡ Project Chronos: Quick Reference Card

## 🚀 Daily Workflow

### Morning Routine
```bash
# 1. Start environment
docker compose up -d

# 2. Check database health
docker ps | grep chronos
psql -h timescaledb -U prometheus -d chronos_db -c "SELECT version();"

# 3. Check last backup
ls -lht ~/chronos-backups/daily/ | head -5
```

### Before Major Work
```bash
# ALWAYS create backup
./scripts/backup_production.sh

# Verify it worked
ls -lh ~/chronos-backups/daily/chronos_$(date +%Y%m%d)*.dump
```

### After Completing Features
```bash
# 1. Run tests
pytest tests/ --cov

# 2. Check migrations
alembic history --indicate-current

# 3. Commit changes
git add .
git commit -m "feat(component): description"
git push
```

---

## 📋 Common Commands

### Database Operations
```bash
# Connect to database
psql -h timescaledb -U prometheus -d chronos_db

# Quick data check
psql -h timescaledb -U prometheus -d chronos_db -c \
  "SELECT COUNT(*) FROM timeseries.economic_observations;"

# List all tables
psql -h timescaledb -U prometheus -d chronos_db -c "\dt+"
```

### Backup & Restore
```bash
# Manual backup
./scripts/backup_production.sh

# List backups
ls -lht ~/chronos-backups/daily/ | head

# Restore (DESTRUCTIVE)
./scripts/restore_production.sh ~/chronos-backups/daily/FILE.dump
```

### Data Ingestion
```bash
# Ingest all planned series
python src/scripts/master_ingest.py --status Planned

# Ingest specific series
python src/scripts/master_ingest.py --series GDP --series UNRATE

# Update active series (daily)
python src/scripts/master_ingest.py --status Active
```

### Schema Migrations
```bash
# Check current version
alembic current

# Create new migration
alembic revision -m "add new table"

# Apply migrations
alembic upgrade head

# Rollback
alembic downgrade -1
```

### Docker Management
```bash
# View logs
docker compose logs -f timescaledb

# Restart services
docker compose restart

# Rebuild after Dockerfile change
docker compose build app
docker compose up -d

# Nuclear option (BACKUP FIRST!)
docker compose down -v
docker compose up -d
./scripts/restore_production.sh ~/chronos-backups/daily/latest.dump
```

---

## 🔧 Troubleshooting

### "Container not running"
```bash
docker compose ps
docker compose up -d
docker compose logs timescaledb
```

### "Connection refused"
```bash
# Check database is healthy
docker exec chronos-db pg_isready -U prometheus

# Check port forwarding
docker port chronos-db 5432
```

### "Module not found"
```bash
# Reinstall dependencies
pip install -e '.[dev]'

# Check PYTHONPATH
echo $PYTHONPATH
# Should include: /workspace/src
```

### "Alembic can't locate revision"
```bash
# Reset to current state
alembic stamp head

# Check history
alembic history
```

---

## 🎯 Jira Workflow

### Creating Issues from Terminal
```bash
# Command Palette (Cmd+Shift+P):
# "Atlassian: Create Issue"

# Or use VS Code extension sidebar
```

### Issue Naming Convention
```
feat(component): Add new feature
fix(component): Fix bug
refactor(component): Refactor code
test(component): Add tests
docs(component): Update documentation
chore(component): Maintenance task
spike(component): Research task
```

### Status Flow
```
To Do → In Progress → Code Review → Testing → Done
```

---

## 📊 Monitoring Checklist

### Daily
- [ ] Check backup logs: `tail ~/chronos-backups/cron.log`
- [ ] Verify data freshness in analytics views
- [ ] Review failed ingestion logs
- [ ] Check disk space: `df -h`

### Weekly
- [ ] Test restore procedure
- [ ] Review Jira board and prioritize backlog
- [ ] Update documentation
- [ ] Review test coverage: `pytest --cov`

### Monthly
- [ ] Rotate credentials
- [ ] Archive old backups to cold storage
- [ ] Review and optimize Docker images
- [ ] Update dependencies: `pip list --outdated`

---

## 🚨 Emergency Contacts

### Data Loss
1. Stop all operations
2. Find latest backup: `ls -lt ~/chronos-backups/daily/`
3. Restore: `./scripts/restore_production.sh BACKUP_FILE`
4. Verify: Check record counts
5. Document incident in post-mortem

### Environment Corruption
1. Backup current state (if possible)
2. Export any unsaved work
3. Nuclear reset:
   ```bash
   docker compose down -v
   docker system prune -a
   docker compose build
   docker compose up -d
   ```
4. Restore data
5. Document what went wrong

---

## 📁 Key File Locations

### Configuration
- Environment: `/workspace/.env` (NEVER commit!)
- Docker Compose: `/workspace/docker-compose.yml`
- VS Code: `/workspace/.devcontainer/devcontainer.json`
- Alembic: `/workspace/alembic.ini`

### Scripts
- Backup: `/workspace/scripts/backup_production.sh`
- Restore: `/workspace/scripts/restore_production.sh`
- Ingestion: `/workspace/src/scripts/master_ingest.py`

### Data
- Catalog: `/workspace/database/seeds/asset_catalog.csv`
- Schema: `/workspace/database/schema.sql`
- Views: `/workspace/database/views.sql`

### Backups (HOST)
- Daily: `~/chronos-backups/daily/`
- Weekly: `~/chronos-backups/weekly/`
- Monthly: `~/chronos-backups/monthly/`

### Documentation
- Action Plan: `/workspace/docs/operations/ACTION_PLAN.md`
- Runbooks: `/workspace/docs/guides/`
- ADRs: `/workspace/docs/5_decisions/`

---

## 🎓 Best Practices

1. **Always backup before destructive operations**
2. **Use Alembic for schema changes, never edit SQL directly**
3. **Add series to CSV, not code**
4. **Commit migrations to Git**
5. **Test restore procedure monthly**
6. **Keep environment reproducible**
7. **Document everything in ADRs**
8. **Update Jira tickets immediately**

---

## 📞 Support Resources

### Documentation
- Local docs: `/workspace/docs/`
- This guide: `/workspace/docs/operations/QUICK_REFERENCE.md`
- Action plan: `/workspace/docs/operations/ACTION_PLAN.md`

### External Resources
- TimescaleDB: https://docs.timescale.com
- Alembic: https://alembic.sqlalchemy.org
- Docker Compose: https://docs.docker.com/compose/
- Jira: https://automatonicai.atlassian.net

### AI Assistants
- Claude Code (terminal): For code generation
- Claude Browser: For strategic planning
- GitHub Copilot: For inline suggestions

---

**Last Updated:** 2025-11-17  
**Print this and keep it handy!**