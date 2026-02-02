# Modal GPU Quick Start Guide

**Status**: Ready for Testing
**Last Updated**: 2026-02-02
**Related**: [ADR 020: Modal GPU Decision](../01-ARCHITECTURE/adrs/adr_020_modal_gpu_document_processing.md)

---

## ✅ What's Done

- [x] Modal CLI installed (poetry add modal)
- [x] Modal function created (`apps/ingestion-worker/modal_functions/docling_processor.py`)
- [x] Hybrid IngestionService (`apps/ingestion-worker/services/ingestion_service_modal.py`)
- [x] Cost analysis documented (`docs/20-OPERATIONS/cost-analysis-2026-q1.md`)
- [x] ADR 020 written

---

## 🚀 Next Steps (Complete These Now)

### Step 1: Authenticate with Modal (2 minutes)

```bash
# Sign up and authenticate
poetry run modal token new

# Follow browser prompts to create account
# Use GitHub or email signup

# Verify authentication
poetry run modal profile current
```

Expected output:
```
✓ Modal profile: your-username
✓ Token ID: tok-xxxxx
✓ Region: us-east-1
```

---

### Step 2: Deploy Modal Function (1 minute)

```bash
cd /home/prometheus/coding/finance/project-chronos

# Deploy Docling processor to Modal
poetry run modal deploy apps/ingestion-worker/modal_functions/docling_processor.py
```

Expected output:
```
✓ Created deployment chronos-docling
✓ Deployed function: process_document
✓ Deployed function: process_document_batch
✓ View at: https://modal.com/apps/your-app
```

---

### Step 3: Test with Sample PDF (2 minutes)

```bash
# Test the Modal function remotely
poetry run modal run apps/ingestion-worker/modal_functions/docling_processor.py

# This will process apps/ingestion-worker/test.pdf
```

Expected output:
```
Testing Modal Docling processor with test.pdf...
PDF size: 217.5 KB

✅ Success!
   Processing time: 12.34s
   Page count: 3
   Markdown length: 5421 chars
   GPU cost: ~$0.0038
```

---

### Step 4: Update IngestionService (5 minutes)

Replace the current IngestionService with the Modal-enabled version:

```bash
cd apps/ingestion-worker/services

# Backup original
cp ingestion_service.py ingestion_service_cpu_only.py

# Replace with Modal version
cp ingestion_service_modal.py ingestion_service.py
```

Set environment variable:

```bash
# In .env or docker-compose.yml
USE_MODAL_GPU=true

# Add Modal token (get from ~/.modal/token.json)
MODAL_TOKEN_ID=tok-xxxxx
MODAL_TOKEN_SECRET=sec-xxxxx
```

---

### Step 5: Test Full Pipeline (5 minutes)

```bash
# Start ingestion worker
cd apps/ingestion-worker
poetry run uvicorn main:app --reload --port 8000

# In another terminal, test webhook
curl -X POST http://localhost:8000/webhook/directus \
  -H "Content-Type: application/json" \
  -d '{
    "event": "files.upload",
    "collection": "directus_files",
    "keys": ["test-file-id"]
  }'
```

Check logs for:
```
✅ Modal GPU connected: chronos-docling.process_document
Sending test.pdf to Modal GPU...
✅ Modal GPU processed test.pdf in 12.34s (3 pages, cost: ~$0.0038)
📄 Saved raw document: abc-123-uuid
🔪 Split into 15 chunks
🧠 Generating embeddings for 15 chunks...
✅ Saved 15 chunks for document abc-123-uuid
```

---

## 🎯 Success Criteria

After completing these steps, you should have:

- ✅ Modal account created and authenticated
- ✅ Modal function deployed to cloud
- ✅ Test PDF processed successfully on GPU
- ✅ Full pipeline working (Directus → Modal → PostgreSQL)
- ✅ Cost tracking logged

**Processing Performance**:
- ❌ Old (CPU): 2-5 minutes per document
- ✅ New (GPU): 10-30 seconds per document
- 🎉 **10-20x faster**

**Cost per Document**:
- Modal GPU (30s): ~$0.01
- OpenAI Embeddings: ~$0.0001
- **Total: ~$0.01 per document**

---

## 🔧 Environment Variables

Add to `.env` or `docker-compose.yml`:

```bash
# Modal Configuration
USE_MODAL_GPU=true
MODAL_TOKEN_ID=tok-xxxxx
MODAL_TOKEN_SECRET=sec-xxxxx

# OpenAI (for embeddings)
OPENAI_API_KEY=sk-xxxxx

# Database
DATABASE_URL=postgresql://user:pass@host:5432/dbname
```

---

## 📊 Monitoring & Cost Tracking

### Check Modal Dashboard

Visit: https://modal.com/apps

Monitor:
- Function calls
- GPU utilization
- Processing time
- Costs (real-time)

### Query PostgreSQL for Cost Data

```sql
-- Total documents processed today
SELECT COUNT(*)
FROM documents.document_raw
WHERE created_at >= CURRENT_DATE;

-- Average processing time (add to document_raw table)
SELECT AVG(processing_time_seconds)
FROM documents.document_raw
WHERE created_at >= CURRENT_DATE;

-- Estimated daily cost
SELECT
  COUNT(*) * 0.01 as estimated_daily_cost_usd
FROM documents.document_raw
WHERE created_at >= CURRENT_DATE;
```

---

## 🚨 Troubleshooting

### Issue: Modal authentication fails

```bash
# Re-authenticate
poetry run modal token new

# Check token
cat ~/.modal/token.json
```

### Issue: Function not found

```bash
# List deployed functions
poetry run modal app list

# Redeploy
poetry run modal deploy apps/ingestion-worker/modal_functions/docling_processor.py
```

### Issue: GPU processing fails

Check logs:
```bash
poetry run modal app logs chronos-docling
```

Fallback to CPU:
```bash
# Set in .env
USE_MODAL_GPU=false
```

### Issue: OOM errors persist locally

You're processing on Modal now, so local OOM should be eliminated. If you're still seeing OOM:
1. Verify `USE_MODAL_GPU=true`
2. Check Modal function is being called (check logs)
3. Ensure Modal token is valid

---

## 📈 Next Optimizations

Once basic Modal is working, implement these:

### 1. Batch Processing (30-50% cost savings)

```python
# Process multiple PDFs in one GPU session
from modal_functions.docling_processor import process_document_batch

documents = [
    {"pdf_bytes": pdf1, "file_id": "id1"},
    {"pdf_bytes": pdf2, "file_id": "id2"},
    # ... up to 10 documents
]

results = process_document_batch.remote(documents)
```

### 2. GPU Type Selection

```python
# Use cheaper T4 GPU for smaller documents
@app.function(gpu="T4")  # ~$0.60/hour vs $1.10/hour
```

### 3. Caching (for re-processing)

Add Redis cache for processed documents to avoid re-processing.

---

## 🎓 Learning Resources

- **Modal Docs**: https://modal.com/docs
- **Docling Docs**: https://github.com/DS4SD/docling
- **LlamaIndex Docs**: https://docs.llamaindex.ai/

---

## ✅ Checklist

Use this checklist to track your setup:

- [ ] Step 1: Modal authentication complete
- [ ] Step 2: Modal function deployed
- [ ] Step 3: Test PDF processed successfully
- [ ] Step 4: IngestionService updated
- [ ] Step 5: Full pipeline tested
- [ ] Environment variables configured
- [ ] Monitoring dashboard checked
- [ ] Cost tracking verified
- [ ] Git commit created ([CHRONOS-XXX])

---

**Next**: Once this is working, create Jira tickets for:
- Batch processing implementation
- Cost dashboard in Directus
- Performance benchmarking
- Production deployment
