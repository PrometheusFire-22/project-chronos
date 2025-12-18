# Project Chronos

Multi-modal relationship intelligence platform for private markets.

## Quick Start

Follow these steps to set up and run the local development environment:

### Prerequisites

*   **Docker Desktop:** Ensure Docker Desktop is installed and running for the PostgreSQL database.
*   **Node.js (v20+):** Install Node.js version 20 or higher.
*   **pnpm (v9.1+):** Install pnpm version 9.1 or higher (`npm install -g pnpm`).

### Setup

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
    # Edit .env if necessary to configure database credentials, etc.
    ```

### Running the Development Environment

Use the unified development command to start all services:

```bash
pnpm run dev
```

This command will:
*   Start the PostgreSQL database via Docker Compose.
*   Wait for the database to be healthy.
*   Start the Next.js web application (`apps/web`).
*   Start the Cloudflare Worker application (`apps/worker`).

All services will run in the background. You can access the Next.js app (typically on `http://localhost:3000`) and the Cloudflare Worker (typically on `http://localhost:8787`).

**To stop the development environment:**
Press `Ctrl+C` in the terminal where `pnpm run dev` is running. This will gracefully shut down all services, including the database.

### Troubleshooting

*   **Docker not running:** Ensure Docker Desktop is open and operational.
*   **Port conflicts:** Check if ports `3000` (Next.js) or `8787` (Worker) or `5432` (PostgreSQL) are already in use.
*   **Cleanup issues:** If services don't stop cleanly, you might need to manually run `docker compose down` in the project root.
