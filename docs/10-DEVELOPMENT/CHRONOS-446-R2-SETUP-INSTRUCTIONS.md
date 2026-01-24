# CHRONOS-446: Configure Cloudflare R2 for Directus DAM

**Status:** 🔄 In Progress
**Estimated Time:** 15 minutes

---

## Quick Steps

### 1. Get R2 API Credentials (2 minutes)

**Via Cloudflare Dashboard:**

1. Go to: https://dash.cloudflare.com/060e43df09e3ec3a256a6624ab7649f8/r2/api-tokens
2. Click **"Create API Token"**
3. Name: `directus-chronos-media-access`
4. Permissions: **Admin Read & Write**
5. Click **"Create API Token"**
6. **Copy both values:**
   - Access Key ID (looks like: `abc123...`)
   - Secret Access Key (looks like: `xyz789...`)

⚠️ **Important:** The Secret Access Key is only shown once! Save it immediately.

---

### 2. Update Directus Configuration

**File:** `deployment/lightsail/.env`

Add these lines to the end of the file:

```env
# Cloudflare R2 Storage Configuration
STORAGE_LOCATIONS=r2
STORAGE_R2_DRIVER=s3
STORAGE_R2_KEY=<YOUR_ACCESS_KEY_ID>
STORAGE_R2_SECRET=<YOUR_SECRET_ACCESS_KEY>
STORAGE_R2_BUCKET=chronos-media
STORAGE_R2_ENDPOINT=https://060e43df09e3ec3a256a6624ab7649f8.r2.cloudflarestorage.com
STORAGE_R2_REGION=auto
STORAGE_R2_PUBLIC_URL=https://pub-f71e6b1ed3f2460dad5e23b5d2a4f22e.r2.dev
```

**Replace:**
- `<YOUR_ACCESS_KEY_ID>` → The Access Key ID from step 1
- `<YOUR_SECRET_ACCESS_KEY>` → The Secret Access Key from step 1

---

### 3. Update Docker Compose (Remove Local Volume)

**File:** `deployment/lightsail/docker-compose.yml`

**Remove or comment out** the local uploads volume:

```yaml
# BEFORE (line ~45):
volumes:
  - directus-uploads:/directus/uploads  # ← Remove this line

# AFTER:
# volumes:
#   - directus-uploads:/directus/uploads  # Now using R2 instead
```

This forces Directus to use R2 instead of local storage.

---

### 4. Restart Directus Container

**SSH to Lightsail:**

```bash
ssh -i /tmp/chronos-ssh-key ubuntu@16.52.210.100
```

**Restart Directus:**

```bash
cd /home/ubuntu  # Or wherever docker-compose.yml is located
docker-compose down directus
docker-compose up -d directus
```

**Check logs:**

```bash
docker logs chronos-directus --tail 50
```

Look for:
- ✅ "Directus started successfully"
- ✅ No R2/S3 connection errors

---

### 5. Test File Upload

**Via Directus Admin UI:**

1. Go to: https://admin.automatonicai.com
2. Log in with admin credentials
3. Go to: **File Library** (in sidebar)
4. Click **"Upload Files"**
5. Upload a test image (any JPG/PNG)
6. Verify the file appears with an R2 URL like:
   - `https://pub-f71e6b1ed3f2460dad5e23b5d2a4f22e.r2.dev/abc123.jpg`

If you see an R2 URL → ✅ **Success!**

---

## Optional: Set Up Custom Domain

**Benefits:**
- Branded URLs: `https://media.automatonicai.com/image.jpg`
- Cloudflare CDN caching
- Better for SEO and branding

**Steps:**

1. Go to: https://dash.cloudflare.com/060e43df09e3ec3a256a6624ab7649f8/r2/buckets/chronos-media
2. Click **"Settings"** tab
3. Scroll to **"Public Access"**
4. Click **"Connect Domain"**
5. Enter: `media.automatonicai.com`
6. Click **"Connect"**

Cloudflare automatically:
- Creates the DNS record
- Provisions SSL certificate
- Sets up CDN caching

**Update Directus config:**

```env
# Replace public URL with custom domain
STORAGE_R2_PUBLIC_URL=https://media.automatonicai.com
```

Restart Directus again.

---

## Verification Checklist

- [ ] R2 API credentials created
- [ ] Directus `.env` updated with R2 config
- [ ] docker-compose.yml local volume removed
- [ ] Directus container restarted successfully
- [ ] Test file uploaded to Directus
- [ ] File URL points to R2 (not local storage)
- [ ] (Optional) Custom domain `media.automatonicai.com` connected
- [ ] (Optional) Custom domain verified working

---

## Troubleshooting

### Error: "Invalid credentials"

**Symptoms:** Directus logs show S3/R2 authentication errors

**Fix:**
1. Double-check Access Key ID and Secret in `.env`
2. Verify no extra spaces or quotes
3. Ensure credentials have Admin Read & Write permissions

### Error: "Bucket not found"

**Symptoms:** Directus logs show bucket access errors

**Fix:**
1. Verify bucket name is exactly `chronos-media`
2. Check endpoint URL has correct account ID
3. Ensure R2 API token has access to this account

### Files Still Going to Local Storage

**Symptoms:** File URLs are `/uploads/abc123.jpg` instead of R2 URLs

**Fix:**
1. Ensure `STORAGE_LOCATIONS=r2` is set
2. Verify local volume is removed from docker-compose.yml
3. Restart Directus container
4. Clear browser cache and try uploading again

### Custom Domain Not Working

**Symptoms:** `media.automatonicai.com` returns errors

**Fix:**
1. Wait 5-10 minutes for DNS propagation
2. Check DNS record exists: `dig media.automatonicai.com`
3. Verify SSL certificate is provisioned (can take a few minutes)
4. Check Cloudflare dashboard for domain connection status

---

## Cost Impact

**Before (Local Storage):**
- Storage: Uses Lightsail VM disk
- Risk: VM disk fills up
- Cost: No additional cost, but limited space

**After (R2 Storage):**
- Storage: $0.015/GB/month (First 10GB free)
- Egress: **$0.00** (unlimited, zero cost!)
- First month: **FREE** (10GB included)
- At 100GB: **$1.35/month**

**Savings vs S3:** ~98% cheaper for media-heavy sites

---

## Architecture

```
User Browser
     ↓
Cloudflare CDN (edge caching)
     ↓
Cloudflare R2 (chronos-media bucket)
     ↑
Directus (uploads via S3 API)
```

**Benefits:**
- ✅ Zero egress fees
- ✅ Global CDN
- ✅ Scalable storage
- ✅ Fast uploads/downloads
- ✅ S3-compatible (easy migration if needed)

---

**Ready to implement!** Follow steps 1-5 above to complete CHRONOS-446.
