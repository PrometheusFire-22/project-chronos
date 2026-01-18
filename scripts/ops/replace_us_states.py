#!/usr/bin/env python3
"""
Surgically replace ONLY the us_states table with cartographic boundary data
"""
import os

import geopandas as gpd
from sqlalchemy import create_engine, text

CONN_STRING = os.environ["DATABASE_URL"]
SHAPEFILE = "gis_data/raw/USA/national/unzipped/cb_2024_us_state_500k/cb_2024_us_state_500k.shp"

print("=" * 80)
print("REPLACING US_STATES WITH CARTOGRAPHIC BOUNDARY DATA")
print("=" * 80)

# Read shapefile
print("\n1. Reading shapefile...")
gdf = gpd.read_file(SHAPEFILE)
print(f"   ✓ Loaded {len(gdf)} states")

# Reproject to WGS84
if gdf.crs.to_epsg() != 4326:
    print("\n2. Reprojecting to EPSG:4326...")
    gdf = gdf.to_crs(epsg=4326)
    print("   ✓ Reprojected")

# Connect to database
engine = create_engine(CONN_STRING)

# Drop view temporarily
print("\n3. Dropping view...")
with engine.connect() as conn:
    conn.execute(text("DROP VIEW IF EXISTS analytics.vw_choropleth_boundaries CASCADE"))
    conn.commit()
print("   ✓ View dropped")

# Replace table
print("\n4. Replacing us_states table...")
gdf.to_postgis(
    "us_states", engine, schema="geospatial", if_exists="replace", index=False, chunksize=1000
)
print("   ✓ Table replaced")

# Create spatial index
print("\n5. Creating spatial index...")
with engine.connect() as conn:
    conn.execute(
        text(
            """
        CREATE INDEX IF NOT EXISTS idx_us_states_geom
        ON geospatial.us_states USING GIST(geometry)
    """
        )
    )
    conn.commit()
print("   ✓ Index created")

# Recreate view
print("\n6. Recreating view...")
with engine.connect() as conn:
    conn.execute(
        text(
            """
        CREATE OR REPLACE VIEW analytics.vw_choropleth_boundaries AS
        SELECT
            name as region_name,
            'US' as country_code,
            geom::geometry as geometry
        FROM geospatial.us_states
        UNION ALL
        SELECT
            prename as region_name,
            'CA' as country_code,
            geometry::geometry as geometry
        FROM geospatial.ca_provinces
    """
        )
    )
    conn.commit()
print("   ✓ View recreated")

# Verify
print("\n7. Verifying Michigan...")
with engine.connect() as conn:
    result = conn.execute(
        text(
            """
        SELECT region_name, ST_AsText(ST_Envelope(geometry))
        FROM analytics.vw_choropleth_boundaries
        WHERE region_name = 'Michigan'
    """
        )
    )
    for row in result:
        print(f"   ✓ {row[0]} geometry exists")

print("\n" + "=" * 80)
print("✓ COMPLETE - Great Lakes should now render correctly!")
print("=" * 80 + "\n")
