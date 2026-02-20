import { NextResponse } from 'next/server'
import { Resend } from 'resend'
import {
  internalNotificationEmail,
  confirmationEmail,
  type ContactEmailData,
} from '@/lib/email/templates'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { name, email, company, subject, message } = body

    if (!name || !email || !subject || !message) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const subjectLabels: Record<string, string> = {
      'ai-setup': 'AI Assistant Setup',
      'ongoing-support': 'Ongoing Support',
      'custom-integration': 'Custom Integration',
      'general': 'General Inquiry',
    }

    const subjectLabel = subjectLabels[subject] || subject

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
        // Internal notification to Geoff
        resend.emails.send({
          from: 'Clawdacious Contact <geoff@clawdacious.com>',
          to: 'geoff@clawdacious.com',
          replyTo: email,
          subject: `[Clawdacious] ${subjectLabel} from ${name}`,
          html: internalNotificationEmail(emailData),
        }),
        // Confirmation to the person who submitted
        resend.emails.send({
          from: 'Geoff at Clawdacious <geoff@clawdacious.com>',
          to: email,
          subject: `We received your message — Clawdacious`,
          html: confirmationEmail(emailData),
        }),
      ])
    } else {
      console.log('Contact form submission (RESEND_API_KEY not set):', {
        name,
        email,
        company,
        subject: subjectLabel,
        message,
        timestamp: new Date().toISOString(),
      })
    }

    return NextResponse.json({
      success: true,
      message: 'Contact form submitted successfully',
    })
  } catch (error) {
    console.error('Contact form error:', error)
    return NextResponse.json(
      { error: 'Failed to process contact form' },
      { status: 500 }
    )
  }
}
