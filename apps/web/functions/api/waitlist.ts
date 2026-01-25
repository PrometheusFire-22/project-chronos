// Cloudflare Pages Function for waitlist submissions
// This replaces the Next.js API route at /app/api/waitlist/route.ts

import { z } from 'zod'
import { calculateSpamScore } from '../../utils/spam-detection'

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
  captcha_token: z.string().min(1),
})

// Turnstile verification response
interface TurnstileResponse {
  success: boolean
  challenge_ts?: string
  hostname?: string
  'error-codes'?: string[]
  action?: string
  cdata?: string
  metadata?: Record<string, unknown>
}

// Verify Turnstile CAPTCHA token
async function verifyTurnstile(
  token: string,
  secretKey: string,
  ip?: string
): Promise<TurnstileResponse> {
  const response = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      secret: secretKey,
      response: token,
      remoteip: ip,
    }),
  })

  return await response.json() as TurnstileResponse
}

// Store CAPTCHA verification in database
async function storeCaptchaVerification(
  directusUrl: string,
  data: {
    token: string
    ip_address: string | null
    user_agent: string | null
    success: boolean
    error_codes: string[] | null
    challenge_ts: string | null
    hostname: string | null
    action: string | null
    cdata: string | null
    metadata: Record<string, unknown> | null
  }
) {
  try {
    await fetch(`${directusUrl}/items/captcha_verifications`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    })
  } catch (error) {
    console.error('Failed to store CAPTCHA verification:', error)
    // Don't fail the request if logging fails
  }
}

// Email template function
function getWaitlistConfirmationEmail(data: { firstName: string; email: string }) {
  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome to Chronos Waitlist</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #334155; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(135deg, #7c3aed 0%, #a78bfa 100%); padding: 40px 20px; border-radius: 12px 12px 0 0; text-align: center;">
    <h1 style="color: white; margin: 0; font-size: 28px; font-weight: 700;">Welcome to Chronos!</h1>
  </div>

  <div style="background: white; padding: 40px 30px; border: 1px solid #e2e8f0; border-top: none; border-radius: 0 0 12px 12px;">
    <p style="font-size: 16px; margin-bottom: 20px;">Hi ${data.firstName},</p>

    <p style="font-size: 16px; margin-bottom: 20px;">Thank you for joining the Chronos waitlist! We're excited to have you on board.</p>

    <p style="font-size: 16px; margin-bottom: 20px;">Chronos is building the first multi-model relationship intelligence platform for private markets, combining graph, vector, time-series, and geospatial data to uncover hidden market connections.</p>

    <p style="font-size: 16px; margin-bottom: 20px;">We'll keep you updated on our progress and let you know as soon as we're ready to onboard early users.</p>

    <div style="background: #f8fafc; border-left: 4px solid #7c3aed; padding: 16px; margin: 30px 0; border-radius: 4px;">
      <p style="margin: 0; font-size: 14px; color: #64748b;">
        <strong style="color: #334155;">What's Next?</strong><br>
        Watch your inbox for updates on our development progress and early access opportunities.
      </p>
    </div>

    <p style="font-size: 16px; margin-bottom: 20px;">If you have any questions or feedback, feel free to reply to this email.</p>

    <p style="font-size: 16px; margin-bottom: 0;">Best regards,<br><strong>The Chronos Team</strong></p>
  </div>

  <div style="text-align: center; padding: 20px; color: #94a3b8; font-size: 14px;">
    <p style="margin: 0;">© 2025 Chronos. All rights reserved.</p>
  </div>
</body>
</html>
  `.trim()

  const text = `
Hi ${data.firstName},

Thank you for joining the Chronos waitlist! We're excited to have you on board.

Chronos is building the first multi-model relationship intelligence platform for private markets, combining graph, vector, time-series, and geospatial data to uncover hidden market connections.

We'll keep you updated on our progress and let you know as soon as we're ready to onboard early users.

What's Next?
Watch your inbox for updates on our development progress and early access opportunities.

If you have any questions or feedback, feel free to reply to this email.

Best regards,
The Chronos Team

---
© 2025 Chronos. All rights reserved.
  `.trim()

  return {
    subject: 'Welcome to the Chronos Waitlist!',
    html,
    text,
  }
}

export async function onRequestPost(context: {
  request: Request
  env: {
    RESEND_API_KEY: string
    NEXT_PUBLIC_DIRECTUS_URL?: string
    TURNSTILE_SECRET_KEY: string
  }
}): Promise<Response> {
  try {
    // Parse and validate request body
    const body = await context.request.json()
    const validatedData = waitlistSubmissionSchema.parse(body)

    // Get client IP and user agent
    const clientIP = context.request.headers.get('CF-Connecting-IP') ||
                     context.request.headers.get('X-Forwarded-For')?.split(',')[0] ||
                     null
    const userAgent = context.request.headers.get('User-Agent') || null

    // Verify Turnstile CAPTCHA
    const turnstileResult = await verifyTurnstile(
      validatedData.captcha_token,
      context.env.TURNSTILE_SECRET_KEY,
      clientIP || undefined
    )

    // Get Directus URL
    const directusUrl = context.env.NEXT_PUBLIC_DIRECTUS_URL || 'https://admin.automatonicai.com'

    // Store CAPTCHA verification result
    await storeCaptchaVerification(directusUrl, {
      token: validatedData.captcha_token,
      ip_address: clientIP,
      user_agent: userAgent,
      success: turnstileResult.success,
      error_codes: turnstileResult['error-codes'] || null,
      challenge_ts: turnstileResult.challenge_ts || null,
      hostname: turnstileResult.hostname || null,
      action: turnstileResult.action || null,
      cdata: turnstileResult.cdata || null,
      metadata: turnstileResult.metadata || null,
    })

    // Reject if CAPTCHA verification failed
    if (!turnstileResult.success) {
      console.log('CAPTCHA verification failed:', {
        ip: clientIP,
        errors: turnstileResult['error-codes'],
      })

      return new Response(
        JSON.stringify({
          error: 'CAPTCHA verification failed',
          message: 'Please try again or contact support if the issue persists.',
        }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      )
    }

    // Calculate spam score
    const spamScore = calculateSpamScore({
      first_name: validatedData.first_name,
      last_name: validatedData.last_name,
      email: validatedData.email,
      company: validatedData.company,
      role: validatedData.role,
    })

    // Auto-reject if spam score is too high
    if (spamScore.verdict === 'spam') {
      console.log('Rejected spam submission:', {
        email: validatedData.email,
        score: spamScore.total,
        reason: spamScore.reason,
      })

      return new Response(
        JSON.stringify({
          error: 'Submission rejected',
          message: 'Your submission could not be processed. Please contact us directly if you believe this is an error.',
        }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      )
    }

    // Determine initial status based on spam score
    const initialStatus = spamScore.verdict === 'suspicious' ? 'review' : 'pending'

    // Submit to Directus with spam score
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
        status: initialStatus,
        email_sent: false,
        spam_score: spamScore.total,
        spam_factors: spamScore.factors,
      }),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      console.error('Directus API error:', response.status, errorData)

      // Check for duplicate email (unique constraint violation)
      if (response.status === 400 && (errorData as any).errors?.[0]?.extensions?.code === 'RECORD_NOT_UNIQUE') {
        return new Response(
          JSON.stringify({ error: 'This email is already on the waitlist' }),
          {
            status: 409,
            headers: { 'Content-Type': 'application/json' },
          }
        )
      }

      return new Response(
        JSON.stringify({ error: 'Failed to submit waitlist entry' }),
        {
          status: response.status,
          headers: { 'Content-Type': 'application/json' },
        }
      )
    }

    const data = await response.json()

    // Send confirmation email (non-blocking - don't fail submission if email fails)
    try {
      const emailTemplate = getWaitlistConfirmationEmail({
        firstName: validatedData.first_name,
        email: validatedData.email,
      })

      await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${context.env.RESEND_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: 'Chronos <waitlist@automatonicai.com>',
          to: validatedData.email,
          reply_to: 'geoff@automatonicai.com',
          subject: emailTemplate.subject,
          html: emailTemplate.html,
          text: emailTemplate.text,
        }),
      })

      console.log('Waitlist confirmation email sent to:', validatedData.email)
    } catch (emailError) {
      // Log error but don't fail the request - user is still on waitlist
      console.error('Failed to send confirmation email:', emailError)
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Successfully joined the waitlist',
        id: (data as any).data.id,
      }),
      {
        status: 201,
        headers: { 'Content-Type': 'application/json' },
      }
    )
  } catch (error) {
    console.error('Waitlist submission error:', error)

    // Handle Zod validation errors
    if (error instanceof z.ZodError) {
      return new Response(
        JSON.stringify({
          error: 'Invalid form data',
          details: error.issues,
        }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      )
    }

    // Handle other errors
    return new Response(
      JSON.stringify({ error: 'An unexpected error occurred' }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    )
  }
}

// Optional: Handle OPTIONS for CORS if needed
export async function onRequestOptions(): Promise<Response> {
  return new Response(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  })
}
