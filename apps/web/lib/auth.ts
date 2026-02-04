import { betterAuth } from "better-auth";
import { nextCookies } from "better-auth/next-js";
import { organization } from "better-auth/plugins";

/**
 * Better Auth Server Instance
 *
 * This is the main authentication configuration for the application.
 * It uses PostgreSQL for session storage and Resend for email verification.
 *
 * Features:
 * - Email/Password authentication with magic links
 * - Email verification (required before upload)
 * - Google OAuth
 * - Multi-tenancy via organizations plugin (CHRONOS-517)
 * - Database sessions (allows "logout from all devices")
 *
 * @see ADR 021-v2: docs/10-DEVELOPMENT/01-ARCHITECTURE/adrs/adr_021v2_better_auth_user_authentication.md
 * @see CHRONOS-514: https://automatonicai.atlassian.net/browse/CHRONOS-514
 */
export const auth = betterAuth({
  /**
   * Database configuration
   * Using raw PostgreSQL connection for now
   * TODO: Switch to Prisma adapter once schema is set up
   */
  database: {
    provider: "pg",
    url: process.env.DATABASE_URL!,
  },

  /**
   * Email & Password Authentication
   * Uses Resend for sending verification emails and magic links
   */
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,

    // Send password reset email
    sendResetPassword: async ({ user, url }) => {
      if (!process.env.RESEND_API_KEY) {
        console.warn("RESEND_API_KEY not set - skipping email");
        return;
      }

      const { Resend } = await import("resend");
      const resend = new Resend(process.env.RESEND_API_KEY);

      await resend.emails.send({
        from: process.env.EMAIL_FROM || "auth@automatonicai.com",
        to: user.email,
        subject: "Reset your password - Automatonic AI",
        html: `
          <h1>Reset Your Password</h1>
          <p>Click the link below to reset your password:</p>
          <a href="${url}">Reset Password</a>
          <p>This link will expire in 1 hour.</p>
          <p>If you didn't request this, you can safely ignore this email.</p>
        `,
      });
    },

    // Send email verification
    sendVerificationEmail: async ({ user, url }) => {
      if (!process.env.RESEND_API_KEY) {
        console.warn("RESEND_API_KEY not set - skipping email");
        return;
      }

      const { Resend } = await import("resend");
      const resend = new Resend(process.env.RESEND_API_KEY);

      await resend.emails.send({
        from: process.env.EMAIL_FROM || "auth@automatonicai.com",
        to: user.email,
        subject: "Verify your email - Automatonic AI",
        html: `
          <h1>Welcome to Automatonic AI!</h1>
          <p>Please verify your email address to start using our RAG platform:</p>
          <a href="${url}">Verify Email</a>
          <p>This link will expire in 24 hours.</p>
        `,
      });
    },
  },

  /**
   * Social Providers
   * Google OAuth (optional: add GitHub, Discord, etc.)
   */
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
      enabled: !!(
        process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
      ),
    },
  },

  /**
   * Session Configuration
   * Using database sessions for "logout from all devices" capability
   */
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24, // Update session every 24 hours
  },

  /**
   * Plugins
   */
  plugins: [
    // Next.js cookie handling
    nextCookies(),

    // Multi-tenancy support (CHRONOS-517)
    organization({
      // Allow users to create their own organizations
      allowUserToCreateOrganization: true,

      // Free tier: max 5 organizations per user
      // TODO: Make this configurable based on user tier
      organizationLimit: 5,

      // Organization roles
      // Default roles: "owner", "admin", "member"
    }),
  ],

  /**
   * Base URL
   * Used for generating callback URLs
   */
  baseURL: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
});

/**
 * Type inference for session data
 * Use this to get full TypeScript autocomplete for session
 */
export type Session = typeof auth.$Infer.Session;
