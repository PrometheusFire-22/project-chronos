# ADR-017: Nx Monorepo Tooling

**Status:** Accepted  
**Date:** 2025-12-12  
**Decision Makers:** Geoff Bevans  
**Related ADRs:** [ADR-012: Frontend Stack Architecture](adr_012_frontend_stack_architecture.md)

---

## Context

During the implementation of the monorepo structure for Project Chronos (as outlined in ADR-012), we needed to choose between **Turborepo** and **Nx** as our monorepo orchestration tool.

The original plan specified Turborepo, but after deeper evaluation of our project's complexity and long-term needs, we pivoted to Nx.

### Requirements

1. **TypeScript-First**: Strong TypeScript support across all packages
2. **Build Orchestration**: Efficient caching and task dependencies
3. **Scalability**: Support for growing number of apps and packages
4. **Next.js Integration**: First-class Next.js support
5. **Developer Experience**: Excellent tooling and IDE integration
6. **Project Boundaries**: Enforce architectural constraints
7. **Future-Proofing**: Ability to add more frameworks (React Native, etc.)

---

## Decision

We will use **Nx** as our monorepo orchestration tool instead of Turborepo.

---

## Comparison

### Turborepo vs Nx

| Feature | Turborepo | Nx | Winner |
|---------|-----------|-----|--------|
| **Setup Complexity** | Simple | Moderate | Turborepo |
| **TypeScript Support** | Good | Excellent | **Nx** |
| **Caching** | Excellent | Excellent | Tie |
| **Task Dependencies** | Basic | Advanced | **Nx** |
| **Project Boundaries** | None | Built-in | **Nx** |
| **Code Generators** | None | Built-in | **Nx** |
| **IDE Integration** | Basic | Nx Console | **Nx** |
| **Framework Plugins** | Generic | Framework-specific | **Nx** |
| **Affected Commands** | Basic | Advanced | **Nx** |
| **Visualization** | None | Project Graph | **Nx** |
| **Learning Curve** | Easy | Moderate | Turborepo |
| **Community** | Growing | Mature | **Nx** |

---

## Rationale

### Why Nx Over Turborepo

1. **Sophistication for Complex Projects**
   - Nx is designed for large-scale enterprise monorepos
   - Better suited for our multi-modal database platform with multiple apps/packages
   - Project boundaries prevent circular dependencies

2. **TypeScript Project References**
   - Nx has superior TypeScript support with automatic project reference management
   - Better type-checking across package boundaries
   - Faster IDE performance with proper project references

3. **Next.js Plugin**
   - `@nx/next` plugin provides Next.js-specific optimizations
   - Automatic configuration for build, dev, and export targets
   - Better integration with Next.js App Router

4. **Code Generators**
   - Built-in generators for creating new packages/apps
   - Ensures consistency across the monorepo
   - Can create custom generators for our patterns

5. **Project Graph Visualization**
   - Visual representation of package dependencies
   - Helps understand and manage complexity
   - Useful for onboarding new developers

6. **Affected Commands**
   - `nx affected:build` only builds changed packages
   - Critical for CI/CD optimization
   - Saves time and compute resources

7. **Future Extensibility**
   - Easy to add React Native app for mobile
   - Can add Electron app for desktop
   - Framework-agnostic core

### When Turborepo Would Be Better

Turborepo excels for:
- Simple monorepos (2-3 packages)
- Teams already using Vercel ecosystem exclusively
- Projects prioritizing simplicity over features
- Minimal configuration needs

**Our Decision:** Project Chronos is inherently complex (multi-modal database, multiple frontends, Python backend). We need Nx's sophistication.

---

## Implementation

### Current Structure

```
project-chronos/
├── apps/
│   └── web/                    # Next.js marketing site
├── packages/
│   ├── ui/                     # shadcn/ui components
│   └── config/                 # Shared TypeScript configs (NEW)
├── nx.json                     # Nx configuration
├── package.json                # Root workspace
└── pnpm-workspace.yaml         # pnpm workspaces
```

### Nx Configuration

**File:** `nx.json`
```json
{
  "$schema": "./node_modules/nx/schemas/nx-schema.json",
  "nxCloudId": "693a3a62afa88f57bc137da7",
  "plugins": [
    {
      "plugin": "@nx/next/plugin",
      "options": {
        "startTargetName": "start",
        "buildTargetName": "build",
        "devTargetName": "dev"
      }
    }
  ],
  "targetDefaults": {
    "build": {
      "cache": true,
      "dependsOn": ["^build"]
    }
  }
}
```

### Key Nx Features We're Using

1. **Nx Console** (VS Code extension)
   - Visual interface for running tasks
   - Project graph visualization
   - Generator UI

2. **Caching**
   - Local computation caching
   - Nx Cloud for distributed caching (optional)

3. **Task Dependencies**
   - `dependsOn: ["^build"]` ensures dependencies build first
   - Parallel execution where possible

4. **Project Tags**
   - `type:app`, `type:lib` for categorization
   - `scope:marketing`, `scope:portal` for domain boundaries

---

## Consequences

### Positive

✅ **Better Organization**: Project boundaries prevent architectural violations  
✅ **Faster Builds**: Affected commands only rebuild changed code  
✅ **Type Safety**: Superior TypeScript integration  
✅ **Scalability**: Can easily add more apps/packages  
✅ **Tooling**: Nx Console improves developer experience  
✅ **Future-Proof**: Can add React Native, Electron, etc.

### Negative

⚠️ **Learning Curve**: Nx has more concepts to learn than Turborepo  
⚠️ **Configuration**: More configuration files to maintain  
⚠️ **Complexity**: Might be overkill for very simple projects  

### Neutral

🔄 **Migration Path**: Can migrate to Turborepo later if needed (both use pnpm workspaces)  
🔄 **Vendor Lock-in**: Minimal - Nx is open-source, not tied to specific hosting

---

## Migration from Turborepo Plan

Since the original plan specified Turborepo, here's what changed:

| Original (Turborepo) | Actual (Nx) | Status |
|---------------------|-------------|--------|
| `turbo.json` | `nx.json` | ✅ Replaced |
| `turbo run dev` | `nx run web:dev` | ✅ Updated |
| No project boundaries | Tags + boundaries | ✅ Added |
| Basic caching | Advanced caching | ✅ Improved |
| No generators | Nx generators | ✅ Available |

---

## Best Practices

### 1. Use Project Tags

```json
// apps/web/project.json
{
  "tags": ["type:app", "scope:marketing"]
}
```

### 2. Define Task Dependencies

```json
// nx.json
{
  "targetDefaults": {
    "build": {
      "dependsOn": ["^build"]  // Build dependencies first
    }
  }
}
```

### 3. Use Affected Commands in CI

```bash
# Only test changed packages
nx affected:test

# Only build changed apps
nx affected:build
```

### 4. Leverage Nx Console

- Install Nx Console VS Code extension
- Use visual interface for common tasks
- View project graph regularly

---

## Success Metrics

- ✅ Nx installed and configured
- ✅ `nx run web:dev` starts Next.js successfully
- ✅ Project graph shows correct dependencies
- ✅ Build caching reduces rebuild times
- ✅ TypeScript project references working

---

## References

- [Nx Documentation](https://nx.dev/)
- [Nx vs Turborepo Comparison](https://nx.dev/concepts/turbo-and-nx)
- [Nx Next.js Plugin](https://nx.dev/packages/next)
- [Monorepo Best Practices](https://nx.dev/concepts/more-concepts/monorepo-nx-enterprise)

---

## Appendix: Commands Cheat Sheet

```bash
# Development
nx run web:dev                  # Start Next.js dev server
nx run-many --target=dev        # Start all dev servers

# Building
nx run web:build                # Build Next.js app
nx affected:build               # Build only changed apps

# Testing (future)
nx run web:test                 # Run tests for web app
nx affected:test                # Test only changed code

# Utilities
nx graph                        # View project graph
nx list                         # List installed plugins
nx show project web             # Show web project details

# Generators (future)
nx g @nx/next:component         # Generate Next.js component
nx g @nx/next:page              # Generate Next.js page
```

---

## Decision Log

- **2025-11-30**: ADR-012 specified Turborepo
- **2025-12-08**: Implemented Nx instead during monorepo setup
- **2025-12-12**: Documented decision in ADR-017 (this document)

**Rationale for Deviation:** After hands-on evaluation, Nx's sophistication better matches Project Chronos's complexity and long-term scalability needs.
