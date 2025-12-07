#!/usr/bin/env python3
"""
List Jira Sprints Script
Lists all sprints for a given board.

UPDATED: Migrated to official Atlassian CLI (ACLI)
Related: CHRONOS-268 (Sprint 9 - ACLI Migration)
"""

import subprocess
import sys

# Color codes for output
GREEN = "\033[92m"
YELLOW = "\033[93m"
RED = "\033[91m"
BLUE = "\033[94m"
RESET = "\033[0m"

# Default board ID (Project Chronos board)
DEFAULT_BOARD_ID = "1"


def run_acli(args: list[str]) -> dict:
    """Run ACLI command with proper error handling"""
    cmd = ["acli"] + args
    print(f"{BLUE}Running: {' '.join(cmd)}{RESET}")

    try:
        result = subprocess.run(cmd, capture_output=True, text=True, check=False)
        if result.returncode == 0:
            return {"success": True, "output": result.stdout, "stderr": result.stderr}
        else:
            print(f"{RED}✗ Failed: {result.stderr}{RESET}")
            return {"success": False, "error": result.stderr, "output": result.stdout}
    except Exception as e:
        print(f"{RED}✗ Exception: {e}{RESET}")
        return {"success": False, "error": str(e)}


def list_sprints(board_id: str = DEFAULT_BOARD_ID, state: str = None) -> None:
    """List all sprints for a board"""
    print(f"\n{GREEN}{'='*60}")
    print(f"Listing Sprints for Board {board_id}")
    print(f"{'='*60}{RESET}\n")

    args = ["jira", "board", "list-sprints", "--id", board_id]

    if state:
        args.extend(["--state", state])

    result = run_acli(args)

    if result["success"]:
        print(f"\n{GREEN}✓ Successfully retrieved sprints{RESET}\n")
        print(result["output"])
    else:
        print(f"\n{RED}✗ Failed to retrieve sprints{RESET}")
        sys.exit(1)


def main():
    """Main execution function"""
    # Parse command line arguments
    board_id = DEFAULT_BOARD_ID
    state = None

    if len(sys.argv) > 1:
        board_id = sys.argv[1]
    if len(sys.argv) > 2:
        state = sys.argv[2]

    list_sprints(board_id, state)

    print(f"\n{BLUE}Migration Note:{RESET}")
    print("  ✓ Successfully migrated from REST API to ACLI")
    print("  ✓ Using: acli jira board list-sprints")
    print("  ✓ Related: CHRONOS-268 (Sprint 9)\n")


if __name__ == "__main__":
    main()
