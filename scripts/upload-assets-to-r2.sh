#!/bin/bash

#
# Upload Marketing Assets to Directus/R2
#
# This script uploads all marketing assets from local filesystem to Directus,
# which stores them in Cloudflare R2 storage.
#

set -e

DIRECTUS_URL="${DIRECTUS_URL:-https://admin.automatonicai.com}"
ADMIN_EMAIL="${DIRECTUS_ADMIN_EMAIL:-geoff@automatonicai.com}"
ADMIN_PASSWORD="${DIRECTUS_ADMIN_PASSWORD}"

ASSETS_BASE="marketing/assets"

echo "🔐 Authenticating with Directus..."

# Login and get access token
# Use jq to properly escape special characters in password
AUTH_PAYLOAD=$(jq -n \
  --arg email "$ADMIN_EMAIL" \
  --arg password "$ADMIN_PASSWORD" \
  '{email: $email, password: $password}')

TOKEN_RESPONSE=$(curl -s -X POST "${DIRECTUS_URL}/auth/login" \
  -H "Content-Type: application/json" \
  -d "$AUTH_PAYLOAD")

ACCESS_TOKEN=$(echo "$TOKEN_RESPONSE" | jq -r '.data.access_token')

if [ "$ACCESS_TOKEN" = "null" ] || [ -z "$ACCESS_TOKEN" ]; then
  echo "❌ Authentication failed"
  echo "$TOKEN_RESPONSE"
  exit 1
fi

echo "✅ Authenticated successfully"
echo ""

# Function to upload a file
upload_file() {
  local file_path="$1"
  local folder_name="$2"
  local filename=$(basename "$file_path")

  echo "  📤 Uploading $filename to $folder_name/..."

  response=$(curl -s -X POST "${DIRECTUS_URL}/files" \
    -H "Authorization: Bearer ${ACCESS_TOKEN}" \
    -F "file=@${file_path}" \
    -F "folder=${folder_name}" \
    -F "storage=r2")

  if echo "$response" | jq -e '.data.id' > /dev/null 2>&1; then
    file_id=$(echo "$response" | jq -r '.data.id')
    echo "  ✅ Uploaded: $filename (ID: $file_id)"
    return 0
  else
    echo "  ❌ Failed to upload $filename"
    echo "     Response: $response"
    return 1
  fi
}

# Upload logos
echo "📂 Uploading logos..."
for file in "$ASSETS_BASE"/logos/final/*.{svg,png}; do
  [ -f "$file" ] && upload_file "$file" "logos" || true
done
echo ""

# Upload illustrations
echo "📂 Uploading illustrations..."
for file in "$ASSETS_BASE"/illustrations/*.svg; do
  [ -f "$file" ] && upload_file "$file" "illustrations" || true
done
echo ""

# Upload favicons
echo "📂 Uploading favicons..."
for file in "$ASSETS_BASE"/favicons/*.png; do
  [ -f "$file" ] && upload_file "$file" "favicons" || true
done
echo ""

echo "🎉 Asset upload complete!"
