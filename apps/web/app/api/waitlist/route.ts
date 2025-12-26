import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

// Validation schema for waitlist submissions
const waitlistSubmissionSchema = z.object({
  email: z.string().email(),
  first_name: z.string().min(1).max(100),
  last_name: z.string().min(1).max(100),
  company: z.string().max(255).nullable(),
  role: z.string().max(255).nullable(),
  heard_from: z.string().max(255).nullable(),
  source: z.string(),
  utm_source: z.string().nullable(),
  utm_medium: z.string().nullable(),
  utm_campaign: z.string().nullable(),
})

export async function POST(request: NextRequest) {
  try {
    // Parse and validate request body
    const body = await request.json()
    const validatedData = waitlistSubmissionSchema.parse(body)

    // Get Directus URL from environment or use default
    // On Cloudflare Pages, use the public URL directly since it's not sensitive
    const directusUrl = process.env.NEXT_PUBLIC_DIRECTUS_URL || 'https://admin.automatonicai.com'

    // Submit to Directus
    const response = await fetch(`${directusUrl}/items/cms_waitlist_submissions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: validatedData.email,
        first_name: validatedData.first_name,
        last_name: validatedData.last_name,
        company: validatedData.company,
        role: validatedData.role,
        heard_from: validatedData.heard_from,
        source: validatedData.source,
        utm_source: validatedData.utm_source,
        utm_medium: validatedData.utm_medium,
        utm_campaign: validatedData.utm_campaign,
        status: 'pending',
        email_sent: false,
      }),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      console.error('Directus API error:', response.status, errorData)

      // Check for duplicate email (unique constraint violation)
      if (response.status === 400 && errorData.errors?.[0]?.extensions?.code === 'RECORD_NOT_UNIQUE') {
        return NextResponse.json(
          { error: 'This email is already on the waitlist' },
          { status: 409 }
        )
      }

      return NextResponse.json(
        { error: 'Failed to submit waitlist entry' },
        { status: response.status }
      )
    }

    const data = await response.json()

    return NextResponse.json(
      {
        success: true,
        message: 'Successfully joined the waitlist',
        id: data.data.id,
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Waitlist submission error:', error)

    // Handle Zod validation errors
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: 'Invalid form data',
          details: error.issues,
        },
        { status: 400 }
      )
    }

    // Handle other errors
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    )
  }
}

// Optional: Handle OPTIONS for CORS if needed
export async function OPTIONS() {
  return NextResponse.json({}, { status: 200 })
}
