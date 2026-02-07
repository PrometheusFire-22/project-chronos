import { betterAuth } from "better-auth";
import { Pool } from "pg";
import { getCloudflareContext } from "@opennextjs/cloudflare";

/**
 * Better Auth configuration factory.
 *
 * Creates auth instance per-request to access Cloudflare bindings.
 * Uses Hyperdrive for connection pooling when deployed to Cloudflare.
 * Falls back to DATABASE_URL env var for local development.
 */

function getConnectionString(): string {
  // Try Cloudflare Hyperdrive binding first (production)
  try {
    const ctx = getCloudflareContext();
    if (ctx?.env?.DB?.connectionString) {
      console.log("[Auth] Using Hyperdrive connection");
      return ctx.env.DB.connectionString;
    }
  } catch {
    // Not in Cloudflare context (local dev)
  }

  // Fall back to environment variable (local dev)
  if (process.env.DATABASE_URL) {
    console.log("[Auth] Using DATABASE_URL from environment");
    return process.env.DATABASE_URL;
  }

  throw new Error("No database connection available. Set DATABASE_URL or configure Hyperdrive binding.");
}

function createAuthConfig() {
  const connectionString = getConnectionString();

  const pool = new Pool({
    connectionString,
    ssl: { rejectUnauthorized: false },
    max: 5,
    connectionTimeoutMillis: 10000,
  });

  return betterAuth({
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
      expiresIn: 60 * 60 * 24 * 7,
      updateAge: 60 * 60 * 24,
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

// Cache for auth instance (only used within a single request)
let cachedAuth: ReturnType<typeof createAuthConfig> | null = null;

/**
 * Get or create auth instance.
 * Creates new instance on first call within request context.
 */
export function getAuth() {
  if (!cachedAuth) {
    cachedAuth = createAuthConfig();
  }
  return cachedAuth;
}

// Legacy export for backwards compatibility with auth-client
export const auth = {
  get handler() {
    return getAuth().handler;
  },
  get api() {
    return getAuth().api;
  }
};

export type Auth = ReturnType<typeof createAuthConfig>;
