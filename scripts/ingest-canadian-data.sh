#!/usr/bin/env bash
# ==============================================================================
# Project Chronos: Unified Canadian Data Ingestion (FRED + VALET)
# ==============================================================================

set -e

echo "🇨🇦 Starting Unified Canadian Data Ingestion..."

# Ensure PYTHONPATH includes src so imports work
export PYTHONPATH=$PYTHONPATH:$(pwd)/src

# 1. Ingest from Bank of Canada Valet API
echo ""
echo "📈 Step 1: Ingesting from Bank of Canada Valet API..."
python3 src/chronos/ingestion/timeseries_cli.py --source Valet --geography Canada

# 2. Ingest from FRED (Comparative Data)
echo ""
echo "📈 Step 2: Ingesting Canadian data from FRED (Comparative)..."
python3 src/chronos/ingestion/timeseries_cli.py --source FRED --geography Canada

echo ""
echo "✅ Unified Canadian Ingestion Complete."
