# R2 Caching Configuration

## Cache Headers Applied

All R2 resources are configured with production-grade cache headers:

```http
Cache-Control: public, max-age=31536000, immutable
Content-Type: application/x-protobuf
```

- **max-age=31536000**: Cache for 1 year (365 days)
- **immutable**: Tells browsers file will never change at this URL
- **public**: Can be cached by CDNs and browsers

## Resources Cached

### PMTiles (Vector Tiles)
- **File**: `tiles/protomaps-north-america.pmtiles` (127 MB)
- **URL**: https://tiles.automatonicai.com/tiles/protomaps-north-america.pmtiles
- **Coverage**: North America (-170°W to -50°W, 15°N to 80°N)
- **Zoom Levels**: 0-8

### Font Glyphs (PBF Format)
- **Files**: 1,024 PBF glyph files
- **URL Pattern**: https://tiles.automatonicai.com/fonts/{fontstack}/{range}.pbf
- **Fonts**:
  - Noto Sans Regular
  - Noto Sans Medium
  - Noto Sans Italic
  - Noto Sans Devanagari Regular v1

## Cloudflare CDN Behavior

- **First Request**: `cf-cache-status: DYNAMIC` (populating cache)
- **Subsequent Requests**: `cf-cache-status: HIT` (served from edge)
- **Global Distribution**: Cached at 300+ Cloudflare data centers worldwide
- **Zero Egress**: No bandwidth charges from R2

## Performance Impact

- **Browser Cache**: 1-year TTL eliminates repeated downloads
- **Edge Cache**: < 50ms latency globally (vs. 200-500ms origin fetch)
- **Bandwidth Savings**: ~99% reduction after first load
- **Cost**: $0 (Cloudflare R2 zero egress + CDN included)

## How Cache Was Applied

```bash
# PMTiles file
aws s3 cp s3://chronos-media/tiles/protomaps-north-america.pmtiles \
  s3://chronos-media/tiles/protomaps-north-america.pmtiles \
  --profile r2 \
  --endpoint-url https://060e43df09e3ec3a256a6624ab7649f8.r2.cloudflarestorage.com \
  --metadata-directive REPLACE \
  --content-type "application/x-protobuf" \
  --cache-control "public, max-age=31536000, immutable"

# All font PBF files (1,024 files)
aws s3 cp s3://chronos-media/fonts/ s3://chronos-media/fonts/ \
  --profile r2 \
  --endpoint-url https://060e43df09e3ec3a256a6624ab7649f8.r2.cloudflarestorage.com \
  --recursive \
  --metadata-directive REPLACE \
  --content-type "application/x-protobuf" \
  --cache-control "public, max-age=31536000, immutable" \
  --exclude "*" \
  --include "*.pbf"
```

## Verification

```bash
# Check cache headers
curl -I https://tiles.automatonicai.com/tiles/protomaps-north-america.pmtiles | grep -i cache-control
curl -I https://tiles.automatonicai.com/fonts/Noto%20Sans%20Regular/0-255.pbf | grep -i cache-control

# Expected output:
# cache-control: public, max-age=31536000, immutable
```

## Cache Invalidation (if needed)

Since files are immutable, cache invalidation is NOT needed for updates. Instead:

1. Upload new file with different name (e.g., `protomaps-north-america-v2.pmtiles`)
2. Update application code to reference new URL
3. Deploy updated code
4. Old cache entries expire naturally (or remain cached if still referenced)

## Best Practices

✅ **DO:**
- Use immutable cache for versioned static assets
- Set long TTLs (1 year) for resources that never change
- Use content-based URLs (e.g., `/tiles/v4.pmtiles` instead of `/tiles/latest.pmtiles`)

❌ **DON'T:**
- Use short TTLs for static files (wastes bandwidth)
- Use `no-cache` or `must-revalidate` for immutable resources
- Rely on cache purging (change URLs instead)

## Monitoring

Check CDN cache hit ratio in Cloudflare Dashboard:
- **R2** → **chronos-media** → **Metrics**
- **Aim for**: > 95% cache hit ratio after initial warmup
- **Check**: Bandwidth usage should be near zero after first day
