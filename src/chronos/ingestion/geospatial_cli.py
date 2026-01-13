#!/usr/bin/env python3
"""
Project Chronos: Geospatial Data Ingestion
===========================================
Load TIGER/Line and Statistics Canada shapefiles into PostGIS

Usage:
    python src/chronos/ingestion/geospatial_cli.py
"""
import argparse
import csv
import gc
import os
import subprocess  # Added for ogr2ogr
import sys
from datetime import UTC, datetime
from pathlib import Path

import geopandas as gpd
from dotenv import load_dotenv
from sqlalchemy import create_engine, text

# Load environment
env_path = Path(__file__).parent.parent.parent.parent / ".env"
load_dotenv(env_path)

# Database configuration
DB_CONFIG = {
    "host": os.getenv("DATABASE_HOST", "chronos-db"),
    "database": os.getenv("DATABASE_NAME", "chronos_db"),
    "user": os.getenv("DATABASE_USER", "prometheus"),
    "password": os.getenv("DATABASE_PASSWORD"),
    "port": os.getenv("DATABASE_PORT", "5432"),
}


def get_sqlalchemy_engine():
    """Create SQLAlchemy engine for GeoPandas"""
    conn_string = (
        f"postgresql://{DB_CONFIG['user']}:{DB_CONFIG['password']}"
        f"@{DB_CONFIG['host']}:{DB_CONFIG['port']}/{DB_CONFIG['database']}"
    )
    return create_engine(conn_string)


def load_catalog(catalog_path: Path):
    """Load geospatial layer catalog"""
    layers = []
    with open(catalog_path, encoding="utf-8") as f:
        reader = csv.DictReader(f)
        for row in reader:
            if row.get("status") == "Active":
                # Ensure 'ingestion_method' is set, default to 'geopandas'
                row["ingestion_method"] = row.get("ingestion_method", "geopandas").lower()
                layers.append(row)
    return layers


def ensure_schema(engine):
    """Ensure geospatial schema exists"""
    with engine.connect() as conn:
        conn.execute(text("CREATE SCHEMA IF NOT EXISTS geospatial"))
        conn.commit()
    print(" Geospatial schema ready\n")


def ingest_shapefile(engine, layer_id, table_name, shapefile_path, description):
    """Load single shapefile into PostGIS"""
    print("  Reading shapefile...")

    # Read shapefile
    gdf = gpd.read_file(shapefile_path)

    print(f"   Loaded {len(gdf)} features")
    print(f"  CRS: {gdf.crs}")

    # Reproject to WGS84 if needed
    if gdf.crs and gdf.crs.to_epsg() != 4326:
        print("  Reprojecting to EPSG:4326...")
        gdf = gdf.to_crs(epsg=4326)

    feature_count = len(gdf)  # Store count before deleting gdf

    # Load to PostGIS
    print(f"  Loading to geospatial.{table_name}...")
    gdf.to_postgis(
        table_name,
        engine,
        schema="geospatial",
        if_exists="replace",
        index=False,
        chunksize=1000,
    )
    del gdf  # Explicitly delete GeoDataFrame to free memory
    gc.collect()  # Explicitly call garbage collector

    # Create spatial index
    with engine.connect() as conn:
        conn.execute(
            text(
                f"""
            CREATE INDEX IF NOT EXISTS idx_{table_name}_geom
            ON geospatial.{table_name} USING GIST(geometry)
        """
            )
        )
        conn.commit()

    print("   Spatial index created")

    return feature_count


def ingest_with_ogr2ogr(
    db_config, table_name, shapefile_path, simplify_tolerance=None, overwrite=True
):
    """Load single shapefile into PostGIS using ogr2ogr"""
    print("  Ingesting with ogr2ogr...")

    # Construct PostgreSQL connection string for ogr2ogr
    pg_conn_string = (
        f"PG:host={db_config['host']} dbname={db_config['database']} "
        f"user={db_config['user']} password={db_config['password']} "
        f"port={db_config['port']}"
    )

    # Base ogr2ogr command
    ogr_command = [
        "ogr2ogr",
        "-f",
        "PostgreSQL",
        pg_conn_string,
        str(shapefile_path),
        "-nln",
        f"geospatial.{table_name}",  # Schema.table_name
        "-lco",
        "GEOMETRY_NAME=geometry",  # Consistent geometry column name
        "-lco",
        "SPATIAL_INDEX=GIST",  # Create spatial index
        "-t_srs",
        "EPSG:4326",  # Target CRS to WGS84
        "-nlt",
        "PROMOTE_TO_MULTI",  # Promote singlepart to multipart geometries
        "-progress",  # Show progress
    ]

    if overwrite:
        ogr_command.append("-overwrite")

    if simplify_tolerance is not None:
        ogr_command.extend(["-simplify", str(simplify_tolerance)])

    print(f"  Running command: {' '.join(ogr_command)}")

    try:
        result = subprocess.run(ogr_command, capture_output=True, text=True, check=True)
        print("   ogr2ogr stdout:\n", result.stdout)
        if result.stderr:
            print("  ogr2ogr stderr:\n", result.stderr)

        # Verify ingestion and get feature count via SQL query
        engine = get_sqlalchemy_engine()
        with engine.connect() as conn:
            query_result = conn.execute(
                text(f"SELECT COUNT(*) FROM geospatial.{table_name}")  # nosec B608
            ).scalar()
            feature_count = int(query_result)
        print(f"   Verified {feature_count:,} features in geospatial.{table_name}")
        return feature_count
    except subprocess.CalledProcessError as e:
        print(f"  L ogr2ogr failed: {e}")
        print("  ogr2ogr stdout:\n", e.stdout)
        print("  ogr2ogr stderr:\n", e.stderr)
        raise


def ingest_multi_state_layer(db_config, table_name, base_shapefile_path, simplify_tolerance=None):
    """
    Ingests multiple state-level shapefiles into a single national PostGIS table using ogr2ogr.
    The first file uses -overwrite, subsequent files use -append.
    """
    print(f"  Ingesting multi-state layer to geospatial.{table_name} using ogr2ogr...")

    shp_files = sorted(Path(base_shapefile_path).glob("*/*.shp"))
    if not shp_files:
        raise FileNotFoundError(f"No shapefiles found in {base_shapefile_path}")

    total_features_ingested = 0
    first_file = True

    for shp_file_path in shp_files:
        print(f"    Processing state file: {shp_file_path.name}")
        try:
            # Use overwrite for the first file, append for subsequent ones
            feature_count = ingest_with_ogr2ogr(
                db_config, table_name, shp_file_path, simplify_tolerance, overwrite=first_file
            )
            total_features_ingested += feature_count
            first_file = False  # After the first file, all others will append
            gc.collect()  # Explicitly free memory after each state file
        except Exception as e:
            print(f"    L Error ingesting {shp_file_path.name}: {e}")
            raise  # Re-raise to fail the whole layer if one state fails

    # Final verification of total features in the national table
    engine = get_sqlalchemy_engine()
    with engine.connect() as conn:
        query_result = conn.execute(
            text(f"SELECT COUNT(*) FROM geospatial.{table_name}")  # nosec B608
        ).scalar()
        final_feature_count = int(query_result)
    print(f"   Verified total {final_feature_count:,} features in geospatial.{table_name}")

    return final_feature_count


def main():
    """Main ingestion orchestrator"""
    parser = argparse.ArgumentParser(description="Ingest geospatial data into PostGIS.")
    parser.add_argument(
        "--layer_id",
        type=str,
        default="all",
        help="Specific layer ID to ingest, or 'all' to ingest all active layers.",
    )
    args = parser.parse_args()

    print("\n" + "=" * 60)
    print("< Project Chronos: Geospatial Data Ingestion")
    print("=" * 60 + "\n")

    start_time = datetime.now(UTC)

    # Locate catalog
    catalog_path = (
        Path(__file__).parent.parent.parent.parent / "database" / "seeds" / "geospatial_catalog.csv"
    )

    if not catalog_path.exists():
        print(f"L Catalog not found: {catalog_path}")
        sys.exit(1)

    print(f"= Loading catalog: {catalog_path}")
    all_layers = load_catalog(catalog_path)

    if args.layer_id != "all":
        layers_to_process = [layer for layer in all_layers if layer["layer_id"] == args.layer_id]
        if not layers_to_process:
            print(f"  Layer ID '{args.layer_id}' not found or is inactive in catalog.")
            sys.exit(0)
        print(f" Processing specific layer: '{args.layer_id}'\n")
    else:
        layers_to_process = all_layers
        if not layers_to_process:
            print("  No active layers found in catalog")
            sys.exit(0)
        print(f" Loaded {len(layers_to_process)} active layers\n")

    # Connect to database
    engine = get_sqlalchemy_engine()
    print(" Connected to database\n")

    # Ensure schema exists
    ensure_schema(engine)

    # Process each layer
    total_features = 0
    successful = 0
    failed = []

    for i, layer in enumerate(layers_to_process, 1):
        layer_id = layer["layer_id"]
        table_name = layer["table_name"]
        shapefile_path = layer["shapefile_path"]
        description = layer["description"]
        ingestion_method = layer.get("ingestion_method", "geopandas").lower()
        simplify_tolerance = layer.get("simplify_tolerance")
        if simplify_tolerance:
            simplify_tolerance = float(simplify_tolerance)

        print(f"[{i}/{len(layers_to_process)}] {layer_id}")
        print(f"  Description: {description}")
        print(f"  File: {shapefile_path}")
        print(f"  Ingestion Method: {ingestion_method}")

        try:
            # Check if shapefile exists
            shp_file = Path(shapefile_path)
            if not shp_file.exists():
                raise FileNotFoundError(f"Shapefile not found: {shapefile_path}")

            feature_count = 0
            if ingestion_method == "ogr2ogr_multi_state":
                feature_count = ingest_multi_state_layer(
                    DB_CONFIG, table_name, shp_file, simplify_tolerance
                )
            elif ingestion_method == "ogr2ogr":
                feature_count = ingest_with_ogr2ogr(
                    DB_CONFIG, table_name, shp_file, simplify_tolerance
                )
            else:  # Default to geopandas
                feature_count = ingest_shapefile(
                    engine, layer_id, table_name, shp_file, description
                )

            total_features += feature_count
            successful += 1
            print(f"   Loaded {feature_count:,} features\n")
            gc.collect()  # Explicitly free memory after processing each layer

        except FileNotFoundError as e:
            print(f"  L {str(e)}\n")
            failed.append((layer_id, str(e)))
        except Exception as e:
            print(f"  L Error: {str(e)}\n")
            failed.append((layer_id, str(e)))

    engine.dispose()

    # Summary
    duration = datetime.now(UTC) - start_time

    print("=" * 60)
    print(" INGESTION COMPLETE!")
    print("=" * 60)
    print("\n= Summary:")
    print(f"  Total layers processed: {len(layers_to_process)}")
    print(f"  Successful: {successful}")
    print(f"  Failed: {len(failed)}")
    print(f"  Total features loaded: {total_features:,}")
    print(f"  Duration: {duration}")
    if len(layers_to_process) > 0:
        print(f"  Success rate: {successful/len(layers_to_process)*100:.1f}%")

    if failed:
        print("\n  Failed layers:")
        for layer_id, error in failed:
            error_short = error[:80] + "..." if len(error) > 80 else error
            print(f"    - {layer_id}: {error_short}")

    print("\n" + "=" * 60 + "\n")


if __name__ == "__main__":
    main()
