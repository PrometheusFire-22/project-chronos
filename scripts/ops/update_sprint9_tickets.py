#!/usr/bin/env python3
"""
Update Sprint 9 Tickets Script
Adds sprint-9 label to tickets and closes duplicates.

UPDATED: Migrated to official Atlassian CLI (ACLI)
Related: CHRONOS-268 (Sprint 9 - ACLI Migration)
"""

import subprocess

# Color codes
GREEN = "\033[92m"
YELLOW = "\033[93m"
RED = "\033[91m"
BLUE = "\033[94m"
RESET = "\033[0m"

TICKETS = [
    "CHRONOS-127",
    "CHRONOS-181",
    "CHRONOS-182",
    "CHRONOS-187",
    "CHRONOS-188",
    "CHRONOS-189",
    "CHRONOS-190",
    "CHRONOS-193",
    "CHRONOS-194",
]
DUPLICATE = "CHRONOS-128"


def run_acli(args: list[str]) -> dict:
    """Run ACLI command with proper error handling"""
    cmd = ["acli"] + args
    try:
        result = subprocess.run(cmd, capture_output=True, text=True, check=False)
        if result.returncode == 0:
            return {"success": True, "output": result.stdout, "stderr": result.stderr}
        else:
            return {"success": False, "error": result.stderr, "output": result.stdout}
    except Exception as e:
        return {"success": False, "error": str(e)}


def update_labels(key: str, labels: list[str]) -> None:
    """Update labels for a ticket using ACLI"""
    result = run_acli(["jira", "workitem", "edit", "--key", key, "--label", ",".join(labels)])
    if result["success"]:
        print(f"{GREEN}✅ Updated labels for {key}: {labels}{RESET}")
    else:
        print(f"{RED}❌ Failed to update labels for {key}{RESET}")


def transition_issue(key: str, status: str) -> None:
    """Transition issue to a new status using ACLI"""
    result = run_acli(["jira", "workitem", "transition", "--key", key, "--status", status])
    if result["success"]:
        print(f"{GREEN}✅ Transitioned {key} to {status}{RESET}")
    else:
        print(f"{YELLOW}⚠️  Could not transition {key} to {status}{RESET}")


def main():
    """Main execution function"""
    print(f"\n{GREEN}{'='*60}")
    print("Update Sprint 9 Tickets")
    print("Using: Atlassian CLI (ACLI)")
    print(f"{'='*60}{RESET}\n")

    # 1. Handle Duplicate (128)
    try:
        print(f"{YELLOW}Processing {DUPLICATE}...{RESET}")
        update_labels(DUPLICATE, ["duplicate", "sprint-9"])
        transition_issue(DUPLICATE, "Done")
        # Note: Resolution "Superseded" would be set manually or via custom field
    except Exception as e:
        print(f"{RED}❌ Failed to update {DUPLICATE}: {e}{RESET}")

    # 2. Handle Active Tickets
    for key in TICKETS:
        try:
            print(f"{YELLOW}Processing {key}...{RESET}")
            update_labels(key, ["sprint-9"])
        except Exception as e:
            print(f"{RED}❌ Failed to update {key}: {e}{RESET}")

    print(f"\n{GREEN}{'='*60}")
    print("Updates Complete!")
    print(f"{'='*60}{RESET}\n")

    print(f"{BLUE}Migration Note:{RESET}")
    print("  ✓ Successfully migrated from REST API to ACLI")
    print("  ✓ Labels: acli jira workitem edit --label")
    print("  ✓ Transitions: acli jira workitem transition --status")
    print("  ⚠ Resolution must be set manually or via custom field")
    print("  ✓ Related: CHRONOS-268 (Sprint 9)\n")


if __name__ == "__main__":
    main()
