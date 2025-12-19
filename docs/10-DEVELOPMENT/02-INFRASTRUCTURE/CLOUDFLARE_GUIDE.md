# ☁️ Cloudflare Infrastructure Guide

This document details the configuration and operational procedures for Project Chronos on Cloudflare.

## 🚀 Cloudflare Pages Configuration

The web application is deployed using Cloudflare Pages with the following critical settings:

### Build & Deploy Settings
- **Build System Version**: `3` (Required for monorepo and modern pnpm support).
- **Root Directory**: `apps/web` (The Next.js application root).
- **Build Command**: `npx @cloudflare/next-on-pages`
- **Build Output Directory**: `.vercel/output/static`

### Compatibility Flags
- **nodejs_compat**: Enabled (Required for Next.js Node.js API support).
- **Compatibility Date**: `2024-11-18` (or later).

---

## 🔗 Resource Bindings

Cloudflare services are bound to the Pages project via the `wrangler.toml` file and confirmed in the Cloudflare Dashboard.

### 1. Database (Hyperdrive)
- **Binding Name**: `DB`
- **Hyperdrive ID**: `cbdc3f3e22f3454580f0d1ab56c9a1ea`
- **Purpose**: High-performance connection pooling to the AWS database.

### 2. Media (R2 Storage)
- **Binding Name**: `MEDIA`
- **Bucket Name**: `chronos-media`
- **Purpose**: Object storage for CMS assets and data exports.

---

## 🛠️ Local Development

To emulate the Cloudflare environment locally:

1. **Install Wrangler**: `pnpm install -g wrangler`
2. **Run Dev Server**:
   ```bash
   cd apps/web
   npx wrangler pages dev .next --compatibility-flag=nodejs_compat
   ```

---

## 🔒 Security & Governance

### GitGuardian Integration
GitGuardian is used to monitor the repository for leaked secrets.
- **Workflow**: All commits are scanned by GitGuardian before being pushed.
- **Pre-commit Hook**: (Planned) `ggshield` will block commits containing secrets.

### GitHub Guardrails
The following protection rules are recommended for `develop` and `main`:
- **Require PRs**: All changes must go through a code review.
- **Status Checks**: CI pipelines must pass before merging.
- **Restrict Force Pushes**: Disabled to prevent history overwrites (except for emergency cleanup).
