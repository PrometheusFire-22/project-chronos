/**
 * TwentyCRM REST API Client (Server-side only)
 *
 * Uses TWENTY_API_KEY — never expose to the browser.
 * Import only in API routes and server actions.
 *
 * Generate your API key at: https://crm.automatonicai.com/settings/developers
 */

const TWENTY_URL =
  process.env.TWENTY_URL || 'https://crm.automatonicai.com';

interface TwentyResponse<T> {
  data: T;
}

async function twentyPost<T>(
  endpoint: string,
  data: unknown
): Promise<T | null> {
  const apiKey = process.env.TWENTY_API_KEY;
  if (!apiKey) {
    console.warn('[TwentyCRM] TWENTY_API_KEY not configured — skipping CRM sync');
    return null;
  }

  try {
    const response = await fetch(`${TWENTY_URL}/api${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => null);
      console.error(`[TwentyCRM] POST ${endpoint} failed ${response.status}:`, error);
      return null;
    }

    const result = (await response.json()) as TwentyResponse<T> | T;
    // Twenty REST API returns { data: {...} } or just the object depending on version
    return (result as TwentyResponse<T>).data ?? (result as T);
  } catch (err) {
    console.error(`[TwentyCRM] POST ${endpoint} threw:`, err);
    return null;
  }
}

function splitName(fullName: string): { firstName: string; lastName: string } {
  const parts = fullName.trim().split(/\s+/);
  return {
    firstName: parts[0] ?? fullName,
    lastName: parts.slice(1).join(' ') || '',
  };
}

/**
 * Creates a Person record in TwentyCRM.
 * Returns the person's ID or null if creation failed.
 */
export async function createTwentyPerson(params: {
  name: string;
  email: string;
  companyId?: string;
}): Promise<string | null> {
  const { firstName, lastName } = splitName(params.name);

  const person = await twentyPost<{ id: string }>('/people', {
    name: { firstName, lastName },
    emails: { primaryEmail: params.email },
    ...(params.companyId && { companyId: params.companyId }),
  });

  return person?.id ?? null;
}

/**
 * Creates a Company record in TwentyCRM.
 * Returns the company's ID or null if creation failed.
 */
export async function createTwentyCompany(name: string): Promise<string | null> {
  const company = await twentyPost<{ id: string }>('/companies', {
    name,
  });

  return company?.id ?? null;
}

/**
 * Creates an Opportunity record in TwentyCRM.
 * Returns the opportunity's ID or null if creation failed.
 */
export async function createTwentyOpportunity(params: {
  name: string;
  personId: string | null;
  companyId: string | null;
}): Promise<string | null> {
  // Default close date: 30 days out
  const closeDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
    .toISOString()
    .split('T')[0];

  const opportunity = await twentyPost<{ id: string }>('/opportunities', {
    name: params.name,
    stage: 'NEW',
    closeDate,
    ...(params.personId && { pointOfContactId: params.personId }),
    ...(params.companyId && { companyId: params.companyId }),
  });

  return opportunity?.id ?? null;
}
