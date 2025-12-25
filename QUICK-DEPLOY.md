# 🚀 Quick Deploy Guide - 30 Minutes to Live!

**Goal**: Get the Chronos marketing website deployed to production ASAP

---

## Step 1: Populate Directus Content (5 min)

### Option A: Content Already Exists
If you previously ran the population scripts, skip to Step 2.

### Option B: Populate Now

You need Directus admin credentials. Set them as environment variables:

```bash
export DIRECTUS_URL="https://admin.automatonicai.com"
export DIRECTUS_ADMIN_EMAIL="your-admin@email.com"
export DIRECTUS_ADMIN_PASSWORD="your-password"
```

Then run the population scripts:

```bash
# From project root
tsx scripts/populate-homepage-content.ts
tsx scripts/populate-features-content.ts
tsx scripts/populate-about-content.ts
```

### Option C: Quick Manual Entry
Log into Directus admin panel and manually create:
- 1 homepage hero entry (cms_homepage_hero)
- 3 problem points (cms_features, category="problem-point")
- 4 solution pillars (cms_features, category="solution-pillar")
- 6 key features (cms_features, category="key-feature")
- 4 use cases (cms_features, category="use-case")
- 3 feature details (cms_features, category="features-detail")
- 3 about values (cms_features, category="about-section")

---

## Step 2: Create Production Environment File (2 min)

```bash
cd apps/web

# Create .env.production
cat > .env.production << 'EOF'
NEXT_PUBLIC_SERVER_URL=https://your-domain.vercel.app
NEXT_PUBLIC_DIRECTUS_URL=https://admin.automatonicai.com
EOF
```

**Note**: Replace `your-domain` with your actual Vercel project name (or use the auto-generated one Vercel provides)

---

## Step 3: Verify Directus Public Permissions (2 min)

1. Log into Directus: https://admin.automatonicai.com/admin
2. Go to **Settings** → **Roles & Permissions** → **Public**
3. Enable the following:

| Collection | Permission |
|------------|------------|
| `cms_homepage_hero` | ☑️ Read |
| `cms_features` | ☑️ Read |
| `cms_blog_posts` | ☑️ Read |
| `cms_docs_pages` | ☑️ Read |
| `cms_announcements` | ☑️ Read |
| `cms_legal_pages` | ☑️ Read |
| `cms_waitlist_submissions` | ☑️ Create |

4. Click **Save**

---

## Step 4: Test Build Locally (3 min)

```bash
cd apps/web

# Install dependencies (if not already)
pnpm install

# Build for production
pnpm build

# Expected output: "Build completed successfully"
```

If build succeeds, proceed. If errors occur, fix them before deploying.

---

## Step 5: Deploy to Vercel (10 min)

### First Time Setup:

```bash
# Install Vercel CLI globally (if not installed)
pnpm add -g vercel

# Login to Vercel
vercel login
# Follow the prompts to authenticate
```

### Deploy:

```bash
# From apps/web directory
cd apps/web

# Deploy to production
vercel --prod

# Answer the prompts:
# - Set up and deploy? Yes
# - Which scope? (your account)
# - Link to existing project? No
# - Project name? chronos-marketing (or your preference)
# - Directory? ./
# - Override settings? No

# Wait for deployment...
```

Vercel will:
1. Upload your code
2. Build the Next.js app
3. Deploy to global CDN
4. Give you a production URL (e.g., chronos-marketing.vercel.app)

---

## Step 6: Set Environment Variables in Vercel (3 min)

After first deployment, set production environment variables:

```bash
# Option A: Via CLI
vercel env add NEXT_PUBLIC_DIRECTUS_URL production
# Enter: https://admin.automatonicai.com

vercel env add NEXT_PUBLIC_SERVER_URL production
# Enter: https://your-project.vercel.app (use the URL Vercel gave you)

# Redeploy with new env vars
vercel --prod
```

**Option B: Via Vercel Dashboard**
1. Go to https://vercel.com/dashboard
2. Click your project
3. Go to **Settings** → **Environment Variables**
4. Add:
   - `NEXT_PUBLIC_DIRECTUS_URL` = `https://admin.automatonicai.com`
   - `NEXT_PUBLIC_SERVER_URL` = `https://your-project.vercel.app`
5. Redeploy from dashboard

---

## Step 7: Verify Deployment (5 min)

Visit your production URL and verify:

- [x] Homepage loads
- [x] All sections display content from Directus
- [x] Navigate to /features - page loads
- [x] Navigate to /about - page loads
- [x] Submit waitlist form - verify it works
- [x] Check Directus to confirm submission was saved
- [x] Test on mobile device

---

## Step 8: Custom Domain (Optional - 5 min)

If you want to use a custom domain:

1. In Vercel Dashboard → **Settings** → **Domains**
2. Add your domain (e.g., chronos.ai)
3. Follow DNS instructions
4. Update `NEXT_PUBLIC_SERVER_URL` to your custom domain
5. Redeploy

---

## 🎉 Success Checklist

After deployment, you should have:

- ✅ Live website at Vercel URL
- ✅ All three pages working (/, /features, /about)
- ✅ Content loading from Directus
- ✅ Waitlist form functional
- ✅ Responsive design working
- ✅ SSL certificate (automatic via Vercel)
- ✅ Global CDN distribution

---

## 🐛 Troubleshooting

### Build Fails
```bash
# Check TypeScript errors
pnpm tsc --noEmit

# Check for missing dependencies
pnpm install

# Clear cache and rebuild
rm -rf .next
pnpm build
```

### Content Not Showing
- Verify Directus public permissions are set
- Check browser console for API errors
- Verify `NEXT_PUBLIC_DIRECTUS_URL` is correct

### Waitlist Form Not Working
- Check Directus public role has CREATE permission on cms_waitlist_submissions
- Verify API route is deployed (visit /api/waitlist directly)
- Check browser network tab for errors

### 404 Errors
- Verify pages are in correct directory: `app/(frontend)/`
- Check build output for static generation errors
- Ensure no TypeScript errors

---

## 📊 Post-Deployment

Once live, you can:

1. **Monitor**: Check Vercel Analytics for traffic
2. **Iterate**: Make changes, commit, push → auto-deploys
3. **Polish**: Add SEO files, optimize images later
4. **Test**: Share with users, gather feedback
5. **Scale**: Upgrade Vercel plan if needed

---

## 🔗 Important URLs

- **Production Site**: (your-vercel-url)
- **Vercel Dashboard**: https://vercel.com/dashboard
- **Directus Admin**: https://admin.automatonicai.com/admin
- **GitHub Repo**: https://github.com/PrometheusFire-22/project-chronos

---

**Estimated Total Time**: 30 minutes
**Difficulty**: Easy
**Prerequisites**: Directus content, Vercel account

Let's go! 🚀
