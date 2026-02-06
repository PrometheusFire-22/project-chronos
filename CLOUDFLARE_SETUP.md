# Cloudflare Pages Setup Guide

## Environment Variables Required

Go to your Cloudflare Pages dashboard and add these environment variables:

### Production Environment

1. **DATABASE_URL**
   ```
   postgresql://username:password@host:5432/database
   ```
   Use your PostgreSQL connection string.

2. **BETTER_AUTH_SECRET**
   - Generate a secure random string (32+ characters)
   - Must be the same across all environments

3. **BETTER_AUTH_URL**
   ```
   https://automatonicai.com
   ```

4. **RESEND_API_KEY**
   - Your Resend API key for sending emails

### Preview Environment

Use the same values as production, or separate credentials if needed.

## Hyperdrive Configuration

Your Hyperdrive binding is already configured in `wrangler.toml`:
- Binding name: `DB`
- ID: `57a11e939cad4f4a96422a12f07f8142`

The application will automatically use Hyperdrive when available in Cloudflare Workers,
and fall back to DATABASE_URL for local development.

## How to Add Environment Variables

1. Go to https://dash.cloudflare.com/
2. Navigate to Pages → project-chronos (or your project name)
3. Go to Settings → Environment variables
4. Add each variable for Production and Preview environments
5. Redeploy your site

## Verifying the Setup

After adding environment variables and redeploying, check:
- Auth sign-in should work at https://automatonicai.com/sign-in
- Check Cloudflare Workers logs for "Using Hyperdrive connection" message
