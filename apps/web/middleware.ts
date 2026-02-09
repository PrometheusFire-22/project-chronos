import { NextRequest, NextResponse } from "next/server";

const protectedPaths = ["/settings"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isProtected = protectedPaths.some((p) => pathname.startsWith(p));
  if (!isProtected) return NextResponse.next();

  // Cookie name uses the prefix from Better Auth config: "chronos"
  // In production, Better Auth adds "__Secure-" prefix when useSecureCookies is true
  const sessionToken = request.cookies.get("__Secure-chronos.session_token")
    || request.cookies.get("chronos.session_token"); // Fallback for local dev
  if (sessionToken) return NextResponse.next();

  const signInUrl = new URL("/sign-in", request.url);
  signInUrl.searchParams.set("callbackUrl", pathname);
  return NextResponse.redirect(signInUrl);
}

export const config = {
  matcher: ["/settings/:path*"],
};
