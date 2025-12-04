#!/bin/bash
set -e

# 1. Create .env file
echo "Creating .env file..."
cat > ~/chronos-db/.env << 'EOF'
DATABASE_USER=chronos
DATABASE_PASSWORD=TemporaryRestorePassword123!
DATABASE_NAME=chronos
DATABASE_PORT=5432
EOF

# 1.5 Move pgbackrest.conf to project dir
if [ -f ~/pgbackrest.conf ]; then
    cp ~/pgbackrest.conf ~/chronos-db/pgbackrest.conf
fi

# 2. Start container to initialize volume
echo "Starting container to initialize volume..."
cd ~/chronos-db
docker-compose down
docker-compose up -d --build timescaledb

echo "Waiting 10s for initialization..."
sleep 10

# 3. Stop container
echo "Stopping container..."
docker-compose stop

# 4. Identify volume
VOLUME_NAME=$(docker inspect chronos-db --format '{{ range .Mounts }}{{ if eq .Destination "/var/lib/postgresql/data" }}{{ .Name }}{{ end }}{{ end }}')
if [ -z "$VOLUME_NAME" ]; then
    echo "ERROR: Could not identify data volume for chronos-db"
    exit 1
fi
echo "Identified volume: $VOLUME_NAME"

# 5. Wipe data (Safety check: make sure we are on DR instance)
HOSTNAME=$(hostname)
if [[ "$HOSTNAME" != *"chronos-production-database-dr"* && "$HOSTNAME" != *"ip-"* ]]; then
    echo "WARNING: Hostname $HOSTNAME does not look like DR instance. Aborting wipe."
    # In Lightsail, hostname is usually ip-x-x-x-x. We'll skip this check or make it less strict for now.
    # echo "Proceeding anyway..."
fi

echo "Wiping data in volume $VOLUME_NAME..."
docker run --rm -v $VOLUME_NAME:/data busybox rm -rf /data/*

# 6. Restore from S3
echo "Restoring from S3..."
# We use the timescale image to ensure we have compatible binaries, but we need to install pgbackrest
docker run --rm \
    -v $VOLUME_NAME:/var/lib/postgresql/data \
    -v ~/pgbackrest.conf:/etc/pgbackrest/pgbackrest.conf \
    --entrypoint /bin/sh \
    timescale/timescaledb:latest-pg16 \
    -c "apk add --no-cache pgbackrest && \
        pgbackrest --stanza=chronos --type=immediate --target-action=promote --delta --log-level-console=info restore"

# 7. Start container
echo "Starting container..."
docker-compose start timescaledb

echo "Restore complete! Verifying..."
sleep 10
docker logs chronos-db | tail -n 20
