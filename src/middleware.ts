import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Middleware to enforce HTTPS in production
 * Redirects HTTP requests to HTTPS
 */
export function middleware(request: NextRequest) {
  // Only enforce HTTPS in production
  if (process.env.NODE_ENV !== "production") {
    return NextResponse.next();
  }

  // Check if request is already HTTPS
  const proto = request.headers.get("x-forwarded-proto");
  const isHttps = proto === "https" || request.nextUrl.protocol === "https:";

  if (!isHttps) {
    // Redirect to HTTPS
    const httpsUrl = new URL(request.url);
    httpsUrl.protocol = "https:";

    return NextResponse.redirect(httpsUrl, 301); // Permanent redirect
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
