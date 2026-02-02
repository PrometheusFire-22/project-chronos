# ADR 019: Postiz Social Media Management Selection and Budget Optimization

## Status
Accepted

## Context
The project requires a robust social media management and automation tool to handle content scheduling, engagement, and cross-platform interactions. Given the "budget-first" constraints of the server infrastructure (AWS Lightsail) and the desire for full data ownership, a self-hosted open-source solution was preferred over SaaS alternatives.

## Decision
We elected to deploy **Postiz** as the core social media management engine.

## Rationale
1.  **Feature Completeness**: Postiz offers a modern UI and deep integration capabilities for X (Twitter), LinkedIn, Reddit, and more.
2.  **Tech Stack Alignment**: Built on Next.js, Postgres, and Redis—technologies already utilized in the Chronos stack.
3.  **Temporal Integration**: Uses Temporal for durable workflow execution, which is critical for reliable long-term scheduling.
4.  **Multi-Account Support**: Allows pooling multiple social profiles under a single self-hosted instance.

## Budget-Driven Modifications (The "Pragmatic" Stack)

To run Postiz on a single 8GB AWS Lightsail instance alongside TwentyCRM and Directus, several structural compromises and modifications were made:

### 1. Stripping ElasticSearch (Resource Conservation)
*   **Original Requirement**: Postiz/Temporal recommend ElasticSearch for "Advanced Visibility" (complex search/filtering of workflows).
*   **Modification**: We opted for **SQL Visibility** only. ElasticSearch is a memory hog (requires ~2GB+ RAM), which would have triggered a server upgrade.
*   **Trade-off**: Slightly slower search performance in the Temporal UI, but saves ~$40/mo in infrastructure costs.

### 2. Temporal Search Attribute Collision Fix
*   **Problem**: Temporal SQL Visibility has a hard limit of **3 custom 'Text' search attributes**. Postiz attempts to register its own, but the default Temporal setup includes `CustomStringField` and `CustomTextField` which occupied the slots.
*   **Modification**: We manually removed the default unused search attributes via the Temporal CLI to "unblock" the Postiz backend. 
*   **Command**: `temporal operator search-attribute remove --name CustomStringField --yes`

### 3. Infrastructure Reciprocity (Sharing Services)
*   **Modification**: Instead of Postiz spinning up its own Postgres and Redis instances, we forced it to use the existing **Project Chronos** database and cache clusters.
*   **Security**: Isolated via database schemas and distinct Redis prefixes where possible.

### 4. Internal Port Hardening
*   **Modification**: The Postiz backend runs on internal port `3000`. We avoided exposing this to the host network to prevent conflicts with potential future Next.js apps, wrapping it instead behind the existing Nginx reverse proxy.

## Consequences
*   **Memory Efficiency**: The entire marketing stack now fits within the 8GB RAM envelope.
*   **Operational Complexity**: Future Temporal updates may re-inject default attributes, requiring another manual "cleanup" if the SQL Visibility limit is not increased in the schema.
*   **Scalability**: If the social media volume grows significantly, we may eventually need to migrate Temporal to an ElasticSearch-backend, but for current "Day 1" operations, this is the optimal cost/performance balance.
