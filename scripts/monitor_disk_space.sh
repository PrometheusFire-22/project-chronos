#!/bin/bash
# Disk Space Monitoring Script
# Alerts when disk usage exceeds threshold

THRESHOLD=80
EMAIL="your@email.com"  # Update this

check_disk() {
    df -H | grep -vE '^Filesystem|tmpfs|cdrom' | awk '{ print $5 " " $1 }' | while read output;
    do
        usage=$(echo $output | awk '{ print $1}' | sed 's/%//g')
        partition=$(echo $output | awk '{ print $2 }')

        if [ $usage -ge $THRESHOLD ]; then
            echo "ALERT: Disk usage on $partition is at ${usage}%"
            # Log to file
            echo "$(date): Disk usage on $partition is at ${usage}%" >> /var/log/chronos-disk-alerts.log

            # Optional: Send email (requires mailutils)
            # echo "Disk usage on $partition is at ${usage}%" | mail -s "Disk Space Alert - $partition" $EMAIL
        fi
    done
}

check_disk
