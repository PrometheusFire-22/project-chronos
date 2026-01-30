# UptimeRobot API Health Endpoint Fix

## Problem

**Monitor:** `https://api.automatonicai.com/health`
**Status:** Down (405 Method Not Allowed)
**Duration:** 3h+ (since Jan 30, 2026, 10:09:04 GMT-5)

### Root Cause Analysis

The FastAPI `/health` endpoint **only accepts GET requests**:

```bash
# ✅ GET works
$ curl https://api.automatonicai.com/health
{"status":"online","service":"chronos-api","environment":"production","database":"16.52.210.100"}

# ❌ HEAD returns 405
$ curl -I -X HEAD https://api.automatonicai.com/health
HTTP/2 405
allow: GET
{"detail":"Method Not Allowed"}

# ❌ POST returns 405
$ curl -X POST https://api.automatonicai.com/health
{"detail":"Method Not Allowed"}
```

**Issue:** UptimeRobot uses **HEAD method** by default for HTTP/HTTPS monitors, but the endpoint only accepts GET.

---

## Solution

### Option A: Configure UptimeRobot to use GET method (Recommended)

1. Log in to UptimeRobot dashboard
2. Find monitor: `https://api.automatonicai.com/health`
3. Click **Edit Monitor**
4. Change **HTTP Method** from `HEAD` to `GET`
5. Save changes
6. Test: Monitor should show "Up" within 5 minutes

**Why this is better:** No code changes needed, works with existing endpoint

---

### Option B: Update FastAPI to accept HEAD requests

If you prefer to keep HEAD method in UptimeRobot:

**File:** `src/chronos/api/main.py` (or wherever the health endpoint is defined)

```python
from fastapi import APIRouter

router = APIRouter()

@router.get("/health", methods=["GET", "HEAD"])  # Add HEAD method
async def health_check():
    return {
        "status": "online",
        "service": "chronos-api",
        "environment": "production",
        "database": "16.52.210.100"
    }
```

Then redeploy the API.

**Why this might be worse:** Requires code change and redeployment

---

## Recommended Action

**Use Option A** - Configure UptimeRobot to use GET method.

This is:
- ✅ Immediate (no deployment needed)
- ✅ Standard practice (GET is more common for health checks)
- ✅ No risk of breaking existing clients

---

## Verification

After applying the fix:

1. Check UptimeRobot dashboard - status should show "Up"
2. Verify incidents are resolved
3. No more email alerts about downtime

---

## Related Tickets

- CHRONOS-security (if tracked in Jira)
- Related to API monitoring and uptime tracking

---

## Additional Notes

- The endpoint has been working correctly the entire time
- The issue was only with UptimeRobot configuration, not the actual API
- GET requests have always worked fine
- This affected monitoring only, not actual users
