# ~/scripts/claude-context.sh
#!/bin/bash
echo "# Project Chronos - Context Snapshot"
echo "**Generated:** $(date)"
echo ""
echo "## Git Status"
git status --short
echo ""
echo "## Recent Commits"
git log --oneline -5
echo ""
echo "## Active Branch"
git branch --show-current
echo ""
echo "## Jira Tickets (Last 5)"
cat workflows/jira/catalog.csv | tail -5
