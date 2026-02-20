/**
 * TwentyCRM GraphQL Client (Server-side only)
 *
 * Uses TWENTY_API_KEY — never expose to the browser.
 * Import only in API routes and server actions.
 */

const TWENTY_URL = process.env.TWENTY_URL || 'https://crm.automatonicai.com';

async function twentyGQL<T>(
  query: string,
  variables?: Record<string, unknown>
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

    const json = await response.json() as {
      data?: T;
      errors?: { message: string; extensions?: { code?: string } }[];
    };

    if (json.errors?.length) {
      console.error('[TwentyCRM] GraphQL errors:', JSON.stringify(json.errors));
      return null;
    }

    return json.data ?? null;
  } catch (err) {
    console.error('[TwentyCRM] Request failed:', err);
    return null;
  }
}

// ---------------------------------------------------------------------------
// Company
// ---------------------------------------------------------------------------

async function findCompanyByName(name: string): Promise<string | null> {
  const data = await twentyGQL<{
    companies: { edges: { node: { id: string } }[] };
  }>(`query FindCompany($name: StringFilter!) {
    companies(filter: { name: { eq: $name } }) {
      edges { node { id } }
    }
  }`, { name });
  return data?.companies?.edges?.[0]?.node?.id ?? null;
}

/**
 * Creates a Company or returns the existing one's ID (upsert by name).
 */
export async function createTwentyCompany(name: string): Promise<string | null> {
  const data = await twentyGQL<{ createCompany: { id: string } }>(
    `mutation CreateCompany($data: CompanyCreateInput!) {
      createCompany(data: $data) { id }
    }`,
    { data: { name } }
  );

  if (data?.createCompany?.id) return data.createCompany.id;

  // Duplicate — look up the existing record
  return findCompanyByName(name);
}

// ---------------------------------------------------------------------------
// Person
// ---------------------------------------------------------------------------

async function findPersonByEmail(email: string): Promise<string | null> {
  const data = await twentyGQL<{
    people: { edges: { node: { id: string } }[] };
  }>(`query FindPerson($email: StringFilter!) {
    people(filter: { emails: { primaryEmail: { eq: $email } } }) {
      edges { node { id } }
    }
  }`, { email });
  return data?.people?.edges?.[0]?.node?.id ?? null;
}

/**
 * Creates a Person or returns the existing one's ID (upsert by email).
 * Also links the person to their company if they don't have one yet.
 */
export async function createTwentyPerson(params: {
  firstName: string;
  lastName: string;
  email: string;
  companyId?: string;
}): Promise<string | null> {
  const data = await twentyGQL<{ createPerson: { id: string } }>(
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

  if (data?.createPerson?.id) return data.createPerson.id;

  // Duplicate — look up the existing record, then update company if needed
  const existingId = await findPersonByEmail(params.email);
  if (existingId && params.companyId) {
    await twentyGQL(
      `mutation UpdatePerson($id: ID!, $data: PersonUpdateInput!) {
        updatePerson(id: $id, data: $data) { id }
      }`,
      { id: existingId, data: { companyId: params.companyId } }
    );
  }
  return existingId;
}

// ---------------------------------------------------------------------------
// Opportunity
// ---------------------------------------------------------------------------

/**
 * Creates an Opportunity linked to the contact's person and company.
 */
export async function createTwentyOpportunity(params: {
  name: string;
  personId: string | null;
  companyId: string | null;
}): Promise<string | null> {
  const closeDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
    .toISOString()
    .split('T')[0];

  const data = await twentyGQL<{ createOpportunity: { id: string } }>(
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
