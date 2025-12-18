# Local Development Deep Dive

This document provides more in-depth details about the Project Chronos local development environment, expanding on the information found in [README.md](../README.md) and [CONTRIBUTING.md](../CONTRIBUTING.md).

## Table of Contents

1.  [Overview of the Local Stack](#1-overview-of-the-local-stack)
2.  [Accessing Individual Services](#2-accessing-individual-services)
3.  [Debugging Tips](#3-debugging-tips)
4.  [Key Nx Commands for Development](#4-key-nx-commands-for-development)
5.  [Environment Variables](#5-environment-variables)

---

## 1. Overview of the Local Stack

The local development environment is designed to mimic the production setup as closely as possible while providing a fast and efficient development experience. It leverages Docker for the database and Nx to manage the monorepo's applications.

The core components are:

*   **PostgreSQL Database (via Docker Compose):** Our primary data store, running in a Docker container with TimescaleDB, PostGIS, pgvector, and Apache AGE extensions.
*   **Next.js Web Application (`apps/web`):** The main frontend application.
*   **Cloudflare Worker (`apps/worker`):** A serverless function acting as an API gateway or performing specific edge computations.
*   **Nx Monorepo:** Manages builds, tests, and dependencies across all projects.

For a visual representation, see the [Local Development Architecture Diagram](./architecture/local-dev-architecture.md).

## 2. Accessing Individual Services

While `pnpm run dev` starts everything, you might sometimes need to interact with services individually.

### Database (PostgreSQL)

The database runs in a Docker container named `chronos-db`.

*   **Accessing the psql client:**
    If you have `psql` installed locally, you can connect using the credentials in your `.env` file:
    ```bash
    psql postgresql://${DATABASE_USER}:${DATABASE_PASSWORD}@localhost:${DATABASE_PORT}/${DATABASE_NAME}
    ```
    Alternatively, you can access the `psql` client directly inside the Docker container:
    ```bash
    docker exec -it chronos-db psql -U ${DATABASE_USER} -d ${DATABASE_NAME}
    ```
    (Replace `${DATABASE_USER}` and `${DATABASE_NAME}` with values from your `.env`).

*   **Checking health:**
    ```bash
    docker compose ps -a
    docker inspect chronos-db | grep Health
    ```

### Next.js Web Application (`apps/web`)

To start *only* the web application:
```bash
pnpm exec nx serve web
```
This typically runs on `http://localhost:3000`.

### Cloudflare Worker (`apps/worker`)

To start *only* the worker application:
```bash
pnpm exec nx serve worker
```
This typically runs on `http://localhost:8787`.

## 3. Debugging Tips

### Next.js Application (`apps/web`)

*   **VS Code Debugger:** Nx integrates well with VS Code's debugger. You can typically run the `web:serve` target directly from Nx Console or configure a `launch.json` entry.
*   **Console Logs:** Use `console.log()` statements. Output will appear in the terminal running `pnpm run dev` or `pnpm exec nx serve web`.
*   **Browser DevTools:** Use your browser's developer tools for frontend debugging.

### Cloudflare Worker (`apps/worker`)

*   **`wrangler dev` logs:** Output from `console.log()` in your worker will appear in the terminal running `pnpm run dev` or `pnpm exec nx serve worker`.
*   **Worker Preview:** `wrangler dev` often provides a URL to view the worker's output directly.
*   **VS Code Debugger:** Configure a `launch.json` entry for `wrangler dev` or use `wrangler inspect`.

## 4. Key Nx Commands for Development

For a comprehensive guide on Nx, refer to the [Nx Monorepo Guide](./guides/development/nx-monorepo-guide.md).

Some frequently used commands:

*   **Run all services:** `pnpm run dev`
*   **Build a specific project:** `pnpm exec nx build <project-name>` (e.g., `pnpm exec nx build web`)
*   **Lint a specific project:** `pnpm exec nx lint <project-name>`
*   **Test a specific project:** `pnpm exec nx test <project-name>`
*   **Run a command on affected projects:** `pnpm exec nx affected --target=build` (runs build only for projects affected by your changes)
*   **View project graph:** `pnpm exec nx graph`

## 5. Environment Variables

Environment variables are managed through `.env` files.

*   `cp .env.example .env` to create your local environment file.
*   Sensitive information (e.g., database passwords) should be configured in your `.env` and **never** committed to version control.
*   Changes to `.env` typically require restarting the relevant services for them to take effect.
