import { NextResponse } from "next/server";

/**
 * Debug endpoint to check which environment variables are set
 * DO NOT USE IN PRODUCTION - Remove after debugging
 */
export async function GET() {
  const envVars = {
    TURSO_DATABASE_URL: process.env.TURSO_DATABASE_URL ? "SET" : "NOT SET",
    TURSO_AUTH_TOKEN: process.env.TURSO_AUTH_TOKEN ? "SET" : "NOT SET",
    ENCRYPTION_KEY: process.env.ENCRYPTION_KEY ? "SET" : "NOT SET",
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL || "NOT SET",
    INTERNAL_API_URL: process.env.INTERNAL_API_URL || "NOT SET",
    NODE_ENV: process.env.NODE_ENV,
  };

  return NextResponse.json(envVars);
}
