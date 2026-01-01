# Sentry Complete Setup Guide

Complete guide to maximize Sentry's free tier features for production-grade error tracking and performance monitoring.

---

## 🎯 What You'll Get

After this setup, you'll have:
- ✅ **Unminified stack traces** - See actual code in error reports
- ✅ **Session replay** - Watch video of what users did before errors
- ✅ **Performance monitoring** - Track Core Web Vitals and slow pages
- ✅ **Real-time alerts** - Get notified of critical errors instantly
- ✅ **User context** - Know which users experienced errors
- ✅ **Custom error UI** - Better error pages for users

**Cost**: $0/month (staying on free tier with 10% sampling)

---

## Step 1: Source Maps Upload (CRITICAL)

### Why This Matters
Without source maps, error stack traces look like this:
```
Error at e.default (chunk-abc123.js:1:45678)
```

With source maps, you see:
```
Error at handleSubmit (app/components/WaitlistForm.tsx:42:15)
```

### How to Enable

#### 1.1 Generate Sentry Auth Token

1. Go to: https://automatonic-ai.sentry.io/settings/account/api/auth-tokens/
2. Click **"Create New Token"**
3. Configure:
   - **Name**: `cloudflare-pages-source-maps`
   - **Scopes**: Check these boxes:
     - `project:read`
     - `project:releases` (required for source maps)
     - `org:read`
4. Click **"Create Token"**
5. **COPY THE TOKEN IMMEDIATELY** (only shown once!)

#### 1.2 Add Token to Cloudflare

1. Go to: https://dash.cloudflare.com/
2. **Workers & Pages** → **project-chronos** → **Settings**
3. Scroll to **Environment variables**
4. Click **"Add variable"**
5. Fill in:
   - **Variable name**: `SENTRY_AUTH_TOKEN`
   - **Value**: [paste your token]
   - **Type**: Secret (encrypted)
   - **Environment**: Production AND Preview
6. Click **"Save"**

#### 1.3 Add Token Locally

```bash
# Add to .env (never commit!)
echo "SENTRY_AUTH_TOKEN=your-token-here" >> .env
```

#### 1.4 Verify It Works

After your next build, check:
1. Go to: https://automatonic-ai.sentry.io/settings/projects/project-chronos-web/source-maps/
2. You should see uploaded source maps with timestamps
3. New errors will show unminified code with actual file names and line numbers

---

## Step 2: Real-Time Alerts

### 2.1 Email Alerts (Immediate)

1. Go to: https://automatonic-ai.sentry.io/alerts/rules/
2. Click **"Create Alert Rule"**
3. Choose **"Issues"**
4. Configure:
   - **Alert name**: `Critical Production Errors`
   - **Environment**: `production`
   - **When**: `A new issue is created`
   - **If**: `The issue's level is equal to error or fatal`
   - **Then**: `Send a notification to` → Select your email
5. Click **"Save Rule"**

Create a second alert:
- **Alert name**: `High Error Rate`
- **When**: `The issue is seen more than 10 times in 1 hour`
- **Then**: Send notification

### 2.2 Slack Integration (Optional)

If you use Slack:
1. Go to: https://automatonic-ai.sentry.io/settings/integrations/slack/
2. Click **"Add Workspace"**
3. Authorize Sentry in Slack
4. Update alert rules to send to Slack channel

---

## Step 3: User Context Tracking

Know exactly which users experienced errors.

### 3.1 Update Sentry Client Config

Add this to `apps/web/sentry.client.config.ts`:

```typescript
import * as Sentry from '@sentry/nextjs';

Sentry.init({
  // ... existing config ...

  // Set user context (do this after identifying user)
  // This will be added in a separate function
});

// Export a function to set user context
export function setSentryUser(user: { id: string; email?: string; username?: string } | null) {
  if (user) {
    Sentry.setUser({
      id: user.id,
      email: user.email,
      username: user.username,
    });
  } else {
    // Clear user on logout
    Sentry.setUser(null);
  }
}
```

### 3.2 Track Anonymous Users

For now (before authentication), track anonymous users by session:

```typescript
// In sentry.client.config.ts, add this to the init:
Sentry.setUser({
  id: 'anonymous',
  ip_address: '{{auto}}', // Sentry auto-detects
});
```

### 3.3 Add Custom Tags

Tag errors with useful context:

```typescript
Sentry.setTag('deployment', process.env.CF_PAGES_COMMIT_SHA);
Sentry.setTag('environment', process.env.NODE_ENV);
```

---

## Step 4: Custom Error Boundaries

Better UX when errors occur.

### 4.1 Create Global Error Boundary

Create `apps/web/app/error.tsx`:

```typescript
'use client';

import * as Sentry from '@sentry/nextjs';
import { useEffect } from 'react';
import { Button } from '@chronos/ui';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log error to Sentry
    Sentry.captureException(error);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4">
      <div className="max-w-md text-center">
        <h1 className="mb-4 text-4xl font-bold">Something went wrong</h1>
        <p className="mb-6 text-gray-600">
          We've been notified and are looking into it.
        </p>
        <Button onClick={reset}>Try again</Button>
      </div>
    </div>
  );
}
```

### 4.2 Create 404 Error Page

Create `apps/web/app/not-found.tsx`:

```typescript
import Link from 'next/link';
import { Button } from '@chronos/ui';

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4">
      <div className="max-w-md text-center">
        <h1 className="mb-4 text-4xl font-bold">404 - Page Not Found</h1>
        <p className="mb-6 text-gray-600">
          The page you're looking for doesn't exist.
        </p>
        <Link href="/">
          <Button>Go Home</Button>
        </Link>
      </div>
    </div>
  );
}
```

---

## Step 5: Performance Monitoring

### 5.1 Set Performance Budgets

In Sentry dashboard:
1. Go to: https://automatonic-ai.sentry.io/settings/projects/project-chronos-web/performance/
2. Set thresholds:
   - **LCP** (Largest Contentful Paint): 2.5s
   - **FID** (First Input Delay): 100ms
   - **CLS** (Cumulative Layout Shift): 0.1
   - **TTFB** (Time to First Byte): 600ms

### 5.2 Monitor Slow Pages

1. Go to: https://automatonic-ai.sentry.io/performance/
2. Click **"Web Vitals"** tab
3. Identify pages with poor scores
4. Click on a page to see detailed breakdown

### 5.3 Create Performance Alerts

1. Go to: https://automatonic-ai.sentry.io/alerts/rules/
2. Create alert:
   - **Alert name**: `Poor Web Vitals`
   - **When**: `The avg LCP is above 3000ms`
   - **For**: `All transactions`
   - **Then**: Send notification

---

## Step 6: Advanced Features

### 6.1 Custom Events

Track specific user actions:

```typescript
import * as Sentry from '@sentry/nextjs';

// Track waitlist signup
Sentry.captureMessage('Waitlist signup', {
  level: 'info',
  tags: {
    action: 'signup',
  },
  extra: {
    timestamp: new Date().toISOString(),
  },
});
```

### 6.2 Custom Metrics

Track custom performance metrics:

```typescript
Sentry.metrics.distribution('page.load.time', loadTime, {
  unit: 'millisecond',
  tags: { page: 'homepage' },
});
```

### 6.3 Session Replay Filtering

Already configured! Session replay captures:
- 10% of normal sessions
- 100% of sessions with errors
- All text and media masked for privacy

View replays at: https://automatonic-ai.sentry.io/replays/

---

## Step 7: Testing & Verification

### 7.1 Test Error Tracking

Add a test button temporarily:

```typescript
'use client';

import * as Sentry from '@sentry/nextjs';

export function TestSentryButton() {
  return (
    <button onClick={() => {
      throw new Error('Test Sentry Error!');
    }}>
      Test Sentry
    </button>
  );
}
```

Click it, then check: https://automatonic-ai.sentry.io/issues/

### 7.2 Test Performance Tracking

Visit your site and check:
https://automatonic-ai.sentry.io/performance/

You should see page loads, API calls, and Web Vitals.

### 7.3 Test Session Replay

Trigger an error and check:
https://automatonic-ai.sentry.io/replays/

You should see a video recording of the session.

---

## Step 8: Dashboard Setup

### 8.1 Create Custom Dashboard

1. Go to: https://automatonic-ai.sentry.io/dashboards/
2. Click **"Create Dashboard"**
3. Add widgets:
   - **Errors by Page** (table)
   - **Error Rate** (line chart)
   - **Web Vitals** (big number)
   - **Session Replay Count** (big number)
   - **Most Affected Users** (table)

### 8.2 Key Metrics to Monitor

- **Error Rate**: Should be < 1%
- **Crash-Free Sessions**: Should be > 99.9%
- **LCP**: Should be < 2.5s
- **Cache Hit Rate**: Track Sentry's sampling (staying under free tier limits)

---

## 📊 Monitoring & Maintenance

### Daily Checks
- Review new issues in Sentry inbox
- Check for performance regressions

### Weekly Reviews
1. **Issues Tab**: Review and resolve top 5 errors
2. **Performance Tab**: Check Web Vitals trends
3. **Replays Tab**: Watch sessions with errors to understand UX issues

### Monthly Tasks
- Review alert rules (too noisy? too quiet?)
- Check quota usage (should stay under free tier: 5K errors/month)
- Archive resolved issues

---

## 🔒 Security & Privacy

### What Sentry Collects
- ✅ Error messages and stack traces
- ✅ Performance metrics
- ✅ Session replays (text/media masked)
- ❌ NOT passwords or sensitive form data (filtered out)

### Data Retention
- **Errors**: 90 days (free tier)
- **Performance**: 90 days
- **Replays**: 30 days

### Privacy Compliance
- Session replay masks all text by default
- Sensitive data filtered in `beforeSend`
- IP addresses anonymized
- GDPR compliant (EU data residency available on paid plans)

---

## 💰 Staying on Free Tier

### Current Configuration
- **Sampling**: 10% of transactions (configured)
- **Expected usage**: ~2,500 errors/month (well under 5K limit)
- **Replays**: ~500/month (under 1K limit)

### If You Approach Limits
1. Reduce sampling to 5%
2. Filter out noisy errors (e.g., browser extensions)
3. Increase `ignoreErrors` list

---

## 🚀 Next Steps

1. **Set up auth token** (Step 1) - Most important!
2. **Create alerts** (Step 2) - Get notified of issues
3. **Add error boundaries** (Step 4) - Better UX
4. **Test everything** (Step 7) - Verify it works

---

## 📞 Resources

- **Sentry Dashboard**: https://automatonic-ai.sentry.io
- **Documentation**: https://docs.sentry.io/platforms/javascript/guides/nextjs/
- **Status Page**: https://status.sentry.io
- **Support**: https://sentry.io/support/

---

**Last Updated**: 2025-12-31
**Related Jira**: CHRONOS-385
**Status**: Ready for implementation
