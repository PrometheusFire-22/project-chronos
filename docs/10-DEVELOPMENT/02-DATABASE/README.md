# Database Documentation

Comprehensive documentation for the Drizzle ORM implementation in Project Chronos.

---

## Quick Start

**New to the project?** Start here:

1. Read [Drizzle Architecture Guide](./DRIZZLE_ARCHITECTURE_GUIDE.md) - Understand why and how we use Drizzle
2. Review [Schema Reference](./DRIZZLE_SCHEMA_REFERENCE.md) - Learn about each table
3. Follow [Developer Guide](./DRIZZLE_DEVELOPER_GUIDE.md) - Daily workflows and best practices
4. Plan content with [Content Strategy Guide](./CONTENT_STRATEGY_GUIDE.md) - Content architecture and examples

---

## Documentation Overview

### 📐 [Drizzle Architecture Guide](./DRIZZLE_ARCHITECTURE_GUIDE.md)

**For:** Tech leads, architects, new engineers

**Topics:**
- Why Drizzle ORM over alternatives (Prisma, TypeORM)
- Database-first philosophy
- Schema ownership strategy (Drizzle vs Alembic vs Directus)
- Dual migration coexistence
- Integration architecture (Drizzle ↔ Directus ↔ Next.js)
- Type safety flow
- Performance considerations

**When to read:** Before making architectural decisions, onboarding new engineers, or explaining the system to stakeholders.

---

### 📖 [Drizzle Schema Reference](./DRIZZLE_SCHEMA_REFERENCE.md)

**For:** Developers, content managers, product managers

**Topics:**
- **cms_blog_posts** - Blog articles with SEO, categories, tags
- **cms_docs_pages** - Hierarchical docs AND standalone pages (About, Solutions, etc.)
- **cms_homepage_hero** - Homepage hero section
- **cms_features** - Product features grid
- **cms_announcements** - Site-wide notifications
- **cms_legal_pages** - Legal documents with versioning
- Common patterns (publishing workflow, SEO, timestamps)

**When to read:** When creating content, querying data, or understanding table structure.

---

### 🛠️ [Drizzle Developer Guide](./DRIZZLE_DEVELOPER_GUIDE.md)

**For:** Day-to-day development

**Topics:**
- Development setup and environment variables
- Common workflows (viewing schema, querying, inserting)
- Adding new tables (step-by-step)
- Modifying existing tables (adding columns, renaming, type changes)
- Advanced querying patterns
- Testing strategies
- Troubleshooting common issues
- Best practices

**When to read:** When working with the database daily, creating migrations, or debugging issues.

---

### 📝 [Content Strategy Guide](./CONTENT_STRATEGY_GUIDE.md)

**For:** Content managers, product managers, marketing

**Topics:**
- Content architecture and site map
- Marketing website structure (Homepage, About, Solutions, Contact)
- Blog strategy (content pillars, examples)
- Documentation system (hierarchical structure)
- Page-specific examples:
  - About page
  - Solutions pages (parent + children)
  - Contact page
- SEO strategy and keyword planning
- Publishing workflows

**When to read:** Planning content structure, creating marketing pages, or strategizing SEO.

---

## Common Questions

### Q: Which table should I use for the About page?

**A:** Use `cms_docs_pages` with `parent_id = NULL`. It's designed for both documentation AND standalone content pages.

See: [Content Strategy Guide - About Page](./CONTENT_STRATEGY_GUIDE.md#about-page)

---

### Q: How do I create hierarchical pages like Solutions → Private Equity → Deal Sourcing?

**A:** Use `cms_docs_pages` with `parent_id` references:

```typescript
// 1. Create parent
const [parent] = await db.insert(docsPages).values({
  title: 'Solutions',
  slug: 'solutions',
  parentId: null, // Top-level
}).returning();

// 2. Create child
await db.insert(docsPages).values({
  title: 'Private Equity',
  slug: 'solutions/private-equity',
  parentId: parent.id, // Link to parent
});
```

See: [Schema Reference - cms_docs_pages](./DRIZZLE_SCHEMA_REFERENCE.md#cms_docs_pages)

---

### Q: How do I add a new column to an existing table?

**A:** Follow the migration workflow:

1. Update schema in `packages/database/src/schema/cms.ts`
2. Run `pnpm db:generate` to create migration
3. Review generated SQL
4. Run `pnpm db:migrate` to apply
5. Restart Directus (if needed)

See: [Developer Guide - Adding Columns](./DRIZZLE_DEVELOPER_GUIDE.md#adding-a-column)

---

### Q: What's the difference between Drizzle and Directus?

**A:**
- **Drizzle** = Schema owner (TypeScript definitions, migrations)
- **Directus** = Content manager (UI for editors, API for frontend)
- **Flow:** Drizzle defines schema → PostgreSQL → Directus introspects → Editors manage content

See: [Architecture Guide - Database Ownership](./DRIZZLE_ARCHITECTURE_GUIDE.md#database-ownership-strategy)

---

### Q: Can I query the database directly or should I use Directus API?

**A:** Both! Choose based on use case:

| Content Type | Method | Why |
|--------------|--------|-----|
| Blog posts | Directus API | CMS-managed content |
| Docs pages | Directus API | CMS-managed content |
| Application data (deals, companies) | Direct Drizzle | Application logic |
| Real-time queries | Direct Drizzle | Performance |

See: [Architecture Guide - Integration Architecture](./DRIZZLE_ARCHITECTURE_GUIDE.md#integration-architecture)

---

### Q: How do I handle SEO metadata?

**A:** All content tables include SEO fields:

```typescript
{
  metaTitle: 'Page Title - Brand | 50-60 chars',
  metaDescription: 'Compelling description... | 150-160 chars',
  ogImage: 'https://media.automatonicai.com/og/image.jpg',
}
```

See: [Content Strategy Guide - SEO Strategy](./CONTENT_STRATEGY_GUIDE.md#seo-strategy)

---

## Quick Reference

### Package Location

```
packages/database/
├── src/
│   ├── client.ts       # Database connection
│   ├── index.ts        # Public exports
│   └── schema/
│       ├── cms.ts      # CMS content tables
│       └── index.ts    # Schema exports
├── migrations/         # Generated SQL migrations
├── drizzle.config.ts   # Drizzle configuration
└── package.json        # Dependencies
```

### Commands

```bash
# Generate migration from schema changes
pnpm --filter @chronos/database db:generate

# Apply migrations to database
pnpm --filter @chronos/database db:migrate

# Visual database explorer
pnpm --filter @chronos/database db:studio

# Push schema (dev only, bypasses migrations)
pnpm --filter @chronos/database db:push
```

### Import Patterns

```typescript
// Database client and tables
import { db, blogPosts, docsPages } from '@chronos/database';

// Query operators
import { eq, and, or, like, ilike, desc, asc } from '@chronos/database';

// Example query
const posts = await db
  .select()
  .from(blogPosts)
  .where(eq(blogPosts.status, 'published'))
  .orderBy(desc(blogPosts.publishedAt));
```

---

## Database Schema Summary

### CMS Content Tables (6 tables)

| Table | Purpose | Use Cases |
|-------|---------|-----------|
| **cms_blog_posts** | Blog articles | Company blog, product updates, thought leadership |
| **cms_docs_pages** | Hierarchical pages | Documentation, About, Solutions, Contact, Pricing |
| **cms_homepage_hero** | Hero section | Homepage hero, landing pages |
| **cms_features** | Product features | Features grid, solution features |
| **cms_announcements** | Notifications | Product launches, maintenance alerts |
| **cms_legal_pages** | Legal docs | Terms, Privacy Policy (versioned) |

**Total:** 6 tables, 23 indexes, 1 foreign key

---

## Useful Links

### Internal Documentation

- [Architecture ADRs](../01-ARCHITECTURE/adrs/README.md)
- [ADR-018: Directus CMS Selection](../01-ARCHITECTURE/adrs/adr_018_directus_cms_selection.md)
- [Implementation Plan](../01-ARCHITECTURE/DIRECTUS_CMS_IMPLEMENTATION_PLAN.md)
- [R2 Storage Decision](../01-ARCHITECTURE/R2_STORAGE_DECISION.md)

### External Resources

- [Drizzle ORM Documentation](https://orm.drizzle.team/)
- [Drizzle Kit (Migrations)](https://orm.drizzle.team/kit-docs/overview)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Directus Documentation](https://docs.directus.io/)

---

## Contributing

### Adding New Documentation

1. Create new `.md` file in this directory
2. Follow existing structure and formatting
3. Add to this README index
4. Update last modified date
5. Create PR with documentation label

### Updating Existing Documentation

1. Make changes to relevant guide
2. Update "Last Updated" date
3. Update version if major changes
4. Create PR with documentation label

---

## Document Metadata

**Directory Created:** 2025-12-21
**Last Updated:** 2025-12-21
**Maintainer:** Geoff Bevans <geoff@automatonicai.com>
**Status:** Complete ✅

---

## Support

Questions about the database architecture?

1. Check these guides first
2. Review [Troubleshooting](./DRIZZLE_DEVELOPER_GUIDE.md#troubleshooting) section
3. Search Jira for related issues
4. Ask in team Slack #engineering channel
5. Create Jira ticket for documentation gaps
