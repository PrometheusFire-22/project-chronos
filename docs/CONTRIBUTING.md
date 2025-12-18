# Contributing to Project Chronos

Thank you for your interest in contributing to Project Chronos! This document outlines the guidelines and best practices for setting up your development environment, making changes, and submitting your contributions.

## Table of Contents

1.  [Development Environment Setup](#development-environment-setup)
2.  [Branching Strategy](#branching-strategy)
3.  [Coding Guidelines](#coding-guidelines)
4.  [Pre-commit Hooks](#pre-commit-hooks)
5.  [Pull Request Guidelines](#pull-request-guidelines)
6.  [Running Tests](#running-tests)

---

## 1. Development Environment Setup

Project Chronos uses a pnpm monorepo managed by Nx. The local development environment can be started with a single command.

For a quick start, please refer to the [README.md](../README.md) in the project root.

### Prerequisites

Ensure you have the following installed:

*   **Docker Desktop:** Required for running the PostgreSQL database.
*   **Node.js (v20+):** Our backend and frontend services run on Node.js.
*   **pnpm (v9.1+):** Our package manager for the monorepo.

### Getting Started

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/PrometheusFire-22/project-chronos.git
    cd project-chronos
    ```

2.  **Install dependencies:**
    ```bash
    pnpm install
    ```

3.  **Prepare environment variables:**
    ```bash
    cp .env.example .env
    # Edit .env to configure database credentials, API keys, etc.
    ```

4.  **Start the unified development environment:**
    ```bash
    pnpm run dev
    ```
    This command orchestrates the startup of the PostgreSQL database, Next.js web application (`apps/web`), and Cloudflare Worker application (`apps/worker`).

    *   **Next.js Web App:** Accessible at `http://localhost:3000`
    *   **Cloudflare Worker:** Accessible at `http://localhost:8787`

5.  **Stopping the environment:**
    Press `Ctrl+C` in the terminal where `pnpm run dev` is running. This will gracefully shut down all services.

### Troubleshooting

Refer to the [Troubleshooting section in README.md](../README.md#troubleshooting) for common issues.

## 2. Branching Strategy

We use a feature-branch workflow.

*   All new development should happen on a dedicated feature branch.
*   Branch names should follow the format: `feat/<JIRA_TICKET_ID>-<short-description>` or `fix/<JIRA_TICKET_ID>-<short-description>`.
*   Regularly rebase your feature branch onto the `develop` branch to keep it up-to-date.

## 3. Coding Guidelines

*   Follow existing code style and conventions.
*   Use TypeScript for all JavaScript-related code.
*   Write clear, concise, and well-documented code.
*   Avoid introducing new global variables or changing existing ones unnecessarily.

## 4. Pre-commit Hooks

We use `pre-commit` hooks to enforce code quality and consistency. These hooks run automatically before each commit.

To ensure your hooks are installed:
```bash
pre-commit install
```
Our hooks include formatting, linting (Python & JS/TS), security auditing (`pnpm audit`), and general file quality checks. If a hook fails, you must address the issues before committing.

## 5. Pull Request Guidelines

1.  **Open a Pull Request:** Once your feature branch is ready, open a PR against the `develop` branch.
2.  **Descriptive Title:** Use a descriptive title, preferably following Conventional Commits (e.g., `feat(auth): Implement user login`).
3.  **Detailed Description:** Provide a clear description of the changes, including:
    *   What problem does it solve?
    *   How was it solved?
    *   Any relevant design decisions or trade-offs.
    *   References to Jira tickets (e.g., `Closes CHRONOS-XXX`).
4.  **Code Review:** Your PR will be reviewed by at least one other developer. Address all feedback promptly.
5.  **CI/CD:** Ensure all CI/CD checks pass before merging.

## 6. Running Tests

To run tests for a specific project:
```bash
pnpm exec nx test <project-name>
```

To run tests for all affected projects:
```bash
pnpm exec nx affected --target=test
```

To run quick unit tests (part of pre-commit hooks):
```bash
pnpm exec nx test --run-in-band
```

---
Happy Hacking!
