import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const ADMIN_PIN = process.env.ADMIN_PIN;

if (!ADMIN_PIN) {
  throw new Error(
    "ADMIN_PIN environment variable is required. Set it in your .env.local file."
  );
}

/**
 * Timing-safe string comparison to prevent timing attacks
 * Constant-time comparison that doesn't leak length information
 */
function timingSafeCompare(a: string, b: string): boolean {
  // Pad shorter string to prevent length leakage
  const maxLen = Math.max(a.length, b.length);
  const aPadded = a.padEnd(maxLen, '\0');
  const bPadded = b.padEnd(maxLen, '\0');

  let result = 0;

  // Always compare full length regardless of actual lengths
  for (let i = 0; i < maxLen; i++) {
    result |= aPadded.charCodeAt(i) ^ bPadded.charCodeAt(i);
  }

  // Also XOR the length difference to ensure constant time
  result |= a.length ^ b.length;

  return result === 0;
}

// Routes that require PIN authentication
const PROTECTED_ROUTES = ["/teaching", "/build", "/agents", "/content"];

/**
 * Proxy middleware to enforce HTTPS in production and PIN authentication
 */
export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. HTTPS enforcement (production only)
  if (process.env.NODE_ENV === "production") {
    const proto = request.headers.get("x-forwarded-proto");
    const isHttps = proto === "https" || request.nextUrl.protocol === "https:";

    if (!isHttps) {
      const httpsUrl = new URL(request.url);
      httpsUrl.protocol = "https:";
      return NextResponse.redirect(httpsUrl, 301);
    }
  }

  // 2. PIN authentication for protected routes
  const isProtectedRoute = PROTECTED_ROUTES.some((route) =>
    pathname.startsWith(route)
  );

  if (isProtectedRoute) {
    const pinCookie = request.cookies.get("admin_pin");
    const pinHeader = request.headers.get("x-admin-pin");
    const providedPin = pinCookie?.value || pinHeader;

    const isValidPin = providedPin ? timingSafeCompare(providedPin, ADMIN_PIN as string) : false;

    if (!isValidPin) {
      // For API routes, return 401
      if (pathname.startsWith("/api/")) {
        return NextResponse.json(
          { error: "Unauthorized: Invalid or missing PIN" },
          { status: 401 }
        );
      }

      // For pages, redirect to PIN entry
      const url = request.nextUrl.clone();
      url.pathname = "/auth/pin";
      url.searchParams.set("redirect", pathname);
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

/**
 * Configure which routes the middleware runs on
 * Run on all routes except static assets
 */
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico (favicon)
     * - public folder files
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
