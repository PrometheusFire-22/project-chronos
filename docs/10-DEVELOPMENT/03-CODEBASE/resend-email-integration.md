# Resend Email Integration Guide

**Status**: ✅ Implemented
**Date**: 2025-12-26
**Owner**: Engineering
**Related Jira**: CHRONOS-TBD

---

## Overview

This document describes the Resend email service integration for automated waitlist confirmation emails in the Chronos marketing website.

## Architecture

### Components

1. **Email Service**: Resend (https://resend.com)
2. **API Route**: `/api/waitlist` (Next.js API route)
3. **Email Template**: `apps/web/utils/emails/waitlist-confirmation.ts`
4. **Environment Variable**: `RESEND_API_KEY` (Cloudflare Pages secret)

### Flow Diagram

```
User submits waitlist form
          ↓
POST /api/waitlist
          ↓
Validate form data (Zod)
          ↓
Save to Directus CMS
          ↓
Initialize Resend client ← RESEND_API_KEY
          ↓
Generate email from template
          ↓
Send email via Resend API
          ↓
Return success response
```

## Implementation Details

### 1. Email Template

**Location**: `apps/web/utils/emails/waitlist-confirmation.ts`

**Features**:
- Personalized greeting with user's first name
- Dark-themed HTML matching website branding
- Plain text fallback for compatibility
- Lists all 4 database modalities (graph, vector, time-series, geospatial)
- Reply-to configured for user responses

**Function signature**:
```typescript
function getWaitlistConfirmationEmail({
  firstName: string,
  email: string
}): {
  subject: string
  html: string
  text: string
}
```

### 2. API Route

**Location**: `apps/web/app/api/waitlist/route.ts`

**Key implementation details**:

#### Runtime Initialization
Resend client is initialized **inside** the request handler, not at module level:

```typescript
// ✅ Correct - runs at request time
export async function POST(request: NextRequest) {
  try {
    // ... save to Directus ...

    // Initialize Resend (only at runtime, not build time)
    const resend = new Resend(process.env.RESEND_API_KEY)

    await resend.emails.send({ ... })
  }
}
```

**Why?** Environment variables are only available at runtime in Cloudflare Pages, not during Next.js build phase.

❌ **DON'T** do this:
```typescript
// This breaks builds - env var not available at build time
const resend = new Resend(process.env.RESEND_API_KEY)
```

#### Non-Blocking Email Sending
Email failures don't fail the waitlist submission:

```typescript
try {
  const resend = new Resend(process.env.RESEND_API_KEY)
  await resend.emails.send({ ... })
} catch (emailError) {
  // Log error but don't fail the request
  console.error('Failed to send confirmation email:', emailError)
}
// User is still on waitlist even if email fails
return NextResponse.json({ success: true })
```

### 3. Email Configuration

**From**: `Chronos <waitlist@automatonicai.com>`
**Reply-To**: `geoff@automatonicai.com`
**Subject**: "Welcome to the Chronos Waitlist"

**Sender domain**: `automatonicai.com` (verified in Resend)

## Environment Setup

### Development

Add to `apps/web/.env.local`:
```bash
RESEND_API_KEY=re_your_dev_key_here
```

### Production (Cloudflare Pages)

**Method 1: Wrangler CLI** (Recommended)
```bash
cd apps/web
npx wrangler pages secret put RESEND_API_KEY --project-name=chronos-web
# Enter API key when prompted
```

**Method 2: Cloudflare Dashboard**
1. Cloudflare Pages → chronos-web project
2. Settings → Environment Variables
3. Add variable: `RESEND_API_KEY` = `re_xxx`
4. Mark as "Encrypt" (secret)
5. Save and redeploy

### Testing Email Sending

**Test script**: `scripts/test-resend.ts`

```bash
# Set API key in environment
export RESEND_API_KEY=re_your_key_here

# Run test email
npx tsx scripts/test-resend.ts
```

**Expected output**:
```
📧 Sending test email...
✅ Email sent successfully!
📬 Email ID: 9301331d-dfb7-4796-9bb9-af419668749a
📥 Check your inbox at geoff@automatonicai.com
```

## Resend Account Configuration

### Domain Verification

**Domain**: `automatonicai.com`
**Status**: ✅ Verified

**DNS Records** (already configured):
- TXT record for domain verification
- DKIM records for email authentication
- SPF record for sender policy

### Email Limits

**Free Tier**:
- 3,000 emails/month
- 100 emails/day
- Sufficient for early-stage waitlist

**Paid Tier** ($20/mo when needed):
- 50,000 emails/month
- Higher daily limits

## Monitoring

### Email Delivery

Check Resend dashboard for:
- Delivery status (sent, delivered, bounced, failed)
- Open rates (optional tracking)
- Spam complaints

### Application Logs

Cloudflare Pages logs show:
```
Waitlist confirmation email sent to: user@example.com
```

Or errors:
```
Failed to send confirmation email: [error details]
```

## Troubleshooting

### Build Fails: "Missing API key"

**Symptom**: Build error during Next.js compilation
```
Error: Missing API key. Pass it to the constructor `new Resend("re_123")`
```

**Cause**: Resend initialized at module level (runs during build)

**Fix**: Move initialization inside function (see Implementation Details)

### Email Not Sending

**Check**:
1. ✅ API key configured in Cloudflare Pages?
2. ✅ Domain verified in Resend dashboard?
3. ✅ Email address valid?
4. ✅ Check Cloudflare Pages logs for errors

### TypeScript Errors

**Common error**:
```
Property 'reply_to' does not exist. Did you mean 'replyTo'?
```

**Fix**: Resend API uses camelCase, not snake_case
```typescript
// ✅ Correct
replyTo: 'geoff@automatonicai.com'

// ❌ Wrong
reply_to: 'geoff@automatonicai.com'
```

## Future Enhancements

### Planned
- [ ] Email templates for other user actions (launch announcement, feature updates)
- [ ] Segmented email campaigns (investors, partners, general users)
- [ ] Email tracking and analytics
- [ ] A/B testing for email content

### Considerations
- **React Email**: Consider migrating to React Email components for better template maintainability
- **Email Queue**: For high volume, consider adding a queue (e.g., Cloudflare Queues)
- **Personalization**: Add more dynamic content based on user data (company, role, etc.)

## Related Documentation

- [Resend API Documentation](https://resend.com/docs)
- [Next.js API Routes](https://nextjs.org/docs/api-routes/introduction)
- [Cloudflare Pages Environment Variables](https://developers.cloudflare.com/pages/configuration/environment-variables/)

## Changelog

| Date | Change | Author |
|------|--------|--------|
| 2025-12-26 | Initial implementation | Claude Code |
| 2025-12-26 | Fix TypeScript error (reply_to → replyTo) | Claude Code |
| 2025-12-26 | Fix build error (runtime initialization) | Claude Code |
