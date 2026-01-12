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
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;700&display=swap" rel="stylesheet">
  <title>Welcome to Chronos</title>
  <!--[if mso]>
  <style>
    body, table, td, h1, h2, h3, p, a {
      font-family: 'Calibri', 'Trebuchet MS', sans-serif !important;
    }
  </style>
  <![endif]-->
</head>
<body style="margin: 0; padding: 0; font-family: 'Poppins', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #020420; color: #e2e8f0;">
  <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
    <!-- Header -->
    <div style="text-align: center; margin-bottom: 40px;">
      <h1 style="color: #ffffff; font-size: 36px; font-weight: 700; margin: 0; line-height: 1.2;">
        <span style="background: linear-gradient(90deg, #E2B6FF, #C390F8, #A369F0); -webkit-background-clip: text; -webkit-text-fill-color: transparent; color: #C390F8;">Chronos</span>
      </h1>
      <p style="color: #94a3b8; font-size: 14px; margin-top: 8px; font-weight: 400;">Multi-Model Relationship Intelligence</p>
    </div>

    <!-- Main Content -->
    <div style="background: linear-gradient(145deg, rgba(30, 41, 59, 0.5), rgba(15, 23, 42, 0.5)); border-radius: 16px; padding: 32px; border: 1px solid #334155; box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.37);">
      <h2 style="color: #ffffff; font-size: 24px; font-weight: 600; margin-top: 0; margin-bottom: 16px;">
        Welcome to the Waitlist, ${firstName}!
      </h2>

      <p style="color: #cbd5e1; font-size: 16px; line-height: 1.7; margin-bottom: 16px;">
        Thank you for your interest in Chronos. We're building the most advanced multi-model platform for private market intelligence.
      </p>

      <p style="color: #cbd5e1; font-size: 16px; line-height: 1.7; margin-bottom: 24px;">
        You're now on our exclusive waitlist at <strong style="color: #ffffff; font-weight: 600;">${email}</strong>. We'll notify you as soon as we're ready to onboard new users.
      </p>

      <!-- Features Section -->
      <div style="background-color: rgba(2, 4, 32, 0.7); border-radius: 8px; padding: 24px; margin-bottom: 24px; border: 1px solid #334155;">
        <h3 style="color: #ffffff; font-size: 18px; font-weight: 600; margin-top: 0; margin-bottom: 16px;">
          What to Expect
        </h3>
        <ul style="color: #cbd5e1; font-size: 14px; line-height: 1.8; margin: 0; padding-left: 20px;">
          <li style="margin-bottom: 8px;">Early access to our multi-model intelligence platform</li>
          <li style="margin-bottom: 8px;">Graph database for relationship mapping</li>
          <li style="margin-bottom: 8px;">Vector search for similarity analysis</li>
          <li style="margin-bottom: 8px;">Time-series analytics for market trends</li>
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
        <a href="https://www.automatonicai.com" style="color: #A369F0; text-decoration: none;">www.automatonicai.com</a>
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
