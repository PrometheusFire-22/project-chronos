# Directus CMS Implementation - Planning Summary

**Date:** 2025-12-21
**Status:** Planning Complete, Ready for Implementation
**Owner:** Geoff Bevans

---

## What Was Completed

### 1. Architecture Decision Record (ADR-018)
**Location:** `docs/10-DEVELOPMENT/01-ARCHITECTURE/adrs/adr_018_directus_cms_selection.md`

**Key Decision:** Selected **Directus CMS** over Payload CMS

**Rationale:**
- **Database-first philosophy** aligns with "database is the product" approach
- **Preserves Drizzle ORM** as single source of truth for schema
- **Respects PostgreSQL extensions** (TimescaleDB, PostGIS, pgvector, Apache AGE)
- **Maintains type-safe architecture** (Drizzle → Zod → tRPC → Next.js)
- **Clean separation** (Next.js on Edge, Directus on VM)

**Trade-off:** Accepted HTTP overhead for CMS content (10-50ms) vs. Payload's zero-overhead Local API for architectural purity.

---

### 2. Comprehensive Implementation Plan
**Location:** `docs/10-DEVELOPMENT/01-ARCHITECTURE/DIRECTUS_CMS_IMPLEMENTATION_PLAN.md`

**Structure:** 4 phases over 3-4 sprints

#### Phase 1: Infrastructure Setup (Sprint 1, Week 1)
- Install Directus on Lightsail VM
- Configure Nginx reverse proxy (SSL/TLS)
- Set up PostgreSQL connection
- Configure user roles (Admin, Editor, Public)

#### Phase 2: Drizzle Schema Setup (Sprint 1, Week 2)
- Initialize Drizzle ORM in monorepo
- Define content schema (blog_posts, docs_pages, features, homepage_hero)
- Generate and apply migrations
- Configure Directus collections

#### Phase 3: Next.js Integration (Sprint 2)
- Install Directus SDK
- Build blog listing and detail pages
- Build homepage with dynamic content
- Implement documentation site

#### Phase 4: Content Migration and Optimization (Sprint 3)
- Migrate existing content
- Set up S3 storage for media
- Implement Redis caching
- Configure webhooks for ISR revalidation

**Estimated Total:** 42 story points, ~$5/month incremental cost

---

### 3. Jira Epic and Stories Created

#### Epic
**CHRONOS-349:** Directus CMS Integration
- URL: https://automatonicai.atlassian.net/browse/CHRONOS-349
- Labels: cms, directus, infrastructure, frontend

#### Phase 1 Stories (Infrastructure Setup)
| Ticket | Title | Story Points | Labels |
|--------|-------|--------------|--------|
| [CHRONOS-350](https://automatonicai.atlassian.net/browse/CHRONOS-350) | Install Directus on Lightsail VM | 3 | directus, infrastructure, docker |
| [CHRONOS-351](https://automatonicai.atlassian.net/browse/CHRONOS-351) | Configure Nginx Reverse Proxy for Directus | 2 | directus, infrastructure, nginx, ssl |
| [CHRONOS-352](https://automatonicai.atlassian.net/browse/CHRONOS-352) | Configure Directus PostgreSQL Connection | 2 | directus, database, postgresql |
| [CHRONOS-353](https://automatonicai.atlassian.net/browse/CHRONOS-353) | Set Up Directus User Roles and Permissions | 2 | directus, security, permissions |

**Phase 1 Total:** 9 story points

#### Phase 2 Stories (Drizzle Schema Setup)
| Ticket | Title | Story Points | Labels |
|--------|-------|--------------|--------|
| [CHRONOS-354](https://automatonicai.atlassian.net/browse/CHRONOS-354) | Initialize Drizzle ORM in Monorepo | 3 | drizzle, orm, database |
| [CHRONOS-355](https://automatonicai.atlassian.net/browse/CHRONOS-355) | Define Content Schema in Drizzle | 5 | drizzle, schema, database |
| [CHRONOS-356](https://automatonicai.atlassian.net/browse/CHRONOS-356) | Generate and Apply Drizzle Migrations | 2 | drizzle, migrations, database |
| [CHRONOS-357](https://automatonicai.atlassian.net/browse/CHRONOS-357) | Configure Directus Collections for Content Tables | 3 | directus, cms, configuration |

**Phase 2 Total:** 13 story points

#### Phase 3 Stories (Next.js Integration)
| Ticket | Title | Story Points | Labels |
|--------|-------|--------------|--------|
| [CHRONOS-358](https://automatonicai.atlassian.net/browse/CHRONOS-358) | Install Directus SDK in Next.js App | 1 | nextjs, directus, sdk |
| [CHRONOS-359](https://automatonicai.atlassian.net/browse/CHRONOS-359) | Build Blog Listing and Detail Pages | 5 | nextjs, blog, frontend |
| [CHRONOS-360](https://automatonicai.atlassian.net/browse/CHRONOS-360) | Build Homepage with Dynamic Content | 3 | nextjs, homepage, frontend |
| [CHRONOS-361](https://automatonicai.atlassian.net/browse/CHRONOS-361) | Implement Documentation Site | 5 | nextjs, documentation, frontend |

**Phase 3 Total:** 14 story points

#### Phase 4 Stories (Content Migration and Optimization)
| Ticket | Title | Story Points | Labels |
|--------|-------|--------------|--------|
| [CHRONOS-362](https://automatonicai.atlassian.net/browse/CHRONOS-362) | Migrate Existing Content to Directus | 3 | directus, migration, content |
| [CHRONOS-363](https://automatonicai.atlassian.net/browse/CHRONOS-363) | Set Up R2 Storage for Media Uploads | 2 | directus, r2, cloudflare, storage |
| [CHRONOS-364](https://automatonicai.atlassian.net/browse/CHRONOS-364) | Implement Redis Caching for Directus | 2 | directus, redis, caching |
| [CHRONOS-365](https://automatonicai.atlassian.net/browse/CHRONOS-365) | Set Up Webhook for ISR Revalidation | 2 | directus, webhooks, nextjs |

**Phase 4 Total:** 9 story points

**Grand Total:** 45 story points (slightly higher than initial estimate of 42)

---

## Manual Actions Required

### 1. Link Stories to Epic in Jira UI

**Note:** The Atlassian CLI (`acli`) doesn't support epic linking via command line. You'll need to manually link stories to the epic in the Jira UI.

**Steps:**
1. Open Epic: https://automatonicai.atlassian.net/browse/CHRONOS-349
2. Scroll to "Child issues" section
3. Click "Link issue"
4. Add each story (CHRONOS-350 through CHRONOS-365)

**Alternatively (faster):**
1. Open each story ticket
2. In the details panel, find "Parent" field
3. Enter: CHRONOS-349
4. Save

### 2. Approve ADR-018

**Action:** Review and approve ADR-018: Directus CMS Selection
**File:** `docs/10-DEVELOPMENT/01-ARCHITECTURE/adrs/adr_018_directus_cms_selection.md`

**Update ADR status:**
- Change `Status: Proposed` → `Status: Approved`
- Add approval details:
  ```markdown
  **Approved by:** Geoff Bevans
  **Date Approved:** 2025-12-21
  **Implementation Start:** [Sprint number]
  ```

### 3. Schedule Sprint Planning

**Recommended Timeline:**
- **Sprint N (Next Sprint):** Phase 1 (Infrastructure Setup) - 9 story points
- **Sprint N+1:** Phase 2 (Drizzle Schema) + Phase 3 Part 1 - 13-14 story points
- **Sprint N+2:** Phase 3 Part 2 + Phase 4 - 14-15 story points

**Sprint Capacity:** Adjust based on your velocity (typically 20-30 points per sprint)

---

## Key Architectural Decisions Confirmed

### Database Ownership
- **Drizzle ORM** owns application schema (deals, companies, investors, blog_posts)
- **Alembic** owns data warehouse schema (raw imports, staging tables)
- **Directus** introspects Drizzle-managed tables (no schema ownership)

### Content Strategy

**Managed in Directus (Dynamic Content):**
- Blog posts
- Documentation pages
- Homepage hero content
- Feature descriptions
- Announcements
- Legal pages (Terms, Privacy)

**Hardcoded in Next.js (App Structure):**
- Page layouts and routing
- Navigation structure
- Component composition
- Styling and design system
- Product dashboards (deals, analytics)

**Hybrid (Structure + Content):**
- Homepage (React layout + Directus content)
- Features page (React grid + Directus data)
- About page (React sections + Directus bios)

### Type Safety Flow

```
PostgreSQL Database
  ↓
Drizzle Schema Definition (TypeScript)
  ↓
Drizzle Types (exported)
  ↓
Zod Validators
  ↓
tRPC Procedures (product data)
  ↓
Next.js Server Components

Parallel Flow for CMS Content:

PostgreSQL Database
  ↓
Directus Introspection
  ↓
Directus SDK (HTTP)
  ↓
Next.js Server Components (marketing content)
```

---

## Next Steps

### Immediate (This Week)
1. **Review and approve** ADR-018
2. **Link Jira stories** to epic CHRONOS-349
3. **Prioritize Phase 1 stories** in next sprint backlog
4. **Provision Infrastructure**:
   - Ensure Lightsail VM has capacity for Directus
   - Verify R2 bucket exists: `chronos-media` (already provisioned)
   - Set up subdomain DNS: `admin.automatonicai.com`
   - (Optional) Set up custom domain for R2: `media.automatonicai.com`

### Short Term (Next Sprint)
1. **Begin Phase 1 implementation** (CHRONOS-350 through CHRONOS-353)
2. **Set up local development environment**:
   - Docker Compose for Directus (local testing)
   - PostgreSQL connection from local machine
3. **Create developer documentation**:
   - Directus local setup guide
   - Drizzle schema modification workflow

### Medium Term (2-3 Sprints)
1. **Complete Phases 2-3** (Drizzle + Next.js integration)
2. **Create marketing team training materials**:
   - Video walkthrough of Directus admin UI
   - Written guide: "Publishing Blog Posts"
   - Quick reference cheat sheet
3. **Migrate existing content** to Directus

### Long Term (Post-Implementation)
1. **Monitor performance metrics**:
   - Directus uptime (target: >99.5%)
   - Content update latency (target: <60s or instant with webhooks)
   - S3 storage costs (target: <$5/month)
2. **Iterate based on feedback**:
   - Marketing team usability feedback
   - Performance optimization opportunities
3. **Explore advanced features**:
   - Custom Directus extensions (graph viz, vector search)
   - Multilingual content support
   - Advanced workflows (approval flow, scheduled publishing)

---

## Success Criteria

### Technical Metrics
- [ ] Directus admin UI accessible at https://admin.automatonicai.com
- [ ] Blog posts render from Directus content
- [ ] Homepage dynamic content from Directus
- [ ] Content updates appear within 60 seconds (ISR) or instantly (webhooks)
- [ ] Directus uptime >99.5%
- [ ] S3 storage costs <$5/month
- [ ] Lighthouse SEO score >95 on blog pages

### Business Metrics
- [ ] Marketing team can publish blog posts without developer involvement
- [ ] Marketing team trained and autonomous
- [ ] 10+ blog posts published in first month post-implementation
- [ ] Zero developer blockers for content updates
- [ ] Content publish workflow <5 minutes (draft → publish)

### Architecture Metrics
- [ ] Drizzle schema remains single source of truth
- [ ] PostgreSQL extensions (TimescaleDB, PostGIS, pgvector, Apache AGE) fully accessible
- [ ] Type-safe data flow preserved (Drizzle → Zod → tRPC → Next.js)
- [ ] Clear separation: Edge (Next.js) + VM (Directus + PostgreSQL)

---

## Risk Mitigation Strategies

### Risk 1: Directus Migration Complexity
**Likelihood:** Medium
**Impact:** Medium
**Mitigation:**
- Test in local environment first
- Use staging database for initial setup
- Document all steps in implementation plan

### Risk 2: ISR Latency Unacceptable
**Likelihood:** Low
**Impact:** Low
**Mitigation:**
- Implement webhooks for instant revalidation
- Use Redis caching for Directus API responses
- Cloudflare CDN caches responses

### Risk 3: Marketing Team Learning Curve
**Likelihood:** Medium
**Impact:** Low
**Mitigation:**
- Create comprehensive training materials
- Schedule 1-hour training session
- Provide ongoing support during first month

### Risk 4: S3 Costs Exceed Budget
**Likelihood:** Low
**Impact:** Low
**Mitigation:**
- Set S3 lifecycle policies (archive old media)
- Monitor usage weekly
- Set billing alerts at $10/month

### Risk 5: Dual Migration Strategy Confusion
**Likelihood:** Medium
**Impact:** Medium
**Mitigation:**
- Document clear ownership rules
- Create `DATABASE_SCHEMA_OWNERSHIP.md` guide
- Enforce discipline: Drizzle for app, Alembic for data warehouse

---

## Documentation Created

1. ✅ **ADR-018:** Directus CMS Selection and Integration Strategy
   - Location: `docs/10-DEVELOPMENT/01-ARCHITECTURE/adrs/adr_018_directus_cms_selection.md`
   - Status: Proposed (pending approval)
   - Length: ~910 lines, comprehensive analysis

2. ✅ **Implementation Plan:** Directus CMS Implementation Plan
   - Location: `docs/10-DEVELOPMENT/01-ARCHITECTURE/DIRECTUS_CMS_IMPLEMENTATION_PLAN.md`
   - Status: Complete
   - Length: ~800 lines, 4-phase detailed plan

3. ✅ **This Summary:** DIRECTUS_CMS_IMPLEMENTATION_SUMMARY.md
   - Location: `docs/10-DEVELOPMENT/01-ARCHITECTURE/DIRECTUS_CMS_IMPLEMENTATION_SUMMARY.md`
   - Purpose: Quick reference for planning completion

4. ✅ **ADR Index Updated:** Added ADR-018 to index
   - Location: `docs/10-DEVELOPMENT/01-ARCHITECTURE/adrs/README.md`
   - Next ADR number: ADR-019

---

## Questions for Consideration

Before implementation begins, consider:

1. **Subdomain DNS:** Is `admin.automatonicai.com` the preferred subdomain for Directus admin UI?
2. **R2 Bucket:** Confirmed `chronos-media` R2 bucket (already provisioned)
3. **Redis:** Should Redis be installed on the same Lightsail VM or use a managed service (ElastiCache)?
4. **Directus Version:** Pin to latest stable (currently 10.x) or wait for specific version?
5. **Training Schedule:** When should marketing team training be scheduled? (Recommend: 1 week after Phase 3 complete)

---

## Conclusion

**Planning is complete.** All architectural decisions documented, implementation plan detailed, and Jira tickets created. The project is ready to move from planning to execution.

**Recommended Action:** Schedule a sprint planning meeting to commit to Phase 1 (CHRONOS-350 through CHRONOS-353) in the next sprint.

**Total Effort Estimate:** 3-4 sprints (45 story points total)
**Total Cost:** ~$5/month incremental (S3 storage only)
**Total Risk:** Low (well-planned, proven technologies, clear rollback path)

---

**Document Version:** 1.0.0
**Last Updated:** 2025-12-21
**Next Review:** After Phase 1 completion
