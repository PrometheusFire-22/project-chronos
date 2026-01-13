#!/bin/bash
# Run the geospatial data ingestion script
# This will load 11 key geospatial layers into PostGIS

echo "Starting geospatial data ingestion..."
echo "This will load US and Canadian boundary layers into PostGIS."
echo ""

# Define the path to the geospatial catalog
GEOSPATIAL_CATALOG="./database/seeds/geospatial_catalog.csv"

# Read the active layer_ids from the catalog and iterate
tail -n +2 "$GEOSPATIAL_CATALOG" | grep ",Active," | while IFS=, read -r layer_id country geographic_level year layer_name table_name shapefile_path status description; do
    echo "Ingesting layer: $layer_id"
    PYTHONPATH=$(pwd)/src .venv/bin/python3 src/chronos/ingestion/geospatial_cli.py --layer_id "$layer_id"
    if [ $? -ne 0 ]; then
        echo "Error ingesting $layer_id. Aborting."
        exit 1
    fi
done

echo ""
echo "Ingestion complete! Check the summary above for results."
