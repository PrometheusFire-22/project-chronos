# Monorepo Quick Start Guide

**Quick reference for common tasks**

## Daily Development

### Starting Development

```bash
# Start Next.js dev server (runs on port 3000)
pnpm exec nx run web:dev

# Or use the shorter alias
pnpm dev:web
```

### Importing Shared Code

```typescript
// In any file in apps/web/
import { Button } from '@chronos/ui/components/button'
import { formatCurrency } from '@chronos/utils/formatting'
import { User } from '@chronos/types'
```

## Adding New Code

### Add a New UI Component

1. Create file in `packages/ui/components/my-component.tsx`
2. Export it from `packages/ui/index.tsx`
3. Use it: `import { MyComponent } from '@chronos/ui/components/my-component'`

### Add a New Utility Function

1. Add to appropriate file in `packages/utils/`
2. Export from that file's `index.ts`
3. Use it: `import { myFunction } from '@chronos/utils/formatting'`

### Add a New Type

1. Add to appropriate file in `packages/types/`
2. Export from that file's `index.ts`
3. Use it: `import { MyType } from '@chronos/types/api'`

## Common Issues

### "Cannot find module '@chronos/...'"

**Fix:** Restart your TypeScript server
- VS Code: Cmd+Shift+P → "TypeScript: Restart TS Server"

### Import not working

**Check:**
1. Is the file exported from the package's `index.ts`?
2. Is the path alias in `tsconfig.json`?
3. Did you restart TypeScript server?

## Useful Commands

```bash
# See project structure
pnpm exec nx graph

# Build everything
pnpm exec nx run-many --target=build

# Build only changed code
pnpm exec nx affected:build

# List all packages
pnpm list -r --depth 0
```

## File Organization

```
When creating new files, put them in:

UI Components     → packages/ui/components/
Utilities         → packages/utils/
Types             → packages/types/
App Pages         → apps/web/app/
App Components    → apps/web/components/
```

## Getting Help

See the full guide: `monorepo_guide.md`
