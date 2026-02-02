# Protomaps + R2 Architecture

## Overview

Project Chronos uses a production-grade, self-hosted vector mapping stack built on Protomaps PMTiles served from Cloudflare R2. This provides zero-cost egress, global CDN distribution, and complete independence from third-party tile services.

## Architecture Diagram

```
┌─────────────────────────────────────────────────────┐
│  Browser (MapLibre GL JS 4.7.1)                    │
│  - PMTiles Protocol Handler                         │
│  - Vector Tile Rendering Engine                     │
│  - Client-side caching                              │
└──────────────────┬──────────────────────────────────┘
                   │ HTTPS (HTTP/2)
                   │ Range Requests (206 Partial Content)
                   ▼
┌─────────────────────────────────────────────────────┐
│  Cloudflare CDN (300+ Global Edge Locations)       │
│  - Cache Status: HIT (after first request)          │
│  - Transform Rules: CORS headers injection          │
│  - Cache TTL: 1 year (immutable)                    │
└──────────────────┬──────────────────────────────────┘
                   │ Custom Domain
                   │ tiles.automatonicai.com
                   ▼
┌─────────────────────────────────────────────────────┐
│  Cloudflare R2 Storage (Zero Egress)               │
│  Bucket: chronos-media                              │
│  ├─ /tiles/                                         │
│  │  └─ protomaps-north-america.pmtiles (127 MB)    │
│  └─ /fonts/                                         │
│     ├─ Noto Sans Regular/ (256 PBF files)          │
│     ├─ Noto Sans Medium/ (256 PBF files)           │
│     ├─ Noto Sans Italic/ (256 PBF files)           │
│     └─ Noto Sans Devanagari Regular v1/ (256 PBF)  │
└─────────────────────────────────────────────────────┘
```

## Data Flow

### 1. Map Initialization
```typescript
// Browser: GeospatialMapLibre.tsx
const protocol = new Protocol();
maplibregl.addProtocol('pmtiles', protocol.tile);

map = new maplibregl.Map({
  style: {
    glyphs: 'https://tiles.automatonicai.com/fonts/{fontstack}/{range}.pbf',
    sources: {
      'protomaps': {
        type: 'vector',
        url: 'pmtiles://tiles.automatonicai.com/tiles/protomaps-north-america.pmtiles'
      }
    }
  }
});
```

### 2. Tile Request Flow
1. **Browser** requests tile at zoom Z, x X, y Y
2. **PMTiles Protocol** converts to HTTP Range Request: `Range: bytes=START-END`
3. **Cloudflare CDN** checks cache:
   - **HIT**: Serves from edge (< 50ms globally)
   - **MISS**: Fetches from R2, caches, serves
4. **MapLibre** decodes vector tile (PBF), renders to canvas

### 3. Choropleth Overlay
```typescript
// Browser requests boundaries and data from FastAPI
const [boundaries, data] = await Promise.all([
  fetch('https://api.automatonicai.com/api/geo/choropleth?metric=unemployment&mode=boundaries'),
  fetch('https://api.automatonicai.com/api/geo/choropleth?metric=unemployment&mode=data')
]);

// Merge data into boundaries
boundaries.features.map(feature => ({
  ...feature,
  properties: {
    ...feature.properties,
    value: dataMap.get(feature.properties.name)?.value ?? null
  }
}));

// Add choropleth layer ABOVE base map
map.addLayer({
  id: 'regions-fill',
  type: 'fill',
  source: 'regions',
  paint: {
    'fill-color': getColorForValue(value) // D3 scale
  }
});
```

## Key Technologies

### PMTiles Format
- **Single-file archive** containing all map tiles
- **HTTP Range Request compatible** - fetch only needed tiles
- **Efficient**: ~127 MB for North America (zoom 0-8)
- **Spec**: https://github.com/protomaps/PMTiles

### MapLibre GL JS
- **Open-source** fork of Mapbox GL JS v1
- **Vector tile rendering** using WebGL
- **Client-side styling** and interactivity
- **Protocol extensibility** (pmtiles://)

### Cloudflare R2
- **S3-compatible** object storage
- **Zero egress** fees (unlimited bandwidth)
- **Global CDN** integration included
- **Cost**: ~$0.0015/month for 127 MB storage

## Performance Characteristics

### Cold Start (First Load)
- **PMTiles metadata fetch**: ~100-200ms (1 request)
- **Initial tile batch**: ~200-500ms (4-8 tiles)
- **Font glyphs**: ~100-300ms (2-4 ranges)
- **Total FCP**: < 2 seconds

### Warm Cache (Subsequent Loads)
- **All resources**: < 50ms (CDN HIT)
- **Zero R2 egress** (served from edge)
- **Bandwidth savings**: ~99%

### Scalability
- **Concurrent users**: Unlimited (CDN scales automatically)
- **Geographic distribution**: 300+ Cloudflare data centers
- **Cost at scale**: $0 bandwidth (R2 zero egress)

## Data Sources

### Base Map (Protomaps)
- **Source**: https://data.source.coop/protomaps/openstreetmap/v4.pmtiles
- **Data**: OpenStreetMap + Natural Earth
- **License**: ODbL (OpenStreetMap)
- **Coverage**: Global (we extracted North America)
- **Update frequency**: Daily builds available

### Fonts (Noto Sans)
- **Source**: https://github.com/protomaps/basemaps-assets
- **License**: SIL Open Font License
- **Format**: PBF (Protocol Buffer glyph ranges)
- **Total files**: 1,024 PBF files (4 font families × 256 ranges)

### Choropleth Data (Project Chronos)
- **Source**: FastAPI backend (`/api/geo/choropleth`)
- **Database**: PostGIS (PostgreSQL)
- **Pipeline**: FRED API → TimescaleDB → PostGIS boundaries
- **Update frequency**: Real-time (on data ingestion)

## Deployment Architecture

### Production Stack
```
Next.js (Cloudflare Pages / OpenNext)
├─ Frontend: React + MapLibre GL JS
├─ API Routes: Edge functions
└─ Static Assets: Cloudflare CDN

FastAPI (AWS Lightsail)
├─ API: /api/geo/choropleth
├─ Database: TimescaleDB + PostGIS
└─ Workers: Celery + Redis

Cloudflare R2
├─ Tiles: protomaps-north-america.pmtiles
└─ Fonts: Noto Sans (4 variants, 1024 files)
```

### Geographic Distribution
- **Frontend**: Global (Cloudflare Pages)
- **API**: us-east-2 (AWS Lightsail)
- **Tiles**: Global (Cloudflare CDN caching R2)
- **Database**: us-east-2 (AWS Lightsail)

## Cost Analysis

### Monthly Costs (At Scale)
| Component | Cost | Notes |
|-----------|------|-------|
| R2 Storage (127 MB) | $0.0015 | $0.015/GB |
| R2 Operations (writes) | $0.00 | One-time upload |
| R2 Egress | $0.00 | Zero egress to CF CDN |
| Cloudflare CDN | $0.00 | Included |
| **Total** | **$0.0015/month** | **< $0.02/year** |

### Comparison to Alternatives
| Service | Cost/Month | Notes |
|---------|-----------|-------|
| **Protomaps + R2** | **$0.0015** | Self-hosted, unlimited bandwidth |
| Mapbox | $599+ | 50K loads/month, then $1/1K |
| Stadia Maps | $49+ | 10K loads/month |
| Google Maps | $200+ | 28K loads/month |

## Security & Privacy

### Data Privacy
- ✅ **Zero third-party dependencies** (no MapBox/Google tracking)
- ✅ **Self-hosted tiles** (no external requests for base map)
- ✅ **No analytics beacons** in tile requests
- ✅ **GDPR compliant** (no PII in map data)

### Security
- ✅ **HTTPS/TLS enforced** (HTTP/2)
- ✅ **CORS properly configured** (wildcard safe for public tiles)
- ✅ **No API keys exposed** (R2 public domain)
- ✅ **Immutable caching** (cache poisoning resistant)

## Monitoring & Observability

### Key Metrics
1. **Cloudflare Analytics** → R2 bucket metrics
   - Requests/second
   - Cache hit ratio (target: > 95%)
   - Bandwidth (should be near zero after warmup)

2. **Browser Performance** (via Sentry)
   - Map initialization time (target: < 2s)
   - Tile rendering FPS (target: 60fps)
   - Memory usage (target: < 100 MB)

3. **API Performance** (FastAPI metrics)
   - `/api/geo/choropleth` response time (target: < 500ms)
   - Database query time (target: < 200ms)
   - Boundary GeoJSON size (current: ~580 KB)

### Alerts
- R2 cache hit ratio < 90% (investigate cold regions)
- API response time > 1s (database slow query)
- Map initialization > 3s (bundle size issue)

## Future Enhancements

### Planned
1. **Multiple zoom levels** (currently 0-8, expand to 0-12)
2. **Dynamic tile generation** (Cloudflare Workers + PostGIS)
3. **Real-time data updates** (WebSocket choropleth updates)
4. **3D terrain** (DEM tiles + MapLibre terrain)

### Considered
1. **Sprite self-hosting** (currently using demo tiles)
2. **Multiple themes** (light mode, satellite, terrain)
3. **Offline support** (Service Worker + IndexedDB)
4. **Vector tile caching** (client-side LRU cache)

## References

- **Protomaps Docs**: https://protomaps.com
- **PMTiles Spec**: https://github.com/protomaps/PMTiles
- **MapLibre GL JS**: https://maplibre.org
- **Cloudflare R2**: https://developers.cloudflare.com/r2/
- **PostGIS**: https://postgis.net
