# Blog Setup Guide

## Overview

The blog feature requires at least one published blog post in Directus before the Next.js static build will succeed. This is a requirement of Next.js static export with dynamic routes.

## Why This Requirement Exists

With `output: 'export'` in next.config.js, Next.js generates static HTML files at build time. For dynamic routes like `/blog/[slug]`, it needs to know which pages to generate. The `generateStaticParams()` function provides this list by fetching blog posts from Directus.

If no blog posts exist, the function returns an empty array, and Next.js cannot determine what pages to build, causing a build error:
```
Error: Page "/blog/[slug]" is missing "generateStaticParams()" so it cannot be used with "output: export" config.
```

## Creating Your First Blog Post

### Method 1: Via Directus Admin UI (Recommended)

1. **Access Directus**
   - Navigate to https://admin.automatonicai.com
   - Log in with your admin credentials

2. **Navigate to Blog Posts**
   - Click on "Content" in the left sidebar
   - Select "Blog Posts" (cms_blog_posts collection)

3. **Create New Post**
   - Click the "+ Create Item" button
   - Fill in the required fields:

   **Required Fields:**
   - **Title**: "Getting Started with Chronos" (example)
   - **Slug**: "getting-started-with-chronos" (URL-friendly, auto-generated from title)
   - **Content**: Your blog post content in rich text format
   - **Author**: Your name or "Chronos Team"
   - **Status**: "published" (IMPORTANT: must be published, not draft)
   - **Published At**: Current date/time or scheduled publish date

   **Optional but Recommended:**
   - **Excerpt**: Short summary for previews (150-200 characters)
   - **Category**: "Announcements", "Insights", "Product Updates", etc.
   - **Tags**: Keywords for the post (e.g., "Launch", "Features", "Guide")
   - **Featured Image**: URL to header image
   - **OG Image**: URL to social sharing image
   - **Read Time (minutes)**: Estimated reading time
   - **Featured**: Toggle on for hero placement
   - **Meta Title**: SEO title (defaults to post title)
   - **Meta Description**: SEO description (defaults to excerpt)

4. **Save and Publish**
   - Click "Save" button
   - Ensure "Status" is set to "published"
   - Verify "Published At" date is not in the future

### Method 2: Sample Content SQL

If you have database access, you can insert a sample post directly:

```sql
INSERT INTO cms_blog_posts (
  id,
  title,
  slug,
  excerpt,
  content,
  author,
  category,
  tags,
  status,
  published_at,
  featured,
  read_time_minutes,
  created_at,
  updated_at
) VALUES (
  gen_random_uuid(),
  'Welcome to Chronos',
  'welcome-to-chronos',
  'Discover how Chronos transforms relationship intelligence in private markets.',
  '<p>Welcome to the Chronos blog! Here you''ll find insights, updates, and best practices for leveraging relationship intelligence in private markets.</p>',
  'Chronos Team',
  'Announcements',
  ARRAY['Launch', 'Welcome'],
  'published',
  NOW(),
  true,
  2,
  NOW(),
  NOW()
);
```

### Method 3: Via Directus API

```bash
curl -X POST https://admin.automatonicai.com/items/cms_blog_posts \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -d '{
    "title": "Welcome to Chronos",
    "slug": "welcome-to-chronos",
    "excerpt": "Discover how Chronos transforms relationship intelligence in private markets.",
    "content": "<p>Welcome to the Chronos blog!</p>",
    "author": "Chronos Team",
    "category": "Announcements",
    "tags": ["Launch", "Welcome"],
    "status": "published",
    "published_at": "'$(date -u +"%Y-%m-%dT%H:%M:%SZ")'",
    "featured": true,
    "read_time_minutes": 2
  }'
```

## Verifying the Blog Post

1. **Check Directus**
   - Navigate to the Blog Posts collection
   - Verify the post appears with status "published"
   - Confirm the published_at date is not in the future

2. **Test the Build**
   ```bash
   cd apps/web
   pnpm run build
   ```
   The build should now succeed and include your blog post in the route list.

3. **Preview Locally**
   ```bash
   pnpm run dev
   ```
   Navigate to `http://localhost:3000/blog` to see your post listed.

## Troubleshooting

### Build Still Fails After Creating Post

1. **Verify Post Status**
   - Ensure status is "published" (not "draft" or "archived")
   - Check that published_at is not null and not in the future

2. **Check Directus Connection**
   - Verify NEXT_PUBLIC_DIRECTUS_URL in .env.local
   - Test the API endpoint manually:
     ```bash
     curl "https://admin.automatonicai.com/items/cms_blog_posts?filter[status][_eq]=published"
     ```

3. **Clear Next.js Cache**
   ```bash
   rm -rf .next
   pnpm run build
   ```

### Blog Post Not Appearing

1. **Check Filters**
   - The blog pages only show posts with status="published"
   - Published_at must be <= current time
   - Draft posts are intentionally hidden

2. **Revalidate Cache**
   - Wait up to 1 hour for ISR cache to expire
   - Or trigger a new build to refresh content

## Blog Content Guidelines

### Content Format

The `content` field uses rich text format (HTML). You can use:

- **Headings**: `<h2>`, `<h3>` for section titles
- **Paragraphs**: `<p>` for text blocks
- **Lists**: `<ul>`, `<ol>` for bullet/numbered lists
- **Emphasis**: `<strong>`, `<em>` for bold/italic
- **Links**: `<a href="...">` for hyperlinks
- **Code**: `<code>` for inline code, `<pre>` for code blocks
- **Quotes**: `<blockquote>` for callouts
- **Images**: `<img src="..." alt="...">` for embedded images

### SEO Best Practices

- **Title**: 50-60 characters, includes primary keyword
- **Meta Description**: 150-160 characters, compelling summary
- **Excerpt**: 150-200 characters, distinct from meta description
- **Featured Image**: 1200x630px for optimal social sharing
- **OG Image**: Same as featured image or custom 1200x630px
- **Tags**: 3-5 relevant keywords
- **Category**: Single category for organization

### URL Slug Guidelines

- Lowercase letters only
- Use hyphens (-) not underscores
- Keep it short and descriptive
- Include primary keyword when possible
- Example: "private-market-insights-2025"

## Future Considerations

### Migrating Away from Static Export

If you need webhooks for instant content updates:

1. Remove `output: 'export'` from next.config.js
2. Deploy to a platform supporting Next.js server features
3. Enable the revalidation webhook (see DIRECTUS_WEBHOOKS.md)
4. Content updates will appear immediately instead of within 1 hour

### Adding Blog Features

Planned enhancements:
- Author profiles with avatars
- Related posts recommendations
- Comment system integration
- Newsletter signup CTA
- Social sharing buttons
- Reading progress indicator
- Table of contents for long posts
