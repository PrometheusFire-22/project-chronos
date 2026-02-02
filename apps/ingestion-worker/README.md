# Ingestion Worker - Modal GPU Architecture

**Version**: 0.1.0
**Status**: Active
**Deployment**: AWS Lightsail (FastAPI) + Modal (GPU)

---

## 🏗️ Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                    DOCUMENT INGESTION PIPELINE                  │
└─────────────────────────────────────────────────────────────────┘

Directus CMS Upload
        ↓
   [Webhook]
        ↓
┌───────────────────────┐
│  FastAPI Service      │  ← Runs on AWS Lightsail
│  (main.py)            │     OR locally for dev
│  - Receives webhook   │
│  - Downloads PDF      │
│  - Calls Modal GPU    │
│  - Chunks & embeds    │
│  - Saves to DB        │
└───────────────────────┘
        ↓ (HTTP)
┌───────────────────────┐
│  Modal GPU Function   │  ← Runs on Modal Cloud (GPU)
│  (docling_processor)  │     A10G or T4 GPU
│  - OCR processing     │
│  - Layout detection   │
│  - Returns JSON       │
└───────────────────────┘
        ↓
┌───────────────────────┐
│  LlamaIndex           │  ← Back to AWS/local
│  - Chunking           │
│  - OpenAI embeddings  │
└───────────────────────┘
        ↓
┌───────────────────────┐
│  PostgreSQL + pgvector│  ← AWS Lightsail
│  - Document storage   │
│  - Vector embeddings  │
└───────────────────────┘
```

---

## 📦 Dependencies

### What Runs Where

| Component | Location | Dependencies | Resource Usage |
|-----------|----------|--------------|----------------|
| **FastAPI Service** | AWS Lightsail | `fastapi`, `uvicorn`, `httpx` | ~100-200MB RAM |
| **Modal GPU** | Modal Cloud | `docling`, `torch`, `torchvision` | ~4-8GB GPU RAM |
| **LlamaIndex** | AWS Lightsail | `llama-index-core`, `openai` | ~50MB RAM |
| **PostgreSQL** | AWS Lightsail | N/A | ~1-2GB RAM |

### Key Principle: **No GPU Dependencies Locally**

This service does NOT include:
- ❌ `docling` (runs on Modal GPU)
- ❌ `torch` (runs on Modal GPU)
- ❌ `torchvision` (runs on Modal GPU)
- ❌ Heavy ML dependencies

Why? Because GPU processing happens **remotely** on Modal's infrastructure.

---

## 🚀 Deployment

### Local Development

```bash
cd apps/ingestion-worker

# Install lightweight dependencies only
poetry install

# Start FastAPI service (no GPU needed!)
poetry run uvicorn main:app --reload --port 8000

# Service calls Modal remotely for GPU processing
```

### AWS Lightsail (Production)

```bash
# On AWS server
cd ~/project-chronos/apps/ingestion-worker

# Install dependencies (still lightweight!)
poetry install

# Run with systemd or Docker
docker-compose up -d ingestion-worker

# Or systemd service
systemctl start ingestion-worker
```

### Modal GPU Function

```bash
# Deploy from local machine (requires root Modal CLI)
cd /home/prometheus/coding/finance/project-chronos

poetry run modal deploy apps/ingestion-worker/modal_functions/docling_processor.py

# Deployed to: https://modal.com/apps/geoff-49738/chronos-docling
```

---

## 🔧 Configuration

### Environment Variables

```bash
# Required
DATABASE_URL=postgresql://chronos:password@16.52.210.100:5432/chronos
OPENAI_API_KEY=sk-xxxxx
DIRECTUS_URL=https://admin.automatonicai.com
DIRECTUS_ACCESS_TOKEN=xxxxx

# Optional (defaults to true in production)
USE_MODAL_GPU=true  # Set to false for local CPU fallback
```

### Modal Configuration

Modal token configured via:
```bash
poetry run python -m modal token set \
  --token-id ak-GHiqN0owl0UkHeUTSB8Jl1 \
  --token-secret as-gCsGmtfEhSZ4QqNkkm9dut
```

Token stored in: `~/.modal.toml`

---

## 📊 Resource Usage & Costs

### Local/AWS FastAPI Service

**RAM**: ~150-300MB
**CPU**: <5% (mostly I/O waiting)
**Network**: Downloads PDFs, uploads to Modal, fetches results

**Monthly Cost**: $0 (included in AWS Lightsail $44/mo)

### Modal GPU Processing

**Per Document**:
- Processing time: 10-30 seconds (A10G GPU)
- Cost: ~$0.01 per document
- GPU RAM: ~4-8GB
- Cold start: <10 seconds

**Monthly Cost**:
- Free tier: 10 GPU-hours/month
- After free tier: $1.10/hour (A10G) or $0.60/hour (T4)
- Example: 100 docs/mo = ~1 hour = **FREE**
- Example: 1,000 docs/mo = ~10 hours = ~$11

### OpenAI Embeddings

**Per Document**:
- ~500 tokens
- Cost: ~$0.0001 per document

**Monthly Cost**: Negligible (~$0.10 per 1,000 docs)

---

## 🧪 Testing

### Test Modal Function

```bash
# Test with sample PDF
poetry run modal run apps/ingestion-worker/modal_functions/docling_processor.py \
  --test-pdf-path "apps/ingestion-worker/test.pdf"
```

### Test Full Pipeline

```bash
# Start service
poetry run uvicorn main:app --reload

# Trigger webhook
curl -X POST http://localhost:8000/webhook/directus \
  -H "Content-Type: application/json" \
  -d '{
    "event": "files.upload",
    "collection": "directus_files",
    "keys": ["test-file-id"]
  }'
```

---

## 🔍 Monitoring

### Logs

```bash
# FastAPI service logs
docker logs -f ingestion-worker

# Modal function logs
poetry run python -m modal app logs chronos-docling
```

### Modal Dashboard

View real-time GPU usage and costs:
https://modal.com/apps/geoff-49738

---

## 🚨 Troubleshooting

### Issue: "Modal function not found"

```bash
# Redeploy Modal function
poetry run modal deploy apps/ingestion-worker/modal_functions/docling_processor.py
```

### Issue: "OpenAI API key invalid"

Check environment variables:
```bash
echo $OPENAI_API_KEY
```

Update in `.env` or Docker environment.

### Issue: "Database connection failed"

Verify PostgreSQL is accessible:
```bash
psql $DATABASE_URL -c "SELECT version();"
```

### Issue: "Memory errors locally"

You're probably trying to run Docling locally. **Don't do that!**

Ensure `USE_MODAL_GPU=true` and Modal function is deployed.

---

## 📚 Related Documentation

- [ADR 020: Modal GPU Decision](../../docs/10-DEVELOPMENT/01-ARCHITECTURE/adrs/adr_020_modal_gpu_document_processing.md)
- [Modal Quick Start](../../docs/10-DEVELOPMENT/05-DOCUMENT-PROCESSING/modal-quickstart.md)
- [Security Checklist](../../docs/20-OPERATIONS/SECURITY-BEFORE-DEPLOYMENT.md)
- [Cost Analysis](../../docs/20-OPERATIONS/cost-analysis-2026-q1.md)

---

## ✅ Deployment Checklist

Before deploying to production:

- [ ] Modal function deployed
- [ ] Modal token configured on AWS server
- [ ] Environment variables set (DATABASE_URL, OPENAI_API_KEY, etc.)
- [ ] PostgreSQL accessible from AWS server
- [ ] Directus webhook configured with secret
- [ ] Security authentication implemented
- [ ] Cost alerts configured ($10, $50, $100 thresholds)
- [ ] Monitoring dashboard set up

---

**Maintained by**: Geoff Bevans
**Last Updated**: 2026-02-02
