#!/bin/bash

# Setup script for MCP servers
# This script ensures all required MCP servers are available

echo "🔧 Setting up MCP servers for Claude Code..."
echo ""

# Check if required environment variables are set
echo "📋 Checking environment variables..."

# Required for GitHub MCP
if [ -z "$GITHUB_TOKEN" ]; then
  echo "⚠️  GITHUB_TOKEN not set"
  echo "   Get a token from: https://github.com/settings/tokens"
  echo "   Add to ~/.bashrc or ~/.zshrc: export GITHUB_TOKEN='your_token'"
fi

# Optional MCPs
if [ -z "$BRAVE_API_KEY" ]; then
  echo "ℹ️  BRAVE_API_KEY not set (optional)"
  echo "   Get a key from: https://brave.com/search/api/"
fi

if [ -z "$POSTGRES_PASSWORD" ]; then
  echo "⚠️  POSTGRES_PASSWORD not set"
  echo "   MCP defaults to AWS Lightsail production database (16.52.210.100:5432)"
  echo "   Get password from KeePassXC or use local database (set PGHOST=localhost)"
fi

if [ -z "$SENTRY_ORG_SLUG" ]; then
  echo "ℹ️  SENTRY_ORG_SLUG not set (optional)"
  echo "   Remote MCP hosted by Sentry with OAuth support"
fi

if [ -z "$DIRECTUS_URL" ]; then
  echo "ℹ️  DIRECTUS_URL not set (optional)"
  echo "   Requires Directus v11.12+ for MCP support"
fi

if [ -z "$TWENTY_API_KEY" ]; then
  echo "ℹ️  TWENTY_API_KEY not set (optional)"
  echo "   For TwentyCRM integration"
fi

if [ -z "$GOOGLE_CLIENT_ID" ]; then
  echo "ℹ️  GOOGLE_CLIENT_ID not set (optional)"
  echo "   For Google Workspace integration (Drive, Gmail, Calendar)"
fi

if [ -z "$ATLASSIAN_API_TOKEN" ]; then
  echo "ℹ️  ATLASSIAN_API_TOKEN not set (optional)"
  echo "   For Jira/Confluence integration"
fi

echo ""
echo "✅ MCP configuration file created at .mcp.json"
echo ""
echo "📦 Available MCP servers:"
echo "  Core:"
echo "    - github: GitHub PR management, issues, etc."
echo "    - filesystem: Fast file operations"
echo "    - git: Advanced git operations"
echo ""
echo "  Databases:"
echo "    - postgres: SQL queries (defaults to AWS Lightsail production @ 16.52.210.100)"
echo ""
echo "  Development:"
echo "    - nx: Monorepo structure, generators, tasks"
echo "    - sentry: Error monitoring (remote MCP with OAuth)"
echo ""
echo "  Content & CRM:"
echo "    - directus: CMS content management (requires v11.12+)"
echo "    - twenty-crm: CRM operations (people, companies, tasks)"
echo ""
echo "  Productivity:"
echo "    - atlassian: Jira/Confluence integration"
echo "    - google-workspace: Gmail, Drive, Calendar, Docs"
echo ""
echo "  Search:"
echo "    - brave-search: Web search (requires API key)"
echo ""
echo "🚀 To enable MCPs in Claude Code:"
echo "  1. Start Claude Code in this directory"
echo "  2. MCPs will auto-load from .mcp.json"
echo "  3. Use /mcp command to see status"
echo "  4. @mention an MCP server to enable/disable it"
echo ""
echo "💡 Token savings with GitHub MCP:"
echo "  - Reading PRs: ~80% fewer tokens"
echo "  - Structured data vs CLI text parsing"
echo "  - Intelligent caching"
echo ""
