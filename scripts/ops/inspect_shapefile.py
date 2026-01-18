#!/usr/bin/env python3
"""
Inspect the actual shapefile to see if it has interior rings
"""
import geopandas as gpd

shapefile_path = "/home/prometheus/coding/finance/project-chronos/gis_data/raw/USA/national/unzipped/tl_2024_us_state/tl_2024_us_state.shp"

print("=" * 80)
print("INSPECTING SOURCE SHAPEFILE")
print("=" * 80)

gdf = gpd.read_file(shapefile_path)

print(f"\nLoaded {len(gdf)} states")
print(f"CRS: {gdf.crs}")
print(f"\nColumns: {list(gdf.columns)}")

# Check Michigan specifically
michigan = gdf[gdf["NAME"] == "Michigan"]

if len(michigan) > 0:
    print("\n" + "=" * 80)
    print("MICHIGAN GEOMETRY ANALYSIS")
    print("=" * 80)

    geom = michigan.iloc[0].geometry
    print(f"Geometry Type: {geom.geom_type}")

    if geom.geom_type == "MultiPolygon":
        total_interior_rings = 0
        for poly in geom.geoms:
            num_interiors = len(poly.interiors)
            total_interior_rings += num_interiors
            if num_interiors > 0:
                print(f"  Polygon has {num_interiors} interior rings (holes)")

        print(f"\nTotal interior rings across all polygons: {total_interior_rings}")

        if total_interior_rings > 0:
            print("✓ Shapefile HAS interior rings (Great Lakes should be present)")
        else:
            print("⚠️  Shapefile has NO interior rings (Great Lakes NOT cut out)")
    elif geom.geom_type == "Polygon":
        num_interiors = len(geom.interiors)
        print(f"Interior rings: {num_interiors}")
        if num_interiors > 0:
            print("✓ Shapefile HAS interior rings")
        else:
            print("⚠️  Shapefile has NO interior rings")

# Check a few other Great Lakes states
print("\n" + "=" * 80)
print("OTHER GREAT LAKES STATES")
print("=" * 80)

great_lakes_states = [
    "Michigan",
    "Wisconsin",
    "Illinois",
    "Indiana",
    "Ohio",
    "Minnesota",
    "New York",
]

for state_name in great_lakes_states:
    state = gdf[gdf["NAME"] == state_name]
    if len(state) > 0:
        geom = state.iloc[0].geometry
        if geom.geom_type == "MultiPolygon":
            total_rings = sum(len(poly.interiors) for poly in geom.geoms)
        else:
            total_rings = len(geom.interiors)

        print(f"  {state_name:<15} {total_rings} interior rings")

print("\n" + "=" * 80 + "\n")
