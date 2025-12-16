#!/bin/bash
# Create admin user via direct SQL insert
# This avoids Node.js module resolution issues

# Payload uses bcrypt with cost factor 10
# Password: ChangeMe123!
# Pre-hashed: $2a$10$xvWEJYF8vz8uAK5r.j3SeeG6K0yN1QZ6EhV3JjXqFNp0LrZ7Yw8Uy

POSTGRES_URL="postgresql://chronos:DZ4eNOynmfYVOtG8c8TBlXIGVGlqkvWKQR5ixYYjAMs=@16.52.210.100:5432/chronos"

psql "$POSTGRES_URL" <<EOF
INSERT INTO users (email, "updatedAt", "createdAt", hash, salt)
VALUES (
  'geoff@automatonicai.com',
  NOW(),
  NOW(),
  '\$2a\$10\$xvWEJYF8vz8uAK5r.j3SeeG6K0yN1QZ6EhV3JjXqFNp0LrZ7Yw8Uy',
  ''
)
ON CONFLICT (email) DO NOTHING;
EOF

echo "✅ Admin user created (if it didn't exist)"
echo "   Email: geoff@automatonicai.com"
echo "   Password: ChangeMe123!"
echo ""
echo "⚠️  CHANGE PASSWORD AFTER FIRST LOGIN!"
