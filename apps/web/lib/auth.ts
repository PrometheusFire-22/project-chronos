import { betterAuth } from "better-auth";
import { Pool } from "@neondatabase/serverless";

/**
 * Better Auth configuration using Neon Serverless Pool.
 *
 * Standard 'pg' Pool fails on Cloudflare because it uses native 'net' modules.
 * This Neon driver uses WebSockets and is fully compatible with Cloudflare.
 */
const pool = new Pool({
  connectionString: process.env.DATABASE_URL?.split("?")[0],
});

export const auth = betterAuth({
  database: pool,
  databaseType: "pg",
  schema: "auth",
  secret: process.env.BETTER_AUTH_SECRET!,
  baseURL: process.env.BETTER_AUTH_URL || "http://localhost:3000",
  basePath: "/api/auth",
  logger: {
      level: "debug",
  },
  trustedOrigins: ["https://automatonicai.com", "http://localhost:3000"],
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
console.log("Auth initialized with baseURL:", process.env.BETTER_AUTH_URL || "http://localhost:3000");
