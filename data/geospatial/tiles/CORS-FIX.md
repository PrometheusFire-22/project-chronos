# CORS Configuration for R2 Tiles

## Problem

```
Cross-Origin Request Blocked: The Same Origin Policy disallows reading the remote resource
at https://tiles.automatonicai.com/tiles/protomaps-north-america.pmtiles.
(Reason: CORS header 'Access-Control-Allow-Origin' missing). Status code: 206.
```

## Root Cause

R2 custom domains do not automatically include CORS headers. MapLibre GL JS requires CORS headers to load tiles from a different origin than the web application.

## Solution: Cloudflare Transform Rules

Used **Modify Response Header** Transform Rules to inject CORS headers for all requests to `tiles.automatonicai.com`.

### Configuration Applied

**Dashboard Path:**
1. Cloudflare Dashboard → automatonicai.com zone
2. Rules → Transform Rules → Modify Response Header
3. Create rule: "R2 Tiles CORS Headers"

**Rule Details:**
- **Trigger**: `Hostname equals tiles.automatonicai.com`
- **Actions**:
  - Set `Access-Control-Allow-Origin: *`
  - Set `Access-Control-Allow-Methods: GET, HEAD`
  - Set `Access-Control-Max-Age: 86400`

### Why Transform Rules?

1. **Fast**: Propagates globally within 30 seconds
2. **Simple**: No code changes required
3. **Flexible**: Can modify headers without touching R2 objects
4. **Persistent**: Survives file uploads/replacements
5. **Free**: Included in all Cloudflare plans

### Alternative Solutions (Not Used)

❌ **Bucket-level CORS** - R2 doesn't support CORS configuration via API yet
❌ **Metadata headers** - R2 doesn't expose object metadata as HTTP headers
❌ **Cloudflare Worker** - Adds complexity, not needed for simple header injection

## Verification

```bash
# Test PMTiles CORS
curl -I "https://tiles.automatonicai.com/tiles/protomaps-north-america.pmtiles" | grep -i "access-control"

# Expected output:
access-control-allow-origin: *
access-control-allow-methods: GET, HEAD
access-control-max-age: 86400

# Test fonts CORS
curl -I "https://tiles.automatonicai.com/fonts/Noto%20Sans%20Regular/0-255.pbf" | grep -i "access-control"

# Expected output:
access-control-allow-origin: *
access-control-allow-methods: GET, HEAD
access-control-max-age: 86400
```

## Security Considerations

### Why Wildcard Origin (`*`)?

✅ **Safe for Public Tiles:**
- PMTiles and font glyphs are public, read-only resources
- No authentication or sensitive data involved
- Designed to be loaded by any web application
- Standard practice for public tile servers (MapBox, Stadia Maps, etc.)

❌ **Don't Use Wildcard For:**
- Private data or APIs
- Resources that require authentication
- Endpoints that accept POST/PUT/DELETE

### CORS Preflight

The `Access-Control-Max-Age: 86400` header tells browsers to cache the CORS preflight response for 24 hours, reducing unnecessary OPTIONS requests.

## Browser Behavior

### First Request (Cold Cache)
```
Request: GET https://tiles.automatonicai.com/tiles/protomaps-north-america.pmtiles
Response Headers:
  access-control-allow-origin: *
  cf-cache-status: DYNAMIC
  cache-control: public, max-age=31536000, immutable
```

### Subsequent Requests (Warm Cache)
```
Request: GET https://tiles.automatonicai.com/tiles/protomaps-north-america.pmtiles
Response Headers:
  access-control-allow-origin: *
  cf-cache-status: HIT (served from edge)
  cache-control: public, max-age=31536000, immutable
```

## Impact

✅ **Before Fix:** Map failed to load (CORS blocked)
✅ **After Fix:** Map loads successfully with vector tiles from R2

### Performance
- No performance impact (headers added at edge)
- CORS preflight responses cached for 24 hours
- Zero latency penalty

## Maintenance

The Transform Rule is persistent and requires no ongoing maintenance. If you:
- Upload new PMTiles files → CORS headers automatically applied
- Add new fonts → CORS headers automatically applied
- Change tile structure → CORS headers still work

## Troubleshooting

If CORS errors reappear:

1. **Check Transform Rule status**
   - Dashboard → Rules → Transform Rules
   - Ensure rule is "Active"

2. **Verify hostname match**
   - Rule must match `tiles.automatonicai.com`
   - Check for typos in hostname

3. **Clear browser cache**
   - Hard refresh (Ctrl+Shift+R / Cmd+Shift+R)
   - Or use DevTools → Network → "Disable cache"

4. **Test with curl**
   ```bash
   curl -I "https://tiles.automatonicai.com/tiles/protomaps-north-america.pmtiles" | grep -i "access-control"
   ```
   Should return CORS headers

5. **Check Cloudflare cache**
   - May need to wait 30-60 seconds for rule propagation
   - Purge cache if needed: Dashboard → Caching → Purge Everything

## Related Files

- Test script: `scripts/test-protomaps-r2.sh` (includes CORS verification)
- Caching docs: `data/tiles/CACHING.md`
- Deployment guide: `data/tiles/README.md`
