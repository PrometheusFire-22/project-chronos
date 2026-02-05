import { getBaseEmailTemplate, getPlainTextEmail } from './base-template';

interface VerificationEmailProps {
  userName: string;
  verificationUrl: string;
}

export function getVerificationEmail({ userName, verificationUrl }: VerificationEmailProps) {
  const bodyContent = `
    <p style="margin: 0 0 20px; color: #e0e0e8; font-size: 16px; line-height: 1.6;">
      Thanks for signing up! Please verify your email address to activate your account and start using Chronos.
    </p>
  `;

  const html = getBaseEmailTemplate({
    title: 'Welcome to Chronos',
    preheader: 'Verify your email to get started with Chronos',
    userName,
    bodyContent,
    ctaText: 'Verify Email Address',
    ctaUrl: verificationUrl,
    footerNote: 'This link will expire in 24 hours. If you didn\'t create an account with Chronos, you can safely ignore this email.',
  });

  const text = getPlainTextEmail({
    userName,
    bodyText: 'Thanks for signing up! Please verify your email address to activate your account and start using Chronos.',
    ctaUrl: verificationUrl,
    footerNote: 'This link will expire in 24 hours. If you didn\'t create an account with Chronos, you can safely ignore this email.',
  });

  return {
    subject: 'Verify your Chronos account',
    html,
    text,
  };
}
