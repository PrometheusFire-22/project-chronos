#!/bin/bash
# Quick script to rebuild Dev Container after Dockerfile changes

echo "🔧 Rebuilding Dev Container..."
echo ""
echo "Steps:"
echo "1. Close Antigravity/VS Code"
echo "2. Run this from your HOST terminal:"
echo ""
echo "   cd ~/coding/finance/project-chronos"
echo "   docker compose down"
echo "   docker system prune -f"
echo ""
echo "3. Reopen in Antigravity/VS Code"
echo "4. Command Palette → 'Dev Containers: Rebuild Container'"
echo ""
echo "✅ This will rebuild with the updated Docker CLI version"
