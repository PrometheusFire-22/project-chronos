#!/bin/bash
set -e

# Directus Public Permissions Setup Script
# Sets public read access for CMS collections and create access for waitlist

DIRECTUS_URL="${DIRECTUS_URL:-https://admin.automatonicai.com}"
ADMIN_EMAIL="${DIRECTUS_ADMIN_EMAIL:-geoff@automatonicai.com}"
ADMIN_PASSWORD="${DIRECTUS_ADMIN_PASSWORD}"

if [ -z "$ADMIN_PASSWORD" ]; then
  echo "Error: DIRECTUS_ADMIN_PASSWORD environment variable is required"
  echo "Usage: DIRECTUS_ADMIN_PASSWORD=your-password ./scripts/set-directus-public-permissions.sh"
  exit 1
fi

echo "🔐 Authenticating with Directus..."

# Authenticate and get token
TOKEN=$(curl -s -X POST "${DIRECTUS_URL}/auth/login" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"${ADMIN_EMAIL}\",\"password\":\"${ADMIN_PASSWORD}\"}" \
  | grep -o '"access_token":"[^"]*"' \
  | cut -d'"' -f4)

if [ -z "$TOKEN" ]; then
  echo "❌ Authentication failed. Check your credentials."
  exit 1
fi

echo "✅ Authenticated successfully"

# Get the public role ID
echo "🔍 Finding public role..."
PUBLIC_ROLE_ID=$(curl -s -X GET "${DIRECTUS_URL}/roles?filter[name][_eq]=Public" \
  -H "Authorization: Bearer ${TOKEN}" \
  | grep -o '"id":"[^"]*"' \
  | head -1 \
  | cut -d'"' -f4)

if [ -z "$PUBLIC_ROLE_ID" ]; then
  echo "❌ Could not find public role"
  exit 1
fi

echo "✅ Found public role: ${PUBLIC_ROLE_ID}"

# Function to set collection permissions
set_permissions() {
  local collection=$1
  local read_access=$2
  local create_access=$3

  echo "📝 Setting permissions for ${collection}..."

  # Create or update permission
  curl -s -X POST "${DIRECTUS_URL}/permissions" \
    -H "Authorization: Bearer ${TOKEN}" \
    -H "Content-Type: application/json" \
    -d "{
      \"role\": \"${PUBLIC_ROLE_ID}\",
      \"collection\": \"${collection}\",
      \"action\": \"read\",
      \"permissions\": ${read_access},
      \"fields\": \"*\"
    }" > /dev/null

  if [ "$create_access" = "true" ]; then
    curl -s -X POST "${DIRECTUS_URL}/permissions" \
      -H "Authorization: Bearer ${TOKEN}" \
      -H "Content-Type: application/json" \
      -d "{
        \"role\": \"${PUBLIC_ROLE_ID}\",
        \"collection\": \"${collection}\",
        \"action\": \"create\",
        \"permissions\": {},
        \"fields\": \"*\"
      }" > /dev/null
  fi
}

echo ""
echo "🚀 Setting public permissions..."
echo ""

# Set read permissions for CMS collections
set_permissions "cms_homepage_hero" "{}" "false"
echo "✅ cms_homepage_hero - Read enabled"

set_permissions "cms_features" "{}" "false"
echo "✅ cms_features - Read enabled"

set_permissions "cms_blog_posts" "{\"status\":{\"_eq\":\"published\"}}" "false"
echo "✅ cms_blog_posts - Read enabled (published only)"

set_permissions "cms_docs_pages" "{\"status\":{\"_eq\":\"published\"}}" "false"
echo "✅ cms_docs_pages - Read enabled (published only)"

set_permissions "cms_announcements" "{\"active\":{\"_eq\":true}}" "false"
echo "✅ cms_announcements - Read enabled (active only)"

set_permissions "cms_legal_pages" "{\"status\":{\"_eq\":\"published\"}}" "false"
echo "✅ cms_legal_pages - Read enabled (published only)"

set_permissions "cms_waitlist_submissions" "null" "true"
echo "✅ cms_waitlist_submissions - Create enabled"

echo ""
echo "🎉 Public permissions configured successfully!"
echo ""
echo "Next steps:"
echo "  1. Visit https://project-chronos.pages.dev"
echo "  2. Verify content loads from Directus"
echo "  3. Test the waitlist form"
echo ""
