# FastAPI + Geospatial Integration

## Overview

The geospatial visualization in Project Chronos combines **client-side vector rendering** (MapLibre + Protomaps) with **server-side data processing** (FastAPI + PostGIS). This architecture separates concerns: base maps are static and cached globally, while choropleth data is dynamic and sourced from TimescaleDB.

## Architecture Integration

```
┌───────────────────────────────────────────────────────────────┐
│ Frontend (Next.js + MapLibre)                                 │
│ ┌─────────────────┐  ┌──────────────────────────────────────┐│
│ │ Base Map        │  │ Choropleth Data                      ││
│ │ (Protomaps/R2)  │  │ (FastAPI/PostGIS)                    ││
│ │                 │  │                                      ││
│ │ • Vector tiles  │  │ • GeoJSON boundaries                 ││
│ │ • Static        │  │ • Dynamic metric values              ││
│ │ • Cached (CDN)  │  │ • Real-time updates                  ││
│ │ • Zero egress   │  │ • Database-driven                    ││
│ └─────────────────┘  └──────────────────────────────────────┘│
└───────────────────────────────────────────────────────────────┘
                   │                          │
                   │ pmtiles://              │ HTTPS
                   │ tiles.automatonicai.com │ api.automatonicai.com
                   ▼                          ▼
┌──────────────────────────┐   ┌─────────────────────────────────┐
│ Cloudflare R2            │   │ FastAPI Backend                 │
│ • Protomaps PMTiles      │   │ AWS Lightsail (us-east-2)       │
│ • Font glyphs (PBF)      │   │                                 │
│ • Global CDN caching     │   │ ┌─────────────────────────────┐ │
└──────────────────────────┘   │ │ /api/geo/choropleth         │ │
                               │ │ - mode=boundaries (GeoJSON) │ │
                               │ │ - mode=data (metric values) │ │
                               │ └─────────────────────────────┘ │
                               │           │                     │
                               │           ▼                     │
                               │ ┌─────────────────────────────┐ │
                               │ │ PostGIS Database            │ │
                               │ │ • geo_boundaries table      │ │
                               │ │ • timeseries data (metrics) │ │
                               │ │ • Spatial joins             │ │
                               │ └─────────────────────────────┘ │
                               └─────────────────────────────────┘
```

## API Endpoints

### GET /api/geo/choropleth

**Purpose**: Fetch boundaries and metric data for choropleth visualization.

**Parameters**:
- `metric` (required): Metric name (e.g., "unemployment", "hpi")
- `mode` (required): "boundaries" or "data"
- `date` (optional): Specific date for time-series data

**Example Requests**:
```bash
# Get GeoJSON boundaries for all regions
GET https://api.automatonicai.com/api/geo/choropleth?metric=unemployment&mode=boundaries

# Get current unemployment values for all regions
GET https://api.automatonicai.com/api/geo/choropleth?metric=unemployment&mode=data
```

**Response Format (mode=boundaries)**:
```json
{
  "type": "FeatureCollection",
  "features": [
    {
      "type": "Feature",
      "geometry": {
        "type": "MultiPolygon",
        "coordinates": [[[[-87.49, 30.38], ...]]]
      },
      "properties": {
        "name": "Alabama",
        "country": "US",
        "region_type": "state"
      }
    }
  ]
}
```

**Response Format (mode=data)**:
```json
{
  "data": [
    {
      "name": "Alabama",
      "country": "US",
      "value": 3.8,
      "units": "%",
      "metric": "unemployment",
      "date": "2024-12-01"
    }
  ]
}
```

## Database Schema

### geo_boundaries Table (PostGIS)

```sql
CREATE TABLE geo_boundaries (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    country CHAR(2) NOT NULL,  -- 'US' or 'CA'
    region_type VARCHAR(50),   -- 'state', 'province', 'territory'
    geometry GEOMETRY(MultiPolygon, 4326),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),

    UNIQUE(name, country)
);

CREATE INDEX idx_geo_boundaries_geom
ON geo_boundaries USING GIST(geometry);

CREATE INDEX idx_geo_boundaries_country
ON geo_boundaries(country);
```

### Example Query (Choropleth Data)

```sql
-- Fetch unemployment data with boundaries
SELECT
    b.name,
    b.country,
    ST_AsGeoJSON(b.geometry) as geometry,
    d.value,
    d.date,
    'unemployment' as metric,
    '%' as units
FROM geo_boundaries b
LEFT JOIN (
    SELECT
        region_name,
        value,
        date
    FROM timeseries_data
    WHERE metric = 'unemployment'
        AND date = (SELECT MAX(date) FROM timeseries_data WHERE metric = 'unemployment')
) d ON b.name = d.region_name
ORDER BY b.name;
```

## Data Ingestion Pipeline

### 1. Source Data → TimescaleDB

```python
# src/chronos/ingestion/fred_unemployment.py
from fredapi import Fred
import psycopg2

fred = Fred(api_key=FRED_API_KEY)

# Fetch US state unemployment rates
for state in US_STATES:
    series_id = f"UNEMPLOYMENT_{state}"
    data = fred.get_series(series_id)

    # Insert into TimescaleDB
    cursor.execute("""
        INSERT INTO timeseries_data (metric, region_name, country, value, date)
        VALUES (%s, %s, %s, %s, %s)
        ON CONFLICT (metric, region_name, date)
        DO UPDATE SET value = EXCLUDED.value
    """, ('unemployment', state, 'US', value, date))
```

### 2. Boundaries → PostGIS

```python
# src/chronos/ingestion/geo_boundaries.py
import geopandas as gpd
from sqlalchemy import create_engine

# Load US state boundaries from Census TIGER/Line
states_gdf = gpd.read_file('tl_2023_us_state.shp')

# Transform to WGS84 (EPSG:4326)
states_gdf = states_gdf.to_crs(epsg=4326)

# Upload to PostGIS
engine = create_engine(DATABASE_URL)
states_gdf.to_postgis('geo_boundaries', engine, if_exists='append')
```

### 3. FastAPI Endpoint

```python
# src/chronos/api/routes/geo.py
from fastapi import APIRouter, Query
from geoalchemy2.shape import to_shape
from shapely.geometry import mapping

router = APIRouter()

@router.get("/api/geo/choropleth")
async def get_choropleth_data(
    metric: str = Query(..., description="Metric name"),
    mode: str = Query(..., description="boundaries or data")
):
    if mode == "boundaries":
        # Return GeoJSON boundaries
        query = """
            SELECT name, country, ST_AsGeoJSON(geometry) as geom
            FROM geo_boundaries
            ORDER BY name
        """
        results = await db.fetch_all(query)

        features = []
        for row in results:
            features.append({
                "type": "Feature",
                "geometry": json.loads(row['geom']),
                "properties": {
                    "name": row['name'],
                    "country": row['country']
                }
            })

        return {
            "type": "FeatureCollection",
            "features": features
        }

    elif mode == "data":
        # Return metric values
        query = """
            SELECT
                b.name,
                b.country,
                d.value,
                d.date,
                d.units
            FROM geo_boundaries b
            LEFT JOIN timeseries_data d
                ON b.name = d.region_name
                AND d.metric = :metric
            WHERE d.date = (
                SELECT MAX(date) FROM timeseries_data WHERE metric = :metric
            )
            ORDER BY b.name
        """
        results = await db.fetch_all(query, {"metric": metric})

        return {
            "data": [
                {
                    "name": row['name'],
                    "country": row['country'],
                    "value": row['value'],
                    "units": row['units'],
                    "metric": metric,
                    "date": row['date']
                }
                for row in results
            ]
        }
```

## Frontend Integration

### Component: GeospatialMapLibre.tsx

```typescript
// 1. Initialize MapLibre with Protomaps base layer
const map = new maplibregl.Map({
  style: {
    version: 8,
    glyphs: `${R2_TILES_URL}/fonts/{fontstack}/{range}.pbf`,
    sources: {
      'protomaps': {
        type: 'vector',
        url: `pmtiles://${R2_TILES_URL}/tiles/protomaps-north-america.pmtiles`
      }
    },
    layers: [
      { id: 'background', type: 'background', paint: { 'background-color': '#020617' }},
      { id: 'water', type: 'fill', source: 'protomaps', 'source-layer': 'water', ...},
      // ... other base layers
    ]
  }
});

// 2. Fetch choropleth data from FastAPI
const [boundariesRes, dataRes] = await Promise.all([
  fetch(`${API_URL}/api/geo/choropleth?metric=${metric}&mode=boundaries`),
  fetch(`${API_URL}/api/geo/choropleth?metric=${metric}&mode=data`)
]);

const boundaries = await boundariesRes.json();
const dataResponse = await dataRes.json();

// 3. Merge data into boundaries
const dataMap = new Map(dataResponse.data.map(d => [d.name, d]));

boundaries.features = boundaries.features.map(feature => ({
  ...feature,
  properties: {
    ...feature.properties,
    value: dataMap.get(feature.properties.name)?.value ?? null
  }
}));

// 4. Add choropleth layer
map.addSource('regions', {
  type: 'geojson',
  data: boundaries
});

map.addLayer({
  id: 'regions-fill',
  type: 'fill',
  source: 'regions',
  paint: {
    'fill-color': [
      'case',
      ['==', ['get', 'value'], null], '#1e293b',  // Gray for missing data
      ['interpolate', ['linear'], ['get', 'value'],
        0, '#fef3c7',    // Yellow (low unemployment)
        10, '#991b1b'    // Dark red (high unemployment)
      ]
    ],
    'fill-opacity': 0.65
  }
});
```

## Data Flow Summary

1. **User visits page** → Next.js loads GeospatialMapLibre component
2. **Component mounts** → MapLibre initializes with Protomaps base layer
3. **Base map tiles load** → From R2 via CDN (cached)
4. **Choropleth data loads** → From FastAPI (dynamic)
5. **Data merges** → Client-side join of boundaries + values
6. **Choropleth renders** → D3 color scale applied, layer added above base map
7. **User interacts** → Tooltips show values, zoom/pan updates tiles

## Performance Optimization

### Backend (FastAPI)
- **Database connection pooling** (SQLAlchemy)
- **Query optimization** (spatial indexes on geometry)
- **Response caching** (Redis, 5-minute TTL for boundaries)
- **GeoJSON simplification** (ST_Simplify for lower zoom levels)

### Frontend (Next.js)
- **Parallel requests** (boundaries + data fetched simultaneously)
- **Client-side caching** (React state for boundaries)
- **Debounced metric changes** (avoid rapid API calls)
- **Lazy loading** (map component code-split)

## Error Handling

### Missing Data Scenarios

| Scenario | Behavior | Visual |
|----------|----------|--------|
| No boundaries | Show error message | "Failed to load map" |
| No data values | Render gray regions | `#1e293b` (slate-800) |
| Null values | Render gray | Same as no data |
| API timeout | Retry 3x, then error | "Failed to load data" |

### Example: Handling Null Values

```typescript
// Current issue: US states return null values
{
  "name": "Colorado",
  "value": null  // ← Data not ingested yet
}

// Frontend renders this as gray (#1e293b)
const getColorForValue = (value: number | null): string => {
  if (value === null) return '#1e293b';  // Gray for missing data
  return colorScale(value);  // D3 quantile scale
};
```

## Troubleshooting

### US States Not Rendering

**Symptom**: Only Canadian provinces show on map

**Root Cause**: US unemployment data not ingested
```json
{"name": "Colorado", "country": "US", "value": null}
```

**Fix**: Run US data ingestion
```bash
python src/chronos/ingestion/fred_unemployment.py --states all
```

### API Slow Response (> 1s)

**Symptoms**: Map loads slowly, boundaries fetch takes > 500ms

**Diagnosis**:
```sql
-- Check query performance
EXPLAIN ANALYZE
SELECT name, ST_AsGeoJSON(geometry)
FROM geo_boundaries;
```

**Fixes**:
- Add GIST spatial index (if missing)
- Simplify geometries: `ST_Simplify(geometry, 0.01)`
- Enable Redis caching for boundaries

## Next Steps

1. **Fix US data ingestion** (immediate)
2. **Add Canadian territory data** (Statistics Canada API)
3. **Implement caching** (Redis for boundaries)
4. **Add more metrics** (HPI, GDP, population)
5. **Real-time updates** (WebSocket for live data)
