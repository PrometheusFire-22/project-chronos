#!/bin/bash
set -e

REGION="ca-central-1"
SERVICE="chronos-api-ca"
IMAGE_LABEL="chronos-api-ca-v2-3"
LOCAL_TAG="chronos-api-ca:latest"

echo "1. Building Docker Image..."
docker build -f apps/api/Dockerfile.production -t $LOCAL_TAG .

echo "2. Pushing to Lightsail ($REGION)..."
# Capture the output to get the image identifier
PUSH_OUTPUT=$(aws lightsail push-container-image --region $REGION --service-name $SERVICE --label $IMAGE_LABEL --image $LOCAL_TAG)
echo "$PUSH_OUTPUT"

# Extract the image name (e.g. :chronos-api-ca.chronos-api-ca-v2-3.3)
IMAGE_NAME=$(echo "$PUSH_OUTPUT" | grep -o ":$SERVICE\.$IMAGE_LABEL\.[0-9]\+")

# Fallback if grep fails
if [ -z "$IMAGE_NAME" ]; then
    IMAGE_NAME=":$IMAGE_LABEL"
fi

# Ensure required environment variables are set
REQUIRED_VARS=(DATABASE_HOST DATABASE_PORT DATABASE_NAME DATABASE_USER DATABASE_PASSWORD DIRECTUS_URL DIRECTUS_TOKEN FRED_API_KEY)
for VAR in "${REQUIRED_VARS[@]}"; do
    if [ -z "${!VAR}" ]; then
        echo "Error: Environment variable $VAR is not set."
        exit 1
    fi
done

echo "3. Deploying Image: $IMAGE_NAME"
aws lightsail create-container-service-deployment \
  --region $REGION \
  --service-name $SERVICE \
  --containers "{
    \"chronos-api\": {
      \"image\": \"$IMAGE_NAME\",
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

echo "Done! Deployment triggered."
