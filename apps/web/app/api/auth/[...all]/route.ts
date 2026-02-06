import { betterAuth } from "better-auth";
import { Pool } from "pg";
import { getRequestContext } from '@opennextjs/cloudflare';

/**
 * Better Auth handler with Cloudflare Hyperdrive support.
 * Creates database connection dynamically using Hyperdrive binding.
 */

async function getAuth() {
  let connectionString = process.env.DATABASE_URL;

  // Try to get Hyperdrive connection string in Cloudflare
  try {
    const { env } = await getRequestContext();
    if (env?.DB?.connectionString) {
      connectionString = env.DB.connectionString;
      console.log('[Auth] Using Hyperdrive connection');
    }
  } catch (e) {
    console.log('[Auth] Using DATABASE_URL (local dev)');
  }

  if (!connectionString) {
    throw new Error('No database connection available');
  }

  const pool = new Pool({
    connectionString,
    ssl: false,
    max: 1,
  });

  return betterAuth({
    database: pool,
    databaseType: "pg",
    schema: "auth",
    secret: process.env.BETTER_AUTH_SECRET!,
    baseURL: process.env.BETTER_AUTH_URL || process.env.NEXT_PUBLIC_SITE_URL || "https://automatonicai.com",
    basePath: "/api/auth",
    logger: { level: "debug" },
    trustedOrigins: ["https://automatonicai.com", "http://localhost:3000"],
    advanced: {
      cookiePrefix: "chronos",
      useSecureCookies: process.env.NODE_ENV === "production",
    },
    emailAndPassword: {
      enabled: true,
      async sendResetPassword({ user, url }: { user: any; url: string }) {
        const { Resend } = await import("resend");
        const { getPasswordResetEmail } = await import("../../../../utils/emails/password-reset-email");
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
        const { getVerificationEmail } = await import("../../../../utils/emails/verification-email");
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
      fields: {
        emailVerified: "email_verified",
        createdAt: "created_at",
        updatedAt: "updated_at"
      },
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

export async function GET(request: Request) {
  const auth = await getAuth();
  return auth.handler(request);
}

export async function POST(request: Request) {
  const auth = await getAuth();
  return auth.handler(request);
}
