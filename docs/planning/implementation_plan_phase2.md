# Phase 2 Implementation Plan: Infrastructure & Payload CMS

**Goal:** Establish the backend infrastructure (Database, Storage) and integrate Payload CMS to power the marketing site and future application.

## 1. AWS Infrastructure Setup (The Foundation)
**Owner:** User (with AI Guidance)
*   [ ] **PostgreSQL Provisioning**
    *   Create Postgres Database (Lightsail or RDS) in `us-east-1` (Virginia).
    *   Record Connection String (`postgres://user:pass@host:port/dbname`).
    *   **Crucial:** Ensure Vercel IP (or allow all `0.0.0.0/0` for now with strong password) can connect.
*   [ ] **S3 Bucket Provisioning**
    *   Create Bucket: `automatonic-assets-prod`
    *   Create Bucket: `automatonic-assets-dev`
    *   Create IAM User `payload-cms-user` with `S3FullAccess` (or scoped policy) to these buckets.
    *   Generate Access Keys (Key ID + Secret).
    *   Configure CORS policy to allow Vercel domain.

## 2. Payload CMS Integration (The Engine)
**Context:** We are using Payload 3.0 (Beta/Stable) integrated directly into `apps/web`.
*   [ ] **Installation**
    *   `pnpm add payload @payloadcms/next @payloadcms/db-postgres @payloadcms/storage-s3`
    *   Update `next.config.js` to use `withPayload`.
*   [ ] **Configuration (`payload.config.ts`)**
    *   Define **Database Adapter** (Connects to AWS Postgres).
    *   Define **Storage Adapter** (Connects to AWS S3).
    *   Define **Collections**:
        *   `Pages` (Marketing content)
        *   `Media` (DAM assets)
        *   `Users` (Admins)
*   [ ] **Environment Variables**
    *   Update `.env` in Vercel and Local with DB string and S3 Keys.

## 3. Local Development Environment (The Orchestrator)
**Goal:** Leverage existing `docker-compose.yml`.
*   [ ] **Configuration Only**
    *   No changes to `docker-compose.yml` required.
    *   Payload will run inside `apps/web` locally.
    *   Payload will connect to the existing `timescaledb` container (`postgres://DATABASE_USER:DATABASE_PASSWORD@timescaledb:5432/DATABASE_NAME`).


## 4. Payload Implementation Guide (Step-by-Step)

### A. Environment Variables (`apps/web/.env.local`)
Create this file with the following keys. **Do not commit secrets.**
```bash
# Infrastructure
POSTGRES_URL=postgres://chronos_local:password@localhost:5432/chronos_local
# Note: Inside docker, use 'timescaledb' host. Outside (local dev), use 'localhost'.
# Vercel will use the AWS connection string.

# Storage
S3_ACCESS_KEY_ID=...
S3_SECRET_ACCESS_KEY=...
S3_BUCKET=project-chronos-media-dev
S3_REGION=ca-central-1

# Payload
PAYLOAD_SECRET=... # Generate a random string
```

### B. Payload Configuration (`apps/web/payload.config.ts`)
Creates the CMS definition.
```typescript
import { buildConfig } from 'payload/config';
import { postgresAdapter } from '@payloadcms/db-postgres';
import { s3Adapter } from '@payloadcms/storage-s3';
import { lexicalEditor } from '@payloadcms/richtext-lexical';
import path from 'path';
import { Users } from './collections/Users';
import { Media } from './collections/Media';
import { Pages } from './collections/Pages';

export default buildConfig({
  admin: {
    user: Users.slug,
  },
  editor: lexicalEditor({}),
  collections: [Users, Media, Pages],
  secret: process.env.PAYLOAD_SECRET || '',
  typescript: {
    outputFile: path.resolve(__dirname, 'payload-types.ts'),
  },
  db: postgresAdapter({
    pool: {
      connectionString: process.env.POSTGRES_URL,
    },
  }),
  plugins: [
    s3Adapter({
      bucket: process.env.S3_BUCKET,
      config: {
        credentials: {
          accessKeyId: process.env.S3_ACCESS_KEY_ID,
          secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
        },
        region: process.env.S3_REGION,
      },
    }),
  ],
});
```

### C. Next.js Config (`apps/web/next.config.js`)
Wraps the application with Payload.
```javascript
import { withPayload } from '@payloadcms/next/withPayload';
// ... existing imports

const nextConfig = {
  // ... existing config
};

export default withPayload(
  composePlugins(...plugins)(nextConfig)
);
```
