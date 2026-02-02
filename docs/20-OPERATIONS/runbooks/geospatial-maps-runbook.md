# Geospatial Maps Operational Runbook

## Quick Reference

### Service Status
```bash
# Check if map is loading
curl -I https://tiles.automatonicai.com/tiles/protomaps-north-america.pmtiles

# Check API health
curl https://api.automatonicai.com/api/health

# Run infrastructure tests
./scripts/test-protomaps-r2.sh
```

### Common Issues

| Symptom | Likely Cause | Fix |
|---------|--------------|-----|
| Map won't load | CORS headers missing | Check Transform Rules |
| No US data | Data ingestion failed | Run FRED ingestion |
| Slow loading | CDN cache miss | Wait for warmup |
| 404 on fonts | Font names mismatch | Verify font references |

## Architecture Overview

```
Browser → Cloudflare CDN → R2 (tiles/fonts)
Browser → Cloudflare CDN → Lightsail (FastAPI) → PostgreSQL/PostGIS
```

**Base Map**: Static (Protomaps from R2)
**Choropleth Data**: Dynamic (FastAPI + PostGIS)

## Deployment Procedures

### Deploy Frontend Changes

```bash
# From project root
cd apps/web

# Build
pnpm build

# Deploy to Cloudflare Pages
wrangler pages deploy .open-next

# Verify
curl https://automatonicai.com/analytics/geospatial
```

**Rollback**: Cloudflare Pages Dashboard → Deployments → Rollback to previous

### Update PMTiles (New Map Data)

```bash
# 1. Extract new region from Protomaps
~/bin/pmtiles extract \
  https://data.source.coop/protomaps/openstreetmap/v4.pmtiles \
  protomaps-north-america-v2.pmtiles \
  --bbox=-170,15,-50,80 \
  --maxzoom=8

# 2. Upload to R2
aws s3 cp protomaps-north-america-v2.pmtiles \
  s3://chronos-media/tiles/protomaps-north-america-v2.pmtiles \
  --profile r2 \
  --endpoint-url https://060e43df09e3ec3a256a6624ab7649f8.r2.cloudflarestorage.com \
  --content-type "application/x-protobuf" \
  --cache-control "public, max-age=31536000, immutable"

# 3. Update code to reference new file
# Edit: apps/web/components/analytics/map/GeospatialMapLibre.tsx
# Change: protomaps-north-america.pmtiles → protomaps-north-america-v2.pmtiles

# 4. Deploy frontend
pnpm build && wrangler pages deploy .open-next
```

### Add New Fonts

```bash
# 1. Download font PBF files (if not already have them)
git clone https://github.com/protomaps/basemaps-assets.git
cd basemaps-assets/fonts

# 2. Upload to R2
aws s3 sync "Noto Sans Bold/" \
  s3://chronos-media/fonts/Noto\ Sans\ Bold/ \
  --profile r2 \
  --endpoint-url https://060e43df09e3ec3a256a6624ab7649f8.r2.cloudflarestorage.com \
  --content-type "application/x-protobuf" \
  --cache-control "public, max-age=31536000, immutable"

# 3. Update font references in code (if needed)
# apps/web/components/analytics/map/GeospatialMapLibre.tsx
# Change text-font array to include new font
```

## Monitoring & Alerts

### Health Checks

**Automated** (every 5 minutes):
```bash
# Cron job: /etc/cron.d/chronos-healthcheck
*/5 * * * * /opt/chronos/scripts/test-protomaps-r2.sh || mail -s "Map Health Check Failed" alerts@automatonicai.com
```

**Manual**:
```bash
# Full infrastructure test suite
./scripts/test-protomaps-r2.sh

# Expected output:
# ✓ PASS (HTTP 200) - PMTiles accessible
# ✓ PASS (1-year cache) - Cache headers
# ✓ PASS (HTTP 200) - Fonts accessible
# ✓ PASS (wildcard) - CORS headers
```

### Key Metrics

**Cloudflare R2 Analytics**:
- Dashboard: https://dash.cloudflare.com/→ R2 → chronos-media → Metrics
- **Cache Hit Ratio**: Should be > 95% after warmup
- **Requests/day**: ~100-1000 (varies by traffic)
- **Bandwidth**: Should be near zero (all cached)

**FastAPI Metrics**:
```bash
# SSH to Lightsail
ssh chronos@16.52.210.100

# Check API logs
sudo journalctl -u chronos-api -n 100 --no-pager

# Check slow queries
sudo -u postgres psql chronos -c "
  SELECT query, calls, mean_exec_time
  FROM pg_stat_statements
  WHERE query LIKE '%geo_boundaries%'
  ORDER BY mean_exec_time DESC
  LIMIT 10;
"
```

### Alerting Thresholds

| Metric | Warning | Critical | Action |
|--------|---------|----------|--------|
| Cache hit ratio | < 90% | < 80% | Check CDN config |
| API response time | > 500ms | > 1s | Check DB queries |
| Tile load time | > 2s | > 5s | Check R2/CDN |
| Map error rate | > 1% | > 5% | Check browser console |

## Troubleshooting

### Issue: Map Shows "Failed to load map"

**Symptoms**:
- Browser console: `NetworkError when attempting to fetch resource`
- Map container shows error message

**Diagnosis**:
```bash
# Check if tiles are accessible
curl -I https://tiles.automatonicai.com/tiles/protomaps-north-america.pmtiles

# Check CORS headers
curl -I https://tiles.automatonicai.com/tiles/protomaps-north-america.pmtiles | grep -i access-control

# Check browser DevTools → Network tab
# Look for failed requests (red) to tiles.automatonicai.com
```

**Common Causes**:
1. **CORS headers missing** → Check Cloudflare Transform Rules
2. **R2 file not found** → Verify file exists in bucket
3. **DNS issue** → Check tiles.automatonicai.com resolves
4. **Browser cache** → Hard refresh (Ctrl+Shift+R)

**Fix**:
```bash
# 1. Verify Transform Rule exists
# Cloudflare Dashboard → Rules → Transform Rules → "R2 Tiles CORS Headers"
# Should inject: Access-Control-Allow-Origin: *

# 2. Verify file in R2
aws s3 ls s3://chronos-media/tiles/ --profile r2 \
  --endpoint-url https://060e43df09e3ec3a256a6624ab7649f8.r2.cloudflarestorage.com

# 3. Test from command line
curl -v https://tiles.automatonicai.com/tiles/protomaps-north-america.pmtiles \
  -H "Origin: https://automatonicai.com" \
  -H "Range: bytes=0-1023"
```

### Issue: US States Not Showing Data

**Symptoms**:
- Only Canadian provinces colored
- US states appear gray
- Console shows no errors

**Diagnosis**:
```bash
# Check API data
curl -s "https://api.automatonicai.com/api/geo/choropleth?metric=unemployment&mode=data" \
  | jq '.data[] | select(.country == "US") | {name, value}' | head -5

# If all values are null → data ingestion issue
```

**Fix**:
```bash
# SSH to Lightsail
ssh chronos@16.52.210.100

# Run US unemployment ingestion
cd /opt/chronos
source .venv/bin/activate
python src/chronos/ingestion/fred_unemployment.py --country US --all-states

# Verify data in database
psql -U chronos -d chronos -c "
  SELECT region_name, value, date
  FROM timeseries_data
  WHERE metric = 'unemployment'
    AND country = 'US'
  ORDER BY date DESC
  LIMIT 10;
"
```

### Issue: Fonts Not Loading (404 Errors)

**Symptoms**:
- Browser console: `404 Not Found` for font URLs
- Labels don't render on map

**Diagnosis**:
```bash
# Check font request in DevTools Network tab
# Look for: https://tiles.automatonicai.com/fonts/[FONT NAME]/0-255.pbf

# Test font accessibility
curl -I "https://tiles.automatonicai.com/fonts/Noto%20Sans%20Regular/0-255.pbf"
```

**Common Causes**:
1. **Font name mismatch** (e.g., requesting "Open Sans" but uploaded "Noto Sans")
2. **URL encoding issue** (spaces must be %20)
3. **File not in R2**

**Fix**:
```bash
# 1. List available fonts in R2
aws s3 ls s3://chronos-media/fonts/ --profile r2 \
  --endpoint-url https://060e43df09e3ec3a256a6624ab7649f8.r2.cloudflarestorage.com \
  --recursive | head -20

# 2. Update code to match actual font names
# apps/web/components/analytics/map/GeospatialMapLibre.tsx
# Line ~554: 'text-font': ['Noto Sans Medium', 'Noto Sans Regular']
```

### Issue: Slow Map Loading (> 5 seconds)

**Symptoms**:
- Map takes > 5 seconds to show
- Tiles load slowly
- Browser shows "Loading geospatial data..." for extended time

**Diagnosis**:
```bash
# Check CDN cache status
curl -I https://tiles.automatonicai.com/tiles/protomaps-north-america.pmtiles \
  | grep cf-cache-status

# DYNAMIC = fetching from R2 (slower, first request)
# HIT = served from edge (fast, subsequent requests)

# Check API response time
time curl -s "https://api.automatonicai.com/api/geo/choropleth?metric=unemployment&mode=boundaries" > /dev/null

# Should be < 500ms
```

**Fixes**:
```bash
# 1. If CDN cache is DYNAMIC (cold):
# → Wait 30-60 seconds, cache will warm up
# → Or pre-warm cache: curl the URL from multiple locations

# 2. If API is slow (> 500ms):
# → Check database query performance
# → Add/verify spatial index:
psql -U chronos -d chronos -c "
  CREATE INDEX CONCURRENTLY idx_geo_boundaries_geom
  ON geo_boundaries USING GIST(geometry);
"

# 3. Simplify geometries for faster serialization:
psql -U chronos -d chronos -c "
  UPDATE geo_boundaries
  SET geometry = ST_Simplify(geometry, 0.01)
  WHERE ST_NPoints(geometry) > 10000;
"
```

## Maintenance Procedures

### Weekly

- [ ] Review Cloudflare R2 analytics (cache hit ratio)
- [ ] Check Sentry errors for map component
- [ ] Verify API response times < 500ms

### Monthly

- [ ] Check for Protomaps data updates
- [ ] Review and rotate logs (PostgreSQL, FastAPI)
- [ ] Test disaster recovery procedure
- [ ] Update dependencies (pnpm update)

### Quarterly

- [ ] Audit R2 storage costs
- [ ] Review and optimize database queries
- [ ] Update PMTiles to latest Protomaps build
- [ ] Load test API endpoints

## Disaster Recovery

### Scenario: R2 Bucket Deleted

**Recovery Time**: ~1 hour

**Procedure**:
```bash
# 1. Recreate bucket
wrangler r2 bucket create chronos-media

# 2. Re-upload PMTiles
aws s3 cp data/tiles/protomaps-north-america.pmtiles \
  s3://chronos-media/tiles/protomaps-north-america.pmtiles \
  --profile r2 \
  --endpoint-url https://060e43df09e3ec3a256a6624ab7649f8.r2.cloudflarestorage.com \
  --content-type "application/x-protobuf" \
  --cache-control "public, max-age=31536000, immutable"

# 3. Re-upload fonts
cd basemaps-assets/fonts
aws s3 sync . s3://chronos-media/fonts/ \
  --profile r2 \
  --endpoint-url https://060e43df09e3ec3a256a6624ab7649f8.r2.cloudflarestorage.com \
  --content-type "application/x-protobuf" \
  --cache-control "public, max-age=31536000, immutable" \
  --exclude "*.txt"

# 4. Reconfigure custom domain
# Cloudflare Dashboard → R2 → chronos-media → Settings → Custom Domains → Add tiles.automatonicai.com

# 5. Recreate Transform Rules for CORS
# Rules → Transform Rules → Create "R2 Tiles CORS Headers"
```

### Scenario: Database Corruption

**Recovery Time**: ~30 minutes (from backup)

**Procedure**:
```bash
# 1. Stop FastAPI
sudo systemctl stop chronos-api

# 2. Restore from latest backup
sudo -u postgres pg_restore -d chronos /var/backups/postgresql/chronos_latest.dump

# 3. Verify data integrity
psql -U chronos -d chronos -c "SELECT COUNT(*) FROM geo_boundaries;"
psql -U chronos -d chronos -c "SELECT COUNT(*) FROM timeseries_data;"

# 4. Restart FastAPI
sudo systemctl start chronos-api

# 5. Verify map loads
curl https://api.automatonicai.com/api/geo/choropleth?metric=unemployment&mode=data
```

## Contacts

- **On-Call Engineer**: [Your contact]
- **Cloudflare Support**: https://dash.cloudflare.com/support
- **AWS Lightsail Support**: https://console.aws.amazon.com/support

## References

- Architecture: `docs/10-DEVELOPMENT/00-ARCHITECTURE/cloud-architecture-overview.md`
- Protomaps Docs: `docs/10-DEVELOPMENT/03-GEOSPATIAL/01-protomaps-architecture.md`
- FastAPI Integration: `docs/10-DEVELOPMENT/03-GEOSPATIAL/02-fastapi-integration.md`
- Test Script: `scripts/test-protomaps-r2.sh`
- CORS Fix: `data/tiles/CORS-FIX.md`
- Caching Guide: `data/tiles/CACHING.md`
