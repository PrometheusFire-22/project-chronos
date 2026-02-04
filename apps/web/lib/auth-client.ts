"use client";

import { createAuthClient } from "better-auth/react";

/**
 * Better Auth Client
 *
 * Client-side authentication hooks and utilities.
 * Provides fully-typed React hooks for authentication.
 *
 * Usage:
 * ```tsx
 * import { useSession, signIn, signOut } from "@/lib/auth-client";
 *
 * function MyComponent() {
 *   const { data: session, isPending } = useSession();
 *
 *   if (isPending) return <div>Loading...</div>;
 *
 *   if (!session) {
 *     return <button onClick={() => signIn.email({ email: "user@example.com" })}>
 *       Sign In
 *     </button>;
 *   }
 *
 *   return (
 *     <div>
 *       <p>Welcome, {session.user.email}!</p>
 *       <button onClick={() => signOut()}>Sign Out</button>
 *     </div>
 *   );
 * }
 * ```
 *
 * @see https://www.better-auth.com/docs/client
 */
export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
});

/**
 * Exported hooks and methods
 * All fully typed with TypeScript autocomplete
 */
export const {
  // Session management
  useSession,

  // Sign in methods
  signIn,

  // Sign out
  signOut,

  // Sign up
  signUp,

  // Organization management (multi-tenancy)
  useActiveOrganization,
  organization,
} = authClient;

/**
 * Helper to check if user's email is verified
 */
export function useEmailVerified() {
  const { data: session } = useSession();
  return session?.user?.emailVerified ?? false;
}

/**
 * Helper to check if user is in a specific organization
 */
export function useIsInOrganization(organizationId: string) {
  const { data: activeOrg } = useActiveOrganization();
  return activeOrg?.id === organizationId;
}
