/**
 * TwentyCRM GraphQL Client (Server-side only)
 *
 * Uses TWENTY_API_KEY — never expose to the browser.
 * Import only in API routes and server actions.
 *
 * Generate your API key at: https://crm.automatonicai.com/settings/developers
 */

const TWENTY_URL =
  process.env.TWENTY_URL || 'https://crm.automatonicai.com';

async function twentyGraphQL<T>(
  query: string,
  variables: Record<string, unknown>
): Promise<T | null> {
  const apiKey = process.env.TWENTY_API_KEY;
  if (!apiKey) {
    console.warn('[TwentyCRM] TWENTY_API_KEY not configured — skipping CRM sync');
    return null;
  }

  try {
    const response = await fetch(`${TWENTY_URL}/graphql`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({ query, variables }),
    });

    const json = await response.json() as { data?: T; errors?: { message: string; extensions?: { code?: string } }[] };

    if (json.errors?.length) {
      // Duplicate entry is non-fatal — return null so the pipeline continues
      const isDuplicate = json.errors.some(
        (e) => e.extensions?.code === 'BAD_USER_INPUT' && e.message.includes('duplicate')
      );
      if (isDuplicate) {
        console.warn('[TwentyCRM] Duplicate entry detected — skipping');
        return null;
      }
      console.error('[TwentyCRM] GraphQL errors:', json.errors);
      return null;
    }

    return json.data ?? null;
  } catch (err) {
    console.error('[TwentyCRM] Request failed:', err);
    return null;
  }
}

/**
 * Creates a Person record in TwentyCRM.
 * Returns the person's ID or null if creation failed.
 */
export async function createTwentyPerson(params: {
  firstName: string;
  lastName: string;
  email: string;
  companyId?: string;
}): Promise<string | null> {
  const data = await twentyGraphQL<{ createPerson: { id: string } }>(
    `mutation CreatePerson($data: PersonCreateInput!) {
      createPerson(data: $data) { id }
    }`,
    {
      data: {
        name: { firstName: params.firstName, lastName: params.lastName },
        emails: { primaryEmail: params.email },
        ...(params.companyId && { companyId: params.companyId }),
      },
    }
  );

  return data?.createPerson?.id ?? null;
}

/**
 * Creates a Company record in TwentyCRM.
 * Returns the company's ID or null if creation failed.
 */
export async function createTwentyCompany(name: string): Promise<string | null> {
  const data = await twentyGraphQL<{ createCompany: { id: string } }>(
    `mutation CreateCompany($data: CompanyCreateInput!) {
      createCompany(data: $data) { id }
    }`,
    { data: { name } }
  );

  return data?.createCompany?.id ?? null;
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
  const closeDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
    .toISOString()
    .split('T')[0];

  const data = await twentyGraphQL<{ createOpportunity: { id: string } }>(
    `mutation CreateOpportunity($data: OpportunityCreateInput!) {
      createOpportunity(data: $data) { id }
    }`,
    {
      data: {
        name: params.name,
        stage: 'NEW',
        closeDate,
        ...(params.personId && { pointOfContactId: params.personId }),
        ...(params.companyId && { companyId: params.companyId }),
      },
    }
  );

  return data?.createOpportunity?.id ?? null;
}
