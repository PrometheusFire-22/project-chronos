# Developer Onboarding Guide

Welcome to Project Chronos! This guide will help you get up and running quickly.

## Prerequisites

- **Docker Desktop** installed and running
- **VS Code** with Dev Containers extension
- **Git** configured with your GitHub account
- **Basic knowledge** of TypeScript, React, and Next.js

## Getting Started (5 Minutes)

### Step 1: Clone the Repository

```bash
git clone https://github.com/PrometheusFire-22/project-chronos.git
cd project-chronos
```

### Step 2: Open in Dev Container

1. Open VS Code
2. Press `Cmd+Shift+P` (Mac) or `Ctrl+Shift+P` (Windows/Linux)
3. Select "Dev Containers: Reopen in Container"
4. Wait for container to build (~5 minutes first time)

### Step 3: Start Development Server

```bash
# Inside the dev container terminal
pnpm exec nx run web:dev
```

Visit http://localhost:3000 to see the app!

---

## Project Structure Overview

```
project-chronos/
├── apps/web/           # Next.js marketing site
├── packages/           # Shared code
│   ├── ui/            # UI components
│   ├── types/         # TypeScript types
│   ├── utils/         # Utilities
│   └── config/        # Configs
├── backend/           # Python FastAPI
├── docs/              # Documentation
└── marketing/         # Marketing assets
```

---

## Common Tasks

### Running the Dev Server

```bash
pnpm exec nx run web:dev
```

### Building for Production

```bash
pnpm exec nx run web:build
```

### Adding a New Component

```bash
# Install shadcn/ui component
npx shadcn-ui@latest add [component-name]

# Example: Add dialog
npx shadcn-ui@latest add dialog
```

### Creating a Feature Branch

```bash
git checkout -b feature/CHRONOS-XXX-description
```

### Committing Changes

```bash
# Use Gitmoji for commits
gitmoji -c

# Or manually
git commit -m "✨ feat(scope): description"
```

---

## Development Workflow

1. **Create JIRA ticket** for your work
2. **Create feature branch** from `develop`
3. **Make changes** and test locally
4. **Commit with Gitmoji** and JIRA reference
5. **Push** and create Pull Request
6. **Request review** from team
7. **Merge** to `develop` after approval

---

## Understanding the Monorepo

### What are the packages?

- **@chronos/ui** - Reusable UI components (buttons, cards, etc.)
- **@chronos/types** - Shared TypeScript types
- **@chronos/utils** - Utility functions (formatting, validation)
- **@chronos/config** - Shared configurations

### How do I use them?

```typescript
// Import from packages
import { Button } from '@chronos/ui/components/button'
import { formatCurrency } from '@chronos/utils/formatting'
import { User } from '@chronos/types'
```

### Where do I add new code?

- **UI components** → `packages/ui/components/`
- **Utilities** → `packages/utils/`
- **Types** → `packages/types/`
- **App pages** → `apps/web/app/`
- **App components** → `apps/web/components/`

---

## Useful Commands

```bash
# See project graph
pnpm exec nx graph

# List all packages
pnpm list -r --depth 0

# Run linter (when configured)
pnpm exec nx run web:lint

# Run tests (when configured)
pnpm exec nx run web:test

# Build only changed code
pnpm exec nx affected:build
```

---

## Troubleshooting

### Dev container won't start

1. Restart Docker Desktop
2. In VS Code: "Dev Containers: Rebuild Container"

### "Cannot find module '@chronos/...'"

1. Restart TypeScript server: `Cmd+Shift+P` → "TypeScript: Restart TS Server"
2. Check `tsconfig.json` has path aliases

### Port already in use

```bash
# Find process using port 3000
lsof -i :3000

# Kill the process
kill -9 [PID]
```

### Git pre-commit hooks failing

```bash
# Skip hooks temporarily (use sparingly)
git commit --no-verify -m "message"
```

---

## Resources

- **Monorepo Guide:** [docs/guides/development/monorepo-complete-guide.md](./monorepo-complete-guide.md)
- **Quick Start:** [docs/guides/development/monorepo-quick-start.md](./monorepo-quick-start.md)
- **ADR-017:** [docs/architecture/adrs/adr_017_nx_monorepo_tooling.md](../../architecture/adrs/adr_017_nx_monorepo_tooling.md)
- **Nx Documentation:** https://nx.dev/
- **Next.js Documentation:** https://nextjs.org/docs

---

## Getting Help

- **Slack:** #project-chronos channel
- **JIRA:** https://your-jira-instance.atlassian.net
- **GitHub Issues:** For bugs and feature requests

---

## Next Steps

1. Read the [Monorepo Complete Guide](./monorepo-complete-guide.md)
2. Explore the codebase
3. Try creating a simple component
4. Ask questions in Slack!

Welcome to the team! 🚀
