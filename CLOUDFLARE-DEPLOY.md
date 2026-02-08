# 🚀 Cloudflare Pages Deployment Guide

**Platform**: Cloudflare Pages
**Time**: 30 minutes
**Prerequisites**: Cloudflare account, Wrangler CLI (✅ installed)

---

## ✅ What's Already Configured

You're all set with:
- ✅ `@opennextjs/cloudflare` adapter (v1.14.6)
- ✅ `wrangler.toml` configuration
- ✅ Wrangler CLI v4.56.0
- ✅ R2 bucket (`chronos-media`)
- ✅ Environment variables in wrangler.toml

---

## 📋 Deployment Steps

### Step 1: Populate Directus Content (if not done)

```bash
# Set credentials
export DIRECTUS_URL="https://admin.automatonicai.com"
export DIRECTUS_ADMIN_EMAIL="your-email"
export DIRECTUS_ADMIN_PASSWORD="your-password"

# Populate content
tsx scripts/populate-homepage-content.ts
tsx scripts/populate-features-content.ts
tsx scripts/populate-about-content.ts
```

**Or manually** at: https://admin.automatonicai.com/admin

---

### Step 2: Set Directus Public Permissions

1. Log into Directus admin
2. **Settings** → **Roles & Permissions** → **Public**
3. Enable:

| Collection | Permission |
|------------|------------|
| `cms_homepage_hero` | ☑️ Read |
| `cms_features` | ☑️ Read |
| `cms_blog_posts` | ☑️ Read |
| `cms_docs_pages` | ☑️ Read |
| `cms_announcements` | ☑️ Read |
| `cms_legal_pages` | ☑️ Read |
| `cms_waitlist_submissions` | ☑️ Create |

---

### Step 3: Build for Production

```bash
cd apps/web

# Build Next.js with OpenNext Cloudflare adapter
pnpm pages:build

# This creates .open-next/ directory with _worker.js and assets
```

**Expected output**: Build completes without errors and "Worker saved in .open-next/worker.js"

---

### Step 4: Login to Cloudflare

```bash
# Authenticate with Cloudflare
pnpm wrangler login

# This opens browser for OAuth login
# Follow prompts to authorize
```

---

### Step 5: Deploy to Cloudflare Pages

```bash
# From project root
pnpm wrangler pages deploy apps/web/.open-next --project-name=project-chronos

# Options:
# - First deploy? Wrangler will create the project
# - Subsequent deploys? It will update existing project
```

**Wrangler will**:
1. Upload your build to Cloudflare
2. Deploy to global edge network
3. Give you a URL: `project-chronos.pages.dev`
4. Set up SSL automatically

---

### Step 6: Verify Deployment

Visit your Cloudflare Pages URL and check:

- [x] Homepage loads with Directus content
- [x] /features page works
- [x] /about page works
- [x] Waitlist form submits successfully
- [x] Check Directus for submission

---

## 🔧 Environment Variables

Already configured in `wrangler.toml`:

```toml
[vars]
NEXT_PUBLIC_SITE_URL = "https://automatonicai.com"
NEXT_PUBLIC_DIRECTUS_URL = "https://admin.automatonicai.com"
```

**To add more** (if needed):

```bash
# Via Cloudflare Dashboard
# 1. Go to Pages → chronos-web → Settings → Environment Variables
# 2. Add variables for production
# 3. Redeploy
```

---

## 🌐 Custom Domain Setup

1. In Cloudflare Dashboard → **Pages** → **chronos-web**
2. Go to **Custom domains**
3. Click **Set up a custom domain**
4. Enter: `automatonicai.com` or `www.automatonicai.com`
5. Follow DNS configuration (automatic if domain in same Cloudflare account)

Update wrangler.toml:
```toml
[vars]
NEXT_PUBLIC_SITE_URL = "https://automatonicai.com"
```

Redeploy:
```bash
pnpm wrangler pages deploy .vercel/output/static --project-name=chronos-web
```

---

## 🚨 Troubleshooting

### Build Fails

```bash
# Clear Next.js cache
rm -rf .next

# Rebuild
pnpm build
```

### Wrangler Login Issues

```bash
# Logout and re-login
pnpm wrangler logout
pnpm wrangler login
```

### Content Not Showing

- Verify Directus permissions are PUBLIC
- Check browser console for API errors
- Verify `NEXT_PUBLIC_DIRECTUS_URL` in wrangler.toml

### Waitlist Form Not Working

- Check Directus public role has CREATE on `cms_waitlist_submissions`
- Test API route: `https://your-domain.pages.dev/api/waitlist`
- Check Network tab for errors

---

## 📊 Build Output Verification

After `pnpm build`, verify:

```bash
# Check output directory exists
ls .vercel/output/static

# Should contain:
# - _worker.js (Cloudflare Worker)
# - index.html
# - Static assets
# - Next.js chunks
```

---

## 🎯 Post-Deployment

### Cloudflare Pages Features You Get:

✅ **Global Edge Network** - 300+ cities worldwide
✅ **Automatic SSL** - HTTPS everywhere
✅ **DDoS Protection** - Enterprise-grade security
✅ **Unlimited Bandwidth** - No egress fees
✅ **Preview Deployments** - Auto-deploy git branches
✅ **Rollback** - One-click to previous version
✅ **Analytics** - Built-in Web Analytics
✅ **R2 Integration** - Already configured for media

### Continuous Deployment

Connect GitHub repository:

1. Cloudflare Dashboard → **Pages** → **chronos-web**
2. **Settings** → **Builds & deployments**
3. Connect to **GitHub**
4. Select repository: `PrometheusFire-22/project-chronos`
5. Set build command: `cd apps/web && pnpm build`
6. Set output directory: `.vercel/output/static`
7. **Save**

Now every push to `main` auto-deploys!

---

## 🔍 Monitoring

### Cloudflare Dashboard

Monitor at: https://dash.cloudflare.com/

- **Analytics**: Page views, bandwidth, requests
- **Logs**: Real-time deployment logs
- **Functions**: Worker performance metrics

### Sentry (Already Configured!)

Your app already has Sentry configured:
- Org: `project-chronos`
- Project: `web-app`

Errors will automatically report to Sentry.

---

## 📝 Quick Reference

```bash
# Build
cd apps/web && pnpm build

# Deploy
pnpm wrangler pages deploy .vercel/output/static --project-name=chronos-web

# Check deployment
pnpm wrangler pages deployment list --project-name=chronos-web

# View logs
pnpm wrangler pages deployment tail --project-name=chronos-web

# Environment variables
pnpm wrangler pages project view chronos-web
```

---

## ✅ Success Checklist

After deployment:

- [ ] Site accessible at `chronos-web.pages.dev`
- [ ] All 3 pages load (/, /features, /about)
- [ ] Directus content displays correctly
- [ ] Waitlist form works
- [ ] Forms submit to Directus
- [ ] SSL certificate active (HTTPS)
- [ ] Mobile responsive
- [ ] No console errors

---

## 🎊 You're Live!

Once deployed, you have:

✅ **Production Website** on Cloudflare's global network
✅ **Automatic SSL** via Cloudflare Universal SSL
✅ **Edge caching** for optimal performance
✅ **DDoS protection** included
✅ **Unlimited bandwidth** (Cloudflare doesn't charge egress)
✅ **R2 integration** for media serving

---

**Next Steps**: Test, iterate, and enjoy your live site! 🚀

*For detailed troubleshooting, see: docs/30-TECHNICAL/DEPLOYMENT-CHECKLIST.md*
