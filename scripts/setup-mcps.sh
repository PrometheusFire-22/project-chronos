#!/bin/bash

# Setup script for MCP servers
# This script ensures all required MCP servers are available

echo "🔧 Setting up MCP servers for Claude Code..."
echo ""

# Check if required environment variables are set
echo "📋 Checking environment variables..."

if [ -z "$GITHUB_TOKEN" ]; then
  echo "⚠️  GITHUB_TOKEN not set"
  echo "   Get a token from: https://github.com/settings/tokens"
  echo "   Add to ~/.bashrc or ~/.zshrc: export GITHUB_TOKEN='your_token'"
fi

if [ -z "$BRAVE_API_KEY" ]; then
  echo "ℹ️  BRAVE_API_KEY not set (optional)"
  echo "   Get a key from: https://brave.com/search/api/"
fi

if [ -z "$POSTGRES_PASSWORD" ]; then
  echo "ℹ️  POSTGRES_PASSWORD not set (optional)"
  echo "   Set if you want to use Postgres MCP"
fi

echo ""
echo "✅ MCP configuration file created at .mcp.json"
echo ""
echo "📦 Available MCP servers:"
echo "  - github: GitHub PR management, issues, etc."
echo "  - filesystem: Fast file operations"
echo "  - postgres: Database queries (when Postgres is running)"
echo "  - git: Advanced git operations"
echo "  - brave-search: Web search (requires API key)"
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
