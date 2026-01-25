#!/bin/bash

# Directory for certs
CERT_DIR="./certs"
mkdir -p "$CERT_DIR"

# Generate self-signed certificate (valid for 3650 days)
# -nodes: No password on key (so Postgres can start automatically)
echo "Generating self-signed SSL certificate for Postgres..."
openssl req -new -x509 -days 3650 -nodes -text \
  -out "$CERT_DIR/server.crt" \
  -keyout "$CERT_DIR/server.key" \
  -subj "/CN=chronos-db"

# Set permissions (Critical: Postgres will refuse to start if key is world-readable)
chmod 600 "$CERT_DIR/server.key"
chmod 644 "$CERT_DIR/server.crt"
# Ideally own by postgres user, but since we mount it, 
# Docker usually maps permissions or we rely on the container reading it.
# The read-only mount in docker-compose handles the accessibility.

echo "✅ SSL Certificates generated in $CERT_DIR"
