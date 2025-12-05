#!/bin/bash
# Sync all refactored documentation to Confluence
set -e

# Load environment variables
if [ -f ".env" ]; then
    set -a
    source .env
    set +a
fi

# Ensure required variables are set
if [ -z "$CONFLUENCE_URL" ] || [ -z "$CONFLUENCE_EMAIL" ] || [ -z "$CONFLUENCE_API_TOKEN" ]; then
    echo "Error: Confluence credentials not found in environment or .env file"
    exit 1
fi

export CONFLUENCE_SPACE="PC"

cd /home/prometheus/coding/finance/project-chronos
source .venv/bin/activate

echo "╔════════════════════════════════════════════════════════════╗"
echo "║  Syncing All Documentation to Confluence                  ║"
echo "╔════════════════════════════════════════════════════════════╗"
echo ""

# First, create parent page for organization
echo "📁 Creating Documentation parent page..."

confluence create \
  --title "📚 Documentation" \
  --space PC \
  --body "# Project Chronos Documentation

This is the root page for all Project Chronos documentation.

## Structure

- **Architecture** - System design, ADRs, data models
- **Operations** - Runbooks and operational procedures
- **Guides** - Developer and user guides
- **Reference** - CLI manuals, templates, troubleshooting

## Recently Refactored

The documentation was recently refactored (2025-12-05) to improve organization and reduce duplication:
- 22% file reduction (83 → 65 files)
- Clean 4-tier structure
- Consolidated duplicate content" \
  --labels "documentation,index,toc"

echo ""
echo "✓ Created Documentation parent page"
echo ""

# Get the page ID we just created
DOC_PARENT=$(confluence list --space PC --limit 1 | grep "Documentation" | awk '{print $1}' || echo "")

if [ -z "$DOC_PARENT" ]; then
  echo "⚠️  Could not find Documentation parent page ID"
  echo "   Please manually set parent for pages 10289154, 10289186, 10289214"
  exit 1
fi

echo "📝 Organizing existing pages under Documentation parent..."
echo "   Parent ID: $DOC_PARENT"
echo ""

# Update existing pages to have the Documentation page as parent
# Note: Confluence CLI uses page title for update, not ID
confluence update "Google Workspace Setup & Operations" \
  --parent "📚 Documentation" \
  --body-file docs/operations/integrations/google_workspace_setup.md

confluence update "Google Workspace Integration Guide" \
  --parent "📚 Documentation" \
  --body-file docs/guides/integration/google_workspace_guide.md

confluence update "KeePassXC Workflow" \
  --parent "📚 Documentation" \
  --body-file docs/operations/security/keepassxc_workflow.md

echo ""
echo "✅ Confluence sync complete!"
echo ""
echo "📱 View in browser:"
echo "   https://automatonicai.atlassian.net/wiki/spaces/PC/overview"
echo ""
echo "📋 Pages are now organized under '📚 Documentation'"
