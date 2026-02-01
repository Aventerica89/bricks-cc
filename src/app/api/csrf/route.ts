import { NextResponse } from "next/server";
import { generateCsrfToken, createCsrfCookie } from "@/lib/csrf";

/**
 * GET /api/csrf - Generate a CSRF token
 * Client should call this before making state-changing requests
 */
export async function GET() {
  const token = generateCsrfToken();
  const isProduction = process.env.NODE_ENV === "production";

  const response = NextResponse.json({
    token,
    header: "x-csrf-token",
  });

  // Set CSRF token cookie (double-submit pattern)
  response.headers.set("Set-Cookie", createCsrfCookie(token, isProduction));

  return response;
}
