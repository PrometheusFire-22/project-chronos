# Deployment Guide

## Production Environment

**Live URL:** https://automatonicai.com
**Hosting:** Vercel (project-chronos-web)
**Build:** Next.js 16 with Turbopack
**Runtime:** Node.js 24.x
**Region:** Washington D.C., USA (iad1)

## Architecture

```
Frontend (Vercel)
├─ Next.js 16 + Turbopack
├─ Payload CMS 3.0 (integrated)
└─ React 19 (canary)

Database (AWS Lightsail)
├─ PostgreSQL 16
├─ IP: 16.52.210.100
└─ Database: chronos

Storage (AWS S3)
├─ Bucket: project-chronos-media
└─ Region: ca-central-1
```

## Deployment Process

### Automatic Deployments (Current Setup)

1. **Production deploys** trigger on push to `production/deploy-2025-12-14`:
   ```bash
   git checkout production/deploy-2025-12-14
   git merge develop
   git push
   # Vercel auto-deploys to automatonicai.com
   ```

2. **Preview deploys** trigger on:
   - Any PR to production branch
   - Push to `develop` branch

### Manual Deployment

```bash
# From command line
vercel --prod

# Promote existing preview to production
vercel promote <deployment-url>
```

## Environment Variables (Production)

See `docs/SECRETS_REFERENCE.md` for values (stored in KeepassXC).

**Required variables:**
- `POSTGRES_URL` - PostgreSQL connection string
- `PAYLOAD_SECRET` - Payload CMS secret key
- `NEXT_PUBLIC_SERVER_URL` - Public URL (https://automatonicai.com)
- `S3_ACCESS_KEY_ID` - AWS S3 access key
- `S3_SECRET_ACCESS_KEY` - AWS S3 secret key
- `S3_BUCKET` - S3 bucket name (project-chronos-media)
- `S3_REGION` - S3 region (ca-central-1)

## Build Configuration

**Vercel settings:**
- Root Directory: `apps/web`
- Build Command: `pnpm build`
- Output Directory: `.next`
- Install Command: `pnpm install`
- Framework: Next.js (auto-detected)

**vercel.json:**
```json
{
  "$schema": "https://openapi.vercel.sh/vercel.json",
  "buildCommand": "pnpm build",
  "devCommand": "pnpm dev",
  "installCommand": "pnpm install",
  "outputDirectory": ".next"
}
```

## Domain Configuration

**Primary domain:** automatonicai.com
**WWW redirect:** www.automatonicai.com → automatonicai.com (301 Permanent)
**Vercel subdomain:** project-chronos-web.vercel.app

## Monitoring & Logs

- **Vercel Dashboard:** https://vercel.com/prometheusfire-22s-projects/project-chronos-web
- **Build Logs:** Vercel dashboard → Deployments → Select deployment
- **Runtime Logs:** Vercel dashboard → Logs tab
- **Database Monitoring:** AWS Lightsail console

## Rollback Procedure

```bash
# View recent deployments
vercel ls

# Promote previous deployment to production
vercel promote <previous-deployment-url>
```

## Performance

**Build time:** ~1m 32s
**Bundle size:** ~650 KB (compressed)
**Static assets:** ~36 KB
**ISR Functions:** 4 routes (/, /_global-error, /test-assets, /test-theme)

## Security

- ✅ HTTPS enforced (Vercel automatic)
- ✅ Environment variables encrypted
- ✅ PostgreSQL firewall (port 5432 restricted)
- ✅ S3 bucket CORS configured
- ⚠️ TODO: Restrict PostgreSQL to Vercel IPs only (hardening sprint)

## Troubleshooting

### Build fails with "No such file or directory"
- Check Root Directory is set to `apps/web`
- Verify build command doesn't include `cd apps/web`

### Database connection timeout
- Verify Lightsail firewall allows port 5432
- Check POSTGRES_URL environment variable
- Verify database is running: `ssh ubuntu@16.52.210.100`

### S3 upload fails
- Verify S3 credentials are correct
- Check S3 bucket CORS configuration
- Verify bucket region matches S3_REGION env var

## Cost Breakdown

- **Vercel:** Free (Hobby plan, can upgrade to Pro $20/mo)
- **AWS Lightsail Database:** $15/mo (2GB RAM, 2 vCPUs, 60GB SSD)
- **AWS S3:** ~$0.023/GB/month + transfer costs
- **Domain:** Varies by registrar

**Total:** ~$15-20/month
