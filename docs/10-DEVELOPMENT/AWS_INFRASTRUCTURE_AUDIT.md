# AWS Infrastructure Audit

**Date:** 2025-01-19
**Jira:** CHRONOS-443, CHRONOS-447, CHRONOS-448

---

## Executive Summary

| Finding | Status | Action |
|---------|--------|--------|
| Lightsail instance | ✅ Healthy | None |
| pgbackrest backups | ✅ Working | None |
| AWS S3 `project-chronos-media` | ⚠️ **ORPHANED** | Delete |
| Vercel | ⚠️ **NOT IN USE** | Remove dependency |
| Cloudflare R2 | ✅ Configured | None |

---

## 1. AWS Resources

### 1.1 Lightsail Instance

| Property | Value |
|----------|-------|
| Name | `chronos-prod-medium` |
| State | Running |
| IP | 16.52.210.100 (static) |
| Blueprint | Ubuntu 22.04 |
| Bundle | medium_3_0 |
| Specs | 2 CPU, 4GB RAM, 80GB SSD |
| Zone | ca-central-1a |
| **Cost** | **$24/month** |

**Services Running (Docker Compose):**
- PostgreSQL 16.4 + TimescaleDB + PostGIS + pgvector + AGE
- Directus CMS (port 8055)
- TwentyCRM (port 3020)

### 1.2 S3 Buckets

| Bucket | Size | Status | Purpose |
|--------|------|--------|---------|
| `project-chronos-backups` | 9.0 GiB | ✅ Active | pgbackrest archives |
| `project-chronos-media` | 0 bytes | ⚠️ **EMPTY** | Orphaned (old Directus DAM plan) |

**Recommendation:** Delete `project-chronos-media` bucket.

### 1.3 Other AWS Resources

| Resource Type | Count | Notes |
|---------------|-------|-------|
| RDS | 0 | Not used (custom extensions) |
| EC2 | 0 | All on Lightsail |
| Static IPs | 1 | Attached to Lightsail |
| Container Services | 0 | None |

---

## 2. Backup Status

### 2.1 pgbackrest Configuration

| Property | Value |
|----------|-------|
| Destination | S3 (`project-chronos-backups`) |
| Total Size | 9.0 GiB |
| Total Objects | 34,644 |
| Latest Archive | 2026-01-16 |
| Stanzas | `chronos`, `chronos-v2` |

**Status:** ✅ Healthy - continuous archiving working

### 2.2 Backup Cost Estimate

- S3 Standard: ~$0.023/GB/month
- 9 GiB = ~$0.21/month for storage
- Minimal egress (stays in AWS) = negligible

---

## 3. Vercel Status

### 3.1 DNS Resolution

```
automatonicai.com → 172.64.80.1 (Cloudflare)
```

**Vercel is NOT serving traffic.**

### 3.2 Orphaned Dependency

```json
// apps/web/package.json
"vercel": "^47.0.4"  // ← REMOVE THIS
```

### 3.3 Current Deployment

- **Platform:** Cloudflare Pages
- **Config:** `wrangler.toml`
- **Build:** OpenNext (`apps/web/.open-next`)

**Recommendation:** Remove `vercel` from package.json dependencies.

---

## 4. Cloudflare Configuration

### 4.1 Services in Use

| Service | Status | Notes |
|---------|--------|-------|
| DNS | ✅ Active | Routes all domains |
| Pages | ✅ Active | Hosts Next.js app |
| R2 | ✅ Configured | `chronos-media` bucket |
| Hyperdrive | ✅ Active | DB connection pooling |
| Workers | ✅ Active | Edge functions |

### 4.2 R2 Bucket (wrangler.toml)

```toml
[[r2_buckets]]
binding = "MEDIA"
bucket_name = "chronos-media"
```

This is **Cloudflare R2**, not AWS S3. Directus should use this.

---

## 5. Actions Required

### Immediate

| Action | Ticket | Risk |
|--------|--------|------|
| Delete `project-chronos-media` S3 bucket | CHRONOS-448 | Low (empty) |
| Remove `vercel` from package.json | CHRONOS-447 | Low |

### Verify

| Action | Ticket |
|--------|--------|
| Confirm Directus uses Cloudflare R2 | CHRONOS-446 |
| Document backup restore procedure | CHRONOS-445 |

---

## 6. Monthly Cost Summary

| Service | Cost |
|---------|------|
| Lightsail (medium_3_0) | $24.00 |
| S3 Storage (~9 GiB) | ~$0.21 |
| Static IP | Free (attached) |
| **Total AWS** | **~$24.21/month** |

---

*Generated: 2025-01-19*
