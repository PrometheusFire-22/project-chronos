#!/bin/bash
set -e

INSTANCE_NAME="chronos-production-database-dr"
REGION="ca-central-1"

echo "WARNING: This will DELETE the instance $INSTANCE_NAME in $REGION."
read -p "Are you sure? (y/N) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Aborted."
    exit 1
fi

echo "Deleting instance $INSTANCE_NAME..."
aws lightsail delete-instance --instance-name $INSTANCE_NAME --region $REGION

echo "Instance deleted."
