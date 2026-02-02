# Project Chronos: Infrastructure Cost Analysis Q1 2026

**Last Updated**: 2026-02-02
**Status**: PoC Phase
**Monthly Budget Target**: <$200/mo (PoC), <$500/mo (Launch)

---

## Executive Summary

**Current Monthly Cost**: ~$120-150/month
**After Optimization**: ~$80-100/month (decommission old AWS resources)
**Projected at Launch** (1K users): ~$300-400/month
**Projected at Scale** (10K users): ~$800-1,200/month

---

## Current Infrastructure Costs

### 🟢 Core Infrastructure (Production)

| Service | Provider | Tier/Size | Monthly Cost | Usage | Notes |
|---------|----------|-----------|--------------|-------|-------|
| **Database/API Server** | AWS Lightsail | 8GB RAM, 4 vCPUs | **$44.00** + tax (~$50) | 24/7 | PostgreSQL + TimescaleDB + PostGIS + pgvector |
| **App Runner (Montreal)** | AWS App Runner | Small (1GB, 0.5 vCPU) | **~$15-25** | On-demand | FastAPI backend (ca-central-1) |
| **S3 Storage (Backups)** | AWS S3 | Standard | **~$5-10** | ~100GB | pgbackrest backups, logs |
| **R2 Storage (CMS Files)** | Cloudflare R2 | Standard | **~$2-5** | ~20GB | Directus DAM assets |
| **Cloudflare CDN** | Cloudflare | Free Plan | **$0** | <100K req/day | Static assets, Workers |
| **DNS Hosting** | BlueHost | Legacy | **~$10-15** | Annual | ⚠️ **TO MIGRATE** to Cloudflare (free) |

**Subtotal (Core)**: **~$76-105/month**

---

### 🟡 Document Processing (New - PoC)

| Service | Provider | Tier | Monthly Cost | Usage | Notes |
|---------|----------|------|--------------|-------|-------|
| **GPU Processing** | Modal | Free → Paid | **$0-10** (PoC) | <100 docs/mo | Docling PDF processing (A10G GPU) |
| **Embeddings** | OpenAI | text-embedding-3-small | **~$0.10** | ~100 docs/mo | $0.02/1M tokens |

**Subtotal (ML/AI)**: **~$0-10/month (PoC)**, scaling to **$20-50/mo** at 1K docs/mo

---

### 🔴 Legacy Infrastructure (TO DECOMMISSION)

| Service | Provider | Tier/Size | Monthly Cost | Status | Action |
|---------|----------|-----------|--------------|--------|--------|
| **Old Lightsail (4GB)** | AWS Lightsail | 4GB RAM, 2 vCPUs | **~$18-20** | ❌ Stopped | **DELETE** (Task #9) |
| **Old App Runner (Virginia)** | AWS App Runner | Small (1GB) | **~$15-25** | ❌ Legacy | **DELETE** (Task #10) |

**Potential Savings**: **~$33-45/month**

---

### 🟢 Third-Party SaaS (Free Tiers)

| Service | Provider | Tier | Monthly Cost | Usage | Free Tier Limit |
|---------|----------|------|--------------|-------|-----------------|
| **CI/CD** | NX Cloud | Free | **$0** | <500 runs/mo | Unlimited OSS |
| **Error Tracking** | Sentry | Developer (Free) | **$0** | <5K events/mo | 5K errors/mo |
| **Monitoring** | UptimeRobot | Free | **$0** | 50 monitors | 50 monitors, 5-min checks |
| **Transactional Email** | Resend | Free | **$0** | <100 emails/day | 3K emails/mo |
| **Project Management** | Jira/Confluence | Free | **$0** | <10 users | 10 users max |
| **Version Control** | GitHub | Free | **$0** | Public repos | Unlimited public repos |
| **Auth/Identity** | AWS Cognito | Free | **$0** | <50K MAU | 50K MAU free |

**Subtotal (Free SaaS)**: **$0/month**

---

### 🔵 Productivity Tools

| Service | Provider | Tier | Monthly Cost | Usage | Notes |
|---------|----------|------|--------------|-------|-------|
| **AI Assistant** | Claude | Pro Plan | **$20.00** | Unlimited | Development productivity |
| **LLM API** | OpenAI | Pay-as-you-go | **~$5-15** | GPT-4 usage | Embeddings + occasional GPT-4 |

**Subtotal (Productivity)**: **~$25-35/month**

---

## Total Current Costs

| Category | Current | After Cleanup | At Launch (1K users) | At Scale (10K users) |
|----------|---------|---------------|---------------------|---------------------|
| **Core Infrastructure** | $76-105 | $76-105 | $150-200 | $300-500 |
| **ML/AI Processing** | $0-10 | $0-10 | $20-50 | $100-200 |
| **Legacy (TO DELETE)** | $33-45 | **$0** ✅ | $0 | $0 |
| **Third-Party SaaS** | $0 | $0 | $0-50 | $50-150 |
| **Productivity** | $25-35 | $25-35 | $25-35 | $25-35 |
| **TOTAL** | **$134-195** | **$101-150** | **$195-335** | **$475-885** |

---

## Cost Breakdown by Service Type

### Compute & Hosting

| Service | Type | Current | Optimized | At Scale |
|---------|------|---------|-----------|----------|
| Lightsail 8GB | Always-on | $50 | $50 | $50-100 |
| App Runner | On-demand | $15-25 | $15-25 | $50-150 |
| Modal GPU | Serverless | $0-10 | $0-10 | $100-200 |
| Cloudflare Workers | Edge | $0 | $0 | $0-25 |

**Total Compute**: $65-85 → **$65-85** → $200-475 (at scale)

### Storage & Data

| Service | Type | Current | Optimized | At Scale |
|---------|------|---------|-----------|----------|
| PostgreSQL | Database | $50 | $50 | $100-200 |
| S3 Backups | Object storage | $5-10 | $5-10 | $10-20 |
| R2 Files | Object storage | $2-5 | $2-5 | $5-15 |

**Total Storage**: $57-65 → **$57-65** → $115-235 (at scale)

### APIs & Services

| Service | Type | Current | Optimized | At Scale |
|---------|------|---------|-----------|----------|
| OpenAI API | LLM | $5-15 | $5-15 | $50-100 |
| Modal GPU | GPU | $0-10 | $0-10 | $100-200 |
| DNS | Legacy | $10-15 | **$0** ✅ | $0 |

**Total APIs**: $15-40 → **$5-25** → $150-300 (at scale)

---

## Modal GPU Cost Projections

### Document Processing Costs

| Usage Level | Docs/Month | Docs/Day | GPU Hours/Mo | Modal Cost | OpenAI Embeddings | Total ML Cost |
|-------------|------------|----------|--------------|------------|-------------------|---------------|
| **PoC** | 100 | 3 | ~1 | **FREE** | $0.01 | **$0.01** |
| **Early** | 500 | 17 | ~4 | **$4** | $0.05 | **$4.05** |
| **Growth** | 2,000 | 67 | ~15 | **$18** | $0.20 | **$18.20** |
| **Launch** | 5,000 | 167 | ~40 | **$44** | $0.50 | **$44.50** |
| **Scale** | 10,000 | 333 | ~80 | **$88** | $1.00 | **$89.00** |
| **Enterprise** | 50,000 | 1,667 | ~400 | **$440** | $5.00 | **$445.00** |

**Assumptions**:
- Average PDF: 10 pages
- Processing time: ~30 seconds per doc on GPU A10G
- Modal GPU (A10G): $1.10/hour
- Embedding: ~500 tokens/doc @ $0.02/1M tokens

**Break-even Analysis**:
- Modal becomes more expensive than dedicated GPU (~$150/mo) at **~60K docs/month**
- At that point, consider AWS EC2 g4dn.xlarge ($394/mo reserved) or similar

---

## Cost Optimization Opportunities

### 🎯 Immediate (This Week)

| Action | Monthly Savings | Effort | Priority |
|--------|-----------------|--------|----------|
| ✅ Delete old Lightsail 4GB (Montreal) | **$18-20** | 5 min | **HIGH** |
| ✅ Delete old App Runner (Virginia) | **$15-25** | 5 min | **HIGH** |
| ✅ Migrate DNS from BlueHost → Cloudflare | **$10-15** | 1 hour | **MEDIUM** |
| ⚠️ Review S3 lifecycle policies | **$2-5** | 30 min | LOW |

**Total Immediate Savings**: **$45-65/month**

---

### 🎯 Short-Term (1-2 Months)

| Action | Monthly Savings | Effort | Notes |
|--------|-----------------|--------|-------|
| Implement Modal batch processing | **$10-20** | 1 day | Process 5-10 docs per GPU session |
| Move static assets to R2 | **$5-10** | 2 days | Reduce S3 egress costs |
| Enable Cloudflare Image Optimization | **$5-10** | 1 day | Free tier available |
| Audit OpenAI API usage | **$5-10** | 1 day | Reduce unnecessary calls |

**Total Short-Term Savings**: **$25-50/month**

---

### 🎯 Long-Term (Scaling Strategy)

| Threshold | Action | Cost Impact | Notes |
|-----------|--------|-------------|-------|
| >10K docs/mo | Consider Modal batch optimization | Save 30-50% | Process in larger batches |
| >60K docs/mo | Evaluate dedicated GPU (EC2 g4dn) | Save $200-500/mo | Break-even point |
| >1M API calls/mo | Move to Cloudflare Workers Pro | +$20/mo | Better performance |
| >1TB storage | Consider S3 Glacier for backups | Save $50-100/mo | Move old backups |

---

## Free Tier Limits & Monitoring

### 🚨 Services Approaching Limits

| Service | Current Usage | Free Tier Limit | Remaining | Alert Threshold |
|---------|---------------|-----------------|-----------|-----------------|
| Sentry | ~500 events/mo | 5K events/mo | 90% headroom | ✅ Safe |
| Resend | ~10 emails/day | 100 emails/day | 90% headroom | ✅ Safe |
| UptimeRobot | 15 monitors | 50 monitors | 70% headroom | ✅ Safe |
| Modal GPU | ~1 hour/mo | 10 hours/mo | 90% headroom | ✅ Safe |
| NX Cloud | ~50 runs/mo | 500 runs/mo | 90% headroom | ✅ Safe |

---

## Cost Alerts & Monitoring

### AWS Budgets (Recommended)

```bash
# Set up AWS budget alerts
aws budgets create-budget \
  --account-id 746273373503 \
  --budget file://budget-config.json \
  --notifications-with-subscribers file://notifications.json
```

**Alert Thresholds**:
- 🟡 **Warning**: $150/month (75% of $200 target)
- 🟠 **Alert**: $175/month (87% of $200 target)
- 🔴 **Critical**: $200/month (budget exceeded)

### Cloudflare R2 Alerts

- Alert when storage exceeds 50GB (approaching paid tier)
- Alert when egress exceeds 10GB/day (unusual activity)

### Modal Cost Tracking

- Log GPU seconds per document in PostgreSQL
- Daily cost summary via cron job
- Alert if daily cost exceeds $10 (PoC phase)

---

## Architecture Cost Comparison

### Current: Hybrid (Edge + Cloud + Serverless)

```
Cloudflare Workers (Free) → FastAPI (AWS $15-25/mo) → Modal GPU (Serverless $0-10/mo) → PostgreSQL (AWS $50/mo)
```

**Total**: ~$65-85/month
**Pros**: Scales to zero, cost-efficient for PoC
**Cons**: Multiple vendors, network latency

### Alternative 1: All-AWS

```
CloudFront → ECS Fargate → EC2 g4dn.xlarge (GPU) → RDS PostgreSQL
```

**Total**: ~$500-800/month
**Pros**: Single vendor, integrated monitoring
**Cons**: ❌ Expensive, always-on GPU cost

### Alternative 2: All-Cloudflare

```
Cloudflare Workers → R2 → D1 (Database) → Workers AI (GPU)
```

**Total**: ~$25-50/month
**Pros**: Lowest cost, edge-native
**Cons**: ⚠️ Limited GPU options, D1 not as powerful as PostgreSQL

**Recommendation**: **Stick with Hybrid** for PoC. Evaluate at 10K+ docs/month.

---

## Roadmap: Cost vs. Scale

| Phase | Timeframe | Users | Docs/Mo | Monthly Cost | Key Changes |
|-------|-----------|-------|---------|--------------|-------------|
| **PoC** | Current | <100 | <100 | **$100-150** | Decommission old AWS |
| **Beta** | Q2 2026 | 100-500 | 500-2K | **$150-250** | Batch processing, DNS migration |
| **Launch** | Q3 2026 | 500-2K | 2K-5K | **$250-400** | Scale Modal, optimize caching |
| **Growth** | Q4 2026 | 2K-10K | 5K-20K | **$400-700** | Consider dedicated GPU at 60K docs/mo |
| **Scale** | 2027 | 10K+ | 20K+ | **$700-1,200** | Multi-region, CDN optimization |

---

## Action Items

### This Week (Priority: HIGH)

- [ ] **Task #9**: Delete old Lightsail chronos-prod-medium (save $18-20/mo)
- [ ] **Task #10**: Delete old App Runner chronos-api Virginia (save $15-25/mo)
- [ ] **Task #11**: Complete this cost analysis document ✅
- [ ] **Task #12**: Create Jira epic for infrastructure cost audit

### Next 2 Weeks (Priority: MEDIUM)

- [ ] Set up AWS Budget alerts ($150, $175, $200 thresholds)
- [ ] Implement Modal cost tracking in PostgreSQL
- [ ] Migrate DNS from BlueHost to Cloudflare (save $10-15/mo)
- [ ] Review S3 lifecycle policies and move old backups to Glacier

### Next Month (Priority: LOW)

- [ ] Implement Modal batch processing (save 30-50% GPU costs)
- [ ] Audit OpenAI API usage and optimize prompts
- [ ] Set up cost dashboard in Directus or Grafana
- [ ] Quarterly cost review process

---

## References

- **ADR 020**: [Modal GPU Decision](../10-DEVELOPMENT/01-ARCHITECTURE/adrs/adr_020_modal_gpu_document_processing.md)
- **AWS Pricing**: https://aws.amazon.com/pricing/
- **Modal Pricing**: https://modal.com/pricing
- **Cloudflare Pricing**: https://www.cloudflare.com/plans/
- **OpenAI Pricing**: https://openai.com/api/pricing/

---

## Changelog

| Date | Change | Impact |
|------|--------|--------|
| 2026-02-02 | Initial cost analysis | Identified $45-65/mo savings |
| 2026-02-02 | ADR 020: Modal GPU decision | Enabled scalable document processing |
| _Pending_ | Decommission old AWS resources | -$33-45/mo |
| _Pending_ | DNS migration to Cloudflare | -$10-15/mo |

---

**Next Review**: 2026-03-01 (monthly cadence during PoC phase)
