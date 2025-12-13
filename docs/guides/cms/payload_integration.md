# Payload CMS Integration Guide (Phase 2)

**Status:** Beta (Integration Complete)
**Stack:** Next.js 16 (Canary), Payload 3.0, PostgreSQL (TimescaleDB), AWS S3.

## 1. Architecture Overview
We have integrated **Payload CMS 3.0** directly into the `apps/web` Next.js application. This "Serverless CMS" approach means:
*   **No separate backend container:** Payload runs as part of your Next.js build.
*   **Database:** Connects to your existing `timescaledb` container (Local) or AWS Lightsail Postgres (Prod).
*   **Assets:** Connects to AWS S3 (`project-chronos-media-dev` / `prod`).

## 2. Local Development
Your existing `docker-compose.yml` remains the orchestrator.
1.  **Start Services:**
    ```bash
    # Starts TimescaleDB (Port 5432)
    devcontainer up
    # OR if outside devcontainer:
    docker-compose up -d timescaledb
    ```
2.  **Run the App:**
    ```bash
    cd apps/web
    pnpm dev
    ```
    *   **Website:** `http://localhost:3000`
    *   **Admin Panel:** `http://localhost:3000/admin`
    *   **API:** `http://localhost:3000/api/...`

## 3. Deployment & Secrets
The application requires specific environment variables to function.
**⚠️ NEVER COMMIT .env FILES.**

### A. Local Secrets (`apps/web/.env.local`)
Managed via `docs/security/SECRETS_REFERENCE.md` (KeepassXC).
*   `POSTGRES_URL`: Points to `localhost:5432` (Host) or `timescaledb:5432` (Docker).
*   `S3_*`: AWS User credentials for uploading images.
*   `PAYLOAD_SECRET`: Session encryption key.

### B. Production (Vercel)
You must add these Environment Variables in Vercel > Settings:
*   `POSTGRES_URL`: `postgres://chronos_admin:[PASSWORD]@16.52.210.100:5432/chronos`
*   `S3_ACCESS_KEY_ID`: `...`
*   `S3_SECRET_ACCESS_KEY`: `...`
*   `S3_BUCKET`: `project-chronos-media-prod`
*   `PAYLOAD_SECRET`: (Generate a new secure string)
*   `NEXT_PUBLIC_SERVER_URL`: `https://automatonicai.com`

## 4. How to Extend (Git Flow)
1.  **New Collection:**
    *   Create `apps/web/collections/NewThing.ts`.
    *   Import it in `apps/web/payload.config.ts`.
2.  **Migrations:**
    *   Payload 3.0 with Postgres pushes schema changes automatically in dev (by default) or via migrations.
    *   Run `pnpm payload migrate` if needed (check `package.json`).

## 5. Troubleshooting
*   **"Table not found":** Ensure Postgres is running and `POSTGRES_URL` is correct.
*   **"S3 Error":** Check bucket policy/CORS and IAM user permissions.
*   **"Type Error":** Run `pnpm build` to regenerate Payload types (`payload-types.ts`).
