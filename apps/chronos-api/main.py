from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from chronos.api.routers import economic, geo
from chronos.config.settings import settings

app = FastAPI(
    title="Chronos Intelligence API",
    description="Multi-modal intelligence engine (Graph + Vector + Time-Series)",
    version="0.1.0",
)

# CORS Configuration
origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "https://automatonicai.com",
    "https://www.automatonicai.com",
    "https://api.automatonicai.com",
    "https://project-chronos.pages.dev",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers
app.include_router(geo.router)
app.include_router(economic.router)


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
