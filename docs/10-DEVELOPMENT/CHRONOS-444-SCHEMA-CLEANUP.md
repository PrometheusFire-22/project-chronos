# CHRONOS-444: Database Schema Cleanup

**Created:** 2026-01-22
**Branch:** `feat/CHRONOS-444-database-schema-cleanup`
**Status:** In Progress

---

## Objective

Clean up the `public` schema by removing orphaned tables and resolving potential auth conflicts between Drizzle and Directus.

## Scope

Based on `ARCHITECTURE_DISCOVERY.md`, the following tables need attention:

| Table | Owner | Action | Reason |
|-------|-------|--------|--------|
| `backup_test` | Unknown | 🗑️ DELETE | Orphaned test table |
| `users` | Drizzle? | 🔍 INVESTIGATE | May conflict with Directus auth |
| `users_sessions` | Drizzle? | 🔍 INVESTIGATE | May conflict with Directus auth |

## Investigation Steps

### Step 1: Connect to Database and List Tables

```bash
# SSH to Lightsail first
ssh -i ~/.ssh/aws-lightsail/chronos-prod-db ubuntu@16.52.210.100

# Connect to PostgreSQL
docker exec -it chronos-db psql -U chronos -d chronos

# List all tables in public schema
\dt public.*

# Check for backup_test table
SELECT * FROM information_schema.tables WHERE table_name = 'backup_test';

# Check users tables
SELECT * FROM information_schema.tables WHERE table_name IN ('users', 'users_sessions');
```

### Step 2: Analyze Table Usage

For each table, check:
1. Does it have data?
2. Is it referenced in code?
3. Does it have foreign keys?
4. When was it last modified?

```sql
-- Check if backup_test exists and has data
SELECT COUNT(*) FROM backup_test;
SELECT * FROM backup_test LIMIT 5;

-- Check users table structure
\d+ users
SELECT COUNT(*) FROM users;

-- Check users_sessions table structure
\d+ users_sessions
SELECT COUNT(*) FROM users_sessions;

-- Check for foreign keys
SELECT
  tc.table_name, kcu.column_name,
  ccu.table_name AS foreign_table_name,
  ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
WHERE tc.table_name IN ('backup_test', 'users', 'users_sessions')
  AND tc.constraint_type = 'FOREIGN KEY';
```

### Step 3: Check Codebase References

```bash
# Back on local machine
cd /home/prometheus/coding/finance/project-chronos

# Search for references to backup_test
git grep -i "backup_test"

# Search for references to users table (excluding directus_users)
git grep -E "users[^_]" | grep -v directus_users

# Check Drizzle schema for these tables
cat packages/database/src/schemas/cms.ts | grep -E "(users|sessions)"
```

## Cleanup Plan

### Phase 1: Investigate (Safe - No Changes)

- [ ] SSH to Lightsail and connect to database
- [ ] Run investigation queries above
- [ ] Document findings in this file
- [ ] Search codebase for references
- [ ] Create detailed action plan

**CHECKPOINT 1:** Commit investigation findings before proceeding

### Phase 2: Execute Cleanup (Destructive)

Only proceed after Phase 1 is committed and reviewed.

- [ ] Backup database (manual pgbackrest backup)
- [ ] Delete `backup_test` table (if safe)
- [ ] Handle `users` / `users_sessions` conflict (TBD based on findings)

**CHECKPOINT 2:** Commit schema changes

### Phase 3: Verification

- [ ] Verify applications still work (Directus, API, Web)
- [ ] Run integration tests
- [ ] Update Drizzle schema if needed

**CHECKPOINT 3:** Final commit and merge

---

## Safety Checklist

Before deleting any table:

- [ ] Confirmed table is not in Drizzle schema
- [ ] Confirmed table is not in Alembic migrations
- [ ] Confirmed no foreign keys reference it
- [ ] Confirmed no application code references it
- [ ] Ran manual pgbackrest backup
- [ ] Have rollback plan ready

---

## Rollback Plan

If something breaks:

```sql
-- Restore from backup (if needed)
-- Contact: See BACKUP_ASSESSMENT.md for restore procedures

-- Recreate table from backup (if we have schema)
-- TBD based on what we delete
```

---

## Progress Log

### 2026-01-22 - Investigation Start

- ✅ Created feature branch: `feat/CHRONOS-444-database-schema-cleanup`
- ✅ Created this planning document
- ✅ **Codebase Investigation Complete**

#### Codebase Findings

**backup_test table:**
- Only referenced in documentation (`adr_009_backup_strategy.md`, `BACKUP_RESTORE.md`)
- Created for testing backup/restore procedures
- NOT in any application code
- NOT in Drizzle schema
- NOT in Alembic migrations
- ✅ **SAFE TO DELETE**

**users / users_sessions tables:**
- NOT in Drizzle schema (`packages/database/src/schema/cms.ts`)
- Drizzle only defines: `cms_blog_posts`, `cms_docs_pages`, `cms_homepage_hero`, `cms_features`, `cms_announcements`, `cms_legal_pages`, `cms_waitlist_submissions`
- No references in codebase (excluding `directus_users`)
- **Status: Unknown if they exist or are orphaned**
- Next: Check database to see if they actually exist

### Next Steps

1. Create SQL investigation script
2. SSH to Lightsail and run queries
3. Document actual database state
4. Create cleanup SQL script
5. **CHECKPOINT 1:** Commit findings before executing

---

*Related Jira: [CHRONOS-444](https://automatonicai.atlassian.net/browse/CHRONOS-444)*
