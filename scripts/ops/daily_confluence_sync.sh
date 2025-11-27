#!/bin/bash
# Daily Confluence documentation sync
# Runs at 11:00 AM EST (16:00 UTC, accounting for EST = UTC-5)

cd /workspace
python scripts/ops/sync_docs.py >> /var/log/confluence-sync.log 2>&1

# Commit mapping updates if changed
if git diff --quiet docs/.confluence-mapping.json; then
    exit 0
else
    git add docs/.confluence-mapping.json
    git commit -m "chore(docs): Daily Confluence sync [automated]"
    git push origin $(git branch --show-current)
fi
