# Full-Stack Development Environment Setup Plan

## Overview

Transform Project Chronos into a production-ready monorepo combining Python backend + Next.js frontend using industry best practices: **Turborepo + pnpm + fnm**.

**Key Decisions:**
- ✅ Monorepo Structure: `apps/` (deployable) + `packages/` (shared)
- ✅ Node Version Manager: **fnm** (fast, Rust-based)
- ✅ Package Manager: **pnpm** (disk-efficient, strict)
- ✅ Monorepo Tool: **Turborepo** (Vercel-native)
- ✅ Node.js Version: **20 LTS** (maintained until 2026)
- ✅ Python Location: **KEEP in `src/chronos/`** (minimal disruption)

**What We're Building:**
```
apps/web/           → Next.js marketing site (Phase 1)
packages/ui/        → Shared shadcn/ui components
packages/config/    → Shared TypeScript/ESLint/Tailwind configs
src/chronos/        → Python backend (UNCHANGED)
```

---

## Critical Files to Create/Modify

### 1. Node.js Environment Files (NEW)

**`.node-version`** - fnm version selector
```
20
```

**`.npmrc`** - pnpm configuration
```ini
auto-install-peers=true
shamefully-hoist=false
strict-peer-dependencies=true
node-linker=isolated
store-dir=~/.pnpm-store
```

**`pnpm-workspace.yaml`** - Workspace definition
```yaml
packages:
  - 'apps/*'
  - 'packages/*'
  - 'marketing/scripts'
```

**`turbo.json`** - Build pipeline orchestration
```json
{
  "$schema": "https://turbo.build/schema.json",
  "pipeline": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": [".next/**", "dist/**"]
    },
    "dev": {
      "cache": false,
      "persistent": true
    },
    "lint": {},
    "type-check": {},
    "test": {}
  }
}
```

---

### 2. Root `package.json` (UPDATE)

Transform existing minimal package.json into workspace orchestrator:

```json
{
  "name": "project-chronos",
  "version": "2.0.0",
  "private": true,
  "type": "module",
  "engines": {
    "node": ">=20.0.0",
    "pnpm": ">=8.0.0"
  },
  "packageManager": "pnpm@8.15.0",
  "scripts": {
    "dev": "turbo run dev",
    "dev:web": "turbo run dev --filter=@chronos/web",
    "build": "turbo run build",
    "lint": "turbo run lint",
    "type-check": "turbo run type-check"
  },
  "devDependencies": {
    "turbo": "^1.11.0",
    "typescript": "^5.3.3",
    "prettier": "^3.1.0"
  }
}
```

---

### 3. Dev Container Updates (MODIFY)

**`.devcontainer/Dockerfile`** - Add Node.js environment (after line 57):

```dockerfile
# ==============================================================================
# Node.js Environment (for Next.js development)
# ==============================================================================

# Install fnm (Fast Node Manager)
RUN curl -fsSL https://fnm.vercel.app/install | bash -s -- --install-dir /usr/local/bin --skip-shell

# Install Node.js 20 LTS
RUN /usr/local/bin/fnm install 20 && /usr/local/bin/fnm default 20

# Add to PATH
ENV PATH="/home/vscode/.local/share/fnm/node-versions/v20-latest/bin:${PATH}"

# Install pnpm globally
RUN npm install -g pnpm@8.15.0

# Verify installations
RUN node --version && pnpm --version
```

**`.devcontainer/devcontainer.json`** - Add port forwarding and install command:

```json
{
  "forwardPorts": [5432, 3000, 3001, 5050, 8025],
  "portsAttributes": {
    "3000": {
      "label": "Next.js",
      "onAutoForward": "notify"
    }
  },
  "postCreateCommand": "pip install -e . --no-deps && pre-commit install && pnpm install"
}
```

---

### 4. Next.js App Setup (NEW)

**`apps/web/package.json`**:
```json
{
  "name": "@chronos/web",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev -p 3001",
    "build": "next build",
    "lint": "next lint",
    "type-check": "tsc --noEmit"
  },
  "dependencies": {
    "next": "^14.0.4",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "@chronos/ui": "workspace:*",
    "framer-motion": "^10.16.16"
  },
  "devDependencies": {
    "@types/react": "^18.2.45",
    "tailwindcss": "^3.4.0",
    "typescript": "^5.3.3"
  }
}
```

**`apps/web/next.config.js`**:
```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    serverActions: true,
  },
  env: {
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3001',
  },
};

module.exports = nextConfig;
```

**`apps/web/tailwind.config.ts`** - Brand colors:
```typescript
import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: ['class'],
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    '../../packages/ui/components/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#8B5CF6',  // Purple
        },
        accent: {
          DEFAULT: '#06B6D4',  // Teal
        },
        success: {
          DEFAULT: '#10B981',  // Green
        },
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
};

export default config;
```

**`apps/web/tsconfig.json`**:
```json
{
  "extends": "@chronos/config/typescript/nextjs.json",
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx"],
  "exclude": ["node_modules"]
}
```

---

### 5. Shared Packages (NEW)

**`packages/config/typescript/base.json`**:
```json
{
  "$schema": "https://json.schemastore.org/tsconfig",
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "lib": ["ES2022"],
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "resolveJsonModule": true
  }
}
```

**`packages/config/typescript/nextjs.json`**:
```json
{
  "extends": "./base.json",
  "compilerOptions": {
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "jsx": "preserve",
    "plugins": [{"name": "next"}],
    "isolatedModules": true
  }
}
```

**`packages/ui/package.json`** - Shared UI components:
```json
{
  "name": "@chronos/ui",
  "version": "0.1.0",
  "private": true,
  "exports": {
    "./components/*": "./components/*.tsx",
    "./lib/*": "./lib/*.ts"
  },
  "dependencies": {
    "@radix-ui/react-slot": "^1.0.2",
    "class-variance-authority": "^0.7.0",
    "clsx": "^2.0.0",
    "tailwind-merge": "^2.2.0"
  },
  "peerDependencies": {
    "react": "^18.2.0"
  }
}
```

**`packages/ui/lib/utils.ts`**:
```typescript
import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
```

---

### 6. Environment Variables (UPDATE)

**`.env.example`** - Add Next.js section:
```bash
# Next.js Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3001
NEXT_PUBLIC_API_URL=http://localhost:8000
DATABASE_URL=postgresql://${DATABASE_USER}:${DATABASE_PASSWORD}@${DATABASE_HOST}:${DATABASE_PORT}/${DATABASE_NAME}

# Email (Resend)
RESEND_API_KEY=your_resend_api_key
RESEND_FROM_EMAIL=noreply@projectchronos.com
```

**`apps/web/.env.local.example`**:
```bash
NEXT_PUBLIC_APP_URL=http://localhost:3001
NEXT_PUBLIC_API_URL=http://localhost:8000
DATABASE_URL=postgresql://user:pass@timescaledb:5432/chronos_db
```

---

### 7. Documentation (NEW)

**`docs/architecture/adrs/adr_017_fullstack_dev_environment.md`** - Complete ADR documenting:
- Monorepo architecture decision
- Technology choices (fnm, pnpm, Turborepo)
- Migration strategy
- Development workflow
- Testing approach
- Deployment process

---

### 8. Other Updates

**`.gitignore`** - Add Node.js patterns:
```gitignore
# Node.js
node_modules/
.next/
.turbo/
.pnpm-store/
*.tsbuildinfo
next-env.d.ts
.env.local
```

---

## Implementation Steps

### Phase 1: Foundation (Day 1)

1. **Create Node.js environment files**:
   ```bash
   # Create .node-version, .npmrc, pnpm-workspace.yaml, turbo.json
   ```

2. **Update Dockerfile** (add fnm + Node.js 20 + pnpm):
   - Insert Node.js section after line 57
   - Verify: `node --version`, `pnpm --version`

3. **Update devcontainer.json**:
   - Add port 3001 to forwardPorts
   - Update postCreateCommand to run `pnpm install`

4. **Rebuild Dev Container**:
   ```bash
   # In VS Code: Cmd+Shift+P → "Dev Containers: Rebuild Container"
   ```

5. **Verify installations**:
   ```bash
   node --version    # v20.x.x
   pnpm --version    # 8.15.x
   fnm --version     # 1.x.x
   ```

---

### Phase 2: Monorepo Structure (Day 1)

1. **Create directories**:
   ```bash
   mkdir -p apps/{web,portal}
   mkdir -p packages/{ui,config,types}/{components,lib,typescript,eslint,tailwind}
   mkdir -p tools/scripts
   ```

2. **Update root package.json** (add workspace scripts)

3. **Install root dependencies**:
   ```bash
   pnpm install
   ```

4. **Verify workspace**:
   ```bash
   pnpm list -r --depth 0
   ```

---

### Phase 3: Shared Configs (Day 1-2)

1. **Create TypeScript configs**:
   - `packages/config/typescript/base.json`
   - `packages/config/typescript/nextjs.json`
   - `packages/config/typescript/library.json`

2. **Create package.json for config package**

3. **Verify config package**:
   ```bash
   pnpm --filter=@chronos/config list
   ```

---

### Phase 4: Next.js App (Day 2-3)

1. **Initialize Next.js**:
   ```bash
   cd apps/web
   pnpm create next-app@latest . --typescript --tailwind --app --no-src-dir
   ```

2. **Configure files**:
   - Update `package.json` (port 3001)
   - Update `next.config.js`
   - Update `tailwind.config.ts` (brand colors)
   - Update `tsconfig.json` (extend shared config)

3. **Test dev server**:
   ```bash
   pnpm dev
   # Visit http://localhost:3001
   ```

---

### Phase 5: Shared UI Package (Day 3)

1. **Create UI package structure**:
   - `packages/ui/package.json`
   - `packages/ui/lib/utils.ts`
   - `packages/ui/components/button.tsx` (shadcn/ui)

2. **Install UI dependencies**:
   ```bash
   pnpm --filter=@chronos/ui install
   ```

3. **Test import in apps/web**:
   ```tsx
   import { Button } from '@chronos/ui/components/button';
   ```

---

### Phase 6: Asset Integration (Day 3)

1. **Create symlinks**:
   ```bash
   cd apps/web/public
   ln -s ../../../marketing/assets/favicons favicons
   ln -s ../../../marketing/assets/illustrations illustrations
   ln -s ../../../marketing/assets/logos logos
   ```

2. **Test image loading**:
   ```tsx
   <Image src="/illustrations/hero-dark.svg" alt="Hero" width={800} height={600} />
   ```

---

### Phase 7: Documentation & Cleanup (Day 4)

1. **Create ADR-017** (full architecture document)

2. **Update .env files** (add Next.js vars)

3. **Update .gitignore** (add Node.js patterns)

4. **Delete empty directories**:
   ```bash
   rm -rf frontend/
   ```

5. **Commit everything**:
   ```bash
   git add .
   git commit -m "feat: establish monorepo with Turborepo + pnpm"
   ```

---

### Phase 8: Validation (Day 4)

1. **Test full stack**:
   ```bash
   docker-compose up -d
   pnpm dev:web
   ```

2. **Verify all services**:
   - ✅ http://localhost:3000 (Next.js)
   - ✅ http://localhost:3001 (Metabase)
   - ✅ http://localhost:5050 (pgAdmin)
   - ✅ PostgreSQL on 5432

3. **Test hot reload** (edit component → see changes)

4. **Test Python** (unchanged):
   ```bash
   pytest tests/ -v
   ```

5. **Test Turborepo**:
   ```bash
   turbo run build
   turbo run lint
   ```

---

## Development Workflow

### Starting Everything

```bash
# Terminal 1: Start Docker services (database, etc.)
docker-compose up -d

# Terminal 2: Start Next.js dev server
pnpm dev:web

# Terminal 3: Start FastAPI (Phase 2)
uvicorn chronos.main:app --reload
```

### Common Commands

```bash
# Install dependency to specific workspace
pnpm --filter=@chronos/web add framer-motion

# Build everything
pnpm build

# Build specific app
pnpm build:web

# Lint all workspaces
pnpm lint

# Run tests
pytest tests/  # Python
pnpm test      # Node.js (future)
```

---

## Port Allocation

| Port | Service | Status |
|------|---------|--------|
| 5432 | PostgreSQL | Existing |
| 3000 | Metabase | Existing |
| **3001** | **Next.js** | **NEW** |
| 5050 | pgAdmin | Existing |
| 8025 | MailHog | Existing |
| 8000 | FastAPI | Phase 2 |

---

## Migration Safety

### What Changes

✅ **NEW directories**: `apps/`, `packages/`, `tools/`
✅ **NEW files**: `.node-version`, `.npmrc`, `pnpm-workspace.yaml`, `turbo.json`
✅ **UPDATED**: `Dockerfile`, `devcontainer.json`, `.gitignore`, `.env`
✅ **DELETED**: `frontend/` (empty directory)

### What Stays UNCHANGED

✅ **Python backend**: `src/chronos/` - ZERO changes
✅ **Database**: All schemas, migrations, data - UNTOUCHED
✅ **Docker services**: timescaledb, metabase, pgadmin - SAME
✅ **Python environment**: `.venv/`, `pyproject.toml` - PRESERVED

### Rollback Plan

If anything goes wrong:

```bash
# Option 1: Git reset (< 5 minutes)
git checkout develop
git branch -D feature/monorepo-setup
docker-compose down && docker-compose up -d

# Option 2: Selective rollback
git checkout develop -- Dockerfile .devcontainer/ apps/ packages/
```

**Data Loss Risk**: ZERO (database unchanged, Python unchanged)

---

## Success Criteria

### Week 1
- [ ] Dev Container starts with Node.js 20 + pnpm
- [ ] `pnpm dev` runs Next.js on port 3001
- [ ] Shared UI components import successfully
- [ ] Hot reload works
- [ ] Python tests still pass

### Week 2
- [ ] Homepage renders with brand colors
- [ ] Framer Motion animations work
- [ ] Marketing assets load correctly
- [ ] Responsive design works

### Week 3
- [ ] Vercel preview deployment succeeds
- [ ] Lighthouse score: 90+
- [ ] CI/CD pipeline passes
- [ ] Production deployment live

---

## Architecture Benefits

1. **Type Safety**: Shared TypeScript configs across all apps
2. **Code Reuse**: Shared UI components in `packages/ui/`
3. **Fast Builds**: Turborepo caching + incremental builds
4. **Disk Efficiency**: pnpm saves ~1GB via content-addressable storage
5. **Developer Experience**: Single `pnpm dev` command starts everything
6. **Scalability**: Easy to add `apps/portal/` in Phase 2
7. **Best Practices**: Industry-standard Vercel stack

---

## Next Steps After Implementation

1. **Build Homepage** (use marketing assets from `marketing/assets/`)
2. **Add Framer Motion Animations** (hero section, features)
3. **Implement Waitlist Form** (Resend integration)
4. **Deploy to Vercel** (connect GitHub repo)
5. **Setup CI/CD** (lint + type-check + build on PR)

---

## Critical Files List

Most important files to implement in order:

1. `.devcontainer/Dockerfile` - Adds Node.js environment
2. `pnpm-workspace.yaml` - Defines monorepo structure
3. `turbo.json` - Orchestrates builds
4. `apps/web/package.json` - Next.js app config
5. `.devcontainer/devcontainer.json` - Port forwarding
6. `apps/web/next.config.js` - Framework config
7. `apps/web/tailwind.config.ts` - Brand styling
8. `docs/architecture/adrs/adr_017_fullstack_dev_environment.md` - Documentation

---

## Final Notes

This architecture is designed for **solo founder velocity** while maintaining **production-grade quality**. The monorepo structure will serve you well from MVP through Series A and beyond.

**Timeline**: 3-4 days for full implementation
**Risk Level**: Low (isolated to new directories)
**Rollback Time**: < 5 minutes
**Breaking Changes**: Zero for Python backend

Ready to build! 🚀
