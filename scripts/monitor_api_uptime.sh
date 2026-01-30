#!/bin/bash
# API Uptime Monitoring Script
# Checks if FastAPI is responding correctly

API_URL="http://localhost:8000/health"
LOG_FILE="/var/log/chronos-api-uptime.log"
MAX_RESPONSE_TIME=5  # seconds

check_api() {
    # Measure response time
    START=$(date +%s.%N)
    RESPONSE=$(curl -s -w "%{http_code}" -o /dev/null --max-time $MAX_RESPONSE_TIME $API_URL)
    END=$(date +%s.%N)
    DURATION=$(echo "$END - $START" | bc)

    TIMESTAMP=$(date '+%Y-%m-%d %H:%M:%S')

    if [ "$RESPONSE" = "200" ]; then
        echo "$TIMESTAMP [OK] API responding in ${DURATION}s" >> $LOG_FILE
        exit 0
    else
        echo "$TIMESTAMP [ERROR] API returned HTTP $RESPONSE" >> $LOG_FILE

        # Try to restart FastAPI container
        echo "$TIMESTAMP [ACTION] Attempting to restart chronos-fastapi container" >> $LOG_FILE
        docker restart chronos-fastapi

        # Optional: Send alert
        # echo "API down - HTTP $RESPONSE" | mail -s "API Alert" your@email.com
        exit 1
    fi
}

check_api
