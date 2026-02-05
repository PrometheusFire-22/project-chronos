import { betterAuth } from "better-auth";
import { Pool } from "pg";

/**
 * Better Auth configuration using PostgreSQL Pool for Node.js runtime.
 *
 * The auth route uses Node.js runtime (not Edge) due to OpenNext limitations
 * with catch-all routes. Other API routes can use Edge runtime with Hyperdrive.
 */
const pool = new Pool({
  connectionString: process.env.DATABASE_URL?.split("?")[0],
  options: "-c search_path=auth",
});

export const auth = betterAuth({
  database: pool,
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
        const { Resend } = await import("resend");
        const resend = new Resend(process.env.RESEND_API_KEY);
        await resend.emails.send({
            from: "Chronos <updates@automatonicai.com>",
            to: user.email,
            subject: "Reset your password",
            html: `<a href="${url}">Reset your password</a>`,
        });
    },
    async sendVerificationEmail({ user, url }: { user: any; url: string }) {
        const { Resend } = await import("resend");
        const resend = new Resend(process.env.RESEND_API_KEY);
        await resend.emails.send({
            from: "Chronos <updates@automatonicai.com>",
            to: user.email,
            subject: "Verify your email",
            html: `<a href="${url}">Verify your email</a>`,
        });
    },
  },
  user: {
    modelName: "user",
    fields: {
      emailVerified: "email_verified",
      createdAt: "created_at",
      updatedAt: "updated_at"
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
