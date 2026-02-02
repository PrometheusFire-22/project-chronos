# ADR 020: Modal for GPU-Accelerated Document Processing

## Status
**Accepted** - 2026-02-02

## Context

Project Chronos requires PDF document processing using Docling (IBM's document AI library) for OCR, layout detection, and content extraction. The ingestion worker (`apps/ingestion-worker/`) was initially built to run locally using CPU-based PyTorch inference.

### The Problem

**Local CPU Processing Constraints**:
- **Memory Intensive**: Docling loads PyTorch models requiring 2-4GB RAM per document
- **Development Machine**: ASUS Ubuntu laptop with 9.7GB RAM (7.2GB used), 4GB swap (1.8GB used)
- **No GPU Available**: CPU inference is 10-100x slower than GPU
- **OOM Errors**: Out-of-memory crashes during document processing
- **Blocking Operations**: Document processing blocks other tasks

**Processing Performance**:
- **CPU (local)**: 2-5 minutes per 10-page PDF
- **GPU (A10G)**: 10-30 seconds per document
- **Cost of Dedicated GPU**: AWS p3.2xlarge ~$3.06/hour = $2,200/month (always-on)

### Alternatives Considered

| Approach | Cost (PoC) | Cost (Production) | Setup Time | Pros | Cons |
|----------|-----------|-------------------|------------|------|------|
| **CPU Only (Local)** | $0 | $0 | ✅ Done | No dependencies | ❌ OOM errors, 10-100x slower |
| **Add 12GB Swap** | $0 | $0 | 5 min | Quick fix | ⚠️ Still slow, heavy disk I/O |
| **AWS Lightsail GPU** | ~$50/mo | ~$150-300/mo | 1 week | Full control | ❌ Always-on cost, manual scaling |
| **AWS EC2 GPU (p3.2xlarge)** | ~$2,200/mo | ~$2,200-5,000/mo | 1 week | Most powerful | ❌ Extremely expensive |
| **Modal GPU** | **$0-10/mo** | **$50-200/mo** | **1-2 days** | ✅ **Scales to zero**, fast setup | Vendor dependency |

## Decision

**We will use Modal for GPU-accelerated document processing.**

### Why Modal?

1. **Cost Efficiency (Scales to Zero)**
   - Free tier: 10 GPU-hours/month + 100 CPU-hours/month
   - PoC usage (~100 docs/month): **FREE**
   - Medium usage (500 docs/month): **~$5/month**
   - Heavy usage (2,000 docs/month): **~$18/month**
   - vs AWS p3.2xlarge: **$2,200/month always-on**

2. **Performance**
   - GPU A10G: ~10-30 seconds per document (10-20x faster than CPU)
   - GPU T4: ~20-60 seconds per document (cheaper option)
   - Cold start: <10 seconds (with container snapshots)

3. **Developer Experience**
   - Python-native API (no Kubernetes, no Docker registries)
   - Simple deployment: `modal deploy`
   - Built-in autoscaling, monitoring, logs
   - Local testing: `modal run`

4. **Hybrid Architecture**
   - Docling processing: Remote GPU (Modal)
   - LlamaIndex chunking: Local (cheap, fast)
   - OpenAI embeddings: API call (cheap)
   - PostgreSQL writes: Local/AWS

5. **No Vendor Lock-In** (Easy Exit Strategy)
   - Keep CPU fallback in code
   - Can migrate to AWS Lambda GPU (when available)
   - Can switch to dedicated GPU if usage warrants it
   - Docling code remains unchanged

## Architecture

### Current (Problematic)
```
Directus Upload → FastAPI Webhook → Docling (Local CPU) → LlamaIndex → PostgreSQL
                                    ↑
                                    OOM Errors, 2-5 min/doc
```

### New (Modal GPU)
```
Directus Upload → FastAPI Webhook → Modal Function (GPU) → LlamaIndex (Local) → PostgreSQL
                                    ↑
                                    10-30 sec/doc, scales to zero
```

### Modal Function
```python
# apps/ingestion-worker/modal_functions/docling_processor.py
import modal

image = modal.Image.debian_slim(python_version="3.11").pip_install(
    "docling>=1.0.0",
    "torch",
    "torchvision",
)

stub = modal.Stub("chronos-docling")

@stub.function(
    image=image,
    gpu="A10G",  # Or "T4" for cheaper
    timeout=600,
    memory=8192,
)
def process_document(pdf_bytes: bytes, file_id: str) -> dict:
    from docling.document_converter import DocumentConverter
    # ... processing logic
    return {"doc_json": {...}, "markdown": "...", "processing_time": 12.5}
```

### Integration (Hybrid)
```python
# apps/ingestion-worker/services/ingestion_service.py
class IngestionService:
    def __init__(self):
        self.use_modal = os.getenv("USE_MODAL_GPU", "true").lower() == "true"

        if self.use_modal:
            self.modal_fn = modal.Function.lookup("chronos-docling", "process_document")
        else:
            # Fallback to local CPU
            self.converter = DocumentConverter()
```

## Consequences

### Positive

✅ **Eliminates OOM Errors**: Document processing runs in isolated GPU container with 8-16GB RAM
✅ **10-20x Faster**: 10-30 seconds vs 2-5 minutes per document
✅ **Cost-Effective for PoC**: Free tier covers PoC usage (<100 docs/month)
✅ **Scales Automatically**: No manual instance management
✅ **Scales to Zero**: No idle GPU costs
✅ **Quick Setup**: 1-2 days vs 1 week for AWS GPU setup
✅ **Easy Rollback**: CPU fallback remains in code

### Negative

⚠️ **Vendor Dependency**: Reliance on Modal's platform
⚠️ **Network Latency**: PDF must be uploaded to Modal (10-50ms overhead)
⚠️ **Cold Starts**: First request after idle takes ~10 seconds (mitigated by container snapshots)
⚠️ **Cost at Scale**: At 10K+ docs/month, dedicated GPU might be cheaper (but we'll monitor)

### Neutral

➡️ **Requires Internet**: Modal functions run in cloud (not an issue for our use case)
➡️ **API Rate Limits**: Modal has rate limits, but we're nowhere near them

## Cost Breakdown

| Usage Level | Docs/Month | GPU Hours | Modal Cost | AWS EC2 GPU Cost | Savings |
|-------------|------------|-----------|------------|------------------|---------|
| **PoC** | 100 | ~1 hour | **FREE** | $2,200 | $2,200 |
| **Early** | 500 | ~4 hours | **$4-5** | $2,200 | $2,195 |
| **Growth** | 2,000 | ~15 hours | **$18** | $2,200 | $2,182 |
| **Scale** | 10,000 | ~80 hours | **$88** | $2,200 | $2,112 |
| **Break-even** | ~60,000 | ~500 hours | **$550** | $2,200 | $1,650 |

**Note**: Break-even with always-on GPU is at ~60K docs/month (2,000/day). We're nowhere near that.

### Additional Costs (Minimal)
- **OpenAI Embeddings** (text-embedding-3-small): $0.02/1M tokens = ~$0.0001/doc
- **PostgreSQL/TimescaleDB**: Existing (AWS Lightsail)
- **Cloudflare Workers**: Existing (~$5/mo)

## Migration Path

### Phase 1: Setup (Day 1)
1. ✅ Sign up for Modal account
2. ✅ Install Modal CLI: `pip install modal`
3. ✅ Authenticate: `modal token new`
4. ✅ Create Modal function for Docling
5. ✅ Test with sample PDF

### Phase 2: Integration (Day 2)
6. ✅ Update `IngestionService` to use Modal
7. ✅ Add CPU fallback for local testing
8. ✅ Add cost tracking (log GPU seconds)
9. ✅ Deploy and test full pipeline

### Phase 3: Optimization (Week 2)
10. ✅ Implement batch processing (5-10 docs per GPU session)
11. ✅ Monitor performance and costs
12. ✅ Benchmark GPU types (A10G vs T4)
13. ✅ Document runbooks and troubleshooting

## Monitoring & Alerting

- **Cost Alerts**: Alert if Modal costs exceed $50/month (PoC phase)
- **Performance Metrics**: Track processing time per document
- **Error Rates**: Monitor Modal function failures
- **GPU Utilization**: Optimize batch sizes for cost efficiency

## Rollback Plan

If Modal proves problematic:

1. **Immediate**: Set `USE_MODAL_GPU=false` → falls back to local CPU
2. **Short-term**: Add 12GB swap to local machine
3. **Medium-term**: Migrate to AWS Lambda GPU (when available in ca-central-1)
4. **Long-term**: Deploy dedicated GPU if usage consistently >60K docs/month

## References

- **Modal Documentation**: https://modal.com/docs
- **Modal Pricing**: https://modal.com/pricing
- **Docling GitHub**: https://github.com/DS4SD/docling
- **Related ADR**: [ADR 004: Brain & Nervous System Architecture](./ADR-004-fastapi-brain-architecture.md)

## Decision Makers

- Geoff Bevans (Lead Developer)
- Claude Sonnet 4.5 (AI Assistant)

## Date

2026-02-02
