#!/bin/bash

# Deployment Readiness Check Script
# CHRONOS-374 - Polish, optimize, and deploy

echo "🔍 Chronos Marketing Website - Deployment Readiness Check"
echo "=========================================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check Node.js version
echo "📦 Checking Node.js version..."
NODE_VERSION=$(node --version)
if [[ "$NODE_VERSION" == v20* ]] || [[ "$NODE_VERSION" == v21* ]] || [[ "$NODE_VERSION" == v22* ]]; then
    echo -e "${GREEN}✓${NC} Node.js $NODE_VERSION (>= 20.0.0 required)"
else
    echo -e "${RED}✗${NC} Node.js $NODE_VERSION (>= 20.0.0 required)"
fi
echo ""

# Check pnpm
echo "📦 Checking pnpm..."
if command -v pnpm &> /dev/null; then
    PNPM_VERSION=$(pnpm --version)
    echo -e "${GREEN}✓${NC} pnpm $PNPM_VERSION installed"
else
    echo -e "${RED}✗${NC} pnpm not found"
fi
echo ""

# Check environment file
echo "🔐 Checking environment configuration..."
if [ -f "apps/web/.env.local" ]; then
    echo -e "${GREEN}✓${NC} .env.local exists"

    if grep -q "NEXT_PUBLIC_DIRECTUS_URL" apps/web/.env.local; then
        echo -e "${GREEN}✓${NC} NEXT_PUBLIC_DIRECTUS_URL configured"
    else
        echo -e "${RED}✗${NC} NEXT_PUBLIC_DIRECTUS_URL missing"
    fi
else
    echo -e "${RED}✗${NC} .env.local not found"
fi

if [ -f "apps/web/.env.production" ]; then
    echo -e "${GREEN}✓${NC} .env.production exists"
else
    echo -e "${YELLOW}⚠${NC} .env.production not found (needed for deployment)"
fi
echo ""

# Check if dependencies are installed
echo "📚 Checking dependencies..."
if [ -d "node_modules" ]; then
    echo -e "${GREEN}✓${NC} node_modules exists"
else
    echo -e "${RED}✗${NC} node_modules not found - run 'pnpm install'"
fi
echo ""

# Check TypeScript build
echo "🔨 Checking TypeScript build..."
cd apps/web
if pnpm tsc --noEmit > /dev/null 2>&1; then
    echo -e "${GREEN}✓${NC} TypeScript check passed"
else
    echo -e "${RED}✗${NC} TypeScript errors found - run 'pnpm tsc --noEmit' for details"
fi
cd ../..
echo ""

# Check critical files
echo "📄 Checking critical files..."
FILES=(
    "apps/web/app/(frontend)/page.tsx"
    "apps/web/app/(frontend)/features/page.tsx"
    "apps/web/app/(frontend)/about/page.tsx"
    "apps/web/app/api/waitlist/route.ts"
    "apps/web/lib/directus/client.ts"
    "apps/web/lib/directus/collections.ts"
    "apps/web/lib/directus/types.ts"
)

for file in "${FILES[@]}"; do
    if [ -f "$file" ]; then
        echo -e "${GREEN}✓${NC} $file"
    else
        echo -e "${RED}✗${NC} $file missing"
    fi
done
echo ""

# Check Directus connectivity
echo "🌐 Checking Directus connectivity..."
if [ -f "apps/web/.env.local" ]; then
    DIRECTUS_URL=$(grep NEXT_PUBLIC_DIRECTUS_URL apps/web/.env.local | cut -d '=' -f2)
    if [ -n "$DIRECTUS_URL" ]; then
        if curl -s -o /dev/null -w "%{http_code}" "$DIRECTUS_URL" | grep -q "200\|301\|302"; then
            echo -e "${GREEN}✓${NC} Directus URL is accessible: $DIRECTUS_URL"
        else
            echo -e "${RED}✗${NC} Cannot reach Directus URL: $DIRECTUS_URL"
        fi
    fi
else
    echo -e "${YELLOW}⚠${NC} Cannot check Directus - .env.local not found"
fi
echo ""

# Summary
echo "=========================================================="
echo "📋 DEPLOYMENT READINESS SUMMARY"
echo "=========================================================="
echo ""
echo "Next steps:"
echo "1. Review DEPLOYMENT-CHECKLIST.md for detailed requirements"
echo "2. Populate Directus content using scripts in /scripts"
echo "3. Run 'cd apps/web && pnpm build' to verify build"
echo "4. Choose deployment platform (Vercel recommended)"
echo "5. Proceed with CHRONOS-374 polish tasks"
echo ""
echo "For detailed checklist: docs/30-TECHNICAL/DEPLOYMENT-CHECKLIST.md"
