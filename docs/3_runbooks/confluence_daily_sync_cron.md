# Daily Confluence Sync - Cron Setup

## Installation

Add the following line to your crontab to run the sync daily at 11:00 AM EST:

```bash
# Edit crontab
crontab -e

# Add this line (11am EST = 4pm UTC in winter, 3pm UTC in summer due to DST)
# Using 16:00 UTC for EST (winter) - adjust for DST if needed
0 16 * * * /workspace/scripts/ops/daily_confluence_sync.sh

# Or use this for automatic DST handling (requires TZ support):
TZ=America/New_York
0 11 * * * /workspace/scripts/ops/daily_confluence_sync.sh
```

## Manual Run

```bash
/workspace/scripts/ops/daily_confluence_sync.sh
```

## Logs

Check sync logs:
```bash
tail -f /var/log/confluence-sync.log
```

## Disable

```bash
crontab -e
# Comment out or remove the line
```
