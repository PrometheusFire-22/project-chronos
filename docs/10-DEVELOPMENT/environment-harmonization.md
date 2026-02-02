# ==================================================================
# Project Chronos Environment Configuration Template
# ==================================================================
#
# Copy this file to .env and fill in actual values
# Never commit .env (it contains secrets)
#
# Usage:
#   cp .env.example .env
#   # Edit .env with your values
#   source .env  # Or use direnv
#
# ==================================================================

# ==================================================================
# Environment
# ==================================================================

NODE_ENV=development  # development | production | test
ENVIRONMENT=local     # local | aws | staging | production

# ==================================================================
# Database (PostgreSQL + TimescaleDB + PostGIS + pgvector)
# ==================================================================

# Local development: Point to AWS Lightsail
DATABASE_URL=postgresql://chronos:YOUR_PASSWORD@16.52.210.100:5432/chronos

# Production: Use localhost on Lightsail instance
# DATABASE_URL=postgresql://chronos:YOUR_PASSWORD@localhost:5432/chronos

# Individual components (for apps that don't use DATABASE_URL)
DB_HOST=16.52.210.100
DB_PORT=5432
DB_NAME=chronos
DB_USER=chronos
DB_PASSWORD=YOUR_PASSWORD

# ==================================================================
# Modal (GPU Document Processing)
# ==================================================================

USE_MODAL_GPU=true  # true | false (false for local CPU fallback)

# Get these from ~/.modal/token.json after running: modal token new
MODAL_TOKEN_ID=tok-xxxxx
MODAL_TOKEN_SECRET=sec-xxxxx

# ==================================================================
# OpenAI (Embeddings & LLM)
# ==================================================================

OPENAI_API_KEY=sk-xxxxx  # Get from https://platform.openai.com/api-keys
OPENAI_ORG_ID=org-xxxxx  # Optional

# ==================================================================
# Directus CMS (Self-hosted)
# ==================================================================

DIRECTUS_URL=https://cms.chronos.dev  # Or http://localhost:8055 for local
DIRECTUS_EMAIL=admin@chronos.dev
DIRECTUS_PASSWORD=YOUR_DIRECTUS_PASSWORD
DIRECTUS_ADMIN_TOKEN=YOUR_ADMIN_TOKEN  # Get from Directus settings

# ==================================================================
# Cloudflare (R2 Storage, Workers, CDN)
# ==================================================================

# R2 Storage (for Directus files)
CLOUDFLARE_ACCOUNT_ID=xxxxx
CLOUDFLARE_R2_ACCESS_KEY_ID=xxxxx
CLOUDFLARE_R2_SECRET_ACCESS_KEY=xxxxx
CLOUDFLARE_R2_BUCKET_NAME=chronos-cms-files

# Workers
CLOUDFLARE_API_TOKEN=xxxxx
CLOUDFLARE_ZONE_ID=xxxxx

# ==================================================================
# AWS (Lightsail, S3, App Runner)
# ==================================================================

AWS_REGION=ca-central-1  # Montreal
AWS_ACCESS_KEY_ID=xxxxx
AWS_SECRET_ACCESS_KEY=xxxxx

# S3 (for backups via pgbackrest)
AWS_S3_BUCKET=chronos-backups
AWS_S3_REGION=ca-central-1

# ==================================================================
# External APIs
# ==================================================================

# FRED (Federal Reserve Economic Data)
FRED_API_KEY=xxxxx  # Get from https://fred.stlouisfed.org/docs/api/api_key.html

# Statistics Canada (no key required)
# Bank of Canada Valet API (no key required)

# ==================================================================
# Monitoring & Observability
# ==================================================================

# Sentry (Error Tracking)
SENTRY_DSN=https://xxxxx@xxxxx.ingest.sentry.io/xxxxx
SENTRY_ENVIRONMENT=local  # local | staging | production
SENTRY_TRACES_SAMPLE_RATE=0.1  # 0.0 to 1.0

# UptimeRobot (Health Checks)
UPTIMEROBOT_API_KEY=xxxxx

# ==================================================================
# Email (Resend)
# ==================================================================

RESEND_API_KEY=re_xxxxx  # Get from https://resend.com/api-keys

# ==================================================================
# Authentication (AWS Cognito)
# ==================================================================

COGNITO_USER_POOL_ID=ca-central-1_xxxxx
COGNITO_CLIENT_ID=xxxxx
COGNITO_REGION=ca-central-1

# ==================================================================
# Next.js (apps/web)
# ==================================================================

# Public URL
NEXT_PUBLIC_APP_URL=http://localhost:3000  # Local dev
# NEXT_PUBLIC_APP_URL=https://chronos.dev  # Production

# API URLs
NEXT_PUBLIC_API_URL=http://localhost:8000  # FastAPI
NEXT_PUBLIC_WORKER_URL=http://localhost:8787  # Cloudflare Worker

# ==================================================================
# Python (Poetry)
# ==================================================================

PYTHONPATH=src:apps/chronos-api/src

# ==================================================================
# Development Tools
# ==================================================================

# Nx Cloud
NX_CLOUD_ACCESS_TOKEN=xxxxx  # Optional, for distributed caching

# GitHub
GITHUB_TOKEN=ghp_xxxxx  # For gh CLI

# Jira/Confluence
JIRA_EMAIL=your-email@example.com
JIRA_API_TOKEN=xxxxx  # Get from https://id.atlassian.com/manage-profile/security/api-tokens
JIRA_DOMAIN=automatonicai.atlassian.net

# ==================================================================
# Feature Flags
# ==================================================================

ENABLE_MODAL_GPU=true
ENABLE_BATCH_PROCESSING=false
ENABLE_COST_TRACKING=true
