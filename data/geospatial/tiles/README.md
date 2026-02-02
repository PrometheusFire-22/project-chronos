# Map Tiles

This directory contains PMTiles files for the Protomaps basemap.

## Production File
- **protomaps-north-america.pmtiles** (127 MB)
  - Bounds: -170°W to -50°W, 15°N to 80°N (North America)
  - Zoom levels: 0-8
  - Source: https://data.source.coop/protomaps/openstreetmap/v4.pmtiles
  - Format: Vector Protobuf (MVT), PMTiles v3
  - Deployed to: Cloudflare R2 bucket chronos-media/tiles/

## Deployment
Upload to R2:
```bash
pnpx wrangler r2 object put chronos-media/tiles/protomaps-north-america.pmtiles \
  --file data/tiles/protomaps-north-america.pmtiles \
  --content-type application/x-protobuf
```
