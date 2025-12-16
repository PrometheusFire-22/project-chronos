# Payload CMS Web App Deployment Guide
## Vercel + PostgreSQL (AWS Lightsail) + S3 Media Storage

**Last Updated**: 2025-12-16
**Scope**: apps/web Payload CMS deployment
**Platform**: Vercel
**Database**: PostgreSQL 16.x (AWS Lightsail at 16.52.210.100)
**Storage**: AWS S3 (project-chronos-media bucket)

---

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Environment Configuration](#environment-configuration)
3. [Vercel Setup](#vercel-setup)
4. [Database Setup](#database-setup)
5. [S3 Storage Setup](#s3-storage-setup)
6. [First Deployment](#first-deployment)
7. [Post-Deployment](#post-deployment)
8. [Continuous Deployment](#continuous-deployment)
9. [Monitoring](#monitoring)
10. [Troubleshooting](#troubleshooting)

---

## Prerequisites

Before deploying, ensure you have:

- ✅ GitHub repository with project code
- ✅ Vercel account (free tier sufficient for MVP)
- ✅ PostgreSQL database (AWS Lightsail or similar)
- ✅ AWS account with S3 bucket created
- ✅ Domain name (optional, Vercel provides free subdomain)

---

## Environment Configuration

### Required Environment Variables

| Variable | Description | Example | Source |
|----------|-------------|---------|--------|
| `POSTGRES_URL` | Database connection string | `postgresql://user:pass@host:5432/db` | AWS Lightsail |
| `PAYLOAD_SECRET` | Encryption key (32+ chars) | `9c16b26c34e6fc4ff3bd...` | Generate with `openssl rand -hex 32` |
| `NEXT_PUBLIC_SERVER_URL` | Public site URL | `https://automatonicai.com` | Vercel domains |
| `S3_BUCKET` | S3 bucket name | `project-chronos-media` | AWS S3 |
| `S3_REGION` | S3 bucket region | `ca-central-1` | AWS S3 |
| `S3_ACCESS_KEY_ID` | AWS access key | `AKIA...` | AWS IAM |
| `S3_SECRET_ACCESS_KEY` | AWS secret key | `abc123...` | AWS IAM |

### Generating PAYLOAD_SECRET

```bash
# On macOS/Linux
openssl rand -hex 32

# Or use Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

**⚠️ IMPORTANT**: Never commit secrets to Git. Use Vercel's encrypted environment variables.

---

## Vercel Setup

### 1. Connect GitHub Repository

1. Go to [vercel.com](https://vercel.com)
2. Click **New Project**
3. Import Git Repository: `PrometheusFire-22/project-chronos`
4. Select **apps/web** as root directory (for monorepos)
5. Framework Preset: **Next.js** (auto-detected)

### 2. Configure Build Settings

**Root Directory**: `apps/web`

**Build Command**:
```bash
pnpm --filter @chronos/web build
```

**Output Directory**: `.next` (auto-detected)

**Install Command**:
```bash
pnpm install
```

### 3. Configure Environment Variables

In Vercel dashboard:

1. Go to **Project Settings** → **Environment Variables**
2. Add each variable (see table above)
3. Select environments: **Production**, **Preview**, **Development**
4. Click **Save**

**Environment-Specific Values**:
- `NEXT_PUBLIC_SERVER_URL`:
  - Production: `https://automatonicai.com`
  - Preview: `https://project-chronos-web-git-[branch]-[username].vercel.app`
  - Development: `http://localhost:3000`

### 4. Domain Configuration

**Default Vercel Domain**:
```
https://project-chronos-web-[username].vercel.app
```

**Custom Domain**:
1. Go to **Project Settings** → **Domains**
2. Add domain: `automatonicai.com`
3. Configure DNS:
   - Type: `A` or `CNAME`
   - Value: (provided by Vercel)
4. Wait for DNS propagation (5-60 minutes)

**SSL**: Auto-configured by Vercel (Let's Encrypt)

---

## Database Setup

### AWS Lightsail PostgreSQL

**Current Configuration**:
- Instance: `chronos-db`
- Host: `16.52.210.100`
- Port: `5432`
- Database: `chronos`
- User: `chronos`

### Initial Setup

```bash
# Connect to database
psql -h 16.52.210.100 -U chronos -d chronos

# Verify extensions (should already exist)
SELECT extname FROM pg_extension;

# Expected extensions:
# - postgis, postgis_raster, postgis_sfcgal, postgis_tiger_geocoder
# - timescaledb
# - pgvector
# - pg_stat_statements, pg_cron
```

### Payload Migrations

Payload auto-generates and runs migrations on first deploy.

**Migration Tables Created**:
- `payload_migrations` - Migration history
- `users` - User authentication
- `media` - Media library
- `pages` - Page content
- `payload_preferences` - User preferences
- `payload_locked_documents` - Draft state

**Manual Migration** (if needed):
```bash
# Generate migration
pnpm payload migrate:create

# Run migrations
pnpm payload migrate
```

---

## S3 Storage Setup

### Bucket Configuration

**Bucket Name**: `project-chronos-media`
**Region**: `ca-central-1` (Canada Central)
**Access**: Private (presigned URLs for downloads)

### IAM Policy

Create IAM user with this policy:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "s3:PutObject",
        "s3:GetObject",
        "s3:DeleteObject",
        "s3:ListBucket"
      ],
      "Resource": [
        "arn:aws:s3:::project-chronos-media",
        "arn:aws:s3:::project-chronos-media/*"
      ]
    }
  ]
}
```

### CORS Configuration

In S3 bucket settings → Permissions → CORS:

```json
[
  {
    "AllowedHeaders": ["*"],
    "AllowedMethods": ["GET", "PUT", "POST", "DELETE"],
    "AllowedOrigins": [
      "https://automatonicai.com",
      "https://*.vercel.app"
    ],
    "ExposeHeaders": ["ETag"]
  }
]
```

---

## First Deployment

### Pre-Deployment Checklist

- [ ] All environment variables configured in Vercel
- [ ] Database accessible from Vercel IPs (security group rules)
- [ ] S3 bucket CORS configured
- [ ] GitHub repository up to date

### Deploy from Vercel Dashboard

1. Go to **Deployments**
2. Click **Deploy** or push to `main` branch
3. Monitor build logs
4. Wait for deployment (2-4 minutes)

### Deploy from CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy to preview
vercel

# Deploy to production
vercel --prod
```

### Build Output

```
Route (app)                                 Size  First Load JS
┌ ○ /                                       3 kB         156 kB
├ ○ /_not-found                             1 kB         103 kB
├ ƒ /admin/[[...segments]]                643 kB         748 kB
├ ƒ /api/[...slug]                         133 B         102 kB
└ ƒ /page/[[...slug]]                      2 kB          158 kB
```

**Expected Build Time**: 2-3 minutes

---

## Post-Deployment

### Create First User

1. Navigate to `https://automatonicai.com/admin`
2. You should see "Create First User" page
3. Enter email and password
4. Click **Create**
5. You'll be logged in automatically

**If "Create First User" fails**:
```bash
# Use API to create user
curl -X POST https://automatonicai.com/api/users \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@automatonicai.com",
    "password": "secure-password-here"
  }'
```

### Verify Deployment

**Admin UI**:
- [ ] `/admin` loads without errors
- [ ] Can log in successfully
- [ ] Collections visible (Users, Media, Pages)
- [ ] Globals visible (Header, Footer)

**Frontend**:
- [ ] Homepage loads (may be empty if no content yet)
- [ ] No 404 errors
- [ ] No console errors

**API**:
```bash
# Test API endpoint
curl https://automatonicai.com/api/pages

# Expected: {"docs":[],"totalDocs":0,"limit":10,...}
```

**Media Upload**:
1. Go to `/admin/collections/media`
2. Click **Create New**
3. Upload test image
4. Verify upload to S3
5. Check image URL in response

### Create Homepage

1. Navigate to `/admin/collections/pages`
2. Click **Create New**
3. Fill in:
   - Title: "Home"
   - Slug: "home"
   - Check "Is Homepage"
4. Add Hero block:
   - Heading: "Welcome to Project Chronos"
   - Subheading: "Multi-modal relationship intelligence"
5. Save
6. Visit homepage: `https://automatonicai.com`

---

## Continuous Deployment

### Automatic Deployments

Vercel auto-deploys:
- **Production**: Pushes to `main` branch → `automatonicai.com`
- **Preview**: Pushes to feature branches → `project-chronos-web-git-[branch].vercel.app`

### Deployment Workflow

```bash
# Local development
git checkout -b feature/new-page
# ... make changes ...
git commit -m "feat: add contact page"
git push origin feature/new-page

# This triggers preview deployment
# URL: https://project-chronos-web-git-feature-new-page-[username].vercel.app

# After testing, merge to main
git checkout main
git merge feature/new-page
git push origin main

# This triggers production deployment
```

### Rollback

If deployment breaks:

1. Go to Vercel dashboard → **Deployments**
2. Find last working deployment
3. Click **︙** → **Promote to Production**
4. Confirm

**From CLI**:
```bash
vercel rollback
```

---

## Monitoring

### Vercel Analytics

**Metrics Available**:
- Page views
- Unique visitors
- Top pages
- Performance (Web Vitals)
- Errors

**Access**: Vercel Dashboard → **Analytics**

### Error Tracking

**Client Errors**: Logged to browser console
**Server Errors**: Logged to Vercel Functions logs

**View Logs**:
```bash
vercel logs
```

Or in dashboard: **Deployments** → [deployment] → **Functions**

### Database Monitoring

```sql
-- Check connection count
SELECT count(*) FROM pg_stat_activity WHERE datname = 'chronos';

-- Check slow queries
SELECT pid, now() - pg_stat_activity.query_start AS duration, query
FROM pg_stat_activity
WHERE (now() - pg_stat_activity.query_start) > interval '5 seconds';

-- Check table sizes
SELECT
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
```

### S3 Monitoring

AWS Console → S3 → Metrics:
- Total storage
- Number of objects
- Data transfer

---

## Troubleshooting

### Build Failures

**Error**: `Module not found: Can't resolve 'payload'`

**Fix**: Ensure `pnpm install` runs before build
```bash
# In Vercel settings
Install Command: pnpm install
Build Command: pnpm --filter @chronos/web build
```

**Error**: `Turbopack requires Next.js 16.1.0+`

**Fix**: Verify package.json has Next.js 15.4.10 (NOT canary or 16.x)

### Database Connection Errors

**Error**: `ECONNREFUSED` or `timeout`

**Fix**: Check AWS Lightsail security group:
- Allow inbound PostgreSQL (port 5432) from Vercel IPs
- Or allow from `0.0.0.0/0` (less secure but simpler)

**Error**: `SSL required`

**Fix**: Add `?sslmode=require` to `POSTGRES_URL`

### Admin UI Not Loading

**Error**: Blank page, no errors

**Fix**: Check `NEXT_PUBLIC_SERVER_URL` matches actual domain

**Error**: `Q() is undefined`

**Fix**: Downgrade to Next.js 15.4.10 (see PAYLOAD_STABILIZATION_PLAN.md)

### Media Upload Failures

**Error**: `AccessDenied`

**Fix**: Verify IAM policy allows `s3:PutObject` for bucket

**Error**: `CORS error`

**Fix**: Add Vercel domain to S3 CORS allowed origins

---

## Security Checklist

- [ ] `PAYLOAD_SECRET` is 32+ characters
- [ ] All secrets stored in Vercel encrypted variables
- [ ] Database uses strong password
- [ ] S3 bucket is private (no public access)
- [ ] HTTPS enabled (Vercel auto-enables)
- [ ] Admin accounts use strong passwords
- [ ] Security group restricts database access
- [ ] IAM user has minimal permissions

---

## References

- [Vercel Docs](https://vercel.com/docs)
- [Payload Deployment Guide](https://payloadcms.com/docs/production/deployment)
- [AWS S3 Docs](https://docs.aws.amazon.com/s3/)
- [AWS Lightsail Docs](https://lightsail.aws.amazon.com/ls/docs)

---

**Last Updated**: 2025-12-16
**Maintained By**: Development Team
