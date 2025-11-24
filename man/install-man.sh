#!/bin/bash
# Install man pages for Project Chronos CLI tools

set -e

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}Installing Project Chronos man pages...${NC}"

# Determine installation directory
if [ -w "/usr/local/share/man/man1" ]; then
    MAN_DIR="/usr/local/share/man/man1"
    echo "Installing to system directory: $MAN_DIR"
elif [ -d "$HOME/.local/share/man/man1" ]; then
    MAN_DIR="$HOME/.local/share/man/man1"
    echo "Installing to user directory: $MAN_DIR"
else
    MAN_DIR="$HOME/.local/share/man/man1"
    echo "Creating user directory: $MAN_DIR"
    mkdir -p "$MAN_DIR"
fi

# Copy man pages
echo "Copying man pages..."
cp man/man1/jira.1 "$MAN_DIR/"
cp man/man1/confluence.1 "$MAN_DIR/"

# Update man database
echo "Updating man database..."
if command -v mandb &> /dev/null; then
    mandb -q 2>/dev/null || true
elif command -v makewhatis &> /dev/null; then
    makewhatis "$MAN_DIR" 2>/dev/null || true
fi

echo -e "${GREEN}✅ Installation complete!${NC}"
echo ""
echo "Test the man pages:"
echo "  man jira"
echo "  man confluence"
echo ""
echo "Search for commands:"
echo "  apropos jira"
echo "  apropos confluence"
