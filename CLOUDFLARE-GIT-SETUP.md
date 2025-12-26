# Cloudflare Pages Git Integration Setup

**Repository**: PrometheusFire-22/project-chronos
**Platform**: Cloudflare Pages (FREE tier)
**Deployment**: Automatic via Git integration

---

## 🎯 Quick Setup (5 Minutes)

### Step 1: Open Cloudflare Dashboard

Visit: **https://dash.cloudflare.com/**

### Step 2: Navigate to Your Pages Project

1. Click **"Pages"** in left sidebar
2. Find and click **"chronos-web"**
3. Click the **"Settings"** tab

### Step 3: Connect to GitHub

1. Scroll to **"Builds & deployments"** section
2. Click **"Connect to Git"** button
3. Select **GitHub** as your Git provider
4. Authorize Cloudflare (if prompted)
5. Select repository: **PrometheusFire-22/project-chronos**
6. Click **"Begin setup"**

---

## 📋 Build Configuration

Use these **exact settings** when prompted:

### Production Branch
```
main
```

### Build Command
```bash
cd apps/web && npx @opennextjs/cloudflare build
```

### Build Output Directory
```
apps/web/.vercel/output/static
```

### Root Directory
```
(leave blank)
```

### Framework Preset
```
None (use custom build command)
```

---

## 🔧 Environment Variables

Click **"Add variable"** for each of these:

### Production Environment Variables

| Variable | Value |
|----------|-------|
| `NEXT_PUBLIC_SITE_URL` | `https://automatonicai.com` |
| `NEXT_PUBLIC_DIRECTUS_URL` | `https://admin.automatonicai.com` |
| `NODE_VERSION` | `20` |

**Note**: Cloudflare automatically uses pnpm for monorepos, no need to set PNPM_VERSION.

---

## ⚙️ Advanced Settings (Optional but Recommended)

### Build Watch Paths
Leave as default (watches entire repo)

### Deployment Controls
- ✅ Enable **automatic deployments** for `main` branch
- ✅ Enable **preview deployments** for pull requests

### Build Caching
- ✅ Enable build cache (speeds up subsequent builds)

---

## 🚀 Deploy!

1. Click **"Save and Deploy"**
2. Cloudflare will:
   - Clone your repository
   - Install dependencies with pnpm
   - Run the OpenNext build
   - Deploy to global CDN
   - Provide a live URL

**First build takes**: 3-5 minutes
**Subsequent builds**: 1-2 minutes (with cache)

---

## 📊 What Happens Next

### Automatic Deployments

Every time you push to `main`:
- Cloudflare auto-detects the change
- Runs build automatically
- Deploys new version
- Updates production URL

### Preview Deployments

Every pull request gets:
- Unique preview URL
- Isolated environment
- Automatic deployment on PR updates

---

## 🔗 URLs You'll Get

After first deployment:

- **Production URL**: `https://chronos-web-44q.pages.dev`
- **Custom domain** (after setup): `https://automatonicai.com`
- **PR previews**: `https://<branch-name>.chronos-web-44q.pages.dev`

---

## ✅ Success Checklist

After clicking "Save and Deploy":

- [ ] Build starts automatically
- [ ] Build completes successfully (check build logs)
- [ ] Site is live at `.pages.dev` URL
- [ ] Homepage loads with Directus content (may show 403 until permissions set)
- [ ] All pages accessible (/, /features, /about)

---

## 🚨 If Build Fails

### Check Build Logs

1. In Cloudflare Dashboard → Pages → chronos-web
2. Click **"Builds"** tab
3. Click the failed build
4. Review error messages

### Common Issues

**"Command not found"**
- Verify build command is exactly: `cd apps/web && npx @opennextjs/cloudflare build`

**"Module not found"**
- Check NODE_VERSION is set to `20`
- Verify monorepo structure

**"Build timeout"**
- Free tier has 20-minute build timeout (should be plenty)

---

## 🎯 After Successful Deployment

### Test the Site

Visit your `.pages.dev` URL and verify:
- [ ] Homepage loads
- [ ] Features page loads
- [ ] About page loads
- [ ] Images display correctly
- [ ] No console errors (except expected Directus 403s)

### Set Directus Permissions

Follow instructions in `DIRECTUS-PERMISSIONS.md` to enable public read access.

### Set Up Custom Domain

In Cloudflare Dashboard:
1. Pages → chronos-web → **Custom domains**
2. Click **"Set up a custom domain"**
3. Enter: `automatonicai.com`
4. Follow DNS configuration prompts

---

## 📝 Monorepo Build Details

Your build command handles the monorepo structure:

1. `cd apps/web` - Navigate to web app directory
2. `npx @opennextjs/cloudflare build` - Runs OpenNext build
3. OpenNext automatically:
   - Runs `pnpm build` (your package.json script)
   - Generates Cloudflare-compatible output
   - Creates `.vercel/output/static` directory

Cloudflare deploys everything in that output directory.

---

## 🆓 Free Tier Limits

What you get on FREE tier:

✅ **Unlimited** sites
✅ **Unlimited** requests
✅ **Unlimited** bandwidth
✅ **500 builds/month** (plenty for a startup)
✅ **100 GB** bandwidth/month
✅ **Unlimited** collaborators

You should NOT need to upgrade unless:
- You exceed 500 builds/month (very unlikely)
- You need instant purge (advanced)

---

## 🎊 You're Done!

Once the build completes successfully, your marketing site will be:

✅ Live on Cloudflare's global CDN
✅ Auto-deploying on every push to `main`
✅ Serving from 300+ cities worldwide
✅ Protected by DDoS mitigation
✅ Running on HTTPS
✅ Costing you $0/month

---

**Questions?** Check build logs or Cloudflare's documentation at https://developers.cloudflare.com/pages/
