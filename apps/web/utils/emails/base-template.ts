/**
 * Base email template with maximum email client compatibility
 * Follows best practices for Gmail, Outlook, Apple Mail, etc.
 */

interface BaseEmailTemplateProps {
  title: string;
  preheader: string;
  userName: string;
  bodyContent: string;
  ctaText: string;
  ctaUrl: string;
  footerNote: string;
}

export function getBaseEmailTemplate({
  title,
  preheader,
  userName,
  bodyContent,
  ctaText,
  ctaUrl,
  footerNote,
}: BaseEmailTemplateProps) {
  return `
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
  <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <meta name="x-apple-disable-message-reformatting" />
  <title>${title}</title>
  <!--[if mso]>
  <style type="text/css">
    body, table, td {font-family: Arial, Helvetica, sans-serif !important;}
  </style>
  <![endif]-->
</head>
<body style="margin: 0; padding: 0; background-color: #0a0a0a; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
  <!-- Preheader text -->
  <div style="display: none; max-height: 0; overflow: hidden; mso-hide: all;">
    ${preheader}
  </div>

  <!-- Main container -->
  <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #0a0a0a;">
    <tr>
      <td align="center" style="padding: 40px 20px;">

        <!-- Email wrapper -->
        <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="600" style="max-width: 600px; background-color: #1a1a2e; border-radius: 16px;">

          <!-- Header with gradient background -->
          <tr>
            <td align="center" style="padding: 40px 40px 30px; background-color: #1e1e3a;">
              <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
                <tr>
                  <td align="center">
                    <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700; line-height: 1.2;">
                      ${title}
                    </h1>
                    <p style="margin: 12px 0 0; color: #a0a0b8; font-size: 16px; line-height: 1.5;">
                      Advanced financial analytics for the modern era
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding: 40px;">
              <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
                <tr>
                  <td>
                    <p style="margin: 0 0 20px; color: #e0e0e8; font-size: 16px; line-height: 1.6;">
                      Hi ${userName},
                    </p>
                    ${bodyContent}
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- CTA Button -->
          <tr>
            <td align="center" style="padding: 0 40px 40px;">
              <table role="presentation" border="0" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center" style="border-radius: 12px; background-color: #8b5cf6;">
                    <a href="${ctaUrl}" target="_blank" style="display: inline-block; padding: 16px 40px; color: #ffffff; text-decoration: none; font-weight: 600; font-size: 16px; line-height: 1;">
                      ${ctaText}
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Alternative link -->
          <tr>
            <td style="padding: 0 40px 40px;">
              <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
                <tr>
                  <td>
                    <p style="margin: 0 0 8px; color: #a0a0b8; font-size: 14px; line-height: 1.6;">
                      Or copy and paste this link into your browser:
                    </p>
                    <p style="margin: 0; padding: 12px; background-color: rgba(255, 255, 255, 0.05); border-radius: 8px; word-break: break-all;">
                      <a href="${ctaUrl}" target="_blank" style="color: #8b5cf6; text-decoration: none; font-size: 13px;">
                        ${ctaUrl}
                      </a>
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 30px 40px; background-color: rgba(0, 0, 0, 0.2); border-top: 1px solid rgba(255, 255, 255, 0.05);">
              <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
                <tr>
                  <td>
                    <p style="margin: 0 0 12px; color: #70707a; font-size: 13px; line-height: 1.5;">
                      ${footerNote}
                    </p>
                    <p style="margin: 0; color: #50505a; font-size: 12px;">
                      © ${new Date().getFullYear()} Chronos. All rights reserved.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}

/**
 * Generate plain text version of email
 */
export function getPlainTextEmail({
  userName,
  bodyText,
  ctaUrl,
  footerNote,
}: {
  userName: string;
  bodyText: string;
  ctaUrl: string;
  footerNote: string;
}) {
  return `
Hi ${userName},

${bodyText}

${ctaUrl}

${footerNote}

© ${new Date().getFullYear()} Chronos. All rights reserved.
  `.trim();
}
