/**
 * Directus API Client
 *
 * Base fetch client for Directus CMS with ISR support.
 * All API calls go through this client for consistent caching and error handling.
 */

const DIRECTUS_URL = process.env.NEXT_PUBLIC_DIRECTUS_URL || 'https://admin.automatonicai.com';

export interface FetchOptions {
  /**
   * ISR revalidation interval in seconds
   * @default 3600 (1 hour)
   */
  revalidate?: number;

  /**
   * Cache tags for on-demand revalidation
   */
  tags?: string[];

  /**
   * Additional headers
   */
  headers?: HeadersInit;
}

export class DirectusError extends Error {
  constructor(
    message: string,
    public status: number,
    public response?: unknown
  ) {
    super(message);
    this.name = 'DirectusError';
  }
}

/**
 * Fetch data from Directus API with ISR caching
 *
 * @example
 * ```typescript
 * const hero = await fetchDirectus<{ data: HomepageHero }>('/items/cms_homepage_hero');
 * ```
 */
export async function fetchDirectus<T>(
  endpoint: string,
  options?: FetchOptions
): Promise<T> {
  const url = `${DIRECTUS_URL}${endpoint}`;

  try {
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
      next: {
        revalidate: options?.revalidate ?? 3600, // Default: 1 hour
        tags: options?.tags,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      throw new DirectusError(
        `Directus API error: ${response.statusText}`,
        response.status,
        errorData
      );
    }

    const data = await response.json();
    return data as T;
  } catch (error) {
    if (error instanceof DirectusError) {
      throw error;
    }

    throw new DirectusError(
      `Failed to fetch from Directus: ${error instanceof Error ? error.message : 'Unknown error'}`,
      500
    );
  }
}

/**
 * Build Directus query parameters
 *
 * @example
 * ```typescript
 * const query = buildQuery({
 *   filter: { category: { _eq: 'solution-pillar' }, enabled: { _eq: true } },
 *   sort: ['sort_order'],
 *   limit: 10,
 *   fields: ['*', 'image.*'],
 * });
 * // Returns: ?filter[category][_eq]=solution-pillar&filter[enabled][_eq]=true&sort=sort_order&limit=10&fields=*,image.*
 * ```
 */
export function buildQuery(params: {
  filter?: Record<string, unknown>;
  sort?: string[];
  limit?: number;
  offset?: number;
  fields?: string[];
  search?: string;
}): string {
  const searchParams = new URLSearchParams();

  // Filter
  if (params.filter) {
    Object.entries(params.filter).forEach(([key, value]) => {
      if (typeof value === 'object' && value !== null) {
        Object.entries(value as Record<string, unknown>).forEach(([op, val]) => {
          searchParams.append(`filter[${key}][${op}]`, String(val));
        });
      } else {
        searchParams.append(`filter[${key}]`, String(value));
      }
    });
  }

  // Sort
  if (params.sort) {
    params.sort.forEach((field) => searchParams.append('sort', field));
  }

  // Limit
  if (params.limit !== undefined) {
    searchParams.append('limit', String(params.limit));
  }

  // Offset
  if (params.offset !== undefined) {
    searchParams.append('offset', String(params.offset));
  }

  // Fields
  if (params.fields) {
    searchParams.append('fields', params.fields.join(','));
  }

  // Search
  if (params.search) {
    searchParams.append('search', params.search);
  }

  const query = searchParams.toString();
  return query ? `?${query}` : '';
}
