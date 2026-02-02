# Project Chronos: Cloud Architecture Overview

## System Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                                 USERS                                       │
│                    (Global - Web Browsers & APIs)                           │
└────────────────────────────────┬────────────────────────────────────────────┘
                                 │ HTTPS
                    ┌────────────┴────────────┐
                    │                         │
              ┌─────▼─────┐           ┌──────▼──────┐
              │ Frontend  │           │ API Clients │
              │ (Next.js) │           │ (External)  │
              └─────┬─────┘           └──────┬──────┘
                    │                        │
┌───────────────────┴────────────────────────┴───────────────────────────────┐
│                        CLOUDFLARE (Global Edge)                             │
│ ┌─────────────────────┐  ┌──────────────────┐  ┌───────────────────────┐  │
│ │ Pages (Frontend)    │  │ R2 (Tiles/Fonts) │  │ Transform Rules       │  │
│ │ • Next.js SSR/SSG   │  │ • PMTiles        │  │ • CORS headers        │  │
│ │ • Edge Functions    │  │ • Font glyphs    │  │ • Security headers    │  │
│ │ • CDN caching       │  │ • Zero egress    │  │ • Rate limiting       │  │
│ └─────────┬───────────┘  └────────┬─────────┘  └────────────┬──────────┘  │
└───────────┼──────────────────────────────────────────────────┼─────────────┘
            │                      │                            │
            │ API Calls            │ Static Assets              │ CORS
            │ (SSR/Client)         │ (Global CDN)               │
            │                      │                            │
┌───────────▼──────────────────────────────────────────────────────────────────┐
│                        AWS LIGHTSAIL (us-east-2)                             │
│                                                                              │
│ ┌──────────────────────────────────────────────────────────────────────┐   │
│ │ FastAPI Backend (Ubuntu 20.04 LTS)                                   │   │
│ │ ┌──────────────────┐  ┌───────────────┐  ┌────────────────────────┐ │   │
│ │ │ FastAPI          │  │ Celery Workers│  │ Redis                  │ │   │
│ │ │ • REST API       │  │ • Data tasks  │  │ • Task queue          │ │   │
│ │ │ • Hyperdrive     │  │ • Async jobs  │  │ • Session cache       │ │   │
│ │ │ • Uvicorn        │  │ • Schedulers  │  │ • Rate limiting       │ │   │
│ │ └────────┬─────────┘  └───────┬───────┘  └──────────┬─────────────┘ │   │
│ │          │                    │                      │               │   │
│ │          └────────────────────┴──────────────────────┘               │   │
│ │                               │                                      │   │
│ │          ┌────────────────────▼──────────────────────┐               │   │
│ │          │ PostgreSQL + TimescaleDB + PostGIS       │               │   │
│ │          │ • Time-series data (metrics)             │               │   │
│ │          │ • Geospatial boundaries (PostGIS)        │               │   │
│ │          │ • User data, sessions, analytics         │               │   │
│ │          │ • Automated backups (daily)              │               │   │
│ │          └──────────────────────────────────────────┘               │   │
│ └──────────────────────────────────────────────────────────────────────┘   │
│                                                                              │
│ ┌──────────────────────────────────────────────────────────────────────┐   │
│ │ Directus CMS (Ubuntu 20.04 LTS)                                      │   │
│ │ • Headless CMS for marketing content                                 │   │
│ │ • Connects to same PostgreSQL database                               │   │
│ │ • API: admin.automatonicai.com                                       │   │
│ └──────────────────────────────────────────────────────────────────────┘   │
└──────────────────────────────────────────────────────────────────────────────┘

┌───────────────────────────────────────────────────────────────────────────────┐
│                            EXTERNAL SERVICES                                  │
│ ┌──────────────┐  ┌─────────────────┐  ┌──────────────┐  ┌──────────────┐  │
│ │ FRED API     │  │ Statistics CA   │  │ Sentry.io    │  │ GitHub       │  │
│ │ (Economic)   │  │ (Canadian data) │  │ (Monitoring) │  │ (CI/CD)      │  │
│ └──────────────┘  └─────────────────┘  └──────────────┘  └──────────────┘  │
└───────────────────────────────────────────────────────────────────────────────┘
```

## Component Details

### Frontend (Cloudflare Pages + OpenNext)

**Technology Stack**:
- **Framework**: Next.js 14.2 (App Router)
- **Deployment**: Cloudflare Pages (OpenNext adapter)
- **UI Library**: React 18 + TypeScript
- **Styling**: Tailwind CSS 3.4
- **Maps**: MapLibre GL JS 4.7.1
- **State**: React Context + Server Components

**Deployment Flow**:
```bash
# Local build
pnpm build

# OpenNext transforms Next.js → Cloudflare Workers
.open-next/
├── assets/          # Static files → Pages
├── cache/           # ISR cache → KV
├── server-function/ # API routes → Workers
└── image-optimization/ # Images → Workers

# Deploy via Wrangler
wrangler pages deploy .open-next
```

**Environment Variables** (`.env.local`):
```bash
# API Backend
NEXT_PUBLIC_API_URL=https://api.automatonicai.com

# R2 Tiles
NEXT_PUBLIC_R2_TILES_URL=https://tiles.automatonicai.com

# CMS
NEXT_PUBLIC_DIRECTUS_URL=https://admin.automatonicai.com

# Analytics
NEXT_PUBLIC_SENTRY_DSN=https://...
```

### Backend (FastAPI on AWS Lightsail)

**Server Specifications**:
- **Instance**: AWS Lightsail (us-east-2)
- **Size**: 2 vCPU, 4 GB RAM, 80 GB SSD
- **OS**: Ubuntu 20.04 LTS
- **Cost**: ~$24/month

**Technology Stack**:
- **Framework**: FastAPI 0.104 (Python 3.11)
- **ASGI Server**: Uvicorn + Gunicorn
- **Database**: PostgreSQL 14 + TimescaleDB 2.11 + PostGIS 3.3
- **Task Queue**: Celery 5.3 + Redis 7.0
- **Process Manager**: systemd

**Key Services**:
```bash
# FastAPI application
systemctl status chronos-api.service

# Celery workers (data ingestion)
systemctl status chronos-worker.service

# Redis (task queue + caching)
systemctl status redis.service

# PostgreSQL (database)
systemctl status postgresql.service
```

**API Endpoints**:
- `GET /api/geo/choropleth` - Geospatial data
- `GET /api/metrics/{metric}` - Time-series data
- `GET /api/health` - Health check
- `GET /docs` - OpenAPI documentation

### Database (PostgreSQL + Extensions)

**Database**: `chronos`

**Extensions**:
- **TimescaleDB**: Time-series optimization (hypertables)
- **PostGIS**: Geospatial data types and functions
- **pg_stat_statements**: Query performance monitoring

**Key Tables**:
```sql
-- Time-series data (hypertable)
CREATE TABLE timeseries_data (
    time TIMESTAMPTZ NOT NULL,
    metric VARCHAR(50) NOT NULL,
    region_name VARCHAR(255) NOT NULL,
    country CHAR(2) NOT NULL,
    value NUMERIC,
    units VARCHAR(20),
    PRIMARY KEY (time, metric, region_name)
);

SELECT create_hypertable('timeseries_data', 'time');

-- Geospatial boundaries (PostGIS)
CREATE TABLE geo_boundaries (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    country CHAR(2) NOT NULL,
    region_type VARCHAR(50),
    geometry GEOMETRY(MultiPolygon, 4326),
    UNIQUE(name, country)
);

CREATE INDEX idx_geo_boundaries_geom
ON geo_boundaries USING GIST(geometry);
```

**Backup Strategy**:
- **Automated daily backups**: pg_dump → S3
- **Point-in-time recovery**: WAL archiving
- **Retention**: 30 days

### Static Assets (Cloudflare R2)

**Bucket**: `chronos-media`

**Structure**:
```
chronos-media/
├── tiles/
│   └── protomaps-north-america.pmtiles (127 MB)
└── fonts/
    ├── Noto Sans Regular/ (256 PBF files)
    ├── Noto Sans Medium/ (256 PBF files)
    ├── Noto Sans Italic/ (256 PBF files)
    └── Noto Sans Devanagari Regular v1/ (256 PBF files)
```

**Custom Domain**: `tiles.automatonicai.com`

**Cache Headers**:
- `Cache-Control: public, max-age=31536000, immutable` (1 year)
- `Access-Control-Allow-Origin: *` (CORS)
- `Content-Type: application/x-protobuf`

## Data Flow: End-to-End

### Example: Unemployment Choropleth

1. **User visits** `/analytics/geospatial?metric=unemployment`

2. **Next.js SSR** (Cloudflare Pages):
   - Renders page shell
   - Sends HTML to browser

3. **Browser loads**:
   - JavaScript bundle from Cloudflare CDN
   - MapLibre component initializes

4. **Base map loads**:
   - MapLibre requests: `pmtiles://tiles.automatonicai.com/tiles/protomaps-north-america.pmtiles`
   - PMTiles protocol converts to range requests
   - Cloudflare CDN serves (cache HIT after first load)
   - MapLibre renders vector tiles

5. **Choropleth data loads** (parallel requests):
   ```typescript
   const [boundaries, data] = await Promise.all([
     fetch('https://api.automatonicai.com/api/geo/choropleth?metric=unemployment&mode=boundaries'),
     fetch('https://api.automatonicai.com/api/geo/choropleth?metric=unemployment&mode=data')
   ]);
   ```

6. **FastAPI processes**:
   - Query PostGIS for boundaries (GeoJSON)
   - Query TimescaleDB for latest unemployment values
   - Join data on region name
   - Return JSON

7. **Client merges**:
   - Join boundaries + values in JavaScript
   - Calculate colors using D3 scale
   - Add choropleth layer to map

8. **User interacts**:
   - Click state → Show popup with value
   - Zoom/pan → Load new tiles (range requests)
   - Change metric → Fetch new data from API

## Deployment & CI/CD

### Frontend Deployment

```bash
# Automatic via GitHub Actions
.github/workflows/deploy-frontend.yml

on:
  push:
    branches: [main]
    paths: ['apps/web/**']

jobs:
  deploy:
    - pnpm build
    - wrangler pages deploy .open-next
```

### Backend Deployment

```bash
# Manual deployment (SSH)
ssh chronos@lightsail-server

cd /opt/chronos
git pull origin main
pip install -r requirements.txt
systemctl restart chronos-api
systemctl restart chronos-worker
```

## Monitoring & Observability

### Application Monitoring
- **Frontend**: Sentry.io (error tracking)
- **Backend**: Sentry.io + FastAPI logging
- **Database**: pg_stat_statements + slow query log

### Infrastructure Monitoring
- **Cloudflare**: Analytics dashboard (requests, cache hit ratio)
- **Lightsail**: CloudWatch metrics (CPU, RAM, disk)
- **R2**: Cloudflare analytics (bandwidth, operations)

### Key Metrics
- **Frontend**: FCP < 2s, INP < 200ms
- **API**: P95 response time < 500ms
- **Database**: Query time < 200ms
- **Cache**: Hit ratio > 95%

## Security

### Authentication & Authorization
- **Frontend**: OAuth 2.0 (future: user accounts)
- **API**: API keys for external integrations
- **Database**: Connection via Cloudflare Hyperdrive (encrypted)

### Network Security
- **HTTPS/TLS**: Enforced (HTTP/2)
- **CORS**: Configured per origin
- **Rate Limiting**: Cloudflare Transform Rules
- **DDoS Protection**: Cloudflare (automatic)

### Data Security
- **Encryption at rest**: PostgreSQL (LUKS)
- **Encryption in transit**: TLS 1.3
- **Backups**: Encrypted (AES-256)
- **Secrets**: Environment variables (not in git)

## Cost Breakdown (Monthly)

| Service | Cost | Notes |
|---------|------|-------|
| AWS Lightsail (API + DB) | $24 | 2 vCPU, 4 GB RAM |
| Cloudflare Pages | $0 | Free tier |
| Cloudflare R2 | $0.0015 | 127 MB storage |
| Domain (automatonicai.com) | $1.67 | $20/year |
| Sentry.io | $0 | Free tier |
| **Total** | **~$26/month** | **$312/year** |

## Scaling Considerations

### Current Capacity
- **Concurrent users**: ~100-500 (Cloudflare auto-scales)
- **API requests**: ~10-50 req/s (Lightsail limits)
- **Database**: ~1000 simultaneous connections (pooled)
- **Storage**: 80 GB (60% used)

### Bottlenecks
1. **FastAPI** (single Lightsail instance) - Scale to Kubernetes
2. **PostgreSQL** (single instance) - Add read replicas
3. **Data ingestion** (Celery) - Add more workers

### Future Scaling Path
1. **Phase 1** (0-1K users): Current setup ✅
2. **Phase 2** (1K-10K users): Upgrade Lightsail, add Redis cluster
3. **Phase 3** (10K-100K users): Migrate to EKS, RDS Multi-AZ
4. **Phase 4** (100K+ users): Global database replication, CDN everything

## References

- **Next.js**: https://nextjs.org
- **FastAPI**: https://fastapi.tiangolo.com
- **Cloudflare Pages**: https://pages.cloudflare.com
- **Cloudflare R2**: https://developers.cloudflare.com/r2/
- **PostGIS**: https://postgis.net
- **TimescaleDB**: https://www.timescale.com
