#!/bin/bash

# Close risky Dependabot PRs
# This script closes PRs with major version updates or known breaking changes

echo "🚫 Closing risky Dependabot PRs..."
echo ""

# Array of PR numbers to close (major version updates and risky changes)
CLOSE_PRS=(91 90 93)

# Array of PR numbers to merge (safe patch updates)
MERGE_PRS=(97 89 88)

for pr in "${CLOSE_PRS[@]}"; do
  echo "Closing PR #$pr (breaking changes/major update)..."
  gh pr close $pr --comment "Closing this PR as it contains major version updates or breaking changes. We handle framework upgrades manually to avoid unexpected issues." || echo "Failed to close PR #$pr (may already be closed)"
done

echo ""
echo "✅ Safe to merge (patch updates only):"
for pr in "${MERGE_PRS[@]}"; do
  echo "  - PR #$pr"
done

echo ""
echo "⚠️  Review manually before merging:"
echo "  - PR #95 (Next framework - check if Next 16)"
echo "  - PR #96 (NX framework - check version bump)"
echo "  - PR #86 (Drizzle Kit - minor update, probably safe)"

echo ""
echo "To merge a safe PR:"
echo "  gh pr merge <number> --squash --delete-branch"
