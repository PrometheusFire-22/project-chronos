import { NextResponse } from 'next/server'



export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { name, email, company, subject, message } = body

    // Validate required fields
    if (!name || !email || !subject || !message) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // TODO: Implement email sending logic
    // For now, just log the contact form submission
    console.log('Contact form submission:', {
      name,
      email,
      company,
      subject,
      message,
      timestamp: new Date().toISOString(),
    })

    // In production, you would:
    // 1. Send an email using a service like Resend, SendGrid, etc.
    // 2. Store the submission in your database
    // 3. Send a confirmation email to the user
    //
    // Example with Resend (if configured):
    // const { Resend } = require('resend')
    // const resend = new Resend(process.env.RESEND_API_KEY)
    // await resend.emails.send({
    //   from: 'noreply@chronos.com',
    //   to: 'contact@chronos.com',
    //   subject: `Contact Form: ${subject}`,
    //   html: `
    //     <p><strong>Name:</strong> ${name}</p>
    //     <p><strong>Email:</strong> ${email}</p>
    //     <p><strong>Company:</strong> ${company || 'N/A'}</p>
    //     <p><strong>Subject:</strong> ${subject}</p>
    //     <p><strong>Message:</strong></p>
    //     <p>${message}</p>
    //   `,
    // })

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
