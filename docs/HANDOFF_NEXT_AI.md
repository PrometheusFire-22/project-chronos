# Handoff Document for Next AI/LLM

**Date:** 2025-12-11
**Current Branch:** `develop` (PR #50 pending merge)
**Next Task:** CHRONOS-301 - Set up shadcn/ui component library

---

## Current State Summary

### ✅ Completed Recently

1. **Port Configuration Refactoring** (commit 393c116)
   - Next.js now on port 3000 (standard)
   - Metabase moved to port 3001
   - TimescaleDB fixed to port 5432
   - All documentation updated

2. **Shared Packages Architecture** (PR #50, commit 45a3d46)
   - Created `packages/config/` with shared TypeScript and Tailwind configs
   - Created `packages/ui/` with foundation for shared components
   - Updated `apps/web/` to use shared configs
   - **STATUS:** Awaiting PR merge to `develop`

### 📂 Current Monorepo Structure

```
project-chronos/
├── apps/
│   └── web/                    # Next.js app (port 3000)
│       ├── src/app/           # App router pages
│       ├── tsconfig.json      # Extends @chronos/config
│       └── tailwind.config.js # Extends @chronos/config
├── packages/
│   ├── config/                # ✅ NEW: Shared configs
│   │   ├── typescript/        # Base, nextjs, library configs
│   │   └── tailwind/          # Brand colors config
│   └── ui/                    # ✅ NEW: Shared components (READY for shadcn/ui)
│       ├── components/        # (empty, awaiting shadcn/ui)
│       ├── lib/utils.ts       # cn() utility function
│       └── index.tsx          # Package exports
├── src/chronos/               # Python backend (unchanged)
└── docker-compose.yml         # Updated port mappings

```

### 🎯 Immediate Next Task: Option A (shadcn/ui Setup)

**Jira Ticket:** CHRONOS-301 (to be created)
**Estimated Effort:** 2-3 hours (simple, mostly copy-paste)
**Priority:** High (unblocks all future UI development)

---

## Implementation Guide for Next AI

### Prerequisites (Already Done ✅)

- ✅ Monorepo structure established
- ✅ `packages/ui/` created with proper exports
- ✅ `cn()` utility function added (required by shadcn/ui)
- ✅ Tailwind CSS configured with brand colors
- ✅ TypeScript configs shared

### Step-by-Step: shadcn/ui Installation

**IMPORTANT:** Follow the user's git workflow:
1. Create Jira ticket first
2. Create feature branch: `feature/CHRONOS-301-shadcn-ui-setup`
3. Do work
4. Commit with conventional commits
5. Push and create PR to `develop`

#### 1. Create Jira Ticket

```bash
acli jira workitem create \
  --project CHRONOS \
  --type Story \
  --summary "Set up shadcn/ui component library" \
  --description "Install shadcn/ui and add foundational components (Button, Card, Input, etc.) to packages/ui. This enables rapid UI development with pre-built, accessible components." \
  --label "frontend,ui,shadcn,components"
```

#### 2. Create Feature Branch

```bash
git checkout develop
git pull origin develop
git checkout -b feature/CHRONOS-301-shadcn-ui-setup
```

#### 3. Install shadcn/ui Dependencies

```bash
cd /home/prometheus/coding/finance/project-chronos

# Install required peer dependencies for packages/ui
pnpm --filter=@chronos/ui add -D @radix-ui/react-slot lucide-react

# Install shadcn/ui CLI globally (optional, for convenience)
pnpm add -g shadcn-ui@latest
```

#### 4. Initialize shadcn/ui Configuration

Create `packages/ui/components.json`:

```json
{
  "$schema": "https://ui.shadcn.com/schema.json",
  "style": "default",
  "rsc": true,
  "tsx": true,
  "tailwind": {
    "config": "../../apps/web/tailwind.config.js",
    "css": "../../apps/web/src/app/global.css",
    "baseColor": "slate",
    "cssVariables": true
  },
  "aliases": {
    "components": "./components",
    "utils": "./lib/utils",
    "ui": "./components"
  }
}
```

#### 5. Add Core Components

Add these essential components to `packages/ui/components/`:

**Recommended starter set (5 components):**
1. **Button** - Primary UI action component
2. **Card** - Content container
3. **Input** - Form input
4. **Label** - Form label
5. **Badge** - Status indicators

**How to add each component:**

```bash
cd packages/ui

# Option A: Use shadcn/ui CLI (if installed)
npx shadcn-ui@latest add button
npx shadcn-ui@latest add card
npx shadcn-ui@latest add input
npx shadcn-ui@latest add label
npx shadcn-ui@latest add badge

# Option B: Manual installation (copy from shadcn/ui docs)
# Visit: https://ui.shadcn.com/docs/components/button
# Copy component code to packages/ui/components/button.tsx
```

#### 6. Update Package Exports

After adding components, update `packages/ui/index.tsx`:

```tsx
// Export utilities
export { cn } from "./lib/utils";

// Export components
export { Button } from "./components/button";
export { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "./components/card";
export { Input } from "./components/input";
export { Label } from "./components/label";
export { Badge } from "./components/badge";
```

#### 7. Test in apps/web

Update `apps/web/src/app/page.tsx` to test components:

```tsx
import { Button, Card, CardContent, CardHeader, CardTitle } from '@chronos/ui';

export default function Home() {
  return (
    <div className="container mx-auto p-8">
      <Card>
        <CardHeader>
          <CardTitle>Project Chronos</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-neutral-medium mb-4">
            Welcome to the Next.js frontend!
          </p>
          <Button className="bg-primary-purple hover:bg-dark-purple">
            Get Started
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
```

#### 8. Verify Everything Works

```bash
# Install any new dependencies
pnpm install

# Run type checking
cd apps/web
pnpm exec tsc --noEmit

# Start dev server
pnpm dev

# Visit http://localhost:3000 - should see styled components
```

#### 9. Commit and PR

```bash
git add packages/ui/ apps/web/ pnpm-lock.yaml
git commit -m "✨ feat(ui): CHRONOS-301 Set up shadcn/ui component library

Add foundational shadcn/ui components to packages/ui:
- Button component with variants
- Card component and sub-components
- Input and Label form components
- Badge component for status indicators

Components are now available via @chronos/ui imports.

Jira: https://automatonicai.atlassian.net/browse/CHRONOS-301

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"

git push -u origin feature/CHRONOS-301-shadcn-ui-setup

# Create PR
gh pr create \
  --base develop \
  --title "✨ feat(ui): CHRONOS-301 Set up shadcn/ui component library" \
  --body "## Summary

Install shadcn/ui and add foundational components to packages/ui.

## Components Added
- Button (with variants)
- Card (Header, Title, Description, Content, Footer)
- Input
- Label
- Badge

## Testing
- ✅ TypeScript compilation passes
- ✅ Components render correctly in apps/web
- ✅ Tailwind classes apply properly
- ✅ Brand colors work with components

## Jira
https://automatonicai.atlassian.net/browse/CHRONOS-301"
```

---

## Git Workflow Reference

**Branch Naming:** `feature/CHRONOS-XXX-short-description`
**Commit Format:** Conventional Commits with Jira key
**PR Target:** Always merge to `develop`, not `main`
**PR Requirements:**
- Must link to Jira ticket
- Must include summary and test plan
- Include Claude Code attribution

**Example Commit:**
```
✨ feat(scope): CHRONOS-XXX Brief description

Detailed explanation of changes.

Jira: https://automatonicai.atlassian.net/browse/CHRONOS-XXX

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>
```

---

## Key Conventions & Standards

### Port Assignments (Updated 2025-12-11)
- **3000:** Next.js dev server
- **3001:** Metabase
- **5432:** TimescaleDB
- **5050:** pgAdmin
- **8025:** MailHog Web UI

### Package Names
- `@chronos/ui` - Shared UI components
- `@chronos/config` - Shared configurations
- `@chronos/web` - Next.js application (future)

### Import Aliases
- `@/*` - Refers to `src/*` in apps
- `@chronos/ui` - Shared UI components
- `@chronos/config` - Shared configs

### Brand Colors (in Tailwind)
```js
'primary-purple': '#8B5CF6'
'light-purple': '#C4B5FD'
'dark-purple': '#6D28D9'
'accent-teal': '#06B6D4'
'success-green': '#10B981'
'ocean-blue': '#0EA5E9'
'neutral-dark': '#0F172A'
'neutral-medium': '#475569'
'neutral-light': '#F8FAFC'
```

---

## Important Files to Review

Before starting work, review these files:

1. **`docs/front-end-setup-sprint.md`** - Complete frontend setup plan
2. **`docs/architecture/adrs/adr_004_git_workflow_and_branching_model.md`** - Git workflow
3. **`docs/guides/development/jira_workflow.md`** - Jira ticket management
4. **`packages/ui/README.md`** - UI package documentation
5. **`packages/config/README.md`** - Config package documentation

---

## Current Open PRs

- **PR #50:** Shared packages setup (awaiting merge to `develop`)

---

## Troubleshooting

### If TypeScript errors occur:
```bash
# Clear Nx cache
nx reset

# Reinstall dependencies
rm -rf node_modules packages/*/node_modules apps/*/node_modules
pnpm install
```

### If Tailwind classes don't apply:
- Verify `packages/ui/**/*.{ts,tsx}` is in `apps/web/tailwind.config.js` content array
- Restart dev server

### If imports fail:
- Verify `pnpm-workspace.yaml` includes `packages/*`
- Run `pnpm install` to update workspace

---

## Success Criteria for CHRONOS-301

- [ ] shadcn/ui components installed in `packages/ui/`
- [ ] At least 5 core components added (Button, Card, Input, Label, Badge)
- [ ] Components exported from `packages/ui/index.tsx`
- [ ] Test page in `apps/web` successfully imports and renders components
- [ ] TypeScript compilation passes
- [ ] PR created and linked to Jira ticket

---

## Questions for User (if needed)

- Should I add more components beyond the recommended 5?
- Any specific components needed immediately?
- Preference for component variants (e.g., Button sizes, Card styles)?

---

**END OF HANDOFF**
