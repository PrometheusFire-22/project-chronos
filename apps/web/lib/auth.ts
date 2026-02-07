import { betterAuth } from "better-auth";
import { Pool } from "pg";
import { getRequestContext } from "@opennextjs/cloudflare";

/**
 * Better Auth configuration with Cloudflare Hyperdrive support.
 *
 * - Production (Cloudflare): Uses Hyperdrive binding for connection pooling
 * - Development (Local): Uses direct DATABASE_URL
 *
 * Hyperdrive is required because Cloudflare Workers cannot establish
 * direct TCP connections to PostgreSQL, even with nodejs_compat.
 */

let _auth: ReturnType<typeof betterAuth> | null = null;

/**
 * Get database connection string.
 * - Cloudflare: Uses Hyperdrive binding (env.DB.connectionString)
 * - Local: Uses DATABASE_URL environment variable
 */
async function getDbConnectionString(): Promise<string> {
  // Try to get Hyperdrive connection string from Cloudflare binding
  try {
    const { env } = await getRequestContext();
    if (env?.DB?.connectionString) {
      console.log('[Auth] Using Hyperdrive connection');
      return env.DB.connectionString;
    }
  } catch (e) {
    // Not in Cloudflare context, fall through to DATABASE_URL
  }

  // Fallback to direct connection (local development)
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL is required');
  }

  console.log('[Auth] Using direct DATABASE_URL');
  return process.env.DATABASE_URL;
}

/**
 * Get or create Better Auth instance.
 * Lazy initialization allows us to access Hyperdrive binding at request time.
 */
export async function getAuth() {
  if (_auth) return _auth;

  const connectionString = await getDbConnectionString();
  const pool = new Pool({
    connectionString,
    ssl: false,
    max: 1,
  });

  _auth = betterAuth({
    database: pool,
    databaseType: "pg",
    schema: "auth",
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

  console.log("Auth initialized with baseURL:", process.env.BETTER_AUTH_URL || process.env.NEXT_PUBLIC_SITE_URL || "https://automatonicai.com");

  return _auth;
}

export type Auth = Awaited<ReturnType<typeof getAuth>>;
