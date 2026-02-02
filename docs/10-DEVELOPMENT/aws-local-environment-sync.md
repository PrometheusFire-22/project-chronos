# AWS & Local Environment Harmonization

**Status**: Active
**Last Updated**: 2026-02-02
**Goal**: Keep local development environment in sync with AWS production

---

## 🎯 Overview

Project Chronos runs in two primary environments:
1. **Local (Development)**: ASUS Ubuntu laptop
2. **AWS (Production)**: Lightsail + App Runner (Montreal, ca-central-1)

**Key Principle**: Local development should mirror production as closely as possible.

---

## 📊 Environment Matrix

| Component | Local | AWS Production | Sync Method |
|-----------|-------|----------------|-------------|
| **Database** | → AWS | PostgreSQL (Lightsail 8GB) | Direct connection to AWS |
| **FastAPI** | Local (port 8000) | App Runner (Montreal) | Docker image parity |
| **Next.js** | Local (port 3000) | Cloudflare Pages | Git-based deploy |
| **Cloudflare Workers** | Local (port 8787) | Cloudflare Edge | Wrangler deploy |
| **Directus CMS** | → AWS | Docker (on Lightsail) | Direct connection to AWS |
| **Modal GPU** | Remote | Remote | Same (cloud service) |
| **R2 Storage** | Remote | Remote | Same (cloud service) |

**✅ Benefits of this setup**:
- Local development uses production database (no sync needed)
- Docker ensures parity between local and production
- Changes are immediately testable on production data
- No need for database dumps/restores

---

## 🔄 Synchronization Checklist

### 1. Docker Images (FastAPI, Directus)

**Goal**: Local Docker images match production

```bash
# Build FastAPI image locally (same as production)
cd apps/chronos-api
docker build -f Dockerfile.production -t chronos-api:latest .

# Test locally
docker run -p 8000:8000 \
  -e DATABASE_URL=$DATABASE_URL \
  -e OPENAI_API_KEY=$OPENAI_API_KEY \
  chronos-api:latest

# Compare with production
ssh chronos-prod "docker ps && docker images"
```

**Sync Strategy**:
- [ ] Same Dockerfile used locally and in production
- [ ] Same base images (python:3.11-slim)
- [ ] Same dependencies (poetry.lock committed)
- [ ] Environment variables documented in .env.example

---

### 2. Environment Variables

**Goal**: .env files are consistent across environments

```bash
# Local: .env
# AWS: /home/ubuntu/chronos/.env (on Lightsail)
# AWS: App Runner environment variables (via AWS Console)

# Compare local vs AWS
ssh chronos-prod "cat ~/chronos/.env" > /tmp/aws.env
diff .env /tmp/aws.env
```

**Sync Strategy**:
- [ ] Keep `.env.example` up to date with all variables
- [ ] Use same variable names locally and in production
- [ ] Document required vs optional variables
- [ ] Use AWS Secrets Manager for sensitive values (future)

**Action Item**: Create script to validate environment variables

```bash
# scripts/validate-env.sh
#!/bin/bash
set -e

echo "Validating environment variables..."

required_vars=(
  "DATABASE_URL"
  "OPENAI_API_KEY"
  "MODAL_TOKEN_ID"
  "MODAL_TOKEN_SECRET"
  "DIRECTUS_URL"
  "CLOUDFLARE_R2_ACCESS_KEY_ID"
)

for var in "${required_vars[@]}"; do
  if [[ -z "${!var}" ]]; then
    echo "❌ Missing: $var"
    exit 1
  else
    echo "✅ Found: $var"
  fi
done

echo "✅ All required variables set"
```

---

### 3. Database Schema

**Goal**: Local schema matches production schema

```bash
# Check schema version (via Alembic)
poetry run alembic current

# On AWS
ssh chronos-prod "cd ~/chronos && poetry run alembic current"

# Should show same version:
# INFO  [alembic.runtime.migration] Context impl PostgresqlImpl.
# INFO  [alembic.runtime.migration] Will assume transactional DDL.
# 4108aca2dd8b (head)
```

**Sync Strategy**:
- [ ] Run migrations locally first (test)
- [ ] Run migrations on production (apply)
- [ ] Always commit migration files to git
- [ ] Never manually modify production schema

**Migration Workflow**:

```bash
# 1. Create migration locally
poetry run alembic revision --autogenerate -m "add_modal_cost_tracking"

# 2. Review generated migration
# Edit alembic/versions/xxxxx_add_modal_cost_tracking.py

# 3. Test locally
poetry run alembic upgrade head

# 4. Commit migration
git add alembic/versions/
git commit -m "chore(db): add Modal cost tracking fields [CHRONOS-XXX]"

# 5. Deploy to production
git push
ssh chronos-prod "cd ~/chronos && git pull && poetry run alembic upgrade head"
```

---

### 4. Dependencies (Python & Node.js)

**Goal**: Same package versions locally and in production

```bash
# Python: Check for drift
poetry show --outdated

# Node.js: Check for drift
pnpm outdated

# On AWS
ssh chronos-prod "cd ~/chronos && poetry show --outdated"
```

**Sync Strategy**:
- [ ] Commit `poetry.lock` and `pnpm-lock.yaml`
- [ ] Update dependencies in batch (weekly/monthly)
- [ ] Test locally before deploying to production
- [ ] Document breaking changes in ADRs

**Dependency Update Workflow**:

```bash
# 1. Update locally
poetry update modal  # Or: poetry update (all)
pnpm update

# 2. Test locally
poetry run pytest
pnpm test

# 3. Commit lockfiles
git add poetry.lock pnpm-lock.yaml
git commit -m "chore(deps): update dependencies [CHRONOS-XXX]"

# 4. Deploy to production
git push
ssh chronos-prod "cd ~/chronos && git pull && poetry install"
```

---

### 5. Secrets & Credentials

**Goal**: Secure handling of secrets across environments

**Current Approach**:
- Local: `.env` file (gitignored)
- AWS: `.env` file on Lightsail (manual)
- App Runner: Environment variables via AWS Console

**Issues**:
- ❌ Manual syncing of secrets
- ❌ No audit trail
- ❌ Risk of drift

**Recommended Approach** (Future):

```bash
# Use AWS Secrets Manager
aws secretsmanager create-secret \
  --name chronos/prod/database-url \
  --secret-string "$DATABASE_URL"

# Retrieve in application
import boto3
client = boto3.client('secretsmanager', region_name='ca-central-1')
response = client.get_secret_value(SecretId='chronos/prod/database-url')
DATABASE_URL = response['SecretString']
```

**Action Items**:
- [ ] Create Jira ticket for AWS Secrets Manager migration
- [ ] Document all secrets in `.env.example`
- [ ] Rotate secrets quarterly

---

### 6. Modal Functions

**Goal**: Same Modal functions deployed from local and CI/CD

```bash
# Deploy from local
poetry run modal deploy apps/ingestion-worker/modal_functions/docling_processor.py

# Verify deployment
poetry run modal app list
# Should show: chronos-docling (deployed)

# Check function versions
poetry run modal app logs chronos-docling
```

**Sync Strategy**:
- [ ] Same Modal account for dev/prod (for PoC)
- [ ] Deploy from local for now
- [ ] Future: Deploy from CI/CD on merge to main

---

## 📋 Weekly Sync Checklist

Use this checklist every week to ensure environments stay in sync:

### Monday Morning Sync

- [ ] Pull latest code: `git pull origin main`
- [ ] Update dependencies: `poetry install && pnpm install`
- [ ] Check database schema: `poetry run alembic current`
- [ ] Run migrations: `poetry run alembic upgrade head`
- [ ] Restart services: `docker-compose restart`

### Before Production Deploy

- [ ] Test locally with production database
- [ ] Run full test suite: `pnpm test`
- [ ] Check for environment variable drift
- [ ] Review Docker image build
- [ ] Verify Modal functions deployed

### After Production Deploy

- [ ] SSH to AWS and verify deployment
- [ ] Check logs: `docker logs chronos-api`
- [ ] Run health checks: `curl https://api.chronos.dev/health`
- [ ] Monitor Sentry for errors
- [ ] Update Jira tickets

---

## 🚨 Common Drift Issues & Fixes

### Issue 1: Local works, production fails

**Symptom**: Code works locally but fails on AWS

**Common Causes**:
1. Environment variable missing in production
2. Dependency version mismatch (lockfile not committed)
3. Database schema out of sync

**Fix**:

```bash
# 1. Compare environment variables
ssh chronos-prod "cat ~/chronos/.env" > /tmp/aws.env
diff .env /tmp/aws.env

# 2. Check dependency versions
ssh chronos-prod "cd ~/chronos && poetry show modal"
poetry show modal
# Compare versions

# 3. Check database schema version
ssh chronos-prod "cd ~/chronos && poetry run alembic current"
poetry run alembic current
# Should be same
```

---

### Issue 2: Docker image out of sync

**Symptom**: `docker build` works locally, fails in production

**Fix**:

```bash
# Rebuild Docker image on AWS
ssh chronos-prod
cd ~/chronos/apps/chronos-api
docker build -f Dockerfile.production -t chronos-api:latest .
docker-compose up -d chronos-api
docker logs -f chronos-api
```

---

### Issue 3: Modal function version mismatch

**Symptom**: Local Modal function works, remote doesn't

**Fix**:

```bash
# Redeploy Modal function
poetry run modal deploy apps/ingestion-worker/modal_functions/docling_processor.py

# Check deployment logs
poetry run modal app logs chronos-docling
```

---

## 🛠️ Automation Scripts

### Script 1: Environment Sync Check

```bash
#!/bin/bash
# scripts/check-env-sync.sh

echo "Checking environment sync..."

# Check database
LOCAL_DB_VERSION=$(poetry run alembic current 2>&1 | tail -1)
AWS_DB_VERSION=$(ssh chronos-prod "cd ~/chronos && poetry run alembic current" 2>&1 | tail -1)

if [ "$LOCAL_DB_VERSION" != "$AWS_DB_VERSION" ]; then
  echo "❌ Database schema mismatch!"
  echo "   Local: $LOCAL_DB_VERSION"
  echo "   AWS: $AWS_DB_VERSION"
else
  echo "✅ Database schema in sync"
fi

# Check Modal deployment
MODAL_STATUS=$(poetry run modal app list | grep chronos-docling || echo "NOT_DEPLOYED")
if [ "$MODAL_STATUS" = "NOT_DEPLOYED" ]; then
  echo "⚠️  Modal function not deployed"
else
  echo "✅ Modal function deployed"
fi

# Check Docker images
LOCAL_IMAGE=$(docker images chronos-api:latest -q)
AWS_IMAGE=$(ssh chronos-prod "docker images chronos-api:latest -q")

if [ "$LOCAL_IMAGE" != "$AWS_IMAGE" ]; then
  echo "⚠️  Docker images may be out of sync (rebuild recommended)"
else
  echo "✅ Docker images in sync"
fi
```

---

### Script 2: Deploy to Production

```bash
#!/bin/bash
# scripts/deploy-production.sh

set -e

echo "🚀 Deploying to AWS production..."

# 1. Push code
git push origin main

# 2. SSH to AWS and deploy
ssh chronos-prod << 'EOF'
cd ~/chronos
git pull origin main
poetry install
poetry run alembic upgrade head
docker-compose build chronos-api
docker-compose up -d chronos-api
docker logs -f --tail=50 chronos-api
EOF

# 3. Deploy Modal functions
poetry run modal deploy apps/ingestion-worker/modal_functions/docling_processor.py

# 4. Health check
sleep 5
curl -f https://api.chronos.dev/health || echo "❌ Health check failed"

echo "✅ Deployment complete"
```

---

## ✅ Environment Harmonization Checklist

- [ ] Docker images match (local vs AWS)
- [ ] Environment variables documented
- [ ] Database schema in sync (Alembic)
- [ ] Dependencies locked (poetry.lock, pnpm-lock.yaml)
- [ ] Secrets properly managed
- [ ] Modal functions deployed
- [ ] Health checks passing
- [ ] Monitoring configured (Sentry, UptimeRobot)
- [ ] Backups running (pgbackrest)
- [ ] Weekly sync process established

---

## 📚 References

- **12-Factor App**: https://12factor.net/ (best practices for environments)
- **Docker Multi-Stage Builds**: https://docs.docker.com/build/building/multi-stage/
- **Alembic Migrations**: https://alembic.sqlalchemy.org/en/latest/tutorial.html
- **AWS Secrets Manager**: https://aws.amazon.com/secrets-manager/

---

**Next**: Create Jira tickets for:
- AWS Secrets Manager integration
- CI/CD pipeline for automated deploys
- Environment drift alerting
