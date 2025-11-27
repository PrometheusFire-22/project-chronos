#!/bin/bash
# ==============================================================================
# Dev Container Restart Helper
# ==============================================================================
# This script helps you restart your dev container when Docker access breaks.
# Run this from your HOST machine (not inside the container).
# ==============================================================================

set -e

echo "🔄 Restarting Project Chronos Dev Container..."
echo ""

# Detect which docker compose command to use
if docker compose version &> /dev/null; then
    COMPOSE_CMD="docker compose"
elif command -v docker-compose &> /dev/null; then
    COMPOSE_CMD="docker-compose"
else
    echo "❌ Error: Neither 'docker compose' nor 'docker-compose' found."
    echo ""
    echo "Please ensure Docker Desktop is installed and running."
    exit 1
fi

echo "Using: $COMPOSE_CMD"
echo ""

# Stop all containers
echo "1️⃣ Stopping containers..."
$COMPOSE_CMD down

# Rebuild the app container
echo "2️⃣ Rebuilding app container..."
$COMPOSE_CMD build app --no-cache

# Start everything back up
echo "3️⃣ Starting containers..."
$COMPOSE_CMD up -d

echo ""
echo "✅ Done! Now close and reopen your Antigravity window."
echo ""
echo "📝 Steps to reconnect:"
echo "   1. Close the current Antigravity window completely"
echo "   2. Reopen the folder in Antigravity"
echo "   3. When prompted, select 'Reopen in Container'"
echo ""
