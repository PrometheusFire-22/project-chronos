import { auth } from "@/lib/auth";

/**
 * Better Auth API Route Handler
 *
 * This catch-all route handles all Better Auth API requests:
 * - POST /api/auth/sign-up
 * - POST /api/auth/sign-in
 * - POST /api/auth/sign-out
 * - GET  /api/auth/session
 * - POST /api/auth/verify-email
 * - POST /api/auth/reset-password
 * - POST /api/auth/organization/create
 * - etc.
 *
 * The `auth.handler` automatically generates all necessary endpoints.
 *
 * @see https://www.better-auth.com/docs/concepts/handler
 */
export const { GET, POST } = auth.handler;
