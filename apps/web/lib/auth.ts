/**
 * Auth configuration using Drizzle Adapter.
 *
 * Schema is inlined to avoid cross-package import issues in Cloudflare Workers.
 */

import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { Pool } from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import { pgTable, pgSchema, text, boolean, timestamp, integer } from "drizzle-orm/pg-core";

// Inline auth schema to avoid cross-package import issues in Worker
const authSchema = pgSchema("auth");

export const user = authSchema.table("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified").default(false),
  firstName: text("first_name"),
  lastName: text("last_name"),
  image: text("image"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const session = authSchema.table("session", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().references(() => user.id),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  token: text("token").notNull(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const account = authSchema.table("account", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().references(() => user.id),
  accountId: text("account_id").notNull(),
  providerId: text("provider_id").notNull(),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  idToken: text("id_token"),
  expiresAt: integer("expires_at"),
  scope: text("scope"),
  password: text("password"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const verification = authSchema.table("verification", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Schema object for drizzleAdapter
const schema = { user, session, account, verification };

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
 * Get database connection configuration.
 */
async function getConnectionConfig(): Promise<{ connectionString: string; isHyperdrive: boolean }> {
  // Try Cloudflare Hyperdrive binding first (production)
  try {
    const { getCloudflareContext } = await import("@opennextjs/cloudflare");
    const ctx = getCloudflareContext();
    if (ctx?.env?.DB?.connectionString) {
      return {
        connectionString: ctx.env.DB.connectionString,
        isHyperdrive: true
      };
    }
  } catch {
    // Not in Cloudflare context (local dev)
  }

  // Fall back to environment variable (local dev)
  if (process.env.DATABASE_URL) {
    return {
      connectionString: process.env.DATABASE_URL,
      isHyperdrive: false
    };
  }

  throw new Error("No database connection available");
}

/**
 * Get auth instance - creates lazily per request.
 */
export async function getAuth() {
  const { connectionString, isHyperdrive } = await getConnectionConfig();

  const pool = new Pool({
    connectionString,
    // Only enable SSL for direct connections (Hyperdrive proxies handle SSL)
    ssl: isHyperdrive ? undefined : { rejectUnauthorized: false },
    max: 5, // Cloudflare Workers limit on concurrent connections
    connectionTimeoutMillis: 5000,
  });

  const db = drizzle(pool, { schema });

  return betterAuth({
    database: drizzleAdapter(db, {
      provider: "pg",
      schema,
    }),
    secret: process.env.BETTER_AUTH_SECRET!,
    baseURL: process.env.BETTER_AUTH_URL || process.env.NEXT_PUBLIC_SITE_URL || "https://automatonicai.com",
    basePath: "/api/auth",
    trustedOrigins: (request) => {
      const origins = [
        "https://automatonicai.com",
        "https://project-chronos.pages.dev",
        "http://localhost:3000",
      ];
      // Add preview deployment origins dynamically from the request
      if (request) {
        const origin = request.headers.get("origin");
        if (origin && origin.endsWith(".project-chronos.pages.dev") && origin.startsWith("https://")) {
          origins.push(origin);
        }
      }
      return origins;
    },
    advanced: {
      cookiePrefix: "chronos",
      useSecureCookies: process.env.NODE_ENV === "production",
    },
    emailAndPassword: {
      enabled: true,
      async sendResetPassword({ user, url }: { user: any; url: string }) {
        try {
          console.log("[sendResetPassword] Starting for user:", user.email);

          const { Resend } = await import("resend");
          console.log("[sendResetPassword] Resend imported successfully");

          const { getPasswordResetEmail } = await import("../utils/emails/password-reset-email");
          console.log("[sendResetPassword] Email template imported successfully");

          if (!process.env.RESEND_API_KEY) {
            console.error("[sendResetPassword] RESEND_API_KEY not configured!");
            throw new Error("RESEND_API_KEY not configured");
          }
          console.log("[sendResetPassword] RESEND_API_KEY exists, length:", process.env.RESEND_API_KEY.length);

          const resend = new Resend(process.env.RESEND_API_KEY);
          const emailContent = getPasswordResetEmail({
            userName: user.name || user.email.split('@')[0],
            resetUrl: url,
          });
          console.log("[sendResetPassword] Email content generated, sending to:", user.email);

          const result = await resend.emails.send({
            from: "Chronos <updates@automatonicai.com>",
            to: user.email,
            subject: emailContent.subject,
            html: emailContent.html,
            text: emailContent.text,
          });
          console.log("[sendResetPassword] Email sent successfully:", JSON.stringify(result));
        } catch (error: any) {
          console.error("[sendResetPassword] Error:", error.message, error.stack);
          throw error;
        }
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
  });
}
