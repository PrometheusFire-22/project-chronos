#!/bin/bash
# Test script for Protomaps + R2 mapping infrastructure
# Verifies all production components are working correctly

set -e

TILES_URL="${NEXT_PUBLIC_R2_TILES_URL:-https://tiles.automatonicai.com}"
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo "======================================"
echo "Protomaps + R2 Infrastructure Tests"
echo "======================================"
echo ""

# Test 1: PMTiles file accessibility
echo -n "Test 1: PMTiles file accessible... "
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "${TILES_URL}/tiles/protomaps-north-america.pmtiles")
if [ "$HTTP_CODE" = "200" ]; then
    echo -e "${GREEN}✓ PASS${NC} (HTTP $HTTP_CODE)"
else
    echo -e "${RED}✗ FAIL${NC} (HTTP $HTTP_CODE)"
    exit 1
fi

# Test 2: PMTiles cache headers
echo -n "Test 2: PMTiles cache headers... "
CACHE_CONTROL=$(curl -sI "${TILES_URL}/tiles/protomaps-north-america.pmtiles" | grep -i "cache-control" | tr -d '\r')
if echo "$CACHE_CONTROL" | grep -q "max-age=31536000"; then
    echo -e "${GREEN}✓ PASS${NC} (1-year cache)"
else
    echo -e "${RED}✗ FAIL${NC} ($CACHE_CONTROL)"
    exit 1
fi

# Test 3: Font glyphs accessible
echo -n "Test 3: Font glyphs (Noto Sans Regular)... "
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "${TILES_URL}/fonts/Noto%20Sans%20Regular/0-255.pbf")
if [ "$HTTP_CODE" = "200" ]; then
    echo -e "${GREEN}✓ PASS${NC} (HTTP $HTTP_CODE)"
else
    echo -e "${RED}✗ FAIL${NC} (HTTP $HTTP_CODE)"
    exit 1
fi

# Test 4: Font cache headers
echo -n "Test 4: Font cache headers... "
CACHE_CONTROL=$(curl -sI "${TILES_URL}/fonts/Noto%20Sans%20Regular/0-255.pbf" | grep -i "cache-control" | tr -d '\r')
if echo "$CACHE_CONTROL" | grep -q "max-age=31536000"; then
    echo -e "${GREEN}✓ PASS${NC} (1-year cache)"
else
    echo -e "${RED}✗ FAIL${NC} ($CACHE_CONTROL)"
    exit 1
fi

# Test 5: Content-Type headers
echo -n "Test 5: Content-Type headers... "
CONTENT_TYPE=$(curl -sI "${TILES_URL}/tiles/protomaps-north-america.pmtiles" | grep -i "content-type" | tr -d '\r')
if echo "$CONTENT_TYPE" | grep -q "application/x-protobuf"; then
    echo -e "${GREEN}✓ PASS${NC} (protobuf)"
else
    echo -e "${YELLOW}⚠ WARN${NC} ($CONTENT_TYPE)"
fi

# Test 6: HTTPS/TLS
echo -n "Test 6: HTTPS/TLS enabled... "
if curl -sI "${TILES_URL}/tiles/protomaps-north-america.pmtiles" | grep -q "HTTP/2"; then
    echo -e "${GREEN}✓ PASS${NC} (HTTP/2)"
else
    echo -e "${YELLOW}⚠ WARN${NC} (HTTP/1.1)"
fi

# Test 7: Cloudflare CDN
echo -n "Test 7: Cloudflare CDN active... "
if curl -sI "${TILES_URL}/tiles/protomaps-north-america.pmtiles" | grep -q "server: cloudflare"; then
    echo -e "${GREEN}✓ PASS${NC}"
else
    echo -e "${RED}✗ FAIL${NC}"
    exit 1
fi

# Test 8: PMTiles file size
echo -n "Test 8: PMTiles file size... "
FILE_SIZE=$(curl -sI "${TILES_URL}/tiles/protomaps-north-america.pmtiles" | grep -i "content-length" | awk '{print $2}' | tr -d '\r')
FILE_SIZE_MB=$((FILE_SIZE / 1024 / 1024))
if [ "$FILE_SIZE_MB" -ge 100 ] && [ "$FILE_SIZE_MB" -le 150 ]; then
    echo -e "${GREEN}✓ PASS${NC} (${FILE_SIZE_MB} MB)"
else
    echo -e "${YELLOW}⚠ WARN${NC} (${FILE_SIZE_MB} MB - expected 100-150 MB)"
fi

# Test 9: ETag headers (for caching)
echo -n "Test 9: ETag headers present... "
if curl -sI "${TILES_URL}/tiles/protomaps-north-america.pmtiles" | grep -qi "etag"; then
    echo -e "${GREEN}✓ PASS${NC}"
else
    echo -e "${YELLOW}⚠ WARN${NC}"
fi

# Test 10: Multiple font variants
echo -n "Test 10: Multiple font variants... "
FONTS_OK=true
for font in "Noto%20Sans%20Regular" "Noto%20Sans%20Medium" "Noto%20Sans%20Italic"; do
    HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "${TILES_URL}/fonts/${font}/0-255.pbf")
    if [ "$HTTP_CODE" != "200" ]; then
        FONTS_OK=false
        break
    fi
done
if [ "$FONTS_OK" = true ]; then
    echo -e "${GREEN}✓ PASS${NC} (3 variants)"
else
    echo -e "${RED}✗ FAIL${NC}"
    exit 1
fi

# Summary
echo ""
echo "======================================"
echo -e "${GREEN}All infrastructure tests passed!${NC}"
echo "======================================"
echo ""
echo "Next steps:"
echo "1. Deploy Next.js application to Cloudflare Pages"
echo "2. Verify map renders with vector tiles in browser"
echo "3. Check browser DevTools Network tab for:"
echo "   - No 'glyphs' errors in console"
echo "   - PMTiles loaded via pmtiles:// protocol"
echo "   - Font glyphs loaded from R2"
echo "   - Cloudflare cache status: HIT (after first load)"
echo "4. Monitor R2 analytics for cache hit ratio (target > 95%)"
echo ""
echo "Documentation: data/tiles/CACHING.md"

# Test 11: CORS headers present
echo -n "Test 11: CORS headers (PMTiles)... "
CORS_ORIGIN=$(curl -sI "${TILES_URL}/tiles/protomaps-north-america.pmtiles" | grep -i "access-control-allow-origin" | tr -d '\r')
if echo "$CORS_ORIGIN" | grep -q "*"; then
    echo -e "${GREEN}✓ PASS${NC} (wildcard)"
else
    echo -e "${RED}✗ FAIL${NC} (CORS blocked)"
    exit 1
fi

# Test 12: CORS headers (fonts)
echo -n "Test 12: CORS headers (fonts)... "
CORS_ORIGIN=$(curl -sI "${TILES_URL}/fonts/Noto%20Sans%20Regular/0-255.pbf" | grep -i "access-control-allow-origin" | tr -d '\r')
if echo "$CORS_ORIGIN" | grep -q "*"; then
    echo -e "${GREEN}✓ PASS${NC} (wildcard)"
else
    echo -e "${RED}✗ FAIL${NC} (CORS blocked)"
    exit 1
fi
