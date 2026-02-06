import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';
import type { NextRequest } from "next/server";
import * as authSchema from '@chronos/database';

/**
 * Better Auth API Route Handler with Hyperdrive support
 *
 * This uses neon HTTP driver which works over HTTPS, not WebSockets.
 * Compatible with standard PostgreSQL servers.
 */

// Cache auth instance to avoid recreating on every request
let authInstance: any = null;

function getAuthInstance() {
  if (authInstance) return authInstance;

  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    throw new Error('DATABASE_URL is not set');
  }

  // Use neon HTTP driver instead of WebSocket Pool
  const sql = neon(connectionString);
  const db = drizzle(sql, {
    schema: {
      user: authSchema.user,
      session: authSchema.session,
      account: authSchema.account,
      verification: authSchema.verification,
    },
  });

  authInstance = betterAuth({
    database: drizzleAdapter(db, {
      provider: "pg",
      schema: {
        user: authSchema.user,
        session: authSchema.session,
        account: authSchema.account,
        verification: authSchema.verification,
      },
    }),
    secret: process.env.BETTER_AUTH_SECRET!,
    baseURL: process.env.BETTER_AUTH_URL || process.env.NEXT_PUBLIC_SITE_URL || "https://automatonicai.com",
    basePath: "/api/auth",
    logger: {
      level: "debug",
    },
    trustedOrigins: [
      "https://automatonicai.com",
      "http://localhost:3000",
    ],
    emailAndPassword: {
      enabled: true,
      async sendResetPassword({ user, url }: { user: any; url: string }) {
        const { Resend } = await import("resend");
        const { getPasswordResetEmail } = await import("../../../../utils/emails/password-reset-email");

        if (!process.env.RESEND_API_KEY) {
          throw new Error("RESEND_API_KEY not configured");
        }

        const resend = new Resend(process.env.RESEND_API_KEY);
        const emailContent = getPasswordResetEmail({
          userName: user.name || user.email.split('@')[0],
          resetUrl: url,
        });

        await resend.emails.send({
          from: "Chronos <updates@automatonicai.com>",
          to: user.email,
          subject: emailContent.subject,
          html: emailContent.html,
          text: emailContent.text,
        });
      },
    },
    emailVerification: {
      sendOnSignUp: true,
      async sendVerificationEmail({ user, url }: { user: any; url: string }) {
        const { Resend } = await import("resend");
        const { getVerificationEmail } = await import("../../../../utils/emails/verification-email");

        if (!process.env.RESEND_API_KEY) {
          throw new Error("RESEND_API_KEY not configured");
        }

        const resend = new Resend(process.env.RESEND_API_KEY);
        const emailContent = getVerificationEmail({
          userName: user.name || user.email.split('@')[0],
          verificationUrl: url,
        });

        await resend.emails.send({
          from: "Chronos <updates@automatonicai.com>",
          to: user.email,
          subject: emailContent.subject,
          html: emailContent.html,
          text: emailContent.text,
        });
      },
    },
  });

  return authInstance;
}

export async function GET(request: NextRequest) {
  const auth = getAuthInstance();
  return auth.handler(request);
}

export async function POST(request: NextRequest) {
  const auth = getAuthInstance();
  return auth.handler(request);
}
