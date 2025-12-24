#!/bin/bash

set -e

DIRECTUS_URL="${DIRECTUS_URL:-https://admin.automatonicai.com}"
ADMIN_EMAIL="${DIRECTUS_ADMIN_EMAIL:-geoff@automatonicai.com}"
ADMIN_PASSWORD="${DIRECTUS_ADMIN_PASSWORD}"

echo "🔐 Authenticating with Directus..."

# Login and get access token
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

# Create snapshot of current schema
echo "📸 Creating schema snapshot..."
SNAPSHOT_RESPONSE=$(curl -s -X POST "${DIRECTUS_URL}/schema/snapshot" \
  -H "Authorization: Bearer ${ACCESS_TOKEN}" \
  -H "Content-Type: application/json")

echo "$SNAPSHOT_RESPONSE" > /tmp/directus-schema-snapshot.json

echo "✅ Schema snapshot created"
echo ""

# Apply the snapshot (this will import any new tables)
echo "🔄 Applying schema..."
APPLY_RESPONSE=$(curl -s -X POST "${DIRECTUS_URL}/schema/apply" \
  -H "Authorization: Bearer ${ACCESS_TOKEN}" \
  -H "Content-Type: application/json" \
  -d @/tmp/directus-schema-snapshot.json)

echo "$APPLY_RESPONSE"

echo "✅ Schema applied"
echo "🎉 Directus schema synced!"
