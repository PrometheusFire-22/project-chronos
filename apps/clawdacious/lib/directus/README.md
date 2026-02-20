# Directus Client Library

Type-safe client for fetching content from Directus CMS.

## Usage

```typescript
import { getHomepageHero, getFeaturesByCategory } from '@/lib/directus';

// Server Component
export default async function HomePage() {
  const hero = await getHomepageHero();
  const pillars = await getFeaturesByCategory('solution-pillar');

  return <HeroSection data={hero} />;
}
```

## Files

- `client.ts` - Base fetch client with ISR support
- `types.ts` - Zod schemas and TypeScript types  
- `collections.ts` - Collection-specific getter functions
- `index.ts` - Barrel exports

## ISR Revalidation

- Homepage Hero: 1 hour (3600s)
- Features: 1 hour (3600s)
- Blog Listing: 5 minutes (300s)
- Blog Post: 15 minutes (900s)
- Announcements: 1 minute (60s)

## Error Handling

All functions throw `DirectusError` on failure:

```typescript
import { getHomepageHero, isDirectusError } from '@/lib/directus';

try {
  const hero = await getHomepageHero();
} catch (error) {
  if (isDirectusError(error)) {
    console.error('Directus error:', error.status, error.message);
  }
}
```
