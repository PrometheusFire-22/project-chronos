#!/bin/bash
set -euo pipefail

# This script orchestrates the local development environment for Project Chronos.
# It starts the database, Next.js app, and Cloudflare Worker, and handles
# graceful shutdown.

# --- Configuration ---
DB_SERVICE_NAME="postgres"
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
  if [ "${SHOULD_CLEANUP_DB:-false}" = "true" ]; then
    stop_db
  fi
  echo "👋 Cleanup complete. Exiting."
  exit 0
}

# Trap signals for graceful shutdown
trap cleanup SIGINT SIGTERM EXIT

# --- Main Execution ---

# 1. Load environment variables from apps/web/.env.local
# We do this FIRST so we can check DATABASE_URL
if [ -f apps/web/.env.local ]; then
  set -a  # automatically export all variables
  source apps/web/.env.local
  set +a
  # Set Cloudflare Hyperdrive local connection for development
  export CLOUDFLARE_HYPERDRIVE_LOCAL_CONNECTION_STRING_DB="${DATABASE_URL}"
fi

# 2. Start Database (only if using local DB)
# Check if DATABASE_URL contains "localhost" or "127.0.0.1" or is empty
if [[ -z "${DATABASE_URL:-}" ]] || [[ "${DATABASE_URL}" == *"localhost"* ]] || [[ "${DATABASE_URL}" == *"127.0.0.1"* ]] || [[ "${DATABASE_URL}" == *"postgres"* && "${DATABASE_URL}" != *"16.52.210.100"* ]]; then
    # Note: Added check for specific IP to be safe, though verifying against localhost is usually enough.
    # If DATABASE_URL is just "postgres" (service name), it arguably implies local docker network, but here we assume explicit URL.
    # Simplest check: if it DOESN'T look like the remote IP, start local.
    # Actually, let's be strict: Only start if explicitly local or unset.
    if [[ -z "${DATABASE_URL:-}" ]] || [[ "${DATABASE_URL}" == *"localhost"* ]] || [[ "${DATABASE_URL}" == *"127.0.0.1"* ]]; then
        start_db
        SHOULD_CLEANUP_DB=true
    else
        echo "🌍 Using external database defined in DATABASE_URL. Skipping local DB startup."
        SHOULD_CLEANUP_DB=false
    fi
else
    # Fallback for weird cases, assume external if set but not local
     echo "🌍 Using external database defined in DATABASE_URL. Skipping local DB startup."
     SHOULD_CLEANUP_DB=false
fi

# Wait for DB port to be available
if [ -z "${DATABASE_PORT:-}" ]; then
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
