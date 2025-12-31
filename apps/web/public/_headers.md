# Cloudflare Pages Cache Headers Configuration

This file explains the `_headers` configuration and how to adjust it.

## Current Strategy

**Static Assets (JS, CSS, images):**
- Cache: 1 year (`max-age=31536000`)
- Why: These files never change (versioned filenames)
- Result: Lightning fast, low bandwidth

**HTML Pages with Directus Content:**
- CDN Cache: 10 minutes (`s-maxage=600`)
- Browser Cache: Revalidate every visit (`max-age=0`)
- Why: Balance between fresh content and performance
- Result: Content updates appear within 10 min

**Other HTML Pages:**
- CDN Cache: 5 minutes (`s-maxage=300`)
- Browser Cache: Revalidate every visit (`max-age=0`)
- Why: More frequent updates for non-CMS pages
- Result: Fresh content, still fast from CDN

---

## Understanding Cache-Control Values

```
Cache-Control: public, s-maxage=600, max-age=0, must-revalidate
               ^^^^^^  ^^^^^^^^^^^  ^^^^^^^^  ^^^^^^^^^^^^^^^
               │       │            │         │
               │       │            │         └─ Force revalidation when stale
               │       │            └─────────── Browser cache (0 = always check CDN)
               │       └──────────────────────── CDN cache (600 sec = 10 minutes)
               └──────────────────────────────── Can be cached by CDN and browsers
```

- `s-maxage`: How long Cloudflare CDN caches (in seconds)
- `max-age`: How long browser caches (0 = always check CDN)
- `must-revalidate`: Check origin when cache expires

---

## Common Adjustments

### More Fresh Content (Shorter Cache)

For near-instant updates (1 minute):
```
/features
  Cache-Control: public, s-maxage=60, max-age=0, must-revalidate
```

For real-time updates (no cache):
```
/features
  Cache-Control: no-cache, no-store, must-revalidate
```
⚠️ **Warning**: This hurts performance - every visitor fetches from origin!

### More Performance (Longer Cache)

For slower-changing content (1 hour):
```
/about
  Cache-Control: public, s-maxage=3600, max-age=0, must-revalidate
```

For rarely-changing content (1 day):
```
/about
  Cache-Control: public, s-maxage=86400, max-age=0, must-revalidate
```

---

## When to Adjust

### Scenario: Moving to Dynamic Site (SSR)

If you switch from static export to dynamic rendering:

1. **Remove `_headers` file** or change to:
   ```
   /*
     Cache-Control: private, no-cache
   ```
   (Private = don't cache in CDN, only in browser)

2. **Use Next.js built-in caching** instead:
   ```typescript
   export const revalidate = 60 // ISR - revalidate every 60 seconds
   ```

3. **Or use on-demand revalidation**:
   ```typescript
   import { revalidatePath } from 'next/cache'

   // In API route or server action
   revalidatePath('/features')
   ```

### Scenario: Need Immediate Updates

If you deploy critical content and can't wait 10 minutes:

**Option 1: Purge Cloudflare Cache (Manual)**
1. Cloudflare Dashboard → Workers & Pages
2. project-chronos → Deployments
3. Click "..." → "Purge deployment cache"

**Option 2: Reduce Cache Time Temporarily**
1. Edit `_headers`: Change `s-maxage=600` to `s-maxage=60` (1 min)
2. Commit and deploy
3. Wait for cache to clear
4. Change back to 600 later

---

## Cache Time Reference

| Duration | Seconds | Use Case |
|----------|---------|----------|
| 1 minute | 60 | Frequently updated content |
| 5 minutes | 300 | General pages (current default) |
| 10 minutes | 600 | CMS content (current for /features) |
| 30 minutes | 1800 | Semi-static content |
| 1 hour | 3600 | Rarely updated pages |
| 1 day | 86400 | Almost static content |
| 1 week | 604800 | Static content |
| 1 year | 31536000 | Immutable assets (JS/CSS with hashes) |

---

## Current Configuration Summary

- **Static assets**: 1 year cache ✅ (optimal)
- **CMS pages** (/features, /about, /): 10 min cache ✅ (balanced)
- **Other pages**: 5 min cache ✅ (balanced)

**This balances:**
- ✅ Fast page loads (cached in Cloudflare CDN)
- ✅ Fresh content (updates within 10 min)
- ✅ Low server load (most requests served from cache)
- ✅ Good UX (sub-second page loads globally)

**Trade-off:**
- ⏱️ Content updates take up to 10 minutes to appear (acceptable for static content)
- 💰 Saves money (fewer origin requests)
- 🚀 Better performance (CDN edge cache)

---

## Migration Path (Future)

When you want a more dynamic site:

1. **Keep static export + short cache** (current approach)
   - Pros: Simple, fast, cheap
   - Cons: 10-min update delay

2. **Switch to ISR (Incremental Static Regeneration)**
   - Change `next.config.js`: Remove `output: 'export'`
   - Add `export const revalidate = 60` to pages
   - Deploy to platform with ISR support (Vercel, Netlify)
   - Pros: On-demand revalidation, still fast
   - Cons: More complex, requires different hosting

3. **Switch to SSR (Server-Side Rendering)**
   - Change `next.config.js`: Remove `output: 'export'`
   - Add `export const dynamic = 'force-dynamic'` to pages
   - Deploy to platform with SSR (Vercel, Netlify, self-hosted)
   - Pros: Real-time content
   - Cons: Slower, more expensive, needs server

**Recommendation:** Stick with current approach (static + 10-min cache) until you need real-time updates or user-specific content.
