# Directus WYSIWYG Editor Setup

## Problem
When editing content in Directus, you see raw HTML code like `<p>Text</p>` instead of a visual editor.

## Solution - FIXED! ✅
All rich text fields have been updated to use **"Input Rich Text MD"** (Markdown) interface, which provides:
- Visual toolbar with formatting buttons (Bold, Italic, Headings, Lists, etc.)
- Live preview of formatted text
- Support for both HTML and Markdown syntax
- Much better user experience for non-technical users

## What Was Changed

The following fields were updated from `input-rich-text-html` to `input-rich-text-md`:
- `cms_features.description`
- `cms_blog_posts.content`
- `cms_docs_pages.content`
- `cms_legal_pages.content`

## How to Use the Editor

The current interface is **"Input Rich Text MD"** which:
- Shows your existing HTML content properly
- Provides a formatting toolbar at the top
- Allows you to use Markdown syntax (optional)
- No longer shows raw HTML code

### Manual Configuration (if needed in future)

If you need to configure other fields:

1. Navigate to Data Model
   - Log in to Directus: https://admin.automatonicai.com
   - Click **Settings** (gear icon in sidebar)
   - Click **Data Model**

2. Edit the collection (e.g., cms_features)
   - Find and click the collection name
   - Find the field you want to edit
   - Click the field to edit it

3. Configure the Interface
   - **Interface**: Change to **"Input Rich Text MD"**
   - This provides a visual editor with toolbar instead of raw HTML

### 4. Save Changes
- Click the checkmark or "Save" button
- The field will now show a formatted editor when you edit features

## Expected Behavior

### Before Fix (Raw HTML Code)
You saw raw HTML code:
```html
<p>Multi-hop relationship traversal...</p>

<p><strong>Example:</strong> Find the path...</p>
```

### After Fix (Markdown Editor)
You now see:
- A visual editor with formatting toolbar
- "Multi-hop relationship traversal..." as formatted text
- Bold text properly displayed
- Proper paragraph breaks
- Formatting buttons: Bold (B), Italic (I), Headings, Lists, etc.
- Live preview of your content

## Editing Content Going Forward

1. Click on a feature in Directus
2. The description field will show a rich text editor
3. Make your changes using the formatting toolbar
4. Click "Save"
5. Changes will automatically trigger a webhook to rebuild the site (if configured)
6. Wait 2-3 minutes for the rebuild to complete
7. Check https://automatonicai.com/ to see your changes

## Automatic Rebuilds

✅ **Flows Configured!**

A Directus Flow is configured to automatically trigger Cloudflare Pages rebuilds when you:
- Create new content
- Update existing content
- Delete content

In the following collections:
- cms_announcements
- cms_blog_posts
- cms_docs_pages
- cms_features
- cms_homepage_hero
- cms_legal_pages

### Manual Rebuild (if needed)

If you need to manually trigger a rebuild:
```bash
curl -X POST 'https://api.cloudflare.com/client/v4/pages/webhooks/deploy_hooks/bbb1dec2-0e0e-4963-880e-9b91454f6d2c'
```

## Technical Details

- **Interface Type**: `input-rich-text-md` (Markdown with visual toolbar)
- **Database Field Type**: `text` (no database changes needed)
- **Flow Status**: Active and working
- **Flow Operation**: POST request to Cloudflare Pages webhook

## Troubleshooting

If edits still don't work:

1. **Check if edit saved**: Go back to the item list and reopen the item
2. **Check Flow status**: Settings → Flows → "Rebuild website on content update" should be "Active"
3. **Check rebuild triggered**: Look at Cloudflare Pages dashboard for new deployments
4. **Wait for deployment**: Rebuilds take 2-3 minutes to complete

## For Advanced Users: Installing Full WYSIWYG Extension

If you need a more advanced visual editor (like TinyMCE or CKEditor), you can install the Flexible Editor extension:

```bash
npm install directus-extension-flexible-editor
```

See: [Flexible Editor for Directus](https://github.com/formfcw/directus-extension-flexible-editor)

## Scripts Available

- `scripts/verify-directus-content.cjs` - Check current content in Directus
- `scripts/update-all-rich-text-fields.cjs` - Update interface settings for all rich text fields
- `scripts/check-field-config.cjs` - Inspect field configuration
- `scripts/check-flows.cjs` - Verify Flow and webhook configuration
