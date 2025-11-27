#!/usr/bin/env python3
"""
Project Chronos: Geospatial Data Ingestion
===========================================
Load TIGER/Line and Statistics Canada shapefiles into PostGIS

Usage:
    python src/chronos/ingestion/geospatial_cli.py
"""
import csv
import os
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

    return len(gdf)


def main():
    """Main ingestion orchestrator"""
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

    print(f"=� Loading catalog: {catalog_path}")
    layers = load_catalog(catalog_path)

    if not layers:
        print("�  No active layers found in catalog")
        sys.exit(0)

    print(f" Loaded {len(layers)} active layers\n")

    # Connect to database
    engine = get_sqlalchemy_engine()
    print(" Connected to database\n")

    # Ensure schema exists
    ensure_schema(engine)

    # Process each layer
    total_features = 0
    successful = 0
    failed = []

    for i, layer in enumerate(layers, 1):
        layer_id = layer["layer_id"]
        table_name = layer["table_name"]
        shapefile_path = layer["shapefile_path"]
        description = layer["description"]

        print(f"[{i}/{len(layers)}] {layer_id}")
        print(f"  Description: {description}")
        print(f"  File: {shapefile_path}")

        try:
            # Check if shapefile exists
            shp_file = Path(shapefile_path)
            if not shp_file.exists():
                raise FileNotFoundError(f"Shapefile not found: {shapefile_path}")

            # Ingest shapefile
            feature_count = ingest_shapefile(
                engine, layer_id, table_name, shapefile_path, description
            )

            total_features += feature_count
            successful += 1
            print(f"   Loaded {feature_count:,} features\n")

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
    print("\n=� Summary:")
    print(f"  Total layers processed: {len(layers)}")
    print(f"  Successful: {successful}")
    print(f"  Failed: {len(failed)}")
    print(f"  Total features loaded: {total_features:,}")
    print(f"  Duration: {duration}")
    print(f"  Success rate: {successful/len(layers)*100:.1f}%")

    if failed:
        print("\n�  Failed layers:")
        for layer_id, error in failed:
            error_short = error[:80] + "..." if len(error) > 80 else error
            print(f"    - {layer_id}: {error_short}")

    print("\n" + "=" * 60 + "\n")


if __name__ == "__main__":
    main()
