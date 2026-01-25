# Environment Variables for Cloudflare Pages

## Required for Turnstile CAPTCHA

Add these to your Cloudflare Pages project settings:

### Production Environment Variables

```bash
# Turnstile Secret Key (REQUIRED - Server-side verification)
TURNSTILE_SECRET_KEY=0x4AAAAAACQisaNxlpA-qf3dqjkIxypj6Ug

# Turnstile Site Key (REQUIRED - Client-side widget)
NEXT_PUBLIC_TURNSTILE_SITE_KEY=0x4AAAAAACQisT-KqYDph-VN

# Directus URL (Already configured)
NEXT_PUBLIC_DIRECTUS_URL=https://admin.automatonicai.com

# Resend API Key (Already configured)
RESEND_API_KEY=<your-resend-key>
```

## How to Add to Cloudflare Pages

1. Go to [Cloudflare Pages Dashboard](https://dash.cloudflare.com/060e43df09e3ec3a256a6624ab7649f8/pages)
2. Select **project-chronos**
3. Go to **Settings** → **Environment variables**
4. Click **Add variable**
5. Add each variable:
   - Name: `TURNSTILE_SECRET_KEY`
   - Value: `0x4AAAAAACQisaNxlpA-qf3dqjkIxypj6Ug`
   - Environment: **Production** and **Preview**
6. Repeat for `NEXT_PUBLIC_TURNSTILE_SITE_KEY`

## Note on 429 Errors

The 429 errors you're seeing are just Cloudflare API rate limits - they're temporary and don't affect your site. They'll resolve automatically.

## Testing Locally

The keys are now in your `.env.local` file, so you can test locally with:

```bash
pnpm dev
```

Navigate to the waitlist page and verify the Turnstile widget appears!
