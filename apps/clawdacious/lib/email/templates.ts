// Email brand constants — mirrors the app's design system
const BRAND = {
  coral: '#E85D5D',
  dark: '#0F1117',
  darkText: '#0F172A',
  white: '#FFFFFF',
  offWhite: '#F8FAFC',
  muted: '#64748B',
  mutedLight: '#94A3B8',
  border: '#E2E8F0',
  borderLight: '#F1F5F9',
  font: `-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif`,
  logo: 'https://clawdacious.com/logos/cornelius-consierge.png',
  site: 'https://clawdacious.com',
}

export interface ContactEmailData {
  name: string
  email: string
  company?: string
  subject: string
  subjectLabel: string
  message: string
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}

function getFirstName(name: string): string {
  return escapeHtml(name.trim().split(' ')[0])
}

function formatMessageAsHtml(message: string): string {
  return escapeHtml(message).replace(/\n/g, '<br>')
}

function formatTimestamp(): string {
  return new Date().toLocaleString('en-CA', {
    timeZone: 'America/Toronto',
    dateStyle: 'medium',
    timeStyle: 'short',
  })
}

// ─── Internal notification email (to Geoff) ───────────────────────────────────

export function internalNotificationEmail(data: ContactEmailData): string {
  const name = escapeHtml(data.name)
  const email = escapeHtml(data.email)
  const company = data.company ? escapeHtml(data.company) : null
  const subjectLabel = escapeHtml(data.subjectLabel)
  const message = formatMessageAsHtml(data.message)
  const firstName = getFirstName(data.name)
  const timestamp = formatTimestamp()
  const replySubject = encodeURIComponent(`Re: ${data.subjectLabel}`)
  const year = new Date().getFullYear()

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>New Lead: ${subjectLabel} from ${name}</title>
</head>
<body style="margin:0;padding:0;background-color:#F8FAFC;font-family:${BRAND.font};">
  <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="background-color:#F8FAFC;padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" role="presentation" style="max-width:600px;width:100%;">

          <!-- ── Header ── -->
          <tr>
            <td style="background-color:${BRAND.dark};border-radius:12px 12px 0 0;padding:24px 32px;">
              <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
                <tr>
                  <td valign="middle" width="60">
                    <img src="${BRAND.logo}" alt="Cornelius" width="48" height="48"
                      style="border-radius:8px;display:block;object-fit:cover;" />
                  </td>
                  <td valign="middle" style="padding-left:12px;">
                    <div style="color:${BRAND.coral};font-size:11px;font-weight:700;letter-spacing:2px;text-transform:uppercase;">Clawdacious</div>
                    <div style="color:${BRAND.white};font-size:17px;font-weight:700;margin-top:3px;">New Contact Form Submission</div>
                  </td>
                  <td valign="middle" align="right">
                    <span style="background-color:${BRAND.coral};color:${BRAND.white};font-size:11px;font-weight:700;letter-spacing:1px;text-transform:uppercase;padding:5px 12px;border-radius:20px;">NEW LEAD</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- ── Body ── -->
          <tr>
            <td style="background-color:${BRAND.white};padding:32px;border-left:1px solid ${BRAND.border};border-right:1px solid ${BRAND.border};">

              <!-- Subject badge -->
              <div style="margin-bottom:24px;">
                <span style="background-color:#FEF2F2;color:${BRAND.coral};border:1px solid #FECACA;font-size:12px;font-weight:600;padding:5px 14px;border-radius:20px;">${subjectLabel}</span>
              </div>

              <!-- Lead details table -->
              <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="margin-bottom:24px;">
                <tr>
                  <td style="padding:10px 0;border-bottom:1px solid ${BRAND.borderLight};width:28%;vertical-align:middle;">
                    <span style="color:${BRAND.mutedLight};font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.5px;">Name</span>
                  </td>
                  <td style="padding:10px 0;border-bottom:1px solid ${BRAND.borderLight};vertical-align:middle;">
                    <span style="color:${BRAND.darkText};font-size:15px;font-weight:600;">${name}</span>
                  </td>
                </tr>
                <tr>
                  <td style="padding:10px 0;border-bottom:1px solid ${BRAND.borderLight};vertical-align:middle;">
                    <span style="color:${BRAND.mutedLight};font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.5px;">Email</span>
                  </td>
                  <td style="padding:10px 0;border-bottom:1px solid ${BRAND.borderLight};vertical-align:middle;">
                    <a href="mailto:${email}" style="color:${BRAND.coral};font-size:15px;text-decoration:none;">${email}</a>
                  </td>
                </tr>
                ${company ? `
                <tr>
                  <td style="padding:10px 0;border-bottom:1px solid ${BRAND.borderLight};vertical-align:middle;">
                    <span style="color:${BRAND.mutedLight};font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.5px;">Company</span>
                  </td>
                  <td style="padding:10px 0;border-bottom:1px solid ${BRAND.borderLight};vertical-align:middle;">
                    <span style="color:${BRAND.darkText};font-size:15px;">${company}</span>
                  </td>
                </tr>
                ` : ''}
                <tr>
                  <td style="padding:10px 0;vertical-align:middle;">
                    <span style="color:${BRAND.mutedLight};font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.5px;">Received</span>
                  </td>
                  <td style="padding:10px 0;vertical-align:middle;">
                    <span style="color:${BRAND.muted};font-size:14px;">${timestamp} ET</span>
                  </td>
                </tr>
              </table>

              <!-- Message -->
              <div style="margin-bottom:28px;">
                <div style="color:${BRAND.mutedLight};font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.5px;margin-bottom:10px;">Message</div>
                <div style="background-color:${BRAND.offWhite};border-left:3px solid ${BRAND.coral};border-radius:0 8px 8px 0;padding:16px 20px;color:#334155;font-size:15px;line-height:1.75;">${message}</div>
              </div>

              <!-- Reply CTA -->
              <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
                <tr>
                  <td align="center">
                    <a href="mailto:${email}?subject=${replySubject}"
                      style="display:inline-block;background-color:${BRAND.coral};color:${BRAND.white};font-size:14px;font-weight:700;text-decoration:none;padding:13px 36px;border-radius:8px;letter-spacing:0.3px;">
                      Reply to ${firstName}
                    </a>
                  </td>
                </tr>
              </table>

            </td>
          </tr>

          <!-- ── Footer ── -->
          <tr>
            <td style="background-color:${BRAND.offWhite};border:1px solid ${BRAND.border};border-top:0;border-radius:0 0 12px 12px;padding:16px 32px;text-align:center;">
              <p style="color:${BRAND.mutedLight};font-size:12px;margin:0;">
                Sent from the contact form at
                <a href="${BRAND.site}" style="color:${BRAND.coral};text-decoration:none;">clawdacious.com</a>
                &nbsp;·&nbsp; © ${year} Clawdacious
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`
}

// ─── Confirmation email (to the person who submitted) ─────────────────────────

export function confirmationEmail(data: ContactEmailData): string {
  const name = escapeHtml(data.name)
  const company = data.company ? escapeHtml(data.company) : null
  const subjectLabel = escapeHtml(data.subjectLabel)
  const firstName = getFirstName(data.name)
  const year = new Date().getFullYear()

  // Truncate long messages gracefully in the recap
  const rawMessage = data.message.length > 220
    ? data.message.substring(0, 220).trimEnd() + '…'
    : data.message
  const messageSummary = escapeHtml(rawMessage)

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>We received your message — Clawdacious</title>
</head>
<body style="margin:0;padding:0;background-color:#F8FAFC;font-family:${BRAND.font};">
  <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="background-color:#F8FAFC;padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" role="presentation" style="max-width:600px;width:100%;">

          <!-- ── Header ── -->
          <tr>
            <td style="background-color:${BRAND.dark};border-radius:12px 12px 0 0;padding:36px 32px;text-align:center;">
              <img src="${BRAND.logo}" alt="Cornelius the AI Concierge" width="64" height="64"
                style="border-radius:12px;display:block;margin:0 auto 18px;object-fit:cover;" />
              <div style="color:${BRAND.coral};font-size:12px;font-weight:700;letter-spacing:3px;text-transform:uppercase;margin-bottom:6px;">CLAWDACIOUS</div>
              <div style="color:${BRAND.mutedLight};font-size:12px;letter-spacing:1px;">Your Business Never Misses Another Lead</div>
            </td>
          </tr>

          <!-- ── Body ── -->
          <tr>
            <td style="background-color:${BRAND.white};padding:40px 32px;border-left:1px solid ${BRAND.border};border-right:1px solid ${BRAND.border};">

              <!-- Greeting -->
              <h1 style="color:${BRAND.darkText};font-size:24px;font-weight:700;margin:0 0 14px 0;">Thanks for reaching out, ${firstName}!</h1>
              <p style="color:#475569;font-size:16px;line-height:1.75;margin:0 0 32px 0;">
                We've received your message and will get back to you within
                <strong style="color:${BRAND.darkText};">24 hours</strong>.
                Here's a recap of what you sent:
              </p>

              <!-- Submission recap card -->
              <table width="100%" cellpadding="0" cellspacing="0" role="presentation"
                style="background-color:${BRAND.offWhite};border:1px solid ${BRAND.border};border-radius:10px;margin-bottom:32px;">
                <tr>
                  <td style="padding:18px 24px 12px;">
                    <div style="color:${BRAND.mutedLight};font-size:11px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;">Your Submission</div>
                  </td>
                </tr>
                <tr>
                  <td style="padding:0 24px 18px;">
                    <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
                      <tr>
                        <td style="padding:10px 0;border-top:1px solid ${BRAND.border};width:32%;vertical-align:top;">
                          <span style="color:${BRAND.muted};font-size:13px;font-weight:500;">Topic</span>
                        </td>
                        <td style="padding:10px 0;border-top:1px solid ${BRAND.border};vertical-align:top;">
                          <span style="background-color:#FEF2F2;color:${BRAND.coral};border:1px solid #FECACA;font-size:12px;font-weight:600;padding:3px 10px;border-radius:12px;">${subjectLabel}</span>
                        </td>
                      </tr>
                      ${company ? `
                      <tr>
                        <td style="padding:10px 0;border-top:1px solid ${BRAND.border};vertical-align:top;">
                          <span style="color:${BRAND.muted};font-size:13px;font-weight:500;">Company</span>
                        </td>
                        <td style="padding:10px 0;border-top:1px solid ${BRAND.border};vertical-align:top;">
                          <span style="color:#334155;font-size:14px;">${company}</span>
                        </td>
                      </tr>
                      ` : ''}
                      <tr>
                        <td style="padding:10px 0;border-top:1px solid ${BRAND.border};vertical-align:top;">
                          <span style="color:${BRAND.muted};font-size:13px;font-weight:500;">Message</span>
                        </td>
                        <td style="padding:10px 0;border-top:1px solid ${BRAND.border};vertical-align:top;">
                          <span style="color:#334155;font-size:14px;line-height:1.65;">${messageSummary}</span>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- What happens next -->
              <div style="margin-bottom:32px;">
                <div style="color:${BRAND.mutedLight};font-size:11px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;margin-bottom:18px;">What Happens Next</div>

                <!-- Step 1 -->
                <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="margin-bottom:14px;">
                  <tr>
                    <td width="44" valign="top">
                      <div style="width:28px;height:28px;background-color:${BRAND.coral};border-radius:50%;color:${BRAND.white};font-size:13px;font-weight:700;text-align:center;line-height:28px;">1</div>
                    </td>
                    <td valign="top" style="padding-top:4px;">
                      <div style="color:${BRAND.darkText};font-size:14px;font-weight:600;margin-bottom:3px;">Review</div>
                      <div style="color:${BRAND.muted};font-size:13px;line-height:1.55;">We'll read your message carefully and understand exactly what you're looking for.</div>
                    </td>
                  </tr>
                </table>

                <!-- Step 2 -->
                <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="margin-bottom:14px;">
                  <tr>
                    <td width="44" valign="top">
                      <div style="width:28px;height:28px;background-color:${BRAND.coral};border-radius:50%;color:${BRAND.white};font-size:13px;font-weight:700;text-align:center;line-height:28px;">2</div>
                    </td>
                    <td valign="top" style="padding-top:4px;">
                      <div style="color:${BRAND.darkText};font-size:14px;font-weight:600;margin-bottom:3px;">Response</div>
                      <div style="color:${BRAND.muted};font-size:13px;line-height:1.55;">You'll hear from us within 24 hours — often much sooner.</div>
                    </td>
                  </tr>
                </table>

                <!-- Step 3 -->
                <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
                  <tr>
                    <td width="44" valign="top">
                      <div style="width:28px;height:28px;background-color:${BRAND.coral};border-radius:50%;color:${BRAND.white};font-size:13px;font-weight:700;text-align:center;line-height:28px;">3</div>
                    </td>
                    <td valign="top" style="padding-top:4px;">
                      <div style="color:${BRAND.darkText};font-size:14px;font-weight:600;margin-bottom:3px;">Action</div>
                      <div style="color:${BRAND.muted};font-size:13px;line-height:1.55;">We'll map out exactly how to put AI to work for you — no fluff, just results.</div>
                    </td>
                  </tr>
                </table>
              </div>

              <!-- Urgent contact callout -->
              <table width="100%" cellpadding="0" cellspacing="0" role="presentation"
                style="background-color:#FEF2F2;border:1px solid #FECACA;border-radius:8px;">
                <tr>
                  <td style="padding:16px 22px;text-align:center;">
                    <p style="color:#7F1D1D;font-size:13px;line-height:1.65;margin:0;">
                      Need something urgent? Reach us directly at
                      <a href="mailto:geoff@clawdacious.com" style="color:${BRAND.coral};font-weight:600;text-decoration:none;">geoff@clawdacious.com</a><br>
                      or call <a href="tel:+14168246865" style="color:${BRAND.coral};font-weight:600;text-decoration:none;">(416) 824-6865</a>.
                    </p>
                  </td>
                </tr>
              </table>

            </td>
          </tr>

          <!-- ── Footer ── -->
          <tr>
            <td style="background-color:${BRAND.dark};border-radius:0 0 12px 12px;padding:24px 32px;text-align:center;">
              <p style="color:#475569;font-size:12px;margin:0 0 6px 0;">© ${year} Clawdacious &nbsp;·&nbsp; Greater Toronto Area, Canada</p>
              <p style="color:${BRAND.coral};font-size:11px;font-weight:700;letter-spacing:2px;text-transform:uppercase;margin:0;">Your Business Never Misses Another Lead</p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`
}
