/**
 * Directus Write Client (Server-side only)
 *
 * Uses DIRECTUS_ADMIN_TOKEN — never expose this to the browser.
 * Import only in API routes and server actions.
 */

const DIRECTUS_URL =
  process.env.NEXT_PUBLIC_DIRECTUS_URL || 'https://admin.automatonicai.com';

export type ContactSubmissionStatus = 'new' | 'contacted' | 'qualified' | 'closed';

export interface ContactSubmissionCreate {
  name: string;
  email: string;
  company?: string;
  subject: string;
  message: string;
  source?: string;
  ip_address?: string;
}

export interface ContactSubmissionUpdate {
  status?: ContactSubmissionStatus;
  twenty_person_id?: string;
  twenty_company_id?: string;
  twenty_opportunity_id?: string;
  email_sent?: boolean;
  notes?: string;
}

async function directusWrite<T = { data: { id: string } }>(
  endpoint: string,
  method: 'POST' | 'PATCH',
  data: unknown
): Promise<T> {
  const token = process.env.DIRECTUS_ADMIN_TOKEN;
  if (!token) {
    throw new Error('DIRECTUS_ADMIN_TOKEN is not configured');
  }

  const response = await fetch(`${DIRECTUS_URL}${endpoint}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => null);
    throw new Error(
      `Directus write error ${response.status}: ${JSON.stringify(error)}`
    );
  }

  return response.json() as Promise<T>;
}

/**
 * Creates a contact form submission record.
 * Returns the new record's UUID.
 */
export async function createContactSubmission(
  data: ContactSubmissionCreate
): Promise<string> {
  const result = await directusWrite<{ data: { id: string } }>(
    '/items/claw_contact_submissions',
    'POST',
    {
      ...data,
      status: 'new',
      email_sent: false,
    }
  );
  return result.data.id;
}

/**
 * Updates an existing contact submission (e.g. to attach CRM IDs after creation).
 */
export async function updateContactSubmission(
  id: string,
  data: ContactSubmissionUpdate
): Promise<void> {
  await directusWrite(
    `/items/claw_contact_submissions/${id}`,
    'PATCH',
    data
  );
}
