#!/bin/bash
# Quick script to reload MCP environment variables
# Run: source ./reload-env.sh

echo "🔄 Reloading MCP environment variables..."
source /home/prometheus/coding/finance/project-chronos/.env.mcp

echo ""
echo "✅ Environment variables loaded!"
echo "================================"
echo "ATLASSIAN_INSTANCE_URL: ${ATLASSIAN_INSTANCE_URL}"
echo "ATLASSIAN_EMAIL: ${ATLASSIAN_EMAIL}"
echo "ATLASSIAN_API_TOKEN: ${ATLASSIAN_API_TOKEN:0:20}..."
echo ""
echo "SENTRY_ORG_SLUG: ${SENTRY_ORG_SLUG}"
echo "SENTRY_ACCESS_TOKEN: ${SENTRY_ACCESS_TOKEN:0:20}..."
echo ""
echo "POSTGRES_USER: ${POSTGRES_USER}"
echo "PGHOST: ${PGHOST}"
echo "PGDATABASE: ${PGDATABASE}"
echo ""
echo "================================"
echo "✨ Ready to use Claude Code with MCP servers!"
