# 🔐 Security Checklist: Before Modal Deployment

**Status**: 🚨 **CRITICAL - DO NOT DEPLOY WITHOUT COMPLETING**
**Date**: 2026-02-02
**Priority**: **BLOCKER**

---

## ⚠️ THE PROBLEM

**Current State**:
- Modal functions will be publicly accessible URLs
- FastAPI webhook endpoints have no authentication
- OpenAI API keys in environment variables
- Modal API keys exposed
- Anyone could trigger expensive GPU processing

**Risk**:
- ❌ Unauthorized API usage → $$$ costs
- ❌ API key theft
- ❌ DoS attacks (spin up GPU instances)
- ❌ Data exfiltration

---

## ✅ REQUIRED BEFORE DEPLOYMENT

### 1. FastAPI Webhook Authentication

**Current** (INSECURE):
```python
@app.post("/webhook/directus")
async def directus_webhook(body: DirectusWebhookPayload):
    # No authentication! ❌
    background_tasks.add_task(process_file_job, file_id)
```

**Required** (SECURE):
```python
from fastapi import HTTPException, Header

DIRECTUS_WEBHOOK_SECRET = os.getenv("DIRECTUS_WEBHOOK_SECRET")

@app.post("/webhook/directus")
async def directus_webhook(
    body: DirectusWebhookPayload,
    x_webhook_secret: str = Header(None)
):
    # Validate webhook secret
    if x_webhook_secret != DIRECTUS_WEBHOOK_SECRET:
        raise HTTPException(status_code=401, detail="Unauthorized")

    background_tasks.add_task(process_file_job, file_id)
```

**Setup**:
```bash
# Generate secure secret
DIRECTUS_WEBHOOK_SECRET=$(openssl rand -hex 32)

# Add to .env
echo "DIRECTUS_WEBHOOK_SECRET=$DIRECTUS_WEBHOOK_SECRET" >> .env

# Configure in Directus webhook settings
# Settings → Webhooks → Create → Add header:
# X-Webhook-Secret: <your_secret>
```

---

### 2. Modal Function Access Control

**Option A: Private Functions (Recommended)**

```python
@app.function(
    gpu="A10G",
    secrets=[modal.Secret.from_name("openai-api-key")],
    # Make function private (not publicly accessible)
)
def process_document(pdf_bytes: bytes, file_id: str) -> dict:
    # Only callable from authenticated FastAPI service
    ...
```

**Option B: API Key Authentication**

```python
@app.function(gpu="A10G")
def process_document(pdf_bytes: bytes, file_id: str, api_key: str) -> dict:
    # Validate API key
    if api_key != os.environ["MODAL_API_KEY"]:
        raise ValueError("Unauthorized")
    ...
```

---

### 3. Secrets Management

**DO NOT**:
- ❌ Hard-code API keys in code
- ❌ Commit `.env` files
- ❌ Store secrets in Modal function code

**DO**:
- ✅ Use Modal Secrets for OpenAI API key
- ✅ Use environment variables for FastAPI
- ✅ Rotate secrets regularly

**Setup Modal Secrets**:
```bash
# Create secret in Modal dashboard
# https://modal.com/secrets

# Or via CLI:
poetry run python -m modal secret create openai-api-key \
  OPENAI_API_KEY=sk-xxxxx
```

**Update Modal function**:
```python
@app.function(
    gpu="A10G",
    secrets=[
        modal.Secret.from_name("openai-api-key"),
        modal.Secret.from_name("database-credentials"),
    ]
)
def process_document(...):
    # Secrets are injected as environment variables
    api_key = os.environ["OPENAI_API_KEY"]
```

---

### 4. Rate Limiting

**FastAPI Rate Limiting**:

```python
from fastapi_limiter import FastAPILimiter
from fastapi_limiter.depends import RateLimiter

@app.post("/webhook/directus", dependencies=[Depends(RateLimiter(times=10, seconds=60))])
async def directus_webhook(...):
    # Max 10 requests per minute
    ...
```

**Modal Cost Limits**:

```python
@app.function(
    gpu="A10G",
    timeout=600,  # Max 10 minutes
    # Add cost limit (future Modal feature)
)
```

---

### 5. Input Validation

**Prevent Malicious Files**:

```python
from fastapi import UploadFile, HTTPException

MAX_FILE_SIZE = 50 * 1024 * 1024  # 50MB
ALLOWED_TYPES = {"application/pdf"}

@app.post("/webhook/directus")
async def directus_webhook(body: DirectusWebhookPayload):
    # Validate file exists and is PDF
    file_info = await directus_client.get_file_info(body.keys[0])

    if file_info["filesize"] > MAX_FILE_SIZE:
        raise HTTPException(400, "File too large")

    if file_info["type"] not in ALLOWED_TYPES:
        raise HTTPException(400, "Invalid file type")

    # Proceed with processing
    ...
```

---

### 6. Monitoring & Alerts

**Set up cost alerts**:

```python
# Track GPU usage per request
@app.function(gpu="A10G")
def process_document(...):
    start = time.time()
    result = ...
    duration = time.time() - start

    # Log for cost tracking
    logger.info(f"GPU time: {duration}s, cost: ${duration/3600 * 1.10:.4f}")

    return result
```

**Alert thresholds**:
- 🟡 Warning: $10/day
- 🟠 Alert: $50/day
- 🔴 Critical: $100/day → Auto-disable

---

### 7. Network Security

**FastAPI CORS**:

```python
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://admin.automatonicai.com"],  # Directus only
    allow_methods=["POST"],
    allow_headers=["X-Webhook-Secret"],
)
```

**IP Whitelisting** (optional):

```python
ALLOWED_IPS = {"1.2.3.4", "5.6.7.8"}  # Directus server IPs

@app.middleware("http")
async def ip_whitelist(request: Request, call_next):
    client_ip = request.client.host
    if client_ip not in ALLOWED_IPS:
        raise HTTPException(403, "Forbidden")
    return await call_next(request)
```

---

## 🎯 Deployment Checklist

Before deploying Modal function to production:

### Infrastructure
- [ ] Webhook secret generated and configured in Directus
- [ ] Modal secrets created (OpenAI API key, DB credentials)
- [ ] FastAPI authentication implemented
- [ ] Rate limiting configured
- [ ] Input validation added
- [ ] CORS properly configured

### Testing
- [ ] Test with valid webhook secret (should succeed)
- [ ] Test with invalid webhook secret (should fail 401)
- [ ] Test with malicious PDF (should reject)
- [ ] Test with oversized file (should reject)
- [ ] Test rate limiting (should throttle after limit)

### Monitoring
- [ ] Cost tracking implemented
- [ ] Alerts configured ($10, $50, $100 thresholds)
- [ ] Logging for all requests (success and failures)
- [ ] Sentry error tracking enabled

### Documentation
- [ ] Document webhook setup for team
- [ ] Document secret rotation procedure
- [ ] Document emergency shutdown procedure

---

## 🚨 Emergency Procedures

### If API Key Compromised:

```bash
# 1. Rotate OpenAI API key immediately
# 2. Update Modal secret
poetry run python -m modal secret update openai-api-key \
  OPENAI_API_KEY=sk-new-key

# 3. Rotate webhook secret
NEW_SECRET=$(openssl rand -hex 32)
echo "DIRECTUS_WEBHOOK_SECRET=$NEW_SECRET" >> .env

# 4. Update Directus webhook configuration
```

### If Unexpected Costs:

```bash
# 1. Check Modal dashboard for usage
https://modal.com/geoff-49738/usage

# 2. Disable FastAPI webhook temporarily
# Comment out @app.post("/webhook/directus") and redeploy

# 3. Investigate logs
poetry run python -m modal app logs chronos-docling

# 4. Re-enable with stricter rate limits
```

### Kill Switch:

```bash
# Delete Modal deployment immediately
poetry run python -m modal app delete chronos-docling

# Disable FastAPI service
docker-compose down ingestion-worker
```

---

## 📋 Security Review Checklist

Run this checklist before every deployment:

```bash
#!/bin/bash
# scripts/security-check.sh

echo "🔐 Security Pre-Deployment Check"

# Check for secrets in code
if grep -r "sk-" apps/ --exclude-dir=node_modules; then
  echo "❌ Found API keys in code!"
  exit 1
fi

# Check .env is gitignored
if git ls-files .env | grep -q .; then
  echo "❌ .env is tracked by git!"
  exit 1
fi

# Check webhook secret is set
if ! grep -q "DIRECTUS_WEBHOOK_SECRET" .env; then
  echo "❌ Webhook secret not configured!"
  exit 1
fi

# Check Modal secrets exist
if ! poetry run python -m modal secret list | grep -q "openai-api-key"; then
  echo "❌ Modal secrets not configured!"
  exit 1
fi

echo "✅ Security checks passed!"
```

---

## 🎓 Security Best Practices

1. **Principle of Least Privilege**: Only grant necessary permissions
2. **Defense in Depth**: Multiple layers of security
3. **Fail Secure**: Default to deny, not allow
4. **Audit Everything**: Log all access attempts
5. **Rotate Regularly**: Change secrets every 90 days

---

## 📚 References

- **OWASP API Security**: https://owasp.org/API-Security/
- **Modal Security**: https://modal.com/docs/guide/secrets
- **FastAPI Security**: https://fastapi.tiangolo.com/tutorial/security/
- **AWS Secrets Manager**: https://aws.amazon.com/secrets-manager/

---

## ✅ Next Steps

1. **Implement authentication** (apps/ingestion-worker/main.py)
2. **Create Modal secrets** (OpenAI API key)
3. **Test security locally** (try unauthorized access)
4. **Document for team** (share with stakeholders)
5. **Deploy with monitoring** (watch costs/logs)

---

**DO NOT SKIP THIS CHECKLIST**

Every item must be ✅ before production deployment.

Your wallet depends on it! 💰🔒
