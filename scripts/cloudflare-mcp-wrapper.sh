#!/bin/bash
# Wrapper script to run Cloudflare MCP without pnpm config warnings
# Run from /tmp to avoid local .npmrc

cd /tmp

# Account ID can be passed as first argument or from environment variable
ACCOUNT_ID="${1:-${CLOUDFLARE_ACCOUNT_ID}}"

if [ -z "$ACCOUNT_ID" ]; then
  echo "Error: Account ID required either as argument or CLOUDFLARE_ACCOUNT_ID env var" >&2
  exit 1
fi

exec npx -y @cloudflare/mcp-server-cloudflare run "$ACCOUNT_ID"
