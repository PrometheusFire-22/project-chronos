# Directus Public Permissions Setup

**CMS URL**: https://admin.automatonicai.com
**Purpose**: Allow public read access to CMS content for website

---

## 🎯 Why This Is Needed

Your website fetches content from Directus CMS. Currently, API calls return **403 Forbidden** because the **Public** role doesn't have read permissions.

After this setup:
- ✅ Website can fetch homepage hero content
- ✅ Website can display features, use cases, etc.
- ✅ Visitors can submit waitlist forms
- ❌ Public still can't edit or delete anything (secure!)

---

## 📋 Step-by-Step Setup

### Step 1: Log into Directus Admin

Visit: **https://admin.automatonicai.com/admin**

Login with your admin credentials.

### Step 2: Navigate to Permissions

1. Click **Settings** (gear icon in sidebar)
2. Click **Roles & Permissions**
3. Click **Public** role

### Step 3: Set Collection Permissions

For each collection below, click it and enable the specified permissions:

#### `cms_homepage_hero`
- ✅ **Read** - Enable
- Item Permissions: Leave as "All Items"

#### `cms_features`
- ✅ **Read** - Enable
- Item Permissions: Leave as "All Items"

**Note**: This collection contains multiple categories:
- `problem-point` (3 items)
- `solution-pillar` (4 items)
- `key-feature` (6-9 items)
- `use-case` (4-6 items)
- `features-detail` (for /features page)
- `about-section` (for /about page values)

All use the same collection, so one permission grants access to all.

#### `cms_blog_posts`
- ✅ **Read** - Enable
- Item Permissions: Custom → Only show `status = published`

**Custom Filter**:
```json
{
  "status": {
    "_eq": "published"
  }
}
```

#### `cms_docs_pages`
- ✅ **Read** - Enable
- Item Permissions: Custom → Only show `status = published`

**Custom Filter**:
```json
{
  "status": {
    "_eq": "published"
  }
}
```

#### `cms_announcements`
- ✅ **Read** - Enable
- Item Permissions: Custom → Only show `active = true`

**Custom Filter**:
```json
{
  "active": {
    "_eq": true
  }
}
```

#### `cms_legal_pages`
- ✅ **Read** - Enable
- Item Permissions: Custom → Only show `status = published`

**Custom Filter**:
```json
{
  "status": {
    "_eq": "published"
  }
}
```

#### `cms_waitlist_submissions`
- ✅ **Create** - Enable (for form submissions)
- ❌ **Read** - Disable (keep submissions private)
- ❌ **Update** - Disable
- ❌ **Delete** - Disable

**Field Permissions** (for Create):
Enable these fields for public submission:
- ✅ `email`
- ✅ `first_name`
- ✅ `last_name`
- ✅ `company`
- ✅ `role`
- ✅ `heard_from`
- ✅ `source`
- ✅ `utm_source`
- ✅ `utm_medium`
- ✅ `utm_campaign`

System fields (auto-set by Directus):
- `id` - Auto-generated
- `date_created` - Auto-set
- `status` - Set by API route to 'pending'
- `email_sent` - Set by API route to false

### Step 4: Save Changes

Click **"Save"** in the top right corner.

---

## ✅ Verify Permissions

### Test API Access

Open your browser and test these URLs:

**Homepage Hero**:
```
https://admin.automatonicai.com/items/cms_homepage_hero?filter[active][_eq]=true
```

Should return: JSON data (not 403 error)

**Features**:
```
https://admin.automatonicai.com/items/cms_features?filter[enabled][_eq]=true&sort=sort_order
```

Should return: Array of feature items

**Waitlist Submission** (test via your website form or API):
```
POST https://admin.automatonicai.com/items/cms_waitlist_submissions
```

Should accept: POST requests with form data

---

## 🔒 Security Considerations

### What's Safe

✅ **Public READ on CMS content** - Safe, this is static marketing content
✅ **Public CREATE on waitlist** - Safe, this is a contact form
✅ **Filtered queries** - Only published/active items visible

### What's Protected

❌ **Draft content** - Not visible (status ≠ published)
❌ **Admin fields** - Not editable by public
❌ **User data** - Not readable by public
❌ **System collections** - No access

### Recommended Security

1. **Rate limiting** - Enable Cloudflare rate limiting for /api/waitlist
2. **Honeypot field** - Add to waitlist form (already implemented)
3. **CAPTCHA** (optional) - For high-traffic sites
4. **Email verification** - Add to waitlist workflow (future)

---

## 🚨 Troubleshooting

### Still Getting 403 Errors

**Check**:
1. Public role has READ permission on collection
2. No custom item filters blocking all items
3. Field permissions allow reading required fields
4. Collection access level is set to "All Items" (or custom filter is correct)

**Directus Logs**:
- Settings → Logs → Activity
- Check recent access attempts

### Waitlist Form Not Working

**Check**:
1. Public role has CREATE on `cms_waitlist_submissions`
2. All required fields are enabled for create
3. API route at `/api/waitlist` is deployed
4. No CORS errors in browser console

**Test with curl**:
```bash
curl -X POST https://admin.automatonicai.com/items/cms_waitlist_submissions \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "first_name": "Test",
    "last_name": "User",
    "source": "homepage",
    "status": "pending",
    "email_sent": false
  }'
```

Should return: 200 with created item data

---

## 📊 After Setup

Once permissions are set and website is deployed:

1. **Visit your site**: https://chronos-web-44q.pages.dev
2. **Verify homepage loads** with Directus content
3. **Check features page** displays CMS data
4. **Test waitlist form** submission
5. **Check Directus** for received submission

---

## 🎯 Next Steps

After permissions are working:

1. ✅ **Populate content** (if not already done)
   - Use scripts in `/scripts/populate-*-content.ts`
   - Or manually add via Directus admin

2. ✅ **Test all pages**
   - Homepage: Hero, problem, solution, features, use cases, waitlist
   - Features: Details, comparison
   - About: Story, values, team

3. ✅ **Set up custom domain**
   - Cloudflare Pages → Custom domains
   - Point `automatonicai.com` to Pages

4. ✅ **Enable monitoring**
   - Sentry already configured
   - Cloudflare Analytics automatic

---

**Done!** Your CMS is now publicly accessible for read operations and waitlist submissions. 🎉
