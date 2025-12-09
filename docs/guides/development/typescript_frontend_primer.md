# TypeScript & Frontend Stack Primer

**Audience**: Developers with HTML/CSS background, new to JavaScript/TypeScript
**Goal**: Understand TypeScript fundamentals and frontend tooling for Project Chronos
**Version**: 1.0
**Date**: 2025-12-08
**Epic**: CHRONOS-280
**Story**: CHRONOS-282

---

## Table of Contents

1. [What is TypeScript?](#what-is-typescript)
2. [TypeScript vs JavaScript](#typescript-vs-javascript)
3. [Core Concepts](#core-concepts)
4. [TypeScript in Our Stack](#typescript-in-our-stack)
5. [Running TypeScript Code](#running-typescript-code)
6. [Common Patterns in Our Codebase](#common-patterns)
7. [Troubleshooting](#troubleshooting)
8. [Further Learning](#further-learning)

---

## What is TypeScript?

**TypeScript = JavaScript + Type Safety**

Think of it this way:
- **HTML**: Structure (what content exists)
- **CSS**: Presentation (how content looks)
- **JavaScript**: Behavior (how content interacts)
- **TypeScript**: JavaScript with **type checking** (catches errors before runtime)

### Analogy for HTML/CSS Developers

If you've written CSS like this:
```css
.button {
  color: blue; /* IDE warns if you typo "colour" */
  font-size: 16px; /* IDE warns if you write "16" without unit */
}
```

TypeScript does the same for JavaScript:
```typescript
function setFontSize(size: number) { /* Must be a number! */
  element.style.fontSize = `${size}px`;
}

setFontSize("16"); // ❌ ERROR: Expected number, got string
setFontSize(16);   // ✅ CORRECT
```

**Key Benefit**: Catches mistakes **before** you run code, just like CSS linters catch invalid properties.

---

## TypeScript vs JavaScript

| Feature | JavaScript | TypeScript |
|---------|------------|------------|
| **File Extension** | `.js` | `.ts` (or `.tsx` for React) |
| **Type Checking** | ❌ No (errors at runtime) | ✅ Yes (errors at compile time) |
| **Autocomplete** | Limited | ✅ Full IntelliSense |
| **Refactoring** | Manual, error-prone | ✅ Automated, safe |
| **Learning Curve** | Lower | Higher (but worth it!) |
| **Browser Support** | ✅ Native | ❌ Must compile to JS first |

### Example: Same Function in JS vs. TS

**JavaScript** (.js):
```javascript
function greet(name) {
  return "Hello, " + name.toUpperCase();
}

greet(123); // Runtime error: "name.toUpperCase is not a function"
```

**TypeScript** (.ts):
```typescript
function greet(name: string): string {
  return `Hello, ${name.toUpperCase()}`;
}

greet(123); // ❌ Compile-time error: Argument of type 'number' not assignable
greet("Geoff"); // ✅ Works: "Hello, GEOFF"
```

**Notice**:
- `: string` after `name` = "name must be a string"
- `: string` after `)` = "function returns a string"
- Error caught **before** running code!

---

## Core Concepts

### 1. Type Annotations

**What**: Declaring what "type" a variable/parameter/return value is.

**Syntax**: `variableName: Type`

```typescript
// Basic types
let age: number = 35;
let name: string = "Geoff";
let isActive: boolean = true;

// Arrays
let tags: string[] = ["PE", "VC", "IB"];
let scores: number[] = [100, 95, 88];

// Objects
let user: { name: string; age: number } = {
  name: "Geoff",
  age: 35
};
```

**HTML/CSS Parallel**: Like declaring `<div>` (not `<span>`) or `color: red` (not `color: 123`).

---

### 2. Interfaces (Object Shapes)

**What**: Defining the "shape" of an object (like a contract).

**Why**: Ensures objects have required properties.

```typescript
// Define interface (like a blueprint)
interface Logo {
  variant: string;
  width: number;
  height: number;
  color?: string; // "?" = optional property
}

// Use interface
const logoConfig: Logo = {
  variant: "symmetrical",
  width: 128,
  height: 128
  // "color" is optional, so OK to omit
};

// ❌ Error: Missing required "width"
const badLogo: Logo = {
  variant: "asymmetrical",
  height: 64
};
```

**CSS Parallel**: Like requiring certain CSS properties:
```css
/* Imagine if CSS enforced required properties */
.logo {
  width: required; /* Must provide width! */
  height: required; /* Must provide height! */
  opacity: optional; /* Can omit */
}
```

---

### 3. Functions with Types

**What**: Declaring what parameters a function accepts and what it returns.

```typescript
// Function signature:
//   (param: Type) => ReturnType
function generateFavicon(size: number, format: string): string {
  return `favicon-${size}x${size}.${format}`;
}

// Usage
const icon = generateFavicon(32, "png"); // ✅ Returns: "favicon-32x32.png"
const bad = generateFavicon("32", "png"); // ❌ Error: Expected number
```

**Arrow Function** (shorter syntax, common in modern JS/TS):
```typescript
// Same function as above, arrow syntax
const generateFavicon = (size: number, format: string): string => {
  return `favicon-${size}x${size}.${format}`;
};

// Even shorter (implicit return, one-liner)
const generateFavicon = (size: number, format: string): string =>
  `favicon-${size}x${size}.${format}`;
```

---

### 4. Generics (Advanced)

**What**: Functions/types that work with **any** type (like placeholders).

**When**: You want flexibility WITHOUT losing type safety.

```typescript
// Generic function: "T" is a placeholder for any type
function wrapInArray<T>(item: T): T[] {
  return [item];
}

// TypeScript infers "T" automatically
const numbers = wrapInArray(42);        // T = number, returns number[]
const strings = wrapInArray("hello");   // T = string, returns string[]
```

**CSS Parallel**: Like CSS variables (placeholders you fill in later):
```css
:root {
  --primary-color: blue; /* Variable */
}
.button {
  color: var(--primary-color); /* Use variable */
}
```

---

### 5. Type Aliases (Custom Types)

**What**: Creating your own type names (like CSS class names).

```typescript
// Define custom type
type LogoVariant = "symmetrical" | "asymmetrical" | "ai-wordmark";

// Use it
function loadLogo(variant: LogoVariant) {
  // variant can ONLY be one of those 3 strings
}

loadLogo("symmetrical");  // ✅ OK
loadLogo("custom");       // ❌ Error: Not a valid variant
```

**CSS Parallel**:
```css
/* Like restricting to predefined values */
.logo[data-variant="symmetrical"] { }
.logo[data-variant="asymmetrical"] { }
/* data-variant can only be those 2 */
```

---

## TypeScript in Our Stack

### File Structure

```
project-chronos/
├── marketing/
│   ├── scripts/
│   │   ├── generate-assets.ts    ← TypeScript script
│   │   └── tsconfig.json         ← TypeScript config
│   └── assets/
│       └── logos/                ← SVG files (not TS)
└── apps/
    └── marketing-site/           ← Next.js app (future)
        ├── components/
        │   └── Logo.tsx          ← TypeScript + React
        └── tsconfig.json
```

### File Extensions

| Extension | Meaning | Example |
|-----------|---------|---------|
| `.ts` | TypeScript (no React) | `generate-assets.ts` |
| `.tsx` | TypeScript + React (JSX syntax) | `Logo.tsx` |
| `.js` | JavaScript (old/legacy) | Avoid in new code |
| `.jsx` | JavaScript + React | Avoid (use `.tsx`) |

---

## Running TypeScript Code

### Option 1: Compile to JavaScript, Then Run

```bash
# Install TypeScript compiler
npm install -D typescript

# Compile .ts → .js
npx tsc generate-assets.ts

# Run compiled JavaScript
node generate-assets.js
```

**Process**:
```
generate-assets.ts  →  [TypeScript Compiler]  →  generate-assets.js  →  [Node.js]  →  Output
```

### Option 2: Run Directly with `tsx` (Faster)

```bash
# Install tsx (TypeScript executor)
npm install -D tsx

# Run .ts file directly (no separate compile step)
npx tsx generate-assets.ts
```

**Process**:
```
generate-assets.ts  →  [tsx (compiles + runs)]  →  Output
```

**We use Option 2** for scripts (simpler, faster dev workflow).

---

## Common Patterns in Our Codebase

### Pattern 1: Importing/Exporting

**What**: Sharing code between files (like CSS `@import`).

```typescript
// logo-config.ts (export)
export const LOGO_SIZES = [16, 32, 64, 128, 256];
export interface LogoConfig {
  variant: string;
  size: number;
}

// generate-assets.ts (import)
import { LOGO_SIZES, LogoConfig } from './logo-config';

console.log(LOGO_SIZES); // [16, 32, 64, 128, 256]
```

**CSS Parallel**:
```css
/* _variables.css (export) */
:root {
  --spacing: 16px;
}

/* main.css (import) */
@import '_variables.css';
.container {
  padding: var(--spacing);
}
```

---

### Pattern 2: Async/Await (Asynchronous Operations)

**What**: Waiting for slow operations (file I/O, network requests) without blocking.

**When**: Reading/writing files, fetching data, image processing.

```typescript
// Old way (callback hell)
fs.readFile('logo.svg', (err, data) => {
  if (err) throw err;
  processLogo(data, (err, result) => {
    if (err) throw err;
    saveFavicon(result, (err) => {
      if (err) throw err;
      console.log('Done!');
    });
  });
});

// Modern way (async/await - much cleaner!)
async function generateFavicon() {
  try {
    const data = await fs.readFile('logo.svg');      // Wait for read
    const result = await processLogo(data);          // Wait for process
    await saveFavicon(result);                       // Wait for save
    console.log('Done!');
  } catch (err) {
    console.error('Error:', err);
  }
}
```

**Key Words**:
- `async`: Function that can `await` things
- `await`: Wait for promise to finish (like "pause here")
- `try/catch`: Error handling (like `if/else` for errors)

---

### Pattern 3: Template Literals (String Interpolation)

**What**: Embedding variables in strings (like Sass `#{$var}`).

```typescript
const size = 128;
const format = "png";

// Old way (string concatenation)
const filename = "favicon-" + size + "x" + size + "." + format;

// Modern way (template literals with ``)
const filename = `favicon-${size}x${size}.${format}`;
// Result: "favicon-128x128.png"
```

**CSS Parallel**:
```scss
// Sass variable interpolation
$size: 128px;
.icon {
  width: #{$size};  // Embeds variable
}
```

---

## Troubleshooting

### Error: "Cannot find module 'sharp'"

**Cause**: Package not installed.

**Fix**:
```bash
npm install sharp
```

---

### Error: "Type 'string' is not assignable to type 'number'"

**Cause**: Wrong type passed to function.

**Example**:
```typescript
function setSize(size: number) { }
setSize("128"); // ❌ Error
```

**Fix**:
```typescript
setSize(128); // ✅ Correct (no quotes)
```

---

### Error: "Cannot use import statement outside a module"

**Cause**: Node.js doesn't understand ES modules by default.

**Fix**: Add to `package.json`:
```json
{
  "type": "module"
}
```

OR rename `.ts` → `.mts` (module TypeScript).

---

## Further Learning

### Official Resources

- **TypeScript Handbook**: https://www.typescriptlang.org/docs/handbook/
- **TypeScript Playground**: https://www.typescriptlang.org/play (try code in browser)

### For HTML/CSS Developers

- **TypeScript for JavaScript Programmers** (5-min read):
  https://www.typescriptlang.org/docs/handbook/typescript-in-5-minutes.html

### Next.js Specific

- **Next.js + TypeScript Guide**:
  https://nextjs.org/docs/app/building-your-application/configuring/typescript

---

## Quick Reference Card

```typescript
// ═══════════════════════════════════════════════════════════════
// TYPESCRIPT CHEAT SHEET (for this project)
// ═══════════════════════════════════════════════════════════════

// 1. BASIC TYPES
let name: string = "Geoff";
let age: number = 35;
let active: boolean = true;
let tags: string[] = ["PE", "VC"];

// 2. FUNCTIONS
function greet(name: string): string {
  return `Hello, ${name}`;
}

// Arrow function (same as above)
const greet = (name: string): string => `Hello, ${name}`;

// 3. INTERFACES
interface Logo {
  variant: string;
  size: number;
  color?: string; // Optional
}

// 4. TYPE ALIASES
type Size = 16 | 32 | 64 | 128 | 256; // Only these values allowed

// 5. ASYNC/AWAIT
async function loadFile() {
  const data = await readFile('logo.svg');
  return data;
}

// 6. IMPORTING/EXPORTING
export const SIZES = [16, 32, 64];      // Export
import { SIZES } from './config';       // Import

// 7. TEMPLATE LITERALS
const msg = `Size: ${128}px`;           // Embeds variable

// 8. OPTIONAL CHAINING
const color = logo?.config?.color;      // Safe access (no crash if null)

// 9. NULLISH COALESCING
const size = userSize ?? 128;           // Use 128 if userSize is null/undefined
```

---

**Next**: See `generate-assets.ts` for real-world examples using these patterns!

---

**Maintained in Git**: `docs/guides/development/typescript_frontend_primer.md`
**Epic**: CHRONOS-280
**Story**: CHRONOS-282
