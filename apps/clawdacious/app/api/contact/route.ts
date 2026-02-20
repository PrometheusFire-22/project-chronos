import { NextResponse } from 'next/server'
import { Resend } from 'resend'
import {
  internalNotificationEmail,
  confirmationEmail,
  type ContactEmailData,
} from '@/lib/email/templates'
import {
  createContactSubmission,
  updateContactSubmission,
} from '@/lib/directus/write'
import {
  createTwentyPerson,
  createTwentyCompany,
  createTwentyOpportunity,
} from '@/lib/twenty'

const subjectLabels: Record<string, string> = {
  'ai-setup': 'AI Assistant Setup',
  'ongoing-support': 'Ongoing Support',
  'custom-integration': 'Custom Integration',
  'general': 'General Inquiry',
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { firstName, lastName, email, company, subject, message } = body

    if (!firstName || !lastName || !email || !subject || !message) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const name = `${firstName} ${lastName}`.trim()
    const subjectLabel = subjectLabels[subject] || subject

    // 1. Write to Directus for audit trail
    let submissionId: string | null = null
    try {
      submissionId = await createContactSubmission({
        first_name: firstName,
        last_name: lastName,
        name,
        email,
        company,
        subject,
        message,
        source: 'contact-form',
      })
    } catch (err) {
      console.error('[Contact] Directus write failed (non-fatal):', err)
    }

    // 2. Sync to TwentyCRM pipeline
    let twentyPersonId: string | null = null
    let twentyCompanyId: string | null = null
    let twentyOpportunityId: string | null = null
    try {
      if (company) {
        twentyCompanyId = await createTwentyCompany(company)
      }
      twentyPersonId = await createTwentyPerson({
        firstName,
        lastName,
        email,
        companyId: twentyCompanyId ?? undefined,
      })
      twentyOpportunityId = await createTwentyOpportunity({
        name: `${subjectLabel} — ${name}`,
        personId: twentyPersonId,
        companyId: twentyCompanyId,
      })
    } catch (err) {
      console.error('[Contact] TwentyCRM sync failed (non-fatal):', err)
    }

    // 3. Update Directus record with CRM IDs
    if (submissionId && (twentyPersonId || twentyCompanyId || twentyOpportunityId)) {
      try {
        await updateContactSubmission(submissionId, {
          twenty_person_id: twentyPersonId ?? undefined,
          twenty_company_id: twentyCompanyId ?? undefined,
          twenty_opportunity_id: twentyOpportunityId ?? undefined,
        })
      } catch (err) {
        console.error('[Contact] Directus CRM ID update failed (non-fatal):', err)
      }
    }

    // 4. Send confirmation emails
    const emailData: ContactEmailData = {
      name,
      email,
      company,
      subject,
      subjectLabel,
      message,
    }

    if (process.env.RESEND_API_KEY) {
      const resend = new Resend(process.env.RESEND_API_KEY)
      await Promise.all([
        resend.emails.send({
          from: 'Clawdacious Contact <geoff@clawdacious.com>',
          to: 'geoff@clawdacious.com',
          replyTo: email,
          subject: `[Clawdacious] ${subjectLabel} from ${name}`,
          html: internalNotificationEmail(emailData),
        }),
        resend.emails.send({
          from: 'Geoff at Clawdacious <geoff@clawdacious.com>',
          to: email,
          subject: `We received your message — Clawdacious`,
          html: confirmationEmail(emailData),
        }),
      ])

      if (submissionId) {
        try {
          await updateContactSubmission(submissionId, { email_sent: true })
        } catch (err) {
          console.error('[Contact] Directus email_sent update failed (non-fatal):', err)
        }
      }
    } else {
      console.log('[Contact] Submission received (RESEND_API_KEY not set):', {
        name,
        email,
        company,
        subject: subjectLabel,
        timestamp: new Date().toISOString(),
      })
    }

    return NextResponse.json({
      success: true,
      message: 'Contact form submitted successfully',
    })
  } catch (error) {
    console.error('[Contact] Unhandled error:', error)
    return NextResponse.json(
      { error: 'Failed to process contact form' },
      { status: 500 }
    )
  }
}
