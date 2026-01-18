#!/usr/bin/env python3
"""
Verify the Cartographic Boundary shapefile has interior rings
"""
import geopandas as gpd

shapefile_path = "/home/prometheus/coding/finance/project-chronos/gis_data/raw/USA/national/unzipped/cb_2024_us_state_500k/cb_2024_us_state_500k.shp"

print("=" * 80)
print("VERIFYING CARTOGRAPHIC BOUNDARY SHAPEFILE")
print("=" * 80)

gdf = gpd.read_file(shapefile_path)

print(f"\nLoaded {len(gdf)} states")
print(f"CRS: {gdf.crs}")

# Check Michigan
michigan = gdf[gdf["NAME"] == "Michigan"]

if len(michigan) > 0:
    print("\n" + "=" * 80)
    print("MICHIGAN GEOMETRY")
    print("=" * 80)

    geom = michigan.iloc[0].geometry
    print(f"Geometry Type: {geom.geom_type}")

    if geom.geom_type == "MultiPolygon":
        total_interior_rings = sum(len(poly.interiors) for poly in geom.geoms)
    else:
        total_interior_rings = len(geom.interiors)

    print(f"Interior rings: {total_interior_rings}")

    if total_interior_rings > 0:
        print("✓ Great Lakes ARE present as interior rings!")
    else:
        print("⚠️  Still no interior rings - this is the water-clipped version")
        print("    (Water areas removed entirely, not as holes)")

print("\n" + "=" * 80 + "\n")
