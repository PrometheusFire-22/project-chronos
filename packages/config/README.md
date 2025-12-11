# @chronos/config

Shared configuration files for Project Chronos monorepo.

## Contents

### TypeScript Configurations

- **`typescript/base.json`** - Base TypeScript configuration with strict settings
- **`typescript/nextjs.json`** - Next.js-specific TypeScript configuration
- **`typescript/library.json`** - Library/package TypeScript configuration

### Tailwind CSS

- **`tailwind/base.js`** - Shared brand colors and theme configuration

## Usage

### In Next.js apps:

```json
{
  "extends": "@chronos/config/typescript/nextjs.json"
}
```

### In UI packages:

```json
{
  "extends": "@chronos/config/typescript/library.json"
}
```

### In Tailwind configs:

```js
import baseConfig from '@chronos/config/tailwind/base.js';

export default {
  ...baseConfig,
  content: [/* your content paths */],
};
```
