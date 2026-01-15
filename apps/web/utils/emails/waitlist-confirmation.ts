/**
 * Waitlist Confirmation Email Template
 *
 * Simple HTML email sent to users when they join the waitlist
 */

interface WaitlistConfirmationProps {
  firstName: string
  email: string
}

export function getWaitlistConfirmationEmail({ firstName, email }: WaitlistConfirmationProps) {
  return {
    subject: 'Welcome to the Chronos Waitlist',
    html: `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome to Chronos</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #0f172a; color: #e2e8f0;">
  <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
    <!-- Header -->
    <div style="text-align: center; margin-bottom: 40px;">
      <h1 style="color: #ffffff; font-size: 28px; font-weight: 700; margin: 0;">Chronos</h1>
      <p style="color: #94a3b8; font-size: 14px; margin-top: 8px;">Multi-Model Relationship Intelligence</p>
    </div>

    <!-- Main Content -->
    <div style="background-color: #1e293b; border-radius: 12px; padding: 32px; border: 1px solid #334155;">
      <h2 style="color: #ffffff; font-size: 24px; font-weight: 600; margin-top: 0; margin-bottom: 16px;">
        Welcome to the Waitlist, ${firstName}!
      </h2>

      <p style="color: #cbd5e1; font-size: 16px; line-height: 1.6; margin-bottom: 16px;">
        Thank you for your interest in Chronos. We're building the most advanced multi-model platform for private market intelligence.
      </p>

      <p style="color: #cbd5e1; font-size: 16px; line-height: 1.6; margin-bottom: 24px;">
        You're now on our exclusive waitlist at <strong style="color: #ffffff;">${email}</strong>. We'll notify you as soon as we're ready to onboard new users.
      </p>

      <!-- Features Section -->
      <div style="background-color: #0f172a; border-radius: 8px; padding: 20px; margin-bottom: 24px;">
        <h3 style="color: #ffffff; font-size: 18px; font-weight: 600; margin-top: 0; margin-bottom: 16px;">
          What to Expect
        </h3>
        <ul style="color: #cbd5e1; font-size: 14px; line-height: 1.8; margin: 0; padding-left: 20px;">
          <li>Early access to our multi-model intelligence platform</li>
          <li>Graph database for relationship mapping</li>
          <li>Vector search for similarity analysis</li>
          <li>Time-series analytics for market trends</li>
          <li>Geospatial insights for location intelligence</li>
        </ul>
      </div>

      <p style="color: #94a3b8; font-size: 14px; line-height: 1.6; margin-bottom: 0;">
        We're working hard to bring you something special. Stay tuned!
      </p>
    </div>

    <!-- Footer -->
    <div style="text-align: center; margin-top: 32px; padding-top: 24px; border-top: 1px solid #334155;">
      <p style="color: #64748b; font-size: 12px; margin: 0 0 8px 0;">
        Chronos - Multi-Model Relationship Intelligence Platform
      </p>
      <p style="color: #64748b; font-size: 12px; margin: 0;">
        <a href="https://www.automatonicai.com" style="color: #818cf8; text-decoration: none;">www.automatonicai.com</a>
      </p>
    </div>
  </div>
</body>
</html>
    `.trim(),
    text: `
Welcome to the Chronos Waitlist, ${firstName}!

Thank you for your interest in Chronos. We're building the most advanced multi-model platform for private market intelligence.

You're now on our exclusive waitlist at ${email}. We'll notify you as soon as we're ready to onboard new users.

What to Expect:
- Early access to our multi-model intelligence platform
- Graph database for relationship mapping
- Vector search for similarity analysis
- Time-series analytics for market trends
- Geospatial insights for location intelligence

We're working hard to bring you something special. Stay tuned!

---
Chronos - Multi-Model Relationship Intelligence Platform
www.automatonicai.com
    `.trim(),
  }
}
