# Common Issues & Troubleshooting

**Purpose:** A central reference for resolving common build errors, configuration issues, and development gotchas in Project Chronos.

**Last Updated:** 2025-12-12

---

## 🏗️ Build & Bundling

### 🔴 CSS `@import` Error
```
Syntax error: @import rules must precede all other rules
```
**Cause:** Font imports or other `@import` statements are placed after CSS variable declarations or Tailwind directives in `globals.css`.
**Fix:** Move ALL `@import` statements to the very top of `apps/web/app/globals.css`.

### 🔴 Missing App-Level `package.json`
```
Cannot find module '@chronos/ui/components/button'
```
**Cause:** The app (`apps/web`) is missing its own `package.json` with dependencies defined.
**Fix:** Create `apps/web/package.json` and add `dependencies: { "@chronos/ui": "workspace:*" }`.

### 🔴 Package Exports Error
```
Module not found: Can't resolve '@chronos/ui/components/button'
```
**Cause:** The shared package (`packages/ui`) does not define subpath exports in its `package.json`.
**Fix:** Add proper exports to `packages/ui/package.json`:
```json
"exports": {
  ".": "./index.tsx",
  "./components/*": "./components/*"
}
```

### 🔴 Node.js Module Warning
```
Warning: To load an ES module, set "type": "module" in package.json
```
**Cause:** Next.js uses ES modules, but Node.js defaults to CommonJS.
**Fix:** Add `"type": "module"` to `apps/web/package.json`.

---

## 📦 Imports & Types

### 🔴 Path Alias Not Found
```
Cannot find module '@/components/theme-toggle'
```
**Cause:** TypeScript path aliases are missing in the app's `tsconfig.json`.
**Fix:** configure `baseUrl` and `paths` in `apps/web/tsconfig.json`:
```json
"paths": {
  "@/*": ["./*"]
}
```

### 🔴 Type-Only Import Error
```
'SomeType' is a type and must be imported using a type-only import
```
**Cause:** Importing a pure TypeScript type/interface as a value.
**Fix:** Use `import type { SomeType }` instead of `import { SomeType }`.

### 🔴 Peer Dependency Missing
```
Cannot find module '@radix-ui/react-slot'
```
**Cause:** A dependency is listed in `peerDependencies` but not installed in the consuming app, or missing from `dependencies` in the shared package.
**Fix:** Move to `dependencies` in the shared package if it's an internal implementation detail.

---

## 🎨 Styling & Themes

### 🔴 Flash of Unstyled Content / Wrong Theme
**Cause:** `next-themes` provider is not configured correctly or not wrapping the app.
**Fix:** Ensure `ThemeProvider` wraps `Component` in `_app.tsx` or `layout.tsx` with `attribute="class"`.

### 🔴 Tailwind Classes Not Applying
**Cause:** The content path in `tailwind.config.ts` does not include the file you are editing.
**Fix:** Check `content` array in `tailwind.config.ts` includes `../../packages/ui/**/*.{ts,tsx}`.

---

## 🛠️ Tools (Nx, Git, Jira)

### 🔴 Nx Command Failed
```
nx: command not found
```
**Cause:** Nx is installed locally, not globally.
**Fix:** Use `pnpm exec nx <command>` or `npx nx <command>`.

### 🔴 Git Hooks Failed
```
husky ... pre-commit hook failed
```
**Cause:** Linting or tests failed.
**Fix:** Run `pnpm lint` manually to see errors, fix them, then commit.

---

## 🚨 Still Stuck?

1. **Clean & Rebuild:**
   ```bash
   rm -rf node_modules .next
   pnpm install
   pnpm exec nx run web:build
   ```

2. **Check Docs:**
   - [Monorepo Guide](../../guides/development/monorepo-complete-guide.md)
   - [Frontend Development](../../guides/development/FRONTEND_DEVELOPMENT.md)

3. **Ask AI:**
   - "Explain this error in the context of an Nx monorepo with Next.js"
