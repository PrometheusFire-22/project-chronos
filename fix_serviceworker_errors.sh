#!/bin/bash

# Script to fix ServiceWorker registration errors in Antigravity/VS Code
# Addresses issues with Markdown All-in-One and Atlassian AtlasCode extensions

echo "🔧 Starting ServiceWorker error fixes..."
echo ""

# Step 1: Kill lingering Code processes
echo "Step 1: Killing lingering Code/Antigravity processes..."
if pgrep -f "code" > /dev/null; then
    echo "  Found running Code processes. Terminating..."
    killall code 2>/dev/null || true
    sleep 2
    # Force kill if still running
    if pgrep -f "code" > /dev/null; then
        echo "  Force killing remaining processes..."
        pkill -9 -f "code" 2>/dev/null || true
    fi
    echo "  ✅ Processes terminated"
else
    echo "  ℹ️  No Code processes found running"
fi
echo ""

# Step 2: Clear Antigravity/VS Code cache
echo "Step 2: Clearing Antigravity cache directories..."
CACHE_DIRS=(
    "$HOME/.config/Code/Cache"
    "$HOME/.config/Code/CachedData"
    "$HOME/.config/Code/GPUCache"
    "$HOME/.config/Code/CachedExtensions"
    "$HOME/.config/Code/CachedExtensionVSIXs"
)

for dir in "${CACHE_DIRS[@]}"; do
    if [ -d "$dir" ]; then
        echo "  Clearing: $dir"
        rm -rf "$dir"/* 2>/dev/null || true
        echo "  ✅ Cleared"
    else
        echo "  ℹ️  Not found: $dir"
    fi
done
echo ""

# Step 3: Clear AtlasCode Rovo Dev cache
echo "Step 3: Clearing AtlasCode Rovo Dev cache..."
ROVODEV_FOUND=false

# Search in vscode-server (for remote/dev containers)
if [ -d "$HOME/.vscode-server" ]; then
    echo "  Searching in .vscode-server..."
    find "$HOME/.vscode-server" -name ".rovodev" -type d 2>/dev/null | while read -r rovodir; do
        echo "  Found: $rovodir"
        rm -rf "$rovodir"
        echo "  ✅ Removed"
        ROVODEV_FOUND=true
    done
fi

# Search in local Code config
if [ -d "$HOME/.config/Code" ]; then
    echo "  Searching in .config/Code..."
    find "$HOME/.config/Code" -name ".rovodev" -type d 2>/dev/null | while read -r rovodir; do
        echo "  Found: $rovodir"
        rm -rf "$rovodir"
        echo "  ✅ Removed"
        ROVODEV_FOUND=true
    done
fi

if [ "$ROVODEV_FOUND" = false ]; then
    echo "  ℹ️  No .rovodev directories found"
fi
echo ""

# Step 4: Clear workspace storage for AtlasCode
echo "Step 4: Clearing AtlasCode workspace storage..."
WORKSPACE_STORAGE_DIRS=(
    "$HOME/.config/Code/User/workspaceStorage"
    "$HOME/.vscode-server/data/User/workspaceStorage"
)

for wsdir in "${WORKSPACE_STORAGE_DIRS[@]}"; do
    if [ -d "$wsdir" ]; then
        echo "  Searching in: $wsdir"
        find "$wsdir" -type d -name "atlassian.atlascode" 2>/dev/null | while read -r atlasdir; do
            echo "  Found AtlasCode storage: $atlasdir"
            rm -rf "$atlasdir"
            echo "  ✅ Removed"
        done
    fi
done
echo ""

echo "✅ All quick fixes completed!"
echo ""
echo "📋 Next steps:"
echo "  1. Restart Antigravity/VS Code"
echo "  2. Reopen your dev container"
echo "  3. Re-authenticate AtlasCode if needed:"
echo "     - Press Ctrl+Shift+P"
echo "     - Run: 'Atlassian: Open Settings'"
echo "     - Delete old authentications and re-authenticate"
echo ""
echo "  4. Test Markdown All-in-One preview"
echo ""
