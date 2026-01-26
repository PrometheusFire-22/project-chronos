# ADR 004: "Brain & Nervous System" Architecture

## Status
Accepted

## Context
Project Chronos is a multi-modal intelligence platform requiring both high-performance web interactions and heavy data processing (Graph, Vector, AI).
- **Web App**: Built with Next.js/Hono on Cloudflare (Edge). needs to be user-responsive.
- **Intelligence**: Heavy Python logic (Docling, LlamaIndex, Apache AGE, PostGIS) cannot run on the Edge.

We initially considered a Python CLI for the intelligence layer, but this limits us to manual execution and doesn't support a SaaS workflow where the web app triggers intelligence tasks.

## Decision
We will adopt a **"Brain & Nervous System"** architecture managed within an **Nx Monorepo**.

### 1. The Nervous System (Edge / UI)
- **Stack**: Next.js + Hono (Cloudflare Workers).
- **Responsibility**: Auth, Rate Limiting, User Session, CRUD, Fast UI rendering.
- **Location**: `apps/web`, `apps/worker`.

### 2. The Brain (Core Intelligence)
- **Stack**: Python + FastAPI (Dockerized on AWS Lightsail/App Runner).
- **Responsibility**: 
    - PDF Parsing (Docling)
    - Vector Search (pgvector/LlamaIndex)
    - Graph Traversal (Apache AGE)
    - Time-Series Ingestion (FRED/Valet)
- **Location**: `apps/chronos-api`.

### 3. Monorepo Integration
- **Management**: Nx (using `nx:run-commands` for Python).
- **Isolation**: "One Poetry Environment per App". `apps/chronos-api` has its own `pyproject.toml` to avoid polluting the root or other apps with heavy ML dependencies.

## Consequences
- **Pros**:
    - Separation of concerns: UI doesn't block on heavy AI tasks.
    - Scalability: "Brain" can scale independently on GPU instances if needed, while "Nervous System" stays cheap on Edge.
    - Unified Dev Experience: Nx controls both.
- **Cons**:
    - "Double Typing": Need to sync Pydantic (Python) models with Zod (TS) schemas (Mitigated by code generation tools).
    - Deployment Complexity: Managed via distinct Docker containers.

## Migration Path
1. Move `src/chronos` -> `apps/chronos-api`.
2. Initialize FastAPI.
3. Configure `nx` targets (`lint`, `test`, `build`).
