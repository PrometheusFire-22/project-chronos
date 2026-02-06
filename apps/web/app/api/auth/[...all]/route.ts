import { auth, createAuth } from "../../../../lib/auth";
import type { NextRequest } from "next/server";

/**
 * Better Auth API Route Handler
 *
 * Supports both local development and Cloudflare Workers:
 * - Local: Uses DATABASE_URL from .env.local
 * - Cloudflare: Uses Hyperdrive binding for connection pooling
 */

// Type for Cloudflare environment bindings
type CloudflareEnv = {
  DB?: {
    connectionString: string;
  };
};

// Helper to get auth instance based on environment
function getAuthInstance(request?: NextRequest) {
  // Check if we're in Cloudflare Workers runtime with Hyperdrive
  if (request && 'env' in request) {
    const env = (request as any).env as CloudflareEnv;

    if (env?.DB?.connectionString) {
      console.log('Using Hyperdrive connection');
      return createAuth(env.DB.connectionString);
    }
  }

  // Fall back to default auth (uses DATABASE_URL)
  console.log('Using DATABASE_URL connection');
  return auth;
}

export async function GET(request: NextRequest) {
  const authInstance = getAuthInstance(request);
  return authInstance.handler(request);
}

export async function POST(request: NextRequest) {
  const authInstance = getAuthInstance(request);
  return authInstance.handler(request);
}
