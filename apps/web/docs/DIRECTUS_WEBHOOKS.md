# Directus Webhooks for Content Revalidation

This document explains how to configure Directus webhooks to automatically revalidate cached content when blog posts are published or updated.

## Prerequisites

**IMPORTANT:** The revalidation API endpoint requires a Next.js server runtime and will NOT work with the current static export configuration.

To enable webhook-based revalidation, you must:

1. Remove `output: 'export'` from `next.config.js`
2. Deploy to a platform that supports Next.js server features:
   - Vercel (native support)
   - Cloudflare Pages with `@cloudflare/next-on-pages`
   - Any other platform supporting Next.js server features

Alternatively, continue using time-based ISR (current setup) with the `revalidate` option in fetch calls.

## Current Setup: Time-Based ISR

The current implementation uses time-based Incremental Static Regeneration:

- Blog listing page: Revalidates every 1 hour (`revalidate: 3600`)
- Blog detail pages: Revalidates every 1 hour with cache tags
- Cache tags: `blog-posts`, `blog-post-{slug}`

This means content updates will appear within 1 hour without any webhook configuration.

## Future Setup: On-Demand Revalidation via Webhooks

If you migrate away from static export, follow these steps:

### 1. Generate a Secret Token

```bash
# Generate a secure random token
openssl rand -base64 32
```

Add this to your environment variables:
- Local: `.env.local`
- Production: Your hosting platform's environment variable settings

```env
REVALIDATE_SECRET=your-generated-token-here
```

### 2. Configure Directus Webhooks

In your Directus admin panel:

1. Navigate to **Settings** → **Webhooks**
2. Click **Create Webhook** (+ button)
3. Configure the webhook:

#### Blog Post Webhook Configuration

**Name:** Blog Post Revalidation

**Status:** Active

**Collections:** `cms_blog_posts`

**Actions:**
- ✅ Create
- ✅ Update
- ✅ Delete

**URL:** `https://your-domain.com/api/revalidate`

**Method:** POST

**Headers:**
```json
{
  "x-revalidate-secret": "your-generated-token-here",
  "Content-Type": "application/json"
}
```

**Request Body:**
```json
{
  "collection": "cms_blog_posts",
  "slug": "{{$trigger.payload.slug}}",
  "tags": ["blog-posts", "blog-post-{{$trigger.payload.slug}}"],
  "paths": ["/blog", "/blog/{{$trigger.payload.slug}}"]
}
```

**Trigger on:**
- ✅ Action (Create, Update, Delete)

### 3. Test the Webhook

1. Publish or update a blog post in Directus
2. Check the webhook logs in Directus Settings → Webhooks → (your webhook) → Activity
3. Verify the response status is 200
4. Visit your blog to confirm the content updated immediately

### 4. Webhook Endpoint Details

The revalidation endpoint supports the following request formats:

#### Minimal Request
```json
{
  "collection": "cms_blog_posts"
}
```
Revalidates: `/blog` and all blog posts

#### Specific Post
```json
{
  "collection": "cms_blog_posts",
  "slug": "my-post-slug"
}
```
Revalidates: `/blog` and `/blog/my-post-slug`

#### Custom Tags/Paths
```json
{
  "tags": ["blog-posts", "blog-post-my-slug"],
  "paths": ["/blog", "/blog/my-slug"]
}
```
Revalidates specified cache tags and paths

## Troubleshooting

### Webhook Returns 401 Unauthorized
- Verify `REVALIDATE_SECRET` is set in your environment
- Check that the `x-revalidate-secret` header matches the environment variable

### Webhook Returns 500 Internal Server Error
- Check your application logs for detailed error messages
- Verify the request body format is valid JSON
- Ensure the slug exists in the request when provided

### Content Not Updating Immediately
- Verify the webhook is active in Directus
- Check webhook activity logs for successful executions
- Confirm cache tags match between webhook payload and your code
- Clear your browser cache if testing locally

### Webhook Not Working at All
- Ensure you removed `output: 'export'` from `next.config.js`
- Verify your hosting platform supports Next.js API routes
- Check that the endpoint is accessible: `GET https://your-domain.com/api/revalidate`

## Security Considerations

1. **Keep the secret token secure** - never commit it to version control
2. **Use HTTPS** - ensure webhook requests are encrypted
3. **Validate the secret** - the endpoint rejects requests without valid authentication
4. **Monitor webhook activity** - regularly check Directus webhook logs for suspicious activity
5. **Rotate secrets periodically** - update the token every 90 days as a security best practice

## Additional Resources

- [Next.js On-Demand Revalidation](https://nextjs.org/docs/app/building-your-application/data-fetching/incremental-static-regeneration#on-demand-revalidation)
- [Directus Webhooks Documentation](https://docs.directus.io/app/webhooks.html)
- [Next.js API Routes](https://nextjs.org/docs/app/building-your-application/routing/route-handlers)
