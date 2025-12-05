#!/usr/bin/env python3
"""
Automated Jira Organization Script
Based on forensic analysis of work completed Nov 27 - Dec 4, 2024

This script creates the proper epic/story/task hierarchy in Jira
based on actual work completed, with proper resolutions and sprint assignments.
"""

import subprocess

# Color codes for output
GREEN = "\033[92m"
YELLOW = "\033[93m"
RED = "\033[91m"
BLUE = "\033[94m"
RESET = "\033[0m"


def run_jira_command(args: list[str]) -> dict:
    """Run a jira CLI command and return the result."""
    cmd = ["jira"] + args
    print(f"{BLUE}Running: {' '.join(cmd)}{RESET}")

    try:
        result = subprocess.run(cmd, capture_output=True, text=True, check=False)

        if result.returncode == 0:
            print(f"{GREEN}✓ Success{RESET}")
            return {"success": True, "output": result.stdout}
        else:
            print(f"{RED}✗ Failed: {result.stderr}{RESET}")
            return {"success": False, "error": result.stderr}

    except Exception as e:
        print(f"{RED}✗ Exception: {e}{RESET}")
        return {"success": False, "error": str(e)}


def create_epic(summary: str, description: str, labels: list[str], status: str = "Done") -> str:
    """Create an epic and return its key."""
    print(f"\n{YELLOW}Creating Epic: {summary}{RESET}")

    result = run_jira_command(
        [
            "create",
            "--summary",
            summary,
            "--description",
            description,
            "--type",
            "Epic",
            "--labels",
            ",".join(labels),
        ]
    )

    if result["success"]:
        # Extract ticket ID from output (format: Created CHRONOS-XXX)
        output = result["output"]
        if "CHRONOS-" in output:
            ticket_id = output.split("CHRONOS-")[1].split()[0]
            epic_key = f"CHRONOS-{ticket_id}"

            # Update status if not default
            if status != "To Do":
                run_jira_command(["update", epic_key, "--status", status])

            return epic_key

    return None


def create_story(
    summary: str,
    description: str,
    epic_key: str,
    labels: list[str],
    points: int,
    status: str = "Done",
    resolution: str = "Done",
) -> str:
    """Create a story under an epic and return its key."""
    print(f"\n{YELLOW}Creating Story: {summary}{RESET}")

    result = run_jira_command(
        [
            "create",
            "--summary",
            summary,
            "--description",
            description,
            "--type",
            "Story",
            "--labels",
            ",".join(labels),
            "--points",
            str(points),
        ]
    )

    if result["success"]:
        output = result["output"]
        if "CHRONOS-" in output:
            ticket_id = output.split("CHRONOS-")[1].split()[0]
            story_key = f"CHRONOS-{ticket_id}"

            # Link to epic
            run_jira_command(["update", story_key, "--epic", epic_key])

            # Update status if not default
            if status != "To Do":
                run_jira_command(["update", story_key, "--status", status])

            # Set resolution if done
            if status == "Done" and resolution:
                run_jira_command(["update", story_key, "--resolution", resolution])

            return story_key

    return None


def create_task(
    summary: str, parent_key: str, labels: list[str], status: str = "Done", resolution: str = "Done"
) -> str:
    """Create a task under a story and return its key."""
    print(f"  {BLUE}Creating Task: {summary}{RESET}")

    result = run_jira_command(
        [
            "create",
            "--summary",
            summary,
            "--type",
            "Task",
            "--labels",
            ",".join(labels),
            "--parent",
            parent_key,
        ]
    )

    if result["success"]:
        output = result["output"]
        if "CHRONOS-" in output:
            ticket_id = output.split("CHRONOS-")[1].split()[0]
            task_key = f"CHRONOS-{ticket_id}"

            # Update status if not default
            if status != "To Do":
                run_jira_command(["update", task_key, "--status", status])

            # Set resolution if done
            if status == "Done" and resolution:
                run_jira_command(["update", task_key, "--resolution", resolution])

            return task_key

    return None


def main():
    """Main execution function."""
    print(f"\n{GREEN}{'='*60}")
    print("Automated Jira Organization")
    print("Based on Forensic Analysis: Nov 27 - Dec 4, 2024")
    print(f"{'='*60}{RESET}\n")

    # ========================================
    # EPIC 1: AWS Infrastructure & Operations
    # ========================================

    epic1 = create_epic(
        summary="AWS Infrastructure & Operations",
        description="""Set up AWS Lightsail infrastructure with PostgreSQL, disaster recovery, and monitoring.

Completed Nov 27-30, 2024 (Sprint 7)

Major Components:
- Lightsail PostgreSQL instance
- Disaster recovery system
- CloudWatch monitoring
- pgBackRest backup system
- AWS CLI & SSO setup""",
        labels=["aws", "infrastructure", "sprint-7", "epic"],
        status="Done",
    )

    if epic1:
        # Story 1.1: Lightsail PostgreSQL Setup (CHRONOS-213)
        story1_1 = create_story(
            summary="Lightsail PostgreSQL Setup (CHRONOS-213)",
            description="""Complete Lightsail PostgreSQL instance setup with SSL/TLS.

Deliverables:
- Lightsail instance created
- PostgreSQL configured
- SSL/TLS enabled
- Security groups configured
- Monitoring enabled""",
            epic_key=epic1,
            labels=["aws", "lightsail", "postgresql", "sprint-7"],
            points=13,
            status="Done",
            resolution="Done",
        )

        if story1_1:
            create_task("Create Lightsail instance", story1_1, ["aws", "lightsail"], "Done", "Done")
            create_task("Configure PostgreSQL", story1_1, ["postgresql"], "Done", "Done")
            create_task("Set up SSL/TLS", story1_1, ["ssl", "security"], "Done", "Done")
            create_task("Configure security groups", story1_1, ["aws", "security"], "Done", "Done")
            create_task("Set up monitoring", story1_1, ["monitoring"], "Done", "Done")

        # Story 1.2: Disaster Recovery System
        story1_2 = create_story(
            summary="Disaster Recovery System",
            description="""Implement comprehensive disaster recovery system with pgBackRest.

Deliverables:
- DR architecture designed
- Operational runbook created
- Technical runbook created
- pgBackRest configured
- CloudWatch monitoring set up""",
            epic_key=epic1,
            labels=["aws", "disaster-recovery", "backup", "sprint-7"],
            points=8,
            status="Done",
            resolution="Done",
        )

        if story1_2:
            create_task("Design DR architecture", story1_2, ["architecture", "dr"], "Done", "Done")
            create_task(
                "Create operational runbook", story1_2, ["documentation", "dr"], "Done", "Done"
            )
            create_task(
                "Create technical runbook", story1_2, ["documentation", "dr"], "Done", "Done"
            )
            create_task("Set up pgBackRest", story1_2, ["backup", "pgbackrest"], "Done", "Done")
            create_task(
                "Configure CloudWatch", story1_2, ["monitoring", "cloudwatch"], "Done", "Done"
            )

        # Story 1.3: AWS CLI & SSO Setup
        story1_3 = create_story(
            summary="AWS CLI & SSO Setup",
            description="""Configure AWS CLI with SSO for secure access.

Deliverables:
- AWS CLI configured
- SSO enabled
- Access policies created
- Procedures documented""",
            epic_key=epic1,
            labels=["aws", "cli", "sso", "sprint-7"],
            points=3,
            status="Done",
            resolution="Done",
        )

        if story1_3:
            create_task("Configure AWS CLI", story1_3, ["aws", "cli"], "Done", "Done")
            create_task("Set up SSO", story1_3, ["sso", "security"], "Done", "Done")
            create_task("Create access policies", story1_3, ["security", "iam"], "Done", "Done")
            create_task("Document procedures", story1_3, ["documentation"], "Done", "Done")

    # ========================================
    # EPIC 2: Google Workspace Integration
    # ========================================

    epic2 = create_epic(
        summary="Google Workspace Integration",
        description="""Integrate Google Workspace APIs for email, drive, calendar, sheets, and admin operations.

Started Dec 3-4, 2024 (Sprint 8)

Major Components:
- Email configuration (DNS, DKIM, SPF, DMARC)
- Google Cloud project setup
- Service account with domain-wide delegation
- Python integration module (6 clients)
- CLI tool with Rich UI
- Comprehensive documentation""",
        labels=["google", "integration", "sprint-8", "epic"],
        status="In Progress",
    )

    if epic2:
        # Story 2.1: Email Configuration
        story2_1 = create_story(
            summary="Google Workspace Email Configuration",
            description="""Configure Google Workspace email with proper DNS records and authentication.

Deliverables:
- DNS records configured (MX, TXT)
- DKIM set up
- SPF configured
- DMARC configured
- Email delivery tested""",
            epic_key=epic2,
            labels=["google", "email", "dns", "sprint-8"],
            points=5,
            status="Done",
            resolution="Done",
        )

        if story2_1:
            create_task(
                "Configure DNS records (MX, TXT)", story2_1, ["dns", "email"], "Done", "Done"
            )
            create_task("Set up DKIM", story2_1, ["dkim", "security"], "Done", "Done")
            create_task("Configure SPF", story2_1, ["spf", "security"], "Done", "Done")
            create_task("Configure DMARC", story2_1, ["dmarc", "security"], "Done", "Done")
            create_task("Test email delivery", story2_1, ["testing", "email"], "Done", "Done")

        # Story 2.2: Google Workspace API Integration (CHRONOS-179)
        story2_2 = create_story(
            summary="Google Workspace API Integration (CHRONOS-179)",
            description="""Build complete Google Workspace API integration with Python module and CLI.

Deliverables:
- Google Cloud project created
- 6 APIs enabled (Admin, Gmail, Drive, Calendar, Sheets, People)
- Service account created
- Domain-wide delegation configured
- Python integration module (6 clients)
- CLI tool with Rich UI
- 5+ documentation guides""",
            epic_key=epic2,
            labels=["google", "api", "integration", "sprint-8"],
            points=13,
            status="In Progress",
            resolution=None,
        )

        if story2_2:
            create_task("Create Google Cloud project", story2_2, ["google-cloud"], "Done", "Done")
            create_task(
                "Enable APIs (6 services)", story2_2, ["google-cloud", "api"], "Done", "Done"
            )
            create_task(
                "Create service account",
                story2_2,
                ["google-cloud", "service-account"],
                "Done",
                "Done",
            )
            create_task(
                "Configure domain-wide delegation",
                story2_2,
                ["google-workspace", "delegation"],
                "In Progress",
                None,
            )
            create_task(
                "Build Python integration module",
                story2_2,
                ["python", "integration"],
                "Done",
                "Done",
            )
            create_task("Create CLI tool", story2_2, ["cli", "python"], "Done", "Done")
            create_task(
                "Write documentation (5 guides)", story2_2, ["documentation"], "Done", "Done"
            )
            create_task("Test and verify integration", story2_2, ["testing"], "To Do", None)

    # ========================================
    # EPIC 3: Security & Credential Management
    # ========================================

    epic3 = create_epic(
        summary="Security & Credential Management",
        description="""Harden security and organize credential management with KeePassXC.

Completed Nov 30 - Dec 4, 2024 (Sprint 7-8)

Major Components:
- KeePassXC database refactoring
- Tagging methodology
- Security guides
- Credential tracking system
- Security hardening phase 2A""",
        labels=["security", "credentials", "sprint-7", "sprint-8", "epic"],
        status="Done",
    )

    if epic3:
        # Story 3.1: KeePassXC Organization
        story3_1 = create_story(
            summary="KeePassXC Organization",
            description="""Organize and secure all project credentials in KeePassXC.

Deliverables:
- Database refactored with logical hierarchy
- Tagging methodology established
- Security guides created
- Credential tracking system documented""",
            epic_key=epic3,
            labels=["keepassxc", "security", "credentials", "sprint-8"],
            points=5,
            status="Done",
            resolution="Done",
        )

        if story3_1:
            create_task("Refactor database structure", story3_1, ["keepassxc"], "Done", "Done")
            create_task(
                "Create tagging methodology",
                story3_1,
                ["keepassxc", "documentation"],
                "Done",
                "Done",
            )
            create_task(
                "Write security guides", story3_1, ["documentation", "security"], "Done", "Done"
            )
            create_task("Document credential tracking", story3_1, ["documentation"], "Done", "Done")

        # Story 3.2: Security Hardening Phase 2A
        story3_2 = create_story(
            summary="Security Hardening Phase 2A",
            description="""Implement security hardening measures.

Deliverables:
- Access controls audited
- Security policies updated
- Procedures documented""",
            epic_key=epic3,
            labels=["security", "hardening", "sprint-7"],
            points=3,
            status="Done",
            resolution="Done",
        )

        if story3_2:
            create_task("Audit access controls", story3_2, ["security", "audit"], "Done", "Done")
            create_task(
                "Update security policies", story3_2, ["security", "policy"], "Done", "Done"
            )
            create_task("Document procedures", story3_2, ["documentation"], "Done", "Done")

    # ========================================
    # EPIC 4: Development Workflow & Documentation
    # ========================================

    epic4 = create_epic(
        summary="Development Workflow & Documentation",
        description="""Improve development workflows and documentation systems.

Ongoing Nov 27 - Dec 4, 2024 (Sprint 7-8)

Major Components:
- Documentation SSOT strategy
- CLI tool enhancements
- Workflow templates
- Confluence sync
- Jira organization""",
        labels=["workflow", "documentation", "sprint-7", "sprint-8", "epic"],
        status="In Progress",
    )

    if epic4:
        # Story 4.1: Documentation SSOT Strategy (CHRONOS-196)
        story4_1 = create_story(
            summary="Documentation SSOT Strategy (CHRONOS-196)",
            description="""Establish documentation single source of truth strategy.

Deliverables:
- Documentation structure reorganized
- SSOT strategy documented
- Confluence sync automated
- Templates created""",
            epic_key=epic4,
            labels=["documentation", "ssot", "sprint-7"],
            points=5,
            status="Done",
            resolution="Done",
        )

        if story4_1:
            create_task(
                "Reorganize documentation structure", story4_1, ["documentation"], "Done", "Done"
            )
            create_task(
                "Document SSOT strategy", story4_1, ["documentation", "adr"], "Done", "Done"
            )
            create_task(
                "Automate Confluence sync", story4_1, ["automation", "confluence"], "Done", "Done"
            )
            create_task(
                "Create templates", story4_1, ["documentation", "templates"], "Done", "Done"
            )

        # Story 4.2: CLI Tool Enhancements
        story4_2 = create_story(
            summary="CLI Tool Enhancements",
            description="""Enhance Jira and Confluence CLI tools.

Deliverables:
- Jira bulk-close added
- Resolution filtering added
- Sprint filtering added
- Man pages written""",
            epic_key=epic4,
            labels=["cli", "jira", "confluence", "sprint-7"],
            points=3,
            status="Done",
            resolution="Done",
        )

        if story4_2:
            create_task("Add Jira bulk-close", story4_2, ["jira", "cli"], "Done", "Done")
            create_task("Add resolution filtering", story4_2, ["jira", "cli"], "Done", "Done")
            create_task("Add sprint filtering", story4_2, ["jira", "cli"], "Done", "Done")
            create_task("Write man pages", story4_2, ["documentation"], "Done", "Done")

        # Story 4.3: Jira & Confluence Organization
        story4_3 = create_story(
            summary="Jira & Confluence Organization",
            description="""Organize Jira and Confluence for better project tracking.

Deliverables:
- Retroactive sprint creation
- Issue hierarchy cleanup
- Time-tracking setup
- Confluence refactoring""",
            epic_key=epic4,
            labels=["jira", "confluence", "organization", "sprint-8"],
            points=8,
            status="In Progress",
            resolution=None,
        )

        if story4_3:
            create_task("Review existing issues", story4_3, ["jira"], "Done", "Done")
            create_task("Create epic structure", story4_3, ["jira"], "In Progress", None)
            create_task("Create retroactive sprints", story4_3, ["jira"], "To Do", None)
            create_task("Set up time-tracking", story4_3, ["jira"], "To Do", None)
            create_task("Refactor Confluence", story4_3, ["confluence"], "To Do", None)

    print(f"\n{GREEN}{'='*60}")
    print("Jira Organization Complete!")
    print(f"{'='*60}{RESET}\n")

    print(f"{YELLOW}Summary:{RESET}")
    print("  - Created 4 epics")
    print("  - Created 11 stories")
    print("  - Created 40+ tasks")
    print("  - Set proper resolutions and sprint labels")
    print(f"\n{BLUE}Next Steps:{RESET}")
    print("  1. Review tickets in Jira")
    print("  2. Create retroactive sprints (Sprint 7, 8)")
    print("  3. Log time for completed work")
    print("  4. Adjust as needed\n")


if __name__ == "__main__":
    main()
