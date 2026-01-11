#!/bin/bash
set -euo pipefail

# This script orchestrates the local development environment for Project Chronos.
# It starts the database, Next.js app, and Cloudflare Worker, and handles
# graceful shutdown.

# --- Configuration ---
DB_SERVICE_NAME="timescaledb"
WEB_APP_PROJECT="web"
WORKER_APP_PROJECT="worker"

# --- Functions ---

# Function to start the database
start_db() {
  echo "🚀 Starting database service (${DB_SERVICE_NAME})..."
  docker compose up --wait -d "${DB_SERVICE_NAME}"
  echo "✅ Database service started."
}

# Function to stop the database
stop_db() {
  echo "🛑 Stopping database service (${DB_SERVICE_NAME})..."
  docker compose stop "${DB_SERVICE_NAME}"
  echo "✅ Database service stopped."
}

# Function to wait for a port to be available
wait_for_port() {
  local port=$1
  local host=${2:-localhost}
  local timeout=${3:-60} # default to 60 seconds

  echo "Waiting for ${host}:${port} to be available..."
  for i in $(seq 1 "$timeout"); do
    if nc -z "$host" "$port" &>/dev/null; then
      echo "Port ${host}:${port} is available."
      return 0
    fi
    sleep 1
  done

  echo "Error: Port ${host}:${port} not available after ${timeout} seconds."
  return 1
}

# Cleanup function on script exit or signal
cleanup() {
  echo "🧹 Performing cleanup..."
  kill $(jobs -p) || true # Kill all background jobs
  stop_db
  echo "👋 Cleanup complete. Exiting."
  exit 0
}

# Trap signals for graceful shutdown
trap cleanup SIGINT SIGTERM EXIT

# --- Main Execution ---

# 1. Start Database
start_db

# 2. Load environment variables from apps/web/.env.local
if [ -f apps/web/.env.local ]; then
  set -a  # automatically export all variables
  source apps/web/.env.local
  set +a
  # Set Cloudflare Hyperdrive local connection for development
  export CLOUDFLARE_HYPERDRIVE_LOCAL_CONNECTION_STRING_DB="${DATABASE_URL}"
fi

# Wait for DB port to be available
if [ -z "${DATABASE_PORT}" ]; then
  echo "DATABASE_PORT not set. Assuming default 5432 and proceeding without waiting for port."
else
  wait_for_port "${DATABASE_PORT}"
fi

echo "🚀 Starting Next.js app (${WEB_APP_PROJECT})..."
pnpm exec nx serve "${WEB_APP_PROJECT}" &
WEB_PID=$!
echo "✅ Next.js app started with PID ${WEB_PID}."

echo "🚀 Starting Cloudflare Worker app (${WORKER_APP_PROJECT})..."
pnpm exec nx serve "${WORKER_APP_PROJECT}" &
WORKER_PID=$!
echo "✅ Cloudflare Worker app started with PID ${WORKER_PID}."

echo "✨ Local development environment is running. Press Ctrl+C to stop."

# Wait for all background processes to finish (or for SIGINT)
wait -n "$WEB_PID" "$WORKER_PID"
