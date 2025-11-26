#!/bin/bash
# ==============================================================================
# Docker Connectivity Diagnostic
# ==============================================================================
# Run this INSIDE the dev container to check Docker access
# ==============================================================================

echo "🔍 Docker Connectivity Diagnostic"
echo "=================================="
echo ""

echo "1️⃣ Checking Docker CLI..."
if command -v docker &> /dev/null; then
    echo "   ✅ Docker CLI found: $(docker --version)"
else
    echo "   ❌ Docker CLI not found"
fi
echo ""

echo "2️⃣ Checking Docker socket..."
if [ -S /var/run/docker.sock ]; then
    echo "   ✅ Docker socket exists: /var/run/docker.sock"
    ls -l /var/run/docker.sock
else
    echo "   ❌ Docker socket NOT found at /var/run/docker.sock"
fi
echo ""

echo "3️⃣ Testing Docker connection..."
if docker ps &> /dev/null; then
    echo "   ✅ Docker is working!"
    echo ""
    echo "   Running containers:"
    docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
else
    echo "   ❌ Cannot connect to Docker daemon"
    echo ""
    echo "   This means the socket is not mounted or permissions are wrong."
fi
echo ""

echo "4️⃣ Checking user permissions..."
echo "   Current user: $(whoami)"
echo "   User ID: $(id -u)"
echo "   Groups: $(groups)"
echo ""

if [ -S /var/run/docker.sock ]; then
    echo "5️⃣ Socket permissions:"
    stat -c "   Owner: %U:%G (UID:%u GID:%g)" /var/run/docker.sock
    stat -c "   Permissions: %a" /var/run/docker.sock
fi

echo ""
echo "=================================="
echo "💡 If Docker is not working, you need to rebuild the container."
echo "   Run: ./scripts/restart-devcontainer.sh (from your HOST machine)"
