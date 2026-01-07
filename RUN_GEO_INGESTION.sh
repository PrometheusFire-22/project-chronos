#!/bin/bash
# Run the geospatial data ingestion script
# This will load 11 key geospatial layers into PostGIS

echo "Starting geospatial data ingestion..."
echo "This will load US and Canadian boundary layers into PostGIS."
echo ""

PYTHONPATH=$(pwd)/src /workspace/.venv/bin/python src/chronos/ingestion/geospatial_cli.py

echo ""
echo "Ingestion complete! Check the summary above for results."
