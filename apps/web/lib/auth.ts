/**
 * Auth configuration using Drizzle Adapter.
 *
 * Uses postgres.js driver (same as @chronos/database) with drizzleAdapter
 * to ensure schema-qualified table names (auth.user, auth.session, etc.)
 */

import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import * as authSchema from "@chronos/database/schema/auth";

export type AuthUser = {
  id: string;
  email: string;
  emailVerified: boolean;
  name: string;
  firstName?: string;
  lastName?: string;
  image?: string | null;
  createdAt: Date;
  updatedAt: Date;
};

/**
 * Get database connection string.
 * MUST be called within request context for Cloudflare bindings.
 */
async function getConnectionString(): Promise<string> {
  // Try Cloudflare Hyperdrive binding first (production)
  try {
    const { getCloudflareContext } = await import("@opennextjs/cloudflare");
    const ctx = getCloudflareContext();
    if (ctx?.env?.DB?.connectionString) {
      console.log("[Auth] Using Hyperdrive connection");
      return ctx.env.DB.connectionString;
    }
  } catch (e) {
    // Not in Cloudflare context (local dev)
    console.log("[Auth] getCloudflareContext not available:", e);
  }

  // Fall back to environment variable (local dev)
  if (process.env.DATABASE_URL) {
    console.log("[Auth] Using DATABASE_URL");
    return process.env.DATABASE_URL;
  }

  throw new Error("No database connection available");
}

/**
 * Get auth instance - creates lazily per request.
 * Safe to call from any route handler.
 */
export async function getAuth() {
  const connectionString = await getConnectionString();

  // Create postgres.js client (same driver used by @chronos/database)
  const sql = postgres(connectionString, {
    ssl: { rejectUnauthorized: false },
    max: 1,
    idle_timeout: 1,
    connect_timeout: 10,
    prepare: false, // Required for Hyperdrive
  });

  // Create Drizzle instance with auth schema
  const db = drizzle(sql, { schema: authSchema });

  return betterAuth({
    database: drizzleAdapter(db, {
      provider: "pg",
      schema: authSchema,
    }),
    secret: process.env.BETTER_AUTH_SECRET!,
    baseURL: process.env.BETTER_AUTH_URL || process.env.NEXT_PUBLIC_SITE_URL || "https://automatonicai.com",
    basePath: "/api/auth",
    logger: { level: "debug" },
    trustedOrigins: [
      "https://automatonicai.com",
      "https://project-chronos.pages.dev",
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
        if (!process.env.RESEND_API_KEY) throw new Error("RESEND_API_KEY not configured");
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
        if (!process.env.RESEND_API_KEY) throw new Error("RESEND_API_KEY not configured");
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
      fields: { emailVerified: "email_verified", createdAt: "created_at", updatedAt: "updated_at" },
      additionalFields: {
        firstName: { type: "string", required: false },
        lastName: { type: "string", required: false }
      }
    },
    session: {
      modelName: "session",
      expiresIn: 60 * 60 * 24 * 7,
      updateAge: 60 * 60 * 24,
      fields: {
        userId: "user_id", expiresAt: "expires_at", ipAddress: "ip_address",
        userAgent: "user_agent", createdAt: "created_at", updatedAt: "updated_at"
      }
    },
    account: {
      modelName: "account",
      fields: {
        userId: "user_id", accountId: "account_id", providerId: "provider_id",
        accessToken: "access_token", refreshToken: "refresh_token",
        accessTokenExpiresAt: "access_token_expires_at",
        refreshTokenExpiresAt: "refresh_token_expires_at",
        createdAt: "created_at", updatedAt: "updated_at"
      }
    },
  });
}
