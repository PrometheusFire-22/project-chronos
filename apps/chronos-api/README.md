# Chronos API ("The Brain")

FastAPI service for Project Chronos. Handles intelligence tasks:
- Graph Traversal (Apache AGE)
- Vector Search (pgvector)
- PDF Ingestion (Docling)
- Time-series Data (FRED/Valet)

## Usage
Run with Nx:
```bash
npx nx run chronos-api:serve
```

Run manually:
```bash
poetry install
poetry run uvicorn main:app --reload
```
