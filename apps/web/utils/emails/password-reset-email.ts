import { getBaseEmailTemplate, getPlainTextEmail } from './base-template';

interface PasswordResetEmailProps {
  userName: string;
  resetUrl: string;
}

export function getPasswordResetEmail({ userName, resetUrl }: PasswordResetEmailProps) {
  const bodyContent = `
    <p style="margin: 0 0 20px; color: #e0e0e8; font-size: 16px; line-height: 1.6;">
      We received a request to reset your password. Click the button below to create a new password.
    </p>
    <p style="margin: 0 0 20px; color: #e0e0e8; font-size: 16px; line-height: 1.6;">
      If you didn't request a password reset, you can safely ignore this email. Your password will remain unchanged.
    </p>
  `;

  const html = getBaseEmailTemplate({
    title: 'Reset Your Password',
    preheader: 'Reset your Chronos account password',
    userName,
    bodyContent,
    ctaText: 'Reset Password',
    ctaUrl: resetUrl,
    footerNote: 'This link will expire in 1 hour. If you didn\'t request a password reset, please ignore this email.',
  });

  const text = getPlainTextEmail({
    userName,
    bodyText: 'We received a request to reset your password. Click the link below to create a new password.\n\nIf you didn\'t request a password reset, you can safely ignore this email.',
    ctaUrl: resetUrl,
    footerNote: 'This link will expire in 1 hour. If you didn\'t request a password reset, please ignore this email.',
  });

  return {
    subject: 'Reset your Chronos password',
    html,
    text,
  };
}
