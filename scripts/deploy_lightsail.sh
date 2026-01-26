#!/bin/bash

# Deploy the container version we just pushed (v2)
# We must inject the secrets here because Lightsail containers don't inherit .env files automatically

# Handle environment variables
if [ -f .env.production ]; then
    echo "Loading variables from .env.production..."
    export $(grep -v '^#' .env.production | xargs)
fi

# Ensure required environment variables are set
REQUIRED_VARS=(DATABASE_HOST DATABASE_PORT DATABASE_NAME DATABASE_USER DATABASE_PASSWORD DIRECTUS_URL DIRECTUS_TOKEN FRED_API_KEY)

# Map DIRECTUS_KEY to DIRECTUS_TOKEN if found in .env files
if [ -z "$DIRECTUS_TOKEN" ] && [ -n "$DIRECTUS_KEY" ]; then
    export DIRECTUS_TOKEN="$DIRECTUS_KEY"
fi

for VAR in "${REQUIRED_VARS[@]}"; do
    if [ -z "${!VAR}" ]; then
        echo "Error: Environment variable $VAR is not set."
        echo "Please ensure it is exported or present in .env.production"
        exit 1
    fi
done

echo "Deploying chronos-api.v2.1 to Lightsail..."

aws lightsail create-container-service-deployment \
  --region ca-central-1 \
  --service-name chronos-api-ca \
  --containers "{
    \"chronos-api\": {
      \"image\": \":chronos-api-ca.v2.2\",
      \"environment\": {
        \"DATABASE_HOST\": \"$DATABASE_HOST\",
        \"DATABASE_PORT\": \"$DATABASE_PORT\",
        \"DATABASE_NAME\": \"$DATABASE_NAME\",
        \"DATABASE_USER\": \"$DATABASE_USER\",
        \"DATABASE_PASSWORD\": \"$DATABASE_PASSWORD\",
        \"DIRECTUS_URL\": \"$DIRECTUS_URL\",
        \"DIRECTUS_TOKEN\": \"$DIRECTUS_TOKEN\",
        \"FRED_API_KEY\": \"$FRED_API_KEY\",
        \"LOG_LEVEL\": \"INFO\",
        \"ENVIRONMENT\": \"production\",
        \"NODE_ENV\": \"production\"
      },
      \"ports\": {
        \"8000\": \"HTTP\"
      }
    }
  }" \
  --public-endpoint '{"containerName": "chronos-api", "containerPort": 8000, "healthCheck": {"path": "/health"}}'

echo "Deployment triggered! Check status with: aws lightsail get-container-services --service-name chronos-api"
