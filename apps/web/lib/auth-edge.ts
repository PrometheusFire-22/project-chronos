/**
 * Edge-compatible auth utilities
 *
 * This file provides auth functions that work in Edge runtime.
 * It does NOT import the main auth instance (which uses pg Pool).
 */

import { betterAuth } from "better-auth";

/**
 * Get session in Edge runtime
 *
 * This creates a minimal auth client just for session verification.
 * It doesn't need database access for session checks (uses JWT).
 */
export async function getEdgeSession(headers: Headers) {
  // Create a minimal auth instance for session verification only
  const authClient = betterAuth({
    secret: process.env.BETTER_AUTH_SECRET!,
    baseURL: process.env.BETTER_AUTH_URL || "http://localhost:3000",
    basePath: "/api/auth",
  });

  return authClient.api.getSession({ headers });
}
