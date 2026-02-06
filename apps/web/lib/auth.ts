import { betterAuth } from "better-auth";
import postgres from "postgres";

/**
 * Better Auth configuration using postgres.js (edge-compatible).
 * Works natively on Cloudflare Pages edge runtime - no Node.js compatibility needed.
 */

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is required');
}

const queryClient = postgres(process.env.DATABASE_URL, {
  max: 1, // Cloudflare edge: minimize connections
  idle_timeout: 20,
  connect_timeout: 10,
});

export const auth = betterAuth({
  database: queryClient,
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

export type Auth = typeof auth;
