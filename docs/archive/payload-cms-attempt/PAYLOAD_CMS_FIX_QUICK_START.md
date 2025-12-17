# Payload CMS - Quick Fix Guide

**CRITICAL: Your admin panel has 3 issues. Fix them in this order.**

---

## Issue 1: Redirect Loop (5 minutes)

### Problem
Vercel redirects `automatonicai.com` → `www.automatonicai.com`
But Payload redirects `www.automatonicai.com` → `automatonicai.com`
Result: Infinite loop

### Fix (Choose ONE option)

**Option A: Use non-www (RECOMMENDED)**

1. Go to https://vercel.com/prometheusfire-22s-projects/project-chronos-web/settings/domains
2. Click on `www.automatonicai.com`
3. Change "Redirect to" → `automatonicai.com` (remove www)
4. OR remove `www.automatonicai.com` entirely
5. Keep `NEXT_PUBLIC_SERVER_URL=https://automatonicai.com` (no www)

**Option B: Use www**

1. Update Vercel env var:
   ```bash
   vercel env add NEXT_PUBLIC_SERVER_URL production
   # Enter: https://www.automatonicai.com
   ```
2. Redeploy:
   ```bash
   git commit --allow-empty -m "trigger redeploy"
   git push origin main
   ```

### Verify
```bash
curl -I https://automatonicai.com/admin
# Should NOT show 307 redirect loop
```

---

## Issue 2: Database Has No Tables (15 minutes)

### Problem
PostgreSQL database exists but has zero Payload tables.

### Fix

```bash
cd /home/prometheus/coding/finance/project-chronos

# Set environment variables
export POSTGRES_URL="postgresql://chronos:DZ4eNOynmfYVOtG8c8TBlXIGVGlqkvWKQR5ixYYjAMs=@16.52.210.100:5432/chronos"
export PAYLOAD_SECRET="9c16b26c34e6fc4ff3bd1e7397cf13d569f4468276ee532115dac41919f82fb8"
export NEXT_PUBLIC_SERVER_URL="https://automatonicai.com"

# Run Payload migrations
pnpm --filter @chronos/web exec payload migrate
```

### Verify
```bash
node scripts/test-db-connection.mjs
# Should show: ✅ users, ✅ media, ✅ pages
```

---

## Issue 3: No Admin User (10 minutes)

### Problem
Cannot login because zero users exist.

### Fix

Create `scripts/create-admin-user.mjs`:

```javascript
#!/usr/bin/env node
import { getPayload } from 'payload';
import config from '../apps/web/payload.config.js';

async function createAdmin() {
  const payload = await getPayload({ config });

  const user = await payload.create({
    collection: 'users',
    data: {
      email: 'geoff@automatonicai.com',
      password: 'ChangeMe123!',
    },
  });

  console.log('✅ Admin user created:', user.email);
  process.exit(0);
}

createAdmin().catch(console.error);
```

Run it:

```bash
chmod +x scripts/create-admin-user.mjs
node scripts/create-admin-user.mjs
```

### Verify
Visit https://automatonicai.com/admin and login with:
- Email: `geoff@automatonicai.com`
- Password: `ChangeMe123!`

**IMPORTANT:** Change password immediately after first login!

---

## Total Time: 30 minutes

Once all three issues are fixed, the admin panel will work perfectly.

---

## If Something Goes Wrong

Run the database test script:
```bash
node scripts/test-db-connection.mjs
```

Check the full audit report:
```bash
cat PAYLOAD_CMS_AUDIT_REPORT.md
```

Check Vercel deployment logs:
```bash
vercel logs automatonicai.com
```
