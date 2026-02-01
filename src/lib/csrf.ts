import crypto from "crypto";

/**
 * Simple CSRF protection for API routes
 * For production, consider using @edge-csrf/nextjs or similar
 */

const TOKEN_LENGTH = 32;
const TOKEN_HEADER = "x-csrf-token";
const COOKIE_NAME = "csrf-token";

/**
 * Generate a random CSRF token
 */
export function generateCsrfToken(): string {
  return crypto.randomBytes(TOKEN_LENGTH).toString("base64url");
}

/**
 * Verify CSRF token from request
 * Checks both header and cookie for double-submit pattern
 */
export function verifyCsrfToken(request: Request): boolean {
  // Get token from header
  const headerToken = request.headers.get(TOKEN_HEADER);
  if (!headerToken) {
    return false;
  }

  // Get token from cookie
  const cookieHeader = request.headers.get("cookie");
  if (!cookieHeader) {
    return false;
  }

  const cookies = parseCookies(cookieHeader);
  const cookieToken = cookies[COOKIE_NAME];
  if (!cookieToken) {
    return false;
  }

  // Double-submit cookie pattern: both must match
  return headerToken === cookieToken;
}

/**
 * Parse cookies from cookie header string
 */
function parseCookies(cookieHeader: string): Record<string, string> {
  const cookies: Record<string, string> = {};

  cookieHeader.split(";").forEach((cookie) => {
    const [name, ...rest] = cookie.split("=");
    const value = rest.join("=").trim();
    if (name && value) {
      cookies[name.trim()] = decodeURIComponent(value);
    }
  });

  return cookies;
}

/**
 * Create Set-Cookie header value for CSRF token
 */
export function createCsrfCookie(token: string, secure = false): string {
  const cookieOptions = [
    `${COOKIE_NAME}=${encodeURIComponent(token)}`,
    "Path=/",
    "SameSite=Strict",
    "HttpOnly", // Prevent JS access
    "Max-Age=3600", // 1 hour
  ];

  if (secure) {
    cookieOptions.push("Secure");
  }

  return cookieOptions.join("; ");
}

/**
 * Apply CSRF protection to a request
 * Returns true if valid, false if token is missing/invalid
 */
export function validateCsrf(request: Request): boolean {
  const method = request.method.toUpperCase();

  // Only check state-changing methods
  if (!["POST", "PUT", "DELETE", "PATCH"].includes(method)) {
    return true; // GET, HEAD, OPTIONS are safe
  }

  return verifyCsrfToken(request);
}

export const CSRF_CONFIG = {
  tokenHeader: TOKEN_HEADER,
  cookieName: COOKIE_NAME,
} as const;
