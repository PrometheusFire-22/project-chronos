# @chronos/ui

Shared UI component library for Project Chronos, built with shadcn/ui components.

## Structure

```
packages/ui/
├── components/     # Reusable UI components (shadcn/ui)
├── lib/           # Utility functions
└── index.tsx      # Package exports
```

## Utilities

### `cn()` - Class Name Utility

Merges Tailwind CSS classes intelligently:

```tsx
import { cn } from '@chronos/ui';

<div className={cn('base-class', isActive && 'active-class')} />
```

## Adding Components

Components will be added here following the shadcn/ui pattern. See the parent README for instructions on adding new components.

## Usage in Apps

```tsx
import { cn } from '@chronos/ui';
// Future: import { Button } from '@chronos/ui';
```
