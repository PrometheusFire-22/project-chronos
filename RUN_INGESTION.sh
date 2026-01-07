#!/bin/bash
# Run the time-series ingestion script
# This will load all 75 series from the catalog into PostgreSQL

echo "Starting time-series data ingestion..."
echo "This will take approximately 5-10 minutes due to API rate limiting."
echo ""

PYTHONPATH=$(pwd)/src /workspace/.venv/bin/python src/chronos/ingestion/timeseries_cli.py

echo ""
echo "Ingestion complete! Check the summary above for results."
