# NX Cloud Setup Guide

Complete guide to properly configure NX Cloud for remote caching and build optimization.

---

## 🎯 Current Status

**NX Cloud ID**: `693a3a62afa88f57bc137da7` ✅
**Connection**: Workspace connected but NOT configured ⚠️
**Cache Hit Rate**: 0% (not using remote cache) ❌
**Problem**: No CI access token, insecure default access levels

---

## 🔧 Step-by-Step Setup

### Step 1: Access NX Cloud Dashboard

1. Go to: **https://cloud.nx.app**
2. Click "Sign in with GitHub"
3. Find your workspace: **project-chronos**

### Step 2: Configure Access Levels (Security)

**Navigate to**: Settings → General → Access control

**Current (INSECURE) Settings:**
- Default access level: `read-write` ❌
- Logged in users: `read-write` ❌

**Change to (SECURE) Settings:**

1. **Default access level**: Change to `read-only`
   - Click dropdown → Select "read-only"
   - Click "Save"

   **What this means:**
   - Developers without login can still benefit from cache (read)
   - But can't pollute the shared cache (write)
   - Safer for production

2. **Logged in users**: Keep as `read-only`
   - Already set correctly ✓

   **What this means:**
   - Even logged-in developers only read from cache
   - Writes happen through CI with access token
   - Prevents accidental cache corruption

### Step 3: Generate CI Access Token

**Still in Settings → General → Access control:**

1. Scroll to **"CI access tokens"** section
2. Click **"Generate a CI access token"**
3. Modal appears:
   - **Name**: `cloudflare-pages-ci`
   - **Permissions**: read-write (default)
4. Click **"Generate"**
5. **IMPORTANT**: Copy the token immediately!
   - Format: `NX_CLOUD_ACCESS_TOKEN=NXCLOUD_...`
   - **You'll only see it once!**
6. Paste into KeePassXC (see SECRETS_MANAGEMENT.md)

### Step 4: Configure Token Locally

**Open terminal and run:**

```bash
# Add to .env.local (never commit this!)
echo "NX_CLOUD_ACCESS_TOKEN=YOUR_TOKEN_HERE" >> apps/web/.env.local

# Verify it's added
cat apps/web/.env.local | grep NX_CLOUD
```

**OR add to shell profile (global):**

```bash
# Add to ~/.zshrc
echo 'export NX_CLOUD_ACCESS_TOKEN="YOUR_TOKEN_HERE"' >> ~/.zshrc
source ~/.zshrc

# Verify it's loaded
echo $NX_CLOUD_ACCESS_TOKEN
```

**Recommendation**: Use `.env.local` method (project-specific, safer)

### Step 5: Configure Token in Cloudflare Pages

**For CI/CD to use NX Cloud:**

1. Go to: https://dash.cloudflare.com/
2. Click **Workers & Pages**
3. Click **project-chronos**
4. Click **Settings** tab
5. Scroll to **Environment variables**
6. Click **Add variable**
7. Fill in:
   - **Variable name**: `NX_CLOUD_ACCESS_TOKEN`
   - **Value**: [paste your token]
   - **Type**: Secret (encrypted)
   - **Environment**: Select "Production" AND "Preview"
8. Click **Save**

**Why this matters:**
- Every Cloudflare build will now use NX Cloud
- Faster builds (cached dependencies)
- Only builds what changed

### Step 6: Test Local Caching

**Run a test build:**

```bash
# Clear local cache first
npx nx reset

# Run build (first time - will cache)
npx nx run web:build

# Run build again (should use cache)
npx nx run web:build
```

**Look for this message:**
```
 NX   Successfully ran target build for project web (XXXms)

      Nx read the output from the cache instead of running the command for 1 out of 1 tasks.
```

**If you see "Nx Cloud made it possible to reuse..."**: ✅ Working!
**If no cache message**: ❌ Token not configured properly

### Step 7: Verify Dashboard Updates

1. Go back to: https://cloud.nx.app
2. Click on your workspace
3. You should now see:
   - **Computation time saved**: > 0s
   - **Cache hit rate**: > 0%
   - **Recent runs** showing up

**If data is still old (13+ days)**:
- Run a few builds locally
- Wait 5 minutes
- Refresh dashboard

---

## 🎯 Expected Results

### Before Configuration:
- ❌ Cache hit rate: 0%
- ❌ Time saved: 0s
- ❌ Build time: 3+ minutes every time
- ❌ Last activity: 13+ days ago

### After Configuration:
- ✅ Cache hit rate: 60-90%
- ✅ Time saved: 10-50+ seconds per build
- ✅ Build time: 30 seconds (with cache)
- ✅ Dashboard shows recent activity

---

## 🔍 Troubleshooting

### "Access Denied" or "Unauthorized"

**Problem**: Token not set correctly

**Solution**:
```bash
# Check if token is set
echo $NX_CLOUD_ACCESS_TOKEN

# If empty, add it:
export NX_CLOUD_ACCESS_TOKEN="your-token"

# Verify again
npx nx run web:build
```

### "Still 0% cache hit rate"

**Problem**: Running from wrong directory or token not in environment

**Solution**:
```bash
# Make sure you're in project root
cd /home/prometheus/coding/finance/project-chronos

# Load env vars
source apps/web/.env.local

# OR set directly
export NX_CLOUD_ACCESS_TOKEN="your-token"

# Try again
npx nx reset && npx nx run web:build
```

### "Dashboard shows no data"

**Problem**: Builds aren't sending data to NX Cloud

**Solution**:
1. Check token is configured (Step 4)
2. Run `npx nx run web:build --verbose`
3. Look for "Nx Cloud" messages in output
4. If missing, token is not loaded

### "Repository already connected" warning

**Problem**: Trying to connect twice

**Solution**:
- **Do NOT create a new connection**
- Your repo is already linked
- Just configure the token (Steps 3-5)

---

## 📊 Monitoring NX Cloud

### Dashboard Metrics to Watch:

1. **Cache Hit Rate**
   - **Good**: > 70%
   - **Needs improvement**: < 50%
   - **Why**: Higher = faster builds, lower costs

2. **Time Saved**
   - **Goal**: Save 50-80% of build time
   - **Track**: Weekly computation hours saved

3. **Failed Builds**
   - **Watch for**: Patterns in failures
   - **Action**: Fix flaky tests causing cache misses

4. **Distribution**
   - **Future feature**: Parallel test execution
   - **Benefit**: 3x-5x faster CI/CD

---

## 💡 Pro Tips

### 1. Use NX Affected

**Instead of rebuilding everything:**
```bash
# Only build what changed
npx nx affected:build

# Only test what changed
npx nx affected:test
```

**Benefit**: Even faster builds (skip unchanged projects)

### 2. Configure nx.json for Better Caching

**Already configured** in `nx.json`:
```json
{
  "targetDefaults": {
    "build": {
      "cache": true,  // ✓ Builds are cached
      "inputs": ["production", "^production"]  // ✓ Smart cache invalidation
    }
  }
}
```

### 3. Check Cache Status

**See what's cached:**
```bash
npx nx show projects --affected
npx nx show project web
```

### 4. Manual Cache Clear

**If cache is stale:**
```bash
# Clear local cache
npx nx reset

# Clear remote cache (can't do from CLI, use dashboard)
```

---

## 🔐 Security Notes

### Token Storage

**SAFE:**
- ✅ KeePassXC database
- ✅ `.env.local` (in .gitignore)
- ✅ Cloudflare environment variables (encrypted)
- ✅ GitHub Secrets (for future Actions)

**UNSAFE:**
- ❌ Committed to git
- ❌ Shared in Slack/email
- ❌ Plain text files outside project

### Token Rotation

**When to rotate:**
- Quarterly (every 3 months)
- If exposed/leaked
- When team member leaves

**How to rotate:**
1. Go to NX Cloud dashboard
2. Settings → General → CI access tokens
3. Click "..." next to old token
4. Click "Delete"
5. Generate new token (Steps 3-5 above)
6. Update all locations (local, Cloudflare, GitHub)

### Access Control Best Practices

**Recommended setup** (what we configured):
- Default access: `read-only`
- Logged in users: `read-only`
- CI token: `read-write` (only for automated builds)

**Why this is secure:**
- Developers can't accidentally corrupt shared cache
- Only CI (trusted environment) can write
- Cache poisoning attacks prevented

---

## 📞 Next Steps

1. ✅ Follow Steps 1-7 above
2. ✅ Save token to KeePassXC
3. ✅ Test local build (Step 6)
4. ✅ Verify dashboard shows data (Step 7)
5. ✅ Configure Cloudflare env var (Step 5)
6. ✅ Monitor cache hit rate weekly

**Questions?** Check NX Cloud docs: https://nx.dev/ci/intro/ci-with-nx

---

**Last Updated**: 2025-12-31
**Status**: Awaiting user to complete Steps 3-5
**Related Jira**: CHRONOS-387
