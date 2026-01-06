# Resend Email Testing Guide

## Overview

The waitlist form now sends two emails:
1. **User Confirmation** - Sent to the person who signed up
2. **Admin Notification** - Sent to geoff@automatonicai.com

## Testing Locally

1. **Start the dev server:**
   ```bash
   pnpm run dev
   ```

2. **Submit a test form:**
   - Navigate to https://automatonicai.com (or localhost)
   - Fill out the waitlist form
   - Click "Join Waitlist"

3. **Verify emails:**
   - Check the test email inbox for user confirmation
   - Check geoff@automatonicai.com for admin notification

## Testing via API

```bash
curl -X POST http://localhost:3000/api/waitlist \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "first_name": "Test",
    "last_name": "User",
    "company": "Test Co",
    "role": "Developer",
    "heard_from": "Testing",
    "source": "api_test",
    "utm_source": "test",
    "utm_medium": "test",
    "utm_campaign": "test"
  }'
```

## Verifying Email Delivery

### Via Resend Dashboard

1. Go to https://resend.com/emails
2. Login with geoff@automatonicai.com
3. Check recent email logs to confirm delivery status

### What to Check

- **User confirmation email:**
  - From: Chronos <waitlist@automatonicai.com>
  - To: User's email
  - Subject: "Welcome to Chronos!"
  - Reply-To: geoff@automatonicai.com

- **Admin notification email:**
  - From: Chronos Notifications <waitlist@automatonicai.com>
  - To: geoff@automatonicai.com
  - Subject: "New Waitlist Signup: [First] [Last]"
  - Contains all user details (name, email, company, role, UTM params)

## Production Deployment

Before deploying to production:

1. **Add RESEND_API_KEY to Cloudflare Pages:**
   - Go to Cloudflare Pages dashboard
   - Navigate to your project settings
   - Add environment variable: `RESEND_API_KEY=<your_resend_api_key>`

2. **Deploy:**
   ```bash
   git add .
   git commit -m "feat: add admin notifications to waitlist (CHRONOS-384)"
   git push
   ```

3. **Test in production:**
   - Submit a test form on https://automatonicai.com
   - Verify both emails arrive

## Troubleshooting

### No emails received

1. Check Resend dashboard for delivery status
2. Verify RESEND_API_KEY is set in environment variables
3. Check dev server logs for error messages
4. Verify email addresses are valid

### Only user confirmation received

- Check that admin notification code is present in `app/api/waitlist/route.ts`
- Verify no errors in server logs
- Check Resend logs for admin email delivery status

### Email goes to spam

- This is expected for test emails
- In production, ensure SPF/DKIM records are configured in Resend
- Check with your IT admin about email filtering

## Email Rate Limits

Resend free tier limits:
- 100 emails per day
- 3,000 emails per month

If you exceed these limits, upgrade to a paid plan or emails will be queued.
