# Understanding Your Monorepo: A Complete Guide

**For:** Geoff (and future developers)  
**Purpose:** Explain the monorepo structure in plain English with practical examples  
**Last Updated:** 2025-12-12

---

## What is a Monorepo? (Simple Explanation)

A **monorepo** is like having one big organized closet instead of clothes scattered across multiple rooms.

**Before (Multiple Repos):**
```
project-chronos-frontend/     (separate repo)
project-chronos-backend/      (separate repo)
project-chronos-shared/       (separate repo)
```

**After (Monorepo):**
```
project-chronos/
├── apps/          # Your applications (websites, mobile apps)
├── packages/      # Shared code used by apps
└── backend/       # Python backend
```

**Benefits:**
- ✅ Share code easily between apps
- ✅ Make changes across multiple apps in one commit
- ✅ Consistent tooling and dependencies
- ✅ Easier to keep everything in sync

---

## Your Project Structure (Explained)

```
project-chronos/
│
├── apps/                           # DEPLOYABLE APPLICATIONS
│   └── web/                        # Next.js marketing site
│       ├── app/                    # Pages and routes
│       ├── components/             # Web-specific components
│       ├── public/                 # Static assets (symlinked)
│       └── project.json            # Nx configuration
│
├── packages/                       # SHARED CODE (reusable)
│   ├── ui/                         # UI components (buttons, cards, etc.)
│   │   ├── components/             # shadcn/ui components
│   │   ├── lib/                    # Utilities (cn function)
│   │   └── package.json
│   │
│   ├── config/                     # Shared configurations
│   │   ├── typescript/             # TypeScript configs
│   │   │   ├── base.json           # Base config
│   │   │   └── nextjs.json         # Next.js config
│   │   └── package.json
│   │
│   ├── types/                      # TypeScript type definitions
│   │   ├── api/                    # API types
│   │   ├── database/               # Database types
│   │   ├── common/                 # Common types
│   │   └── package.json
│   │
│   └── utils/                      # Utility functions
│       ├── formatting/             # Format dates, currency, etc.
│       ├── validation/             # Validate emails, URLs, etc.
│       ├── constants/              # App-wide constants
│       └── package.json
│
├── backend/                        # Python FastAPI (Phase 2)
│   └── chronos/
│
├── docs/                           # Documentation
├── nx.json                         # Nx configuration
├── tsconfig.json                   # TypeScript configuration
└── package.json                    # Root dependencies
```

---

## The Four Shared Packages (What They Do)

### 1. `@chronos/config` - Shared Configurations

**What it is:** Configuration files that multiple apps can use  
**Why it exists:** So you don't repeat the same TypeScript settings everywhere

**Example:**
```typescript
// Instead of copying TypeScript config to every app:
// apps/web/tsconfig.json
{
  "extends": "@chronos/config/typescript/nextjs.json",  // ← Use shared config
  "compilerOptions": {
    // Only add app-specific settings here
  }
}
```

**What's inside:**
- `typescript/base.json` - Basic TypeScript settings
- `typescript/nextjs.json` - Next.js-specific settings

---

### 2. `@chronos/types` - Type Definitions

**What it is:** TypeScript types shared across apps  
**Why it exists:** Ensures frontend and backend use the same data structures

**Example:**
```typescript
// packages/types/common/index.ts
export interface User {
  id: string
  email: string
  name: string
  role: 'admin' | 'user' | 'client'
}

// Now use it anywhere:
// apps/web/components/UserProfile.tsx
import { User } from '@chronos/types'

function UserProfile({ user }: { user: User }) {
  return <div>{user.name}</div>
}
```

**What's inside:**
- `api/` - Types for API responses (matches FastAPI backend)
- `database/` - Database-related types
- `common/` - General types (User, ApiResponse, etc.)

---

### 3. `@chronos/utils` - Utility Functions

**What it is:** Helper functions used across apps  
**Why it exists:** Don't repeat yourself (DRY principle)

**Example:**
```typescript
// Instead of writing this in every file:
const formatted = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD'
}).format(1000)

// Just use:
import { formatCurrency } from '@chronos/utils'
const formatted = formatCurrency(1000)  // "$1,000.00"
```

**What's inside:**
- `formatting/` - Format dates, currency, numbers, percentages
- `validation/` - Validate emails, URLs, ranges
- `constants/` - App-wide constants (API URLs, pagination defaults)

---

### 4. `@chronos/ui` - UI Components

**What it is:** Reusable React components (buttons, cards, inputs)  
**Why it exists:** Consistent design across all apps

**Example:**
```typescript
// apps/web/app/page.tsx
import { Button } from '@chronos/ui/components/button'

export default function HomePage() {
  return <Button>Request Early Access</Button>
}
```

**What's inside:**
- `components/` - shadcn/ui components (button, card, badge, input, label)
- `lib/utils.ts` - The `cn()` function for merging CSS classes

---

## How to Use Shared Packages

### Importing from Packages

```typescript
// ✅ CORRECT - Use package name
import { Button } from '@chronos/ui/components/button'
import { formatCurrency } from '@chronos/utils'
import { User } from '@chronos/types'

// ❌ WRONG - Don't use relative paths
import { Button } from '../../packages/ui/components/button'
```

### Adding a New Utility Function

**Step 1:** Add function to appropriate package
```typescript
// packages/utils/formatting/index.ts
export function formatPhoneNumber(phone: string): string {
  // Format: (555) 123-4567
  return phone.replace(/(\d{3})(\d{3})(\d{4})/, '($1) $2-$3')
}
```

**Step 2:** Use it anywhere
```typescript
// apps/web/components/ContactForm.tsx
import { formatPhoneNumber } from '@chronos/utils/formatting'

const formatted = formatPhoneNumber('5551234567')
// Result: "(555) 123-4567"
```

---

## What is Nx? (Simple Explanation)

**Nx** is a tool that helps manage your monorepo. Think of it as a smart assistant that:

1. **Knows Dependencies:** Understands which packages depend on each other
2. **Caches Builds:** Doesn't rebuild things that haven't changed
3. **Runs Tasks:** Can build, test, or lint specific apps/packages
4. **Visualizes Structure:** Shows you a graph of your project

### Common Nx Commands

```bash
# Start Next.js dev server
pnpm exec nx run web:dev

# Build the web app
pnpm exec nx run web:build

# See project structure
pnpm exec nx graph

# Show what changed
pnpm exec nx affected:graph

# Build only changed apps
pnpm exec nx affected:build
```

---

## Project Tags (What They Mean)

Nx uses **tags** to organize projects. Think of them as labels.

### Type Tags (What kind of project)
- `type:app` - Deployable application (e.g., `apps/web`)
- `type:lib` - Shared library (e.g., `packages/ui`)
- `type:config` - Configuration package
- `type:types` - Type definitions
- `type:utils` - Utilities

### Scope Tags (What domain/area)
- `scope:marketing` - Marketing-related (e.g., marketing site)
- `scope:portal` - Client portal (Phase 2)
- `scope:shared` - Used everywhere
- `scope:ui` - UI-specific

### Why Tags Matter

Tags enforce **architectural boundaries**. For example:
- ✅ `type:app` can import from `type:lib`
- ❌ `type:lib` should NOT import from `type:app`

This prevents circular dependencies and keeps code organized.

---

## TypeScript Path Aliases (Shortcuts)

Instead of writing long relative paths, you can use shortcuts:

```typescript
// ❌ WITHOUT aliases (messy)
import { Button } from '../../../packages/ui/components/button'
import { formatDate } from '../../../packages/utils/formatting'

// ✅ WITH aliases (clean)
import { Button } from '@chronos/ui/components/button'
import { formatDate } from '@chronos/utils/formatting'
```

**How it works:**  
The `tsconfig.json` file defines these shortcuts:

```json
{
  "paths": {
    "@chronos/ui": ["./packages/ui/index.tsx"],
    "@chronos/ui/*": ["./packages/ui/*"],
    "@chronos/types": ["./packages/types/index.ts"],
    "@chronos/utils": ["./packages/utils/index.ts"]
  }
}
```

---

## Practical Examples

### Example 1: Creating a New Component

**Scenario:** You want a reusable "PriceTag" component

**Step 1:** Create component in `packages/ui`
```typescript
// packages/ui/components/price-tag.tsx
import { formatCurrency } from '@chronos/utils/formatting'

export function PriceTag({ amount }: { amount: number }) {
  return (
    <span className="font-bold text-green-600">
      {formatCurrency(amount)}
    </span>
  )
}
```

**Step 2:** Use it in your app
```typescript
// apps/web/app/pricing/page.tsx
import { PriceTag } from '@chronos/ui/components/price-tag'

export default function PricingPage() {
  return (
    <div>
      <h1>Pricing</h1>
      <PriceTag amount={49} />  {/* Shows: $49.00 */}
    </div>
  )
}
```

---

### Example 2: Adding a New Type

**Scenario:** You need a "Client" type for the portal

**Step 1:** Add type to `packages/types`
```typescript
// packages/types/api/index.ts
export interface Client {
  id: string
  name: string
  industry: string
  revenue: number
  churnRisk: number
}
```

**Step 2:** Use it in components
```typescript
// apps/web/components/ClientCard.tsx
import { Client } from '@chronos/types/api'
import { formatCurrency } from '@chronos/utils/formatting'

export function ClientCard({ client }: { client: Client }) {
  return (
    <div>
      <h2>{client.name}</h2>
      <p>Revenue: {formatCurrency(client.revenue)}</p>
      <p>Churn Risk: {client.churnRisk}%</p>
    </div>
  )
}
```

---

### Example 3: Using Nx to Build

**Scenario:** You made changes and want to build

```bash
# Build everything
pnpm exec nx run-many --target=build

# Build only the web app
pnpm exec nx run web:build

# Build only what changed (smart!)
pnpm exec nx affected:build
```

**What happens:**
1. Nx checks dependencies (web app uses ui, utils, types)
2. Builds packages first (ui, utils, types)
3. Then builds web app
4. Caches results (next build is faster!)

---

## Troubleshooting

### "Cannot find module '@chronos/ui'"

**Problem:** TypeScript can't find your package  
**Solution:** Check `tsconfig.json` has the path alias

```json
{
  "paths": {
    "@chronos/ui": ["./packages/ui/index.tsx"]
  }
}
```

---

### "Circular dependency detected"

**Problem:** Package A imports Package B, which imports Package A  
**Solution:** Restructure code to break the cycle

```typescript
// ❌ BAD
// packages/ui imports packages/utils
// packages/utils imports packages/ui

// ✅ GOOD
// packages/ui imports packages/utils
// packages/utils has NO imports from packages/ui
```

---

### Build is slow

**Problem:** Nx is rebuilding everything  
**Solution:** Use affected commands

```bash
# Instead of:
pnpm exec nx run-many --target=build

# Use:
pnpm exec nx affected:build  # Only builds changed code
```

---

## Quick Reference

### Package Import Patterns

```typescript
// UI Components
import { Button } from '@chronos/ui/components/button'
import { Card } from '@chronos/ui/components/card'

// Types
import { User, ApiResponse } from '@chronos/types'
import { Client } from '@chronos/types/api'

// Utils
import { formatCurrency, formatDate } from '@chronos/utils/formatting'
import { isValidEmail } from '@chronos/utils/validation'
import { APP_NAME } from '@chronos/utils/constants'

// Config (in tsconfig.json only)
{
  "extends": "@chronos/config/typescript/nextjs.json"
}
```

### Common Commands

```bash
# Development
pnpm exec nx run web:dev              # Start Next.js dev server

# Building
pnpm exec nx run web:build            # Build web app
pnpm exec nx affected:build           # Build only changed code

# Visualization
pnpm exec nx graph                    # See project graph
pnpm exec nx show project web         # Show web project details

# Workspace
pnpm list -r --depth 0                # List all packages
```

---

## Next Steps

1. **Read ADR-017** - Understand why we chose Nx
2. **Explore packages** - Look at the code in `packages/`
3. **Try importing** - Use shared packages in your app
4. **Run Nx graph** - Visualize your project structure

---

## Getting Help

- **Nx Documentation:** https://nx.dev/
- **TypeScript Paths:** https://www.typescriptlang.org/docs/handbook/module-resolution.html#path-mapping
- **Monorepo Patterns:** https://nx.dev/concepts/more-concepts/monorepo-nx-enterprise

---

**Remember:** This structure might seem complex now, but it will save you tons of time as your project grows. You're setting up for long-term success! 🚀
