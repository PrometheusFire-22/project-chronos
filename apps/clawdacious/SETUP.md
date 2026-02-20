# Clawdacious — Setup & Follow-up Guide

## What Was Done

The `apps/clawdacious/` app was created inside the existing Project Chronos Nx monorepo by forking `apps/web/` and stripping it down to a lean consulting website.

### Architecture

```
project-chronos/
├── apps/
│   ├── web/              ← Original Chronos app (untouched)
│   └── clawdacious/      ← NEW — Clawdacious consulting site
├── packages/
│   └── ui/               ← Shared shadcn/ui components (@chronos/ui)
└── ...
```

Both apps share:
- The `@chronos/ui` package (button, card, input, label, badge, sheet, skeleton)
- The same Directus CMS instance at `admin.automatonicai.com`
- The same R2 bucket (`chronos-media`) for blog images / DAM
- The same Resend account for transactional email

### What Was Stripped

Removed from the fork (original `apps/web/` untouched):
- **Auth system** — BetterAuth, login/signup/settings pages, middleware protection
- **Analytics** — D3, Recharts, economic analytics dashboard
- **Geo/Maps** — Leaflet, MapLibre, react-simple-maps, topojson, GeoJSON data
- **Document upload** — react-dropzone, extraction APIs
- **Sentry** — instrumentation, error tracking
- **Chronos-specific pages** — features, solutions, docs, careers, changelog, community, help, integrations, partners, security, status
- **Database access** — drizzle-orm, pg, postgres, Hyperdrive binding

### What Remains

| Route | Description |
|-------|-------------|
| `/` | CMS-driven landing page (hero + features + CTA) |
| `/blog` | Blog listing from `claw_blog_posts` |
| `/blog/[slug]` | Blog post detail |
| `/about` | About page from `claw_about_hero` + `claw_about_values` |
| `/contact` | Contact form → Resend email to geoff@clawdacious.com |
| `/privacy` | Privacy policy |
| `/terms` | Terms of service |
| `/api/contact` | Contact form API endpoint |

### Directus Collections

The app uses `claw_*` prefixed collections (separate from the existing `cms_*` ones):

| Collection | Type | Purpose |
|---|---|---|
| `claw_homepage_hero` | singleton | Landing page hero headline + CTAs |
| `claw_homepage_features` | collection | Feature/service cards on homepage |
| `claw_blog_posts` | collection | Blog posts |
| `claw_about_hero` | singleton | About page hero |
| `claw_about_values` | collection | About page value cards |
| `claw_cta_sections` | collection | Reusable CTA blocks |
| `claw_page_sections` | collection | Reusable page sections |
| `claw_legal_pages` | collection | Legal page content |
| `claw_announcements` | collection | Banner announcements |

### Branding

- **Colors**: Red/coral accent (#E85D5D / #FF6B6B) on dark background (#0F1117) — matches OpenClaw design system
- **Logo**: Cornelius mascot (`public/logos/cornelius-consierge.png`)
- **Fonts**: Poppins (sans) + JetBrains Mono (mono)

---

## Follow-up Steps (Manual)

### 1. Create Directus Collections

Log into `admin.automatonicai.com` and create each `claw_*` collection listed above. They mirror the field structure of their `cms_*` counterparts.

Key fields for each (refer to `lib/directus/types.ts` for full Zod schemas):

**`claw_homepage_hero`** (singleton):
- `headline` (string), `subheadline` (text), `primary_cta_text` (string), `primary_cta_url` (string), `secondary_cta_text` (string), `secondary_cta_url` (string), `status` (string)

**`claw_homepage_features`** (collection):
- `title` (string), `description` (text), `icon` (string — Lucide icon name), `sort` (integer), `status` (string)

**`claw_blog_posts`** (collection):
- `title`, `slug` (unique), `content` (rich text), `excerpt`, `featured_image`, `author`, `published_at` (datetime), `status`, `tags` (json), `meta_title`, `meta_description`, `og_image`, `created_at`, `updated_at`

**`claw_about_hero`** (singleton):
- `headline`, `subheadline`, `status`

**`claw_about_values`** (collection):
- `title`, `description`, `icon` (string, nullable), `sort`, `status`

**`claw_cta_sections`** (collection):
- `page` (string), `headline`, `subheadline`, `cta_text`, `cta_url`, `sort`, `status`

**`claw_page_sections`** (collection):
- `page` (string), `section_key` (string), `headline`, `subheadline`, `content` (text), `sort`, `status`

**`claw_legal_pages`** (collection):
- `slug` (unique), `title`, `content` (rich text), `last_updated` (date), `status`

**`claw_announcements`** (collection):
- `message`, `link_text`, `link_url`, `type` (string), `active` (boolean), `start_date`, `end_date`, `status`

### 2. Create Directus Role & Token

1. In Directus Admin → Settings → Roles, create a new role: **"Clawdacious Public"**
2. Grant **read-only** access to all `claw_*` collections
3. Generate a static API token for this role
4. This token goes in `NEXT_PUBLIC_DIRECTUS_KEY`

### 3. Set Up Environment Variables

Copy `.env.example` → `.env.local`:

```bash
cp apps/clawdacious/.env.example apps/clawdacious/.env.local
```

Fill in:
- `NEXT_PUBLIC_DIRECTUS_KEY` — the token from step 2
- `RESEND_API_KEY` — your Resend API key (same one used by Chronos, or a new one)

### 4. Verify Resend Domain

If `clawdacious.com` isn't already verified in Resend:
1. Go to https://resend.com/domains
2. Add `clawdacious.com`
3. Add the DNS records (SPF, DKIM, DMARC) to Cloudflare
4. The contact form sends from `noreply@clawdacious.com` to `geoff@clawdacious.com`

### 5. Local Development

```bash
# From monorepo root
pnpm install
pnpm nx dev clawdacious
# → http://localhost:3001
```

The app has static fallback content for all CMS-driven pages, so it works even without Directus collections populated.

### 6. Cloudflare Pages Deployment

1. **Create project** in Cloudflare Pages dashboard:
   - Name: `clawdacious`
   - Connect to GitHub repo
   - Build command: `pnpm nx run clawdacious:pages:build`
   - Build output: `apps/clawdacious/.open-next`
   - Root directory: (leave blank — it's a monorepo)

2. **Environment variables** in Cloudflare:
   ```
   NEXT_PUBLIC_SITE_URL = https://clawdacious.com
   NEXT_PUBLIC_DIRECTUS_URL = https://admin.automatonicai.com
   NEXT_PUBLIC_DIRECTUS_KEY = <token-from-step-2>
   RESEND_API_KEY = <resend-key>
   R2_PUBLIC_URL = https://pub-060e43df09e3ec3a256a6624ab7649f8.r2.dev
   ```

3. **Custom domain**: Add `clawdacious.com` in Pages → Custom Domains

4. **R2 binding**: In Pages → Settings → Functions → R2 bucket bindings:
   - Variable name: `MEDIA`
   - Bucket: `chronos-media`

### 7. Populate Content

After deployment, populate the `claw_*` collections in Directus:

1. **Homepage hero** — your headline, subheadline, and CTA buttons
2. **Homepage features** — 3-6 service cards (AI Assistant Setup, Ongoing Support, Custom Integration, etc.)
3. **About hero + values** — your story and business values
4. **First blog post** (optional — homepage works without any posts)

### 8. Update Favicons (Optional)

The current favicons in `public/favicons/` are inherited from Chronos. To update:
1. Use https://realfavicongenerator.net/ with the Cornelius avatar
2. Replace all files in `public/favicons/` and `public/favicon.ico`

---

## File Structure

```
apps/clawdacious/
├── app/
│   ├── layout.tsx                    # Root layout (metadata, fonts, theme)
│   ├── not-found.tsx                 # 404 page
│   ├── globals.css                   # CSS variables (red/coral theme)
│   ├── api/contact/route.ts          # Contact form → Resend
│   └── (frontend)/
│       ├── layout.tsx                # Header + Footer wrapper
│       ├── page.tsx                  # Homepage (CMS-driven)
│       ├── about/page.tsx            # About page
│       ├── blog/page.tsx             # Blog listing
│       ├── blog/[slug]/page.tsx      # Blog detail
│       ├── contact/page.tsx          # Contact form
│       ├── privacy/page.tsx          # Privacy policy
│       └── terms/page.tsx            # Terms of service
├── components/
│   ├── layout/Header.tsx             # Nav + "Get a Quote" CTA
│   ├── layout/Footer.tsx             # Footer
│   ├── ThemeToggle.tsx               # Dark/light mode toggle
│   └── providers/ThemeProvider.tsx    # next-themes provider
├── lib/
│   ├── directus/client.ts            # Directus fetch client
│   ├── directus/collections.ts       # claw_* getter functions
│   ├── directus/types.ts             # Zod schemas
│   ├── directus/index.ts             # Barrel exports
│   └── content-renderer.ts           # Markdown → HTML for blog
├── public/
│   ├── logos/cornelius-consierge.png  # Cornelius mascot
│   ├── favicons/                     # Favicon set
│   ├── favicon.ico
│   └── _headers                      # Cloudflare caching + CSP
├── .env.example                      # Environment template
├── middleware.ts                      # Empty (no auth)
├── next.config.js                    # Next.js config (Nx wrapper)
├── tailwind.config.js                # Tailwind with red/coral brand
├── wrangler.toml                     # Cloudflare Pages config
├── project.json                      # Nx project config
├── package.json                      # Dependencies
└── tsconfig.json                     # TypeScript config
```
