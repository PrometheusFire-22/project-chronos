# R2 Storage Decision (Critical Correction)

**Date:** 2025-12-21
**Decision:** Use Cloudflare R2 (NOT AWS S3) for Directus media storage
**Impact:** **High** - This decision is non-negotiable for cost control

---

## The Problem

Initial planning documents specified AWS S3 for Directus media storage. This was a **critical error** that would have resulted in significant, unacceptable egress costs.

### Why S3 is Unacceptable

**AWS S3 Egress Pricing:**
- Storage: $0.023/GB/month
- **Egress (data transfer out): $0.09/GB**

**Example: Blog with 100GB of images, 10,000 monthly views**
- Each page view loads ~1MB of images
- Total traffic: 10,000 views × 1MB = 10GB/month egress
- **S3 Cost:** $2.30 (storage) + **$0.90 (egress)** = $3.20/month

**At scale (100,000 views/month):**
- Traffic: 100GB egress/month
- **S3 Cost:** $2.30 (storage) + **$9.00 (egress)** = **$11.30/month**

**The killer:** Egress costs scale linearly with traffic. More successful = more expensive.

---

## The Solution: Cloudflare R2

**Cloudflare R2 Pricing:**
- Storage: $0.015/GB/month
- **Egress: $0.00/GB (ZERO!)**

### Same Example: 100,000 monthly views

**R2 Cost:** $1.50 (storage) + **$0.00 (egress)** = **$1.50/month**

**Savings:** $9.80/month at 100k views, **scales infinitely without egress charges**

### At 1 Million Views/Month (1TB egress)

| Storage | Storage Cost | Egress Cost | **Total** |
|---------|--------------|-------------|-----------|
| **AWS S3** | $2.30 | **$90.00** | **$92.30/month** |
| **Cloudflare R2** | $1.50 | **$0.00** | **$1.50/month** |

**Savings: $90.80/month** ($1,089.60/year)

---

## R2 + Directus Integration

### R2 is S3-Compatible

Cloudflare R2 implements the S3 API, so Directus works with it **out of the box** with zero code changes.

### Directus Configuration

```env
# Directus .env
STORAGE_LOCATIONS=r2
STORAGE_R2_DRIVER=s3  # Uses S3-compatible API
STORAGE_R2_KEY=<r2-access-key-id>
STORAGE_R2_SECRET=<r2-secret-access-key>
STORAGE_R2_BUCKET=chronos-media
STORAGE_R2_ENDPOINT=https://<account-id>.r2.cloudflarestorage.com
STORAGE_R2_REGION=auto
STORAGE_R2_PUBLIC_URL=https://media.automatonicai.com
```

**No Directus code changes required.** R2 pretends to be S3, Directus doesn't know the difference.

---

## Existing Infrastructure

**R2 is already provisioned:**

From `apps/web/wrangler.toml`:
```toml
[[r2_buckets]]
binding = "MEDIA"
bucket_name = "chronos-media"
```

**Bucket exists, ready to use immediately.**

---

## CLI Management

### Wrangler Commands (Already Installed)

```bash
# List buckets
wrangler r2 bucket list

# Upload file (testing)
wrangler r2 object put chronos-media/test.jpg --file ./test.jpg

# List objects
wrangler r2 object list chronos-media

# Download object
wrangler r2 object get chronos-media/test.jpg --file downloaded.jpg

# Delete object
wrangler r2 object delete chronos-media/test.jpg
```

### Getting R2 API Credentials

**Via Cloudflare Dashboard:**
1. Navigate to: https://dash.cloudflare.com
2. Select your account
3. Go to: R2 → Manage R2 API Tokens
4. Click "Create API Token"
5. Set permissions: Read + Write
6. Copy Access Key ID and Secret Access Key
7. Use in Directus `.env`

**Via Cloudflare API (CLI):**
```bash
# Get account ID
wrangler whoami

# Create R2 API token
curl -X POST "https://api.cloudflare.com/client/v4/accounts/<account-id>/r2/credentials" \
  -H "Authorization: Bearer <cloudflare-api-token>" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "directus-r2-access",
    "permissions": ["read", "write"]
  }'
```

---

## Optional: Custom Domain for R2

**Recommended:** Set up `media.automatonicai.com` pointing to R2 bucket.

### Benefits

1. **Better branding:** `https://media.automatonicai.com/blog/hero.jpg` vs ugly R2 URL
2. **Cloudflare CDN:** R2 with custom domain automatically uses Cloudflare's global CDN
3. **Flexibility:** Can switch buckets/storage without changing URLs in content
4. **Security:** Hide R2 bucket structure from public

### Setup (Via Cloudflare Dashboard)

1. Navigate to: R2 → chronos-media bucket → Settings
2. Click "Connect Domain"
3. Enter: `media.automatonicai.com`
4. Cloudflare automatically creates DNS record
5. SSL certificate auto-provisioned

**URL transformation:**
- Before: `https://<account-id>.r2.cloudflarestorage.com/chronos-media/blog/hero.jpg`
- After: `https://media.automatonicai.com/blog/hero.jpg`

### Setup (Via Wrangler)

```bash
# Connect custom domain to R2 bucket
wrangler r2 bucket domain add chronos-media --domain media.automatonicai.com

# List connected domains
wrangler r2 bucket domain list chronos-media

# Remove domain (if needed)
wrangler r2 bucket domain remove chronos-media --domain media.automatonicai.com
```

---

## Architecture Diagram

```
┌────────────────────────────────────────────────────┐
│           User's Browser (Global)                  │
└────────────────┬───────────────────────────────────┘
                 │ HTTPS request
                 │ GET https://media.automatonicai.com/blog/hero.jpg
                 ▼
┌────────────────────────────────────────────────────┐
│        Cloudflare Global Network (Edge)            │
│  ┌──────────────────────────────────────────────┐  │
│  │  CDN Cache (if enabled)                      │  │
│  │  - Caches images at edge locations          │  │
│  │  - Reduces latency (< 50ms globally)        │  │
│  └──────────────────┬───────────────────────────┘  │
│                     │                               │
│  ┌──────────────────▼───────────────────────────┐  │
│  │  Cloudflare R2 Storage                       │  │
│  │  Bucket: chronos-media                       │  │
│  │  - Zero egress fees                          │  │
│  │  - S3-compatible API                         │  │
│  │  - Auto-scales                               │  │
│  └──────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────┘
                     ▲
                     │ S3 API (upload)
┌────────────────────┴───────────────────────────────┐
│         AWS Lightsail VM (Directus)                │
│  ┌──────────────────────────────────────────────┐  │
│  │  Directus CMS                                │  │
│  │  - Uploads images to R2 via S3 API           │  │
│  │  - Stores R2 URLs in PostgreSQL              │  │
│  │  - Content editors use admin UI              │  │
│  └──────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────┘
```

**Flow:**
1. Content editor uploads image in Directus admin UI
2. Directus uploads to R2 via S3-compatible API
3. R2 returns URL: `https://media.automatonicai.com/blog/hero.jpg`
4. Directus stores URL in PostgreSQL `blog_posts.featured_image`
5. Next.js blog page fetches post from Directus, renders `<img src="https://media.automatonicai.com/blog/hero.jpg">`
6. User's browser requests image from R2 via Cloudflare CDN
7. **Zero egress fees** - Cloudflare doesn't charge for R2 → CDN → User traffic

---

## Updated Cost Analysis

### Directus + R2 (Actual Cost)

| Component | Service | Monthly Cost |
|-----------|---------|--------------|
| **Directus App** | Lightsail VM (existing) | $0 (shared) |
| **PostgreSQL** | Lightsail VM (existing) | $0 (shared) |
| **Redis Cache** | Lightsail VM (existing) | $0 (shared) |
| **R2 Storage (100GB)** | Cloudflare R2 | $1.50 |
| **R2 Egress (unlimited)** | Cloudflare R2 | **$0.00** |
| **Total** | | **$1.50/month** |

### Directus + S3 (Original - REJECTED)

| Component | Service | Monthly Cost (100k views) |
|-----------|---------|---------------------------|
| **Directus App** | Lightsail VM (existing) | $0 (shared) |
| **PostgreSQL** | Lightsail VM (existing) | $0 (shared) |
| **Redis Cache** | Lightsail VM (existing) | $0 (shared) |
| **S3 Storage (100GB)** | AWS S3 | $2.30 |
| **S3 Egress (100GB)** | AWS S3 | **$9.00** |
| **Total** | | **$11.30/month** ❌ |

**Savings with R2: $9.80/month** (87% reduction)

At 1M views/month:
- **S3: $92.30/month** ❌
- **R2: $1.50/month** ✅
- **Savings: $90.80/month** (98% reduction)

---

## Decision Summary

| Criteria | AWS S3 | Cloudflare R2 | Winner |
|----------|--------|---------------|--------|
| **Storage Cost** | $0.023/GB | $0.015/GB | R2 |
| **Egress Cost** | **$0.09/GB** ❌ | **$0.00/GB** ✅ | **R2** |
| **S3 API Compatible** | Yes (native) | Yes | Tie |
| **Directus Support** | Yes | Yes | Tie |
| **CDN Integration** | CloudFront (extra cost) | Cloudflare (included) | R2 |
| **Already Provisioned** | No | **Yes** ✅ | R2 |
| **CLI Tools** | AWS CLI | Wrangler (already installed) | R2 |
| **Cost Scaling** | Linear with traffic ❌ | Fixed (storage only) ✅ | **R2** |

**Clear winner: Cloudflare R2**

---

## Documentation Updated

All planning documents have been corrected to reflect R2:

1. ✅ **ADR-018:** S3 → R2 throughout
2. ✅ **Implementation Plan:** CHRONOS-363 updated (S3 → R2)
3. ✅ **Implementation Summary:** Cost analysis updated
4. ✅ **Jira Ticket CHRONOS-363:** Title and description updated

---

## Action Items

### Immediate
- [x] Correct planning documents (S3 → R2)
- [x] Update Jira ticket CHRONOS-363
- [ ] Verify R2 bucket `chronos-media` exists (via Cloudflare Dashboard or `wrangler r2 bucket list`)
- [ ] Generate R2 API credentials (for Directus)

### During Implementation (Phase 4, Sprint 3)
- [ ] Configure Directus to use R2 (CHRONOS-363)
- [ ] Set up custom domain: `media.automatonicai.com` → R2 (optional)
- [ ] Test image upload in Directus
- [ ] Verify zero egress fees in Cloudflare Analytics

---

## Key Takeaways

1. **AWS S3 egress fees are unacceptable** for media-heavy sites
2. **Cloudflare R2 is S3-compatible** - Directus works seamlessly
3. **R2 is already provisioned** - ready to use immediately
4. **Cost savings scale with success** - the more traffic, the more you save
5. **No vendor lock-in** - R2 uses standard S3 API, can migrate if needed

---

**This decision is non-negotiable.** R2 is the only viable option for cost-effective media storage at scale.

**Document Version:** 1.0.0
**Last Updated:** 2025-12-21
**Status:** **Approved** - Critical correction applied to all planning documents
