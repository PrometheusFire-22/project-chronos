# ADR 001: Hybrid Architecture for Geospatial Features

**Date:** 2026-01-16
**Status:** Accepted

## Context

We are building a financial dashboard that requires complex choropleth maps (US Counties, Canadian Provinces) visualizing unemployment and other macroeconomic data.

Our current stack consists of:
- **Frontend**: Next.js deployed on Cloudflare Pages.
- **Database**: PostgreSQL with TimescaleDB, PostGIS, Apache AGE, and pgvector hosted on AWS Lightsail.
- **CMS**: Directus (on AWS).

We attempted to implement geospatial features directly in the Cloudflare environment using `Hyperdrive` and `pg`. However, we encountered significant blockers:
1.  **Runtime Instability**: Cloudflare Workers run on V8 (Javascript), while `pg-native` and advanced PostGIS drivers often rely on Node.js-specific APIs or C++ bindings that are not fully supported or stable in the Workers environment.
2.  **Polyfill Hell**: Trying to shim Node.js modules into Cloudflare Workers led to a brittle build process and runtime errors.
3.  **Connection Management**: While Hyperdrive handles connection pooling, it doesn't solve the driver compatibility issues for complex PostGIS/AGE queries.

## Decision

We will adopt a **Hybrid Architecture**:

1.  **Frontend (Remains on Cloudflare)**: 
    -   We keep Next.js on Cloudflare Pages for its speed, low cost, global CDN, and SEO benefits.
    -   It will serve static assets and handle UI rendering.

2.  **Backend API (Node.js on AWS Lightsail)**:
    -   We will create a new service (`apps/api`) running standard Node.js (Hono or Fastify) on the *same* AWS Lightsail server that hosts the Postgres database.
    -   This service will handle the "heavy lifting": connecting to PostGIS, executing complex SQL queries, and processing geospatial data.
    -   It allows us to use standard, battle-tested npm packages (`pg`, `apache-age-driver`) without polyfills.

3.  **Communication**:
    -   The Frontend will fetch data from this API (`https://api.automatonicai.com` or similar) via standard REST/JSON endpoints.

## Consequences

### Positive
-   **Stability**: Eliminates the fight against Cloudflare's runtime limitations for DB drivers.
-   **Performance**: The API sits right next to the DB (localhost latency), making heavy geospatial queries faster.
-   **Simplicity**: We can use standard Node.js tooling and libraries.
-   **Cost**: Leverages existing fixed-cost AWS Lightsail instance (no additional infrastructure cost).

### Negative
-   **Operational Complexity**: We now have to manage a Node.js process (using PM2) on the Lightsail server, in addition to the database.
-   **Deployment**: We need a deployment pipeline (GitHub Actions -> SSH -> PM2 reload) for the API, separating it from the Cloudflare Pages automated deploy.

## Implementation Plan
1.  Scaffold `apps/api` in the monorepo.
2.  Set up `pm2` on the Lightsail server.
3.  Migrate geospatial queries from Next.js to the new API.
4.  Expose endpoints for the frontend to consume.
