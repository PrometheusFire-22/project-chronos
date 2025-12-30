# Cloudflare Workers Deployment Guide

This guide covers deploying the Chronos web app to Cloudflare Workers using GitHub Actions and OpenNext.

## Prerequisites

- Cloudflare account with Workers enabled
- GitHub repository with Actions enabled
- Cloudflare API token with appropriate permissions

## Required GitHub Secrets

Navigate to your GitHub repository → Settings → Secrets and variables → Actions, then add:

### 1. CLOUDFLARE_API_TOKEN

**How to get it:**
1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com/profile/api-tokens)
2. Click "Create Token"
3. Use the "Edit Cloudflare Workers" template
4. Or create a custom token with these permissions:
   - **Account** → Workers Scripts → Edit
   - **Account** → Workers KV Storage → Edit (if using KV)
   - **Account** → Workers R2 Storage → Edit (for media and cache buckets)
   - **Account** → Account Settings → Read
   - **Zone** → Workers Routes → Edit (if using custom domains)

5. Click "Continue to summary" → "Create Token"
6. Copy the token (you won't see it again!)
7. Add it to GitHub Secrets as `CLOUDFLARE_API_TOKEN`

### 2. CLOUDFLARE_ACCOUNT_ID

**How to get it:**
1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com)
2. Select any site or go to Workers & Pages
3. Your Account ID is shown in the right sidebar
4. Or get it from the URL: `dash.cloudflare.com/<ACCOUNT_ID>/...`
5. Add it to GitHub Secrets as `CLOUDFLARE_ACCOUNT_ID`

## Deployment Workflow

The GitHub Actions workflow (`.github/workflows/deploy-web.yml`) automatically deploys when:

1. **Push to main branch** with changes in:
   - `apps/web/**`
   - `packages/ui/**`
   - The workflow file itself

2. **Manual trigger** via GitHub Actions UI (workflow_dispatch)

### Workflow Steps

1. Checkout code
2. Setup Node.js 20 and pnpm
3. Install dependencies (with caching)
4. Build Next.js app with OpenNext
5. Deploy to Cloudflare Workers using wrangler

## Manual Deployment (Local)

For local deployment (requires local Postgres for Hyperdrive emulation):

```bash
# Build
pnpm --filter @chronos/web run cf:build

# Deploy (requires local environment setup)
pnpm --filter @chronos/web run deploy:local
```

**Note:** Local deployment requires setting up Hyperdrive `localConnectionString` in `wrangler.toml`.

## Environment Variables

Environment variables are configured in `wrangler.toml`:

### Public Variables (in `[vars]`)
- `NEXT_PUBLIC_SITE_URL` - Your production URL
- `NEXT_PUBLIC_DIRECTUS_URL` - Directus CMS URL

### Secrets (add via Wrangler CLI or dashboard)

```bash
# Add secret via CLI
wrangler secret put DIRECTUS_API_TOKEN

# Or add via Cloudflare Dashboard:
# Workers & Pages → chronos-web → Settings → Variables
```

## Resources Created

The deployment uses these Cloudflare resources:

### Workers
- **chronos-web** - Main Next.js application

### R2 Buckets
- **chronos-media** - Media file storage
- **chronos-next-cache** - Next.js incremental cache

### Hyperdrive
- **DB** - PostgreSQL connection pool (ID: `cbdc3f3e22f3454580f0d1ab56c9a1ea`)

## Monitoring Deployment

1. Go to GitHub repository → Actions
2. Click on the latest "Deploy Web App to Cloudflare Workers" workflow run
3. Monitor the deployment progress
4. Check deployment logs for any errors

## Troubleshooting

### Build Failures

If the build fails, check:
- Dependencies are installed correctly
- Environment variables are set
- TypeScript compilation succeeds locally

### Deployment Failures

If deployment fails, verify:
- GitHub secrets are set correctly
- Cloudflare API token has required permissions
- Account ID matches your Cloudflare account
- R2 buckets exist (`chronos-media`, `chronos-next-cache`)
- Hyperdrive configuration is correct

### Runtime Errors

Check Cloudflare Workers logs:
```bash
wrangler tail chronos-web
```

Or view logs in Cloudflare Dashboard:
Workers & Pages → chronos-web → Logs

## Additional Configuration

### Custom Domain

To add a custom domain:

1. Go to Cloudflare Dashboard → Workers & Pages → chronos-web
2. Click "Custom Domains" → "Add Custom Domain"
3. Enter your domain (e.g., `app.automatonicai.com`)
4. Update DNS records as prompted

### Caching Strategy

OpenNext automatically configures caching using:
- **R2 Incremental Cache** for ISR pages
- **Service Binding** for self-referencing
- **Cloudflare's edge cache** for static assets

## Rollback

To rollback a deployment:

```bash
# List deployments
wrangler deployments list

# Rollback to previous version
wrangler rollback [VERSION_ID]
```

## Support

- [OpenNext Cloudflare Docs](https://opennext.js.org/cloudflare)
- [Cloudflare Workers Docs](https://developers.cloudflare.com/workers/)
- [Wrangler CLI Reference](https://developers.cloudflare.com/workers/wrangler/)
