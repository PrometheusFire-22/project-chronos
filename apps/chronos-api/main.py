from fastapi import FastAPI

from chronos.config.settings import settings

app = FastAPI(
    title="Chronos Intelligence API",
    description="Multi-modal intelligence engine (Graph + Vector + Time-Series)",
    version="0.1.0",
)


@app.get("/health")
async def health_check():
    return {
        "status": "online",
        "service": "chronos-api",
        "environment": settings.environment,
        "database": settings.database_host,
    }


@app.get("/")
async def root():
    return {"message": "Chronos Intelligence API v1"}
