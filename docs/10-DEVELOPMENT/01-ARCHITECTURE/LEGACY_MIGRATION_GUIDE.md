# Legacy Logic Migration & Interaction Guide

## The "Brain" vs. "Nervous System"
We have split the architecture into two distinct roles:

1.  **The Brain (Python/FastAPI)**: `apps/chronos-api`
    *   **Role**: Heavy intelligence, data processing, long-running tasks.
    *   **Components**: Apache AGE (Graph), Docling (PDF Parsing), pgvector (Semantic Search).
    *   **Legacy Logic**: The `src/chronos/ingestion` scripts (FRED, StatsCan) live here.

2.  **The Nervous System (Node/Next.js)**: `apps/web`
    *   **Role**: User interaction, authentication, edge caching, fast data serving.
    *   **Status**: This is **NOT** obsolete. It remains the critical frontend and edge layer.

## How to Run Legacy Ingestion
The legacy ingestion scripts (FRED, Valet, Geospatial) have been moved to `apps/chronos-api/src/chronos/ingestion`.

### Old Way (CLI)
```bash
poetry run python -m chronos.cli.timeseries_cli --source fred
```

### New Way (FastAPI Service)
We will expose these scripts as **API Endpoints** so your frontend or scheduler can trigger them.

**Future Endpoint Pattern:**
```python
# apps/chronos-api/src/chronos/api/endpoints/ingestion.py
@router.post("/ingest/fred")
async def trigger_fred_ingestion():
    # Calls the legacy logic function
    result = await run_fred_pipeline() 
    return {"status": "started", "job_id": result.id}
```

## Migration Status
*   **Moved**: Yes, files are physically in `apps/chronos-api`.
*   **Integrated**: Partially. They are importable, but currently still run as CLI scripts.
*   **Next Step**: Refactor them into callable functions that the API router can trigger (Task CHRONOS-467).

## Deployment (AWS Lightsail)
The API container now builds from `apps/api/Dockerfile.production`.

**Update Procedure**:
1.  **Build**: `docker build -t chronos-api -f apps/api/Dockerfile.production .`
2.  **Push**: `aws lightsail push-container-image ...`
3.  **Deploy**: Update the service in Lightsail console to use the new image.
