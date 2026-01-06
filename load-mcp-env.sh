#!/bin/bash
# Load MCP environment variables
# Usage: source ./load-mcp-env.sh

# Source the MCP environment variables
source "$(dirname "$0")/.env.mcp"

echo "✅ MCP environment variables loaded"
echo "-----------------------------------"
echo "ATLASSIAN_INSTANCE_URL: ${ATLASSIAN_INSTANCE_URL}"
echo "SENTRY_ORG_SLUG: ${SENTRY_ORG_SLUG}"
echo "POSTGRES_USER: ${POSTGRES_USER}"
echo "PGHOST: ${PGHOST}"
echo "GITHUB_TOKEN: ${GITHUB_TOKEN:0:10}..."
echo "-----------------------------------"
