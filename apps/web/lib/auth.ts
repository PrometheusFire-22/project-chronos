import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { drizzle } from 'drizzle-orm/neon-serverless';
import { Pool } from '@neondatabase/serverless';
import * as authSchema from '@chronos/database';

/**
 * Better Auth configuration with Cloudflare Hyperdrive support.
 *
 * Environment detection:
 * - Cloudflare Workers: Uses Hyperdrive binding (env.DB.connectionString)
 * - Local dev: Uses DATABASE_URL from .env.local
 *
 * @neondatabase/serverless works with:
 * - Standard PostgreSQL (via connection string)
 * - Cloudflare Hyperdrive (via binding)
 */

// Function to create auth instance with runtime environment
function createAuth(connectionString: string) {
  const pool = new Pool({ connectionString });

  const db = drizzle(pool, {
    schema: {
      user: authSchema.user,
      session: authSchema.session,
      account: authSchema.account,
      verification: authSchema.verification,
    },
  });

  return betterAuth({
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
    baseURL: process.env.BETTER_AUTH_URL || process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
    basePath: "/api/auth",
    logger: {
      level: "debug",
    },
    trustedOrigins: [
      "https://automatonicai.com",
      "http://localhost:3000",
      ...(process.env.NEXT_PUBLIC_SITE_URL ? [process.env.NEXT_PUBLIC_SITE_URL] : [])
    ],
    emailAndPassword: {
      enabled: true,
      async sendResetPassword({ user, url }: { user: any; url: string }) {
        console.log("Attempting to send password reset email to:", user.email);
        const { Resend } = await import("resend");
        const { getPasswordResetEmail } = await import("../utils/emails/password-reset-email");

        if (!process.env.RESEND_API_KEY) {
          console.error("RESEND_API_KEY is not defined");
          throw new Error("Email configuration missing");
        }

        const resend = new Resend(process.env.RESEND_API_KEY);

        const emailContent = getPasswordResetEmail({
          userName: user.name || user.email.split('@')[0],
          resetUrl: url,
        });

        try {
          const result = await resend.emails.send({
            from: "Chronos <updates@automatonicai.com>",
            to: user.email,
            subject: emailContent.subject,
            html: emailContent.html,
            text: emailContent.text,
          });
          console.log("Resend API response:", result);
        } catch (err: any) {
          console.error("Resend send error:", err);
          throw err;
        }
      },
    },
    emailVerification: {
      sendOnSignUp: true,
      async sendVerificationEmail({ user, url }: { user: any; url: string }) {
        console.log("Attempting to send verification email to:", user.email);
        const { Resend } = await import("resend");
        const { getVerificationEmail } = await import("../utils/emails/verification-email");

        if (!process.env.RESEND_API_KEY) {
          console.error("RESEND_API_KEY is not defined");
          throw new Error("Email configuration missing");
        }

        const resend = new Resend(process.env.RESEND_API_KEY);

        const emailContent = getVerificationEmail({
          userName: user.name || user.email.split('@')[0],
          verificationUrl: url,
        });

        try {
          const result = await resend.emails.send({
            from: "Chronos <updates@automatonicai.com>",
            to: user.email,
            subject: emailContent.subject,
            html: emailContent.html,
            text: emailContent.text,
          });
          console.log("Resend API response:", result);
        } catch (err: any) {
          console.error("Resend send error:", err);
          throw err;
        }
      },
    },
  });
}

// Default export for build-time (uses DATABASE_URL)
export const auth = createAuth(process.env.DATABASE_URL!);

// Export factory for runtime configuration
export { createAuth };

console.log("Auth initialized with baseURL:", process.env.BETTER_AUTH_URL || process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000");

export type Auth = typeof auth;
