import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import * as authSchema from "@chronos/database/schema/auth";

/**
 * Better Auth configuration using Drizzle adapter with postgres.js.
 * Creates auth instance lazily to avoid blocking Worker initialization.
 */

let authInstance: ReturnType<typeof betterAuth> | null = null;

function createAuth() {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL environment variable is required');
  }

  // Create postgres client with aggressive timeouts
  const queryClient = postgres(process.env.DATABASE_URL, {
    max: 1,
    connect_timeout: 3,
    idle_timeout: 10,
    // Critical: Don't connect on creation
    connection: {
      application_name: 'chronos-auth',
    },
  });

  const db = drizzle(queryClient);

  return betterAuth({
    database: drizzleAdapter(db, {
      provider: "pg",
      schema: authSchema,
    }),
    secret: process.env.BETTER_AUTH_SECRET!,
    baseURL: process.env.BETTER_AUTH_URL || process.env.NEXT_PUBLIC_SITE_URL || "https://automatonicai.com",
    basePath: "/api/auth",
    logger: {
      level: "error", // Reduce logging
    },
    trustedOrigins: [
      "https://automatonicai.com",
      "http://localhost:3000",
    ],
    advanced: {
      cookiePrefix: "chronos",
      useSecureCookies: process.env.NODE_ENV === "production",
    },
    emailAndPassword: {
      enabled: true,
      async sendResetPassword({ user, url }: { user: any; url: string }) {
        const { Resend } = await import("resend");
        const { getPasswordResetEmail } = await import("../utils/emails/password-reset-email");

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
        const { getVerificationEmail } = await import("../utils/emails/verification-email");

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
    user: {
      modelName: "user",
      fields: {
        emailVerified: "email_verified",
        createdAt: "created_at",
        updatedAt: "updated_at"
      },
      additionalFields: {
        firstName: {
          type: "string",
          required: false
        },
        lastName: {
          type: "string",
          required: false
        }
      }
    },
    session: {
      modelName: "session",
      expiresIn: 60 * 60 * 24 * 7, // 7 days
      updateAge: 60 * 60 * 24, // Update session every 24 hours
      fields: {
        userId: "user_id",
        expiresAt: "expires_at",
        ipAddress: "ip_address",
        userAgent: "user_agent",
        createdAt: "created_at",
        updatedAt: "updated_at"
      }
    },
    account: {
      modelName: "account",
      fields: {
        userId: "user_id",
        accountId: "account_id",
        providerId: "provider_id",
        accessToken: "access_token",
        refreshToken: "refresh_token",
        accessTokenExpiresAt: "access_token_expires_at",
        refreshTokenExpiresAt: "refresh_token_expires_at",
        createdAt: "created_at",
        updatedAt: "updated_at"
      }
    },
  });
}

// Lazy singleton: only create auth when first accessed
export const auth = new Proxy({} as ReturnType<typeof betterAuth>, {
  get(target, prop) {
    if (!authInstance) {
      console.log('[AUTH] Lazy initializing auth instance');
      authInstance = createAuth();
    }
    return (authInstance as any)[prop];
  }
});

export type Auth = typeof auth;
