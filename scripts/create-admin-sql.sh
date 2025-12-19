#!/bin/bash
# Create admin user via direct SQL insert
# This avoids Node.js module resolution issues

# Payload uses bcrypt with cost factor 10
# Password: ChangeMe123!
# Pre-hashed: $2a$10$xvWEJYF8vz8uAK5r.j3SeeG6K0yN1QZ6EhV3JjXqFNp0LrZ7Yw8Uy

# Read from environment or source .env
if [ -z "$POSTGRES_URL" ]; then
  echo "❌ Error: POSTGRES_URL environment variable is not set"
  exit 1
fi

psql "$POSTGRES_URL" <<EOF
INSERT INTO users (email, "updatedAt", "createdAt", hash, salt)
VALUES (
  '${ADMIN_EMAIL:-admin@example.com}',
  NOW(),
  NOW(),
  '${ADMIN_HASH:-$2a$10$xvWEJYF8vz8uAK5r.j3SeeG6K0yN1QZ6EhV3JjXqFNp0LrZ7Yw8Uy}',
  ''
)
ON CONFLICT (email) DO NOTHING;
EOF

echo "✅ Admin user created (if it didn't exist)"
echo "   Email: ${ADMIN_EMAIL:-admin@example.com}"
echo "   Password: [HIDDEN] (See .env ADMIN_PASSWORD)"
echo ""
echo "⚠️  CHANGE PASSWORD AFTER FIRST LOGIN!"
