# ADR 013: Geospatial Data Ingestion Strategy

**Status**: Proposed  
**Date**: 2025-11-25  
**Decision Makers**: Geoff Bevans, Claude Code  
**Tags**: `geospatial`, `postgis`, `data-ingestion`, `tiger`, `statscan`

---

## Context

Project Chronos requires geospatial data from US Census TIGER/Line and Statistics Canada as foundational layers for spatial queries alongside economic time-series data. This data was previously loaded but lost due to accidental Docker volume deletion.

### Requirements

1. **Data Sources**: US Census TIGER/Line shapefiles, Statistics Canada shapefiles
2. **Target**: PostgreSQL with PostGIS extension
3. **Automation**: Repeatable, scriptable process
4. **Maintainability**: Easy to update with new data releases
5. **Performance**: Efficient loading of large datasets
6. **Validation**: Data quality checks after ingestion

### Data Characteristics

- **Format**: Shapefiles (.shp + .shx + .dbf + .prj)
- **Size**: Varies from MB (states) to GB (blocks)
- **Frequency**: Annual updates from Census Bureau
- **Coordinate System**: Typically NAD83 or WGS84

---

## Decision

We will use **GeoPandas** as the primary tool for geospatial data ingestion, with **ogr2ogr** as a fallback for very large datasets.

### Implementation

```python
# src/chronos/geospatial/ingest_shapefiles.py
import geopandas as gpd
from sqlalchemy import create_engine
from pathlib import Path
import logging

def ingest_shapefile(shapefile_path, table_name, engine, srid=4326):
    """Load shapefile into PostGIS"""
    logger.info(f"Loading {shapefile_path} into {table_name}")
    
    # Read shapefile
    gdf = gpd.read_file(shapefile_path)
    
    # Reproject to WGS84 if needed
    if gdf.crs.to_epsg() != srid:
        gdf = gdf.to_crs(epsg=srid)
    
    # Load to PostGIS
    gdf.to_postgis(
        table_name, 
        engine, 
        if_exists='replace',
        index=False,
        chunksize=1000
    )
    
    # Create spatial index
    with engine.connect() as conn:
        conn.execute(f"""
            CREATE INDEX IF NOT EXISTS idx_{table_name}_geom 
            ON {table_name} USING GIST(geometry);
        """)
    
    logger.info(f"Loaded {len(gdf)} features into {table_name}")
    return len(gdf)
```

### Data Organization

```
/workspace/data/geospatial/
├── tiger/
│   ├── 2023/
│   │   ├── states/
│   │   ├── counties/
│   │   ├── tracts/
│   │   └── blocks/
│   └── metadata.json
└── statscan/
    ├── 2021/
    │   ├── provinces/
    │   ├── census_divisions/
    │   └── dissemination_areas/
    └── metadata.json
```

---

## Alternatives Considered

### Alternative 1: ogr2ogr (GDAL Command-Line)

**Description**: GDAL's command-line tool for vector data conversion

**Pros**:
- **Performance**: Very fast, written in C++
- **Mature**: Industry standard, battle-tested
- **Feature-Rich**: Supports all OGR formats
- **No Python**: Can run without Python dependencies

**Cons**:
- **Less Flexible**: Command-line interface, harder to customize
- **Error Handling**: Less granular error handling
- **Logging**: Basic logging capabilities
- **Integration**: Requires shell scripting, not Python-native

**Example**:
```bash
ogr2ogr -f "PostgreSQL" \
  PG:"dbname=chronos user=postgres" \
  /path/to/shapefile.shp \
  -nln tiger_states \
  -lco GEOMETRY_NAME=geom \
  -lco SPATIAL_INDEX=GIST \
  -t_srs EPSG:4326
```

**Decision**: Use as fallback for very large files (>1GB)

---

### Alternative 2: shp2pgsql (PostGIS Native)

**Description**: PostGIS's native shapefile loader

**Pros**:
- **PostGIS Native**: Designed specifically for PostGIS
- **Performance**: Very fast
- **Simple**: Straightforward command-line interface
- **Reliable**: Part of PostGIS distribution

**Cons**:
- **Limited Flexibility**: Less customization than Python
- **Shapefile Only**: Doesn't support other formats
- **No Validation**: Minimal data quality checks
- **Scripting**: Requires shell scripting

**Example**:
```bash
shp2pgsql -I -s 4326 \
  /path/to/shapefile.shp \
  tiger_states | \
  psql -d chronos
```

**Decision**: Rejected - Less flexible than geopandas

---

### Alternative 3: GDAL Python Bindings

**Description**: Use GDAL's Python API directly

**Pros**:
- **Performance**: Fast (C++ backend)
- **Flexibility**: Full GDAL capabilities in Python
- **Control**: Low-level control over data processing

**Cons**:
- **Complexity**: More verbose than geopandas
- **Learning Curve**: Steeper than geopandas
- **Boilerplate**: More code for common operations

**Example**:
```python
from osgeo import ogr, osr

# Open shapefile
driver = ogr.GetDriverByName("ESRI Shapefile")
dataSource = driver.Open(shapefile_path, 0)
layer = dataSource.GetLayer()

# Connect to PostGIS
conn = ogr.Open("PG:dbname=chronos")
# ... more boilerplate
```

**Decision**: Rejected - geopandas provides simpler API

---

### Alternative 4: Custom SQL + psycopg2

**Description**: Parse shapefiles and insert via SQL

**Pros**:
- **Full Control**: Complete control over insertion
- **Minimal Dependencies**: Only psycopg2 needed

**Cons**:
- **Complexity**: Must parse shapefile format manually
- **Reinventing Wheel**: Duplicates existing tools
- **Error-Prone**: Easy to make mistakes
- **Maintenance**: High maintenance burden

**Decision**: Rejected - Too complex, unnecessary

---

## Comparison Matrix

| Feature | GeoPandas | ogr2ogr | shp2pgsql | GDAL Python | Custom SQL |
|---------|-----------|---------|-----------|-------------|------------|
| **Ease of Use** | ✅ | ⚠️ | ⚠️ | ❌ | ❌ |
| **Performance** | ⚠️ | ✅ | ✅ | ✅ | ⚠️ |
| **Flexibility** | ✅ | ⚠️ | ❌ | ✅ | ✅ |
| **Python Integration** | ✅ | ❌ | ❌ | ✅ | ✅ |
| **Error Handling** | ✅ | ⚠️ | ⚠️ | ✅ | ✅ |
| **Validation** | ✅ | ❌ | ❌ | ✅ | ✅ |
| **Logging** | ✅ | ⚠️ | ⚠️ | ✅ | ✅ |
| **Maintenance** | ✅ | ✅ | ✅ | ⚠️ | ❌ |

---

## Rationale

### Why GeoPandas?

1. **Pandas Integration**: Familiar API for data manipulation
2. **Python-Native**: Integrates with existing Python codebase
3. **Flexibility**: Easy to add validation, transformation, logging
4. **Error Handling**: Granular error handling in Python
5. **Extensibility**: Can easily add new data sources
6. **Testing**: Easy to unit test Python code
7. **Debugging**: Python debugger for troubleshooting

### Trade-offs Accepted

1. **Performance**: Slower than ogr2ogr for very large files
   - *Mitigation*: Use ogr2ogr for files >1GB
2. **Memory**: Loads entire file into memory
   - *Mitigation*: Use chunking for large datasets
3. **Dependency**: Requires geopandas installation
   - *Mitigation*: Already using Python, minimal additional complexity

---

## Consequences

### Positive

1. **Maintainability**: Python code is easy to understand and modify
2. **Automation**: Easily scriptable and schedulable
3. **Validation**: Can add data quality checks inline
4. **Logging**: Comprehensive logging for debugging
5. **Testing**: Can write unit tests for ingestion logic

### Negative

1. **Performance**: Slower than native tools for large files
2. **Memory**: May struggle with very large shapefiles
3. **Dependencies**: Adds geopandas, fiona, pyproj to requirements

### Risks

1. **Large Files**: May run out of memory on large shapefiles
   - *Mitigation*: Use chunking, fallback to ogr2ogr
2. **Coordinate Systems**: Incorrect CRS handling
   - *Mitigation*: Always reproject to EPSG:4326, validate CRS

---

## Implementation

### Phase 1: Core Ingestion (Week 1)
- Create ingestion script
- Implement shapefile loading
- Add spatial indexing
- Test with sample data

### Phase 2: Data Sources (Week 1)
- Download TIGER data
- Download StatsCan data
- Organize data directory
- Document data sources

### Phase 3: Validation (Week 2)
- Add data quality checks
- Implement validation queries
- Create data catalog
- Document data schema

### Phase 4: Automation (Future)
- Schedule annual updates
- Implement change detection
- Add monitoring

---

## Verification

### Success Criteria

1. **Data Loaded**: All TIGER and StatsCan data in PostGIS
2. **Spatial Indexes**: Indexes created for all geometry columns
3. **Validation**: Data quality checks pass
4. **Performance**: Spatial queries perform well

### Testing Plan

```python
# Test spatial query
SELECT name, ST_Area(geom) as area
FROM tiger_states
WHERE ST_Intersects(geom, ST_MakePoint(-122.4194, 37.7749));

# Test spatial join
SELECT s.name, COUNT(c.geoid) as county_count
FROM tiger_states s
JOIN tiger_counties c ON ST_Within(c.geom, s.geom)
GROUP BY s.name;

# Validate geometry
SELECT COUNT(*) FROM tiger_states WHERE NOT ST_IsValid(geom);
```

---

## Future Enhancements

1. **Incremental Updates**: Only load changed features
2. **Multiple Formats**: Support GeoJSON, GeoPackage
3. **Streaming**: Process large files without loading into memory
4. **Parallel Loading**: Load multiple files concurrently
5. **Cloud Storage**: Load directly from S3

---

## References

- [GeoPandas Documentation](https://geopandas.org/)
- [GDAL/OGR Documentation](https://gdal.org/)
- [PostGIS Documentation](https://postgis.net/)
- [US Census TIGER/Line](https://www.census.gov/geographies/mapping-files/time-series/geo/tiger-line-file.html)
- [Statistics Canada Boundary Files](https://www12.statcan.gc.ca/census-recensement/2021/geo/sip-pis/boundary-limites/index-eng.cfm)

---

**Approved By**: [Pending]  
**Implementation Date**: [Pending]
