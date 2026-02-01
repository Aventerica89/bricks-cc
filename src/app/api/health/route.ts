import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { clients } from "@/db/schema";

/**
 * Health check endpoint for monitoring and uptime checks
 * GET /api/health
 */
export async function GET() {
  const startTime = Date.now();

  try {
    // Check database connectivity
    const dbResult = await checkDatabase();

    // Get application info
    const health = {
      status: dbResult.healthy ? "healthy" : "degraded",
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || "development",
      version: process.env.npm_package_version || "1.0.0",
      uptime: process.uptime(),
      checks: {
        database: {
          status: dbResult.healthy ? "ok" : "error",
          responseTime: Date.now() - startTime,
          error: dbResult.error || undefined,
        },
      },
    };

    // Return 200 if healthy, 503 if degraded
    const status = dbResult.healthy ? 200 : 503;

    return NextResponse.json(health, { status });
  } catch (error) {
    // System error - return 503
    return NextResponse.json(
      {
        status: "unhealthy",
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || "development",
        error: "Health check failed",
      },
      { status: 503 }
    );
  }
}

/**
 * Check database connectivity
 * Returns true if database is reachable
 */
async function checkDatabase(): Promise<{ healthy: boolean; error?: string }> {
  try {
    // Simple query to test database connection
    await db.query.clients.findMany({ limit: 1 });
    return { healthy: true };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("Database health check failed:", error);
    return { healthy: false, error: errorMessage };
  }
}
